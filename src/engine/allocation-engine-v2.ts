import { canDoOT as canDoOTBase, getShift, getCallbackType, type Watch } from './watch-math';

export interface Firefighter {
  id: number; first_name: string; last_name: string; station_id: number;
  station_name: string; district: string; area_id: number; watch: string;
  rank: 'FF' | 'QFF' | 'SFF' | 'SO' | 'SSO';
  qualifications: Record<string, boolean>;
  preferences: { districts: string[]; stations: string[] };
  want_to_work_day: boolean; want_to_work_night: boolean;
  ot_count_days: number; ot_count_nights: number;
  ot_count_callback_days: number; ot_count_callback_nights: number;
  ot_count_noncallback_days: number; ot_count_noncallback_nights: number;
  is_active: boolean;
}

export interface OTRequest {
  id: number;
  station_id: number; station_name: string; district: string;
  date: string; shift_type: 'Day' | 'Night'; slots: number;
  specialist_type: string | null; required_rank: 'FF' | 'SO' | 'SSO' | 'SO_OR_SSO';
  required_qualifications: string[];
}

export interface DistanceMatrix { [fromStationId: number]: { [toStationId: number]: number; }; }

export interface Assignment {
  firefighter_id: number; firefighter_name: string; rank: string;
  home_station: string; home_district: string; distance: number;
  cascadePhase: string; otCount: number; threshold: 'must' | 'might' | 'wont';
  callback: string | null; qualifications: string[]; assignedAtGroup: number;
  assignedStation: string;
}

export interface AllocationResult {
  requestId: number; station_name: string; station_id: number; slots: number;
  specialist: string | null; required_rank: string;
  assignedFirefighters: Assignment[]; phasesUsed: string[];
}

export interface GroupDef {
  id: number;
  name: string;
  phase: string;
  rankFilter: 'FF' | 'SO' | 'SSO';
  targetRank: 'FF' | 'SO' | 'SSO';
  districtFilter: 'in' | 'ood-adj' | 'ood-distant' | 'any';
  isCallback: boolean;
  otCounter: 'callback' | 'noncallback' | 'officer';
}

