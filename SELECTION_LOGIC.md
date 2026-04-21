# FENZ Overtime Allocation — Selection Logic

> **See also:** [SPEC.md](./SPEC.md) — the authoritative design specification.

## How a Round Works

A single overtime round fills all stations for a given date/shift.

### 1. Block → Distance → Group → Station

The round runs as a nested loop:

```
For BLOCK in [1..8]:
  For DISTANCE_PHASE in [0, 1, 2, ... max_km]:
    For STATION needing coverage:
      For each relevant GROUP:
        Collect eligible candidates at this distance
        Sort: must/might → OT count → distance
        Assign: must first, then might
        Mark each assigned FF as unavailable everywhere
    Advance to next distance ONLY when ALL stations are exhausted at current phase
  After Block 2: specialist fill pass
```

### 2. Blocks (Eligibility Tiers)

| Block | Who | Callback? | District |
|---|---|---|---|
| 1 | District FFs | Yes (callback-eligible) | In-district |
| 2 | District FFs | No (non-callback) | In-district |
| 3 | District FFs | Yes | Out-of-district (all other districts) |
| 4 | District FFs | No | Out-of-district (all other districts) |
| 5 | SO | Yes | All districts |
| 6 | SSO | Yes | All districts |
| 7 | SO | No | All districts |
| 8 | SSO | No | All districts |

### 3. Distance Phases

Starting at 0km and sweeping upward. **All stations and all groups move through the same distance phase simultaneously.** A station cannot skip ahead while another station still has candidates at the current distance.

At each distance phase, a candidate is included if:
- Their home station is exactly at that distance from the overtime station
- They are not already assigned to another station this round
- They pass watch eligibility (`canDoOT`)
- They pass the block-specific filter (callback or non-callback)
- They hold the required qualification (if any)
- The overtime station/district is in their preference list

### 4. Sorting and Assignment

Within each distance phase for each station:

1. Compute must/might thresholds using `computeMustMightWonThreshold()`
2. Sort: `must` before `might` → lowest OT count → smallest distance
3. Assign "must" candidates first, one by one
4. If slots remain, assign "might" candidates, one by one

Each assigned firefighter is immediately added to `assignedThisRun` and cannot be assigned again in the same round.

### 5. Specialist Fill (After Block 2)

After Block 2 (last in-district FF block) completes:

1. For each specialist station still short:
2. Find the nearest qualified firefighter from any non-specialist station that has spare capacity (≥1 assigned FF holding the required qualification)
3. Steal them from the donor station's assignment list
4. Add to specialist station, mark as `cascadePhase = 'specialist-steal'`
5. Repeat until full OR no more qualified candidates

### 6. Must / Might / Won't

Threshold is computed across **all candidates at the current distance phase for a given station**:

- **must** — there is room for this candidate before the slot threshold
- **might** — slots remain after all musts are assigned
- **won't** — past the threshold, not assigned this phase

Tied OT counts within a group are sorted by distance before assigning must/might status.

### 7. OT Counter Selection

| Block | Counter |
|---|---|
| 1, 3, 5, 6 (callback) | `ot_count_callback_days` / `ot_count_callback_nights` |
| 2, 4, 7, 8 (non-callback) | `ot_count_noncallback_days` / `ot_count_noncallback_nights` |

### 8. Preferences

Every firefighter has a `preferences` JSONB field:
```json
{
  "districts": ["Waitemata"],
  "stations": []
}
```

- Empty arrays mean "all"
- A non-empty list means "only these"
- Preferences are evaluated at allocation time, not stored permanently
- Officers (SO/SSO) use the same preference system to limit themselves to specific districts or stations