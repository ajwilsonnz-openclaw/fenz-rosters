'use client';


import { useState, useEffect, Suspense, Fragment } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getOperationalTime, getWatchColor } from '@/engine/ui-helpers';
import { canDoOT, getEligibleGroups, getDistance, calculateSurplus, getExecutionOrder, GROUPS } from '@/engine/allocation-engine-v2';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import { supabase } from '@/lib/supabase';
import { Trash2, Activity, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 15, 16, 17, 18, 7, 8, 11, 12, 13, 14, 9, 10];

const WatchBadge = ({ watch }: { watch: string }) => {
  const color = getWatchColor(watch);
  return (
    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}>
      {watch}
    </span>
  );
};

function renderQuals(quals: any, qualDict: Record<string, string>) {
  const hasNotRookie = quals && (quals['not_rookie'] || quals['NOT_ROOKIE']);
  const rawQuals = Object.entries(quals || {}).filter(([q, v]) => v && q.toLowerCase() !== 'not_rookie').map(([q]) => q);
  const uniqueQuals = Array.from(new Set(rawQuals.map(q => {
    const upper = q.toUpperCase();
    return qualDict[upper] || upper;
  })));
  return (
    <div className="flex flex-wrap gap-1">
      {uniqueQuals.map(q => (
        <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
      ))}
      {!hasNotRookie && (
        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-red-100/50">Rookie</span>
      )}
    </div>
  );
}

function checkQualificationsLocal(ff: any, quals: string[]): boolean {
  if (!quals || quals.length === 0) return true;
  for (const q of quals) {
    const hasQual = ff.qualifications && (ff.qualifications[q] || ff.qualifications[q.toLowerCase()] || ff.qualifications[q.toUpperCase()]);
    if (!hasQual) return false;
  }
  return true;
}

const renderAuditTrail = (r: any) => {
  const badgeBase = "w-28 block text-center py-1 rounded shadow-sm border font-black uppercase tracking-widest text-[9px]";

  if (r.isAssigned) {
    if (r.isOffer) {
      return <span className={`${badgeBase} bg-amber-50 text-amber-600 border-amber-200`}>Offer Pending</span>;
    } else if (r.status === 'accepted') {
      return <span className={`${badgeBase} bg-green-50 text-green-600 border-green-200`}>Offer Accepted</span>;
    } else {
      return <span className={`${badgeBase} bg-blue-50 text-blue-600 border-blue-200`}>Manual Assign</span>;
    }
  }

  if (!r.reason) return null;

  if (r.reason.startsWith('Declined:')) {
    const reasonText = r.reason.replace('Declined:', '').trim();
    return (
      <div className="flex flex-col items-center w-28"> {/* Changed to items-center */}
        <span className={`${badgeBase} bg-red-50 text-red-600 border-red-200`}>Declined</span>
        <span className="text-[8px] font-bold text-red-400/80 leading-tight mt-0.5 text-center">{reasonText}</span>
      </div>
    );
  }

  if (r.reason.startsWith('Bypassed for')) {
    const parts = r.reason.split(' by ');
    const who = parts.length > 1 ? parts[1].replace('Distance: ', '').replace('.', '') : "Unfilled";
    return (
      <div className="flex flex-col items-center w-28"> {/* Changed to items-center */}
        <span className={`${badgeBase} bg-gray-100 text-gray-500 border-gray-200`}>Bypassed</span>
        <span className="text-[8px] font-bold text-gray-400/80 leading-tight mt-0.5 text-center">by {who}</span>
      </div>
    );
  }

  const label = r.reason.startsWith('Not qualified') ? 'Not Qualified' :
    r.reason.startsWith('Group not required') ? 'Group Unneeded' : 'Filtered';

  return <span className={`${badgeBase} bg-gray-50 text-gray-400/60 border-gray-100`}>{label}</span>;
};

function FilledContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [opTime, setOpTime] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlDate = searchParams.get('date');
      const urlShift = searchParams.get('shift');
      if (urlDate && urlShift) {
        const d = new Date(urlDate);
        d.setHours(0, 0, 0, 0);
        return { date: d, shift: urlShift as 'Day' | 'Night' };
      }
      const sDate = sessionStorage.getItem('fenz_op_date');
      const sShift = sessionStorage.getItem('fenz_op_shift');
      if (sDate && sShift) return { date: new Date(sDate), shift: sShift as 'Day' | 'Night' };
    }
    return getOperationalTime(new Date());
  });
  const { date: operativeDate, shift: operativeShift } = opTime;

  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showUnassigned, setShowUnassigned] = useState(false); // Default to false

  const [stations, setStations] = useState<any[]>([]);
  const [filledAssignments, setFilledAssignments] = useState<any[]>([]);
  const [baselineData, setBaselineData] = useState<{ firefighters: any[], requests: any[], distMatrix: any, availableFFMap?: Map<number, Set<string>> }>({ firefighters: [], requests: [], distMatrix: {} });
  const [qualDict, setQualDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));

    const urlDate = searchParams.get('date');
    const urlShift = searchParams.get('shift');
    let finalDate = operativeDate;
    let finalShift = operativeShift;

    if (urlDate && urlShift) {
      const d = new Date(urlDate);
      d.setHours(0, 0, 0, 0);
      finalDate = d;
      finalShift = urlShift as 'Day' | 'Night';
    }
    setOpTime({ date: finalDate, shift: finalShift });
    setTimeout(() => setIsHydrated(true), 0);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!isHydrated) return;
    sessionStorage.setItem('fenz_region', regionParam);
    sessionStorage.setItem('fenz_district', districtParam);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [regionParam, districtParam, selectedRanks, isHydrated]);

  const fetchData = async () => {
    setLoading(true);
    const dateStr = operativeDate.toLocaleDateString('en-CA');

    const { data: qualData } = await supabase.from('qualifications').select('code, short_name');
    const qMap: Record<string, string> = {};
    if (qualData) qualData.forEach((q: any) => { qMap[q.code.toUpperCase()] = q.short_name || q.code; });
    setQualDict(qMap);

    // Inside your fetchData function in filled/page.tsx:
    const { data: stationData } = await supabase.from('stations').select('*').order('name');
    if (stationData) {
      setStations(stationData);
      // This line generates the unique districts for the sidebar dropdown:
      const districts = Array.from(new Set(stationData.map((s: any) => s.district)))
        .filter(Boolean)
        .map(d => ({ id: d as string, name: d as string }))
        .sort((a, b) => a.name.localeCompare(b.name));
        
      // We need a state for this if the sidebar is inside the page, 
      // but if we move it to the layout, we pass it there.
    }

    const { data: distData } = await supabase.from('station_distances').select('*');
    const nameToId: Record<string, number> = {};
    stationData?.forEach((s: any) => { nameToId[s.name] = s.id; });

    const distMatrix: any = {};
    distData?.forEach((d: any) => {
      const distObj: Record<number, number> = {};
      const distances = typeof d.distances === 'string' ? JSON.parse(d.distances) : d.distances;
      for (const [targetIdStr, km] of Object.entries(distances)) {
        distObj[Number(targetIdStr)] = Number(km);
      }
      distMatrix[d.station_id] = distObj;
    });

    const { data: ffData } = await supabase.from('firefighters').select(`*, stations (name, district)`).eq('is_active', true);
    const { data: reqData } = await supabase.from('ot_requests').select(`*, stations (name, district)`).eq('date', dateStr).eq('shift_type', operativeShift);

    const { data: availData } = await supabase.from('availability').select('firefighter_id, preferences').eq('date', dateStr).eq('shift_type', operativeShift);
    const availableFFMap = new Map<number, Set<string>>();
    availData?.forEach((a: any) => {
      let stIds = new Set<string>();
      if (a.preferences && Array.isArray(a.preferences.stations)) {
        stIds = new Set(a.preferences.stations.map(String));
      }
      availableFFMap.set(a.firefighter_id, stIds);
    });

    const { data: assignmentData } = await supabase
      .from('ot_assignments')
      .select(`
        id, status, distance_km, assigned_at, declined_reason, callback_type, must_might_wont,
        firefighter_id, ot_request_id,
        ot_requests!inner ( id, date, shift_type, station_id, specialist_type, required_qualification_ids, stations ( name, district ) ),
        firefighters (
          id, first_name, last_name, rank, watch, station_id, stations ( name, district ), qualifications,
          ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights
        )
      `)
      .eq('ot_requests.date', dateStr)
      .eq('ot_requests.shift_type', operativeShift);

    const { data: offerData } = await supabase
      .from('ot_offers')
      .select(`
        id, status, offered_at, deadline, metadata, decline_reason,
        firefighter_id, ot_request_id,
        ot_requests!inner ( id, date, shift_type, station_id, specialist_type, required_qualification_ids, stations ( name, district ) ),
        firefighters (
          id, first_name, last_name, rank, watch, station_id, stations ( name, district ), qualifications,
          ot_count_days, ot_count_nights, ot_count_callback_days, ot_count_callback_nights, ot_count_noncallback_days, ot_count_noncallback_nights
        )
      `)
      .eq('ot_requests.date', dateStr)
      .eq('ot_requests.shift_type', operativeShift)
      .in('status', ['sent', 'declined']);

    const validAssignments = (assignmentData || []).map(a => ({ ...a, isOffer: false }));
    const validOffers = (offerData || []).map(o => ({
      id: o.id,
      isOffer: true,
      status: o.status,
      distance_km: o.metadata?.distance_km || 0,
      assigned_at: o.offered_at,
      declined_reason: o.decline_reason,
      callback_type: o.metadata?.cascadePhase,
      must_might_wont: o.metadata?.must_might_wont || 'must',
      firefighter_id: o.firefighter_id,
      ot_request_id: o.ot_request_id,
      ot_requests: o.ot_requests,
      firefighters: o.firefighters
    }));

    setFilledAssignments([...validAssignments, ...validOffers]);

    const mappedFF = (ffData || []).map(ff => ({
      ...ff,
      station_name: ff.stations?.name || 'Unknown',
      district: ff.stations?.district || ff.district || 'Unknown',
      qualifications: typeof ff.qualifications === 'string' ? JSON.parse(ff.qualifications) : (ff.qualifications || {})
    }));

    const mappedReqs = (reqData || []).map(r => {
      const rank = (r.specialist_type === 'FF' || r.specialist_type === 'SO' || r.specialist_type === 'SSO' || r.specialist_type === 'SO_OR_SSO') ? r.specialist_type : 'FF';
      const rawQuals = typeof r.required_qualification_ids === 'string' ? JSON.parse(r.required_qualification_ids) : (r.required_qualification_ids || []);
      const cleanQuals = rawQuals.map((q: string) => q.toLowerCase());
      return { ...r, required_rank: rank, required_qualifications: cleanQuals, station_name: r.stations?.name || '', district: r.stations?.district || '' };
    });

    setBaselineData({ firefighters: mappedFF, requests: mappedReqs, distMatrix, availableFFMap });
    setLoading(false);
  };

  useEffect(() => {
    if (isHydrated) {
      fetchData();

      // Subscribe to real-time updates for assignments and offers
      const channel = supabase.channel('filled-dashboard-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_assignments' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_offers' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [operativeDate, operativeShift, isHydrated]);

  const handleRemoveClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setRemoveDialogOpen(true);
  };

  const executeRemoveAndProceed = async () => {
    setIsRemoving(true);
    const reason = prompt("Please enter a reason for revoking this assignment:");
    if (!reason) {
        setIsRemoving(false);
        return; // Cancelled
    }

    try {
      if (selectedAssignment.isOffer) {
        await fetch('/api/allocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'handle_decline', offerId: selectedAssignment.assignId, reason })
        });
      } else {
        await fetch('/api/allocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              action: 'revoke_assignment', 
              assignmentId: selectedAssignment.assignId, 
              requestId: selectedAssignment.ot_request_id,
              ffId: selectedAssignment.firefighter_id,
              reason
          })
        });
      }
      setRemoveDialogOpen(false);
      fetchData();
    } catch (err) { console.error(err); } finally { setIsRemoving(false); }
  };

  // RESTORED: Derivation for Sidebar
  const sidebarDistricts = Array.from(new Set(stations.map(s => s.district))).filter(Boolean).map(d => ({ id: d as string, name: d as string })).sort((a, b) => a.name.localeCompare(b.name));

  const globalAssignedIds = new Set(filledAssignments.filter(a => a.status !== 'declined').map(a => a.firefighter_id));
  const dateStr = [operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
  const isDay = operativeShift === 'Day';

  const isSurplus = calculateSurplus(baselineData.requests as any, baselineData.firefighters as any, dateStr, operativeShift, baselineData.availableFFMap || new Map());

  const groupTables = DISPLAY_ORDER.map(groupId => {
    const group = GROUPS.find(g => g.id === groupId)!;
    const assignedToGroup = filledAssignments.filter(a => a.callback_type === group.phase && a.status !== 'declined');

    const mappedAssigned = assignedToGroup.map(a => {
      const ff = Array.isArray(a.firefighters) ? a.firefighters[0] : a.firefighters;
      const req = Array.isArray(a.ot_requests) ? a.ot_requests[0] : a.ot_requests;
      const isOfficerGroup = group.targetRank !== 'FF';
      const isHomeStation = ff?.station_id === req?.station_id;
      const rawOt = group.isCallback ? (isDay ? ff?.ot_count_callback_days : ff?.ot_count_callback_nights) : (isDay ? ff?.ot_count_noncallback_days : ff?.ot_count_noncallback_nights);
      const otCount = (isOfficerGroup && isHomeStation) ? Math.max(0, (rawOt || 0) - 2) : (rawOt || 0);
      const reqDistrict = req?.stations?.district || 'Unknown';
      let thresholdString = a.must_might_wont;
      if (thresholdString === 'wont') thresholdString = 'Backup';
      if (thresholdString === 'might') thresholdString = 'Maybe';
      if (thresholdString === 'must') thresholdString = 'Must';

      return {
        ...ff, district: ff?.district, isAssigned: true, isOffer: a.isOffer, status: a.status, assignId: a.id, ot_request_id: a.ot_request_id,
        dist: a.distance_km, otCount, tgtStation: req?.stations?.name, reqDistrict,
        threshold: thresholdString || 'Must',
        reason: a.isOffer ? 'Offer Pending' : (a.status === 'accepted' ? 'Offer Accepted' : 'Manual Assign')
      };
    });

    const unassignedInGroup = baselineData.firefighters.filter(ff => {
      if (globalAssignedIds.has(ff.id)) return false;
      if (!canDoOT(ff, dateStr, operativeShift).pass) return false;
      const validReqs = baselineData.requests.filter(req => {
        const eligGroups = getEligibleGroups(ff, { ...req, date: dateStr, shift_type: operativeShift } as any, isSurplus);
        return eligGroups.some(g => g.id === group.id);
      });
      if (validReqs.length === 0) return false;
      ff.validReqs = validReqs;
      return true;
    }).map(ff => {
      const unqualifiedReqs: any[] = [];
      const qualifiedReqs: any[] = [];
      for (const r of ff.validReqs) {
        if (checkQualificationsLocal(ff, r.required_qualifications)) qualifiedReqs.push(r);
        else unqualifiedReqs.push(r);
      }
      let bestReq = qualifiedReqs.length > 0 ? qualifiedReqs[0] : unqualifiedReqs[0];
      let minDist = 999;
      const reqListToSearch = qualifiedReqs.length > 0 ? qualifiedReqs : unqualifiedReqs;
      for (const r of reqListToSearch) {
        const d = getDistance(ff.station_id, r.station_id, baselineData.distMatrix);
        if (d < minDist) { minDist = d; bestReq = r; }
      }
      const isOfficerGroup = group.targetRank !== 'FF';
      const isHomeStation = ff.station_id === bestReq.station_id;
      const rawOt = group.isCallback ? (isDay ? ff.ot_count_callback_days : ff.ot_count_callback_nights) : (isDay ? ff.ot_count_noncallback_days : ff.ot_count_noncallback_nights);
      const otCount = (isOfficerGroup && isHomeStation) ? Math.max(0, rawOt - 2) : rawOt;
      let threshold = 'Backup';
      const declinedOffer = filledAssignments.find(a => a.firefighter_id === ff.id && a.ot_request_id === bestReq.id && a.status === 'declined');
      if (declinedOffer) {
        let storedThreshold = declinedOffer.must_might_wont || 'Backup';
        if (storedThreshold === 'might') storedThreshold = 'Maybe';
        if (storedThreshold === 'must') storedThreshold = 'Must';
        
        return { 
            ...ff, 
            isAssigned: false, 
            tgtStation: bestReq.station_name, 
            reqDistrict: bestReq.district, 
            dist: minDist === 999 ? 'N/A' : minDist, 
            otCount, 
            threshold: storedThreshold, 
            reason: `Declined: ${declinedOffer.declined_reason || 'No reason'}` 
        };
      }
      let reasonParts: string[] = [];
      if (unqualifiedReqs.length > 0 && qualifiedReqs.length === 0) reasonParts.push(`Not qualified for: ${Array.from(new Set(unqualifiedReqs.map((r: any) => r.station_name))).join(', ')}.`);
      if (qualifiedReqs.length > 0) {
        const assignedToThisReq = mappedAssigned.filter(a => a.ot_request_id === bestReq.id);
        if (assignedToThisReq.length > 0) {
          assignedToThisReq.sort((a, b) => { if (a.otCount !== b.otCount) return a.otCount - b.otCount; return (a.dist || 0) - (b.dist || 0); });
          const worstWinner = assignedToThisReq[assignedToThisReq.length - 1];
          if (otCount < worstWinner.otCount) threshold = 'Must'; 
          else if (otCount === worstWinner.otCount) threshold = 'Maybe'; 
          else threshold = 'Backup';
          reasonParts.push(`Bypassed for ${bestReq.station_name} by ${worstWinner.first_name} ${worstWinner.last_name} (Distance: ${worstWinner.dist || 0}km).`);
        } else {
          const reqFilledElsewhere = filledAssignments.filter(a => a.ot_request_id === bestReq.id && a.status !== 'declined').length;
          const slotsLeft = (bestReq.number_of_slots || 1) - reqFilledElsewhere;
          
          if (slotsLeft <= 0) { 
            threshold = 'Backup'; 
            reasonParts.push(`Group not required. Vacancies filled by higher priority.`); 
          } else {
            // Tie-break detection for unassigned:
            // Count how many people in this SAME group have the SAME OT count.
            const samePriorityCount = baselineData.firefighters.filter(f => {
                if (globalAssignedIds.has(f.id)) return false;
                const elig = getEligibleGroups(f, bestReq as any, isSurplus);
                if (!elig.some(g => g.id === group.id)) return false;
                const rawOt = group.isCallback ? (isDay ? f.ot_count_callback_days : f.ot_count_callback_nights) : (isDay ? f.ot_count_noncallback_days : f.ot_count_noncallback_nights);
                const ffOt = (group.targetRank !== 'FF' && f.station_id === bestReq.station_id) ? Math.max(0, rawOt - 2) : rawOt;
                return ffOt === otCount;
            }).length;

            threshold = samePriorityCount > slotsLeft ? 'Maybe' : 'Must';
            reasonParts.push(`Bypassed for ${bestReq.station_name} (Pending/Unfilled).`); 
          }
        }
      }
      return { ...ff, isAssigned: false, tgtStation: bestReq.station_name, reqDistrict: bestReq.district, dist: minDist === 999 ? 'N/A' : minDist, otCount, threshold, reason: reasonParts.join(' ').trim() };
    });

    const combined = [...mappedAssigned, ...unassignedInGroup].sort((a, b) => {
      if (a.reqDistrict !== b.reqDistrict) return a.reqDistrict.localeCompare(b.reqDistrict);
      if (a.tgtStation !== b.tgtStation) return a.tgtStation.localeCompare(b.tgtStation);
      if (a.isAssigned !== b.isAssigned) return a.isAssigned ? -1 : 1;
      if (a.threshold !== b.threshold) return a.threshold === 'Must' ? -1 : (a.threshold === 'Maybe' ? -1 : 1);
      if (a.otCount !== b.otCount) return a.otCount - b.otCount;
      return (a.dist === 'N/A' ? 999 : a.dist) - (b.dist === 'N/A' ? 999 : b.dist);
    });

    if (combined.length === 0) return null;
    const finalUiRows = combined.filter(r => showUnassigned || r.isAssigned);
    if (finalUiRows.length === 0) return null;
    const rowsByDistrict = finalUiRows.reduce((acc, r) => { if (!acc[r.reqDistrict]) acc[r.reqDistrict] = []; acc[r.reqDistrict].push(r); return acc; }, {} as Record<string, any[]>);

    return (
      <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6 shrink-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">{group.name}</h2>
          <span className="bg-white text-gray-600 px-3 py-1 rounded-full text-[10px] font-black border border-gray-200 uppercase">
            {mappedAssigned.length} Filled
          </span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-100 shadow-sm">
            <tr>
              <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
              <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Target</th>
              <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Dist</th>
              <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
              <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">{group.isCallback ? 'CB #' : 'NCB #'}</th>
              <th className="px-3 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
              <th className="px-2 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center w-[160px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(Object.entries(rowsByDistrict) as [string, any[]][]).map(([district, rows]) => (
              <Fragment key={district}>
                <tr className="bg-gray-50/50">
                  <td colSpan={7} className="px-6 py-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] border-y border-gray-100/50">{district} District</td>
                </tr>
                {rows.map((r: any, i: number) => (
                  <tr key={i} className={`hover:bg-gray-50/50 transition-colors text-xs ${!r.isAssigned ? 'opacity-60 bg-gray-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <WatchBadge watch={r.watch} />
                        <div><div className="font-bold text-gray-900">{r.first_name} {r.last_name}</div><div className="text-[9px] text-gray-500 font-bold uppercase">{r.rank} • {r.station_name}</div></div>
                      </div>
                    </td>
                    <td className="px-3 py-4"><div className="font-black text-gray-700">{r.tgtStation}</div><div className="text-[9px] font-bold text-gray-400 uppercase">{r.reqDistrict}</div></td>
                    <td className="px-3 py-4 font-black text-center text-blue-600">{r.dist === 'N/A' ? 'N/A' : `${r.dist}km`}</td>
                    <td className="px-3 py-4">{renderQuals(r.qualifications, qualDict)}</td>
                    <td className="px-3 py-4 font-black text-center text-blue-900">{r.otCount || 0}</td>
                    <td className="px-3 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${r.threshold?.toLowerCase() === 'must' ? 'bg-green-50 text-green-700 border-green-200' : r.threshold?.toLowerCase() === 'might' || r.threshold?.toLowerCase() === 'maybe' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {r.threshold?.toLowerCase() === 'might' ? 'Maybe' : r.threshold}
                      </span>
                    </td>
                    {/* Find this section inside your rows.map loop */}
                    <td className="px-2 py-4 w-[160px]">
                      <div className="flex items-center justify-center gap-2">
                        {/* 1. The Badge (Offer Pending, Bypassed, etc.) */}
                        <div className="flex-shrink-0">
                          {renderAuditTrail(r)}
                        </div>

                        {/* 2. The Action Column (Trash can) or Ghost Spacer */}
                        <div className="w-9 flex justify-center flex-shrink-0">
                          {r.isAssigned ? (
                            <button
                              onClick={() => handleRemoveClick(r)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all inline-flex items-center justify-center"
                              title={r.isOffer ? "Revoke Offer" : "Remove Assignment"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            /* This keeps Bypassed badges from shifting to the right since they have no trash can */
                            <div className="w-8 h-8" />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  });

      return (
    <div className="flex flex-col h-full overflow-hidden">
      <DateToolbar operativeDate={operativeDate} operativeShift={operativeShift} setOpTime={setOpTime} />
      
      <main className="flex-1 overflow-y-auto bg-[#f3f7fa] p-8 block">
        <div className="flex flex-col gap-6 max-w-full mx-auto">
          
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-200 mb-2">
             <div>
               <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">Assignment Results</h2>
               <p className="text-[10px] font-bold text-gray-500">Filtered by Target District</p>
             </div>
             <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all">
                <input type="checkbox" checked={showUnassigned} onChange={e => setShowUnassigned(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest select-none">Show Audit Trail (Unassigned)</span>
             </label>
          </div>
              {groupTables.filter(Boolean).length > 0 ? groupTables : (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <ShieldAlert className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No assignments or audits for this shift.</p>
                </div>
              )}
            </div>
          </main>

          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-600">
                  {selectedAssignment?.isOffer ? "Revoke Pending Offer?" : "Remove Overtime?"}
                </DialogTitle>
                <DialogDescription className="text-xs font-bold text-gray-500 mt-2">
                  This will unassign the firefighter and reopen the vacancy. Please provide a reason:
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-4">
                <Button variant="destructive" onClick={executeRemoveAndProceed} disabled={isRemoving} className="h-14 justify-start px-6 rounded-xl border-red-200 hover:bg-red-50 text-red-800 font-bold w-full bg-red-100">
                  <span className="flex flex-col items-start text-left w-full">
                    <span className="uppercase tracking-widest text-[10px] font-black text-red-600">Revoke Assignment</span>
                    <span className="text-xs font-medium text-red-400">Cancel offer and notify</span>
                  </span>
                </Button>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setRemoveDialogOpen(false)} className="rounded-xl font-bold uppercase tracking-wider text-xs text-gray-400">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    );
}

export default function FilledPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#f3f7fa]"><div className="flex flex-col items-center gap-4 animate-pulse"><Activity className="w-8 h-8 text-blue-500" /><span className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Workspace...</span></div></div>}>
      <FilledContent />
    </Suspense>
  );
}