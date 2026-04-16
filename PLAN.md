# FENZ Overtime Rostering — Development Plan

> **For AI agents:** This file is the single source of truth for project context.
> Read this first before making any changes. The codebase is a working Next.js prototype
> with known bugs documented below.

---

## 1. Project Overview

Multi-district overtime allocation system for **Fire and Emergency New Zealand (FENZ)**.
When a firefighter calls in sick or a station needs extra cover, the system automatically
finds the best available replacement using a cascading priority system.

**Tech Stack:**
- **Frontend/API:** Next.js 16.2.2 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database:** PostgreSQL 14 (port 5433, raw `pg` driver — no ORM)
- **Runtime:** Node.js, PM2 process manager
- **UI Components:** Radix UI + shadcn/ui pattern

**Database Connection:**
```
DATABASE_URL=postgresql://postgres:fenz_dev_pass@localhost:5433/fenz_ot
```

---

## 2. Terminology

| Term | Meaning |
|------|---------|
| **District/Area** | Waitemata, Auckland, Counties Manukau (3 districts) |
| **Watch** | Green, Red, Brown, Blue (4 rotating shift groups, 8-day cycle) |
| **Callback** | When an off-duty watch has a callback obligation |
| **OOD** | Out-of-District — firefighters pulled from another district |
| **SO** | Station Officer |
| **SSO** | Senior Station Officer |
| **Ride up** | FF temporarily promoted to fill an officer vacancy |
| **Ride down** | Officer temporarily filling a firefighter role |
| **Must/Might/Won't** | OT threshold — must (lowest OT count), might (mid), won't (highest) |

---

## 3. Database Schema (14 tables)

| Table | Purpose |
|-------|---------|
| `areas` | 3 districts (Waitemata=119, Auckland=120, Counties Manukau=121) |
| `stations` | 40 stations, linked to areas via `area_id`. Has `district` column AND `area_id` FK |
| `firefighters` | 20 active FFs. Linked to stations. Has `watch`, `rank`, OT counters, `qualifications` (JSONB) |
| `station_distances` | 241 rows of pre-computed inter-station distances (km) |
| `watch_anchors` | Anchor dates for shift cycle calculation |
| `ot_requests` | OT slots needed per station/date/shift |
| `ot_assignments` | Final FF → OT request assignments |
| `ot_count_log` | Audit trail of OT counter changes |
| `ot_offers` | (unused) Future: offer/accept workflow |
| `allocation_runs` | (unused) Future: batch run tracking |
| `audit_logs` | General audit trail |
| `availability` | FF availability overrides |
| `district_relievers` | Cross-district reliever tracking |
| `system_settings` | Config key-value store |

### Important Data Notes
- **District field:** The `firefighters` table does NOT have a `district` column. District is resolved via `firefighters.station_id → stations.area_id → areas.name`. The `loadAllFirefighters()` query in `allocation-engine.ts` does this join and aliases `areas.name` as `district`.
- **Specialist stations:** Some stations require specific qualifications (e.g., Silverdale needs `prt`, Te Atatu needs `type4`). Stored in `stations.specialist_type`.
- **Qualifications:** Stored as JSONB on firefighters: `{"prt": true, "driver": true, "not_rookie": true}`.
- **OT counters:** Tracked separately: `ot_count_days`, `ot_count_nights`, `ot_count_callback_days`, `ot_count_callback_nights`, `ot_count_noncallback_days`, `ot_count_noncallback_nights`.

---

## 4. Watch Cycle Mathematics (`src/engine/watch-math.ts`)

Each watch follows an **8-day repeating cycle**: `[Day, Day, Night, Night, Off, Off, Off, Off]`

Anchors (cycle day 0 = first Day):
- Green: 2026-01-31
- Red: 2026-02-02
- Brown: 2026-02-04
- Blue: 2026-02-06

**Callback rules** (relative to cycle position):
| Cycle Index | Shift | Callback |
|-------------|-------|----------|
| 0 | Day 1 | — |
| 1 | Day 2 | #2a-EveningDay2 (evening extension) |
| 2 | Night 1 | #2b-DayOfNight1 (daytime before night) |
| 3 | Night 2 | #3-AfterLastNight (after last night shift) |
| 4-6 | Off 1-3 | — (no callback) |
| 7 | Off 4 | #1-BeforeDay1 (day before next Day 1) |

**Leave:** 160-day super-cycle. First 16 days = on leave.

**Callback eligibility for Day OT requests:**
- #1-BeforeDay1: ✅ Eligible (primary callback pool)
- #2a-EveningDay2: ❌ Excluded (evening only, can't do day OT)
- #2b-DayOfNight1: ❌ Excluded (night-only callback)
- #3-AfterLastNight: ❌ Excluded (night-only callback)

---

## 5. Current Allocation Engine (`src/engine/allocation-engine.ts`)

### 5-Phase Cascade (Current Implementation)
Stations are processed **sequentially** (one at a time). For each station:

