import { Pool } from 'pg';
import { getShift, getCallbackType, isOnLeave } from './watch-math';
import { getPool } from '../lib/db';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Firefighter {
  id: number; first_name: string; last_name: string; station_id: number;
  station_name: string; district: string; area_id: number; watch: string;
  rank: 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
  qualifications: Record<string, boolean>; preferences: { districts: string[]; stations: string[] };
  want_to_work_day: boolean; want_to_work_night: boolean;
  ot_count_days: number; ot_count_nights: number;
  ot_count_callback_days: number; ot_count_callback_nights: number;
  ot_count_noncallback_days: number; ot_count_noncallback_nights: number;
  is_active: boolean;
}

export interface OTRequest {
  station_id: number; station_name: string; district: string;
  date: string; shift_type: 'Day' | 'Night'; slots: number; specialist_type: string | null;
}

export interface DistanceMatrix { [fromStationId: number]: { [toStationId: number]: number }; }

export interface Assignment {
  firefighter_id: number; firefighter_name: string; rank: string;
  home_station: string; distance: number; cascadePhase: string;
  otCount: number; threshold: 'must' | 'might' | 'wont';
  callback: string | null; qualifications: string[]; assignedAtBlock: number;
  assignedStation: string;
}

export interface AllocationResult {
  station_name: string; station_id: number; slots: number;
  specialist: string | null; assignedFirefighters: Assignment[]; phasesUsed: string[];
}

export interface TraceEntry {
  type: 'header' | 'info' | 'debug' | 'assign' | 'skip' | 'lost'; message: string; detail?: string;
}

// ─── Block Definitions ────────────────────────────────────────────────────────

interface BlockDef {
  id: number; phase: string;
  rankFilter: 'FF' | 'SO' | 'SSO' | 'FF+SO' | 'FF+SSO' | 'SO+SSO';
  inDistrict: boolean | 'any'; isCallback: boolean;
  otCounter: 'callback' | 'noncallback'; note: string;
}

const BLOCKS: BlockDef[] = [
  { id:1, phase:'ff-callback',       rankFilter:'FF',    inDistrict:true,  isCallback:true,  otCounter:'callback',    note:'In-district FF callback' },
  { id:2, phase:'ff-noncallback',    rankFilter:'FF',    inDistrict:true,  isCallback:false, otCounter:'noncallback', note:'In-district FF non-callback' },
  { id:3, phase:'ood-ff-callback',   rankFilter:'FF',    inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'Out-of-district FF callback' },
  { id:4, phase:'ood-ff-noncallback',rankFilter:'FF',    inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'Out-of-district FF non-callback' },
  { id:5, phase:'so-callback',       rankFilter:'FF+SO', inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'SO callback (all districts)' },
  { id:6, phase:'sso-callback',      rankFilter:'SO+SSO',inDistrict:'any', isCallback:true,  otCounter:'callback',    note:'SSO callback (all districts)' },
  { id:7, phase:'so-noncallback',    rankFilter:'FF+SO', inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'SO non-callback (all districts)' },
  { id:8, phase:'sso-noncallback',   rankFilter:'SO+SSO',inDistrict:'any', isCallback:false, otCounter:'noncallback', note:'SSO non-callback (all districts)' },
];

function getRank(ff: Firefighter): 'FF' | 'SO' | 'SSO' {
  if (ff.rank === 'SO') return 'SO';
  if (ff.rank === 'SSO') return 'SSO';
  return 'FF';
}

function rankMatchesFilter(rank: 'FF' | 'SO' | 'SSO', filter: BlockDef['rankFilter']): boolean {
  switch (filter) {
    case 'FF':    return rank === 'FF';
    case 'SO':    return rank === 'SO';
    case 'SSO':   return rank === 'SSO';
    case 'FF+SO': return rank === 'FF' || rank === 'SO';
    case 'FF+SSO':return rank === 'FF' || rank === 'SSO';
    case 'SO+SSO':return rank === 'SO' || rank === 'SSO';
  }
}

function getOTCount(ff: Firefighter, counter: 'callback' | 'noncallback', shiftType: 'Day' | 'Night'): number {
  if (counter === 'callback') return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
}

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' {
  return getShift(watch as any, new Date(dateStr));
}

export function getCallbackForWatch(watch: string, dateStr: string): string | null {
  return getCallbackType(watch as any, new Date(dateStr));
}

