import { supabase } from '@/lib/supabase';
import { canDoOT, Watch, getShift, getCallbackType } from './watch-math';

// --- SHARED TYPES ---
export interface OTRequest {
  id: number;
  station_id: number;
  station_name?: string;
  district: string;
  date: string;
  shift_type: 'Day' | 'Night';
  slots: number;
  specialist_type: string | null;
  required_rank: string;
  required_qualifications: string[];
}

export interface Firefighter {
  id: number;
  first_name: string;
  last_name: string;
  rank: string;
  watch: Watch;
  station_id: number;
  station_name: string;
  district: string;
  area_id: number;
  qualifications: Record<string, boolean>;
  ot_count_days: number;
  ot_count_nights: number;
  preferences: {
    districts: string[];
    stations: string[];
  };
}

export type DistanceMatrix = Record<number, Record<number, number>>;

export const GROUPS = [
  { id: 1, name: 'FF In-District CB', phase: 'ff-callback', rankFilter: 'FF', targetRank: 'FF', district: 'in', isCallback: true, otCounter: 'callback' },
  { id: 2, name: 'FF In-District NCB', phase: 'ff-noncallback', rankFilter: 'FF', targetRank: 'FF', district: 'in', isCallback: false, otCounter: 'noncallback' },
  { id: 3, name: 'FF OOD-Adj CB', phase: 'ood-adj-cb', rankFilter: 'FF', targetRank: 'FF', district: 'ood-adj', isCallback: true, otCounter: 'callback' },
  { id: 4, name: 'FF OOD-Adj NCB', phase: 'ood-adj-nc', rankFilter: 'FF', targetRank: 'FF', district: 'ood-adj', isCallback: false, otCounter: 'noncallback' },
  { id: 5, name: 'FF OOD-Distant CB', phase: 'ood-dist-cb', rankFilter: 'FF', targetRank: 'FF', district: 'ood-dist', isCallback: true, otCounter: 'callback' },
  { id: 6, name: 'FF OOD-Distant NCB', phase: 'ood-dist-nc', rankFilter: 'FF', targetRank: 'FF', district: 'ood-dist', isCallback: false, otCounter: 'noncallback' },
  { id: 7, name: 'SO Callback', phase: 'so-callback', rankFilter: 'SO', targetRank: 'SO', district: 'any', isCallback: true, otCounter: 'officer' },
  { id: 8, name: 'SO Non-Callback', phase: 'so-noncallback', rankFilter: 'SO', targetRank: 'SO', district: 'any', isCallback: false, otCounter: 'officer' },
  { id: 9, name: 'SSO Callback', phase: 'sso-callback', rankFilter: 'SSO', targetRank: 'SSO', district: 'any', isCallback: true, otCounter: 'officer' },
  { id: 10, name: 'SSO Non-Callback', phase: 'sso-noncallback', rankFilter: 'SSO', targetRank: 'SSO', district: 'any', isCallback: false, otCounter: 'officer' },
  { id: 11, name: 'FF Ride-Up CB', phase: 'ff-rideup-cb', rankFilter: 'FF', targetRank: 'SO', district: 'any', isCallback: true, otCounter: 'callback' },
  { id: 12, name: 'FF Ride-Up NCB', phase: 'ff-rideup-nc', rankFilter: 'FF', targetRank: 'SO', district: 'any', isCallback: false, otCounter: 'noncallback' },
  { id: 13, name: 'SSO Ride-Down (SO) CB', phase: 'sso-ridedown-so-cb', rankFilter: 'SSO', targetRank: 'SO', district: 'any', isCallback: true, otCounter: 'officer' },
  { id: 14, name: 'SSO Ride-Down (SO) NCB', phase: 'sso-ridedown-so-nc', rankFilter: 'SSO', targetRank: 'SO', district: 'any', isCallback: false, otCounter: 'officer' },
  { id: 15, name: 'SO Ride-Down (FF) CB', phase: 'so-ridedown-ff-cb', rankFilter: 'SO', targetRank: 'FF', district: 'any', isCallback: true, otCounter: 'officer' },
  { id: 16, name: 'SO Ride-Down (FF) NCB', phase: 'so-ridedown-ff-nc', rankFilter: 'SO', targetRank: 'FF', district: 'any', isCallback: false, otCounter: 'officer' },
  { id: 17, name: 'SSO Ride-Down (FF) CB', phase: 'sso-ridedown-ff-cb', rankFilter: 'SSO', targetRank: 'FF', district: 'any', isCallback: true, otCounter: 'officer' },
  { id: 18, name: 'SSO Ride-Down (FF) NCB', phase: 'sso-ridedown-ff-nc', rankFilter: 'SSO', targetRank: 'FF', district: 'any', isCallback: false, otCounter: 'officer' }
];

export { canDoOT };

export function getShiftForWatch(watch: string, dateStr: string): 'Day' | 'Night' | 'Off' {
  return getShift(watch as any, new Date(dateStr));
}

export function getCallbackForWatch(watch: string, dateStr: string): string | null {
  return getCallbackType(watch as any, new Date(dateStr));
}

export function getDistance(fromId: number, toId: number, matrix: DistanceMatrix): number {
  if (fromId === toId) return 0;
  return matrix[fromId]?.[toId] ?? 999;
}

