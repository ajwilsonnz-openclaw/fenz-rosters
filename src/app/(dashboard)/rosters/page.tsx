'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Users, AlertCircle, CheckCircle2, MapPin, Filter, Search, Calendar, Clock, ChevronRight, Moon, Sun, ChevronDown, ChevronUp, ChevronLeft, Activity, Shield, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { canDoOT } from '@/engine/allocation-engine-v2';
import { getOperationalTime, getWatchColor, getCalendarDays, REGIONS, REGION_TO_DISTRICTS } from '@/engine/ui-helpers';
import { Watch, getCallbackType, getOnDutyWatch, findWatchOccurrence } from '@/engine/watch-math';
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import Link from 'next/link';


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

function RostersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialDistrict = searchParams.get('district') || (typeof window !== 'undefined' ? sessionStorage.getItem('fenz_district') : "All") || "All";
  const initialRegion = searchParams.get('region') || (typeof window !== 'undefined' ? sessionStorage.getItem('fenz_region') : "New Zealand") || "New Zealand";

  const [baselineData, setBaselineData] = useState<{ firefighters: any[], requests: any[] }>({ firefighters: [], requests: [] });
  const [allDistricts, setAllDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [regionParam, setRegionParam] = useState(initialRegion);
  const [districtParam, setDistrictParam] = useState(initialDistrict);
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);
  const [searchTerm, setSearchTerm] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRegion = sessionStorage.getItem('fenz_region');
    const savedDistrict = sessionStorage.getItem('fenz_district');
    const savedRanks = sessionStorage.getItem('fenz_ranks');
    
    if (savedRegion) setRegionParam(savedRegion);
    if (savedDistrict) setDistrictParam(savedDistrict);
    if (savedRanks) setSelectedRanks(JSON.parse(savedRanks));
  }, []);

  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [opTime, setOpTime] = useState(() => getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  // Persist changes
  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
  }, [regionParam, mounted]);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [selectedRanks, mounted]);

  const updateUrlParams = (region: string, district: string) => {
    setRegionParam(region);
    sessionStorage.setItem('fenz_district', district);
    const params = new URLSearchParams(searchParams);
    params.set('region', region);
    params.set('district', district);
    router.push(`${pathname}?${params.toString()}`);
  };

  const dateStr = operativeDate.toLocaleDateString('en-CA');
  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);
  const callbackWatch = getPrimaryCallbackWatch(operativeDate, operativeShift);

  const toggleDistrict = (district: string) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const Skeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-200/50 rounded-xl w-full" />)}
    </div>
  );

  const shortenQual = (q: string) => {
    if (!q) return '';
    const u = q.toUpperCase();
    if (u === 'TYPE4') return 'T4';
    if (u === 'DRIVER') return 'DR';
    return u;
  };

  useEffect(() => {
    if (allDistricts.length === 0) return;
    const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
    const visibleDistricts = regionParam === "New Zealand" ? allDistricts : allDistricts.filter(d => regionDistricts.includes(d.name));
    const sortedDistricts = [...visibleDistricts].sort((a, b) => a.name.localeCompare(b.name));
    const visibleDistrictNames = sortedDistricts.map(d => d.name);

    if (districtParam === "All") {
      // Only set if not already set or if explicitly navigating to "All"
      if (selectedDistricts.length === 0) setSelectedDistricts(visibleDistrictNames);
    } else if (visibleDistrictNames.includes(districtParam)) {
      setSelectedDistricts([districtParam]);
    }
  }, [regionParam, districtParam, allDistricts]);

  useEffect(() => {
    async function fetchData() {
      if (baselineData.firefighters.length === 0) setLoading(true);
      const { data: areaData } = await supabase.from('areas').select('*');
      if (areaData) setAllDistricts(areaData);
      const { data: ffData } = await supabase.from('firefighters').select(`*, stations (*)`);
      const { data: reqData } = await supabase
        .from('ot_requests')
        .select(`*, stations (*)`)
        .eq('date', dateStr)
        .eq('shift_type', operativeShift);

      const mappedFF = (ffData || []).map(ff => ({
        ...ff,
        station_name: ff.stations?.name || 'Unknown',
        district: ff.stations?.district || 'Unknown',
        otCount: (operativeShift === 'Day' ? ff.ot_count_days : ff.ot_count_nights) || 0
      }));

      const mappedRequests = (reqData || []).map(r => {
        // Map specialist_type back to required_rank for the UI
        const rank = r.specialist_type || 'FF';
        const quals = Array.isArray(r.required_qualification_ids) 
          ? r.required_qualification_ids 
          : JSON.parse(r.required_qualification_ids || '[]');

        return { 
          ...r, 
          station_name: r.stations?.name || 'Unknown', 
          district: r.stations?.district || 'Unknown', 
          required_rank: rank,
          quals: quals
        };
      });

      setBaselineData({ firefighters: mappedFF, requests: mappedRequests });
      setLoading(false);
    }
    fetchData();
  }, [operativeShift, dateStr]);


  const filteredRequests = baselineData.requests.filter((r: any) => {
    if (!searchTerm.toLowerCase().split(' ').every(term => r.station_name.toLowerCase().includes(term) || r.district?.toLowerCase().includes(term))) return false;
    
    // Region Filter (Skip if New Zealand)
    if (regionParam !== "New Zealand") {
      const allowedDistricts = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowedDistricts.includes(r.district)) return false;
    }

    if (!selectedDistricts.includes(r.district)) return false;
    const isFF = ['FF', 'QFF', 'SFF'].includes(r.required_rank);
    const isSO = r.required_rank === 'SO';
    const isSSO = r.required_rank === 'SSO';
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (isSO && !selectedRanks.includes('Station Officers')) return false;
    if (isSSO && !selectedRanks.includes('Senior Station Officers')) return false;
    return true;
  });

  const availablePersonnel = baselineData.firefighters.filter((ff: any) => {
    const fullName = `${ff.first_name} ${ff.last_name}`.toLowerCase();
    if (!searchTerm.toLowerCase().split(' ').every(term => fullName.includes(term) || ff.station_name.toLowerCase().includes(term))) return false;
    
    // Region Filter (Skip if New Zealand)
    if (regionParam !== "New Zealand") {
      const allowedDistricts = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowedDistricts.includes(ff.district)) return false;
    }

    if (!selectedDistricts.includes(ff.district)) return false;
    const isFF = ['FF', 'QFF', 'SFF'].includes(ff.rank);
    const isSO = ff.rank === 'SO';
    const isSSO = ff.rank === 'SSO';
    if (isFF && !selectedRanks.includes('Firefighters')) return false;
    if (isSO && !selectedRanks.includes('Station Officers')) return false;
    if (isSSO && !selectedRanks.includes('Senior Station Officers')) return false;
    return canDoOT(ff, dateStr, operativeShift).pass;
  }).sort((a: any, b: any) => {
    const rankWeight: Record<string, number> = { 'SSO': 0, 'SO': 1, 'SFF': 2, 'QFF': 2, 'FF': 2 };
    if (rankWeight[a.rank] !== rankWeight[b.rank]) return (rankWeight[a.rank] ?? 9) - (rankWeight[b.rank] ?? 9);
    return (a.otCount || 0) - (b.otCount || 0);
  });

  const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
  const sidebarDistricts = (regionParam === "New Zealand" 
    ? allDistricts 
    : allDistricts.filter(d => regionDistricts.includes(d.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

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
    <div className="flex h-full w-full bg-[#0B0B45] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      <Sidebar 
        regionParam={regionParam}
        districtParam={districtParam}
        updateUrlParams={updateUrlParams}
        sidebarDistricts={sidebarDistricts}
        selectedRanks={selectedRanks}
        setSelectedRanks={setSelectedRanks}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* TOP HEADER */}
        <Header title="AVAILABLE CANDIDATES" />

        <DateToolbar 
          operativeDate={operativeDate}
          operativeShift={operativeShift}
          setOpTime={setOpTime}
        />

        {/* MAIN DASHBOARD GRID */}
        <main className="flex-1 grid grid-cols-12 gap-6 p-8 overflow-hidden bg-[#f3f7fa]">
          
          {/* COLUMN 1: VACANCIES & SUMMARY */}
          <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
             {/* VACANCIES BOX */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Vacancies</h2>
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 uppercase">{loading ? '...' : filteredRequests.length} Holes</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loading ? <Skeleton /> : (
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                            <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Shift</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {filteredRequests.map((r: any) => (
                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                               <td className="px-6 py-4 font-black text-gray-900 text-xs">{r.station_name}</td>
                               <td className="px-3 py-4 font-bold text-gray-400 text-xs">{r.required_rank} {r.specialist_type ? <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] border border-blue-100 ml-1">{shortenQual(r.specialist_type)}</span> : null}</td>
                               <td className="px-3 py-4 text-[10px] font-bold text-gray-400 text-center uppercase">{operativeShift}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  )}
                </div>
             </div>

             {/* ROSTER SUMMARY BOX */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800 mb-6">Roster Summary</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Total Vacancies', value: filteredRequests.length, color: 'text-red-600' },
                    { label: 'Available Personnel', value: availablePersonnel.length, color: 'text-blue-600' },
                    { label: 'Filled', value: 0, color: 'text-green-600' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between border-b border-gray-50 pb-2.5">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{item.label}</span>
                      <span className={`text-sm font-black ${item.color}`}>{loading ? '...' : item.value}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* COLUMN 2: AVAILABLE PERSONNEL */}
          <section className="col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-800">Available Personnel</h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black border border-blue-100 uppercase">{loading ? '...' : availablePersonnel.length} Ready</span>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
              {loading ? <Skeleton /> : (
                <>
                  {/* CALLBACK SECTION BOX */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                    <div className="px-5 py-3 border-b flex items-center justify-between sticky top-0 z-10" 
                         style={{ backgroundColor: `${getWatchColor(callbackWatch)}08`, borderBottomColor: `${getWatchColor(callbackWatch)}20` }}>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: getWatchColor(callbackWatch) }}>
                        Callback ({callbackWatch?.toUpperCase()} WATCH)
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                          <tr>
                            <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qualifications</th>
                            <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">CB #</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {availablePersonnel.filter(p => p.watch === callbackWatch).map((ff: any) => (
                            <tr key={ff.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <WatchBadge watch={ff.watch} />
                                  <span className="font-bold text-gray-900 text-xs">{ff.first_name} {ff.last_name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 font-bold text-gray-400 w-16 uppercase text-[10px]">{ff.rank}</td>
                              <td className="px-3 py-3 text-[10px] font-bold text-gray-500">{ff.station_name}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(ff.qualifications || {})
                                    .filter(([,v]) => v)
                                    .map(([k]) => k)
                                    .sort((a,b) => a.localeCompare(b))
                                    .map(q => (
                                      <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
                                    ))
                                  }
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right font-black text-green-600 text-sm">{ff.otCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* NON-CALLBACK SECTION BOX */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                    <div className="bg-gray-100/80 px-5 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Non-Callback</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                          <tr>
                            <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                            <th className="px-3 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Qualifications</th>
                            <th className="px-5 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">NCB #</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {availablePersonnel.filter(p => p.watch !== callbackWatch).map((ff: any) => (
                            <tr key={ff.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <WatchBadge watch={ff.watch} />
                                  <span className="font-bold text-gray-900 text-xs">{ff.first_name} {ff.last_name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 font-bold text-gray-400 w-16 uppercase text-[10px]">{ff.rank}</td>
                              <td className="px-3 py-3 text-[10px] font-bold text-gray-500">{ff.station_name}</td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(ff.qualifications || {})
                                    .filter(([,v]) => v)
                                    .map(([k]) => k)
                                    .sort((a,b) => a.localeCompare(b))
                                    .map(q => (
                                      <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">{q}</span>
                                    ))
                                  }
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right font-black text-orange-600 text-sm">{ff.otCount}</td>
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
    </div>
  );
}

export default function RostersPage() {
  return (
    <Suspense fallback={<div>Loading Roster State...</div>}>
      <RostersContent />
    </Suspense>
  );
}
