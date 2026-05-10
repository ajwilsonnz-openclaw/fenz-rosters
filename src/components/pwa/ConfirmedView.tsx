import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, MapPin, ShieldCheck, ChevronLeft, ChevronRight, Sun, Moon, Edit3 } from "lucide-react";
import { getCalendarDays, getWatchColor, getOperationalTime } from "@/engine/ui-helpers";
import { getOnDutyWatch } from "@/engine/watch-math";

export function ConfirmedView({ testEmail }: { testEmail?: string }) {
    const [loading, setLoading] = React.useState(true);
    const [confirmed, setConfirmed] = React.useState<any[]>([]);
    const [ff, setFf] = React.useState<any>(null);
    const [viewDate, setViewDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
    const [stations, setStations] = React.useState<any[]>([]);
    const [isEditingStation, setIsEditingStation] = React.useState(false);

    React.useEffect(() => {
        async function fetchData() {
            let userEmail = testEmail;
            if (!userEmail) {
                const { data: { session } } = await supabase.auth.getSession();
                userEmail = session?.user?.email;
            }
            if (!userEmail) return;

            const { data: firefighter } = await supabase.from('firefighters').select('*, stations(*)').eq('email', userEmail).single();
            const { data: stationList } = await supabase.from('stations').select('*').order('name');
            setStations(stationList || []);

            if (firefighter) {
                setFf(firefighter);
                const { data } = await supabase
                    .from('ot_assignments')
                    .select(`
                        id, status, distance_km, accepted_at,
                        ot_requests ( id, date, shift_type, stations (id, name, district) )
                    `)
                    .eq('firefighter_id', firefighter.id)
                    .eq('status', 'accepted')
                    .order('ot_requests(date)', { ascending: true });

                setConfirmed(data || []);
            }
            setLoading(false);
        }
        fetchData();

        const channel = supabase.channel('mobile-confirmed-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ot_assignments' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [testEmail]);

    const calendarDays = getCalendarDays(viewDate, 'Day'); 
    
    const confirmedMap = React.useMemo(() => {
        const map = new Map<string, any>();
        confirmed.forEach(c => {
            const req = Array.isArray(c.ot_requests) ? c.ot_requests[0] : c.ot_requests;
            if (req?.date) map.set(req.date, c);
        });
        return map;
    }, [confirmed]);

    const opTime = getOperationalTime(new Date());
    const opTodayStr = opTime.date.toLocaleDateString('en-CA');
    
    const myWatchDay = getOnDutyWatch(opTime.date, 'Day') === ff?.watch;
    const myWatchNight = getOnDutyWatch(opTime.date, 'Night') === ff?.watch;
    
    const todayShift = confirmedMap.get(opTodayStr);
    
    const getShiftStatus = (dateStr: string) => {
        if (dateStr === opTodayStr) return "Current Shift";
        if (dateStr < opTodayStr) return "Worked Shift";
        return "Upcoming Shift";
    };

    const renderShiftCard = (assign: any) => {
        const req = Array.isArray(assign.ot_requests) ? assign.ot_requests[0] : assign.ot_requests;
        const station = Array.isArray(req.stations) ? req.stations[0] : req.stations;
        const status = getShiftStatus(req.date);

        return (
            <Card key={assign.id} className="p-4 rounded-3xl border-slate-100 shadow-sm bg-white overflow-hidden relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 rounded-2xl">
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">
                                {new Date(req.date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                {req.shift_type === 'Day' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                                {req.shift_type} • <MapPin className="w-2.5 h-2.5" /> {station?.name}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase ${
                        status === 'Current Shift' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        status === 'Worked Shift' ? 'bg-slate-50 text-slate-500 border-slate-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                    }`}>
                        {status}
                    </Badge>
                </div>
            </Card>
        );
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-slate-300 font-black uppercase text-xs tracking-widest">Loading Roster...</div>;

    const selectedDateStr = selectedDate?.toLocaleDateString('en-CA');
    const selectedAssignmentRaw = selectedDateStr ? confirmedMap.get(selectedDateStr) : null;
    const selectedAssignment = selectedAssignmentRaw ? {
        ...selectedAssignmentRaw,
        ot_requests: Array.isArray(selectedAssignmentRaw.ot_requests) ? selectedAssignmentRaw.ot_requests[0] : selectedAssignmentRaw.ot_requests
    } : null;

    const selectedWatchDay = selectedDate ? getOnDutyWatch(selectedDate, 'Day') === ff?.watch : false;
    const selectedWatchNight = selectedDate ? getOnDutyWatch(selectedDate, 'Night') === ff?.watch : false;
    const isNormalShift = (selectedWatchDay || selectedWatchNight) && !selectedAssignment;

    return (
        <div className="p-4 space-y-6 mt-4 min-h-full pb-24">
            {/* Calendar Section */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 px-1">
                    <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="text-xs font-black uppercase text-slate-900 tracking-[0.2em]">{viewDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                        <div key={`${d}-${idx}`} className="text-[10px] font-black text-slate-300 uppercase">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, i) => {
                        if (!day) return <div key={i} className="w-10 h-10" />;
                        
                        const dateStr = day.date.toLocaleDateString('en-CA');
                        const isAssigned = confirmedMap.has(dateStr);
                        const dayWatch = getOnDutyWatch(day.date, 'Day');
                        const nightWatch = getOnDutyWatch(day.date, 'Night');
                        
                        const isMyDay = dayWatch === ff?.watch;
                        const isMyNight = nightWatch === ff?.watch;
                        const isOpToday = dateStr === opTodayStr;
                        
                        // Color Logic
                        let bgColor = 'bg-slate-400'; 
                        if (isMyDay) bgColor = 'bg-green-500';
                        if (isMyNight) bgColor = 'bg-green-800'; 

                        return (
                            <button 
                                key={i}
                                onClick={() => setSelectedDate(day.date)}
                                className={`w-10 h-10 flex items-center justify-center font-black rounded-xl transition-all relative text-white ${
                                    isAssigned ? '!text-slate-900 font-black' : ''
                                } ${isOpToday ? 'border-2 border-black' : ''} ${bgColor}`}
                            >
                                {day.day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Schedule Section (Compact) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#005DAC] rounded-full" />
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Schedule</h3>
                </div>
                
                {todayShift ? (
                    renderShiftCard(todayShift)
                ) : (myWatchDay || myWatchNight) ? (
                    <Card className="p-4 rounded-3xl border-slate-100 shadow-sm bg-white relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-2xl">
                                    <CalendarIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Today, {opTime.date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                        {myWatchNight ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
                                        {myWatchNight ? 'Night' : 'Day'} • <MapPin className="w-2.5 h-2.5" /> {ff?.stations?.name || 'Home Station'}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase">Current Shift</Badge>
                        </div>
                    </Card>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">No shift today</div>
                )}
            </div>

            {/* Date Details Modal */}
            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="sm:max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
                            {selectedDate?.toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                        {selectedAssignment ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Confirmed Overtime</p>
                                    <p className="text-lg font-black text-slate-900">{selectedAssignment.ot_requests?.stations?.name || 'Unknown Station'}</p>
                                    <p className="text-xs font-bold text-slate-500">{selectedAssignment.ot_requests?.shift_type} Shift</p>
                                </div>
                            </div>
                        ) : isNormalShift ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">{getShiftStatus(selectedDateStr!)}</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-black text-slate-900">{ff?.stations?.name || 'Home Station'}</p>
                                            <p className="text-xs font-bold text-slate-500">{selectedWatchNight ? 'Night' : 'Day'} Shift • {ff?.watch} Watch</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsEditingStation(true)}
                                            className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {isEditingStation && (
                                        <div className="mt-4 pt-4 border-t border-green-100/50 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Relieving at another station?</p>
                                            <select 
                                                className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm font-black outline-none focus:border-blue-500"
                                                onChange={(e) => {
                                                    alert(`Future Update: Move to ${stations.find(s => String(s.id) === e.target.value)?.name}`);
                                                    setIsEditingStation(false);
                                                }}
                                            >
                                                <option value="">Select relief station...</option>
                                                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 font-bold uppercase text-xs tracking-widest">Off Duty • No OT</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
