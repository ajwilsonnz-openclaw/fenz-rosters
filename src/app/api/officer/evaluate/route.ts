import { NextRequest, NextResponse } from 'next/server';
import { canDoOT, getEligibleGroups } from '@/engine/allocation-engine-v2';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { requestId } = payload;
    
    if (!requestId) throw new Error("Missing requestId");

    const { data: vacancy, error: vError } = await supabase.from('ot_requests').select('*, stations(name, district)').eq('id', requestId).single();
    if (vError || !vacancy) throw new Error("Vacancy not found");

    // Best Practice Joins
    const { data: ffData } = await supabase.from('firefighters').select('*, stations(name, district)').eq('is_active', true);
    const { data: distData } = await supabase.from('station_distances').select('*');
    const { data: allAsgn } = await supabase.from('ot_assignments').select('*, ot_requests(*, stations(name))').neq('status', 'declined');
    
    const ffs = (ffData ||[]).map((ff: any) => ({ ...ff, station_name: ff.stations?.name || 'Unknown', district: ff.stations?.district || 'Unknown' }));

    const distanceMatrix: Record<number, any> = {};
    distData?.forEach((d: any) => { distanceMatrix[d.station_id] = d.distances; });

    const assignments = (allAsgn ||[]).filter((a: any) => {
      const req = Array.isArray(a.ot_requests) ? a.ot_requests[0] : a.ot_requests;
      return req?.date === vacancy.date && req?.shift_type === vacancy.shift_type;
    });

    // === PREDICTIVE PULLBACK CHAIN LOGIC ===
    const pullbackChain: any[] =[];
    let currentPullbackStationId = vacancy.station_id;
    let currentPullbackStationName = vacancy.stations?.name;
    const usedPullbackIds = new Set();

    while (currentPullbackStationId) {
      const pullbackCandidate = assignments?.find((a: any) => {
        const ff = ffs.find((f: any) => f.id === a.firefighter_id);
        const req = Array.isArray(a.ot_requests) ? a.ot_requests[0] : a.ot_requests;
        const assignedStationId = a.station_id || req?.station_id;
        return ff && ff.station_id === currentPullbackStationId && assignedStationId !== currentPullbackStationId && !usedPullbackIds.has(ff.id);
      });

      if (pullbackCandidate) {
        const ff = ffs.find((f: any) => f.id === pullbackCandidate.firefighter_id);
        const req = Array.isArray(pullbackCandidate.ot_requests) ? pullbackCandidate.ot_requests[0] : pullbackCandidate.ot_requests;
        const assignedStationId = pullbackCandidate.station_id || req?.station_id;
        const assignedStationName = req?.stations?.name || 'Unknown';

        pullbackChain.push({
          assignmentId: pullbackCandidate.id,
          ffId: ff.id,
          name: `${ff.first_name} ${ff.last_name}`,
          homeStation: currentPullbackStationName,
          currentlyAt: assignedStationName,
          currentlyAtId: assignedStationId,
          oldRequestId: req.id
        });
        
        usedPullbackIds.add(ff.id);
        currentPullbackStationId = assignedStationId; 
        currentPullbackStationName = assignedStationName;
      } else {
        break; 
      }
    }

    // === DIRECT CANDIDATES FOR THE FINAL HOLE ===
    const finalGapName = currentPullbackStationName;
    const finalGapDistrict = vacancy.stations?.district || vacancy.district;

    const assignedFfIds = new Set(assignments?.map((a: any) => a.firefighter_id) ||[]);
    let directFills = ffs.filter((ff: any) => {
      if (assignedFfIds.has(ff.id)) return false;
      if (!canDoOT(ff, vacancy.date, vacancy.shift_type).pass) return false;
      const groups = getEligibleGroups(ff, { date: vacancy.date, shift: vacancy.shift_type, station_name: finalGapName, district: finalGapDistrict, required_rank: vacancy.specialist_type || 'FF' } as any);
      if (groups.length === 0) return false;
      return true;
    }).map((ff: any) => {
       const dist = ff.station_name === finalGapName ? 0 : (distanceMatrix[ff.station_id]?.[finalGapName] || 999);
       const groups = getEligibleGroups(ff, { date: vacancy.date, shift: vacancy.shift_type, station_name: finalGapName, district: finalGapDistrict, required_rank: vacancy.specialist_type || 'FF' } as any);
       return { 
         id: ff.id, name: `${ff.first_name} ${ff.last_name}`, watch: ff.watch, rank: ff.rank, distance: dist, 
         otCount: (vacancy.shift_type === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0, group: groups[0], qualifications: ff.qualifications
       };
    });

    directFills.sort((a: any, b: any) => {
       if (a.group.id !== b.group.id) return a.group.id - b.group.id;
       if (a.otCount !== b.otCount) return a.otCount - b.otCount;
       return a.distance - b.distance;
    });

    return NextResponse.json({ 
      success: true, requestId, pullbackChain, candidates: directFills, currentGapStation: finalGapName, initialVacancyStation: vacancy.stations?.name
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}