# FENZ Overtime Allocation — Design Specification

> **⚠️ Engine redesign in progress — see ALGORITHM.md**
> The current engine uses an 8-block sequential cascade. A new single-pass algorithm with OOD re-rank is being designed.
> ALGORITHM.md is the draft design. Do NOT implement changes until Adam approves ALGORITHM.md.
>
> **For AI agents:** This is the authoritative source of truth for the allocation engine design.
> PLAN.md and SELECTION_LOGIC.md reference this document.
> Read ALGORITHM.md first for the new design. Keep this file as the baseline.
> Read this first for context. Keep this file accurate. Any code changes must be reflected here.

---

## 1. Concepts

### 1.1 Groups

Allocation runs with **four Groups running simultaneously**, each operating independently but synchronised on distance phases:

| Group | Eligibility | Districts | Blocks |
|---|---|---|---|
| **District FFs** | One group per configured district | N/A (same-district only for Blocks 1-2) | 1–4 |
| **Auckland FFs** | District group | Auckland only | 1–4 |
| **Counties Manukau FFs** | District group | Counties Manukau only | 1–4 |
| **SO** | Station Officers | All districts (any distance) | 1–2 |
| **SSO** | Senior Station Officers | All districts (any distance) | 1–2 |

> **Configurable districts:** The engine does not hardcode district names or count. Districts are loaded from the `areas` table at runtime. A deployment in a different region with a different number of districts works identically — the engine processes whatever districts exist.

### 1.2 Firefighter Ranks

| Rank | Belongs to Group |
|---|---|
| FF (Firefighter) | District FF Group |
| QFF (Qualified Firefighter) | District FF Group |
| SFF (Senior Firefighter) | District FF Group |
| SO (Station Officer) | SO Group |
| SSO (Senior Station Officer) | SSO Group |

### 1.3 Blocks

Each Group has eligibility tiers called **Blocks**:

| Block | District FF Groups | SO Group | SSO Group |
|---|---|---|---|
| **1** | In-district, callback-eligible | Any district, callback-eligible | Any district, callback-eligible |
| **2** | In-district, non-callback | Any district, non-callback | Any district, non-callback |
| **3** | Out-of-district, callback-eligible | — (not applicable) | — (not applicable) |
| **4** | Out-of-district, non-callback | — (not applicable) | — (not applicable) |

**Key notes:**
- For District FF Groups, "in-district" means the same district as the requesting station.
- For SO and SSO Groups, there is no in-district/out-of-district distinction — both Blocks 1 and 2 span all districts.
- When a District FF Group reaches Block 3 (out-of-district), it draws from **all other districts simultaneously** — not one at a time. Distance determines who is nearest.
- Blocks 3 and 4 do not exist for SO or SSO Groups.

### 1.4 Distance Phases

Within each Block, allocation happens in **distance sweeps**:

```
0km phase → 1km phase → 2km phase → ... → max_km phase
```

A **distance phase** is the physical road distance in kilometres between a firefighter's **home station** and the **overtime station**. The phase number represents the km threshold — all candidates whose home station is within exactly that distance are considered.

**The critical rule:** The current distance phase is **global across all Groups, all districts, all stations**. No station can advance to the next distance phase until **every station has exhausted its candidate pool at the current phase**.

### 1.5 Must / Might / Won't

Within each distance phase, eligible candidates are sorted by their **relevant OT count** (lowest first). The `computeMustMightWonThreshold()` function assigns each candidate a status:

- **must** — There is room for this firefighter before the slot threshold is reached. They are expected to take this OT.
- **might** — All "must" candidates have been assigned, and slots remain. They may be assigned if slots are still available after all "musts".
- **won't** — This firefighter is past the threshold. Not assigned this phase.

The threshold is computed across **all candidates in the current distance phase for a given station**, not across all candidates globally.

### 1.6 Preferences (All Firefighters)

Every firefighter — regardless of rank — may have a **preference list** specifying which districts and/or stations they are willing to work at. This is **not a qualification**:
- **Qualifications** are permanent (e.g., PRT certification)
- **Preferences** are dynamic and may change from day to day

The engine handles preferences the same way it handles qualifications: if a firefighter's preference list does not include the overtime station (or its district), they are filtered out of the candidate pool. Preferences are stored per-firefighter, loaded at allocation time, and evaluated against the current OT request.

### 1.7 Specialist Stations

Some stations require specific qualifications to fill certain slots — for example, Silverdale requires `prt`, Te Atatu requires `type4`. These are stored in `stations.specialist_type`.

A specialist slot can only be filled by a firefighter who holds the required qualification (checked via the qualifications map, same as other qualifications).

---

## 2. The Allocation Algorithm

### 2.1 Overview

For a given OT request date/shift across one or more stations:

