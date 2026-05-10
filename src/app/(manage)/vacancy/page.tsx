"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Activity, ShieldCheck, Sun, Moon, Calendar, PlusCircle, CheckCircle2, ChevronDown, RefreshCcw, ArrowRight, XCircle, Trash2 } from "lucide-react";
import { getOperationalTime } from "@/engine/ui-helpers";
import { getOnDutyWatch } from "@/engine/watch-math";
import Sidebar from "@/components/layout/Sidebar";
import DateToolbar from "@/components/layout/DateToolbar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type WizardState = 'create' | 'preview_chain' | 'process_chain' | 'final_pool';

function OfficerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const[opTime, setOpTime] = useState<{ date: Date; shift: 'Day' | 'Night' }>(getOperationalTime(new Date()));
  const { date: operativeDate, shift: operativeShift } = opTime;

  const [regionParam, setRegionParam] = useState("Te Hiku");
  const [districtParam, setDistrictParam] = useState("All");
  const[selectedRanks, setSelectedRanks] = useState<string[]>(['Firefighters', 'Station Officers', 'Senior Station Officers']);

  const[isHydrated, setIsHydrated] = useState(false);

  // Wizard State
  const [wizardState, setWizardState] = useState<WizardState>('create');
  const [evaluationResults, setEvaluationResults] = useState<any | null>(null);
  const [currentPullbackIndex, setCurrentPullbackIndex] = useState(0);

  // Form State
  const [selectedStation, setSelectedStation] = useState<string>("");
  const[selectedRank, setSelectedRank] = useState<string>("FF");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [dbQuals, setDbQuals] = useState<{ code: string, name: string }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Dialog State
  const[refuseDialogOpen, setRefuseDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [refusalReason, setRefusalReason] = useState("");
  const[customReason, setCustomReason] = useState("");
  const [isRejectingPullback, setIsRejectingPullback] = useState(false);

  const STANDARD_REFUSALS =["No Answer", "Refused - Fatigue", "Refused - Personal", "Not Available"];

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
      d.setHours(0,0,0,0);
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

    setOpTime({ date: finalDate, shift: finalShift });
    setTimeout(() => setIsHydrated(true), 0);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!isHydrated) return;
    sessionStorage.setItem('fenz_region', regionParam);
    sessionStorage.setItem('fenz_district', districtParam);
    sessionStorage.setItem('fenz_ranks', JSON.stringify(selectedRanks));
  }, [regionParam, districtParam, selectedRanks, isHydrated]);

  useEffect(() => {
    async function loadInitialData() {
      const { data: stationData } = await supabase.from('stations').select('*').order('name');
      if (stationData) setStations(stationData);

      const { data: qualData } = await supabase.from('qualifications').select('*').order('name');
      if (qualData) setDbQuals(qualData);
    }
    loadInitialData();
  },[]);

  useEffect(() => {
    setWizardState('create');
    setEvaluationResults(null);
    fetchPendingRequests();
  }, [operativeDate, operativeShift]);

  const fetchPendingRequests = async () => {
    const dateStr = [operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
    const { data } = await supabase
      .from('ot_requests')
      .select('*, stations(name, district)')
      .eq('date', dateStr)
      .eq('shift_type', operativeShift)
      .eq('status', 'pending');
    
    if (data) setPendingRequests(data);
  };

  // Handoff from Filled page
  useEffect(() => {
    const resolveStationId = searchParams.get('resolve_station');
    
    // We MUST wait until stations are fully loaded from Supabase before resolving
    if (resolveStationId && stations.length > 0 && isHydrated && wizardState === 'create' && !loading) {
       setSelectedStation(resolveStationId);
       
       // Fire the resolve action
       setTimeout(() => { 
         handleResolveNow(resolveStationId); 
       }, 500);
       
       // Clean the URL so it doesn't loop
       const newParams = new URLSearchParams(searchParams.toString());
       newParams.delete('resolve_station');
       router.replace(`${pathname}?${newParams.toString()}`);
    }
  }, [searchParams, stations, isHydrated, wizardState, loading]);

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

  const onDutyWatch = getOnDutyWatch(operativeDate, operativeShift);

  const filteredStations = stations.filter(s => {
    if (districtParam !== "All" && s.district !== districtParam) return false;
    return true;
  });

  const handleAddToBatch = async () => {
    if (!selectedStation) return;
    setLoading(true);
    try {
      const dateStr =[operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
      const res = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_request', station_id: Number(selectedStation), district: stations.find(s => String(s.id) === selectedStation)?.district, date: dateStr, shift_type: operativeShift, specialist_type: selectedRank, required_qualification_ids: qualifications })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Database error");
      setSelectedStation("");
      fetchPendingRequests(); // Refresh list
    } catch (err: any) { 
      console.error(err);
      alert(`Failed to add: ${err.message}`);
    } finally { setLoading(false); }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm("Are you sure you want to delete this vacancy?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_request', requestId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete");
      fetchPendingRequests(); // Refresh list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatchEngine = async () => {
    setLoading(true);
    try {
      const dateStr =[operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
      const allocRes = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_allocation', date: dateStr, shift_type: operativeShift })
      });
      const allocData = await allocRes.json();
      if (!allocData.success) throw new Error(allocData.error || "Engine failure");
      alert("Batch engine run complete! Check 'Filled' or 'Available' for results.");
      setSelectedStation("");
    } catch (err: any) {
      alert(`Failed to run engine: ${err.message}`);
    } finally { setLoading(false); }
  };

  const handleResolveNow = async (overrideStationId?: string) => {
    const targetStation = overrideStationId || selectedStation;
    if (!targetStation) return;
    setLoading(true);
    try {
      const dateStr =[operativeDate.getFullYear(), String(operativeDate.getMonth() + 1).padStart(2, '0'), String(operativeDate.getDate()).padStart(2, '0')].join('-');
      const reqRes = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_request', station_id: Number(targetStation), district: stations.find(s => String(s.id) === targetStation)?.district, date: dateStr, shift_type: operativeShift, specialist_type: selectedRank, required_qualification_ids: qualifications })
      });
      const reqData = await reqRes.json();
      if (!reqData.success) throw new Error(reqData.error || "Database error");

      const evalRes = await fetch('/api/officer/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: reqData.request.id })
      });
      const evalData = await evalRes.json();
      if (!evalData.success) throw new Error(evalData.error || "Evaluation error");
      
      setEvaluationResults(evalData);
      if (evalData.pullbackChain && evalData.pullbackChain.length > 0) {
        setWizardState('preview_chain');
      } else {
        setWizardState('final_pool');
      }
    } catch (err: any) { 
      console.error(err);
      alert(`Failed to evaluate: ${err.message}`);
    } finally { setLoading(false); }
  };

  const executePullback = async (pullback: any) => {
    setLoading(true);
    try {
      await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute_pullback', oldAssignmentId: pullback.assignmentId, oldRequestId: pullback.oldRequestId, newRequestId: evaluationResults.requestId, ffId: pullback.ffId })
      });
      if (currentPullbackIndex + 1 < evaluationResults.pullbackChain.length) {
        setCurrentPullbackIndex(currentPullbackIndex + 1);
      } else {
        setWizardState('final_pool');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleManualAssign = async (candidate: any) => {
    setLoading(true);
    try {
      await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual_assign', requestId: evaluationResults.requestId, firefighterId: candidate.id, distance: candidate.distance, status: 'assigned' })
      });
      alert(`${candidate.name} assigned.`);
      router.push(`/rosters/filled?date=${searchParams.get('date')}&shift=${searchParams.get('shift')}`);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openRefusalDialog = (candidate: any, isPullback: boolean) => {
    setSelectedCandidate(candidate);
    setIsRejectingPullback(isPullback);
    setRefusalReason("");
    setCustomReason("");
    setRefuseDialogOpen(true);
  };

  const submitRefusal = async () => {
    const finalReason = refusalReason === "Other" ? customReason : refusalReason;
    if (!finalReason) return alert("Select a reason.");

    setLoading(true);
    try {
      if (isRejectingPullback) {
         setRefuseDialogOpen(false);
         setWizardState('final_pool');
      } else {
        await fetch('/api/allocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'manual_assign', requestId: evaluationResults.requestId, firefighterId: selectedCandidate.id, distance: selectedCandidate.distance, status: 'declined', declineReason: finalReason })
        });
        setRefuseDialogOpen(false);
        setEvaluationResults({ ...evaluationResults, candidates: evaluationResults.candidates.filter((c: any) => c.id !== selectedCandidate.id) });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const sidebarDistricts = Array.from(new Set(stations.map(s => s.district))).filter(Boolean).map(d => ({ id: d as string, name: d as string })).sort((a, b) => a.name.localeCompare(b.name));

      return (
        <div className="flex flex-col h-full overflow-hidden">
          <DateToolbar operativeDate={operativeDate} operativeShift={operativeShift} setOpTime={setOpTime} />
          <main className="flex-1 p-8 overflow-y-auto bg-[#f3f7fa]">
            <div className="max-w-4xl mx-auto space-y-8">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Vacancy Configuration</h2>
                      <p className="text-gray-500 text-sm font-bold">Add to batch schedule or resolve last-minute vacancies immediately.</p>
                  </div>
                </div>
                <button onClick={handleRunBatchEngine} disabled={loading} className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-200 font-black px-4 py-2 rounded-xl shadow-sm transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Running Engine...' : 'Run Scheduled Engine (Batch)'}
                </button>
              </div>

              {/* WIZARD STATE: CREATE */}
              <div className={`bg-white rounded-[32px] border transition-all duration-500 ${wizardState !== 'create' ? 'border-gray-200 opacity-50 pointer-events-none' : 'border-blue-200 shadow-lg ring-4 ring-blue-50/50'}`}>
                 <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Station</label>
                          <div className="relative">
                             <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blue-500 text-blue-900 appearance-none">
                                <option value="">Select Station...</option>
                                {filteredStations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.district})</option>)}
                             </select>
                             <ChevronDown className="absolute right-5 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Required Rank</label>
                          <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-200">
                             {['FF', 'SO', 'SSO'].map(rank => (
                                <button key={rank} onClick={() => setSelectedRank(rank)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${selectedRank === rank ? 'bg-white shadow-md text-blue-600 border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>{rank}</button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0">Required Qualifications</span>
                          <div className="h-px bg-gray-100 w-full" />
                       </div>
                       <div className="relative">
                          <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-blue-500 text-blue-900 appearance-none" onChange={(e) => { const val = e.target.value; if (val && !qualifications.includes(val)) { setQualifications([...qualifications, val]); } e.target.value = ""; }}>
                             <option value="">Select a qualification to add...</option>
                             {dbQuals.map(q => <option key={q.code} value={q.code}>{q.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-5 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
                       </div>
                       {qualifications.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-4">
                           {qualifications.map(q => {
                             const qualName = dbQuals.find(dbQ => dbQ.code === q)?.name || q;
                             return (
                               <span key={q} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 border border-blue-200 shadow-sm">
                                 {qualName}
                                 <button onClick={() => setQualifications(qualifications.filter(x => x !== q))} className="text-blue-400 hover:text-red-500 transition-colors"><XCircle className="w-4 h-4" /></button>
                               </span>
                             );
                           })}
                         </div>
                       )}
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                       <button onClick={handleAddToBatch} disabled={!selectedStation || loading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black px-6 py-5 rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                          Add to Batch
                       </button>
                       <button onClick={() => handleResolveNow()} disabled={!selectedStation || loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                          {loading ? 'Evaluating...' : 'Resolve Now'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* WIZARD STATE: PREVIEW CHAIN */}
              {wizardState === 'preview_chain' && evaluationResults?.pullbackChain && (
                 <div className="bg-white rounded-[32px] border border-orange-200 shadow-xl ring-4 ring-orange-50 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
                    <div>
                      <h3 className="text-xl font-black text-orange-600 uppercase tracking-tighter">Domino Chain Detected</h3>
                      <p className="text-sm font-bold text-gray-500 mt-2">The engine found staff from {evaluationResults.initialVacancyStation} working OT elsewhere. Review the potential chain reaction.</p>
                    </div>
                    <div className="space-y-2">
                      {evaluationResults.pullbackChain.map((pb: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                            <div className="flex-1">
                              <div className="text-sm font-black text-orange-900">{pb.name}</div>
                              <div className="text-[11px] font-bold text-orange-600/70 uppercase">Pull back from <span className="font-black text-orange-600">{pb.currentlyAt}</span> to <span className="font-black text-orange-600">{pb.homeStation}</span></div>
                            </div>
                            {idx < evaluationResults.pullbackChain.length - 1 && <ArrowRight className="w-5 h-5 text-orange-300" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-orange-100">
                       <button onClick={() => setWizardState('final_pool')} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-black px-6 py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" /> Bypass Chain (Direct Fill)
                       </button>
                       <button onClick={() => setWizardState('process_chain')} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-4 rounded-xl shadow-md transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                          Step Through Pullbacks
                       </button>
                    </div>
                 </div>
              )}

              {/* WIZARD STATE: PROCESS CHAIN */}
              {wizardState === 'process_chain' && evaluationResults?.pullbackChain && (
                 <div className="bg-white rounded-[32px] border border-blue-200 shadow-xl ring-4 ring-blue-50 p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter">Process Pullback</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-black uppercase">Step {currentPullbackIndex + 1} of {evaluationResults.pullbackChain.length}</span>
                    </div>
                    <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Do you want to reassign</p>
                      <p className="text-2xl font-black text-blue-900 mb-2">{evaluationResults.pullbackChain[currentPullbackIndex].name}</p>
                      <p className="text-sm font-bold text-blue-600">From <span className="font-black">{evaluationResults.pullbackChain[currentPullbackIndex].currentlyAt}</span> back to <span className="font-black">{evaluationResults.pullbackChain[currentPullbackIndex].homeStation}</span>?</p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => openRefusalDialog(evaluationResults.pullbackChain[currentPullbackIndex], true)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-black px-6 py-5 rounded-2xl transition-all uppercase tracking-widest text-sm">
                          Reject Pullback
                       </button>
                       <button onClick={() => executePullback(evaluationResults.pullbackChain[currentPullbackIndex])} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">
                          {loading ? 'Executing...' : 'Approve Pullback'}
                       </button>
                    </div>
                 </div>
              )}

              {/* WIZARD STATE: FINAL POOL */}
              {wizardState === 'final_pool' && evaluationResults && (
                 <div className="bg-white rounded-[32px] border border-green-200 shadow-xl ring-4 ring-green-50 p-10 space-y-6 animate-in fade-in slide-in-from-bottom-8">
                    <div className="flex items-center justify-between p-6 bg-green-50 rounded-2xl border border-green-200">
                      <div>
                         <h3 className="text-xs font-black text-green-900 uppercase tracking-widest">Final Gap Remaining</h3>
                         <p className="text-2xl font-black text-green-700 leading-tight mt-1">
                           {currentPullbackIndex > 0 ? evaluationResults.pullbackChain[currentPullbackIndex - 1].currentlyAt : evaluationResults.initialVacancyStation}
                         </p>
                      </div>
                      <span className="bg-white text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-green-200 shadow-sm">
                        {evaluationResults.candidates?.length || 0} Pool Candidates
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {evaluationResults.candidates?.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 hover:border-green-300 transition-all shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center font-black text-gray-500">{i + 1}</div>
                            <div>
                              <div className="font-black text-gray-900">{c.name}</div>
                              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">{c.watch} Watch • {c.rank} • {c.distance}km away</div>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(c.qualifications || {})
                                  .filter(([q, v]) => v && q.toLowerCase() !== 'not_rookie') // Hide NOT_ROOKIE
                                  .map(([q]) => (
                                    <span key={q} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-blue-100/50">
                                      {q}
                                    </span>
                                ))}
                                {(!c.qualifications || (!c.qualifications['not_rookie'] && !c.qualifications['NOT_ROOKIE'])) && (
                                    <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-red-100/50">
                                      Rookie
                                    </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => openRefusalDialog(c, false)} className="bg-white text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all border border-red-200">Refuse</button>
                            <button onClick={() => handleManualAssign(c)} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 transition-all shadow-md">Assign</button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              )}

               {/* PENDING BATCH LIST */}
               {wizardState === 'create' && (
                 <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                       <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pending Batch ({operativeShift})</h3>
                       <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{pendingRequests.length} Vacancies</span>
                    </div>
                    {pendingRequests.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                           <tr className="bg-white border-b border-gray-50">
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Station</th>
                              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quals</th>
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {pendingRequests.map((r) => (
                             <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-8 py-5">
                                   <div className="font-black text-gray-900">{r.stations?.name}</div>
                                   <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{r.stations?.district}</div>
                                </td>
                                <td className="px-4 py-5 font-black text-blue-600 text-xs">
                                   {r.specialist_type}
                                </td>
                                <td className="px-4 py-5">
                                   <div className="flex flex-wrap gap-1">
                                      {(typeof r.required_qualification_ids === 'string' ? JSON.parse(r.required_qualification_ids) : (r.required_qualification_ids || [])).map((q: string) => (
                                        <span key={q} className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-gray-200">{q}</span>
                                      ))}
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <button 
                                     onClick={() => handleDeleteRequest(r.id)} 
                                     disabled={loading}
                                     className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center">
                         <Activity className="w-8 h-8 text-gray-200 mx-auto mb-4" />
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No pending vacancies for this shift.</p>
                      </div>
                    )}
                 </div>
               )}
           </div>
          </main>

          <Dialog open={refuseDialogOpen} onOpenChange={setRefuseDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-gray-900">Record Refusal</DialogTitle>
                <DialogDescription className="text-xs font-bold text-gray-500 uppercase">Why is {selectedCandidate?.name} bypassing this shift?</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  {STANDARD_REFUSALS.map(reason => (
                    <button key={reason} onClick={() => { setRefusalReason(reason); setCustomReason(""); }} className={`p-3 text-left rounded-xl text-sm font-bold border transition-all ${refusalReason === reason ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{reason}</button>
                  ))}
                  <button onClick={() => setRefusalReason("Other")} className={`p-3 text-left rounded-xl text-sm font-bold border transition-all ${refusalReason === "Other" ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>Other (Specify)</button>
                  {refusalReason === "Other" && <input type="text" value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Type specific reason..." className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400" autoFocus />}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRefuseDialogOpen(false)} className="rounded-xl font-bold uppercase tracking-wider text-xs">Cancel</Button>
                <Button variant="destructive" onClick={submitRefusal} disabled={loading} className="rounded-xl font-bold uppercase tracking-wider text-xs">{loading ? "Saving..." : "Confirm Refusal"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    );
}

export default function OfficerPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#f3f7fa]"><div className="flex flex-col items-center gap-4 animate-pulse"><Activity className="w-8 h-8 text-blue-500" /><span className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Workspace...</span></div></div>}>
      <OfficerContent />
    </Suspense>
  );
}