// 18 Priority Groups (Ride Up & Ride Down Included)
export const GROUPS: GroupDef[] = [
  { id: 1, name: 'FF In-District Callback', phase: 'ff-callback', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'in', isCallback: true, otCounter: 'callback' },
  { id: 2, name: 'FF In-District Non-Callback', phase: 'ff-noncallback', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'in', isCallback: false, otCounter: 'noncallback' },
  { id: 3, name: 'FF OOD-Adjacent Callback', phase: 'ood-adj-cb', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'ood-adj', isCallback: true, otCounter: 'callback' },
  { id: 4, name: 'FF OOD-Adjacent Non-Callback', phase: 'ood-adj-nc', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'ood-adj', isCallback: false, otCounter: 'noncallback' },
  { id: 5, name: 'FF OOD-Distant Callback', phase: 'ood-dist-cb', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'ood-distant', isCallback: true, otCounter: 'callback' },
  { id: 6, name: 'FF OOD-Distant Non-Callback', phase: 'ood-dist-nc', rankFilter: 'FF', targetRank: 'FF', districtFilter: 'ood-distant', isCallback: false, otCounter: 'noncallback' },

  { id: 7, name: 'SO Callback', phase: 'so-callback', rankFilter: 'SO', targetRank: 'SO', districtFilter: 'any', isCallback: true, otCounter: 'officer' },
  { id: 8, name: 'SO Non-Callback', phase: 'so-noncallback', rankFilter: 'SO', targetRank: 'SO', districtFilter: 'any', isCallback: false, otCounter: 'officer' },

  { id: 9, name: 'SSO Callback', phase: 'sso-callback', rankFilter: 'SSO', targetRank: 'SSO', districtFilter: 'any', isCallback: true, otCounter: 'officer' },
  { id: 10, name: 'SSO Non-Callback', phase: 'sso-noncallback', rankFilter: 'SSO', targetRank: 'SSO', districtFilter: 'any', isCallback: false, otCounter: 'officer' },

  { id: 11, name: 'FF Ride-Up Callback', phase: 'ff-rideup-cb', rankFilter: 'FF', targetRank: 'SO', districtFilter: 'any', isCallback: true, otCounter: 'callback' },
  { id: 12, name: 'FF Ride-Up Non-Callback', phase: 'ff-rideup-nc', rankFilter: 'FF', targetRank: 'SO', districtFilter: 'any', isCallback: false, otCounter: 'noncallback' },

  { id: 13, name: 'SSO Ride-Down (SO) Callback', phase: 'sso-ridedown-so-cb', rankFilter: 'SSO', targetRank: 'SO', districtFilter: 'any', isCallback: true, otCounter: 'officer' },
  { id: 14, name: 'SSO Ride-Down (SO) Non-Callback', phase: 'sso-ridedown-so-nc', rankFilter: 'SSO', targetRank: 'SO', districtFilter: 'any', isCallback: false, otCounter: 'officer' },

  { id: 15, name: 'SO Ride-Down (FF) Callback', phase: 'so-ridedown-ff-cb', rankFilter: 'SO', targetRank: 'FF', districtFilter: 'any', isCallback: true, otCounter: 'officer' },
  { id: 16, name: 'SO Ride-Down (FF) Non-Callback', phase: 'so-ridedown-ff-nc', rankFilter: 'SO', targetRank: 'FF', districtFilter: 'any', isCallback: false, otCounter: 'officer' },

  { id: 17, name: 'SSO Ride-Down (FF) Callback', phase: 'sso-ridedown-ff-cb', rankFilter: 'SSO', targetRank: 'FF', districtFilter: 'any', isCallback: true, otCounter: 'officer' },
  { id: 18, name: 'SSO Ride-Down (FF) Non-Callback', phase: 'sso-ridedown-ff-nc', rankFilter: 'SSO', targetRank: 'FF', districtFilter: 'any', isCallback: false, otCounter: 'officer' }
];

const ADJACENCY_RINGS: Record<string, Record<string, 'in' | 'ood-adj' | 'ood-distant'>> = {
  'Auckland': { 'Auckland': 'in', 'Waitemata': 'ood-adj', 'Counties Manukau': 'ood-adj' },
  'Waitemata': { 'Waitemata': 'in', 'Auckland': 'ood-adj', 'Counties Manukau': 'ood-distant' },
  'Counties Manukau': { 'Counties Manukau': 'in', 'Auckland': 'ood-adj', 'Waitemata': 'ood-distant' },
};

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' { return getShift(watch as Watch, new Date(dateStr)); }
export function getCallbackForWatch(watch: string, dateStr: string): string | null { return getCallbackType(watch as Watch, new Date(dateStr)); }
export function canDoOT(ff: Firefighter, dateStr: string, shiftType: 'Day' | 'Night') { return canDoOTBase(ff as any, dateStr, shiftType); }

function getOTCount(ff: Firefighter, isCallback: boolean, shiftType: 'Day' | 'Night'): number {
  if (isCallback) return shiftType === 'Day' ? ff.ot_count_callback_days : ff.ot_count_callback_nights;
  return shiftType === 'Day' ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights;
}

const OFFICER_HOME_GRACE = 2;

function adjustedOTCount(ff: Firefighter, isCallback: boolean, isOfficerGroup: boolean, shiftType: 'Day' | 'Night', isHomeStation: boolean): number {
  const raw = getOTCount(ff, isCallback, shiftType);
  if (isOfficerGroup && isHomeStation) return Math.max(0, raw - OFFICER_HOME_GRACE);
  return raw;
}

function checkQualifications(ff: Firefighter, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) {
    const hasQual = ff.qualifications[q] || ff.qualifications[q.toLowerCase()] || ff.qualifications[q.toUpperCase()];
    if (!hasQual) return false;
  }
  return true;
}

