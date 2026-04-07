'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Play, Loader2, Check, X, Sparkles, RotateCcw, Briefcase } from 'lucide-react';

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface WatchInfo {
  watch: string; shift: string; statusLabel: string;
  onLeave: boolean; callback: string | null;
  eligible: boolean; reason: string;
}

interface RosterFF {
  id: number; name: string; watch: string; rank: string;
  homeStation: string; otStation: string; distance: number;
  otDays: number; otNights: number;
  ncOtDays: number; ncOtNights: number;
  isAssigned: boolean; isEligible: boolean;
  cascadePhase: string; statusNote: string;
  callback: string | null; quals: string[];
  stolenFrom: string | null; threshold: string;
}

interface StationResult {
  stationName: string; stationId: number; slots: number; specialist: string | null;
  assignedFirefighters: { name: string; id: number; watch: string; homeStation: string; cascadePhase: string }[];
}

interface AvailableOT {
  stationName: string; slots: number; specialist: string | null; reqId: number;
}

interface ScenarioData {
  id: string; name: string; date: string; shift: string;
  totalSlots: number; totalAssigned: number;
  watchMatrix: WatchInfo[];
  stationResults?: StationResult[];
  availableOvertimes?: AvailableOT[];
  allFirefightersDetail: RosterFF[];
  phasesUsed: string[];
}

