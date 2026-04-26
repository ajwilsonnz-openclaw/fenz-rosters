"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  MapPin, 
  Search, 
  Users, 
  ShieldCheck, 
  Clock, 
  Sun, 
  Moon, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { 
  getOperationalTime, 
  getWatchColor, 
  REGIONS, 
  REGION_TO_DISTRICTS 
} from "@/engine/ui-helpers";
import { Watch, getOnDutyWatch, findWatchOccurrence } from "@/engine/watch-math";
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import { supabase } from "@/lib/supabase";

export default function OfficerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  
  // Date/Shift State
  const [opTime, setOpTime] = useState(getOperationalTime(new Date()));
  const operativeDate = opTime.date;
  const operativeShift = opTime.shift;
  // App State (Hydrated in useEffect)
  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const [selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);

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

  // Persist changes
  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_region', regionParam);
  }, [regionParam, mounted]);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_district', districtParam);
  }, [districtParam, mounted]);

  useEffect(() => {
    if (!mounted) return;
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [selectedRanks, mounted]);
  
  // Form State
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedRank, setSelectedRank] = useState<string>("FF");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [engineRunDone, setEngineRunDone] = useState(false);

  const QUALS = ["PRT", "TYPE4", "DRIVER", "NOT_ROOKIE"];

  useEffect(() => {
    async function loadStations() {
      const { data } = await supabase.from('stations').select('*').order('name');
      if (data) setStations(data);
    }
    loadStations();
  }, []);

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);

  const regionDistricts = REGION_TO_DISTRICTS[regionParam] || [];
  const sidebarDistricts = (regionParam === "New Zealand" 
    ? Array.from(new Set(stations.map(s => s.district))).map(d => ({ id: d, name: d }))
    : regionDistricts.map((name: string) => ({ id: name, name })))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredStations = stations.filter(s => {
    if (districtParam !== "All" && s.district !== districtParam) return false;
    
    // Region Filter (Skip if New Zealand)
    if (regionParam !== "New Zealand") {
      const allowed = REGION_TO_DISTRICTS[regionParam] || [];
      if (!allowed.includes(s.district)) return false;
    }
    
    return true;
  });

  const toggleQual = (q: string) => {
    if (qualifications.includes(q)) setQualifications(qualifications.filter(x => x !== q));
    else setQualifications([...qualifications, q]);
  };

  const [evaluationResults, setEvaluationResults] = useState<any[] | null>(null);

  const handleCreateVacancy = async () => {
    if (!selectedStation) return;
    setLoading(true);
    
    try {
      const dateStr = operativeDate.toLocaleDateString('en-CA');
      const targetStation = stations.find(s => String(s.id) === String(selectedStation));
      
      if (!targetStation) throw new Error("Please select a valid station");

      const { data, error } = await supabase
        .from('ot_requests')
        .insert({
          station_id: targetStation.id,
          district: targetStation.district || '',
          date: dateStr,
          shift_type: operativeShift,
          specialist_type: selectedRank,
          required_qualification_ids: qualifications, // Pass array directly to JSONB
          status: 'pending',
          number_of_slots: 1
        })
        .select()
        .single();

      if (error) throw error;
      
      if (engineRunDone) {
        // Trigger immediate evaluation logic
        const response = await fetch('/api/officer/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: data.id })
        });
        const result = await response.json();
        setEvaluationResults(result); // Store the full result object { dominoChain, candidates }
      } else {
        router.push('/rosters');
      }
    } catch (err: any) {
      console.error("Error creating vacancy:", err);
      alert(`Failed to create vacancy: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (candidate: any) => {
    if (!evaluationResults) return;
    setLoading(true);
    try {
      const response = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_assign',
          requestId: (evaluationResults as any).requestId,
          firefighterId: candidate.id,
          distance: candidate.distance,
          status: 'assigned'
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`${candidate.name} has been assigned.`);
        // Refresh or navigate
        router.push('/rosters');
      } else {
        throw new Error(result.error || 'Failed to assign');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefuse = async (candidate: any) => {
    if (!evaluationResults) return;
    const reason = window.prompt(`Enter refusal reason for ${candidate.name}:`, "Not available / No answer");
    if (reason === null) return; // Cancelled

    setLoading(true);
    try {
      const response = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_assign',
          requestId: (evaluationResults as any).requestId,
          firefighterId: candidate.id,
          distance: candidate.distance,
          status: 'declined',
          declineReason: reason
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Refusal recorded for ${candidate.name}.`);
        // Remove from list or refresh evaluation
        setEvaluationResults({
          ...evaluationResults,
          candidates: (evaluationResults as any).candidates.filter((c: any) => c.id !== candidate.id)
        } as any);
      } else {
        throw new Error(result.error || 'Failed to record refusal');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0B0B45] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      <Sidebar 
        regionParam={regionParam}
        districtParam={districtParam}
        updateUrlParams={(r, d) => { setRegionParam(r); setDistrictParam(d); }}
        sidebarDistricts={sidebarDistricts}
        selectedRanks={selectedRanks}
        setSelectedRanks={setSelectedRanks}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-white text-gray-900">
        
        {/* SHARED DATE TOOLBAR */}
        <DateToolbar 
          operativeDate={operativeDate}
          operativeShift={operativeShift}
          setOpTime={setOpTime}
        />

        {/* MAIN WORKSPACE */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#f3f7fa]">
           <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                    <Activity className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Create New Vacancy</h2>
                    <p className="text-gray-500 text-sm font-bold">Configure shift requirements for automated allocation</p>
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-10 space-y-10">
                    
                    {/* SECTION: LOCATION & RANK */}
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Station</label>
                          <div className="relative">
                             <select 
                                value={selectedStation} 
                                onChange={e => setSelectedStation(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-black appearance-none outline-none focus:border-blue-500 transition-colors text-blue-900"
                             >
                                <option value="" className="text-gray-400">Select Station...</option>
                                {filteredStations.map(s => <option key={s.id} value={s.id} className="text-blue-900">{s.name} ({s.district})</option>)}
                             </select>
                             <ChevronDown className="absolute right-5 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Required Rank</label>
                          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-200">
                             {['FF', 'SO', 'SSO'].map(rank => (
                                <button 
                                   key={rank}
                                   onClick={() => setSelectedRank(rank)}
                                   className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${selectedRank === rank ? 'bg-white shadow-md text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                   {rank}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* SECTION: QUALIFICATIONS */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0">Required Qualifications</span>
                          <div className="h-px bg-gray-100 w-full" />
                       </div>
                       <div className="grid grid-cols-4 gap-4">
                          {QUALS.map(q => (
                             <button 
                                key={q}
                                onClick={() => toggleQual(q)}
                                className={`p-4 rounded-2xl border-2 font-black text-[11px] tracking-widest transition-all text-center ${qualifications.includes(q) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                             >
                                {q.replace('_', ' ')}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* SECTION: SHIFT SUMMARY */}
                    <div className="bg-blue-50 rounded-3xl p-8 flex items-center justify-between border border-blue-100">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                             {operativeShift === 'Day' ? <Sun className="w-7 h-7 text-orange-500" /> : <Moon className="w-7 h-7 text-blue-600" />}
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Scheduled Shift</span>
                             <p className="text-blue-900 font-black text-lg leading-tight">
                                {operativeDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                             </p>
                             <p className="text-blue-600 font-bold text-sm">{operativeShift} Shift ({onDutyWatch} Watch Active)</p>
                          </div>
                       </div>

                       {/* ENGINE STATUS TOGGLE (Temporary for dev) */}
                       <div className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-blue-100 shadow-sm">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Daily Engine Status</span>
                             <span className="text-[11px] font-bold text-blue-900">{engineRunDone ? 'Post-Scheduled Run' : 'Pre-Scheduled Run'}</span>
                          </div>
                          <button 
                            onClick={() => setEngineRunDone(!engineRunDone)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${engineRunDone ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${engineRunDone ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                       
                       <button 
                          onClick={handleCreateVacancy}
                          disabled={!selectedStation || loading}
                          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black px-10 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm flex items-center gap-3"
                       >
                          <PlusCircle className="w-5 h-5" />
                          {loading ? 'Processing...' : 'Create Overtime'}
                       </button>
                    </div>

                     {/* DOMINO CHAIN & EVALUATION RESULTS */}
                     {evaluationResults && (
                       <div className="mt-12 pt-12 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
                         
                         {/* THE DOMINO CHAIN (The "Intricate" part) */}
                         {(evaluationResults as any).dominoChain?.length > 0 && (
                            <div className="mb-12 space-y-4">
                               <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Domino Effect: Movement Chain</h3>
                               <div className="space-y-2">
                                  {(evaluationResults as any).dominoChain.map((step: any, idx: number) => (
                                     <div key={idx} className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                           {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                           <div className="text-xs font-black text-blue-900">{step.name}</div>
                                           <div className="text-[10px] font-bold text-blue-400 uppercase">
                                              Moves from <span className="text-blue-600">{step.leavesHoleAt}</span> ➔ to fill <span className="text-blue-600">{step.movesTo}</span>
                                           </div>
                                        </div>
                                        <div className="text-[10px] font-black text-blue-300 uppercase italic">
                                          {step.is_preview ? 'Suggested Move' : 'Re-Assigning...'}
                                        </div>
                                     </div>
                                  ))}
                                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                     <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">!</div>
                                     <div className="text-[10px] font-black text-orange-900 uppercase">
                                        Final Remaining Hole: <span className="underline">{(evaluationResults as any).currentGapStation}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                         )}

                         <div className="flex items-center justify-between mb-6">
                           <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Available Candidates for Final Hole</h3>
                           <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-blue-100">
                             {(evaluationResults as any).candidates?.length || 0} Eligible
                           </span>
                         </div>

                         <div className="grid gap-3">
                           {(evaluationResults as any).candidates?.length > 0 ? (
                             (evaluationResults as any).candidates.map((c: any, i: number) => (
                               <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                                 <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">
                                     {i + 1}
                                   </div>
                                   <div>
                                     <div className="font-black text-gray-900">{c.name}</div>
                                     <div className="text-[10px] font-bold text-gray-400 uppercase">{c.watch} Watch • {c.rank} • {c.distance}km away</div>
                                   </div>
                                 </div>
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => handleRefuse(c)}
                                     className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all border border-red-100"
                                   >
                                     Refuse
                                   </button>
                                   <button 
                                     onClick={() => handleManualAssign(c)}
                                     className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all"
                                   >
                                     Assign
                                   </button>
                                 </div>
                               </div>
                             ))
                           ) : (
                             <div className="p-12 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No suitable candidates found for the final hole</p>
                             </div>
                           )}
                           <button 
                             onClick={() => router.push('/rosters')}
                             className="mt-4 w-full py-4 text-[11px] font-black uppercase text-gray-400 hover:text-blue-600 transition-all tracking-widest"
                           >
                             View on Full Roster
                           </button>
                         </div>
                       </div>
                     )}

                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
