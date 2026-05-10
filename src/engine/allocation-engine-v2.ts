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

export function getEligibleGroups(ff: Firefighter, req: OTRequest, isSurplus?: Record<number, number>, matrix?: DistanceMatrix): any[] {
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
        if (matrix) {
            const dist = getDistance(ff.station_id, req.station_id, matrix);
            if (dist > 30) continue; // Adjust threshold as needed
        }
    } else if (group.district === 'ood-dist') {
        if (ff.district === req.district) continue;
        if (matrix) {
            const dist = getDistance(ff.station_id, req.station_id, matrix);
            if (dist <= 30) continue;
        }
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
      const candidates = firefighters.map(ff => {
        if (busyFFs.has(ff.id)) return null;
        if (exclusions[req.id]?.has(ff.id)) return null;
        if (availableFFMap && !availableFFMap.has(ff.id)) return null;

        // Qualification check
        if (req.required_qualifications && req.required_qualifications.length > 0) {
            const hasAllQuals = req.required_qualifications.every(q => ff.qualifications?.[q]);
            if (!hasAllQuals) return null;
        }

        const otCheck = canDoOT(ff, req.date, req.shift_type);
        if (!otCheck.pass) return null;

        const groups = getEligibleGroups(ff, req, undefined, distances);
        if (groups.length === 0) return null;

        const bestGroup = groups[0];
        const dist = ff.station_id === req.station_id ? 0 : (distances[ff.station_id]?.[req.station_id] ?? 999);
        const otCount = (req.shift_type === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0;

        return { ff, group: bestGroup, dist, otCount };
      }).filter(Boolean) as { ff: Firefighter, group: any, dist: number, otCount: number }[];
  
      candidates.sort((a, b) => {
        if (a.group.id !== b.group.id) return a.group.id - b.group.id;
        if (a.otCount !== b.otCount) return a.otCount - b.otCount;
        return a.dist - b.dist;
      });
  
      const assigned = candidates.slice(0, req.slots);
      
      results.push({
        requestId: req.id,
        station_name: req.station_name,
        slots: req.slots,
        specialist: req.specialist_type,
        required_rank: req.required_rank,
        phasesUsed: Array.from(new Set(assigned.map(c => c.group.phase))),
        assignedFirefighters: assigned.map(c => {
            busyFFs.add(c.ff.id);
            
            // Intelligent Threshold Calculation
            let threshold = 'Must';
            const firstLoser = candidates[req.slots];
            
            // If there's a tie in Group and OT Count with the first person who didn't make the cut, 
            // then it's a 'Maybe' situation.
            if (firstLoser && firstLoser.group.id === c.group.id && firstLoser.otCount === c.otCount) {
                threshold = 'Maybe';
            }

            // Override for ride-up/down or distant OOD if desired
            if (c.group.id > 10) threshold = 'Backup';

            return {
              firefighter_id: c.ff.id,
              firefighter_name: `${c.ff.first_name} ${c.ff.last_name}`,
              rank: c.ff.rank,
              home_station: c.ff.station_name,
              distance: c.dist,
              cascadePhase: c.group.phase,
              threshold: threshold,
              assignedAtGroup: c.group.id
            }
        })
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
        .select('*, stations(name, district, area_id)')
        .eq('date', targetDate)
        .eq('shift_type', targetShift)
        .eq('status', 'pending');

    if (!requests || requests.length === 0) return null;

    const { data: firefighters } = await supabase.from('firefighters').select('*, stations(name, district, area_id)').eq('is_active', true);
    if (!firefighters) return null;

    const { data: distData } = await supabase.from('station_distances').select('*');
    const { data: stationsData } = await supabase.from('stations').select('id, name');
    const nameToId: Record<string, number> = {};
    stationsData?.forEach((s: any) => { nameToId[s.name] = s.id; });

    const distMatrix: DistanceMatrix = {};
    distData?.forEach((d: any) => {
        const distObj: Record<number, number> = {};
        const distances = typeof d.distances === 'string' ? JSON.parse(d.distances) : d.distances;
        for (const [targetIdStr, km] of Object.entries(distances)) {
          distObj[Number(targetIdStr)] = Number(km);
        }
        distMatrix[d.station_id] = distObj;
    });

    const busyFFs = new Set<number>();
    
    // Fetch Availability to enforce constraints
    const { data: dbAvailability } = await supabase.from('availability')
        .select('firefighter_id, preferences')
        .eq('date', targetDate)
        .eq('shift_type', targetShift);

    const availableFFMap = new Map<number, Set<string>>();
    dbAvailability?.forEach((a: any) => {
        let stIds = new Set<string>();
        if (a.preferences && Array.isArray(a.preferences.stations)) {
            stIds = new Set(a.preferences.stations.map(String));
        }
        availableFFMap.set(a.firefighter_id, stIds);
    });

    // Fetch Busy Assignments (if any exist for other requests not being rerun)
    const { data: busyAssignments } = await supabase.from('ot_assignments')
        .select('firefighter_id, ot_requests!inner(date, shift_type)')
        .eq('ot_requests.date', targetDate)
        .eq('ot_requests.shift_type', targetShift)
        .in('status', ['assigned', 'accepted']);
    busyAssignments?.forEach((a: any) => busyFFs.add(a.firefighter_id));

    // Fetch Pending Offers (for other requests)
    const { data: busyPendingOffers } = await supabase.from('ot_offers')
        .select('firefighter_id, ot_requests!inner(date, shift_type)')
        .eq('ot_requests.date', targetDate)
        .eq('ot_requests.shift_type', targetShift)
        .eq('status', 'sent');
    busyPendingOffers?.forEach((o: any) => busyFFs.add(o.firefighter_id));

    // Fetch Declined Offers (exclusions)
    const requestExclusions: Record<number, Set<number>> = {};
    const { data: declinedOffers } = await supabase.from('ot_offers')
        .select('firefighter_id, ot_request_id')
        .eq('status', 'declined');
    declinedOffers?.forEach((o: any) => {
        if (!requestExclusions[o.ot_request_id]) {
            requestExclusions[o.ot_request_id] = new Set<number>();
        }
        requestExclusions[o.ot_request_id].add(o.firefighter_id);
    });

    const ffs: Firefighter[] = firefighters.map((ff: any) => ({
        ...ff,
        station_name: ff.stations?.name || '',
        district: ff.stations?.district || '',
        area_id: ff.stations?.area_id || 0,
        qualifications: typeof ff.qualifications === 'string' ? JSON.parse(ff.qualifications) : (ff.qualifications || {})
    }));

    const otReqs: OTRequest[] = requests.map((r: any) => {
        const rank = (r.specialist_type === 'FF' || r.specialist_type === 'SO' || r.specialist_type === 'SSO' || r.specialist_type === 'SO_OR_SSO') ? r.specialist_type : 'FF';
        const rawQuals = typeof r.required_qualification_ids === 'string' ? JSON.parse(r.required_qualification_ids) : (r.required_qualification_ids || []);
        
        return {
          id: r.id,
          station_id: r.station_id,
          station_name: r.stations?.name || '',
          district: r.stations?.district || '',
          date: r.date,
          shift_type: r.shift_type,
          slots: Math.max(0, r.number_of_slots - r.number_filled),
          specialist_type: r.specialist_type,
          required_rank: rank,
          required_qualifications: rawQuals.map((q: string) => q.toLowerCase())
        };
    });

    const results = await allocateV2(otReqs, ffs, distMatrix, busyFFs, requestExclusions, availableFFMap);
    
    const assignments: any[] = [];
    for (const res of results) {
        const originalReq = requests.find((r: any) => r.id === res.requestId);
        for (const af of res.assignedFirefighters) {
            const originalFf = firefighters.find((f: any) => f.id === af.firefighter_id);
            assignments.push({ 
                req: originalReq, 
                ff: originalFf,
                metadata: {
                    distance_km: af.distance,
                    cascadePhase: af.cascadePhase,
                    must_might_wont: af.threshold,
                    group: af.assignedAtGroup
                }
            });
        }
    }

    return assignments;
}