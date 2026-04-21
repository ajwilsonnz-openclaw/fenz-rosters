import { Pool } from 'pg';
import { getShift, getCallbackType, isOnLeave, type Watch, type ShiftType, type CallbackType } from './watch-math';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Firefighter {
  id: number;
  first_name: string;
  last_name: string;
  station_id: number;
  station_name: string;
  district: string;
  area_id: number;
  watch: string;
  rank: 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
  qualifications: Record<string, boolean>;
  preferences: { districts: string[]; stations: string[] };
  want_to_work_day: boolean;
  want_to_work_night: boolean;
  ot_count_days: number;
  ot_count_nights: number;
  ot_count_callback_days: number;
  ot_count_callback_nights: number;
  ot_count_noncallback_days: number;
  ot_count_noncallback_nights: number;
  is_active: boolean;
}

export interface OTRequest {
  station_id: number;
  station_name: string;
  district: string;
  date: string;
  shift_type: 'Day' | 'Night';
  slots: number;
  specialist_type: string | null;
  required_rank: 'FF' | 'SO' | 'SSO' | 'SO_OR_SSO';
  required_qualifications: string[];
}

export interface DistanceMatrix {
  [fromStationId: number]: { [toStationId: number]: number };
}

export interface Assignment {
  firefighter_id: number;
  firefighter_name: string;
  rank: string;
  home_station: string;
  home_district: string;
  distance: number;
  cascadePhase: string;
  otCount: number;
  threshold: 'must' | 'might' | 'wont';
  callback: string | null;
  qualifications: string[];
  assignedAtGroup: number;
  assignedStation: string;
}

export interface AllocationResult {
  station_name: string;
  station_id: number;
  slots: number;
  specialist: string | null;
  required_rank: string;
  assignedFirefighters: Assignment[];
  phasesUsed: string[];
}

export interface TraceEntry {
  type: 'header' | 'info' | 'debug' | 'assign' | 'skip' | 'lost';
  message: string;
  detail?: string;
}

// ─── Group Definitions ────────────────────────────────────────────────────────

export interface GroupDef {
  id: number;
  name: string;
  phase: string;
  rankFilter: 'FF' | 'SO' | 'SO_OR_SSO' | 'SSO' | 'FF_OR_SO' | 'SO_OR_SSO';
  districtFilter: 'in' | 'ood-adj' | 'ood-distant' | 'any';
  isCallback: boolean | null; // null = not applicable (officers)
  otCounter: 'callback' | 'noncallback' | 'officer';
}

export const GROUPS: GroupDef[] = [
  { id: 1, name: 'FF in-district callback',         phase: 'ff-callback',        rankFilter: 'FF',         districtFilter: 'in',        isCallback: true,  otCounter: 'callback' },
  { id: 2, name: 'FF in-district non-callback',      phase: 'ff-noncallback',      rankFilter: 'FF',         districtFilter: 'in',        isCallback: false, otCounter: 'noncallback' },
  { id: 3, name: 'FF OOD-adjacent callback',         phase: 'ood-adj-cb',          rankFilter: 'FF',         districtFilter: 'ood-adj',   isCallback: true,  otCounter: 'callback' },
  { id: 4, name: 'FF OOD-adjacent non-callback',     phase: 'ood-adj-nc',          rankFilter: 'FF',         districtFilter: 'ood-adj',   isCallback: false, otCounter: 'noncallback' },
  { id: 5, name: 'FF OOD-distant callback',          phase: 'ood-dist-cb',         rankFilter: 'FF',         districtFilter: 'ood-distant',isCallback: true,  otCounter: 'callback' },
  { id: 6, name: 'FF OOD-distant non-callback',      phase: 'ood-dist-nc',         rankFilter: 'FF',         districtFilter: 'ood-distant',isCallback: false, otCounter: 'noncallback' },
  { id: 7, name: 'SO pool',                          phase: 'so',                  rankFilter: 'SO_OR_SSO',  districtFilter: 'any',       isCallback: null,  otCounter: 'officer' },
  { id: 8, name: 'SSO pool',                         phase: 'sso',                 rankFilter: 'SSO',        districtFilter: 'any',       isCallback: null,  otCounter: 'officer' },
];

