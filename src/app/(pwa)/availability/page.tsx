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
        <span className={`text-[14px] font-medium transition-colors ${current === value ? 'text-[#005DAC]' : 'text-slate-600'}`}>{label}</span>
        <input type="radio" id={id} name={`group-${label}`} value={value} checked={current === value} onChange={() => onChange(value)} className="hidden" />
    </label>
);

export default function AvailabilityPage() {
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

    const [callbackFilter, setCallbackFilter] = React.useState<'ALL' | 'CALLBACK' | 'NON_CALLBACK'>('ALL');
    const [segmentFilter, setSegmentFilter] = React.useState<'ALL' | 'DAY' | 'NIGHT'>('ALL');

    React.useEffect(() => {
        setMounted(true);
        const savedCb = sessionStorage.getItem('pwa_cb_filter');
        const savedSeg = sessionStorage.getItem('pwa_seg_filter');
        if (savedCb) setCallbackFilter(savedCb as any);
        if (savedSeg) setSegmentFilter(savedSeg as any);
    }, []);

    React.useEffect(() => {
        if (mounted) {
            sessionStorage.setItem('pwa_cb_filter', callbackFilter);
            sessionStorage.setItem('pwa_seg_filter', segmentFilter);
        }
    }, [callbackFilter, segmentFilter, mounted]);

    React.useEffect(() => {
        async function fetchAvailability() {
            const { data: { session } } = await supabase.auth.getSession();
            const userEmail = session?.user?.email || "rebecca.taylor@fenz.slack.com";

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

                    if (shiftType === 'Off') {
                        const cbType = getCallbackType(ff.watch as Watch, targetDate);
                        const onDutyDay = getOnDutyWatch(targetDate, 'Day');
                        const onDutyNight = getOnDutyWatch(targetDate, 'Night');
                        const localYMD = toLocalYMD(targetDate); // Strict local YYYY-MM-DD

                        const addDay = (isCb: boolean, desc: string) => generatedShifts.push({ id: `${localYMD}_Day`, date: targetDate, segment: 'Day', isCb, desc, onDuty: onDutyDay });
                        const addNight = (isCb: boolean, desc: string) => generatedShifts.push({ id: `${localYMD}_Night`, date: targetDate, segment: 'Night', isCb, desc, onDuty: onDutyNight });

                        if (cbType === '#1-BeforeDay1' || cbType === '#2b-DayOfNight1') {
                            addDay(true, `Callback: ${cbType.split('-')[1]}`);
                            addNight(false, 'Non-Callback');
                        } else if (cbType === '#2a-EveningDay2' || cbType === '#3-AfterLastNight') {
                            addDay(false, 'Non-Callback');
                            addNight(true, `Callback: ${cbType.split('-')[1]}`);
                        } else {
                            addDay(false, 'Non-Callback');
                            addNight(false, 'Non-Callback');
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

    const handleFinalSubmit = async () => {
        if (!ffId) return;
        setSubmitting(true);

        const toInsert = Array.from(selectedShifts).filter(id => !initialAvailability.has(id));
        const toDelete = Array.from(initialAvailability).filter(id => !selectedShifts.has(id));
        const toUpdate = Array.from(selectedShifts).filter(id => initialAvailability.has(id));

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

            setInitialAvailability(new Set(selectedShifts));
            setIsConfirmOpen(false);
        } catch (err) {
            console.error(err);
            alert("Error saving availability.");
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

    const hasSelections = selectedShifts.size > 0;

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            {/* Top Blue Header */}
            <div className="bg-[#005DAC] text-white shadow-md py-3 flex justify-center sticky top-0 z-40">
                <span className="font-black uppercase tracking-widest text-[13px]">Availability</span>
            </div>

            <div className="px-4 py-5 max-w-md mx-auto">
                {/* Filters Box */}
                <div className="border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm bg-white mb-6">
                    <div className="flex justify-between px-2">
                        <CustomRadio id="cb-all" value="ALL" current={callbackFilter} onChange={setCallbackFilter} label="All" />
                        <CustomRadio id="cb-callback" value="CALLBACK" current={callbackFilter} onChange={setCallbackFilter} label="Callback" />
                        <CustomRadio id="cb-noncallback" value="NON_CALLBACK" current={callbackFilter} onChange={setCallbackFilter} label="Non-Callback" />
                    </div>
                    <Separator className="bg-slate-100" />
                    <div className="flex justify-between px-2">
                        <CustomRadio id="seg-all" value="ALL" current={segmentFilter} onChange={setSegmentFilter} label="All" />
                        <CustomRadio id="seg-day" value="DAY" current={segmentFilter} onChange={setSegmentFilter} label="Day" />
                        <CustomRadio id="seg-night" value="NIGHT" current={segmentFilter} onChange={setSegmentFilter} label="Night" />
                    </div>
                </div>

                {/* Shift List */}
                <div className="space-y-3">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white" />)
                    ) : filteredShifts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium text-sm">No shifts match your filters.</div>
                    ) : (
                        filteredShifts.map((shift) => (
                            <div
                                key={shift.id}
                                className={`flex items-center gap-4 rounded-2xl border p-4 bg-white shadow-sm cursor-pointer transition-all ${selectedShifts.has(shift.id) ? 'border-[#005DAC] ring-1 ring-[#005DAC]' : 'border-slate-200 hover:border-[#005DAC]/50'}`}
                                onClick={() => {
                                    const newSet = new Set<string>(selectedShifts);
                                    if (newSet.has(shift.id)) newSet.delete(shift.id);
                                    else newSet.add(shift.id);
                                    setSelectedShifts(newSet);
                                }}
                            >
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors border ${selectedShifts.has(shift.id) ? 'bg-[#005DAC] border-[#005DAC]' : 'border-slate-300'}`}>
                                    {selectedShifts.has(shift.id) && <Check className="w-4 h-4 text-white" strokeWidth={3.5} />}
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
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-50/90 backdrop-blur z-40 max-w-md mx-auto border-t border-slate-200">
                <Button
                    onClick={() => hasSelections ? handleOpenConfirm() : null}
                    className={`w-full py-6 text-[16px] font-semibold rounded-xl transition-all ${hasSelections
                            ? "bg-[#005DAC] hover:bg-[#004a89] text-white shadow-lg"
                            : "bg-[#80B8DB] hover:bg-[#6aa5c9] text-white/90 cursor-default"
                        }`}
                >
                    {hasSelections ? `Submit ${selectedShifts.size} Shift(s)` : "Submit Availability"}
                </Button>
            </div>

            {/* CONFIRMATION MODAL */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-t-3xl sm:rounded-2xl gap-0 bg-slate-50">
                    <DialogHeader className="px-6 pt-6 pb-4 bg-white border-b shrink-0 text-center relative">
                        <button onClick={() => setIsConfirmOpen(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <DialogTitle className="text-[17px] font-black text-slate-800 tracking-tight">Confirm Availability & Preferences</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500 mt-1 px-4">
                            Select the stations you are available for each shift. Your home district is selected by default.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {Array.from(selectedShifts).sort().map(shiftId => {
                            const [dateStr, segStr] = shiftId.split('_');
                            const shiftDetails = shifts.find(s => s.id === shiftId);
                            // Derive a proper Date object safely, falling back to string parse if necessary
                            const shiftDate = shiftDetails ? shiftDetails.date : new Date(`${dateStr}T12:00:00Z`);
                            const isExpanded = expandedDistrict === shiftId;

                            return (
                                <div key={shiftId} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

                                    {/* CARD HEADER */}
                                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                                        <span className="font-bold text-slate-800 text-[15px]">
                                            {shiftDate.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} <span className="text-slate-400 font-medium px-1">-</span> <span className="uppercase">{segStr}</span>
                                        </span>
                                        {shiftDetails && (
                                            <span className="px-3 py-1 rounded text-white text-[10px] font-black uppercase shadow-sm tracking-wider" style={{ backgroundColor: getWatchColor(shiftDetails.onDuty) }}>
                                                {shiftDetails.onDuty}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {/* DISTRICT MASTER TOGGLE BUTTONS */}
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
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${isAllSelected ? 'bg-[#005DAC] text-white border-[#005DAC]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* ACCORDION LIST */}
                                        <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                                            {districts.map(d => {
                                                const distStations = getSortedStationsForDistrict(d);
                                                const selectedCount = distStations.filter(s => shiftPrefs[shiftId]?.has(String(s.id))).length;
                                                const totalCount = distStations.length;
                                                const isDistExpanded = expandedDistrict === `${shiftId}_${d}`;

                                                return (
                                                    <div key={`acc-${d}`} className="flex flex-col">
                                                        {/* ACCORDION TRIGGER */}
                                                        <div
                                                            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => setExpandedDistrict(isDistExpanded ? null : `${shiftId}_${d}`)}
                                                        >
                                                            <span className="text-[13px] font-bold text-slate-800">{d}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                                                    {selectedCount} / {totalCount}
                                                                </span>
                                                                {isDistExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                            </div>
                                                        </div>

                                                        {/* ACCORDION CONTENT */}
                                                        {isDistExpanded && (
                                                            <div className="bg-slate-50 border-t border-slate-100 divide-y divide-slate-100">

                                                                {/* SELECT ALL BAR */}
                                                                <div className="px-5 py-2.5 flex justify-between items-center bg-slate-100/50">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        {d === homeDistrict ? "Smart Distance Enabled" : "Individual Selection"}
                                                                    </span>
                                                                    <button
                                                                        className="text-[11px] font-bold text-[#005DAC] hover:underline"
                                                                        onClick={() => toggleEntireDistrict(shiftId, distStations, selectedCount === totalCount)}
                                                                    >
                                                                        {selectedCount === totalCount ? "Deselect All" : "Select All"}
                                                                    </button>
                                                                </div>

                                                                {distStations.map(station => {
                                                                    const isHomeDist = d === homeDistrict;
                                                                    const isSelected = shiftPrefs[shiftId]?.has(String(station.id));
                                                                    const isHomeStation = station.id === ffDetails?.station_id;
                                                                    const distKm = homeDistances[station.name] || 0;

                                                                    return (
                                                                        <label key={station.id} className="flex items-center justify-between p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#005DAC] border-[#005DAC]' : 'border-slate-300 bg-white'}`}>
                                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                                                </div>
                                                                                <span className={`text-[14px] font-medium ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{station.name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {isHomeDist && !isHomeStation && (
                                                                                    <span className="text-[11px] font-bold text-slate-400">{distKm} km</span>
                                                                                )}
                                                                                {isHomeStation && (
                                                                                    <span className="text-[10px] font-black text-[#005DAC] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">Home</span>
                                                                                )}
                                                                            </div>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="hidden"
                                                                                checked={isSelected}
                                                                                onChange={() => handleStationToggle(shiftId, String(station.id), isHomeDist, distStations)}
                                                                            />
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

                    <div className="p-4 border-t bg-white shrink-0 flex gap-3 pb-safe">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="flex-1 py-6 rounded-xl text-slate-600 font-bold border-slate-200 shadow-sm bg-white hover:bg-slate-50">
                            Cancel
                        </Button>
                        <Button onClick={handleFinalSubmit} disabled={submitting} className="flex-[2] py-6 rounded-xl bg-[#005DAC] hover:bg-[#004a89] text-white font-bold shadow-md">
                            {submitting ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}