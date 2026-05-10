'use client';

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { getShift, getCallbackType, getOnDutyWatch, Watch } from "@/engine/watch-math";
import { getWatchColor } from "@/engine/ui-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// Safe Local YYYY-MM-DD generator (Ignores UTC drift)
const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const CustomRadio = ({ id, value, current, onChange, label }: any) => (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${current === value ? 'border-[#005DAC]' : 'border-slate-300 group-hover:border-[#005DAC]'}`}>
            {current === value && <div className="w-2.5 h-2.5 rounded-full bg-[#005DAC]" />}
        </div>
        <span className={`text-[13px] font-medium transition-colors ${current === value ? 'text-[#005DAC]' : 'text-slate-700'}`}>{label}</span>
        <input type="radio" id={id} name={`group-${label}`} value={value} checked={current === value} onChange={() => onChange(value)} className="hidden" />
    </label>
);

export function AvailabilityView({ testEmail, isMatrix = false }: { testEmail?: string, isMatrix?: boolean }) {
    const [mounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [shifts, setShifts] = React.useState<any[]>([]);
    const [selectedShifts, setSelectedShifts] = React.useState<Set<string>>(new Set());
    const [initialAvailability, setInitialAvailability] = React.useState<Set<string>>(new Set());

    const [ffId, setFfId] = React.useState<number | null>(null);
    const [ffDetails, setFfDetails] = React.useState<any>(null);
    const [stations, setStations] = React.useState<any[]>([]);
    const [homeDistances, setHomeDistances] = React.useState<Record<string, number>>({});

    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [shiftPrefs, setShiftPrefs] = React.useState<Record<string, Set<string>>>({});
    const [expandedDistrict, setExpandedDistrict] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);
    const [pendingRemoval, setPendingRemoval] = React.useState<Set<string>>(new Set());
    const [pendingUpdate, setPendingUpdate] = React.useState<Set<string>>(new Set());
    const pointerStartPos = React.useRef<{ id: string, x: number } | null>(null);



    const [callbackFilter, setCallbackFilter] = React.useState<'ALL' | 'CALLBACK' | 'NON_CALLBACK'>('CALLBACK');
    const [segmentFilter, setSegmentFilter] = React.useState<'ALL' | 'DAY' | 'NIGHT'>('ALL');

    React.useEffect(() => {
        setMounted(true);
        if (!isMatrix) {
            const savedCb = sessionStorage.getItem('pwa_cb_filter');
            const savedSeg = sessionStorage.getItem('pwa_seg_filter');
            if (savedCb) setCallbackFilter(savedCb as any);
            if (savedSeg) setSegmentFilter(savedSeg as any);
        }
    }, [isMatrix]);

    React.useEffect(() => {
        if (mounted && !isMatrix) {
            sessionStorage.setItem('pwa_cb_filter', callbackFilter);
            sessionStorage.setItem('pwa_seg_filter', segmentFilter);
        }
    }, [callbackFilter, segmentFilter, mounted, isMatrix]);

    React.useEffect(() => {
        async function fetchAvailability() {
            let userEmail = testEmail;
            
            if (!userEmail) {
                const { data: { session } } = await supabase.auth.getSession();
                userEmail = session?.user?.email;
            }
            if (!userEmail) return;

            const { data: ff } = await supabase.from('firefighters').select('id, watch, station_id, stations(district)').eq('email', userEmail).single();

            if (ff) {
                setFfId(ff.id);
                setFfDetails(ff);

                const { data: stData } = await supabase.from('stations').select('id, name, district');
                const { data: distData } = await supabase.from('station_distances').select('distances').eq('station_id', ff.station_id).single();

                if (stData) setStations(stData);
                if (distData) {
                    const dists = typeof distData.distances === 'string' ? JSON.parse(distData.distances) : distData.distances;
                    setHomeDistances(dists);
                }

                const generatedShifts: any[] = [];
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Lock to local midnight to prevent drift

                for (let i = 1; i <= 30; i++) {
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() + i);

                    const shiftType = getShift(ff.watch as Watch, targetDate);

                    const cbType = getCallbackType(ff.watch as Watch, targetDate);
                    const onDutyDay = getOnDutyWatch(targetDate, 'Day');
                    const onDutyNight = getOnDutyWatch(targetDate, 'Night');
                    const localYMD = toLocalYMD(targetDate); // Strict local YYYY-MM-DD

                    const addDay = (isCb: boolean, desc: string) => generatedShifts.push({ id: `${localYMD}_Day`, date: targetDate, segment: 'Day', isCb, desc, onDuty: onDutyDay });
                    const addNight = (isCb: boolean, desc: string) => generatedShifts.push({ id: `${localYMD}_Night`, date: targetDate, segment: 'Night', isCb, desc, onDuty: onDutyNight });

                    if (shiftType === 'Off') {
                        if (cbType === '#1-BeforeDay1') {
                            addDay(true, 'Callback: Before first day');
                            addNight(false, 'Non-Callback');
                        } else if (cbType === '#3-AfterLastNight') {
                            addDay(false, 'Non-Callback');
                            addNight(true, 'Callback: After last night');
                        } else {
                            addDay(false, 'Non-Callback');
                            addNight(false, 'Non-Callback');
                        }
                    } else {
                        // Working days - only show the specific 24h callback opportunities
                        if (cbType === '#2a-EveningDay2') {
                            addNight(true, 'Callback: 24 Night');
                        } else if (cbType === '#2b-DayOfNight1') {
                            addDay(true, 'Callback: 24 Day');
                        }
                    }
                }
                setShifts(generatedShifts);

                // Fetch saved records and match strictly against YYYY-MM-DD
                const { data: saved } = await supabase.from('availability').select('date, shift_type, preferences').eq('firefighter_id', ff.id);
                if (saved) {
                    const savedSet = new Set<string>();
                    const savedPrefs: Record<string, Set<string>> = {};

                    saved.forEach(s => {
                        const key = `${s.date}_${s.shift_type}`; // Database date is already YYYY-MM-DD
                        savedSet.add(key);
                        if (s.preferences && s.preferences.stations) {
                            savedPrefs[key] = new Set(s.preferences.stations);
                        }
                    });

                    setSelectedShifts(savedSet);
                    setInitialAvailability(savedSet);
                    setShiftPrefs(savedPrefs);
                }
            }
            setLoading(false);
        }
        fetchAvailability();
    }, []);

    const ffStationData = Array.isArray(ffDetails?.stations) ? ffDetails.stations[0] : ffDetails?.stations;
    const homeDistrict = ffStationData?.district;
    const districts = Array.from(new Set(stations.map(s => s.district))).filter(Boolean).sort();

    const getSortedStationsForDistrict = (distName: string) => {
        const distStations = stations.filter(s => s.district === distName);
        if (distName === homeDistrict) {
            return distStations.sort((a, b) => {
                if (a.id === ffDetails.station_id) return -1;
                if (b.id === ffDetails.station_id) return 1;
                return (homeDistances[a.name] || 999) - (homeDistances[b.name] || 999);
            });
        }
        return distStations.sort((a, b) => a.name.localeCompare(b.name));
    };

    const handleOpenConfirm = () => {
        const newPrefs = { ...shiftPrefs };
        const homeStations = getSortedStationsForDistrict(homeDistrict);
        const allHomeIds = homeStations.map(s => String(s.id));

        Array.from(selectedShifts).forEach(shiftId => {
            if (!newPrefs[shiftId]) {
                newPrefs[shiftId] = new Set(allHomeIds);
            }
        });
        setShiftPrefs(newPrefs);
        setExpandedDistrict(null);
        setIsConfirmOpen(true);
    };

    const handleStationToggle = (shiftId: string, stationId: string, isHomeDist: boolean, sortedStationsInDist: any[]) => {
        const currentPrefs = new Set(shiftPrefs[shiftId] || new Set());

        if (!isHomeDist) {
            if (currentPrefs.has(stationId)) currentPrefs.delete(stationId);
            else currentPrefs.add(stationId);
        } else {
            const targetIndex = sortedStationsInDist.findIndex(s => String(s.id) === stationId);
            const isCurrentlySelected = currentPrefs.has(stationId);

            if (isCurrentlySelected) {
                for (let i = targetIndex; i < sortedStationsInDist.length; i++) {
                    currentPrefs.delete(String(sortedStationsInDist[i].id));
                }
            } else {
                for (let i = 0; i <= targetIndex; i++) {
                    currentPrefs.add(String(sortedStationsInDist[i].id));
                }
            }
        }
        setShiftPrefs({ ...shiftPrefs, [shiftId]: currentPrefs });
    };

    const toggleEntireDistrict = (shiftId: string, distStations: any[], isAllSelected: boolean) => {
        const currentPrefs = new Set(shiftPrefs[shiftId] || new Set());
        distStations.forEach(s => {
            if (isAllSelected) currentPrefs.delete(String(s.id));
            else currentPrefs.add(String(s.id));
        });
        setShiftPrefs({ ...shiftPrefs, [shiftId]: currentPrefs });
    };

    const handleCancel = () => {
        setSelectedShifts(new Set(initialAvailability));
        setPendingRemoval(new Set());
        setPendingUpdate(new Set());
        setIsConfirmOpen(false);
    };

    const handleFinalSubmit = async () => {
        if (!ffId) return;
        setSubmitting(true);

        const toInsert = Array.from(selectedShifts).filter(id => !initialAvailability.has(id));
        const toDelete = Array.from(pendingRemoval);
        const toUpdate = Array.from(pendingUpdate);

        try {
            if (toDelete.length > 0) {
                for (const id of toDelete) {
                    const [dateStr, shiftType] = id.split('_');
                    await supabase.from('availability').delete()
                        .eq('firefighter_id', ffId)
                        .eq('date', dateStr)
                        .eq('shift_type', shiftType);
                }
            }

            const upsertRecords = [...toInsert, ...toUpdate].map(id => {
                const [dateStr, shiftType] = id.split('_');
                return {
                    firefighter_id: ffId,
                    date: dateStr,
                    shift_type: shiftType,
                    preferences: { stations: Array.from(shiftPrefs[id] || []) }
                };
            });

            if (upsertRecords.length > 0) {
                await supabase.from('availability').upsert(upsertRecords, { onConflict: 'firefighter_id, date, shift_type' });
            }

            // Sync all states
            const finalSelected = new Set(selectedShifts);
            toDelete.forEach(id => finalSelected.delete(id));
            
            setInitialAvailability(new Set(finalSelected));
            setSelectedShifts(new Set(finalSelected));
            setPendingRemoval(new Set());
            setPendingUpdate(new Set());
            setIsConfirmOpen(false);
        } catch (err) {
            console.error(err);
            alert("Error saving availability.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteShift = async (shiftId: string) => {
        if (!ffId) return;
        const [dateStr, shiftType] = shiftId.split('_');
        setSubmitting(true);
        try {
            await supabase.from('availability').delete()
                .eq('firefighter_id', ffId)
                .eq('date', dateStr)
                .eq('shift_type', shiftType);
            
            const newSelected = new Set(selectedShifts);
            newSelected.delete(shiftId);
            const newInitial = new Set(initialAvailability);
            newInitial.delete(shiftId);
            
            setSelectedShifts(newSelected);
            setInitialAvailability(newInitial);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    const filteredShifts = shifts.filter(s => {
        if (callbackFilter === 'CALLBACK' && !s.isCb) return false;
        if (callbackFilter === 'NON_CALLBACK' && s.isCb) return false;
        if (segmentFilter !== 'ALL' && s.segment.toUpperCase() !== segmentFilter) return false;
        return true;
    });

    const isAdding = Array.from(selectedShifts).some(id => !initialAvailability.has(id));
    const isManaging = pendingRemoval.size > 0 || pendingUpdate.size > 0;
    const isDirty = isAdding || isManaging;

    // Determine the primary action button text and state
    let buttonText = "No Changes";
    let buttonColor = "bg-slate-200 text-slate-400";
    let isClickable = false;

    if (isAdding) {
        const addCount = Array.from(selectedShifts).filter(id => !initialAvailability.has(id)).length;
        buttonText = `Add ${addCount} ${addCount === 1 ? 'Shift' : 'Shifts'}`;
        buttonColor = "bg-[#005DAC] hover:bg-[#004a89] text-white shadow-lg";
        isClickable = true;
    } else if (pendingRemoval.size > 0) {
        const remCount = pendingRemoval.size;
        buttonText = `Remove ${remCount} ${remCount === 1 ? 'Shift' : 'Shifts'}`;
        buttonColor = "bg-red-600 hover:bg-red-700 text-white shadow-lg";
        isClickable = true;
    } else if (pendingUpdate.size > 0) {
        buttonText = "Update Preferences";
        buttonColor = "bg-[#005DAC] hover:bg-[#004a89] text-white shadow-lg";
        isClickable = true;
    }


    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            <div className="px-4 py-5 max-w-md mx-auto">
                {/* Filters Box */}
                <div className="border border-slate-200 rounded-lg py-2 px-3 shadow-sm bg-white mb-6">
                    <div className="grid grid-cols-[60px_100px_1fr] items-center py-1">
                        <CustomRadio id={`${testEmail}-cb-all`} value="ALL" current={callbackFilter} onChange={setCallbackFilter} label="All" />
                        <CustomRadio id={`${testEmail}-cb-callback`} value="CALLBACK" current={callbackFilter} onChange={setCallbackFilter} label="Callback" />
                        <CustomRadio id={`${testEmail}-cb-noncallback`} value="NON_CALLBACK" current={callbackFilter} onChange={setCallbackFilter} label="Non-Callback" />
                    </div>
                    <Separator className="bg-slate-100 my-1" />
                    <div className="grid grid-cols-[60px_100px_1fr] items-center py-1">
                        <CustomRadio id={`${testEmail}-seg-all`} value="ALL" current={segmentFilter} onChange={setSegmentFilter} label="All" />
                        <CustomRadio id={`${testEmail}-seg-day`} value="DAY" current={segmentFilter} onChange={setSegmentFilter} label="Day" />
                        <CustomRadio id={`${testEmail}-seg-night`} value="NIGHT" current={segmentFilter} onChange={setSegmentFilter} label="Night" />
                    </div>
                </div>

                {/* Shift List */}
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />)
                    ) : filteredShifts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium text-sm">No shifts match your filters.</div>
                    ) : (
                        filteredShifts.map((shift) => {
                            const isSelected = selectedShifts.has(shift.id);
                            const isSaved = initialAvailability.has(shift.id);
                            const isNew = isSelected && !isSaved;
                            const isForRemoval = pendingRemoval.has(shift.id);
                            const isForUpdate = pendingUpdate.has(shift.id);

                            // Determine visual state
                            let cardStyles = "border-slate-200 hover:border-[#005DAC]/50 bg-white";
                            if (isNew) cardStyles = "border-[#005DAC] border-2 bg-white";
                            else if (isForRemoval) cardStyles = "border-red-600 border-2 bg-red-50";
                            else if (isForUpdate) cardStyles = "border-green-600 border-2 bg-green-50";
                            else if (isSaved) cardStyles = "border-slate-300 bg-slate-100";

                            const handlePointerDown = (e: React.PointerEvent) => {
                                if (!isSaved || isAdding) return;
                                pointerStartPos.current = { id: shift.id, x: e.clientX };
                            };

                            const handlePointerUp = (e: React.PointerEvent) => {
                                if (!isSaved || isAdding || !pointerStartPos.current || pointerStartPos.current.id !== shift.id) return;
                                
                                const delta = e.clientX - pointerStartPos.current.x;
                                pointerStartPos.current = null;

                                if (delta < -50) { // Swipe Left (Remove)
                                    if (pendingUpdate.size > 0) return;
                                    const newRem = new Set(pendingRemoval);
                                    if (newRem.has(shift.id)) newRem.delete(shift.id);
                                    else newRem.add(shift.id);
                                    setPendingRemoval(newRem);
                                } else if (delta > 50) { // Swipe Right (Update)
                                    if (pendingRemoval.size > 0) return;
                                    const newUpd = new Set(pendingUpdate);
                                    if (newUpd.has(shift.id)) newUpd.delete(shift.id);
                                    else newUpd.add(shift.id);
                                    setPendingUpdate(newUpd);
                                }
                            };

                            return (
                                <div
                                    key={shift.id}
                                    className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm cursor-pointer transition-all duration-300 relative overflow-hidden select-none ${cardStyles} ${isForRemoval ? '-translate-x-4' : (isForUpdate ? 'translate-x-4' : '')}`}
                                    style={{ touchAction: 'pan-y' }}
                                    onPointerDown={handlePointerDown}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={() => { pointerStartPos.current = null; }}
                                    onClick={() => {
                                        if (isManaging) return; 
                                        if (isSaved) return; 
                                        
                                        const newSet = new Set<string>(selectedShifts);
                                        if (newSet.has(shift.id)) newSet.delete(shift.id);
                                        else newSet.add(shift.id);
                                        setSelectedShifts(newSet);
                                    }}
                                >
                                    {/* Action Overlays for Swipe */}
                                    {isForRemoval && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600" />}
                                    {isForUpdate && <div className="absolute right-0 top-0 bottom-0 w-2 bg-green-600" />}

                                    {/* Tick only for NEW selections */}
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors border-2 ${isNew ? 'bg-[#005DAC] border-[#005DAC]' : (isSaved ? 'hidden' : 'border-slate-300')}`}>
                                        {isNew && <Check className="w-4 h-4 text-white" strokeWidth={3.5} />}
                                    </div>

                                    <div className="flex-grow">
                                        <div className="font-semibold text-slate-800 text-[15px]">
                                            {shift.date.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className={`text-[13px] ${shift.isCb ? 'text-[#005DAC] font-medium' : 'text-slate-400'}`}>{shift.desc}</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-full text-white text-[10px] font-bold shadow-sm uppercase tracking-wider" style={{ backgroundColor: getWatchColor(shift.onDuty) }}>
                                            {shift.onDuty}
                                        </span>
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${shift.segment === 'Day' ? 'bg-[#fef08a]' : 'bg-[#1e293b]'}`}>
                                            {shift.segment === 'Day' ? <Sun className="h-4 w-4 text-yellow-600" strokeWidth={2.5} /> : <Moon className="h-4 w-4 text-white" strokeWidth={2.5} />}
                                        </div>
                                    </div>
                                    
                                    {/* Indicator for Swipe Actions */}
                                    {isForRemoval && <div className="absolute right-4 top-2 text-[10px] font-black text-red-600 uppercase flex items-center gap-1"><X className="w-3 h-3"/> Remove</div>}
                                    {isForUpdate && <div className="absolute left-4 top-2 text-[10px] font-black text-green-700 uppercase flex items-center gap-1"><Check className="w-3 h-3"/> Update</div>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className={`${isMatrix ? 'absolute' : 'fixed'} bottom-16 left-0 right-0 p-4 bg-slate-50/90 backdrop-blur z-40 max-w-md mx-auto border-t border-slate-200 flex gap-3`}>
                {isDirty && (
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 py-6 text-[14px] font-bold rounded-xl border-slate-200 text-slate-500 hover:bg-slate-100 uppercase tracking-tight"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={() => {
                        if (isClickable) {
                            if (pendingRemoval.size > 0 && !isAdding && !pendingUpdate.size) {
                                handleFinalSubmit();
                            } else {
                                setIsConfirmOpen(true);
                            }
                        }
                    }}
                    className={`py-6 text-[16px] font-semibold rounded-xl transition-all ${isDirty ? 'flex-[2]' : 'w-full'} ${buttonColor}`}
                >
                    {buttonText}
                </Button>
            </div>

            {/* CONFIRMATION MODAL */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md w-[90%] max-h-[85%] overflow-hidden flex flex-col p-0 rounded-3xl sm:rounded-2xl gap-0 bg-slate-50 border-none shadow-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 bg-white border-b shrink-0 text-center relative">
                        <DialogTitle className="text-[17px] font-black text-slate-800 tracking-tight">Review Changes</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500 mt-1 px-4">
                            Review and confirm your availability updates.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* REMOVALS SECTION */}
                        {pendingRemoval.size > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[11px] font-black text-red-500 uppercase tracking-widest px-1">Removing ({pendingRemoval.size} {pendingRemoval.size === 1 ? 'shift' : 'shifts'})</h3>
                                {Array.from(pendingRemoval).map(id => {
                                    const [dateStr, segStr] = id.split('_');
                                    const d = new Date(`${dateStr}T12:00:00Z`);
                                    return (
                                        <div key={id} className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex justify-between items-center opacity-70">
                                            <span className="font-bold text-slate-700 text-sm">
                                                {d.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} - {segStr}
                                            </span>
                                            <span className="text-[10px] font-black text-red-600 uppercase">Withdrawing</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ADDITIONS / UPDATES SECTION */}
                        {([...Array.from(selectedShifts).filter(id => !initialAvailability.has(id)), ...Array.from(pendingUpdate)]).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-[#005DAC] uppercase tracking-widest px-1">Adding / Updating ({([...Array.from(selectedShifts).filter(id => !initialAvailability.has(id)), ...Array.from(pendingUpdate)]).length} {([...Array.from(selectedShifts).filter(id => !initialAvailability.has(id)), ...Array.from(pendingUpdate)]).length === 1 ? 'shift' : 'shifts'})</h3>
                                {[...Array.from(selectedShifts).filter(id => !initialAvailability.has(id)), ...Array.from(pendingUpdate)].sort().map(shiftId => {
                                    const [dateStr, segStr] = shiftId.split('_');
                                    const shiftDetails = shifts.find(s => s.id === shiftId);
                                    const shiftDate = shiftDetails ? shiftDetails.date : new Date(`${dateStr}T12:00:00Z`);
                                    const isExpanded = expandedDistrict === shiftId;

                                    return (
                                        <div key={shiftId} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {shiftDate.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} - {segStr}
                                                </span>
                                                {shiftDetails && (
                                                    <span className="px-3 py-1 rounded text-white text-[9px] font-black uppercase" style={{ backgroundColor: getWatchColor(shiftDetails.onDuty) }}>
                                                        {shiftDetails.onDuty}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4 space-y-4">
                                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                                    {districts.map(d => {
                                                        const distStations = getSortedStationsForDistrict(d);
                                                        const selectedCount = distStations.filter(s => shiftPrefs[shiftId]?.has(String(s.id))).length;
                                                        const totalCount = distStations.length;
                                                        const isAllSelected = selectedCount === totalCount && totalCount > 0;

                                                        return (
                                                            <button
                                                                key={`btn-${d}`}
                                                                onClick={() => {
                                                                    const currentPrefs = new Set(shiftPrefs[shiftId] || new Set());
                                                                    distStations.forEach(s => {
                                                                        if (isAllSelected) currentPrefs.delete(String(s.id));
                                                                        else currentPrefs.add(String(s.id));
                                                                    });
                                                                    setShiftPrefs({ ...shiftPrefs, [shiftId]: currentPrefs });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap transition-colors border ${isAllSelected ? 'bg-[#005DAC] text-white border-[#005DAC]' : 'bg-white text-slate-500 border-slate-200'}`}
                                                            >
                                                                {d}
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-50">
                                                    {districts.map(d => {
                                                        const distStations = getSortedStationsForDistrict(d);
                                                        const selectedCount = distStations.filter(s => shiftPrefs[shiftId]?.has(String(s.id))).length;
                                                        const isDistExpanded = expandedDistrict === `${shiftId}_${d}`;

                                                        return (
                                                            <div key={`acc-${d}`} className="flex flex-col">
                                                                <div
                                                                    className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                                    onClick={() => setExpandedDistrict(isDistExpanded ? null : `${shiftId}_${d}`)}
                                                                >
                                                                    <span className="text-xs font-bold text-slate-700">{d}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-bold text-slate-400">{selectedCount} Stations</span>
                                                                        {isDistExpanded ? <ChevronUp className="w-3 h-3 text-slate-300" /> : <ChevronDown className="w-3 h-3 text-slate-300" />}
                                                                    </div>
                                                                </div>

                                                                {isDistExpanded && (
                                                                    <div className="bg-slate-50 border-t border-slate-50 divide-y divide-slate-50">
                                                                        {distStations.map(station => {
                                                                            const isSelected = shiftPrefs[shiftId]?.has(String(station.id));
                                                                            return (
                                                                                <label key={station.id} className="flex items-center justify-between p-3 pl-6 cursor-pointer hover:bg-white transition-colors">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#005DAC] border-[#005DAC]' : 'border-slate-300 bg-white'}`}>
                                                                                            {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                                                                        </div>
                                                                                        <span className={`text-[13px] font-medium ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{station.name}</span>
                                                                                    </div>
                                                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleStationToggle(shiftId, String(station.id), d === homeDistrict, distStations)} />
                                                                                </label>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t bg-white shrink-0 flex gap-3 pb-safe">
                        <Button variant="outline" onClick={handleCancel} className="flex-1 py-6 rounded-xl text-slate-600 font-bold border-slate-200">
                            Cancel
                        </Button>
                        <Button onClick={handleFinalSubmit} disabled={submitting} className="flex-[2] py-6 rounded-xl bg-[#005DAC] hover:bg-[#004a89] text-white font-bold shadow-md">
                            {submitting ? "Saving..." : "Confirm All Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}