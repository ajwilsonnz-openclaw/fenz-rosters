'use client';

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { User, Shield, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FirefighterProfilePage() {
    const [ff, setFF] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function loadProfile() {
            const { data: { session } } = await supabase.auth.getSession();
            const userEmail = session?.user?.email || "rebecca.taylor@fenz.slack.com";

            const { data } = await supabase
                .from('firefighters')
                .select('*, stations(name, district)')
                .eq('email', userEmail)
                .single();

            setFF(data);
            setLoading(false);
        }
        loadProfile();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse font-semibold text-slate-400">Loading Profile...</div>;

    return (
        <div className="p-4 space-y-6 bg-slate-50 min-h-screen">
            <div className="text-center py-6">
                <div className="w-20 h-20 bg-[#005DAC] rounded-3xl mx-auto flex items-center justify-center shadow-md mb-4">
                    <User className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-800">{ff?.first_name} {ff?.last_name}</h1>
                <p className="text-[#005DAC] font-semibold uppercase text-xs tracking-widest mt-1">{ff?.rank} • {ff?.watch} Watch</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Day OT</p>
                    <p className="text-3xl font-bold text-slate-700">{ff?.ot_count_days}</p>
                </Card>
                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Night OT</p>
                    <p className="text-3xl font-bold text-slate-700">{ff?.ot_count_nights}</p>
                </Card>
            </div>

            <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center gap-4 border-b border-slate-100">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <MapPin className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Home Station</p>
                        <p className="text-sm font-semibold text-slate-700">{ff?.stations?.name}</p>
                    </div>
                </div>
                <div className="p-5 flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <Award className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(ff?.qualifications || {}).filter(([_, v]) => v).map(([q]) => (
                            <span key={q} className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                                {q.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            </Card>

            <Button
                variant="outline"
                className="w-full rounded-xl py-6 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-semibold uppercase tracking-widest text-xs shadow-sm"
                onClick={() => supabase.auth.signOut()}
            >
                Sign Out
            </Button>
        </div>
    );
}