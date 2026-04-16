// FENZ Overtime Allocation Engine — Full Spec Implementation
//
// CASCADING ALLOCATION — FIREFIGHTER OT (8 phases):
// Phase 1: In-district FF callback
// Phase 2: In-district FF non-callback
// Phase 3: Nearest out-of-district FF callback
// Phase 4: Nearest out-of-district FF non-callback
// Phase 5: SO anywhere callback
// Phase 6: SSO anywhere callback
// Phase 7: SO anywhere non-callback
// Phase 8: SSO anywhere non-callback
//
// FF ranks: FF, QFF, SFF (phases 1-4)
// Officer ranks: SO (phases 5,7), SSO (phases 6,8)
//
// OT counters per firefighter: callback_days, callback_nights, noncallback_days, noncallback_nights
// Sort within each phase: threshold → lowest relevant OT count → nearest distance

import { Pool } from 'pg';
import { getShift, getCallbackType, getShiftStatus } from './watch-math';

// ============================================================
// Types
// ============================================================

export type Watch = 'Green' | 'Red' | 'Brown' | 'Blue' | 'Yellow';
export type ShiftType = 'Day' | 'Night';
export type Rank = 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
export type MustMightWont = 'must' | 'might' | 'locked_out' | 'won_t';
export type CallbackType = '#1-BeforeDay1' | '#2a-EveningDay2' | '#2b-DayOfNight1' | '#3-AfterLastNight' | null;
export type CascadePhase = 'ff-callback' | 'ff-noncallback' | 'ood-ff-callback' | 'ood-ff-noncallback' | 'so-callback' | 'sso-callback' | 'so-noncallback' | 'sso-noncallback';

export interface Firefighter {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  station_id: number;
  station_name: string;
  district: string | null;
  area_id: number;
  area_name: string;
  watch: Watch;
  rank: Rank;
  ot_count_days: number;
  ot_count_nights: number;
  ot_count_callback_days: number;
  ot_count_callback_nights: number;
  ot_count_noncallback_days: number;
  ot_count_noncallback_nights: number;
  qualifications: Record<string, boolean>;
  is_active: boolean;
  want_to_work_day: boolean;
  want_to_work_night: boolean;
  total_ot_count: number;
}

export interface OTRequest {
  id: number;
  station_id: number;
  station_name: string;
  station_district: string | null;
  area_id: number;
  date: string;
  shift_type: ShiftType;
  specialist_type: string | null;
  required_qualification_ids: string[];
  status: string;
  number_of_slots: number;
  number_filled: number;
}

export interface DistanceMatrix {
  [fromStationId: number]: { [toStationId: number]: number };
}

export interface AllocationResult {
  ot_request_id: number;
  assignment_id: number;
  firefighter_id: number;
  firefighter_name: string;
  watch: string;
  rank: string;
  distance_km: number;
  callback_type: CallbackType;
  must_might_wont: MustMightWont;
  hours_allocated: number;
  cascade_phase: CascadePhase;
}

export interface AllocationRunSummary {
  run_id: number;
  started_at: string;
  completed_at: string;
  total_assigned: number;
  total_unfilled: number;
  results: AllocationResult[];
  specialistPulls: number;
}

// ============================================================
// Database Helpers
// ============================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function dbExecute(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (e: any) {
    console.error('dbExecute FAILED:', e.message);
    console.error('  SQL:', text.substring(0, 200));
    console.error('  Params:', params);
    throw e;
  }
}

// ============================================================
// Data Loading
// ============================================================

export async function loadAllFirefighters(): Promise<Firefighter[]> {
  const { rows } = await dbExecute(`
    SELECT f.*, s.name as station_name, s.area_id, a.name as district
    FROM firefighters f
    LEFT JOIN stations s ON f.station_id = s.id
    LEFT JOIN areas a ON s.area_id = a.id
    WHERE f.is_active = true
  `);
  return rows.map((r: any) => ({
    ...r,
    total_ot_count: (r.ot_count_days || 0) + (r.ot_count_nights || 0),
    qualifications: typeof r.qualifications === 'string' ? JSON.parse(r.qualifications) : r.qualifications || {},
    want_to_work_day: r.want_to_work_day !== false,
    want_to_work_night: r.want_to_work_night !== false,
    ot_count_callback_days: r.ot_count_callback_days || 0,
    ot_count_callback_nights: r.ot_count_callback_nights || 0,
    ot_count_noncallback_days: r.ot_count_noncallback_days || 0,
    ot_count_noncallback_nights: r.ot_count_noncallback_nights || 0,
    ot_count_days: r.ot_count_days || 0,
    ot_count_nights: r.ot_count_nights || 0,
  }));
}