function checkPreferences(ff: Firefighter, otStationName: string, otDistrict: string): boolean {
  const { districts, stations } = ff.preferences;
  if (!districts?.length && !stations?.length) return true;
  if (stations?.length > 0) return stations.includes(otStationName);
  if (districts?.length > 0) return districts.includes(otDistrict);
  return true;
}

export function getDistance(fromStationId: number, toStationId: number, matrix: DistanceMatrix): number {
  if (fromStationId === toStationId) return 0;
  return matrix[fromStationId]?.[toStationId] ?? 999;
}

// THE PRE-FLIGHT CHECK (Supply vs Demand)
export function calculateSurplus(requests: OTRequest[], allFirefighters: Firefighter[], dateStr: string, shiftType: 'Day' | 'Night', availableFFMap: Map<number, Set<string>>): boolean {
  const ffDemand = requests.filter(r => r.required_rank === 'FF').reduce((sum, r) => sum + r.slots, 0);
  let ffSupply = 0;
  for (const ff of allFirefighters) {
    const isFF = ['FF', 'QFF', 'SFF'].includes(ff.rank);
    if (isFF && ff.is_active && canDoOT(ff, dateStr, shiftType).pass && availableFFMap.has(ff.id)) {
      ffSupply++;
    }
  }
  return ffSupply > ffDemand;
}

// DYNAMIC ORDERING (Rewards FFs with Ride Ups if Surplus exists)
export function getExecutionOrder(ffSurplus: boolean): GroupDef[] {
  const order = ffSurplus
    ? [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18] // FF Ride-Up (11-12) executes BEFORE normal FF slots (1-6)
    : [7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 17, 18]; // Normal FF slots execute BEFORE FF Ride-Up

  return order.map(id => GROUPS.find(g => g.id === id)!);
}

// CENTRALIZED MATCHING LOGIC (Used by Engine and UI Audit Trail)
export function matchesGroupRules(ff: Firefighter, req: OTRequest, group: GroupDef, dateStr: string, shiftType: 'Day' | 'Night'): boolean {
  const isFF = ['FF', 'QFF', 'SFF'].includes(ff.rank);
  const isSO = ff.rank === 'SO';
  const isSSO = ff.rank === 'SSO';

  if (group.rankFilter === 'FF' && !isFF) return false;
  if (group.rankFilter === 'SO' && !isSO) return false;
  if (group.rankFilter === 'SSO' && !isSSO) return false;

  const reqRank = req.required_rank;
  const reqNeedsFF = reqRank === 'FF';
  const reqNeedsSO = reqRank === 'SO' || reqRank === 'SO_OR_SSO';
  const reqNeedsSSO = reqRank === 'SSO' || reqRank === 'SO_OR_SSO';

  if (group.targetRank === 'FF' && !reqNeedsFF) return false;
  if (group.targetRank === 'SO' && !reqNeedsSO) return false;
  if (group.targetRank === 'SSO' && !reqNeedsSSO) return false;

  // FF riding up requires 'SO' qual
  if (group.rankFilter === 'FF' && group.targetRank === 'SO') {
    const hasSoQual = ff.qualifications['SO'] || ff.qualifications['so'] || ff.qualifications['So'];
    if (!hasSoQual) return false;
  }

  const watchCb = getCallbackForWatch(ff.watch, dateStr);
  const isTrueCb = (
    (watchCb === '#1-BeforeDay1' && shiftType === 'Day') ||
    (watchCb === '#2a-EveningDay2' && shiftType === 'Night') ||
    (watchCb === '#2b-DayOfNight1' && shiftType === 'Day') ||
    (watchCb === '#3-AfterLastNight' && shiftType === 'Night')
  );

  if (group.isCallback === true && !isTrueCb) return false;
  if (group.isCallback === false && isTrueCb) return false;

  const ring = ADJACENCY_RINGS[req.district]?.[ff.district] ?? 'ood-distant';
  if (group.districtFilter !== 'any' && group.districtFilter !== ring) return false;

  return true;
}