```
For BLOCK in [1, 2, 3, 4, 5, 6]:
  For DISTANCE_PHASE in [0, 1, 2, ... max_km]:
    For each STATION needing coverage:
      For each GROUP processing this block:
        Collect all eligible candidates at this distance
        Sort by: must/might → OT count → distance
        Assign: must → might (one by one)
        Mark each assigned firefighter as unavailable for all other stations
    Advance to next distance phase only when ALL stations have exhausted this phase
  If BLOCK == 2 (last in-district FF block):
    Run specialist fill
  Move to next BLOCK
```

### 2.2 Step-by-Step

**Step 1 — Enter a new Block**

All Groups enter their next Block simultaneously. For District FF Groups, each Group operates within its own district for Blocks 1–2, then all districts combine for Blocks 3–4.

**Step 2 — Start at distance 0km**

The current distance phase applies to **every Group, every district, every station** simultaneously. You are always looking at the same distance across the entire system.

**Step 3 — Collect candidates at this distance**

For each station still needing coverage, collect all firefighters from every Group whose home station is **exactly at the current distance phase** from the overtime station, who pass:
- **Watch eligibility** — not on leave, callback status allows this shift, shift type matches
- **Qualification check** — holds required specialist qualification (if any)
- **Preference check** — overtime station (or its district) is in their preference list
- **Not already assigned** — not in the global `assignedThisRun` set

**Step 4 — Sort and assign**

For each station, within the candidates at this distance phase:
1. Sort by: must/might status → lowest relevant OT count → smallest distance (tiebreaker)
2. Assign "must" candidates first, one by one
3. If slots remain, assign "might" candidates, one by one
4. Each assigned firefighter is **immediately** added to `assignedThisRun` — they are now unavailable for all other stations at this and all future distance phases in this round

**Step 5 — Advance only when all stations are exhausted at this distance**

Once every station either has its full complement **or** has no more candidates at the current distance phase, advance to the next distance phase. Repeat from Step 3.

**Step 6 — Move to next Block**

When every distance phase has been swept and slots remain, move to the next Block. Repeat from Step 2.

**Step 7 — Specialist fill (after Block 2 only)**

After Block 2 (the last in-district FF block) is complete, but **before** moving to Block 3 (out-of-district):

If any specialist station has unfilled slots:
1. Identify every non-specialist station that has at least one assigned firefighter who holds the required qualification
2. For each unfilled specialist slot, steal the nearest-qualified firefighter from any non-specialist station with spare capacity
3. The stolen firefighter comes from the **already-assigned pool** — never from candidates still being considered for out-of-district blocks
4. Repeat until all specialist slots are filled OR no qualified candidates remain

> **Note on assignedIds and specialist fill:** The `assignedThisRun` set contains all firefighters assigned during the current round. Specialist steals draw from this set — the firefighter is reassigned from their original station to the specialist station. This is the **only exception** to the rule that "once assigned, a firefighter cannot be reassigned."

### 2.3 OT Counter Selection

Which OT counter is incremented depends on the Block and the shift type:

