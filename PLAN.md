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

1. **Phase 1 — Callback Pool:** FF with active callback, sorted by must/might threshold → lowest OT → closest distance
2. **Phase 2 — Non-Callback (Waitemata only):** Off-duty FF from same district, no callback. Must want to work (`want_to_work_day/night`)
3. **Phase 3 — Out-of-District:** FF from other districts. Max 1 per district per watch.
4. **Phase 4 — SO Fallback:** Station Officers from other districts
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

Single hardcoded scenario: **"Waitemata Day — 6 Stations"**
- Date: 2026-04-10
- Shift: Day
- Stations: Albany (3 slots), Devonport (2), Silverdale (2, prt), Takapuna (2), Henderson (2, prt), Te Atatu (2, type4)
- Total: 13 slots across 6 stations

**API:** `POST /api/test` — runs the full allocation and returns JSON with:
- `watchMatrix` — which watches are eligible
- `stationResults` — per-station assignments + trace logs
- `allFirefightersDetail` — all 20 FFs with assignment status
- `availableOvertimes` — expanded slot list

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

### Bug 1: Trace Log Mismatch (Medium Priority)
**Symptom:** The trace logs in the API response show different firefighters being "ASSIGNED" than what actually appears in the `assignedFirefighters` array.
**Example:** Trace shows "ASSIGNED: Wiremu Hemara" and "ASSIGNED: Tane Rawiri" for Takapuna, but actual result shows Sarah Mitchell and Jordan Park.
**Cause:** Likely related to the specialist steal pass running AFTER trace logs are captured. The trace logs record initial assignments, but `stealForSpecialists()` mutates the `assignedFirefighters` arrays in-place without updating traces.
**Fix needed:** Either update trace logs after specialist steal, or capture trace in a way that reflects final state.

### Bug 2: Unfilled Specialist Slots (By Design, But Needs More FF)
**Symptom:** Henderson (2 prt slots) and Te Atatu (2 type4 slots) get 0 direct assignments because by the time they're processed, all eligible FF are already assigned to earlier stations.
**Root cause:** Only 20 FF in pool, 13 slots needed. With only 5 Blue (callback) + 5 Green (non-callback) eligible = 10 candidates for 13 slots. Need 40-50 FF for realistic testing.
**Fix:** Run `POST /api/seed` or add more firefighters via `/generate` page.

### Bug 3: PG NULL Parameter Type (FIXED)
Previously: `INSERT INTO ot_assignments` failed with "inconsistent types deduced for parameter" when callback was null.
**Fix applied:** Uses `CAST($4 AS varchar)` and `callback || 'none'` string default.

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
