'use client';

import * as React from 'react';
import { Settings, Clock, Timer, ShieldCheck, Save, RefreshCw } from 'lucide-react';
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

    const CALLBACKS = [
        { id: 'cb1', label: '#1: Day Before Day 1', key_prefix: 'cb1_issue_day' },
        { id: 'cb2a', label: '#2a: Evening of Day 2', key_prefix: 'cb2a_issue_day' },
        { id: 'cb2b', label: '#2b: Day of Night 1', key_prefix: 'cb2b_issue_day' },
        { id: 'cb3', label: '#3: After Last Night', key_prefix: 'cb3_issue_day' },
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#005DAC] uppercase tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        System Control Panel
                    </h1>
                    <p className="text-slate-600 font-medium mt-1">Configure Callback Issuing Rules and Timing.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-[#005DAC] hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Configuration
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
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">Cron Timing</CardTitle>
                                <CardDescription>Trigger times for D1/D2 and N1/N2 cycles.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Day Shift Cron (D1/D2)</label>
                            <input 
                                type="time"
                                value={getSetting('day_shift_start_time')?.value || '09:00'}
                                onChange={(e) => updateValue('day_shift_start_time', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Night Shift Cron (N1/N2)</label>
                            <input 
                                type="time"
                                value={getSetting('night_shift_start_time')?.value || '21:00'}
                                onChange={(e) => updateValue('night_shift_start_time', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* RESPONSE CONFIG */}
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Timer className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">Response Logic</CardTitle>
                                <CardDescription>How long users have to reply.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Response Deadline (Minutes)</label>
                            <input 
                                type="number"
                                value={getSetting('response_window_minutes')?.value || '60'}
                                onChange={(e) => updateValue('response_window_minutes', e.target.value)}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* CALLBACK ISSUING RULES */}
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden md:col-span-2">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Timer className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">Callback Issuing Schedule</CardTitle>
                                <CardDescription>Select which shift of the cycle triggers each callback offer.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b">
                                    <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Callback Opportunity</th>
                                    <th className="p-6 text-center text-xs font-black text-[#005DAC] uppercase tracking-widest border-l">Firefighter Issue Day</th>
                                    <th className="p-6 text-center text-xs font-black text-purple-600 uppercase tracking-widest border-l">Officer Issue Day</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {CALLBACKS.map((cb) => (
                                    <tr key={cb.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-6">
                                            <p className="font-bold text-slate-800">{cb.label}</p>
                                            <p className="text-xs text-slate-400 font-medium italic mt-0.5">Offered for the next available occurrence.</p>
                                        </td>
                                        <td className="p-6 border-l bg-blue-50/10">
                                            <div className="flex justify-center">
                                                <select 
                                                    value={getSetting(`ff_${cb.key_prefix}`)?.value || 'D1'}
                                                    onChange={(e) => updateValue(`ff_${cb.key_prefix}`, e.target.value)}
                                                    className="p-3 rounded-xl border border-slate-200 font-black text-slate-800 outline-none w-32 text-center"
                                                >
                                                    {['D1', 'D2', 'N1', 'N2'].map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-6 border-l bg-purple-50/10">
                                            <div className="flex justify-center">
                                                <select 
                                                    value={getSetting(`off_${cb.key_prefix}`)?.value || 'D1'}
                                                    onChange={(e) => updateValue(`off_${cb.key_prefix}`, e.target.value)}
                                                    className="p-3 rounded-xl border border-slate-200 font-black text-slate-800 outline-none w-32 text-center"
                                                >
                                                    {['D1', 'D2', 'N1', 'N2'].map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* ENGINE STATUS */}
                <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden md:col-span-2">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-slate-800 uppercase tracking-tight">System Status</CardTitle>
                                <CardDescription>Emergency override.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-800">Engine Active Status</p>
                                <p className="text-sm text-slate-500">If disabled, no rounds will start.</p>
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
        </div>
    );
}