export async function loadPendingOTRequests(): Promise<OTRequest[]> {
  const { rows } = await dbExecute(`
    SELECT otr.*, s.name as station_name, s.area_id, a.name as station_district
    FROM ot_requests otr
    LEFT JOIN stations s ON otr.station_id = s.id
    LEFT JOIN areas a ON s.area_id = a.id
    WHERE otr.status = 'pending' AND otr.number_filled < otr.number_of_slots
    ORDER BY otr.date ASC, otr.id ASC
  `);
  return rows.map((r: any) => ({
    ...r,
    required_qualification_ids: typeof r.required_qualification_ids === 'string'
      ? JSON.parse(r.required_qualification_ids) : r.required_qualification_ids || [],
  }));
}

export async function loadDistanceMatrix(): Promise<DistanceMatrix> {
  const { rows } = await dbExecute(`SELECT station_id, other_station_id, distance_km FROM station_distances`);
  const matrix: DistanceMatrix = {};
  for (const r of rows) {
    if (!matrix[r.station_id]) matrix[r.station_id] = {};
    matrix[r.station_id][r.other_station_id] = r.distance_km;
  }
  return matrix;
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  return matrix[fromStationId]?.[toStationId] ?? 999;
}

// ============================================================
// Qualification Checking
// ============================================================

export function checkQualifications(ff: Firefighter, requiredQualIds: string[], specialistType: string | null): boolean {
  for (const req of requiredQualIds) {
    if (!ff.qualifications[req]) return false;
  }
  if (specialistType && !ff.qualifications[specialistType]) return false;
  return true;
}

// ============================================================
// UNIVERSAL Watch Eligibility Guard (applies to ALL phases)
// ============================================================

export function canDoOT(ff: Firefighter, otDate: Date, requestShiftType: ShiftType): { pass: boolean; reason: string } {
  const shiftInfo = getShiftStatus(ff.watch, otDate);
  if (shiftInfo.includes('On Leave')) return { pass: false, reason: 'On Leave' };

  const shift = getShift(ff.watch, otDate);
  const callback = getCallbackType(ff.watch, otDate);

  // Callback exclusions (apply regardless of phase)
  if (callback === '#2a-EveningDay2' && requestShiftType === 'Day') return { pass: false, reason: '#2a-EveningDay2 excludes Day' };
  if (callback === '#3-AfterLastNight' && requestShiftType === 'Day') return { pass: false, reason: '#3-AfterLastNight is Night-only' };
  if (callback === '#2b-DayOfNight1' && requestShiftType === 'Day') return { pass: false, reason: '#2b-DayOfNight1 is Night-only' };

  // Regular working shift mismatch (not callback, but on a working shift opposite to requested)
  if (!callback && shift !== 'Off') {
    if (requestShiftType === 'Day' && shift === 'Night') return { pass: false, reason: 'Night shift (no callback)' };
    if (requestShiftType === 'Night' && shift === 'Day') return { pass: false, reason: 'Day shift (no callback)' };
  }
  // Off-duty with no callback = eligible for non-callback OT (completely free)

  return { pass: true, reason: 'Watch-eligible' };
}

// ============================================================
// Must / Might / Won't Threshold Calculation
// ============================================================