// ─── OOD Adjacency Map ────────────────────────────────────────────────────────

type DistrictRing = 'in' | 'ood-adj' | 'ood-distant';

const ADJACENCY_RINGS: Record<string, Record<string, DistrictRing>> = {
  'Auckland':           { 'Auckland': 'in', 'Waitemata': 'ood-adj', 'Counties Manukau': 'ood-adj' },
  'Waitemata':          { 'Waitemata': 'in', 'Auckland': 'ood-adj', 'Counties Manukau': 'ood-distant' },
  'Counties Manukau':   { 'Counties Manukau': 'in', 'Auckland': 'ood-adj', 'Waitemata': 'ood-distant' },
};

function getDistrictRing(ffDistrict: string, stationDistrict: string): DistrictRing {
  return ADJACENCY_RINGS[stationDistrict]?.[ffDistrict] ?? 'ood-distant';
}

// ─── Watch Helpers ────────────────────────────────────────────────────────────

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' {
  return getShift(watch as Watch, new Date(dateStr));
}

export function getCallbackForWatch(watch: string, dateStr: string): string | null {
  return getCallbackType(watch as Watch, new Date(dateStr));
}

export function canDoOT(
  ff: Firefighter,
  dateStr: string,
  shiftType: 'Day' | 'Night',
): { pass: boolean; reason: string } {
  const shift = getShiftForWatch(ff.watch, dateStr);
  if (shift === 'Off' && isOnLeave(ff.watch as Watch, new Date(dateStr))) {
    return { pass: false, reason: 'On Leave' };
  }
  const cb = getCallbackForWatch(ff.watch, dateStr);
  if (cb === '#3-AfterLastNight' && shiftType === 'Day') {
    return { pass: false, reason: 'Between Nights - Day OT excluded' };
  }
  if (cb === '#2a-EveningDay2' && shiftType === 'Day') {
    return { pass: false, reason: '#2a EveningDay2 excludes Day' };
  }
  // #2b-DayOfNight1: callback FF is available for Day OT (they're being called FOR a night shift)
  // The callback means they're being called FROM home to work a night — they're free during the day
  if (shift !== 'Off' && cb === null) {
    if (shiftType === 'Day' && shift === 'Night') return { pass: false, reason: 'On Night shift' };
    if (shiftType === 'Night' && shift === 'Day') return { pass: false, reason: 'On Day shift' };
  }
  return { pass: true, reason: 'Watch-eligible' };
}

// ─── OT Count Helpers ─────────────────────────────────────────────────────────

function getOTCount(ff: Firefighter, counter: 'callback' | 'noncallback' | 'officer', shiftType: 'Day' | 'Night'): number {
  if (counter === 'callback') {
    return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  }
  if (counter === 'noncallback') {
    return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
  }
  // officer counter — use callback counter as the primary OT measure
  return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
}

const OFFICER_HOME_GRACE = 2; // admin-configurable; loaded from DB in production

function adjustedOTCount(ff: Firefighter, counter: 'callback' | 'noncallback' | 'officer', shiftType: 'Day' | 'Night', isHomeStation: boolean): number {
  const raw = getOTCount(ff, counter, shiftType);
  if (counter === 'officer' && isHomeStation) {
    return Math.max(0, raw - OFFICER_HOME_GRACE);
  }
  return raw;
}

// ─── Qualification / Preference Helpers ──────────────────────────────────────

function checkQualifications(ff: Firefighter, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) { if (!ff.qualifications[q]) return false; }
  return true;
}

function checkPreferences(ff: Firefighter, otStationName: string, otDistrict: string): boolean {
  const { districts, stations } = ff.preferences;
  if (!districts?.length && !stations?.length) return true;
  if (stations?.length > 0) return stations.includes(otStationName);
  if (districts?.length > 0) return districts.includes(otDistrict);
  return true;
}

function rankMatchesFilter(rank: string, filter: GroupDef['rankFilter']): boolean {
  switch (filter) {
    case 'FF':        return rank === 'FF' || rank === 'QFF' || rank === 'SFF';
    case 'SO_OR_SSO': return rank === 'SO' || rank === 'SSO';
    case 'SSO':       return rank === 'SSO';
    case 'FF_OR_SO':  return rank === 'FF' || rank === 'QFF' || rank === 'SFF' || rank === 'SO';
    default:          return false;
  }
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  const from = matrix[fromStationId];
  if (!from) return 999;
  return from[toStationId] ?? 999;
}

