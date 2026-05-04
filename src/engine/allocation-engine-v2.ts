import { supabase } from '@/lib/supabase';
import { canDoOT, Watch } from './watch-math';

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
    stations: number[];
  };
}

export type DistanceMatrix = Record<number, Record<number, number>>;

export const GROUPS = {
  STATION_NATIVE: 'Station Native',
  DISTRICT_NATIVE: 'District Native',
  REGION_NATIVE: 'Region Native',
  STEP_UP: 'Step Up',
  STEP_DOWN: 'Step Down'
};

export { canDoOT };

export function getDistance(fromId: number, toId: number, matrix: DistanceMatrix): number {
  if (fromId === toId) return 0;
  return matrix[fromId]?.[toId] ?? 999;
}

export function getExecutionOrder() {
  return [
    GROUPS.STATION_NATIVE,
    GROUPS.DISTRICT_NATIVE,
    GROUPS.REGION_NATIVE,
    GROUPS.STEP_UP,
    GROUPS.STEP_DOWN
  ];
}

export function getEligibleGroups(ff: Firefighter, req: OTRequest): string[] {
  const eligible = [];
  
  // Native logic
  if (ff.station_id === req.station_id) {
    eligible.push(GROUPS.STATION_NATIVE);
  } else if (ff.district === req.district) {
    eligible.push(GROUPS.DISTRICT_NATIVE);
  } else {
    eligible.push(GROUPS.REGION_NATIVE);
  }

  // Rank logic
  if (req.required_rank === 'SO_OR_SSO') {
    if (ff.rank === 'SO' || ff.rank === 'SSO') {
        // Natural match
    } else {
        // Step up? FF can't step up to SO in this simple logic
    }
  } else if (ff.rank === req.required_rank) {
    // Natural match
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
    for (const group of getExecutionOrder()) {
        surplus[group] = 0;
    }

    for (const ff of firefighters) {
        const canWork = canDoOT(ff, date, shift);
        if (!canWork.pass) continue;

        // In a real run, we'd check if they are already assigned. 
        // For dashboard surplus, we just count everyone who COULD work.
        for (const req of requests) {
            const groups = getEligibleGroups(ff, req);
            for (const g of groups) {
                surplus[g]++;
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
        assignedFirefighters: sorted.slice(0, req.slots).map(f => ({
          firefighter_id: f.id,
          name: `${f.first_name} ${f.last_name}`,
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