# FENZ OT Allocation Engine — Algorithm Design v2

> **Status:** Draft for Adam's review  
> **Date:** 2026-04-20  
> **Goal:** Single-pass allocation with OOD boundary re-rank, before implementing

---

## 1. Problem with the Current 8-Block Cascade

The existing engine processes blocks 1–8 **sequentially**, each independently assigning candidates to their nearest available slot. This creates two failure modes:

### Failure Mode A: Callback Monopoly
```
Albany has 2 slots, Takapuna (0 km away) has callback FF available.
Block 1 (ff-callback, in-district): Takapuna FF → Albany ✓ (slot 1 filled)
                                    But Albany also had a non-callback FF from Devonport (4 km) in the same block.
                                    Devonport FF gets slot 2 in block 1.

Problem: Albany also needs to fill Henderson OT. The Henderson OT slot could have been filled by
Devonport FF. But Devonport FF is now assigned to Albany, so Henderson gets nothing from this run.
```

### Failure Mode B: OOD Starvation (Adam's Key Example)
```
Scenario: Albany OT + Henderson OT

Non-callback pass (Block 2):
  - FF-A from Takapuna (0 km from Albany) → assigned Albany
  - FF-B from East Coast Bays (3 km from Henderson) → assigned Henderson

OOD pass (Block 4):
  - OOD FF-C from Auckland district (2 km from Henderson) is available.
  - But Henderson's slot was already taken by FF-B in Block 2.
  - FF-C gets nothing.

Adam's rule: When we reach OOD (Block 4), we should KNOW that Henderson still needs a slot,
re-evaluate whether any earlier-phase candidate (Block 2) is closer to that slot than the
person currently assigned there, and RE-RANK accordingly.

Result: FF-C (2 km) should displace FF-B (3 km) at Henderson. FF-B then becomes available
for another station or stays unassigned.
```

**Root cause:** Blocks are isolated passes. Block 4 has no visibility into Block 2's assignments.

---

## 2. The New Approach: Pre-Computed, Single-Pass with Re-Rank Checkpoints

### Core Principles
1. **Know your pool first.** Before assigning anyone, compute the full eligible pool for all OT requests — count by phase category, check distances, filter by watch eligibility.
2. **Sort globally once.** All candidates are sorted by priority score (phase priority + OT count tiebreaker), then processed in order.
3. **Re-rank at group boundaries.** When moving from one phase group to the next (e.g., non-callback → OOD), run a re-rank check: for any slot still unfilled, is there a candidate from the previous group who would be displaced by a candidate in the current group? If yes, promote the closer one.
4. **One assignment per candidate.** A candidate can only be assigned once. When displaced, they return to the pool for reassignment.
5. **Specialist exception.** Secondary pass — if specialist slots (PRT, TYPE4, HA) are unfilled after primary pass, steal closest qualified FF from non-specialist stations that have spare capacity.

---

## 3. Candidate Classification (Pre-Compute Phase)

Before any assignment, bucket all FFs into priority groups:

### Group 0: In-District, Callback (Priority 0)
- `inDistrict(ff, station)` AND `isCallback(ff, date)`
- Ranks: FF only (no officers in callback for their home district)

### Group 1: In-District, Non-Callback (Priority 1)
- `inDistrict(ff, station)` AND `!isCallback(ff, date)`
- Ranks: FF, SO, SSO (any rank eligible)

### Group 2: Out-of-District, Callback (Priority 2)
- `!inDistrict(ff, station)` AND `isCallback(ff, date)`
- Ranks: FF only
- **Question for Adam:** Should OOD be district-restricted (e.g., only adjacent districts) or any district?
  - *Current assumption: any district, sorted by distance*

### Group 3: Out-of-District, Non-Callback (Priority 3)
- `!inDistrict(ff, station)` AND `!isCallback(ff, date)`
- Ranks: FF, SO, SSO

