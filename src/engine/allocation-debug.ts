// Allocation Debug Trace — step-by-step logging of the cascade engine

import { getShift, getCallbackType, isOnLeave, getShiftStatus } from './watch-math';
import type { Firefighter, OTRequest } from './allocation-engine';
import type { DistanceMatrix } from './allocation-engine';

type CascadePhase = 'ff-callback' | 'ff-noncallback' | 'ood-ff-callback' | 'ood-ff-noncallback' | 'so-callback' | 'sso-callback' | 'so-noncallback' | 'sso-noncallback';
type MustMightWont = 'must' | 'might' | 'wont';

export interface TraceStep {
  phase: CascadePhase | 'filter' | 'threshold' | 'assign' | 'summary';
  message: string;
  detail?: string;
  badge: 'info' | 'pass' | 'reject' | 'assign' | 'warn' | 'header';
  indent?: number;
}

export interface DebugTraceCandidate {
  id: number;
  name: string;
  watch: string;
  station: string;
  stationId: number;
  district: string | null;
  rank: string;
  otDays: number;
  otNights: number;
  totalOt: number;
  shift: string;
  callback: string | null;
  distance: number;
  threshold: string;
  qualifications: Record<string, boolean>;
  isAssigned: boolean;
  isEligible: boolean;
  cascadePhase: CascadePhase | null;
  filterReason: string;
}

export interface DebugTrace {
  steps: TraceStep[];
  candidates: DebugTraceCandidate[];
  summary: {
    totalCandidates: number;
    passedFilter: number;
    mustCount: number;
    mightCount: number;
    lockedOutCount: number;
    wontCount: number;
    assigned: number;
    slotsRequested: number;
    slotsFilled: number;
    slotsUnfilled: number;
    cascadePhasesUsed: CascadePhase[];
  };
}



/**
 * Build a full debug trace for an OT request, running every cascade phase.
 */