export function canDoOT(ff: Firefighter, dateStr: string, shiftType: 'Day' | 'Night'): { pass: boolean; reason: string } {
  const shift = getShiftForWatch(ff.watch, dateStr);
  if (shift === 'Off' && isOnLeave(ff.watch as any, new Date(dateStr))) return { pass: false, reason: 'On Leave' };
  const cb = getCallbackForWatch(ff.watch, dateStr);
  if (cb === '#3-AfterLastNight' && shiftType === 'Day') return { pass: false, reason: 'Between Nights Day OT excluded' };
  if (cb === '#2a-EveningDay2'    && shiftType === 'Day') return { pass: false, reason: '#2a EveningDay2 excludes Day' };
  if (cb === '#2b-DayOfNight1'    && shiftType === 'Day') return { pass: false, reason: '#2b DayOfNight1 excludes Day' };
  if (shift !== 'Off' && cb === null) {
    if (shiftType === 'Day'   && shift === 'Night') return { pass: false, reason: 'On Night shift' };
    if (shiftType === 'Night' && shift === 'Day')    return { pass: false, reason: 'On Day shift' };
  }
  return { pass: true, reason: 'Watch-eligible' };
}

function checkQualifications(ff: Firefighter, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) { if (!ff.qualifications[q]) return false; }
  return true;
}

function checkPreferences(ff: Firefighter, otStationName: string, otDistrict: string): boolean {
  const { districts, stations } = ff.preferences;
  if ((!districts?.length) && (!stations?.length)) return true;
  if (stations?.length > 0) return stations.includes(otStationName);
  if (districts?.length > 0) return districts.includes(otDistrict);
  return true;
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  const from = matrix[fromStationId];
  if (!from) return 999;
  return from[toStationId] ?? 999;
}

/**
 * Threshold: candidates sorted by OT count.
 * The first `slots` candidates get 'must'.
 * Any remaining slots (up to len-slots) get 'might'.
 * Beyond that: 'wont'.
 *
 * lowerPriorityAssigned: seats already taken by higher blocks — reduces
 * the effective slot pool for this block's threshold calculation.
 */
