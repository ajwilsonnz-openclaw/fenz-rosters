// ============================================================
// FENZ Overtime — Watch Mathematics Engine
// Computes shifts, callbacks, leave deterministically from anchor dates
// ============================================================

export type Watch = 'Green' | 'Red' | 'Brown' | 'Blue' | 'Yellow';
export type ShiftType = 'Day' | 'Night' | 'Off';
export type CallbackType = '#1-BeforeDay1' | '#2a-EveningDay2' | '#2b-DayOfNight1' | '#3-AfterLastNight' | null;

// All dates are parsed as NZ midnight (yyyy-mm-dd in local NZ time)
const ANCHORS: Record<Exclude<Watch, 'Yellow'>, string> = {
  Green: '2026-01-31',
  Red:   '2026-02-02',
  Brown: '2026-02-04',
  Blue:  '2026-02-06',
};

const CYCLE: ShiftType[] = ['Day', 'Day', 'Night', 'Night', 'Off', 'Off', 'Off', 'Off'];

function parseLocalDate(s: string): Date {
  // Parse as UTC, but treat the date string as NZ local date
  // This gives us the calendar date without timezone interference
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns the cycle index (0-7) for a given watch and date.
 * For Yellow: returns -1 (not in cycle).
 */
export function getCycleIndex(watch: Watch, date: Date): number {
  if (watch === 'Yellow') return -1;
  const anchor = parseLocalDate(ANCHORS[watch]);
  return ((daysBetween(anchor, date) % 8) + 8) % 8; // Handle negative diffs
}

/**
 * Returns shift type (Day/Night/Off) for a given watch and date.
 * Yellow: Mon-Fri → Day (simplified — actual day/night assignment TBD)
 *          Sat/Sun → Off (but eligible for OT)
 */
export function getShift(watch: Watch, date: Date): ShiftType {
  if (watch === 'Yellow') {
    const dow = date.getUTCDay();
    return dow >= 1 && dow <= 5 ? 'Day' : 'Off';
  }
  const idx = getCycleIndex(watch, date);
  return CYCLE[idx];
}

/**
 * Determine callback type for a watch on a given date.
 * Returns null if not a callback date.
 * 
 * Callback rules (relative to Day 1):
 * #1 = day before Day 1
 * #2a = evening of Day 2 (same calendar day as Day 2)
 * #2b = day of Night 1 (same calendar day as N1 starts)
 * #3 = night after last night (evening of Night 2's day)
 * 
 * Only ONE of #2a or #2b per cycle (to stay within 24h).
 */
export function getCallbackType(watch: Watch, date: Date): CallbackType {
  if (watch === 'Yellow') return null; // Yellow callbacks handled separately
  const idx = getCycleIndex(watch, date);
  
  switch (idx) {
    case 7: // Off 4 — this is the day before Day 1 → Callback #1
      return '#1-BeforeDay1';
    case 1: // Day 2 → Callback #2a (evening of Day 2)
      return '#2a-EveningDay2';
    case 2: // Night 1 → Callback #2b (day of Night 1)
      return '#2b-DayOfNight1';
    case 3: // Night 2 → Callback #3 (night after last night)
      return '#3-AfterLastNight';
    default:
      return null;
  }
}

/**
 * Check if a date is a callback opportunity for a watch.
 */
export function isCallback(watch: Watch, date: Date): boolean {
  return getCallbackType(watch, date) !== null;
}

/**
 * Check if a firefighter is on leave on a given date.
 * Leave: 10 cycles × 16 days = 160-day full cycle.
 * Leave 1 starts on the anchor date for each watch.
 */
export function isOnLeave(watch: Watch, date: Date, leaveNumber?: number): boolean {
  if (watch === 'Yellow') return false; // TBD
  const anchor = parseLocalDate(ANCHORS[watch]);
  const days = daysBetween(anchor, date);
  const cyclePos = ((days % 160) + 160) % 160;
  return cyclePos < 16; // First 16 days of each 160-day cycle = leave
}

/**
 * Get the current leave number (1-10) for a watch on a given date.
 */
export function getLeaveNumber(watch: Watch, date: Date): number {
  if (watch === 'Yellow') return 1; // TBD
  const anchor = parseLocalDate(ANCHORS[watch]);
  const days = daysBetween(anchor, date);
  const cyclePos = ((days % 160) + 160) % 160;
  return Math.floor(cyclePos / 16) + 1;
}

/**
 * Check if a firefighter is eligible for OT on a given date.
 * Must NOT be: on leave, on a working day that would exceed 24h
 */
export function isEligibleForOT(
  watch: Watch,
  date: Date,
): boolean {
  if (isOnLeave(watch, date)) return false;
  // Additional 24h compliance checks happen at allocation time
  // (need to know what other OTs this person is already assigned to)
  return true;
}

/**
 * Get all callback dates for a watch within a date range.
 */
export function getCallbackDates(
  watch: Watch,
  startDate: Date,
  endDate: Date,
): { date: Date; type: CallbackType }[] {
  const results: { date: Date; type: CallbackType }[] = [];
  const d = new Date(startDate.getTime());
  while (d <= endDate) {
    const cb = getCallbackType(watch, d);
    if (cb) {
      results.push({ date: new Date(d.getTime()), type: cb });
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return results;
}

/**
 * For the prototype: compute shift status for display.
 * Returns: "Day Shift", "Night Shift", "Off Duty", "On Leave", "Callback #[n]"
 */
export function getShiftStatus(watch: Watch, date: Date): string {
  if (isOnLeave(watch, date)) {
    const leaveNum = getLeaveNumber(watch, date);
    return `On Leave (Leave ${leaveNum})`;
  }
  
  const callback = getCallbackType(watch, date);
  const shift = getShift(watch, date);
  
  if (callback) {
    return `${shift} | Callback ${callback}`;
  }
  
  switch (shift) {
    case 'Day': return 'Day Shift';
    case 'Night': return 'Night Shift';
    case 'Off': return 'Off Duty';
  }
}
