# FENZ OT — Critical Bug Fixes

## Bugs to fix:

### 1. OOD/SO/SSO cascade phases ignore watch eligibility (CRITICAL)
Currently, `buildCascadePool` only checks watch math for `callback` and `non-callback` phases. The `out-of-district`, `SO`, and `SSO` phases don't check if the firefighter's watch is eligible for OT on this date/shift.

**Evidence:** Priya Sharma (Red, #3-AfterLastNight = night-only callback) was assigned to Silverdale Day shift via `out-of-district`. Dan Reid & Grace Whittaker (Brown, #2a-EveningDay2 = excludes Day) were assigned to Takapuna Day.

**Fix:** Add a `canDoOT(ff, otDate, requestShiftType)` helper that encapsulates ALL watch-eligibility logic (leave check, callback exclusion, shift mismatch). Use it in ALL five cascade phases, not just callback/non-callback.

### 2. OT counters need separate callback/non-callback tracking
Currently only `ot_count_days` and `ot_count_nights` exist. Callback OT and non-callback OT should be tracked separately because they count against different callback limits.

**Fix:** Add `ot_count_callback_days`, `ot_count_callback_nights`, `ot_count_noncallback_days`, `ot_count_noncallback_nights` to the DB (as new columns). Update the `assignFromPool` function to increment the correct counter based on `pool.phase`.

### 3. Dashboard: Show qualifications + OOD counters + sort by priority
- Firefighter roster needs to show `qualifications` (as badge tags)
- Show both callback and non-callback OT counters separately (e.g., "3d/1n CB | 5d/2n NC")
- Sort the roster: assigned first, sorted by cascade phase priority (callback → non-callback → OOD → SO → SSO), then within each phase by OT count ascending

## Files to modify:
1. `src/engine/allocation-engine.ts` — Add `canDoOT` guard to all phases, update counter incrementing
2. `src/app/api/test/route.ts` — Update API response to include quals + separate counters + sorted roster
3. `src/app/dashboard/page.tsx` — Update UI to show quals + separate counters
4. DB migration — Add new counter columns if needed

## DB columns to add (via migration):
```sql
ALTER TABLE firefighters 
  ADD COLUMN IF NOT EXISTS ot_count_callback_days INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot_count_callback_nights INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot_count_noncallback_days INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ot_count_noncallback_nights INT DEFAULT 0;
```

## `canDoOT` spec:
```typescript
function canDoOT(ff: Firefighter, otDate: Date, requestShiftType: ShiftType): { pass: boolean; reason: string } {
  // 1. On leave → false
  // 2. #3-AfterLastNight on Day shift → false (night only)
  // 3. #2a-EveningDay2 on Day shift → false (excludes Day)  
  // 4. #2b-DayOfNight1 on Day shift → false (night only)
  // 5. callback + regular working shift mismatch → false
  // 6. Otherwise true (wants_to_work flags checked separately by each phase)
}
```

This is essentially a superset of the logic already in `passesCallbackFilter` and `passesNonCallbackFilter` — extract the common eligibility check and use it universally.