1. **Phase 1 — Callback Pool (SAME DISTRICT):** FF with active callback FROM THE SAME DISTRICT as the requesting station, sorted by must/might threshold → lowest OT → closest distance
2. **Phase 2 — Non-Callback (SAME DISTRICT):** Off-duty FF from same district, no callback. Must want to work (`want_to_work_day/night`)
3. **Phase 3 — Out-of-District:** FF from other districts. Max 1 per district per watch.
4. **Phase 4 — SO Fallback:** Station Officers from any district
5. **Phase 5 — SSO Fallback:** Senior Station Officers from other districts

After all stations are processed, a **specialist steal pass** runs: if specialist stations (prt, type4, etc.) are still short, steal the closest qualified FF from a non-specialist station that has >1 assigned.

### Key Functions
- `loadAllFirefighters()` — SQL query joining firefighters → stations → areas
- `loadDistanceMatrix()` — Loads station_distances into `{[stationA]: {[stationB]: km}}` map
- `passesCallbackFilter()` — Phase 1 eligibility check
- `passesNonCallbackFilter()` — Phase 2 eligibility check
- `buildCascadePool()` — Builds candidate list for each phase
- `assignFromPool()` — Sorts candidates by threshold/OT/distance, assigns to DB
- `allocateForOTRequest()` — Orchestrates all 5 phases for one OT request

---

## 6. Test Scenario (`src/app/api/test/route.ts`)

**Seed Data:** 48 firefighters (12 per watch), 35 stations, 3 districts (Waitemata, Auckland, Counties Manukau).

