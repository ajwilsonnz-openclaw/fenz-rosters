# FENZ Overtime Allocation Engine v2 — Design Specification

> **Status:** Draft — pending implementation
> **See also:** `SELECTION_LOGIC.md` (v1, superseded), `SPEC.md` (authoritative backend spec)

---

## Overview

The engine allocates overtime shifts across fire stations. It replaces the Block-cascade model (v1) with a **pre-built priority queue → batch greedy assignment** model.

**Core principle:** Build the right ordered list of candidates once, then assign greedily to the nearest available station. No re-looping, no waterfall cascades.

---

## 1. Station OT Requests

A station OT request specifies:
- `station_id`, `station_name`, `district`
- `date`, `shift_type` (Day / Night)
- `slots` — number of OT slots to fill
- `specialist_type` — e.g. `'prt'` or `null`
- `required_rank` — `'FF'` | `'SO'` | `'SSO'` | `'SO_OR_SSO'`
- `required_qualifications` — array of qual codes, all must be held

Rank type determines which candidate pool fills the request:
- `FF` → Groups 1–6 only
- `SO` → Group 7 only (SO pool)
- `SSO` → Group 8 only (SSO pool)
- `SO_OR_SSO` → Groups 7 then 8 (SO exhausted → SSO overflow)

---

## 2. Candidate Groups (9 groups, strict priority order)

Groups are **mutually exclusive** — each FF/Officer belongs to exactly one group.

| Group | Members | District filter | Callback filter | OT counter |
|-------|---------|-----------------|-----------------|------------|
| 1 | FF | In-district | Yes | `ot_count_callback_{shift}` |
| 2 | FF | In-district | No | `ot_count_noncallback_{shift}` |
| 3 | FF | OOD-adjacent | Yes | `ot_count_callback_{shift}` |
| 4 | FF | OOD-adjacent | No | `ot_count_noncallback_{shift}` |
| 5 | FF | OOD-distant | Yes | `ot_count_callback_{shift}` |
| 6 | FF | OOD-distant | No | `ot_count_noncallback_{shift}` |
| 7 | SO | Any (all districts) | — | `ot_count_callback_{shift}` |
| 8 | SSO | Any (all districts) | — | `ot_count_callback_{shift}` |

**SSO → SO overflow:** Group 8 (SSO pool) can fill Group 7 (SO) slots only if Group 7 is exhausted. SSO cannot fill FF slots. FF cannot fill SO/SSO slots under any circumstances.

### OOD District Adjacency Rings

Hard-coded adjacency (Auckland is the hub):

| Target district | Adjacent (A-ring) | Distant (B-ring) |
|-----------------|-------------------|------------------|
| Auckland | Waitemata, Counties Manukau | — |
| Waitemata | Auckland | Counties Manukau |
| Counties Manukau | Auckland | Waitemata |

For a station, OOD candidates are drawn from A-ring districts first. B-ring is only considered after A-ring is fully exhausted at all distances.

---

## 3. Eligibility Rules (per candidate per request)

A candidate is eligible for a request if ALL of the following pass:

### Universal (all groups)
- `is_active = true`
- Watch is not on a regular working shift for the request date/shift (`getShift()` must return `'Off'`)
- Watch is not on leave (`isOnLeave()`)
- Requested date/shift not excluded by callback type:
  - `#2a-EveningDay2` → not available for Day
  - `#3-AfterLastNight` → not available for Day
- Candidate holds all `required_qualifications` for the request
- Candidate's preferences (if any) include the request district or station
- Candidate has `want_to_work_{shift}` = true (non-callback only; callback overrides want_to_work)

### FF Groups (1–6)
- Rank must be `FF`
- FF must belong to the required district ring (in / OOD-adjacent / OOD-distant)
- Callback status must match group:
  - Group 1, 3, 5: `getCallbackType()` must return a non-null callback name
  - Group 2, 4, 6: `getCallbackType()` must return `null`

### SO Groups (7)
- Rank must be `SO` or `SSO` (SSO can ride up to fill SO slots in overflow)
- No district restriction

### SSO Groups (8)
- Rank must be `SSO`
- No district restriction

---

## 4. Sorting Within Groups

### FF Groups (1–6) — Must / Might / Won't

Within each group, candidates at the same distance are sorted by:
1. **Threshold bucket:** `must` → `might` → `wont`
2. **OT count** (ascending — lower = more deserving)
3. **Distance** (ascending — tie-break)

**Must / Might / Won't threshold:**

For a given station and group, at the current distance phase:
- Sort all candidates by OT count (lowest first), ties by distance
- Candidates filling the first `slots_remaining` positions → `must`
- Candidates filling the next `slots_remaining` positions (if any remaining) → `might`
- All others → `wont`

Only `must` candidates are assigned. `might` candidates wait for the next distance phase.

