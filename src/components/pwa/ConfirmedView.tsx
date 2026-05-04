import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";

export function ConfirmedView({ testEmail }: { testEmail?: string }) {
    const [loading, setLoading] = React.useState(true);
    const [confirmed, setConfirmed] = React.useState<any[]>([]);

    React.useEffect(() => {
        async function fetchRoster() {
            let userEmail = testEmail;
            if (!userEmail) {
                const { data: { session } } = await supabase.auth.getSession();
                userEmail = session?.user?.email;
            }
            if (!userEmail) return;

            const { data: ff } = await supabase.from('firefighters').select('id').eq('email', userEmail).single();

            if (ff) {
                const { data } = await supabase
                    .from('ot_assignments')
                    .select(`
            id, status, distance_km, accepted_at,
            ot_requests ( date, shift_type, stations (name, district) )
          `)
                    .eq('firefighter_id', ff.id)
                    .eq('status', 'accepted')
                    .order('ot_requests(date)', { ascending: true });

                setConfirmed(data || []);
            }
            setLoading(false);
        }
        fetchRoster();
    }, [testEmail]);

    return (
        <div className="p-4 space-y-6 mt-4 min-h-full pb-20">
            {confirmed.length === 0 && !loading ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No confirmed shifts</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {confirmed.map((assign) => {
                        const req = Array.isArray(assign.ot_requests) ? assign.ot_requests[0] : assign.ot_requests;
                        const station = Array.isArray(req.stations) ? req.stations[0] : req.stations;

                        return (
                            <Card key={assign.id} className="p-5 rounded-3xl border-slate-100 shadow-sm bg-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <ShieldCheck className="w-12 h-12 text-amber-500/10" />
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-amber-100 p-2 rounded-2xl">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            {new Date(req.date).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            {req.shift_type} Shift
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((station?.name || '') + ' Fire Station')}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-slate-600 hover:text-[#005DAC] transition-colors"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold underline decoration-slate-300 underline-offset-4">{station?.name}</span>
                                    </a>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-black px-3 py-1 rounded-full text-[10px] uppercase">
                                        Pending Allocation
                                    </Badge>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                        Subject to change
                                    </span>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