### Default Scenario: "Waitemata Day — 5 Stations"
- Date: 2026-04-10 (Blue=#1 callback, Green=Off non-callback)
- Stations: Albany (3 slots), Devonport (2), Silverdale (2), Takapuna (2), East Coast Bays (2)
- Total: 11 slots across 5 Waitemata stations, no specialist requirements
- **Result:** 11/11 filled — Blue=4 (callback), Green=7 (5 non-callback + 2 out-of-district)

### Known-Result Simple: "Albany 2-slot"
- `POST /api/test` with body `{"scenario": "known-result-simple"}`
- 1 station, 2 slots, no specialist
- **Expected:** Zoe Fletcher (0km) + Kate Sullivan (4km) — both Blue callback, sorted by distance
- ✅ PASSING

### Known-Result Complex: "3 Stations + Specialist"
- `POST /api/test` with body `{"scenario": "known-result-complex"}`
- 3 stations: Albany(2), Silverdale(1,prt), Takapuna(1)
- Tests: district restriction, specialist filtering, cross-station tracking, phase fallback
- **Expected:** Zoe+Kate→Albany(CB), Emma→Silverdale(NC,prt), Rongo→Takapuna(CB)
- ✅ PASSING

**API:** `POST /api/test` — runs the full allocation and returns JSON with:
- `watchMatrix` — which watches are eligible
- `stationResults` — per-station assignments + trace logs
- `allFirefightersDetail` — all 48 FFs with assignment status
- `availableOvertimes` — expanded slot list
- `knownResultCheck` — expected vs actual comparison (for known-result scenarios)

**Reset:** `POST /api/test` with body `{"action":"reset_ot_counts"}` — zeroes all OT counters

---

## 7. File Structure

```
src/
├── engine/
│   ├── allocation-engine.ts    # Core cascade allocation (629 lines)
│   ├── allocation-debug.ts     # Standalone debug runner
│   └── watch-math.ts           # Shift cycle calculator (172 lines)
├── app/
│   ├── api/
│   │   ├── test/route.ts       # Test scenario API (371 lines)
│   │   ├── allocate/route.ts   # Production allocation endpoint
│   │   ├── seed/route.ts       # DB seeding endpoint
│   │   └── chat-test/route.ts  # AI chat test
│   ├── test/page.tsx           # Test dashboard UI
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── firefighter/page.tsx    # FF management
│   ├── officer/page.tsx        # Officer management
│   ├── audit/page.tsx          # Audit trail viewer
│   ├── generate/page.tsx       # FF generator (stress testing)
│   ├── threejs/page.tsx        # 3D visualization
│   └── chat/page.tsx           # AI chat interface
├── lib/
│   ├── db.ts                   # Database connection pool
│   ├── seed.ts                 # Seed data generator
│   └── utils.ts                # Tailwind cn() helper
└── components/ui/              # shadcn/ui components
```

---

## 8. Known Bugs (ACTIVE)

### Bug 1: Trace Log Mismatch (FIXED — 2026-04-16)
**Was:** Trace logs showed pre-steal assignments. `stealForSpecialists()` mutated arrays without updating traces.
**Fix:** Specialist steal now records STOLEN/LOST trace entries in both donor and recipient station traces.

### Bug 2: Unfilled Specialist Slots (RESOLVED — Data Expansion)
**Was:** Only 20 FF for 13 slots. Now 48 FF (12 per watch) across all 3 districts.
**Fix:** Expanded seed data + removed non-Waitemata stations from test scenario. All 11 slots fill.

### Bug 3: PG NULL Parameter Type (FIXED)
Previously: `INSERT INTO ot_assignments` failed with "inconsistent types deduced for parameter" when callback was null.
**Fix applied:** Uses `CAST($4 AS varchar)` and `callback || 'none'` string default.

### Bug 4: Callback Monopolizing All Slots (FIXED — 2026-04-16)
**Was:** Callback phase pulled FF from ALL districts, filling all slots before local non-callback FFs got a chance.
**Fix:** Callback phase now restricted to same district as requesting station. Cascade: same-district callback → same-district non-callback → out-of-district → SO → SSO.

### Bug 5: Distance=0 Treated as 999km (FIXED — 2026-04-16)
**Was:** `pool.distances[id] || 999` treated 0km (same station) as 999km due to JS falsy `0`.
**Fix:** Changed to `pool.distances[id] ?? 999` throughout. Also added `getDistance()` self-station shortcut.

### Bug 6: Threshold Tiebreaker Ignored Distance (FIXED — 2026-04-16)
**Was:** `computeMustMightWonThreshold()` didn't sort within tied OT groups by distance.
**Fix:** Now accepts optional `distances` param and sorts tied groups by distance before assigning thresholds.

---

## 9. Target Architecture (NOT YET IMPLEMENTED)

### Wave-Based Multi-District Allocation
The current engine processes stations sequentially within one district. The target architecture processes ALL districts in parallel waves:

#### Wave 1: District Internal (Parallel)
All 3 districts run simultaneously:
1. Callback pool
2. Non-callback pool
*(Officers NOT included — see Wave 3)*

#### Wave 2: Out-of-District (OOD)
After ALL districts complete Wave 1:
- Collect unfilled slots across all districts
- Pull lowest-OT FF from other districts
- Max 1 per district per watch

#### Wave 3: Officer Coverage + Riding
After Wave 2:
1. **Officer Pool** (SO/SSO) — closest available from ANY district, but don't steal if they have their own OT
2. **Ride-Up** (FF → SO/SSO role) — qualified FF promoted temporarily
3. **Ride-Down** (SO/SSO → FF role) — officers filling FF gaps

#### Specialist Enforcement
After all waves: steal closest qualified FF from any station for specialist stations. Re-run Wave 1 for donor station after steal.

---

## 10. Development Commands

```bash
# Start dev server
cd /home/ubuntu/fenz-ot-prototype
npm run dev        # Dev mode (hot reload, but WS issues on mobile)
npm run build      # Production build
npm start          # Production server (port 3005)

# PM2 management
pm2 restart fenz-ot-web   # Restart after build
pm2 logs fenz-ot-web      # View logs

# Database
PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot

# Seed database
curl -X POST http://localhost:3005/api/seed

# Run test scenario
curl -X POST http://localhost:3005/api/test

# Reset OT counts
curl -X POST -H "Content-Type: application/json" -d '{"action":"reset_ot_counts"}' http://localhost:3005/api/test
```

---

## 11. Priority Task List

### Immediate (Bug Fixes)
1. [ ] Fix trace log mismatch (Bug #1) — traces should reflect final state after specialist steals
2. [ ] Add more seed firefighters (40-50 total) for realistic multi-station testing
3. [ ] Verify all 13 slots can be filled with enough FF in pool

### Short Term (Engine Improvements)
4. [ ] Implement Wave-based multi-district architecture (see Section 9)
5. [ ] Add officer ride-up/ride-down logic
6. [ ] Add `want_to_work_day/night` preference filtering in non-callback phase
7. [ ] Track callback vs non-callback OT separately in threshold calculations

### Medium Term (UI/UX)
8. [ ] Dashboard showing real-time allocation results
9. [ ] Officer management page
10. [ ] Firefighter availability calendar
11. [ ] Audit trail improvements

### Long Term
12. [ ] Authentication (Supabase Auth with domain restriction)
13. [ ] Real production deployment
14. [ ] Historical analytics and reporting
15. [ ] Mobile-responsive design

---

## 12. Lessons Learned

- **Next.js `npx next start` needs a build:** Always run `npm run build` after code changes, then `pm2 restart fenz-ot-web`
- **`export const dynamic = 'force-dynamic'`** must be at module level (top of file) for dynamic pages
- **PG NULL parameter type inference:** Raw `pg` can't infer types for null params. Use `CAST($4 AS varchar)` or string defaults
- **Server Actions don't work in standalone:** Use direct DB queries + `revalidatePath` instead of `fetch('localhost:...')`
- **Seed before build:** If pages are statically prerendered, seed DB first OR use `force-dynamic`
- **20 FF is too few:** For 13 slots across 6 stations, need at least 40-50 FF for realistic coverage
