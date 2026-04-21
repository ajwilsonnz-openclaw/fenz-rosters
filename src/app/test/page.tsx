'use client';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FFDetail {
  id: number; name: string; district: string; watch: string; rank: string;
  homeStation: string; otStation: string; distance: number;
  cbDays: number; cbNights: number; ncDays: number; ncNights: number;
  isAssigned: boolean; phase: string; threshold: string; group: number; quals: string[];
}
interface StationAssignment {
  name: string; district: string; rank: string; watch: string; distance: number;
  threshold: string; group: number; phase: string; homeStation: string;
  cbDays: number; cbNights: number; ncDays: number; ncNights: number;
}
interface StationResult {
  stationName: string; district: string; slots: number; specialist: string | null;
  requiredRank: string; filled: number; complete: boolean; phasesUsed: string[];
  assigned: StationAssignment[];
}
interface TestAPIResponse {
  scenarioId: string; scenarioName: string; date: string; shift: string;
  totalSlots: number; totalAssigned: number; fillRate: number;
  phasesUsed: string[]; phaseCoverage: Record<string, number>;
  stationBreakdown: StationResult[]; allFirefightersDetail: FFDetail[];
  seedSummary: { totalFirefighters: number; totalStations: number; totalSlots: number };
  watchSummary: Record<string, { label: string; type: string; callback: string | null; shift: string; eligible: number; assigned: number }>;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WATCH_ORDER = ['Red', 'Green', 'Brown', 'Blue'];
const WATCH_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Red:    { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30',    badge: 'bg-red-600/80' },
  Green:  { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30',  badge: 'bg-green-600/80' },
  Brown:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30',  badge: 'bg-amber-600/80' },
  Blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30',   badge: 'bg-blue-600/80' },
};
const PHASE_LABELS: Record<string, string> = {
  'ff-callback': 'CB', 'ff-noncallback': 'NC',
  'ood-adj-cb': 'OOD-CB', 'ood-adj-nc': 'OOD-NC',
  'ood-dist-cb': 'OOD2-CB', 'ood-dist-nc': 'OOD2-NC',
  'so': 'SO', 'sso': 'SSO', 'sso-overflow': 'SSO→SO',
  'unassigned': '—',
};
const PHASE_COLORS: Record<string, string> = {
  'ff-callback': 'text-blue-400', 'ff-noncallback': 'text-green-400',
  'ood-adj-cb': 'text-cyan-400', 'ood-adj-nc': 'text-teal-400',
  'ood-dist-cb': 'text-orange-400', 'ood-dist-nc': 'text-yellow-400',
  'so': 'text-purple-400', 'sso': 'text-pink-400', 'sso-overflow': 'text-pink-300',
};
const RANK_LABEL: Record<string, string> = { FF: 'FF', SO: 'SO', SSO: 'SSO', SO_OR_SSO: 'SO/SSO' };
const RANK_COLORS: Record<string, string> = {
  FF: 'text-gray-400', SO: 'text-purple-400', SSO: 'text-pink-400', SO_OR_SSO: 'text-purple-300',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TestPage() {
  const [result, setResult] = useState<TestAPIResponse | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setRunning(true); setError(null);
    try {
      const res = await fetch('/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json() as TestAPIResponse;
      if (data.error) setError(data.error); else setResult(data);
    } catch (e: any) { setError(e?.message || 'Request failed'); }
    setRunning(false);
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Allocation Engine v2</h1>
          <p className="text-gray-400">FF + SO + SSO — 3 districts</p>
          <button onClick={runTest} disabled={running}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-lg">
            {running ? 'Running...' : 'Run Test'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const COMPLETE = result.totalAssigned === result.totalSlots;
  const watchSummaries = WATCH_ORDER.map(w => ({ watch: w, ...result.watchSummary?.[w] }))
    .filter(w => w.label);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      <div className="max-w-full mx-auto p-4 space-y-5">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Allocation Test v2</h1>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono">{result.date}</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${result.shift === 'Day' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>{result.shift} Shift</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{result.scenarioName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${COMPLETE ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <span className={`text-xl font-bold font-mono ${COMPLETE ? 'text-green-400' : 'text-amber-400'}`}>{result.totalAssigned}/{result.totalSlots}</span>
              <span className="text-xs text-gray-400">filled · {result.fillRate}%</span>
            </div>
            <button onClick={runTest} disabled={running}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-semibold text-white text-sm">
              {running ? 'Running...' : 'Re-run'}
            </button>
          </div>
        </div>

        {/* ── Watch Status Strip (color per watch) ────────────── */}
        <div className="grid grid-cols-4 gap-2">
          {watchSummaries.map(({ watch, type, shift, callback, eligible, assigned }) => {
            const c = WATCH_COLORS[watch];
            const statusLabel = type === 'leave' ? 'On Duty' : type === 'callback' ? `Callback ${callback || ''}` : 'Off Duty';
            const statusOk = eligible > 0;
            return (
              <div key={watch} className={`rounded-xl border px-3 py-2 ${c.bg} ${c.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{watch}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.badge} text-white`}>{watch}</span>
                </div>
                <div className={`text-[10px] mb-1 ${statusOk ? c.text : 'text-gray-500'}`}>
                  {statusLabel}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-bold font-mono ${statusOk ? 'text-white' : 'text-gray-600'}`}>{assigned}</span>
                  <span className="text-gray-600 text-[10px]">/</span>
                  <span className={`text-xs font-mono ${statusOk ? 'text-gray-400' : 'text-gray-700'}`}>{eligible} eligible</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Station Assignments (compact grid, show rank type) ─ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Station Assignments</h2>
            <span className="text-xs text-gray-600">{result.seedSummary.totalStations} stations · {result.seedSummary.totalSlots} slots</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {result.stationBreakdown.map((sr) => (
              <StationCard key={sr.stationName} sr={sr} />
            ))}
          </div>
        </div>

        {/* ── Phase Coverage ───────────────────────────────────── */}
        <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.phaseCoverage)
              .filter(([, c]) => c > 0)
              .sort(([a], [b]) => {
                const order = ['ff-callback','ff-noncallback','ood-adj-cb','ood-adj-nc','ood-dist-cb','ood-dist-nc','so','sso','sso-overflow'];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([phase, count]) => (
                <div key={phase} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-gray-600 bg-gray-800/60">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${PHASE_COLORS[phase] || 'text-gray-400'}`}>
                    {PHASE_LABELS[phase] || phase}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── All FFs (sorted by OT count within phase) ─────────── */}
        <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700/50">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              All Firefighters ({result.allFirefightersDetail.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700/50 bg-gray-800/40">
                  {['Name','Watch','District','Home','OT Station','CB OT','NC OT','Rank','Group','Phase','M/m'].map(h => (
                    <th key={h} className="text-left py-1.5 px-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.allFirefightersDetail.map((ff, idx) => (
                  <tr key={ff.id}
                    className={`border-b border-gray-800/30 ${ff.isAssigned ? '' : idx % 2 === 0 ? 'bg-gray-900/20' : ''} ${!ff.isAssigned ? 'opacity-50' : ''}`}>
                    <td className="py-1.5 px-3 text-gray-200 font-medium whitespace-nowrap">{ff.name}</td>
                    <td className="py-1.5 px-3 text-gray-400 whitespace-nowrap">{ff.watch}</td>
                    <td className="py-1.5 px-3 text-gray-500 text-[10px]">{ff.district}</td>
                    <td className="py-1.5 px-3 text-gray-500 text-[10px] whitespace-nowrap">{ff.homeStation}</td>
                    <td className={`py-1.5 px-3 text-xs font-medium whitespace-nowrap ${ff.isAssigned ? 'text-green-400' : 'text-gray-600'}`}>
                      {ff.otStation || <span className="text-gray-600 italic">—</span>}
                      {ff.isAssigned && ff.distance > 0 && <span className="text-gray-500 font-normal text-[10px]"> ·{ff.distance}km</span>}
                    </td>
                    <td className="py-1.5 px-3 text-blue-400 font-mono">{ff.cbDays}D/{ff.cbNights}N</td>
                    <td className="py-1.5 px-3 text-amber-400 font-mono">{ff.ncDays}D/{ff.ncNights}N</td>
                    <td className="py-1.5 px-3 text-gray-500 text-[10px]">{ff.rank}</td>
                    <td className="py-1.5 px-3 text-gray-500 text-[10px]">G{ff.group || '—'}</td>
                    <td className="py-1.5 px-3">
                      <span className={`text-[10px] font-bold ${PHASE_COLORS[ff.phase] || 'text-gray-600'}`}>
                        {PHASE_LABELS[ff.phase] || ff.phase}
                      </span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className={`text-[10px] font-bold uppercase ${ff.threshold === 'must' ? 'text-emerald-400' : ff.threshold === 'might' ? 'text-amber-400' : 'text-gray-600'}`}>
                        {ff.threshold === 'must' ? 'M' : ff.threshold === 'might' ? 'm' : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Station Card ─────────────────────────────────────────────────────────────
function StationCard({ sr }: { sr: StationResult }) {
  const short = sr.slots - sr.filled;
  const rankColor = RANK_COLORS[sr.requiredRank] || 'text-gray-400';
  const rankBg = sr.requiredRank === 'SSO' ? 'bg-pink-500/20 border-pink-500/30' :
                 sr.requiredRank === 'SO'  ? 'bg-purple-500/20 border-purple-500/30' :
                 'bg-gray-800/60 border-gray-700/50';

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${sr.complete ? 'bg-green-500/5 border-green-500/20' : rankBg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-100 truncate">{sr.stationName}</span>
            {sr.specialist && (
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {sr.specialist.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold ${rankColor}`}>{RANK_LABEL[sr.requiredRank] || sr.requiredRank}</span>
            <span className="text-gray-600 text-[9px]">·</span>
            <span className="text-[10px] text-gray-500">{sr.district}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className={`text-base font-bold font-mono ${sr.complete ? 'text-green-400' : 'text-amber-400'}`}>
            {sr.filled}/{sr.slots}
          </span>
          {!sr.complete && <div className="text-[9px] text-amber-600/60">{short} short</div>}
        </div>
      </div>

      {sr.assigned.length > 0 ? (
        <div className="space-y-1">
          {sr.assigned.map((a, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-gray-900/50 rounded-md px-2 py-1">
              <span className="text-xs text-gray-200 font-medium truncate flex-1">{a.name}</span>
              <span className="text-[9px] text-gray-500 font-mono shrink-0">{a.watch}</span>
              <span className={`text-[9px] font-bold shrink-0 ${PHASE_COLORS[a.phase] || 'text-gray-400'}`}>
                {PHASE_LABELS[a.phase] || a.phase}
              </span>
              <span className={`text-[9px] font-bold shrink-0 ${a.threshold === 'must' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {a.threshold === 'must' ? 'M' : 'm'}
              </span>
              <span className="text-[9px] text-gray-500 font-mono shrink-0">{a.distance}km</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[10px] text-gray-600 italic">No eligible candidates</div>
      )}
    </div>
  );
}