export function computeMustMightWonThreshold(candidates: Firefighter[], availableSlots: number, distances?: Record<number, number>): Map<number, MustMightWont> {
  const result = new Map<number, MustMightWont>();
  if (candidates.length === 0) return result;

  const sorted = [...candidates].sort((a, b) => a.total_ot_count - b.total_ot_count);
  const groups = new Map<number, Firefighter[]>();
  for (const ff of sorted) {
    if (!groups.has(ff.total_ot_count)) groups.set(ff.total_ot_count, []);
    groups.get(ff.total_ot_count)!.push(ff);
  }

  let cumulative = 0;
  let allRemainingAreWonT = false;

  for (const [, group] of groups) {
    if (allRemainingAreWonT) {
      for (const ff of group) result.set(ff.id, 'won_t');
      continue;
    }
    // Sort within group by distance when available (closest first)
    if (distances) {
      group.sort((a, b) => (distances[a.id] ?? 999) - (distances[b.id] ?? 999));
    }
    const newCumulative = cumulative + group.length;
    if (newCumulative <= availableSlots) {
      for (const ff of group) result.set(ff.id, 'must');
      cumulative = newCumulative;
    } else {
      const slotsRemaining = availableSlots - cumulative;
      for (let i = 0; i < group.length; i++) {
        if (i < slotsRemaining) result.set(group[i].id, 'might');
        else result.set(group[i].id, 'locked_out');
      }
      cumulative = availableSlots;
      allRemainingAreWonT = true;
    }
  }
  return result;
}

// ============================================================
// Phase 1: Callback filter
// ============================================================

function passesCallbackFilter(ff: Firefighter, otDate: Date, requestShiftType: ShiftType): { pass: boolean; reason: string } {
  const shiftInfo = getShiftStatus(ff.watch, otDate);
  if (shiftInfo.includes('On Leave')) return { pass: false, reason: 'On Leave' };

  const shift = getShift(ff.watch, otDate);
  const callback = getCallbackType(ff.watch, otDate);

  if (shift === 'Off' && !callback) return { pass: false, reason: 'Off, no callback' };
  if (callback === '#2a-EveningDay2' && requestShiftType === 'Day') return { pass: false, reason: '#2a excluded for Day shift' };
  if (requestShiftType === 'Day' && callback === '#3-AfterLastNight') return { pass: false, reason: '#3 is Night-only' };
  if (requestShiftType === 'Day' && callback === '#2b-DayOfNight1') return { pass: false, reason: '#2b is Night-only' };
  if (requestShiftType === 'Day' && shift === 'Night') return { pass: false, reason: 'Night shift, not Day' };
  if (requestShiftType === 'Night' && shift === 'Day' && !callback) return { pass: false, reason: 'Day shift, not Night' };
  if (!callback && shift !== 'Off') return { pass: false, reason: 'Regular working shift, no callback' };

  return { pass: true, reason: 'Eligible via callback or working shift' };
}

// ============================================================
// Phase 2: Non-callback filter (Waitemata only, working shift, wants OT)
// ============================================================

function passesNonCallbackFilter(ff: Firefighter, otDate: Date, requestShiftType: ShiftType): { pass: boolean; reason: string } {
  const shiftInfo = getShiftStatus(ff.watch, otDate);
  if (shiftInfo.includes('On Leave')) return { pass: false, reason: 'On Leave' };

  const shift = getShift(ff.watch, otDate);
  const callback = getCallbackType(ff.watch, otDate);

  if (callback) return { pass: false, reason: 'Already in callback pool' };

  if (requestShiftType === 'Day' && shift === 'Day') {
    if (ff.want_to_work_day) return { pass: true, reason: 'Day shift, wants to work' };
    return { pass: false, reason: "Doesn't want Day work" };
  }
  if (requestShiftType === 'Night' && shift === 'Night') {
    if (ff.want_to_work_night) return { pass: true, reason: 'Night shift, wants to work' };
    return { pass: false, reason: "Doesn't want Night work" };
  }
  if (shift === 'Off') return { pass: true, reason: 'Off duty, available for OT' };
  return { pass: false, reason: `${shift} shift, need ${requestShiftType}` };
}

// ============================================================
// Phase 4/5: Rank-based filter (SO/SSO any watch, any shift)
// ============================================================

function passesRankFilter(ff: Firefighter, otDate: Date, requestShiftType: ShiftType, requiredRank: Rank): { pass: boolean; reason: string } {
  // Universal watch eligibility — prevents Red/Brown from getting Day OT when excluded
  const watchCheck = canDoOT(ff, otDate, requestShiftType);
  if (!watchCheck.pass) return { pass: false, reason: watchCheck.reason };
  if (ff.rank !== requiredRank) return { pass: false, reason: `Rank ${ff.rank}, need ${requiredRank}` };
  if (requestShiftType === 'Day' && !ff.want_to_work_day) return { pass: false, reason: "Doesn't want Day work" };
  if (requestShiftType === 'Night' && !ff.want_to_work_night) return { pass: false, reason: "Doesn't want Night work" };
  return { pass: true, reason: `${ff.rank} rank, wants ${requestShiftType} work` };
}

