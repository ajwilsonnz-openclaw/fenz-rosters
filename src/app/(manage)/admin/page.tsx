'use client';

import * as React from 'react';
import { Settings, Clock, Timer, Layers, ShieldCheck, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Setting {
    id?: number;
    key: string;
    value: string;
    description: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = React.useState<Setting[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    const fetchSettings = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('system_settings').select('*').order('key');
        if (error) {
            console.error('Error fetching settings:', error);
        } else {
            setSettings(data || []);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateValue = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const setting of settings) {
                const { error } = await supabase
                    .from('system_settings')
                    .update({ value: setting.value })
                    .eq('key', setting.key);
                if (error) throw error;
            }
            alert('Settings saved successfully');
        } catch (err) {
            console.error('Error saving settings:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-500 font-medium">Loading settings...</div>;

    const getSetting = (key: string) => settings.find(s => s.key === key);

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#005DAC] uppercase tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        System Control Panel
                    </h1>
                    <p className="text-slate-600 font-medium mt-1">Configure the OT Allocation Engine behavior and timing variables.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-[#005DAC] hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TIMING CONFIG */}
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-5 h-5 text-[#005DAC]" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">Engine Timing</CardTitle>
                                <CardDescription>When the process starts and how long rounds last.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Cron Start Time</label>
                            <input 
                                type="time"
                                value={getSetting('engine_start_time')?.value || '09:00'}
                                onChange={(e) => updateValue('engine_start_time', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                            <p className="text-xs text-slate-400 font-medium italic">The time the first round of conditional offers is generated.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Response Window (Minutes)</label>
                            <input 
                                type="number"
                                value={getSetting('response_window_minutes')?.value || '60'}
                                onChange={(e) => updateValue('response_window_minutes', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                            <p className="text-xs text-slate-400 font-medium italic">How long users have to accept/decline before the round is closed.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* LOGIC CONFIG */}
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Layers className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">Allocation Logic</CardTitle>
                                <CardDescription>Control the rerun behavior and stability.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Max Reruns per Batch</label>
                            <input 
                                type="number"
                                value={getSetting('max_rounds')?.value || '5'}
                                onChange={(e) => updateValue('max_rounds', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                            <p className="text-xs text-slate-400 font-medium italic">Limits the total number of re-runs if declines continue to occur.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Stability Weight (0-100)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={getSetting('stability_weight')?.value || '80'}
                                    onChange={(e) => updateValue('stability_weight', e.target.value)}
                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#005DAC]"
                                />
                                <span className="font-black text-slate-800 w-12 text-center text-lg">{getSetting('stability_weight')?.value || '80'}%</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium italic">Higher weight means the engine will try HARDER to keep accepted users in their current spots.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ENGINE STATUS */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">System Status</CardTitle>
                            <CardDescription>Emergency override and status monitoring.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="font-bold text-slate-800">Engine Active Status</p>
                            <p className="text-sm text-slate-500">If disabled, no rounds will start and no offers will be sent.</p>
                        </div>
                        <div 
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${getSetting('is_engine_active')?.value === 'true' ? 'bg-[#005DAC]' : 'bg-slate-300'}`}
                            onClick={() => updateValue('is_engine_active', getSetting('is_engine_active')?.value === 'true' ? 'false' : 'true')}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${getSetting('is_engine_active')?.value === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
