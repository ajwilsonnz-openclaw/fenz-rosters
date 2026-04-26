import { NextRequest, NextResponse } from 'next/server';
import { canDoOT, getDistance, getEligibleGroups } from '@/engine/allocation-engine-v2';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { requestId } = payload;
    
    if (!requestId) throw new Error("Missing requestId");
    
    const supabase = getSupabaseAdmin();

    // 1. Fetch the actual vacancy details
    const { data: vacancy, error: vError } = await supabase
      .from('ot_requests')
      .select('*, stations(*)')
      .eq('id', requestId)
      .single();
    
    if (vError || !vacancy) throw new Error("Vacancy not found");

    // 2. Fetch Firefighters with Stations
    const { data: ffData, error: ffError } = await supabase
      .from('firefighters')
      .select('*, stations(*)');
    if (ffError) throw ffError;

    // 3. Fetch Distance Matrix
    const { data: distData, error: distError } = await supabase
      .from('station_distances')
      .select('*');
    if (distError) throw distError;

    // 4. Create a Name-to-ID map for distance lookup
    const nameToId: Record<string, number> = {};
    ffData.forEach((ff: any) => { if (ff.stations?.name) nameToId[ff.stations.name] = ff.stations.id; });

    const distanceMatrix: Record<number, any> = {};
    distData.forEach((d: any) => { distanceMatrix[d.station_id] = d.distances; });

    const ffs = ffData.map((ff: any) => {
      const station = ff.stations;
      return { 
        ...ff, 
        station_name: station?.name || 'Unknown', 
        district: station?.district || 'Unknown',
        is_traveling_today: false 
      };
    });
    
    const gapToFill = vacancy.stations?.name;

    // 5. Fetch Existing Assignments for this Date/Shift
    // We join with ot_requests to get the date/shift info
    let { data: assignments, error: aError } = await supabase
      .from('ot_assignments')
      .select('id, firefighter_id, ot_request_id, station_id, ot_requests!inner(date, shift_type, station_id, specialist_type)')
      .eq('ot_requests.date', vacancy.date)
      .eq('ot_requests.shift_type', vacancy.shift_type);
    
    if (aError) {
      console.warn("Join failed, trying manual mapping:", aError.message);
      // Fallback: Fetch all assignments and filter manually if join fails
      const { data: allAsgn } = await supabase.from('ot_assignments').select('*');
      const { data: allReqs } = await supabase.from('ot_requests').select('id, date, shift_type').eq('date', vacancy.date).eq('shift_type', vacancy.shift_type);
      
      const validReqIds = new Set(allReqs?.map((r: any) => r.id));
      const filteredAsgn = allAsgn?.filter((a: any) => validReqIds.has(a.ot_request_id)) || [];
      // Assign to assignments for the rest of the logic
      assignments = filteredAsgn as any;
    }

    // 6. Build the Domino Chain
    const dominoChain: any[] = [];
    let currentHole = gapToFill;
    let found = true;
    const usedIds = new Set();
    
    // Create a Station ID to Name map for manual mapping
    const stationIdToName: Record<number, string> = {};
    ffData.forEach((ff: any) => { if (ff.stations) stationIdToName[ff.stations.id] = ff.stations.name; });

    while (found) {
      found = false;
      const assignment = assignments?.find((a: any) => {
        const request = Array.isArray(a.ot_requests) ? a.ot_requests[0] : a.ot_requests;
        const sId = a.station_id || request?.station_id;
        const assignedStationName = stationIdToName[sId];
        return assignedStationName === currentHole && !usedIds.has(a.firefighter_id);
      });

      if (assignment) {
        const ff = ffs.find((f: any) => f.id === assignment.firefighter_id);
        if (ff && ff.station_name !== currentHole) {
          dominoChain.push({
            name: `${ff.first_name} ${ff.last_name}`,
            movesTo: currentHole,
            leavesHoleAt: ff.station_name
          });
          usedIds.add(ff.id);
          currentHole = ff.station_name;
          found = true;
        }
      }
    }

    // NEW: If no domino chain exists from assignments, 
    // and we are evaluating a NEW vacancy, let's look at the candidates pool later 
    // and potentially show a preview of the first one if it creates a domino.
    // (We'll do this after calculating directFills)

    const gapStationId = vacancy.station_id;
    const gapDistrict = vacancy.stations?.district || vacancy.district;

    // Direct Fill Pool (Firefighters NOT already assigned)
    const assignedFfIds = new Set(assignments?.map((a: any) => a.firefighter_id) || []);

    const directFills = ffs.filter((ff: any) => {
      if (assignedFfIds.has(ff.id)) return false;
      
      const elig = canDoOT(ff, vacancy.date, vacancy.shift_type);
      if (!elig.pass) return false;

      // Use the engine's group logic to check rank eligibility
      const groups = getEligibleGroups(ff, { 
          date: vacancy.date, 
          shift: vacancy.shift_type, 
          station_name: currentHole, 
          district: gapDistrict, 
          required_rank: vacancy.specialist_type || 'FF' 
      } as any);
      
      if (groups.length === 0) return false;

      // Qualifications check
      const reqQuals = Array.isArray(vacancy.required_qualification_ids) 
        ? vacancy.required_qualification_ids 
        : JSON.parse(vacancy.required_qualification_ids || '[]');
      
      for (const q of reqQuals) {
        if (!ff.qualifications?.[q.toLowerCase()]) return false;
      }

      return true;
    }).map((ff: any) => {
       const stationDistances = distanceMatrix[ff.station_id] || {};
       const dist = stationDistances[currentHole] || 999;
       
       const otCount = (vacancy.shift_type === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0;
       
       const groups = getEligibleGroups(ff, { 
           date: vacancy.date, 
           shift: vacancy.shift_type, 
           station_name: currentHole, 
           district: gapDistrict, 
           required_rank: vacancy.specialist_type || 'FF' 
       } as any);
       const groupInfo = groups[0];
       
       return { 
         id: ff.id,
         name: `${ff.first_name} ${ff.last_name}`, 
         watch: ff.watch,
         rank: ff.rank,
         distance: dist, 
         otCount, 
         group: groupInfo 
       };
    });

    directFills.sort((a: any, b: any) => {
       if (a.group.id !== b.group.id) return a.group.id - b.group.id;
       if (a.otCount !== b.otCount) return a.otCount - b.otCount;
       return a.distance - b.distance;
    });

    // Domino Visual: Only show moves for firefighters already assigned
    const finalGap = currentHole;

    return NextResponse.json({ 
      success: true, 
      requestId,
      dominoChain, 
      candidates: directFills, 
      currentGapStation: finalGap 
    });
  } catch (err: any) {
    console.error("Evaluation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