export async function buildCascadeDebugTrace(
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  request: { date: string; shift_type: 'Day' | 'Night'; station_id: number; number_of_slots: number },
): Promise<DebugTrace> {
  const steps: TraceStep[] = [];
  const candidates: DebugTraceCandidate[] = [];

  const rawDate = request.date as unknown;
  let otDate: Date;
  if (typeof rawDate === 'string') {
    const [y, mo, d] = rawDate.split('-').map(Number);
    otDate = new Date(Date.UTC(y, mo - 1, d));
  } else if (rawDate instanceof Date) {
    otDate = new Date(Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate()));
  } else {
    return createEmptyTrace();
  }

  // Header
  steps.push({ phase: 'summary', message: `━━━ OT Request: ${request.date} | ${request.shift_type} Shift | ${request.number_of_slots} slots ━━━`, badge: 'info' });

  // Phase definitions — same cascade order as engine
  const phases: CascadePhase[] = ['ff-callback', 'ff-noncallback', 'ood-ff-callback', 'ood-ff-noncallback', 'so-callback', 'sso-callback', 'so-noncallback', 'sso-noncallback'];
  let slotsRemaining = request.number_of_slots;
  const assignedIds = new Set<number>();

  for (const phase of phases) {
    if (slotsRemaining <= 0) {
      steps.push({ phase, message: `━━━ Phase ${phase.toUpperCase()} — SKIPPED (all slots filled) ━━━`, badge: 'info' });
      continue;
    }

    steps.push({ phase, message: `━━━ Phase: ${phase.toUpperCase()} ━━━`, badge: 'header' });

    // Filter by phase
    let eligible: Firefighter[] = [];
    const reasons = new Map<number, string>();

    for (const ff of allFirefighters) {
      if (assignedIds.has(ff.id)) {
        reasons.set(ff.id, 'Already assigned this run');
        continue;
      }

      const { pass, reason } = filterByPhase(ff, phase, otDate, request);
      if (pass) {
        eligible.push(ff);
        reasons.set(ff.id, '✅ Eligible');
      } else {
        reasons.set(ff.id, reason);
      }
    }

    steps.push({ phase, message: `Filtered: ${eligible.length} / ${allFirefighters.length} eligible`, badge: 'info', indent: 1 });

    // Show per-firefighter filter results
    const byPhase: Record<string, string[]> = {};
    for (const ff of allFirefighters) {
      const r = reasons.get(ff.id) || 'Unknown';
      const key = r.startsWith('✅') ? 'Eligible' : 'Excluded';
      if (!byPhase[key]) byPhase[key] = [];
      byPhase[key].push(`${ff.first_name} ${ff.last_name} (${ff.watch}) → ${r}`);
    }

    for (const ff of allFirefighters) {
      const distance = getDist(ff.station_id, request.station_id, distanceMatrix);
      const r = reasons.get(ff.id) || '';
      const isEligible = r.startsWith('✅');
      steps.push({
        phase,
        message: `${ff.first_name} ${ff.last_name}`,
        detail: `${ff.watch} | ${ff.station_name || 'Unknown'} | shift=${getShift(ff.watch as any, otDate)} | cb=${getCallbackType(ff.watch as any, otDate) || 'none'} | OT=${(ff.ot_count_days + ff.ot_count_nights)} | dist=${distance > 900 ? '???' : distance + 'km'} → ${r}`,
        badge: isEligible ? 'pass' : 'reject',
        indent: 1,
      });
    }

    if (eligible.length === 0) {
      steps.push({ phase, message: `No eligible candidates in phase ${phase}`, badge: 'warn', indent: 1 });
      continue;
    }

    // Compute Must/Might/Won't
    const thresholds = computeMustMightWonThreshold(eligible, slotsRemaining);
    for (const ff of eligible) {
      const t = thresholds.get(ff.id) || 'wont';
      const d = getDist(ff.station_id, request.station_id, distanceMatrix);
      candidates.push({
        id: ff.id,
        name: `${ff.first_name} ${ff.last_name}`,
        watch: ff.watch,
        station: ff.station_name || 'Unknown',
        stationId: ff.station_id,
        district: ff.district,
        rank: ff.rank,
        otDays: ff.ot_count_days,
        otNights: ff.ot_count_nights,
        totalOt: (ff.ot_count_days + ff.ot_count_nights),
        shift: getShift(ff.watch as any, otDate),
        callback: getCallbackType(ff.watch as any, otDate),
        distance: d,
        threshold: t,
        qualifications: ff.qualifications,
        isAssigned: false,
        isEligible: true,
        cascadePhase: phase,
        filterReason: reasons.get(ff.id) || '',
      });
    }

    // Sort: must → might → locked_out by threshold → OT → distance
    const thresholdOrder: Record<string, number> = { must: 0, might: 1, locked_out: 2, wont: 3 };
    const sorted = [...eligible].sort((a, b) => {
      const at = thresholds.get(a.id) || 'wont';
      const bt = thresholds.get(b.id) || 'wont';
      if (thresholdOrder[at] !== thresholdOrder[bt]) return thresholdOrder[at] - thresholdOrder[bt];
      if (a.ot_count_days + a.ot_count_nights !== b.ot_count_days + b.ot_count_nights) return (a.ot_count_days + a.ot_count_nights) - (b.ot_count_days + b.ot_count_nights);
      return (getDist(a.station_id, request.station_id, distanceMatrix)) - (getDist(b.station_id, request.station_id, distanceMatrix));
    });

    // Assign
    let assigned = 0;
    for (const ff of sorted) {
      if (assigned >= slotsRemaining) break;
      const t = thresholds.get(ff.id) || 'wont';
      if (t === 'wont') continue;

      const candidate = candidates.find(c => c.id === ff.id);
      if (candidate) candidate.isAssigned = true;

      steps.push({
        phase: 'assign',
        message: `✅ ASSIGNED: ${ff.first_name} ${ff.last_name}`,
        detail: `${ff.watch} | threshold=${t} | OT=${(ff.ot_count_days + ff.ot_count_nights)} | dist=${getDist(ff.station_id, request.station_id, distanceMatrix)}km | phase=${phase}`,
        badge: 'assign',
      });

      assignedIds.add(ff.id);
      assigned++;
      slotsRemaining--;
    }

    steps.push({ phase, message: `${assigned} assigned in phase ${phase} (${slotsRemaining} remaining)`, badge: assigned > 0 ? 'info' : 'warn', indent: 1 });
  }

  // Summary
  const assignedCount = candidates.filter(c => c.isAssigned).length;
  const mustCount = candidates.filter(c => c.threshold === 'must').length;
  const mightCount = candidates.filter(c => c.threshold === 'might').length;
  const lockedCount = candidates.filter(c => c.threshold === 'wont').length;
  const wontCount = candidates.filter(c => c.threshold === 'wont').length;

  steps.push({
    phase: 'summary',
    message: `━━━━━━━━ SUMMARY ━━━━━━━━`,
    detail: `Assigned: ${assignedCount}/${request.number_of_slots} | Must: ${mustCount} | Might: ${mightCount} | Locked: ${lockedCount} | Won't: ${wontCount} | Remaining: ${slotsRemaining}`,
    badge: 'info',
  });

  return {
    steps,
    candidates,
    summary: {
      totalCandidates: allFirefighters.length,
      passedFilter: candidates.length,
      mustCount,
      mightCount,
      lockedOutCount: lockedCount,
      wontCount,
      assigned: assignedCount,
      slotsRequested: request.number_of_slots,
      slotsFilled: assignedCount,
      slotsUnfilled: request.number_of_slots - assignedCount,
      cascadePhasesUsed: [...new Set(candidates.map(c => c.cascadePhase).filter(Boolean))] as CascadePhase[],
    },
  };
}

