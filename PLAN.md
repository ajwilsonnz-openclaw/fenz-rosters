# FENZ Overtime Rostering — Development Plan

> **For AI agents:** Read [SPEC.md](./SPEC.md) for the authoritative allocation engine design.
> This file covers project context, schema, watch math, API, and development commands.

---

## 1. Project Overview

Multi-district overtime allocation system for **Fire and Emergency New Zealand (FENZ)**. When a firefighter calls in sick or a station needs extra cover, the system automatically finds the best available replacement.

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
| **District/Area** | Waitemata, Auckland, Counties Manukau (3 districts, configurable) |
| **Watch** | Green, Red, Brown, Blue (4 rotating shift groups, 8-day cycle) |
| **Callback** | When an off-duty watch has a callback obligation |
| **OOD** | Out-of-District — firefighters pulled from another district |
| **SO** | Station Officer |
| **SSO** | Senior Station Officer |
| **Ride up** | FF temporarily promoted to fill an officer vacancy |
| **Ride down** | Officer temporarily filling a firefighter role |
| **Block** | Eligibility tier (1–8, see SPEC.md Section 1.3) |
| **Distance phase** | km distance between home station and OT station (0km, 1km, etc.) |
| **Must / Might / Won't** | OT threshold — must (lowest OT count), might (mid), won't (highest) |
| **Preferences** | Dynamic per-shift district/station availability (not a qualification) |

---

## 3. Database Schema (14 tables)

| Table | Purpose |
|-------|---------|
| `areas` | Districts (loaded from DB at runtime — no hardcoded names) |
| `stations` | Stations linked to areas via `area_id`. Has `district` + `area_id` FK. Has `specialist_type` (nullable) |
| `firefighters` | Active FFs. Fields: `watch`, `rank`, `qualifications` (JSONB), `preferences` (JSONB), `want_to_work_day/night`, OT counters (see below) |
| `station_distances` | Pre-computed distances: `{station_id, distances JSONB: {stationB_id: km}}` |
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

### Firefighter OT Counter Columns

| Column | When Incremented |
|--------|-----------------|
| `ot_count_days` / `ot_count_nights` | Legacy total counters |
| `ot_count_callback_days` / `ot_count_callback_nights` | Blocks 1, 3, 5, 6 |
| `ot_count_noncallback_days` / `ot_count_noncallback_nights` | Blocks 2, 4, 7, 8 |

### Preferences JSONB Format

```json
{
  "districts": ["Waitemata"],
  "stations": ["Albany"]
}
```
- Empty arrays = all
- Non-empty = only these districts/stations
- Evaluated at allocation time (dynamic, not permanent)

### Important Data Notes

- **District resolution:** `firefighters.station_id → stations.area_id → areas.name`. The `loadAllFirefighters()` query does this join and aliases `areas.name` as `district`.
- **Specialist stations:** Stored in `stations.specialist_type`. Only firefighters with the matching qualification can fill those slots.
- **Qualifications:** JSONB on firefighters: `{"prt": true, "driver": true, ...}`

---

## 4. Watch Cycle Mathematics (`src/engine/watch-math.ts`)

Each watch follows an **8-day repeating cycle**:
`[Day, Day, Night, Night, Off, Off, Off, Off]`

Anchors (cycle day 0 = first Day):
- Green: 2026-01-31
- Red: 2026-02-02
- Brown: 2026-02-04
- Blue: 2026-02-06

**Callback rules** (relative to cycle position):

| Cycle Index | Shift | Callback Type |
|-------------|-------|---------------|
| 0 | Day 1 | — |
| 1 | Day 2 | #2a-EveningDay2 (evening extension) |
| 2 | Night 1 | #2b-DayOfNight1 (daytime before night) |
| 3 | Night 2 | #3-AfterLastNight (after last night shift) |
| 4-6 | Off 1-3 | — (no callback) |
| 7 | Off 4 | #1-BeforeDay1 (day before next Day 1) |

**Leave:** 160-day super-cycle. First 16 days = on leave.

**Callback eligibility for Day OT requests:**
- #1-BeforeDay1: ✅ Eligible (primary callback pool)
- #2a-EveningDay2: ❌ Excluded (evening only)
- #2b-DayOfNight1: ❌ Excluded (night-only)
- #3-AfterLastNight: ❌ Excluded (night-only)

---

## 5. Allocation Engine

> **Full specification:** See [SPEC.md](./SPEC.md) Section 2.