### Group 4: SSO Overflow (Priority 4)
- If SSO slots remain after Groups 0–3 exhausted
- All SSO FFs regardless of district/callback (they're officers, they cover gaps)

### Group 5: SSO Any Shift (Priority 5)
- SSO FFs who weren't on duty but can cover any shift
- Final fallback

---

## 4. Pre-Computation Output

```
For each OT request R:
  G0_pool[R] = list of eligible Group 0 FFs, sorted by (distance ASC, otCount ASC)
  G1_pool[R] = list of eligible Group 1 FFs, sorted by (distance ASC, otCount ASC)
  G2_pool[R] = list of eligible Group 2 FFs, sorted by (distance ASC, otCount ASC)
  G3_pool[R] = list of eligible Group 3 FFs, sorted by (distance ASC, otCount ASC)
  
  Phase 0_pre[R] = [FF from G0 whose home_station == R.station_id]  // home-station assignments
```

**Eligibility rules per group:**
- Group 0 (callback): Must be on leave or between nights (callback window active). Excluded if already working regular shift.
- Group 1 (non-callback): Must NOT be on leave. Cannot be in callback. Regular off-duty eligible. Watch eligibility checked.
- Group 2 (OOD callback): Same as Group 0 but any district.
- Group 3 (OOD non-callback): Same as Group 1 but any district.

**Questions for Adam on OOD:**
1. Should OOD FFs only fill districts adjacent to their home district (e.g., Waitemata ↔ Auckland, Auckland ↔ Counties Manukau)?
2. For specialists — if a PRT-qualified FF from Auckland is the closest qualified person to a Waitemata PRT slot, should they fill it? Or should specialists stay in-district first?

---

## 5. Primary Pass Algorithm (Single Sweep)

```
INPUT: List of OT requests R[1..n], each with slots S[R]
OUTPUT: assignments: Map<FF_id, {station, distance, group, phase}>

// Phase 0: Home-station pre-pass (Adam's requirement)
for each R where S[R] > 0:
  home_ffs = G0_pool[R].filter(ff => ff.home_station == R.station_id)  // already in pool
  assign min(home_ffs, S[R])  // assign closest home-station FFs
  S[R] -= assigned_count
  mark assigned FFs as used

// Primary sweep: process groups in priority order
groups = [G0, G1, G2, G3, G4, G5]

for each group G in groups:
  // Step A: Assign group candidates to nearest available slots
  all_candidates = flatten(G across all R, already sorted by distance within R)
  for each candidate C in all_candidates:
    R = C.target_station
    if S[R] > 0 and C.ff not in assignments:
      assign C to R
      S[R] -= 1
      assignments[C.ff] = {station: R, distance: C.distance, group: G.name}

  // Step B: Re-rank checkpoint at group boundary (Adam's key rule)
  // Before moving to next group, re-evaluate: should any current assignment be
  // displaced by a candidate in the NEXT group who's closer?
  if G is not last_group:
    for each R where S[R] > 0:  // unfilled slots
      next_group_candidates = G_next_pool[R]
      for each next_C in next_group_candidates:
        current_assignments_for_R = assignments where station == R
        
        for each current_C in current_assignments_for_R:
          // If next_C is closer AND lower priority (shouldn't happen by sorting),
          // but we need to check: is next_C from a LATER phase group?
          // If next_C is closer AND from a later group, displace current_C
          if next_C.distance < current_C.distance AND next_C.ff not in assignments:
            // Displace: unassign current_C, assign next_C
            unassign current_C from R
            assign next_C to R
            S[R] unchanged
            mark current_C available for reassignment
            mark next_C assigned
            log: "Displaced [current_C.ff] at [R] with [next_C.ff] (OOD re-rank)"
            break  // one displacement per next_C attempt
```

**Key insight on re-rank:** The re-rank check only matters at group boundaries. Within a group, candidates are already sorted by distance — so the closest candidate always wins. The re-rank ensures that when we enter a new (lower-priority) group, we don't permanently lock in assignments made by earlier groups if a lower-priority candidate is objectively closer.

---

## 6. Secondary Pass: Specialist Fill

After primary pass, check each station for specialist slots unfilled:

```
for each R with S[R] > 0 and R.specialist_type not null:
  qualified_pool = all FFs with R.specialist_type qualification
                   AND currently assigned to a NON-specialist station
                   AND have remaining capacity at their current station
  if qualified_pool is empty:
    log: "No qualified specialist for [R.station_name] [R.specialist_type]"
    continue

  // Steal closest qualified FF from a station that has spare capacity
  sorted = qualified_pool sorted by distance to R (ascending)
  for each specialist_C in sorted:
    current_station = assignments[specialist_C.ff].station
    if current_station has unfilled regular slots (capacity > assigned):
      // Steal them
      unassign specialist_C from current_station
      assign specialist_C to R
      S[current_station] += 1  // free up their old slot
      S[R] -= 1
      log: "Specialist [specialist_C.ff] reassigned: [current_station] → [R] (specialist fill)"
      break
```

**Specialist types in DB:** `prt`, `type4`, `ha` (Heavy Appliance)  
**Stations with specialist requirements:** Henderson (PRT), Te Atatu (TYPE4), other stations per `station_vacancies.specialist_type`.

---

## 7. Data Structures

### Firefighter eligibility record (computed once, reused)
```typescript
interface FFEligible {
  ff: Firefighter;
  target_station: OTRequest;
  distance: number;  // from station_distances JSONB
  group: 0 | 1 | 2 | 3 | 4 | 5;
  groupName: 'in-district-callback' | 'in-district-noncallback' | 
             'ood-callback' | 'ood-noncallback' | 'sso-overflow' | 'sso-final';
  isCallback: boolean;
  isInDistrict: boolean;
  watchEligible: boolean;
  qualifications: string[];
  otCount: number;
  homeStationMatch: boolean;  // for Phase 0
}
```

### Assignment record
```typescript
interface FFAssignment {
  ff_id: number;
  station_id: number;
  station_name: string;
  distance: number;
  group: string;
  displacementReason?: string;
  isSpecialistSteal?: boolean;
}
```

---

## 8. QOL / UI Requirements (from Adam's Feedback)

1. **Phase colour coding:**
   - In-district callback → 🔵 Blue (or district colour)
   - In-district non-callback → 🟢 Green
   - OOD callback → 🟠 Orange
   - OOD non-callback → 🟡 Yellow
   - SSO overflow → 🟣 Purple
   - Specialist → ⬜ White with badge

2. **Group borders:** Clear visual separation between phase groups in the assignment display. Each group gets a bordered card/section.

3. **"Must / Might / Won't" indicator:** Based on candidate density vs slots ratio per phase group. "Must" = slots < candidates. "Might" = slots ≈ candidates. "Won't" = slots exhausted.

4. **Per-station breakdown:** Show for each station: assigned FFs, their phase group, distance, why they were chosen.

5. **"Why this person?" tooltip:** On each assignment, explain: "Takapuna FF (0 km, in-district callback, 2nd lowest OT count)."

---

## 9. Database Changes Needed

### station_distances — already JSONB, no change needed ✅

### New view: `v_candidate_pool`
Pre-computed eligible FFs per OT request (materialized or computed at allocation time):
```sql
CREATE VIEW v_candidate_pool AS
SELECT 
  ff.id as ff_id,
  otr.id as request_id,
  otr.station_id,
  sd.distances->otr.station_id::text as distance_km,
  -- classification
  CASE 
    WHEN a.id = s.area_id AND is_callback(ff.watch, otr.date) THEN 'in-district-callback'
    WHEN a.id = s.area_id AND NOT is_callback(ff.watch, otr.date) THEN 'in-district-noncallback'
    WHEN a.id != s.area_id AND is_callback(ff.watch, otr.date) THEN 'ood-callback'
    WHEN a.id != s.area_id AND NOT is_callback(ff.watch, otr.date) THEN 'ood-noncallback'
  END as candidate_group,
  -- qualification check
  otr.specialist_type IS NULL OR ff.qualifications->otr.specialist_type = 'true' as has_quals,
  -- watch eligibility
  watch_eligible(ff.watch, otr.date, otr.shift_type) as watch_ok,
  -- OT counts
  ff.ot_count_days + ff.ot_count_nights as total_ot,
  ff.ot_count_callback_days + ff.ot_count_callback_nights as callback_ot
FROM firefighters ff
CROSS JOIN ot_requests otr
JOIN stations s ON s.id = otr.station_id
JOIN areas a ON s.area_id = a.id
LEFT JOIN station_distances sd ON sd.station_id = ff.station_id
WHERE ff.is_active = true
  AND otr.status = 'pending'
  AND watch_ok = true
  AND has_quals = true;
```

### New table: `allocation_run_summary`
Audit trail for each allocation run:
```sql
CREATE TABLE allocation_run_summary (
  id SERIAL PRIMARY KEY,
  run_at TIMESTAMP DEFAULT NOW(),
  requests_processed INT,
  assignments_made INT,
  fill_rate NUMERIC(5,2),
  phases_used TEXT[],
  displaced_assignments JSONB,  -- [{ff_id, from_station, to_station, reason}]
  specialist_fills JSONB,       -- [{ff_id, from_station, to_station, specialist_type}]
  total_candidates_considered INT,
  raw_pool JSONB                -- full candidate pool snapshot
);
```

---

## 10. Open Questions for Adam

1. **OOD District Restriction:** Should OOD FFs only fill adjacent districts, or any district?
2. **Specialist Cross-District:** Can a PRT-qualified FF from Auckland fill a Waitemata PRT slot? Or do specialists stay in-district first?
3. **SSO as Final Overflow:** Is Priority 4 (SSO overflow) the right last-resort, or should there be a separate step for "SSO on leave but available for callback"?
4. **Phase 0 Home-Station:** Should home-station assignment be automatic (no OT count consideration, just fill it), or should it still respect OT count fairness?
5. **Displacement Limit:** Should a candidate be displaceable only once per run, or unlimited?
6. **Memory Compaction:** Done ✅ (287KB → 91KB). What else do you need from memory?