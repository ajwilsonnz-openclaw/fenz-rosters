# FENZ OT — Implementation Notes

> **Refer to [SPEC.md](./SPEC.md) for the authoritative design.**
> This file tracks implementation-level decisions and patterns.

---

## Allocation Engine Architecture

The engine processes all stations simultaneously within each distance phase. Key design patterns:

### 1. Cascade Pool Building

For each (Block, distance phase) combination, `buildCascadePool()` collects candidates with:
- Watch eligibility check (`canDoOT()`)
- Block-specific filter (callback or non-callback)
- Qualification + preference checks
- Excludes already-assigned firefighters

### 2. Must/Might Threshold

`computeMustMightWonThreshold()` runs after pool building. It sorts candidates by OT count, groups by count, then assigns thresholds:
- Groups where `cumulative + group_size <= slots` → all "must"
- Groups where `slots - cumulative < group_size` → partial "must" / "might" split
- Remaining groups → "won't"

Within tied groups, candidates are sorted by distance before threshold assignment.

### 3. OT Counter Selection

Passed through the cascade phase name:
- `ff-callback`, `ood-ff-callback`, `so-callback`, `sso-callback` → `ot_count_callback_[day/night]`
- `ff-noncallback`, `ood-ff-noncallback`, `so-noncallback`, `sso-noncallback` → `ot_count_noncallback_[day/night]`

### 4. Specialist Steal

Runs after Block 2. `stealForSpecialists()` iterates specialist stations, finds nearest qualified donor from non-specialist stations with ≥1 spare, and reassigns. Records STOLEN/LOST in both station trace logs.

---

## Database Patterns

### JSONB Usage

- `qualifications`: `{"prt": true, "driver": true, "not_rookie": true}`
- `preferences`: `{"districts": ["Waitemata"], "stations": ["Albany"]}`
- `distances`: `{"stationB_id": km, ...}`

Parse with:
```typescript
typeof r.qualifications === 'string' ? JSON.parse(r.qualifications) : r.qualifications || {}
```

### Distance Matrix

Loaded once per allocation run via `loadDistanceMatrix()`. Returns `{[fromStationId]: {[toStationId]: km}}`. Use `getDistance(from, to, matrix)` helper — returns 0 if same station, `?? 999` if no entry.

### FK-Safe DELETE Order (for tests)

When truncating all tables before reseeding:
```
ot_count_log → audit_logs → ot_offers → availability → district_relievers
→ ot_assignments → ot_requests → allocation_runs → station_distances
→ system_settings → watch_anchors → areas → firefighters → stations
```

Children tables before parent tables. `SET session_replication_role = replica` to bypass constraints during DELETE.

---

## Watch Math Notes

- `getShift(watch, date)` returns: `'Day' | 'Night' | 'Off'`
- `getCallbackType(watch, date)` returns: `#1-BeforeDay1` | `#2a-EveningDay2` | `#2b-DayOfNight1` | `#3-AfterLastNight` | `null`
- `getShiftStatus(watch, date)` returns: `'Day' | 'Night' | 'Off' | 'On Leave'`

Leave is computed from a 160-day super-cycle (first 16 days = leave).

---

## Testing Patterns

Use the test dashboard (`/test`) for visual regression testing. For scripted tests:
```bash
# Run a specific scenario
curl -X POST http://localhost:3005/api/test \
  -H "Content-Type: application/json" \
  -d '{"scenario": "known-result-complex"}'

# Reset before each test run
curl -X POST http://localhost:3005/api/test \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_ot_counts"}'
```

---

## Open Implementation Items

- [ ] Rebuild allocation engine to new Block→Distance architecture per SPEC.md
- [ ] Add `preferences` column to `firefighters` table
- [ ] Verify SO/SSO preference filtering in allocation engine
- [ ] Ensure specialist fill applies to officer roles as well as FFs