// ============================================================
// Cascade Pool Builder
// ============================================================

interface CascadePool {
  phase: CascadePhase;
  candidates: Firefighter[];
  distances: Record<number, number>;
  thresholds: Map<number, MustMightWont>;
  traceLog: TraceEntry[];
}

interface TraceEntry {
  type: 'header' | 'pass' | 'skip' | 'assign';
  message: string;
  detail?: string;
}

const FF_RANKS = new Set(['FF', 'QFF', 'SFF']);

function isFFRank(rank: string): boolean { return FF_RANKS.has(rank); }

function getRelevantOTCount(ff: Firefighter, isCallback: boolean, shiftType: ShiftType): number {
  if (isCallback) return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
}

function buildCascadePool(phase: CascadePhase, request: OTRequest, otDate: Date, allFirefighters: Firefighter[], assignedThisRun: Set<number>, distanceMatrix: DistanceMatrix, slotsRemaining: number): CascadePool {
  const traceLog: TraceEntry[] = [];
  let candidates: Firefighter[] = [];
  const reqDistrict = request.station_district || 'Waitemata';

  // Helper: common pre-checks
  function preCheck(ff: Firefighter, label: string): boolean {
    if (assignedThisRun.has(ff.id)) { traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: 'Already assigned' }); return false; }
    if (!checkQualifications(ff, request.required_qualification_ids, request.specialist_type)) { traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: 'Missing qualifications' }); return false; }
    return true;
  }

  // ─── Phase 1: In-district FF callback ───
  if (phase === 'ff-callback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 1: In-District FF Callback (${reqDistrict}) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P1')) return false;
      if (!isFFRank(ff.rank)) { traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.rank} (officer, skip)` }); return false; }
      if (ff.district !== reqDistrict) { traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.district} (not ${reqDistrict})` }); return false; }
      const r = passesCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.watch} | ${ff.station_name} | cb=${getCallbackType(ff.watch, otDate)} | CB_OT=${getRelevantOTCount(ff, true, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name} (${ff.watch})`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 2: In-district FF non-callback ───
  else if (phase === 'ff-noncallback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 2: In-District FF Non-Callback (${reqDistrict}) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P2')) return false;
      if (!isFFRank(ff.rank)) return false;
      if (ff.district !== reqDistrict) return false;
      const r = passesNonCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.watch} | ${ff.station_name} | NC_OT=${getRelevantOTCount(ff, false, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name} (${ff.watch})`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 3: Nearest OOD FF callback ───
  else if (phase === 'ood-ff-callback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 3: Out-of-District FF Callback (nearest) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P3')) return false;
      if (!isFFRank(ff.rank)) return false;
      if (ff.district === reqDistrict) return false; // must be OOD
      const r = passesCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.watch} | ${ff.district} | ${ff.station_name} | CB_OT=${getRelevantOTCount(ff, true, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name} (${ff.watch})`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 4: Nearest OOD FF non-callback ───
  else if (phase === 'ood-ff-noncallback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 4: Out-of-District FF Non-Callback (nearest) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P4')) return false;
      if (!isFFRank(ff.rank)) return false;
      if (ff.district === reqDistrict) return false;
      const r = passesNonCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `${ff.watch} | ${ff.district} | ${ff.station_name} | NC_OT=${getRelevantOTCount(ff, false, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name} (${ff.watch})`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 5: SO anywhere callback ───
  else if (phase === 'so-callback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 5: Station Officer Callback (anywhere) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P5')) return false;
      if (ff.rank !== 'SO') return false;
      const r = passesCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `SO | ${ff.watch} | ${ff.district} | CB_OT=${getRelevantOTCount(ff, true, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 6: SSO anywhere callback ───
  else if (phase === 'sso-callback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 6: Senior Station Officer Callback (anywhere) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P6')) return false;
      if (ff.rank !== 'SSO') return false;
      const r = passesCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `SSO | ${ff.watch} | ${ff.district} | CB_OT=${getRelevantOTCount(ff, true, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 7: SO anywhere non-callback ───
  else if (phase === 'so-noncallback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 7: Station Officer Non-Callback (anywhere) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P7')) return false;
      if (ff.rank !== 'SO') return false;
      const r = passesNonCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `SO | ${ff.watch} | ${ff.district} | NC_OT=${getRelevantOTCount(ff, false, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: r.reason });
      return r.pass;
    });
  }
  // ─── Phase 8: SSO anywhere non-callback ───
  else if (phase === 'sso-noncallback') {
    traceLog.push({ type: 'header', message: `━━━ Phase 8: Senior Station Officer Non-Callback (anywhere) ━━━` });
    candidates = allFirefighters.filter(ff => {
      if (!preCheck(ff, 'P8')) return false;
      if (ff.rank !== 'SSO') return false;
      const r = passesNonCallbackFilter(ff, otDate, request.shift_type);
      if (r.pass) traceLog.push({ type: 'pass', message: `${ff.first_name} ${ff.last_name}`, detail: `SSO | ${ff.watch} | ${ff.district} | NC_OT=${getRelevantOTCount(ff, false, request.shift_type)}` });
      else traceLog.push({ type: 'skip', message: `${ff.first_name} ${ff.last_name}`, detail: r.reason });
      return r.pass;
    });
  }

  const distances: Record<number, number> = {};
  for (const ff of candidates) distances[ff.id] = getDistance(ff.station_id, request.station_id, distanceMatrix);

  // Use relevant OT count for threshold calculation
  const isCallbackPhase = phase.includes('callback') && !phase.includes('noncallback');
  // Override total_ot_count with relevant counter for sorting
  const adjustedCandidates = candidates.map(ff => ({
    ...ff,
    total_ot_count: getRelevantOTCount(ff, isCallbackPhase, request.shift_type),
  }));
  const thresholds = computeMustMightWonThreshold(adjustedCandidates, slotsRemaining, distances);

  return { phase, candidates: adjustedCandidates, distances, thresholds, traceLog };
}