export function getEligibleGroups(ff: Firefighter, req: OTRequest, isSurplus: boolean = false): GroupDef[] {
  const results: GroupDef[] = [];
  const orderedGroups = getExecutionOrder(isSurplus);
  for (const group of orderedGroups) {
    if (matchesGroupRules(ff, req, group, req.date, req.shift_type)) {
      results.push(group);
    }
  }
  return results;
}

export function computeMustMightWonThreshold(
  candidates: { ff: Firefighter; distKm: number; otCount: number }[],
  slots: number
): Map<number, 'must' | 'might' | 'wont'> {
  const result = new Map<number, 'must' | 'might' | 'wont'>();
  if (candidates.length === 0 || slots <= 0) {
    candidates.forEach(c => result.set(c.ff.id, 'wont'));
    return result;
  }

  const uniqueCands = new Map<number, typeof candidates[0]>();
  for (const c of candidates) {
    if (!uniqueCands.has(c.ff.id)) uniqueCands.set(c.ff.id, c);
    else if (c.distKm < uniqueCands.get(c.ff.id)!.distKm) uniqueCands.get(c.ff.id)!.distKm = c.distKm;
  }

  const sorted = Array.from(uniqueCands.values()).sort((a, b) => {
    if (a.otCount !== b.otCount) return a.otCount - b.otCount;
    return a.distKm - b.distKm;
  });

  const byOt = new Map<number, typeof sorted>();
  for (const c of sorted) {
    if (!byOt.has(c.otCount)) byOt.set(c.otCount, []);
    byOt.get(c.otCount)!.push(c);
  }

  let slotsLeft = slots;
  let mightAssigned = false;

  for (const [otCount, groupCands] of Array.from(byOt.entries())) {
    if (slotsLeft >= groupCands.length) {
      groupCands.forEach(c => result.set(c.ff.id, 'must'));
      slotsLeft -= groupCands.length;
    } else if (slotsLeft > 0) {
      groupCands.forEach(c => result.set(c.ff.id, 'might'));
      slotsLeft = 0;
      mightAssigned = true;
    } else {
      if (!mightAssigned) {
        groupCands.forEach(c => result.set(c.ff.id, 'might'));
        mightAssigned = true;
      } else {
        groupCands.forEach(c => result.set(c.ff.id, 'wont'));
      }
    }
  }
  return result;
}