export function computeMustMightWonThreshold(
  candidates: { ff: Firefighter; distance: number; otCount: number }[],
  slots: number,
  lowerPriorityAssigned: number = 0,
): Map<number, 'must' | 'might' | 'wont'> {
  const result = new Map<number, 'must' | 'might' | 'wont'>();
  if (candidates.length === 0 || slots <= 0) return result;
  const sorted = [...candidates].sort((a, b) => {
    if (a.otCount !== b.otCount) return a.otCount - b.otCount;
    return a.distance - b.distance;
  });
  const effectiveSlots = Math.max(0, slots - lowerPriorityAssigned);
  const mustCount = effectiveSlots > 0 ? Math.min(effectiveSlots, sorted.length) : 0;
  for (let i = 0; i < sorted.length; i++) {
    const threshold: 'must' | 'might' | 'wont' =
      i < mustCount ? 'must' :
      i - mustCount < Math.max(0, slots - lowerPriorityAssigned - mustCount) ? 'might' :
      'wont';
    result.set(sorted[i].ff.id, threshold);
  }
  return result;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

export async function loadAllFirefighters(pool: Pool): Promise<Firefighter[]> {
  const rows = await pool.query<Record<string, unknown>>(
    `SELECT ff.id, ff.first_name, ff.last_name, ff.station_id, s.name AS station_name,
            s.area_id, a.name AS district, ff.watch, ff.rank, ff.qualifications,
            ff.preferences, ff.want_to_work_day, ff.want_to_work_night,
            ff.ot_count_days, ff.ot_count_nights,
            ff.ot_count_callback_days, ff.ot_count_callback_nights,
            ff.ot_count_noncallback_days, ff.ot_count_noncallback_nights,
            ff.is_active
     FROM firefighters ff
     JOIN stations s ON ff.station_id = s.id
     JOIN areas a ON s.area_id = a.id
     WHERE ff.is_active = true
     ORDER BY a.name, s.name, ff.last_name, ff.first_name`
  );
  return rows.rows.map(row => {
    const r = row as Record<string, unknown>;
    return {
      id:Number(r.id), first_name:String(r.first_name), last_name:String(r.last_name),
      station_id:Number(r.station_id), station_name:String(r.station_name),
      district:String(r.district), area_id:Number(r.area_id),
      watch:String(r.watch), rank:r.rank as Firefighter['rank'],
      qualifications:typeof r.qualifications==='string'?JSON.parse(r.qualifications):(r.qualifications||{}),
      preferences:typeof r.preferences==='string'?JSON.parse(r.preferences):(r.preferences||{districts:[],stations:[]}),
      want_to_work_day:Boolean(r.want_to_work_day), want_to_work_night:Boolean(r.want_to_work_night),
      ot_count_days:Number(r.ot_count_days), ot_count_nights:Number(r.ot_count_nights),
      ot_count_callback_days:Number(r.ot_count_callback_days), ot_count_callback_nights:Number(r.ot_count_callback_nights),
      ot_count_noncallback_days:Number(r.ot_count_noncallback_days), ot_count_noncallback_nights:Number(r.ot_count_noncallback_nights),
      is_active:Boolean(r.is_active),
    } as Firefighter;
  });
}

export async function loadDistanceMatrix(pool: Pool): Promise<DistanceMatrix> {
  const rows = await pool.query<{ station_id: number; distances: Record<string, number> }>(
    `SELECT station_id, distances FROM station_distances`
  );
  const matrix: DistanceMatrix = {};
  for (const row of rows.rows) {
    const distObj: Record<number, number> = {};
    for (const [k, v] of Object.entries(row.distances)) distObj[Number(k)] = Number(v);
    matrix[row.station_id] = distObj;
  }
  return matrix;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Allocation Engine v2 — Group/Global assignment per distance phase
//
// Key difference from v1:
//   - Candidates are collected for ALL stations at once (not per-station)
//   - Sorted by OT count globally
//   - Assigned in order: each FF takes their nearest AVAILABLE station
//     within their eligible set
//   - This enables cross-station coordination: a FF can "spill over"
//     to a distant station if their nearest is full, freeing up their
//     nearest for a higher-priority candidate
// ─────────────────────────────────────────────────────────────────────────────

export async function allocateForOTRequest(
  requests: OTRequest[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  existingAssigned: Set<number> = new Set(),
): Promise<AllocationResult[]> {
  // Map station_id → request for quick lookup
  const requestByStation = new Map<number, OTRequest>();
  for (const req of requests) requestByStation.set(req.station_id, req);

  // Track slots remaining per station
  const slotsRemaining: Record<number, number> = {};
  for (const req of requests) slotsRemaining[req.station_id] = req.slots;

  // Global assignment set: once an FF is assigned, they can't be reassigned
  const globalAssigned = new Set<number>(existingAssigned);

  // Per-station results
  const results: Map<number, AllocationResult> = new Map();
  for (const req of requests) {
    results.set(req.station_id, {
      station_name: req.station_name, station_id: req.station_id,
      slots: req.slots, specialist: req.specialist_type,
      assignedFirefighters: [], phasesUsed: [],
    });
  }

  // Determine max distance
  let maxDistance = 0;
  for (const from of Object.values(distanceMatrix)) {
    for (const km of Object.values(from)) {
      if (Number(km) > maxDistance) maxDistance = Number(km);
    }
  }

  // ── Per distance phase: collect ALL candidates across ALL stations
for (let dist = 0; dist <= maxDistance; dist++) {
  // Collect candidates at this distance for each (block, station) pair
  const candidatesByBlock = new Map<number, { ff: Firefighter; req: OTRequest; distance: number; otCount: number }[]>();

  for (const block of BLOCKS) {
    candidatesByBlock.set(block.id, []);
    for (const req of requests) {
      if (slotsRemaining[req.station_id] <= 0) continue;
      for (const ff of allFirefighters) {
        if (globalAssigned.has(ff.id)) continue;
        const shift = getShiftForWatch(ff.watch as any, req.date);
        const watchCb = getCallbackForWatch(ff.watch as any, req.date);
        if (block.isCallback) { if (!watchCb) continue; }
        else { if (watchCb) continue; }
        const eligible = canDoOT(ff, req.date, req.shift_type);
        if (!eligible.pass) continue;
        if (!rankMatchesFilter(getRank(ff), block.rankFilter)) continue;
        if (block.inDistrict === true && ff.district !== req.district) continue;
        const distKm = getDistance(ff.station_id, req.station_id, distanceMatrix);
        if (distKm !== dist) continue;
        // OOD blocks must exclude in-district FFs (inDistrict===true filter handles
        // in-district blocks; OOD blocks use inDistrict:any but still need this check)
        if (block.inDistrict === 'any' && ff.district === req.district) continue;
        const requiredQuals = req.specialist_type ? [req.specialist_type] : [];
        if (!checkQualifications(ff, requiredQuals)) continue;
        if (!checkPreferences(ff, req.station_name, req.district)) continue;
        if (!block.isCallback && shift !== 'Off') {
          const wantField = req.shift_type === 'Day' ? ff.want_to_work_day : ff.want_to_work_night;
          if (!wantField) continue;
        }
        candidatesByBlock.get(block.id)!.push({ ff, req, distance: distKm, otCount: getOTCount(ff, block.otCounter, req.shift_type) });
      }
    }
  }

  // DEBUG: log distance phase summary
    let totalAssignedThisDist = 0;
    for (const req of requests) totalAssignedThisDist += (req.slots - slotsRemaining[req.station_id]);
    console.log(`DIST=${dist}: total assigned so far=${totalAssignedThisDist}`);
  // DEBUG: log distance phase summary
  // Check if ANY block has candidates at this distance
  let anyCandidateAtThisDist = false;
  for (const cands of Array.from(candidatesByBlock.values())) {
    if (cands.length > 0) { anyCandidateAtThisDist = true; break; }
  }
  if (!anyCandidateAtThisDist) continue;

  // Per-station threshold: each station independently decides must/might/wont
  // Rule: only "must" candidates fill slots. "might" wait for next distance.
  // Every evaluated candidate (must or might) is consumed globally.
  for (const block of BLOCKS) {
    const candidates = candidatesByBlock.get(block.id)!;
    if (candidates.length === 0) continue;

    // Slots taken by higher-priority blocks at each station
    const slotsTakenByHigher = new Map<number, number>();
    for (const req of requests) {
      const result = results.get(req.station_id)!;
      slotsTakenByHigher.set(req.station_id, req.slots - slotsRemaining[req.station_id]);
    }

    // Group candidates by target station for per-station threshold
    const byStation = new Map<number, typeof candidates>();
    for (const c of candidates) {
      if (!byStation.has(c.req.station_id)) byStation.set(c.req.station_id, []);
      byStation.get(c.req.station_id)!.push(c);
    }

    // Assign station-by-station: only "must" fills; "might" waits next distance
    for (const [stationId, stationCands] of Array.from(byStation)) {
      const req = requests.find(r => r.station_id === stationId)!;

      // Station full: mark ALL candidates as globally consumed
      if (slotsRemaining[stationId] <= 0) {
        for (const c of stationCands) globalAssigned.add(c.ff.id);
        continue;
      }

      const higherTaken = slotsTakenByHigher.get(stationId) ?? 0;

      // Threshold scoped to REMAINING slots (not req.slots) to prevent over-filling
      const threshold = computeMustMightWonThreshold(
        stationCands.map(c => ({ ff: c.ff, distance: c.distance, otCount: c.otCount })),
        slotsRemaining[stationId],
        higherTaken,
      );

      // Sort: must first (lowest OT), then might, then distance
      stationCands.sort((a, b) => {
        const ta = threshold.get(a.ff.id)!;
        const tb = threshold.get(b.ff.id)!;
        if (ta !== tb) {
          if (ta === 'must') return -1;
          if (tb === 'must') return 1;
          return ta === 'might' ? -1 : 1;
        }
        if (a.otCount !== b.otCount) return a.otCount - b.otCount;
        return a.distance - b.distance;
      });

      // Only "must" fills slots. "might" waits next distance.
      // Every evaluated candidate (must or might) is consumed globally.
      for (const c of stationCands) {
        const t = threshold.get(c.ff.id)!;
        if (t === 'wont') {
          // Below threshold - skip but do NOT consume globally; lower OT at same
          // distance still valid at next distance phase
          continue;
        }
        // Evaluated (must or might) - consume globally
        globalAssigned.add(c.ff.id);

        if (t === 'must' && slotsRemaining[stationId] > 0) {
          slotsRemaining[stationId]--;
          const assignment: Assignment = {
            firefighter_id: c.ff.id,
            firefighter_name: `${c.ff.first_name} ${c.ff.last_name}`,
            rank: c.ff.rank,
            home_station: c.ff.station_name,
            distance: c.distance,
            cascadePhase: block.phase,
            otCount: c.otCount,
            threshold: t,
            callback: getCallbackForWatch(c.ff.watch as any, c.req.date),
            qualifications: Object.keys(c.ff.qualifications).filter(k => c.ff.qualifications[k]),
            assignedAtBlock: block.id,
            assignedStation: c.req.station_name,
          };
          const stationResult = results.get(stationId)!;
          stationResult.assignedFirefighters.push(assignment);
          if (!stationResult.phasesUsed.includes(block.phase)) stationResult.phasesUsed.push(block.phase);
        }
      }
    }
  }

}
return Array.from(results.values());
}


export async function runAllocation(
  requests: OTRequest[], pool: Pool,
): Promise<{ stationResults: AllocationResult[]; traces: Record<string, TraceEntry[]> }> {
  const [allFFs, distMatrix] = await Promise.all([
    loadAllFirefighters(pool), loadDistanceMatrix(pool),
  ]);
  const stationResults = await allocateForOTRequest(requests, allFFs, distMatrix, new Set());
  return { stationResults, traces: {} };
}