// ━━━ Style maps ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WATCH_TXT: Record<string, string> = {
  Blue: 'text-blue-400', Red: 'text-red-400', Green: 'text-green-400', Brown: 'text-amber-400',
};
const WATCH_BRD: Record<string, string> = {
  Blue: 'border-l-blue-500', Red: 'border-l-red-500', Green: 'border-l-green-500', Brown: 'border-l-amber-500',
};
const CB_STYLE: Record<string, string> = {
  '#1-BeforeDay1': 'bg-violet-600/25 text-violet-300 border-violet-600/50',
  '#2a-EveningDay2': 'bg-cyan-600/25 text-cyan-300 border-cyan-600/50',
  '#2b-DayOfNight1': 'bg-cyan-600/25 text-cyan-300 border-cyan-600/50',
  '#3-AfterLastNight': 'bg-cyan-600/25 text-cyan-300 border-cyan-600/50',
};
function fmtCb(cb: string | null): string {
  if (!cb) return '—';
  const n = cb.match(/#(\d+)/)?.[1];
  if (!n) return cb;
  const suffix = cb.toLowerCase().includes('night') ? 'N' : '';
  return `CB${n}${suffix}`;
}

const QUIT_COLORS: Record<string, string> = {
  prt: 'bg-blue-600/20 text-blue-400 border-blue-500/40',
  haz: 'bg-red-600/20 text-red-400 border-red-500/40',
  ha: 'bg-green-600/20 text-green-400 border-green-500/40',
  type4: 'bg-amber-600/20 text-amber-400 border-amber-500/40',
  pump: 'bg-purple-600/20 text-purple-400 border-purple-500/40',
};

// ─── Main ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setData(await res.json());
    } catch (e: any) {
      console.error('Failed to run scenario:', e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function resetOT() {
    if (!confirm('Reset ALL OT counts?')) return;
    setResetting(true);
    try {
      await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_ot_counts' }),
      });
      await run();
    } catch (e) { console.error(e); }
    finally { setResetting(false); }
  }

  if (!data && !loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="max-w-[98%] mx-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-blue-500" /> FENZ OT Test Dashboard
          </h1>
          <div className="rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 py-24 text-center space-y-3">
            <Sparkles className="w-14 h-14 text-zinc-700 mx-auto" />
            <h3 className="text-xl font-medium text-zinc-500">No scenario run yet</h3>
            <p className="text-sm text-zinc-600">Click Run to execute the multi-station OT scenario</p>
            <div className="pt-2">
              <Button onClick={run} className="bg-blue-600 hover:bg-blue-500 text-base px-8">
                <Play className="w-5 h-5 mr-2" /> Run Waitemata Day Scenario
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const fillPct = data.totalSlots > 0 ? Math.round(data.totalAssigned / data.totalSlots * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-[98%] mx-auto p-6 space-y-6">

        {/* ━━━ Header ━━━ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-500" /> FENZ OT — {data.name}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {data.date} · {data.shift} Shift · {data.totalAssigned}/{data.totalSlots} assigned ({fillPct}%)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {err && <span className="text-xs text-rose-400 max-w-[300px] truncate">{err}</span>}
            <Button onClick={resetOT} disabled={resetting || loading} variant="outline" className="border-zinc-700 text-zinc-400">
              <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} /> Reset OT
            </Button>
            <Button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running…</> : <><Play className="w-4 h-4 mr-2" /> Run Scenario</>}
            </Button>
          </div>
        </div>

        {/* ━━━ Watch Status Cards ━━━ */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-zinc-300">Watch Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-4 gap-3 px-4 pb-2">
              {data.watchMatrix.map(wm => {
                const isBad = !wm.eligible && !wm.onLeave;
                return (
                  <div key={wm.watch} className={`border rounded-lg p-3 border-l-4 ${WATCH_BRD[wm.watch]} ${
                    wm.onLeave ? 'border-zinc-800' : (wm.eligible ? 'border-emerald-800/50 bg-emerald-950/10' : 'border-rose-800/50 bg-rose-950/10')
                  }`}>
                    <div className={`font-bold text-sm ${WATCH_TXT[wm.watch]}`}>{wm.watch}</div>
                    <div className={`text-xs mt-1 ${wm.eligible ? 'text-emerald-400' : 'text-rose-400'}`}>{wm.statusLabel}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">{wm.reason}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ━━━ KPI strip ━━━ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Stations" value={
            (() => {
              const stationNames = new Set<string>();
              data.allFirefightersDetail.forEach(ff => { if(ff.otStation !== '—') stationNames.add(ff.otStation); });
              return stationNames.size;
            })()
          } />
          <KpiCard label="Slots Filled" value={`${data.totalAssigned}/${data.totalSlots}`} />
          <KpiCard label="Eligible" value={`${data.allFirefightersDetail.filter(f => f.isEligible).length} / ${data.allFirefightersDetail.length}`} />
          <KpiCard label="Assigned" value={data.allFirefightersDetail.filter(f => f.isAssigned).length} />
        </div>

        {/* ━━━ Available Overtimes ━━━ */}
        {data.availableOvertimes && data.availableOvertimes.length > 0 && (
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-zinc-300 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" /> Available Overtimes
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-1">
                Every open slot listed with required specialist qualification
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {data.availableOvertimes.map((ot, i) => (
                    <div
                      key={`${ot.reqId}-${i}`}
                      className={`rounded-lg p-2.5 border text-center ${
                        ot.specialist
                          ? 'border-amber-600/40 bg-amber-950/20'
                          : 'border-zinc-700/50 bg-zinc-800/30'
                      }`}
                    >
                      <div className="text-xs font-semibold text-zinc-200 truncate">{ot.stationName}</div>
                      {ot.specialist && (
                        <Badge variant="outline" className={`mt-1 text-[9px] h-4 px-1 ${
                          QUIT_COLORS[ot.specialist] || 'bg-zinc-700/30 text-zinc-400'
                        }`}>
                          {ot.specialist.toUpperCase()}
                        </Badge>
                      )}
                      {!ot.specialist && (
                        <div className="text-[9px] text-zinc-500 mt-1">Open</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ━═══ UNIFIED ROSTER TABLE ════════════════════════════════ */}
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-zinc-300">All Firefighters — OT Roster</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">Assigned → Eligible → Ineligible</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg border border-zinc-800 overflow-x-auto max-h-[700px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 bg-zinc-900/80 sticky top-0 z-10">
                    <TableHead className="border-zinc-800">#</TableHead>
                    <TableHead className="border-zinc-800">Name</TableHead>
                    <TableHead className="border-zinc-800">Watch</TableHead>
                    <TableHead className="border-zinc-800">Rank</TableHead>
                    <TableHead className="border-zinc-800">Home Station</TableHead>
                    <TableHead className="border-zinc-800">OT Station</TableHead>
                    <TableHead className="text-center border-zinc-800">Distance</TableHead>
                    <TableHead className="text-center border-zinc-800">OT</TableHead>
                    <TableHead className="text-center border-zinc-800">NC OT</TableHead>
                    <TableHead className="border-zinc-800">Quals</TableHead>
                    <TableHead className="text-center border-zinc-800">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.allFirefightersDetail.map((ff, i) => (
                    <TableRow key={i} className={`border-zinc-800/50 ${
                      ff.isAssigned ? 'bg-emerald-950/15 hover:bg-emerald-950/25' 
                        : ff.isEligible ? 'hover:bg-zinc-800/10' : 'bg-zinc-900/30'
                    }`}>
                      <TableCell className="text-zinc-600 text-xs font-mono">{i + 1}</TableCell>
                      <TableCell className={`font-medium ${ff.isAssigned ? 'text-emerald-300' : 'text-zinc-200'}`}>
                        {ff.name}
                        {ff.stolenFrom && <span className="text-[10px] text-amber-400 ml-1">(stolen from {ff.stolenFrom})</span>}
                      </TableCell>
                      <TableCell><span className={WATCH_TXT[ff.watch]}>{ff.watch}</span></TableCell>
                      <TableCell className="text-xs text-zinc-400">{ff.rank}</TableCell>
                      <TableCell className="text-xs text-zinc-400">{ff.homeStation}</TableCell>
                      <TableCell className="text-xs">{
                        ff.otStation !== '—' 
                          ? <span className="text-emerald-400 font-medium">{ff.otStation} <span className="text-zinc-500 text-[10px]">({ff.threshold})</span></span>
                          : <span className="text-zinc-600">—</span>
                      }</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs ${ff.distance === 0 ? 'text-zinc-600' : (ff.distance > 900 ? 'text-rose-400' : 'text-zinc-400')}`}>
                          {ff.distance === 0 ? '—' : `${ff.distance} km`}
                          {ff.distance === 0 && ff.isAssigned && <span className="text-xs text-zinc-500 ml-1">*</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-xs text-zinc-400">{ff.otDays}d / {ff.otNights}n</TableCell>
                      <TableCell className="text-center text-xs text-amber-400/80">{ff.ncOtDays}d / {ff.ncOtNights}n</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ff.quals.map(q => (
                            <Badge key={q} variant="outline" className={`${QUIT_COLORS[q] || 'bg-zinc-700/30 text-zinc-400'} text-[10px] h-5`}>{q}</Badge>
                          ))}
                          {ff.quals.length === 0 && <span className="text-zinc-600 text-xs">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {ff.isAssigned ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : ff.isEligible ? (
                          <span className="text-xs text-amber-400/60">⏳</span>
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-400/60 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ━━━ Legend ━━━ */}
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-500">
              <span><strong className="text-zinc-300">OT</strong> — Callback OT days/nights</span>
              <span><strong className="text-zinc-300">NC OT</strong> — Non-callback OT days/nights</span>
              <span><strong className="text-zinc-300">PRT</strong> — Pump/Rescue/Transport</span>
              <span><strong className="text-zinc-300">HA</strong> — Hazmat Awareness</span>
              <span><strong className="text-zinc-300">HAZ</strong> — Hazmat Operations</span>
              <span><strong className="text-zinc-300">TYPE4</strong> — Type 4 Hazmat</span>
              <span><strong className="text-zinc-300">PUMP</strong> — Pump Operator</span>
              <span className="ml-2"><span className="text-emerald-400">✓</span> = assigned <span className="text-amber-400/60">⏳</span> = eligible <span className="text-rose-400/60">✗</span> = ineligible</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
        <div className="text-xl font-bold text-zinc-100 mt-0.5">{value}</div>
      </CardContent>
    </Card>
  );
}
