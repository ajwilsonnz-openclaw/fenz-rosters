# FENZ OT — Implementation Notes

> **Refer to[ENGINE_V2_DESIGN.md](./ENGINE_V2_DESIGN.md) for the authoritative allocation algorithm.**

---

## Folder Structure & Architecture
The application uses Next.js Route Groups to separate the Desktop and Mobile experiences without messing up URLs:
1.  **`(manage)`:** Desktop Officer application. Uses a standard `<Sidebar>` and `<Header>`. Includes `/vacancy`, `/available`, and `/filled`.
2.  **`(pwa)`:** Mobile Firefighter app. Uses a `<BottomNav>` and a unified FENZ blue header. Includes `/availability`, `/offers`, `/confirmed`, and `/profile`.

---

## The Offer/Rejection API Wrapper (`/api/allocate/route.ts`)
1. **Offer Generation:** The API wrapper catches the engine's output and writes to `ot_offers` with a status of `sent` and a 2-hour deadline. It saves the engine's math (`cascadePhase`, `distance_km`, `must_might_wont`) into a JSON `metadata` column.
2. **Exclusion Maps:** The API pulls all existing pending/declined offers for a specific date and passes them to the engine as `requestExclusions`. The engine silently skips FFs who have already rejected a shift.
3. **OT Counter Protection:** The engine API *never* increments `firefighters.ot_count_*`. Counters are strictly incremented only when an offer is formally accepted.

---

## Smart Distance Logic (PWA Availability)
The PWA `/availability` page features a "Smart Distance" algorithm. When a Firefighter selects a station in their home district, the UI automatically toggles all stations that are *closer* to their home station. This enforces fairness and prevents cherry-picking distant stations while ignoring local shortages. These choices are saved in `availability.preferences`.

---

## UI Audit Trail (`(manage)/filled`)
The Filled page provides absolute transparency into the engine's decisions using a decoupled visual architecture.
1. **Decoupled Visual Order:** The UI strictly forces the tables to render by Target Rank (FF slots grouped together at the top, SSO slots at the bottom).
2. **Absolute Mathematical Fidelity:** The UI calculates the Audit Trail by passing the candidate through the exact same `computeMustMightWonThreshold` and `matchesGroupRules` algorithms used by the backend.