export function getExecutionOrder() {
  return GROUPS.map(g => g.id);
}

export function getEligibleGroups(ff: Firefighter, req: OTRequest, isSurplus?: Record<number, number>): any[] {
  const eligible = [];
  const shift = getShiftForWatch(ff.watch, req.date);
  const cb = getCallbackForWatch(ff.watch, req.date);

  for (const group of GROUPS) {
    // 1. Callback match
    if (group.isCallback) { if (!cb) continue; }
    else { if (cb) continue; }

    // 2. Rank match
    let rankMatches = false;
    if (group.rankFilter === 'FF') rankMatches = (ff.rank === 'FF' || ff.rank === 'QFF' || ff.rank === 'SFF');
    else rankMatches = (ff.rank === group.rankFilter);
    if (!rankMatches) continue;

    // 3. Target Rank match (Safety net logic)
    if (req.required_rank === 'SO_OR_SSO') {
        if (group.targetRank !== 'SO' && group.targetRank !== 'SSO') continue;
    } else if (req.required_rank && group.targetRank !== req.required_rank) {
        continue;
    }

    // 4. District match
    if (group.district === 'in') {
        if (ff.district !== req.district) continue;
    } else if (group.district === 'ood-adj') {
        if (ff.district === req.district) continue;
        // Simple adj check: if they are within 30km
        const dist = getDistance(ff.station_id, req.station_id, {} as any); // matrix not available here usually
        // Note: Predictive evaluation usually skips dist in pre-filter
    }

    eligible.push(group);
  }

  return eligible;
}

export function calculateSurplus(
    requests: OTRequest[],
    firefighters: Firefighter[],
    date: string,
    shift: 'Day' | 'Night',
    availableFFMap: Map<number, Set<string>>
) {
    const surplus: Record<string, number> = {};
    for (const group of GROUPS) {
        surplus[group.id] = 0;
    }

    for (const ff of firefighters) {
        const canWork = canDoOT(ff, date, shift);
        if (!canWork.pass) continue;

        for (const req of requests) {
            const groups = getEligibleGroups(ff, req);
            for (const g of groups) {
                surplus[g.id]++;
            }
        }
    }

    return surplus;
}


// --- PURE LOGIC: ALLOCATE V2 (Safe for Client & Server) ---
export async function allocateV2(
    requests: OTRequest[],
    firefighters: Firefighter[],
    distances: DistanceMatrix,
    busyFFs: Set<number> = new Set(),
    exclusions: Record<number, Set<number>> = {},
    availableFFMap?: Map<number, Set<string>>
  ) {
    const results = [];
  
    for (const req of requests) {
      const candidates = firefighters.filter(ff => {
        if (busyFFs.has(ff.id)) return false;
        if (exclusions[req.id]?.has(ff.id)) return false;
        if (availableFFMap && !availableFFMap.has(ff.id)) return false;
        return ff.rank === req.required_rank || (req.required_rank === 'SO_OR_SSO' && (ff.rank === 'SO' || ff.rank === 'SSO'));
      });
  
      const sorted = candidates.sort((a, b) => {
        const aDist = distances[a.station_id]?.[req.station_id] || 999;
        const bDist = distances[b.station_id]?.[req.station_id] || 999;
        return aDist - bDist;
      });
  
      results.push({
        requestId: req.id,
        station_name: req.station_name,
        slots: req.slots,
        specialist: req.specialist_type,
        required_rank: req.required_rank,
        phasesUsed: ['optimal'],
        assignedFirefighters: sorted.slice(0, req.slots).map(f => ({
          firefighter_id: f.id,
          firefighter_name: `${f.first_name} ${f.last_name}`,
          rank: f.rank,
          home_station: f.station_name,
          distance: distances[f.station_id]?.[req.station_id] || 0,
          cascadePhase: 'optimal',
          threshold: 'Must'
        }))
      });
    }
  
    return results;
}

/**
 * PURE ENGINE RUN
 * This only performs the calculations and returns the suggested assignments.
 * No DB writes, no notifications.
 */
export async function runAllocationEngine(targetDate: string, targetShift: 'Day' | 'Night') {
    const { data: requests } = await supabase
        .from('ot_requests')
        .select('*, stations(name, district)')
        .eq('date', targetDate)
        .eq('shift_type', targetShift);

    if (!requests || requests.length === 0) return null;

    const { data: firefighters } = await supabase.from('firefighters').select('*').eq('is_active', true);
    if (!firefighters) return null;

    const assignments: any[] = [];
    const usedFFs = new Set<number>();

    for (const req of requests) {
        const eligible = firefighters.filter(ff => {
            if (usedFFs.has(ff.id)) return false;
            return canDoOT(ff, targetDate, targetShift).pass;
        });

        const sorted = eligible.sort((a, b) => {
            const aDist = a.district_id === req.stations.district ? 0 : 1;
            const bDist = b.district_id === req.stations.district ? 0 : 1;
            if (aDist !== bDist) return aDist - bDist;
            return ((targetShift === 'Day' ? a.ot_count_days : a.ot_count_nights) || 0) - ((targetShift === 'Day' ? b.ot_count_days : b.ot_count_nights) || 0);
        });

        const best = sorted[0];
        if (best) {
            assignments.push({ req, ff: best });
            usedFFs.add(best.id);
        }
    }

    return assignments;
}