// ─── Must / Might / Won't ─────────────────────────────────────────────────────

function computeMustMightThreshold(
  candidates: { ff: Firefighter; distance: number; otCount: number }[],
  slots: number,
): Map<number, 'must' | 'might' | 'wont'> {
  const result = new Map<number, 'must' | 'might' | 'wont'>();
  if (candidates.length === 0 || slots <= 0) return result;

  const sorted = [...candidates].sort((a, b) => {
    if (a.otCount !== b.otCount) return a.otCount - b.otCount;
    return a.distance - b.distance;
  });

  const mustCount = Math.min(slots, sorted.length);
  for (let i = 0; i < sorted.length; i++) {
    const t: 'must' | 'might' | 'wont' = i < mustCount ? 'must' : 'might';
    result.set(sorted[i].ff.id, t);
  }
  return result;
}

// ─── Candidate Collection ─────────────────────────────────────────────────────

interface CandidateEntry {
  ff: Firefighter;
  req: OTRequest;
  distKm: number;
  otCount: number;
  group: GroupDef;
  isHomeStation: boolean;
  threshold: 'must' | 'might' | 'wont';
}

function getEligibleGroups(ff: Firefighter, req: OTRequest): GroupDef[] {
  // Determine which groups this FF belongs to for this request
  const results: GroupDef[] = [];
  const ffDistrict = ff.district;
  const reqDistrict = req.district;
  const districtRing = getDistrictRing(ffDistrict, reqDistrict);
  const shift = getShiftForWatch(ff.watch, req.date);
  const watchCb = getCallbackForWatch(ff.watch, req.date);

  // FF groups (1-6)
  if (ff.rank === 'FF' || ff.rank === 'QFF' || ff.rank === 'SFF') {
    // In-district
    if (districtRing === 'in') {
      if (watchCb) results.push(GROUPS[0]); // Group 1: callback
      else results.push(GROUPS[1]);          // Group 2: non-callback
    }
    // OOD-adjacent
    if (districtRing === 'ood-adj') {
      if (watchCb) results.push(GROUPS[2]); // Group 3
      else results.push(GROUPS[3]);          // Group 4
    }
    // OOD-distant
    if (districtRing === 'ood-distant') {
      if (watchCb) results.push(GROUPS[4]); // Group 5
      else results.push(GROUPS[5]);          // Group 6
    }
  }

  // SO pool (Group 7) — SO and SSO can ride up to fill SO requests
  if ((ff.rank === 'SO' || ff.rank === 'SSO') && (req.required_rank === 'SO' || req.required_rank === 'SO_OR_SSO')) {
    results.push(GROUPS[6]); // Group 7: SO pool
  }

  // SSO pool (Group 8) — SSO only
  if (ff.rank === 'SSO' && req.required_rank === 'SSO') {
    results.push(GROUPS[7]); // Group 8: SSO pool
  }

  return results;
// ─── Candidate Collection ────────────────────────────────────────────────────

function collectCandidatesAtDistance(
  ffs: Firefighter[],
  reqs: OTRequest[],
  distanceMatrix: DistanceMatrix,
  globalAssigned: Set<number>,
  slotsRemaining: Record<number, number>,
): Map<number, { ff: Firefighter; req: OTRequest; distKm: number; otCount: number; group: GroupDef; isHomeStation: boolean }[]> {

  const byStation = new Map<number, { ff: Firefighter; req: OTRequest; distKm: number; otCount: number; group: GroupDef; isHomeStation: boolean }[]>();

  for (const ff of ffs) {
    if (globalAssigned.has(ff.id)) continue;

    for (const req of reqs) {
      if (slotsRemaining[req.station_id] <= 0) continue;

      // ── Rank compatibility ──────────────────────────────────────────────
      const isFF = ff.rank === 'FF' || ff.rank === 'QFF' || ff.rank === 'SFF';
      if (isFF && (req.required_rank === 'SO' || req.required_rank === 'SSO')) continue;
      if (ff.rank === 'SO' && req.required_rank === 'SSO') continue;

      // ── Group assignment ─────────────────────────────────────────────────
      const ffDistrict = ff.district;
      const reqDistrict = req.district;
      const distKm = getDistance(ff.station_id, req.station_id, distanceMatrix);
      const isHomeStation = ff.station_id === req.station_id;
      const shift = getShiftForWatch(ff.watch, req.date);
      const watchCb = getCallbackForWatch(ff.watch, req.date);
      const eligible = canDoOT(ff, req.date, req.shift_type);
      if (!eligible.pass) continue;

      // Determine district ring
      const ring = ADJACENCY_RINGS[reqDistrict]?.[ffDistrict] ?? 'ood-distant';

      // Required quals
      const requiredQuals = req.required_qualifications.length > 0
        ? req.required_qualifications
        : req.specialist_type ? [req.specialist_type] : [];
      if (!checkQualifications(ff, requiredQuals)) continue;
      if (!checkPreferences(ff, req.station_name, req.district)) continue;

      // Non-callback FFs must want the shift
      if (watchCb === null && shift === 'Off') {
        const wantField = req.shift_type === 'Day' ? ff.want_to_work_day : ff.want_to_work_night;
        if (!wantField) continue;
      }

      // Build group list for this FF / request
      const groups: GroupDef[] = [];

      // FF groups (1–6)
      if (isFF) {
        if (ring === 'in') {
          if (watchCb) groups.push(GROUPS[0]); else groups.push(GROUPS[1]);
        } else if (ring === 'ood-adj') {
          if (watchCb) groups.push(GROUPS[2]); else groups.push(GROUPS[3]);
        } else {
          if (watchCb) groups.push(GROUPS[4]); else groups.push(GROUPS[5]);
        }
      }

      // SO pool (Group 7) — SO or SSO can ride up to fill SO requests
      if ((ff.rank === 'SO' || ff.rank === 'SSO') &&
          (req.required_rank === 'SO' || req.required_rank === 'SO_OR_SSO')) {
        groups.push(GROUPS[6]);
      }

      // SSO pool (Group 8) — SSO only
      if (ff.rank === 'SSO' && req.required_rank === 'SSO') {
        groups.push(GROUPS[7]);
      }

      if (groups.length === 0) continue;

      const otCount = adjustedOTCount(ff, groups[0].otCounter, req.shift_type, isHomeStation);

      for (const group of groups) {
        if (!byStation.has(req.station_id)) byStation.set(req.station_id, []);
        byStation.get(req.station_id)!.push({ ff, req, distKm, otCount, group, isHomeStation });
      }
    }
  }

  return byStation;
}

// ─── Core Allocation ──────────────────────────────────────────────────────────

export async function allocateV2(
  requests: OTRequest[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  existingAssigned: Set<number> = new Set(),
): Promise<AllocationResult[]> {

  const globalAssigned = new Set<number>(existingAssigned);
  const slotsRemaining: Record<number, number> = {};
  for (const req of requests) slotsRemaining[req.station_id] = req.slots;

  const results = new Map<number, AllocationResult>();
  for (const req of requests) {
    results.set(req.station_id, {
      station_name: req.station_name,
      station_id: req.station_id,
      slots: req.slots,
      specialist: req.specialist_type,
      required_rank: req.required_rank,
      assignedFirefighters: [],
      phasesUsed: [],
    });
  }

  // Determine max distance
  let maxDistance = 0;
  for (const from of Object.values(distanceMatrix)) {
    for (const km of Object.values(from)) {
      if (Number(km) > maxDistance) maxDistance = Number(km);
    }
  }

  // ── Distance phases (all stations in lockstep) ───────────────────────────
  for (let dist = 0; dist <= maxDistance; dist++) {
    const candidatesByStation = collectCandidatesAtDistance(
      allFirefighters, requests, distanceMatrix, globalAssigned, slotsRemaining,
    );

    // Filter to exactly this distance
    const atThisDist = new Map<number, typeof Array.from(candidatesByStation.entries())[0][1]>();
    for (const [stationId, cands] of Array.from(candidatesByStation)) {
      const filtered = cands.filter(c => c.distKm === dist);
      if (filtered.length > 0) atThisDist.set(stationId, filtered);
    }

    if (atThisDist.size === 0) continue;
    if (Array.from(atThisDist.values()).every(c => c.length === 0 || slotsRemaining[Array.from(atThisDist.keys())[atThisDist.size - 1]] <= 0)) {
      // Check if any station still needs fill
      const anyNeeds = Array.from(atThisDist.keys()).some(sid => slotsRemaining[sid] > 0);
      if (!anyNeeds) break;
    }

    // ── Process groups 1–8 in priority order ──────────────────────────────
    for (const group of GROUPS) {
      const groupByStation = new Map<number, typeof Array.from(atThisDist.values())[0]>();
      for (const [stationId, cands] of Array.from(atThisDist)) {
        const gc = cands.filter(c => c.group.id === group.id);
        if (gc.length > 0) groupByStation.set(stationId, gc);
      }
      if (groupByStation.size === 0) continue;

      for (const [stationId, cands] of Array.from(groupByStation)) {
        if (slotsRemaining[stationId] <= 0) continue;
        const req = requests.find(r => r.station_id === stationId)!;

        // Must / Might / Won't threshold
        const threshold = computeMustMightThreshold(
          cands.map(c => ({ ff: c.ff, distance: c.distKm, otCount: c.otCount })),
          slotsRemaining[stationId],
        );

        // Sort: must (lowest OT) first, then might, then distance
        cands.sort((a, b) => {
          const ta = threshold.get(a.ff.id)!;
          const tb = threshold.get(b.ff.id)!;
          if (ta !== tb) {
            if (ta === 'must') return -1;
            if (tb === 'must') return 1;
            return ta === 'might' ? -1 : 1;
          }
          if (a.otCount !== b.otCount) return a.otCount - b.otCount;
          return a.distKm - b.distKm;
        });

        // Assign only 'must' candidates; 'might' waits for next distance
        for (const c of cands) {
          if (slotsRemaining[stationId] <= 0) break;
          const t = threshold.get(c.ff.id)!;
          if (t === 'wont') break;
          if (t === 'might') continue;

          globalAssigned.add(c.ff.id);
          slotsRemaining[stationId]--;

          const assignment: Assignment = {
            firefighter_id: c.ff.id,
            firefighter_name: `${c.ff.first_name} ${c.ff.last_name}`,
            rank: c.ff.rank,
            home_station: c.ff.station_name,
            home_district: c.ff.district,
            distance: c.distKm,
            cascadePhase: c.group.phase,
            otCount: c.otCount,
            threshold: t,
            callback: getCallbackForWatch(c.ff.watch, c.req.date),
            qualifications: Object.keys(c.ff.qualifications).filter(k => c.ff.qualifications[k]),
            assignedAtGroup: c.group.id,
            assignedStation: c.req.station_name,
          };

          const result = results.get(stationId)!;
          result.assignedFirefighters.push(assignment);
          if (!result.phasesUsed.includes(c.group.phase)) result.phasesUsed.push(c.group.phase);
        }
      }
    }
  }

  // ── SSO → SO overflow ────────────────────────────────────────────────────
  for (const req of requests) {
    if (slotsRemaining[req.station_id] <= 0) continue;
    if (req.required_rank !== 'SO' && req.required_rank !== 'SO_OR_SSO') continue;

    const ssoPool = allFirefighters.filter(f =>
      f.rank === 'SSO' &&
      !globalAssigned.has(f.id) &&
      canDoOT(f, req.date, req.shift_type).pass &&
      checkQualifications(f, req.required_qualifications) &&
      checkPreferences(f, req.station_name, req.district)
    );

    if (ssoPool.length === 0) continue;

    ssoPool.sort((a, b) => {
      const ota = adjustedOTCount(a, 'officer', req.shift_type, a.station_id === req.station_id);
      const otb = adjustedOTCount(b, 'officer', req.shift_type, b.station_id === req.station_id);
      if (ota !== otb) return ota - otb;
      return getDistance(a.station_id, req.station_id, distanceMatrix) -
             getDistance(b.station_id, req.station_id, distanceMatrix);
    });

    while (slotsRemaining[req.station_id] > 0 && ssoPool.length > 0) {
      const sso = ssoPool.shift()!;
      globalAssigned.add(sso.id);
      slotsRemaining[req.station_id]--;

      const assignment: Assignment = {
        firefighter_id: sso.id,
        firefighter_name: `${sso.first_name} ${sso.last_name}`,
        rank: sso.rank,
        home_station: sso.station_name,
        home_district: sso.district,
        distance: getDistance(sso.station_id, req.station_id, distanceMatrix),
        cascadePhase: 'sso-overflow',
        otCount: adjustedOTCount(sso, 'officer', req.shift_type, sso.station_id === req.station_id),
        threshold: 'must',
        callback: null,
        qualifications: Object.keys(sso.qualifications).filter(k => sso.qualifications[k]),
        assignedAtGroup: 9,
        assignedStation: req.station_name,
      };

      const result = results.get(req.station_id)!;
      result.assignedFirefighters.push(assignment);
      if (!result.phasesUsed.includes('sso-overflow')) result.phasesUsed.push('sso-overflow');
    }
  }

  return Array.from(results.values());
}

export async function loadAllFirefighters(pool: Pool): Promise<Firefighter[]> {
  const { rows } = await pool.query(`
    SELECT ff.id, ff.first_name, ff.last_name, ff.station_id, s.name AS station_name,
           s.area_id, a.name AS district, ff.watch, ff.rank, ff.qualifications, ff.preferences,
           ff.want_to_work_day, ff.want_to_work_night,
           ff.ot_count_days, ff.ot_count_nights,
           ff.ot_count_callback_days, ff.ot_count_callback_nights,
           ff.ot_count_noncallback_days, ff.ot_count_noncallback_nights,
           ff.is_active
    FROM firefighters ff
    JOIN stations s ON ff.station_id = s.id
    JOIN areas a ON s.area_id = a.id
    WHERE ff.is_active = true
    ORDER BY a.name, s.name, ff.last_name, ff.first_name
  `);
  return rows.map((row: Record<string, unknown>) => ({
    id: Number(row.id),
    first_name: String(row.first_name),
    last_name: String(row.last_name),
    station_id: Number(row.station_id),
    station_name: String(row.station_name),
    district: String(row.district),
    area_id: Number(row.area_id),
    watch: String(row.watch),
    rank: String(row.rank) as Firefighter['rank'],
    qualifications: typeof row.qualifications === 'string' ? JSON.parse(row.qualifications as string) : (row.qualifications || {}),
    preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences as string) : (row.preferences || { districts: [], stations: [] }),
    want_to_work_day: Boolean(row.want_to_work_day),
    want_to_work_night: Boolean(row.want_to_work_night),
    ot_count_days: Number(row.ot_count_days),
    ot_count_nights: Number(row.ot_count_nights),
    ot_count_callback_days: Number(row.ot_count_callback_days),
    ot_count_callback_nights: Number(row.ot_count_callback_nights),
    ot_count_noncallback_days: Number(row.ot_count_noncallback_days),
    ot_count_noncallback_nights: Number(row.ot_count_noncallback_nights),
    is_active: Boolean(row.is_active),
  }));
}

export async function loadDistanceMatrix(pool: Pool): Promise<DistanceMatrix> {
  const { rows } = await pool.query(`SELECT station_id, distances FROM station_distances`);
  const matrix: DistanceMatrix = {};
  for (const row of rows) {
    const distObj: Record<number, number> = {};
    for (const [k, v] of Object.entries(row.distances as Record<string, unknown>)) {
      distObj[Number(k)] = Number(v);
    }
    matrix[row.station_id] = distObj;
  }
  return matrix;
}

export async function runAllocation(
  requests: OTRequest[],
  pool: Pool,
): Promise<{ stationResults: AllocationResult[]; traces: Record<string, TraceEntry[]> }> {
  const [allFFs, distMatrix] = await Promise.all([
    loadAllFirefighters(pool),
    loadDistanceMatrix(pool),
  ]);
  const stationResults = await allocateV2(requests, allFFs, distMatrix, new Set());
  return { stationResults, traces: {} };

