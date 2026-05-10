'use client';


import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname, } from 'next/navigation';
import { Activity, Sun, Moon, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOperationalTime, getWatchColor } from '@/engine/ui-helpers';
import { Watch, getCallbackType, getOnDutyWatch } from '@/engine/watch-math';
import { canDoOT } from '@/engine/allocation-engine-v2';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";

const getPrimaryCallbackWatch = (date: Date, shift: 'Day' | 'Night'): Watch | null => {
  const WATCHES: Watch[] = ['Red', 'Green', 'Brown', 'Blue'];
  for (const w of WATCHES) {
    const cb = getCallbackType(w, date);
    if (!cb) continue;
    if (shift === 'Day' && (cb === '#1-BeforeDay1' || cb === '#2b-DayOfNight1')) return w;
    if (shift === 'Night' && (cb === '#2a-EveningDay2' || cb === '#3-AfterLastNight')) return w;
  }
  return null;
};

function shortenQual(q: string) {
  if (!q) return '';
  const u = q.toUpperCase();
  if (u === 'TYPE4') return 'T4';
  if (u === 'DRIVER') return 'DR';
  if (u === 'PRT') return 'PRT';
  if (u === 'CBR') return 'CBR';
  return u;
}

function renderQuals(quals: any) {
  const hasNotRookie = quals && (quals['not_rookie'] || quals['NOT_ROOKIE']);
  const validQuals = Object.entries(quals || {}).filter(([q, v]) => v && q.toLowerCase() !== 'not_rookie').map(([q]) => q);

  return (
    <div className="flex flex-wrap gap-1">
      {validQuals.map(q => <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{shortenQual(q)}</span>)}
      {!hasNotRookie && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-red-100/50">Rookie</span>}
    </div>
  );
}

function RostersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<any[]>([]);
  const [baselineData, setBaselineData] = useState<{ firefighters: any[], requests: any[], assignedIds: Set<number>, availableIds: Set<number> }>({ firefighters: [], requests: [], assignedIds: new Set(), availableIds: new Set() });

  const [opTime, setOpTime] = useState(getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [searchTerm, setSearchTerm] = useState('');

  const [isHydrated, setIsHydrated] = useState(false);
  const [isDeletingReq, setIsDeletingReq] = useState<number | null>(null);

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
    } else {
      const sDate = sessionStorage.getItem('fenz_op_date');
      const sShift = sessionStorage.getItem('fenz_op_shift');
      if (sDate && sShift) {
        finalDate = new Date(sDate);
        finalShift = sShift as 'Day' | 'Night';
      }
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('date', finalDate.toLocaleDateString('en-CA'));
      newParams.set('shift', finalShift);
      router.replace(`${pathname}?${newParams.toString()}`);
    }

    setOpTime(prev => {
      if (prev.date.toDateString() === finalDate.toDateString() && prev.shift === finalShift) return prev;
      return { date: finalDate, shift: finalShift };
    });
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

    const { data: stationData } = await supabase.from('stations').select('*').order('name');
    if (stationData) setStations(stationData);

    const { data: ffData } = await supabase.from('firefighters').select(`*, stations (name, district)`).eq('is_active', true);
    const { data: reqData } = await supabase.from('ot_requests').select(`*, stations (name, district)`).eq('date', dateStr).eq('shift_type', operativeShift);

    const { data: assignmentData } = await supabase.from('ot_assignments').select('firefighter_id, ot_requests!inner(date, shift_type)').eq('ot_requests.date', dateStr).eq('ot_requests.shift_type', operativeShift).neq('status', 'declined');
    
    // Also consider pending offers as "assigned" for availability purposes
    const { data: offerData } = await supabase.from('ot_offers').select('firefighter_id, ot_requests!inner(date, shift_type)').eq('ot_requests.date', dateStr).eq('ot_requests.shift_type', operativeShift).eq('status', 'sent');

    const assignedIds = new Set([
        ...(assignmentData?.map((a: any) => a.firefighter_id) || []),
        ...(offerData?.map((o: any) => o.firefighter_id) || [])
    ]);

    const { data: availData } = await supabase.from('availability').select('firefighter_id').eq('date', dateStr).eq('shift_type', operativeShift);
    const availableIds = new Set(availData?.map((a: any) => a.firefighter_id) || []);

    const mappedFF = (ffData || []).map(ff => {
      const station = Array.isArray(ff.stations) ? ff.stations[0] : ff.stations;
      const cbType = getCallbackType(ff.watch as Watch, operativeDate);
      const isCb = (
        (cbType === '#1-BeforeDay1' && operativeShift === 'Day') ||
        (cbType === '#2b-DayOfNight1' && operativeShift === 'Day') ||
        (cbType === '#2a-EveningDay2' && operativeShift === 'Night') ||
        (cbType === '#3-AfterLastNight' && operativeShift === 'Night')
      );

      return {
        ...ff,
        isCallback: isCb,
        station_name: station?.name || 'Unknown',
        district: station?.district || ff.district || 'Unknown',
        otCount: (operativeShift === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0,
        qualifications: typeof ff.qualifications === 'string' ? JSON.parse(ff.qualifications) : (ff.qualifications || {})
      };
    });

    const mappedRequests = (reqData || []).map(r => {
      const station = Array.isArray(r.stations) ? r.stations[0] : r.stations;
      const rank = r.specialist_type || 'FF';
      let quals = [];
      try { quals = typeof r.required_qualification_ids === 'string' ? JSON.parse(r.required_qualification_ids) : (r.required_qualification_ids || []); } catch (e) { }
      return {
        ...r, station_name: station?.name || 'Unknown', district: station?.district || r.district || 'Unknown',
        required_rank: rank, quals
      };
    });

    setBaselineData({ firefighters: mappedFF, requests: mappedRequests, assignedIds, availableIds });
    setLoading(false);
  };

  useEffect(() => {
    if (isHydrated) {
      fetchData();

      // Real-time subscriptions
      const channel = supabase.channel('available-dashboard-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_requests' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_assignments' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_offers' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [operativeShift, operativeDate, isHydrated]);

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    setIsDeletingReq(requestId);
    try {
      await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_request', requestId })
      });
      // Instantly remove it from the UI
      setBaselineData(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== requestId) }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete request.");
    } finally {
      setIsDeletingReq(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f3f7fa]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-8 h-8 text-blue-500" />
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    setDistrictParam(district);
  };

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);
  const callbackWatch = getPrimaryCallbackWatch(operativeDate, operativeShift);

  const filteredRequests = baselineData.requests.filter((r: any) => {
    if (districtParam !== "All" && r.district !== districtParam) return false;
    const isFF = ['FF', 'QFF', 'SFF'].includes(r.required_rank);
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (r.required_rank === 'SO' && !selectedRanks.includes('Station Officers')) return false;
    if (r.required_rank === 'SSO' && !selectedRanks.includes('Senior Station Officers')) return false;
    return true;
  });

  const availablePersonnel = baselineData.firefighters.filter((ff: any) => {
    if (baselineData.assignedIds.has(ff.id)) return false;

    if (!searchTerm.toLowerCase().split(' ').every(term => `${ff.first_name} ${ff.last_name} ${ff.station_name}`.toLowerCase().includes(term))) return false;
    if (districtParam !== "All" && ff.district !== districtParam) return false;

    const isFF = ['FF', 'QFF', 'SFF'].includes(ff.rank);
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (ff.rank === 'SO' && !selectedRanks.includes('Station Officers')) return false;
    if (ff.rank === 'SSO' && !selectedRanks.includes('Senior Station Officers')) return false;

    const dateStr = [operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
    const elig = canDoOT(ff, dateStr, operativeShift);

    if (!elig.pass) return false;
    
    if (!baselineData.availableIds.has(ff.id)) return false;

    return true;
  }).sort((a: any, b: any) => {
    const rankWeight: Record<string, number> = { 'SSO': 0, 'SO': 1, 'SFF': 2, 'QFF': 2, 'FF': 2 };
    if (rankWeight[a.rank] !== rankWeight[b.rank]) return (rankWeight[a.rank] ?? 9) - (rankWeight[b.rank] ?? 9);
    return (a.otCount || 0) - (b.otCount || 0);
  });

  const sidebarDistricts = Array.from(new Set(stations.map(s => s.district))).filter(Boolean).map(d => ({ id: d as string, name: d as string })).sort((a, b) => a.name.localeCompare(b.name));

  const WatchBadge = ({ watch }: { watch: string }) => {
    const color = getWatchColor(watch as Watch);
    return (
      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
        style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}>
        {watch}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DateToolbar operativeDate={operativeDate} operativeShift={operativeShift} setOpTime={setOpTime} />

      <main className="flex-1 grid grid-cols-12 gap-6 p-8 overflow-hidden bg-[#f3f7fa]">
        {/* LEFT COLUMN: VACANCIES & SUMMARY */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[400px]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Vacancies</h2>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 uppercase">{loading ? '...' : filteredRequests.length} Holes</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? <div className="p-4 text-center text-sm font-bold text-gray-400">Loading...</div> : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                      <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequests.map((r: any) => {
                      const isFilled = (r.number_filled || 0) >= (r.number_of_slots || 1);
                      return (
                        <tr key={r.id} className={`hover:bg-gray-50/50 transition-colors group text-xs ${isFilled ? 'opacity-50 bg-gray-50' : ''}`}>
                          <td className="px-6 py-4 font-black text-gray-900 leading-tight">
                            <div className="flex items-center gap-2">
                              {r.station_name}
                              {isFilled && <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] uppercase">Filled</span>}
                              {(!isFilled && r.number_filled > 0) && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] uppercase">{r.number_filled}/{r.number_of_slots} Filled</span>}
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{r.district}</div>
                          </td>
                          <td className="px-3 py-4 font-bold text-gray-500">
                            {r.required_rank}
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(r.quals || []).map((q: string) => (
                                <span key={q} className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-amber-100/50">{shortenQual(q)}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteRequest(r.id)}
                              disabled={isDeletingReq === r.id}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all disabled:opacity-50"
                              title="Delete Vacancy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-6">Roster Summary</h2>
            <div className="space-y-4">
              {[
                { label: 'Total Vacancies', value: filteredRequests.reduce((sum: number, r: any) => sum + (r.number_of_slots || 1), 0), color: 'text-red-600' },
                { label: 'Available Personnel', value: availablePersonnel.length, color: 'text-blue-600' },
                { label: 'Filled', value: filteredRequests.reduce((sum: number, r: any) => sum + (r.number_filled || 0), 0), color: 'text-green-600' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{item.label}</span>
                  <span className={`text-sm font-black ${item.color}`}>{loading ? '...' : item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AVAILABLE PERSONNEL */}
        <section className="col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Available Personnel</h2>
            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black border border-blue-100 uppercase">{loading ? '...' : availablePersonnel.length} Ready</span>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">
                Refreshing Personnel...
              </div>
            ) : (
              <>
                {/* 1. CALLBACK TABLE */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: `${callbackWatch ? getWatchColor(callbackWatch) : '#ccc'}08`, borderBottomColor: `${callbackWatch ? getWatchColor(callbackWatch) : '#ccc'}20` }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: callbackWatch ? getWatchColor(callbackWatch) : '#ccc' }}>
                      Callback ({callbackWatch?.toUpperCase() || 'NONE'} WATCH)
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">District</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">CB #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {availablePersonnel.filter(p => p.isCallback).map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border" style={{ backgroundColor: `${getWatchColor(p.watch)}15`, color: getWatchColor(p.watch), borderColor: `${getWatchColor(p.watch)}30` }}>{p.watch}</span>
                                <div className="font-bold text-gray-900 text-xs">{p.first_name} {p.last_name}</div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs font-bold text-gray-600">{p.station_name}</td>
                            <td className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.district}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(p.qualifications || {}).filter(([_, v]) => v).map(([q]) => (
                                  <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{shortenQual(q)}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right font-black text-blue-900 text-xs">{operativeShift === 'Day' ? p.ot_count_callback_days : p.ot_count_callback_nights}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. NON-CALLBACK TABLE */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                  <div className="px-5 py-3 border-b bg-gray-50/50 border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Non-Callback (Off Duty)</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Personnel</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">District</th>
                          <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
                          <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">NCB #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {availablePersonnel.filter(p => !p.isCallback).map((p: any) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition-colors opacity-70">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border" style={{ backgroundColor: `${getWatchColor(p.watch)}15`, color: getWatchColor(p.watch), borderColor: `${getWatchColor(p.watch)}30` }}>{p.watch}</span>
                                <div className="font-bold text-gray-800 text-xs">{p.first_name} {p.last_name}</div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs font-bold text-gray-500">{p.station_name}</td>
                            <td className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.district}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1 opacity-50">
                                {Object.entries(p.qualifications || {}).filter(([_, v]) => v).map(([q]) => (
                                  <span key={q} className="bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-gray-200">{shortenQual(q)}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right font-black text-gray-400 text-xs">{operativeShift === 'Day' ? p.ot_count_noncallback_days : p.ot_count_noncallback_nights}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AvailablePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#f3f7fa]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Activity className="w-8 h-8 text-blue-500" />
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading...</span>
        </div>
      </div>
    }>
      <RostersContent />
    </Suspense>
  );
}