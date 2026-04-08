# FENZ Overtime Rostering — Architecture Plan

## Overview
Multi-district overtime allocation system for Fire and Emergency New Zealand. Each district (Waitemata, Auckland, Counties Manukau) runs independently, then coordinates for cross-district coverage.

---

## Terminology
- **District** = Area (Waitemata, Auckland, Counties Manukau)
- **OOD** = Out-of-District (firefighters from other districts)
- **SO** = Station Officer
- **SSO** = Senior Station Officer
- **Ride up** = Firefighter temporarily promoted to fill officer vacancy
- **Ride down** = Officer temporarily demoted to firefighter role

---

## Current Schema Status
| Table | Status |
|-------|--------|
| `areas` | ✅ Districts (Waitemata, Auckland, Counties Manukau) |
| `stations` | ✅ Links to areas via `area_id` |
| `firefighters` | ✅ Links to stations |
| `station_distances` | ✅ For distance calculations |
| `watch_anchors` | ✅ Shift cycle calculation |
| `ot_requests` | ✅ OT requests per station |
| `ot_assignments` | ✅ Final assignments |

**Issue**: Engine uses `district` column (empty) — should use `area.name`

---

## Allocation Wave Structure

### Wave 1: District Internal Allocation (Parallel)
All 3 districts run simultaneously:
1. **Callback** — Available callback firefighters
2. **Non-Callback** — Off-duty firefighters wanting OT
3. *( Officers NOT included — see Wave 3 )*

**Result per district**: Filled slots + unfilled gaps

### Wave 2: Out-of-District (OOD) Firefighters
After ALL districts complete Wave 1:
- Collect remaining unfilled slots across all districts
- Pull lowest-OT firefighters from other districts
- 1 per district maximum (per watch)

### Wave 3: Officer Coverage + Riding
After Wave 2, run in parallel with Wave 1 districts:
1. **Officer Pool** (SO/SSO):
   - No OOD for officers
   - Closest available officer from ANY district
   - Must check: don't steal if officer has their own OT available

2. **Ride-Up** (FF → SO/SSO role):
   - Firefighters with `can_ride_up` qualification
   - May already be assigned OT — treat like specialist steal
   - If stolen, re-run that district's Wave 1

3. **Ride-Down** (SO/SSO → FF role):
   - Officers filling firefighter gaps

---

## Specialist Stations
- Stations with required qualifications (type4, haz, prt, etc.)
- **Steal logic**: If specialist station unfilled after Wave 1-3, steal closest qualified firefighter from any station
- Re-run Wave 1 for donor station after steal

---

## Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    WAVE 1 (Parallel)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │Waitemata │  │ Auckland │  │C. Manukau│                  │
│  │Callback  │  │ Callback │  │ Callback │                  │
│  │Non-CB    │  │ Non-CB   │  │ Non-CB   │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼────────────┼────────────┼─────────────────────────┘
        │            │            │
        └────────────┴────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Gather Unfilled     │
        │   Slots + FF Pool     │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  WAVE 2: OOD Firefighters│
        │  (1 per district)     │
        └───────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌──────────────────────┐
│WAVE 3: Officers│    │Re-run Wave 1 if      │
│(SO/SSO)        │    │ride-up FF stolen     │
│- No OOD        │    └──────────────────────┘
│- Closest any   │
│- Check own OT  │
├────────────────┤
│Ride-Up (FF→SO) │
│Ride-Down (SO→FF)│
└────────────────┘
```

---

## Technical Notes

### Fix Required
- Change engine to use `area.name` instead of `station.district`
- Implement multi-wave orchestration (Wave 1 → 2 → 3)
- Officer parallel tracking (don't steal if they have own OT)

---

## Future Considerations
- Three.js visualization of district coordination and wave flow
- Real-time dashboard updates during allocation
- Historical analytics and reporting

---

## Questions / TBD
1. Should OOD be limited to 1 per watch or 1 per district total?
2. How to handle station distances across districts?
3. Officer overtime calculation (separate from FF)?