**Distance phases advance together:**
All stations move through distance phases in lockstep. A phase only advances when every station has either: (a) all slots filled, or (b) no eligible candidates remaining at that phase.

### Officer Groups (7, 8) — Pure OT Count + Home Preference

Officers within Groups 7 and 8 are sorted by:
1. **Adjusted OT count** (see Home Station Preference below)
2. **Distance** (ascending)

No must/might bucket — every eligible officer at a given station is considered simultaneously.

---

## 5. Home Station Preference (Officers only)

**Admin setting (stored in DB, default = 2):**
```
officer_home_preference_grace = 2  # OT count grace for home station
```

For an officer candidate at their home station:
- Effective OT count = `ot_count_callback_{shift} - grace`
- For grace = 2: an SO with OT=8 at their home station competes as OT=6

This means an officer at their home station can outrank someone with a lower raw OT count, as long as the difference is within the grace. At non-home stations, raw OT count applies.

**Note:** Future-proofing: same rule can apply to FFs with `ff_home_preference_grace = 0` (currently disabled, always 0).

---

## 6. Overflow Logic (Cross-group redistribution)

A surplus FF from a higher group can only enter a lower group if:

1. The higher-priority group's stations are **all fully filled**, AND
2. The surplus FF has a **lower OT count** than every candidate currently assigned to the target station from the lower group

This preserves fairness — someone with a higher OT count cannot be displaced by a lower-ranked group candidate just because of proximity.

Practically: overflow is evaluated at the boundary between groups. For each station, after Group N is exhausted, check if any unassigned FFs from Group N−1 could fill remaining slots. If yes, they are moved into that station's assignment list, displacing the highest-OT candidate from the lower group.

---

## 7. Assignment Algorithm

```
1. Load all candidates and requests.
2. For each request, compute district ring (in / OOD-adj / OOD-distant) from adjacency map.
3. Build candidate groups 1–8 by applying eligibility rules.
4. Sort each group:
   - Groups 1–6: by threshold (must/might), then OT count, then distance
   - Groups 7–8: by adjusted OT count, then distance
5. For each request, build per-distance-phase candidate lists.
6. Assign in strict group priority order:
   For each group:
     For each distance phase:
       For each station:
         Assign must candidates in OT order
         Skip might candidates (they'll be re-evaluated at next distance)
         Advance distance phase when all stations at this phase are exhausted
7. After all FF groups (1–6), evaluate overflow (Section 6).
8. Assign SO pool (Group 7) to SO/SSO requests.
9. Assign SSO pool (Group 8) to SSO requests.
10. Evaluate SSO → SO overflow.
11. Return station results.
```

---

## 8. Test Scenario Data

### Station OT Requests (v2 test)

| Station | District | Slots | Rank | Specialist |
|---------|----------|-------|------|-----------|
| Albany | Waitemata | 3 | FF | — |
| Devonport | Waitemata | 2 | FF | — |
| Silverdale | Waitemata | 2 | SSO | PRT |
| Takapuna | Waitemata | 2 | SSO | — |
| Papakura | Counties Manukau | 3 | SO | — |
| Manurewa | Counties Manukau | 2 | SO | — |
| Otahuhu | Counties Manukau | 2 | SO | — |
| Papatoetoe | Counties Manukau | 2 | SSO | — |
| Grey Lynn | Auckland | 2 | SO | — |
| Remuera | Auckland | 2 | SO | — |
| Avondale | Auckland | 2 | SSO | — |
| Mount Roskill | Auckland | 2 | SSO | — |

### Test date: 2026-04-07, Day Shift

### Adjacency map for this test:
- Auckland → Adjacent: Waitemata + Counties Manukau; Distant: none
- Waitemata → Adjacent: Auckland; Distant: Counties Manukau
- Counties Manukau → Adjacent: Auckland; Distant: Waitemata

---

## 9. Open Questions

- [ ] Can an SO ride up to fill an SSO station? (Currently modelled as yes — SSO pool is the primary, SO pool fills SSO if SSO exhausted)
- [ ] When SSO overflows to SO slots, does SSO use their own OT count or SSO-specific OT count? (Currently: SSO `ot_count_callback` applies in both cases)
- [ ] Does `want_to_work_day/night` apply to SO/SSO officers? (Currently modelled as no — officer availability is purely watch-based)
- [ ] Admin setting for `officer_home_preference_grace` — table schema and UI needed

---

## 10. Open Items / Backlog

From previous sessions (not yet addressed):
- [ ] OOD adjacency ring expansion: A-ring → B-ring only when A-ring exhausted at all distances
- [ ] Specialist secondary pass: after primary FF pass, steal qualified candidates from other stations to fill specialist slots
- [ ] Per-FF OT count fairness tracking across multiple OT runs (cumulative vs per-round)
- [ ] Admin manual override for leave/exceptional circumstances