// ============================================================
// Assign from a cascade pool
// ============================================================

const thresholdOrder: Record<MustMightWont, number> = { must: 0, might: 1, locked_out: 2, won_t: 3 };

async function assignFromPool(pool: CascadePool, results: AllocationResult[], assignedThisRun: Set<number>, request: OTRequest, slotsToFill: number): Promise<{ count: number }> {
  const sorted = [...pool.candidates].sort((a, b) => {
    const aT = pool.thresholds.get(a.id) || 'won_t';
    const bT = pool.thresholds.get(b.id) || 'won_t';
    if (thresholdOrder[aT] !== thresholdOrder[bT]) return thresholdOrder[aT] - thresholdOrder[bT];
    if (a.total_ot_count !== b.total_ot_count) return a.total_ot_count - b.total_ot_count;
    return (pool.distances[a.id] ?? 999) - (pool.distances[b.id] ?? 999);
  });

  let filled = 0;
  for (const ff of sorted) {
    if (filled >= slotsToFill) break;
    const threshold = pool.thresholds.get(ff.id) || 'won_t';
    if (threshold === 'won_t' || threshold === 'locked_out') continue;

    const hours = request.shift_type === 'Day' ? 10 : 14;
    const callback = getCallbackType(ff.watch, new Date(request.date));

    pool.traceLog.push({ type: 'assign', message: `ASSIGNED: ${ff.first_name} ${ff.last_name}`, detail: `${ff.watch} | ${pool.phase} | threshold=${threshold} | distance=${pool.distances[ff.id]}km | OT=${ff.total_ot_count}` });

    const assignmentRes = await dbExecute(
      `INSERT INTO ot_assignments (ot_request_id, firefighter_id, status, distance_km, callback_type, must_might_wont, hours_allocated, assigned_at)
       VALUES ($1, $2, 'assigned', $3, CAST($4 AS varchar), $5, $6, NOW()) RETURNING id`,
      [request.id, ff.id, pool.distances[ff.id] ?? 0, callback || 'none', threshold, hours],
    );
    const assignmentId = assignmentRes.rows[0].id;

    // Track callback vs non-callback OT separately
    const isCallbackPhase = pool.phase.includes('callback') && !pool.phase.includes('noncallback');

    if (request.shift_type === 'Day') {
      await dbExecute(`UPDATE firefighters SET ot_count_days = ot_count_days + 1 WHERE id = $1`, [ff.id]);
      if (isCallbackPhase) {
        await dbExecute(`UPDATE firefighters SET ot_count_callback_days = ot_count_callback_days + 1 WHERE id = $1`, [ff.id]);
      } else {
        await dbExecute(`UPDATE firefighters SET ot_count_noncallback_days = ot_count_noncallback_days + 1 WHERE id = $1`, [ff.id]);
      }
      await dbExecute(`INSERT INTO ot_count_log (firefighter_id, counter_type, old_value, new_value, change_reason, related_ot_request_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [ff.id, isCallbackPhase ? 'callback_days' : 'noncallback_days',
         ff.ot_count_days, ff.ot_count_days + 1,
         `OT allocation: ${threshold} (${pool.phase})`, request.id]);
    } else {
      await dbExecute(`UPDATE firefighters SET ot_count_nights = ot_count_nights + 1 WHERE id = $1`, [ff.id]);
      if (isCallbackPhase) {
        await dbExecute(`UPDATE firefighters SET ot_count_callback_nights = ot_count_callback_nights + 1 WHERE id = $1`, [ff.id]);
      } else {
        await dbExecute(`UPDATE firefighters SET ot_count_noncallback_nights = ot_count_noncallback_nights + 1 WHERE id = $1`, [ff.id]);
      }
      await dbExecute(`INSERT INTO ot_count_log (firefighter_id, counter_type, old_value, new_value, change_reason, related_ot_request_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [ff.id, isCallbackPhase ? 'callback_nights' : 'noncallback_nights',
         ff.ot_count_nights, ff.ot_count_nights + 1,
         `OT allocation: ${threshold} (${pool.phase})`, request.id]);
    }

    await dbExecute(`INSERT INTO audit_logs (action, entity_type, entity_id, old_value, new_value, reason) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['ot_assignment', 'ot_request', request.id,
        JSON.stringify({ ff: ff.id, cascade_phase: pool.phase }),
        JSON.stringify({ counter_after: ff.ot_count_days + ff.ot_count_nights + 1 }),
        `${ff.first_name} ${ff.last_name} assigned to ${request.shift_type} OT via ${pool.phase}`]);

    results.push({
      ot_request_id: request.id,
      assignment_id: assignmentId,
      firefighter_id: ff.id,
      firefighter_name: `${ff.first_name} ${ff.last_name}`,
      watch: ff.watch, rank: ff.rank,
      distance_km: pool.distances[ff.id] ?? 0,
      callback_type: callback,
      must_might_wont: threshold,
      hours_allocated: hours,
      cascade_phase: pool.phase,
    });

    assignedThisRun.add(ff.id);
    filled++;
  }

  pool.traceLog.push({ type: 'header', message: `${filled} assigned from ${pool.phase} (${slotsToFill - filled} remaining)` });
  return { count: filled };
}

// ============================================================
// Core Allocation — Cascading
// ============================================================

export async function allocateForOTRequest(request: OTRequest, allFirefighters: Firefighter[], distanceMatrix: DistanceMatrix, assignedThisRun: Set<number>): Promise<{ results: AllocationResult[]; allTraces: CascadePool[] }> {
  const results: AllocationResult[] = [];
  let slotsToFill = request.number_of_slots - request.number_filled;
  if (slotsToFill <= 0) return { results, allTraces: [] };

  const rawDate = request.date as unknown;
  let otDate: Date;
  if (typeof rawDate === 'string') {
    const [y, mo, d] = rawDate.split('-').map(Number);
    otDate = new Date(Date.UTC(y, mo - 1, d));
  } else if (rawDate instanceof Date) {
    otDate = new Date(Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate()));
  } else {
    return { results, allTraces: [] };
  }

  const allTraces: CascadePool[] = [];
  const phases: CascadePhase[] = [
    'ff-callback',       // Phase 1: In-district FF callback
    'ff-noncallback',    // Phase 2: In-district FF non-callback
    'ood-ff-callback',   // Phase 3: OOD FF callback (nearest)
    'ood-ff-noncallback',// Phase 4: OOD FF non-callback (nearest)
    'so-callback',       // Phase 5: SO anywhere callback
    'sso-callback',      // Phase 6: SSO anywhere callback
    'so-noncallback',    // Phase 7: SO anywhere non-callback
    'sso-noncallback',   // Phase 8: SSO anywhere non-callback
  ];

  for (const phase of phases) {
    if (slotsToFill <= 0) break;
    const pool = buildCascadePool(phase, request, otDate, allFirefighters, assignedThisRun, distanceMatrix, slotsToFill);
    const result = await assignFromPool(pool, results, assignedThisRun, request, slotsToFill);
    allTraces.push(pool);
    slotsToFill -= result.count;
  }

  if (results.length > 0) {
    await dbExecute(`UPDATE ot_requests SET number_filled = $1, status = CASE WHEN $1::int >= $2::int THEN 'filled' ELSE status END WHERE id = $3`,
      [results.length, request.number_of_slots, request.id]);
  }

  return { results, allTraces };
}

// ============================================================
// Specialist Station Enforcement
// ============================================================

export async function checkAndFillSpecialistStations(allFirefighters: Firefighter[], distanceMatrix: DistanceMatrix, assignedThisRun: Set<number>): Promise<AllocationResult[]> {
  const pulls: AllocationResult[] = [];
  const { rows: specStations } = await dbExecute(`SELECT id, name, specialist_type FROM stations WHERE is_specialist = true`);

  for (const station of specStations) {
    const { rows: uncovered } = await dbExecute(`SELECT * FROM ot_requests WHERE station_id = $1 AND status = 'pending' AND number_filled < number_of_slots LIMIT 1`, [station.id]);
    if (uncovered.length === 0) continue;

    const qualifiedAnywhere = allFirefighters.filter(ff => !assignedThisRun.has(ff.id) && checkQualifications(ff, [], station.specialist_type));
    if (qualifiedAnywhere.length === 0) continue;

    const sorted = qualifiedAnywhere.sort((a, b) => {
      if (a.total_ot_count !== b.total_ot_count) return a.total_ot_count - b.total_ot_count;
      return (distanceMatrix[a.station_id]?.[station.id] ?? 999) - (distanceMatrix[b.station_id]?.[station.id] ?? 999);
    });

    const pulled = sorted[0];
    if (!pulled) continue;

    const request = uncovered[0];
    const { results } = await allocateForOTRequest(request, allFirefighters, distanceMatrix, assignedThisRun);
    pulls.push(...results);
  }

  return pulls;
}

// ============================================================
// Full Allocation Run — Orchestrator
// ============================================================

export async function runFullAllocation(): Promise<AllocationRunSummary> {
  const runRes = await dbExecute(`INSERT INTO allocation_runs (run_at, status, description) VALUES (NOW(), 'running', 'Full allocation run') RETURNING id`);
  const runId = runRes.rows[0].id;
  const startedAt = new Date().toISOString();

  const allFirefighters = await loadAllFirefighters();
  const distanceMatrix = await loadDistanceMatrix();
  const pendingRequests = await loadPendingOTRequests();

  const assignedThisRun = new Set<number>();
  const allResults: AllocationResult[] = [];
  let specialistPulls = 0;

  for (const request of pendingRequests) {
    const { results } = await allocateForOTRequest(request, allFirefighters, distanceMatrix, assignedThisRun);
    allResults.push(...results);
  }

  const pulls = await checkAndFillSpecialistStations(allFirefighters, distanceMatrix, assignedThisRun);
  specialistPulls = pulls.length;
  allResults.push(...pulls);

  const completedAt = new Date().toISOString();
  const filled = allResults.length;
  const unfilled = pendingRequests.reduce((sum, r) => sum + (r.number_of_slots - r.number_filled), 0) - filled;

  await dbExecute(`UPDATE allocation_runs SET status = 'completed', total_allocated = $1, total_unfilled = $2, duration_ms = $3 WHERE id = $4`,
    [filled, Math.max(0, unfilled), Date.now() - new Date(startedAt).getTime(), runId]);

  return { run_id: runId, started_at: startedAt, completed_at: completedAt, total_assigned: filled, total_unfilled: Math.max(0, unfilled), results: allResults, specialistPulls };
}