| Block | Counter Used |
|---|---|
| 1 (callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 2 (non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 3 (OOD callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 4 (OOD non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 5 (SO callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 6 (SSO callback) | `ot_count_callback_days` or `ot_count_callback_nights` |
| 7 (SO non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |
| 8 (SSO non-callback) | `ot_count_noncallback_days` or `ot_count_noncallback_nights` |

---

## 3. Watch Eligibility

Every candidate must pass a **universal watch eligibility check** before being considered in any Block. This is encapsulated in `canDoOT()`:

```typescript
function canDoOT(ff: Firefighter, otDate: Date, requestShiftType: 'Day' | 'Night'): {
  pass: boolean;
  reason: string;
}
```

**Rules (in order):**

1. **On Leave** → fail, reason: "On Leave"
2. **#3-AfterLastNight + Day shift** → fail, reason: "#3-AfterLastNight is Night-only"
3. **#2a-EveningDay2 + Day shift** → fail, reason: "#2a-EveningDay2 excludes Day shift"
4. **#2b-DayOfNight1 + Day shift** → fail, reason: "#2b-DayOfNight1 is Night-only"
5. **Regular working shift mismatch** (no callback):
   - Day shift request + FF is on Night shift → fail
   - Night shift request + FF is on Day shift → fail
6. **Otherwise** → pass, reason: "Watch-eligible"

---

## 4. Callback Filter (Blocks 1, 3, 5, 6)

To be eligible for a callback Block, a firefighter must:
- Have an active callback type for this date/shift (see Section 4 of PLAN.md for callback rules)
- Pass the universal watch eligibility check above
- Not already be on a regular working shift of the opposite type

### 4.1 Non-Callback Filter (Blocks 2, 4)

To be eligible for a non-callback Block, a firefighter must:
- **Not** have an active callback
- Pass the universal watch eligibility check
- Either:
  - Be on an off-duty period (any shift type OK), OR
  - Be on a regular shift matching the OT type AND have `want_to_work_[day/night]` = true

---

## 5. Officer Preferences (SO / SSO)

Officers (SO and SSO) can restrict their availability to:
- A specific **district** (all stations in that district are eligible)
- A specific **station** (only that station is eligible)

This is stored as a preference list on the firefighter record, not as a qualification. The preference may change from one shift to the next.

For officers who have restricted their preferences, the allocation engine filters them out of any candidate pool where the overtime station is not on their preference list.

---

## 6. Specialist Station Fill (Post-Block 2)

Triggered: after Block 2 (last in-district FF block) is complete, before Block 3 begins.

```
For each specialist station still needing coverage:
  While slots remain unfilled:
    Find the nearest qualified firefighter from any non-specialist station
    that has at least 1 assigned firefighter with the required qualification
    AND where the donor station will retain at least 1 firefighter after the steal
    
    If such a candidate exists:
      Remove them from the donor station's assignment list
      Add them to the specialist station's assignment list
      Mark as: cascadePhase = 'specialist-steal', stolenFrom = [donor station]
    Else:
      Stop — no more qualified candidates available
```

Specialist steals are recorded as a distinct cascade phase (`specialist-steal`) in the trace logs, with entries in both the donor and recipient station logs.

---

## 7. Trace Logging

Each distance phase records a trace log entry per candidate:

| Type | Meaning |
|---|---|
| `header` | Phase/distance header |
| `pass` | Candidate is eligible and considered |
| `skip` | Candidate is ineligible (reason in detail) |
| `assign` | Candidate is assigned (shows OT count, distance) |

Specialist steals generate two trace entries: `STOLEN` in the specialist station log, `LOST` in the donor station log.

---

## 8. Full Block Sequence

```
Block 1: In-district FF, callback
  → Distance sweep 0km → max
  → All district FF groups run simultaneously

Block 2: In-district FF, non-callback
  → Distance sweep 0km → max
  → All district FF groups run simultaneously
  → [SPECIALIST FILL] after this block completes

Block 3: Out-of-district FF, callback
  → Distance sweep 0km → max
  → All districts combined, distance-sorted

Block 4: Out-of-district FF, non-callback
  → Distance sweep 0km → max
  → All districts combined, distance-sorted

Block 5: SO, callback
  → Distance sweep 0km → max
  → All districts, officer-qualified FFs and SSOs also eligible

Block 6: SSO, callback
  → Distance sweep 0km → max
  → All districts, SSO-qualified SOs also eligible

Block 7: SO, non-callback
  → Distance sweep 0km → max
  → All districts

Block 8: SSO, non-callback
  → Distance sweep 0km → max
  → All districts
```

---

## 9. Data Model Summary

### Firefighter record key fields:
- `id`, `first_name`, `last_name`, `station_id`, `watch`, `rank`
- `qualifications` (JSONB: `{"prt": true, "type4": true, ...}`)
- `preferences` (JSONB: `{"districts": ["Waitemata"], "stations": []}` or `{"districts": [], "stations": ["Albany"]}`)
- `want_to_work_day`, `want_to_work_night`
- `ot_count_days`, `ot_count_nights`
- `ot_count_callback_days`, `ot_count_callback_nights`
- `ot_count_noncallback_days`, `ot_count_noncallback_nights`
- `is_active`

### Station record key fields:
- `id`, `name`, `area_id` (FK → areas)
- `specialist_type` (nullable: `prt`, `type4`, etc.)

### Area (District) record:
- `id`, `name` (e.g., "Waitemata", "Auckland", "Counties Manukau")

### station_distances:
- `station_id`, `distances` (JSONB: `{"stationB_id": km, ...}`)

### ot_requests:
- `station_id`, `date`, `shift_type`, `specialist_type`, `number_of_slots`, `status`

---

## 10. Algorithm Summary

```
INPUT: Set of OT requests (station, date, shift, slots, specialist?)
OUTPUT: Assignment map (firefighter_id → station_id)

global_assigned = {}

For block in [1, 2, 3, 4, 5, 6, 7, 8]:
  max_distance = max(station_distances values)
  
  For distance from 0 to max_distance:
    For each station with unfilled slots:
      For each relevant group for this block:
        candidates = all FFs where:
          - FF.rank matches group (FFs/OOs/SOs/SOs)
          - FF.preferences allow this station
          - FF.qualifications allow this station
          - FF not in global_assigned
          - distance(FF.home_station, station) == current_distance
          - FF passes watch eligibility
          - FF passes block-specific filter (callback or non-callback)
        
        If no candidates at this distance:
          continue (station will try next distance phase)
        
        sorted = sort candidates by (must/might → OT count → distance)
        
        For each candidate in sorted:
          If slots remain:
            Assign: global_assigned[candidate.id] = station
            slots -= 1
            Record OT counter increment
        
        If all slots filled:
          Mark station as complete for this block
  
  After block 2: run specialist fill (see Section 6)

Return global_assigned
```