**Key points:**
- 8 Blocks: in-district callback → in-district non-callback → OOD callback → OOD non-callback → SO callback → SSO callback → SO non-callback → SSO non-callback
- Within each Block: sweep distance phases **globally** (0km → max). All stations move together — no station skips ahead.
- Within each distance phase: candidates sorted must/might → OT count → distance, assigned one-by-one
- Preferences filter candidates (district + station lists)
- Specialist fill after Block 2 (last in-district FF block), before Block 3
- `assignedThisRun` set prevents double-booking; specialist steals are the only reassignment exception

---

## 6. Test Scenario (`src/app/api/test/route.ts`)

**Seed Data:** 48 firefighters (12 per watch), 35 stations, 3 districts.

### Available Scenarios (POST `/api/test` with `{"scenario": "..."}`):

| Scenario ID | Description |
|-------------|-------------|
| `default` | Waitemata Day — 5 Stations, 11 slots |
| `known-result-simple` | Albany 2-slot single station |
| `known-result-complex` | Albany 2 + Silverdale(prt) + Takapuna |
| `3rs` | Albany(3) + Devonport(2) + Silverdale(2) = 7 slots |

**API response includes:** `watchMatrix`, `stationResults` (per-station assignments + trace logs), `allFirefightersDetail`, `availableOvertimes`, `knownResultCheck` (for known-result scenarios).

**Reset OT counts:** `POST /api/test` with `{"action": "reset_ot_counts"}`

---

## 7. File Structure

```
src/
├── engine/
│   ├── allocation-engine.ts    # Core cascade allocation
│   ├── allocation-debug.ts     # Standalone debug runner
│   └── watch-math.ts           # Shift cycle calculator
├── app/
│   ├── api/
│   │   ├── test/route.ts       # Test scenario API
│   │   ├── allocate/route.ts   # Production allocation endpoint
│   │   ├── seed/route.ts       # DB seeding endpoint
│   │   └── chat-test/route.ts  # AI chat test
│   ├── test/page.tsx           # Test dashboard UI
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── firefighter/page.tsx    # FF management
│   ├── officer/page.tsx        # Officer management
│   ├── audit/page.tsx          # Audit trail viewer
│   ├── generate/page.tsx       # FF generator (stress testing)
│   └── chat/page.tsx           # AI chat interface
└── lib/
    ├── db.ts                   # Database connection pool
    ├── seed.ts                 # Seed data generator
    └── utils.ts                # Tailwind cn() helper
```

---

## 8. Development Commands

```bash
cd /home/ubuntu/fenz-ot-prototype
npm run build          # Production build
npm start              # Production server (port 3005)

# PM2
pm2 restart fenz-ot-web
pm2 logs fenz-ot-web

# Database
PGPASSWORD=fenz_dev_pass psql -h localhost -p 5433 -U postgres -d fenz_ot

# Seed
curl -X POST http://localhost:3005/api/seed

# Run test
curl -X POST http://localhost:3005/api/test

# Reset OT counts
curl -X POST -H "Content-Type: application/json" \
  -d '{"action":"reset_ot_counts"}' \
  http://localhost:3005/api/test
```

---

## 9. Known Bugs

### Fixed

- **Threshold tiebreaker ignored distance** — fixed with optional `distances` param to `computeMustMightWonThreshold()`
- **Distance=0 treated as 999km** — fixed with `?? 999` nullish coalescing throughout
- **Callback monopolizing all slots** — fixed by restricting Block 1 to in-district only
- **OT counters not separated** — fixed with dedicated callback/non-callback counters
- **OOD/SO/SSO ignoring watch eligibility** — fixed with universal `canDoOT()` guard in all phases
- **Duplicate seedDatabase() calls** — removed dead code duplicates in test route

### Open

- Test endpoint FK constraint on DELETE order — fixed by reordering: `ot_assignments` before `ot_requests` before `firefighters`
- Test not running due to the FK error — fixed once endpoint is rebuilt

---

## 10. Priority Task List

### Immediate
- [ ] Rebuild `src/engine/allocation-engine.ts` to match SPEC.md (new Block→Distance architecture)
- [ ] Verify test endpoint works (`POST /api/test` with known-result scenarios)
- [ ] Add `preferences` column to `firefighters` table and schema

### Short Term
- [ ] Update seed script to include `preferences` data
- [ ] Run the 3rs test and compare engine output against expected allocations
- [ ] Verify specialist fill works for officers (not just FFs)
- [ ] Implement SO/SSO preference filtering in allocation engine

### Medium Term
- [ ] Production allocation API (`/api/allocate`)
- [ ] Officer management page with preference setting UI
- [ ] Firefighter roster with qualification badges + preferences display
- [ ] Audit trail improvements

### Long Term
- [ ] Authentication (Supabase Auth with domain restriction)
- [ ] Real production deployment
- [ ] Historical analytics and reporting