function filterByPhase(
  ff: Firefighter,
  phase: CascadePhase,
  otDate: Date,
  request: { date: string; shift_type: 'Day' | 'Night' },
): { pass: boolean; reason: string } {
  const shiftInfo = getShiftStatus(ff.watch as any, otDate);
  if (shiftInfo.includes('On Leave')) return { pass: false, reason: 'On Leave' };

  const shift = getShift(ff.watch as any, otDate);
  const callback = getCallbackType(ff.watch as any, otDate);

  if ((phase as string) === 'callback') {
    if (shift === 'Off' && !callback) return { pass: false, reason: 'Off, no callback' };
    if (callback === '#2a-EveningDay2' && request.shift_type === 'Day') return { pass: false, reason: '#2a excluded for Day shift' };
    if (request.shift_type === 'Day' && callback === '#3-AfterLastNight') return { pass: false, reason: '#3 is Night-only' };
    if (request.shift_type === 'Day' && callback === '#2b-DayOfNight1') return { pass: false, reason: '#2b is Night-only' };
    if (request.shift_type === 'Day' && shift === 'Night') return { pass: false, reason: 'Night shift, not Day' };
    if (request.shift_type === 'Night' && shift === 'Day' && !callback) return { pass: false, reason: 'Day shift, not Night' };
    if (!callback && shift !== 'Off') return { pass: false, reason: 'Regular working shift, no callback' };
    return { pass: true, reason: 'Eligible via callback or working shift' };
  }

  if ((phase as string) === 'non-callback') {
    if (callback) return { pass: false, reason: 'Already in callback pool' };
    if (ff.district !== 'Waitemata') return { pass: false, reason: `Not Waitemata (${ff.district})` };
    if (request.shift_type === 'Day' && shift === 'Day') {
      if (ff.want_to_work_day) return { pass: true, reason: 'Day shift, wants work' };
      return { pass: false, reason: 'Day shift, does not want work' };
    }
    if (request.shift_type === 'Night' && shift === 'Night') {
      if (ff.want_to_work_night) return { pass: true, reason: 'Night shift, wants work' };
      return { pass: false, reason: 'Night shift, does not want work' };
    }
    return { pass: false, reason: `Wrong shift (${shift})` };
  }

  if ((phase as string) === 'out-of-district') {
    if (ff.district === 'Waitemata') return { pass: false, reason: 'Waitemata (check non-callback first)' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Day shift, does not want work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Night shift, does not want work' };
    return { pass: true, reason: 'Out-of-district, wants work' };
  }

  if ((phase as string) === 'SO') {
    if (ff.rank !== 'SO') return { pass: false, reason: 'Not SO rank' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Does not want Day work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Does not want Night work' };
    return { pass: true, reason: 'SO rank, wants work' };
  }

  if ((phase as string) === 'SSO') {
    if (ff.rank !== 'SSO') return { pass: false, reason: 'Not SSO rank' };
    if (request.shift_type === 'Day' && !ff.want_to_work_day) return { pass: false, reason: 'Does not want Day work' };
    if (request.shift_type === 'Night' && !ff.want_to_work_night) return { pass: false, reason: 'Does not want Night work' };
    return { pass: true, reason: 'SSO rank, wants work' };
  }

  return { pass: false, reason: 'Unknown phase' };
}

function computeMustMightWonThreshold(
  candidates: Firefighter[],
  availableSlots: number,
): Map<number, MustMightWont> {
  const result = new Map<number, MustMightWont>();
  if (candidates.length === 0) return result;
  const sorted = [...candidates].sort((a, b) => (a.ot_count_days + a.ot_count_nights) - (b.ot_count_days + b.ot_count_nights));
  const groups = new Map<number, Firefighter[]>();
  for (const ff of sorted) {
    if (!groups.has((ff.ot_count_days + ff.ot_count_nights))) groups.set((ff.ot_count_days + ff.ot_count_nights), []);
    groups.get((ff.ot_count_days + ff.ot_count_nights))!.push(ff);
  }
  let cumulative = 0;
  let allRemainingAreWonT = false;
  for (const [, group] of groups) {
    if (allRemainingAreWonT) {
      for (const ff of group) result.set(ff.id, 'wont');
      continue;
    }
    const newCumulative = cumulative + group.length;
    if (newCumulative <= availableSlots) {
      for (const ff of group) result.set(ff.id, 'must');
      cumulative = newCumulative;
    } else {
      const slotsRemaining = availableSlots - cumulative;
      for (let i = 0; i < group.length; i++) {
        if (i < slotsRemaining) result.set(group[i].id, 'might');
        else result.set(group[i].id, 'wont');
      }
      cumulative = availableSlots;
      allRemainingAreWonT = true;
    }
  }
  return result;
}

function getDist(a: number, b: number, m: DistanceMatrix): number {
  return m[a]?.[b] ?? 999;
}

function createEmptyTrace(): DebugTrace {
  return {
    steps: [],
    candidates: [],
    summary: {
      totalCandidates: 0, passedFilter: 0, mustCount: 0, mightCount: 0,
      lockedOutCount: 0, wontCount: 0, assigned: 0, slotsRequested: 0,
      slotsFilled: 0, slotsUnfilled: 0, cascadePhasesUsed: [],
    },
  };
}