export async function allocateV2(
  requests: OTRequest[],
  allFirefighters: Firefighter[],
  distanceMatrix: DistanceMatrix,
  existingAssigned: Set<number> = new Set(),
  requestExclusions: Record<number, Set<number>> = {},
  availableFFMap: Map<number, Set<string>> = new Map(),
): Promise<AllocationResult[]> {

  const globalAssigned = new Set<number>(existingAssigned);
  const slotsRemaining: Record<number, number> = {};
  for (const req of requests) slotsRemaining[req.id] = req.slots;

  const results = new Map<number, AllocationResult>();

  const sortedRequests = [...requests].sort((a, b) => {
    const aQuals = a.required_qualifications?.length || (a.specialist_type ? 1 : 0);
    const bQuals = b.required_qualifications?.length || (b.specialist_type ? 1 : 0);
    return bQuals - aQuals;
  });

  for (const req of sortedRequests) {
    results.set(req.id, {
      requestId: req.id, station_name: req.station_name, station_id: req.station_id, slots: req.slots,
      specialist: req.specialist_type, required_rank: req.required_rank, assignedFirefighters: [], phasesUsed: [],
    });
  }

  // Pre-Flight Check
  const dateStr = requests.length > 0 ? requests[0].date : new Date().toISOString();
  const shiftType = requests.length > 0 ? requests[0].shift_type : 'Day';
  const isSurplus = calculateSurplus(requests, allFirefighters, dateStr, shiftType, availableFFMap);
  const orderedGroups = getExecutionOrder(isSurplus);

  for (const group of orderedGroups) {
    if (Object.values(slotsRemaining).every(slots => slots <= 0)) break;

    const allValidPairs: any[] = [];

    // 1. Gather all candidates
    for (const req of sortedRequests) {
      if (slotsRemaining[req.id] <= 0) continue;

      for (const ff of allFirefighters) {
        if (globalAssigned.has(ff.id)) continue;
        if (requestExclusions[req.id]?.has(ff.id)) continue;
        if (!canDoOT(ff, req.date, req.shift_type).pass) continue;
        if (!matchesGroupRules(ff, req, group, req.date, req.shift_type)) continue;

        const requiredQuals = req.required_qualifications?.length > 0 ? req.required_qualifications : (req.specialist_type ? [req.specialist_type] : []);
        if (!checkQualifications(ff, requiredQuals)) continue;
        
        // Assert firefighter opted-in via PWA availability
        if (!availableFFMap.has(ff.id)) continue;
        const allowedStations = availableFFMap.get(ff.id);
        if (allowedStations && allowedStations.size > 0 && !allowedStations.has(String(req.station_id))) continue;

        const isHomeStation = ff.station_id === req.station_id;
        const distKm = getDistance(ff.station_id, req.station_id, distanceMatrix);
        const isOfficerGroup = group.targetRank !== 'FF';
        const otCount = adjustedOTCount(ff, group.isCallback, isOfficerGroup, req.shift_type, isHomeStation);

        allValidPairs.push({ ff, req, distKm, otCount, group });
      }
    }

    if (allValidPairs.length === 0) continue;

    const eligiblePairs: any[] = [];

    // 2. Evaluate Thresholds PER VACANCY
    for (const req of sortedRequests) {
      if (slotsRemaining[req.id] <= 0) continue;

      const reqPairs = allValidPairs.filter(p => p.req.id === req.id);
      if (reqPairs.length === 0) continue;

      const thresholdMap = computeMustMightWonThreshold(reqPairs, slotsRemaining[req.id]);

      for (const pair of reqPairs) {
        const threshold = thresholdMap.get(pair.ff.id)!;
        eligiblePairs.push({ ...pair, threshold }); // We keep the WONT/Backup candidates!
      }
    }

    // 3. Sort Globally across the Group
    const thresholdRank: Record<string, number> = { 'must': 0, 'might': 1, 'wont': 2 };

    eligiblePairs.sort((a, b) => {
      if (a.threshold !== b.threshold) return thresholdRank[a.threshold] - thresholdRank[b.threshold];
      if (a.otCount !== b.otCount) return a.otCount - b.otCount;
      return a.distKm - b.distKm;
    });

    // 4. Assign Greedily (Vacancies First)
    for (const req of sortedRequests) {
      if (slotsRemaining[req.id] <= 0) continue;

      const reqPairs = eligiblePairs.filter(p => p.req.id === req.id && !globalAssigned.has(p.ff.id));
      if (reqPairs.length === 0) continue;

      while (slotsRemaining[req.id] > 0 && reqPairs.length > 0) {
        const pair = reqPairs.shift()!;
        if (globalAssigned.has(pair.ff.id)) continue;

        globalAssigned.add(pair.ff.id);
        slotsRemaining[req.id]--;

        const assignment: Assignment = {
          firefighter_id: pair.ff.id, firefighter_name: `${pair.ff.first_name} ${pair.ff.last_name}`,
          rank: pair.ff.rank, home_station: pair.ff.station_name, home_district: pair.ff.district,
          distance: pair.distKm, cascadePhase: pair.group.phase, otCount: pair.otCount,
          threshold: pair.threshold,
          callback: getCallbackForWatch(pair.ff.watch, pair.req.date),
          qualifications: Object.keys(pair.ff.qualifications).filter(k => pair.ff.qualifications[k]),
          assignedAtGroup: pair.group.id, assignedStation: pair.req.station_name,
        };

        const result = results.get(pair.req.id)!;
        result.assignedFirefighters.push(assignment);
        if (!result.phasesUsed.includes(pair.group.phase)) result.phasesUsed.push(pair.group.phase);
      }
    }
  }

  return Array.from(results.values());
}