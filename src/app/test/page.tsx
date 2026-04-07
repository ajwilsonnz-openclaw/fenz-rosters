'use client';

import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TraceStep {
  phase: string;
  message: string;
  detail?: string;
  badge: 'info' | 'pass' | 'reject' | 'assign' | 'warn';
  indent?: number;
}

interface DebugTraceCandidate {
  id: number;
  name: string;
  watch: string;
  station: string;
  stationId: number;
  rank: string;
  otDays: number;
  otNights: number;
  totalOt: number;
  shift: string;
  callback: string | null;
  distance: number;
  threshold: string;
  qualifications: Record<string, boolean>;
  isAssigned: boolean;
  isEligible: boolean;
  filterReason?: string;
}

interface DebugTrace {
  steps: TraceStep[];
  candidates: DebugTraceCandidate[];
  summary: {
    totalCandidates: number;
    passedFilter: number;
    mustCount: number;
    mightCount: number;
    lockedOutCount: number;
    wontCount: number;
    assigned: number;
    slotsRequested: number;
    slotsFilled: number;
    slotsUnfilled: number;
  };
}

interface AssignedFF {
  name: string;
  watch: string;
  rank: string;
  threshold: string;
  distance?: number;
}

interface FirefighterDetail {
  name: string;
  watch: string;
  shift: string;
  callback: string | null;
  onLeave: boolean;
  qualifications: Record<string, boolean>;
  otCountDays: number;
  otCountNights: number;
  isEligible: boolean;
  isAssigned: boolean;
  filterReason: string;
}

interface WatchMatrixEntry {
  shift: string;
  onLeave: boolean;
  callback: string | null;
  eligible: boolean;
  reason: string;
}

interface TestResult {
  id: string;
  name: string;
  shouldHappen: string;
  passed: boolean;
  actualWatcher: string | null;
  expectedWatcher: string | null;
  assignmentsCount: number;
  expectedSlots: number;
  eligiblePoolSize: number;
  assigned: AssignedFF[];
  allFirefightersDetail: DebugTraceCandidate[];
  watchMatrix: WatchMatrixEntry[];
  debugTrace: DebugTrace | null;
  errors: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SCENARIOS = [
  { id: 'blue-callback', name: 'Blue Callback — April 10 Day Shift', date: '2026-04-10', shift: 'Day', slots: 1, shouldHappen: 'Blue has Callback #1 (Off before Day 1). Brown on regular Day, non-callback, filtered out. Red is Night + #3 (night-only). Green Off, non-callback. Only Blue eligible.' },
  { id: 'partial-fill', name: 'Partial Fill — April 10 Day × 8 slots', date: '2026-04-10', shift: 'Day', slots: 8, shouldHappen: "Only Blue callback eligible (5 FFs). All Blue assigned, remaining slots unfilled." },
  { id: 'green-callback', name: 'Green Callback #1 — April 12 Day Shift', date: '2026-04-12', shift: 'Day', slots: 1, shouldHappen: "Green has Callback #1 (Off before Day 1). Red Off, non-callback. Brown Night + #3 (night-only). Blue Day + #2a (excluded). Only Green." },
  { id: 'no-eligible', name: 'No Eligible — April 13 Day Shift', date: '2026-04-13', shift: 'Day', slots: 1, shouldHappen: "No callbacks on April 13. Green regular Day, non-callback. Blue Night+#2b. Red/Brown Off, non-callback. ZERO assignments." },
  { id: 'leave-exclusion', name: 'Leave Exclusion — Feb 10 All On Leave', date: '2026-02-10', shift: 'Day', slots: 1, shouldHappen: 'All 4 watches in Leave 1 block (cycle position < 16). NO ONE should be assigned.' },
];

interface ScenarioDef {
  id: string;
  name: string;
  date: string;
  shift: string;
  slots: number;
  shouldHappen: string;
}

const WATCH_NAMES = ['Green', 'Red', 'Brown', 'Blue'] as const;

const WATCH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Red:   { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/30' },
  Brown: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Blue:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/30' },
};

// ─── Badge Components ───────────────────────────────────────────────────────

function WatchBadge({ watch }: { watch: string }) {
  const color = WATCH_COLORS[watch];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}>
      {watch}
    </span>
  );
}

function ThresholdBadge({ threshold }: { threshold: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    must:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    might:      { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
    locked_out: { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
    won_t:      { bg: 'bg-gray-500/15',    text: 'text-gray-400' },
  };
  const c = map[threshold] || map.won_t;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${c.bg} ${c.text}`}>
      {threshold === 'won_t' ? "won't" : threshold.replace('_', ' ')}
    </span>
  );
}

// ─── Step-by-step trace renderer ────────────────────────────────────────────

function TraceRenderer({ trace }: { trace: DebugTrace }) {
  const badgeColor: Record<string, string> = {
    info:   'text-blue-400',
    pass:   'text-emerald-400',
    reject: 'text-red-400/80',
    assign: 'text-green-400',
    warn:   'text-amber-400',
  };
  const phaseIcons: Record<string, string> = {
    filter: '🔍', threshold: '📊', assign: '⚙️', summary: '🏁',
  };

  return (
    <div className="mt-4">
      <div className="bg-gray-950/80 rounded-lg border border-gray-700/50 font-mono text-xs overflow-hidden">
        {/* Summary bar */}
        <div className="flex flex-wrap gap-3 px-4 py-2 bg-gray-800/60 border-b border-gray-700/50 text-gray-300">
          <span>🎯 {trace.summary.assigned}/{trace.summary.slotsRequested} filled</span>
          {trace.summary.slotsUnfilled > 0 && <span className="text-amber-400">({trace.summary.slotsUnfilled} unfilled)</span>}
          <span className="ml-auto flex gap-2">
            {trace.summary.mustCount > 0 && <span className="text-emerald-400">● {trace.summary.mustCount} must</span>}
            {trace.summary.mightCount > 0 && <span className="text-amber-400">● {trace.summary.mightCount} might</span>}
            {trace.summary.lockedOutCount > 0 && <span className="text-orange-400">● {trace.summary.lockedOutCount} locked</span>}
            {trace.summary.wontCount > 0 && <span className="text-gray-400">● {trace.summary.wontCount} won't</span>}
          </span>
        </div>

        {/* Steps */}
        <div className="p-3 space-y-0.5 max-h-[600px] overflow-y-auto">
          {trace.steps.map((step, i) => {
            const indent = step.indent ? 'ml-4 '.repeat(step.indent) : '';
            const isPhaseHeader = step.message.startsWith('━');
            return (
              <div key={i} className={`flex items-start gap-2 py-1 ${isPhaseHeader ? 'border-b border-gray-700/30 pb-1 mb-1' : ''}`}>
                <span className="text-gray-500 select-none w-8 shrink-0 text-right">{phaseIcons[step.phase] || ''}</span>
                <div>
                  <span className={indent + ' ' + (isPhaseHeader ? (badgeColor[step.badge] || 'text-gray-400') + ' font-semibold' : (badgeColor[step.badge] || 'text-gray-300'))}>
                    {step.message}
                  </span>
                  {step.detail && (
                    <div className={indent + 'text-gray-500 mt-0.5'}>{step.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate table */}
      <details className="mt-3 group">
        <summary className="cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 select-none">
          📋 Full Firefighter Table
        </summary>
        <div className="mt-2 bg-gray-800/50 rounded-lg overflow-x-auto border border-gray-700/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700/50 bg-gray-800/70">
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Name</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Watch</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Shift</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Callback</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Station</th>
                <th className="text-center py-2 px-2 text-gray-400 font-medium">Distance</th>
                <th className="text-center py-2 px-2 text-gray-400 font-medium">OT</th>
                <th className="text-left py-2 px-2 text-gray-400 font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {trace.candidates
                .sort((a, b) => {
                  const order = { assigned: 0, eligible: 1, excluded: 2 };
                  const aStatus = a.isAssigned ? 'assigned' : a.isEligible ? 'eligible' : 'excluded';
                  const bStatus = b.isAssigned ? 'assigned' : b.isEligible ? 'eligible' : 'excluded';
                  return (order[aStatus] - order[bStatus]) || a.watch.localeCompare(b.watch);
                })
                .map((ff: DebugTraceCandidate, i: number) => {
                  const status = ff.isAssigned ? '🟢' : ff.isEligible ? '🟡' : '⏸️';
                  const rowBg = ff.isAssigned ? 'bg-green-900/20' : ff.isEligible ? 'bg-yellow-900/10' : '';
                  const quals = Object.entries(ff.qualifications || {}).filter(([,v]) => v).map(([k]) => k).join(', ') || '—';
                  return (
                    <tr key={i} className={`border-b border-gray-800/30 ${rowBg}`}>
                      <td className="py-1.5 px-2 text-center text-sm">{status}</td>
                      <td className="py-1.5 px-2 text-gray-200 font-medium">{ff.name}</td>
                      <td className="py-1.5 px-2"><WatchBadge watch={ff.watch} /></td>
                      <td className="py-1.5 px-2 font-mono text-gray-300">{ff.shift}</td>
                      <td className="py-1.5 px-2 font-mono text-gray-400">{ff.callback || '—'}</td>
                      <td className="py-1.5 px-2 text-gray-400">{ff.station}</td>
                      <td className="py-1.5 px-2 font-mono text-center text-gray-400">{ff.distance === 999 ? '???' : ff.distance + ' km'}</td>
                      <td className="py-1.5 px-2 font-mono text-center text-gray-400">{ff.otDays}D/{ff.otNights}N</td>
                      <td className="py-1.5 px-2"><ThresholdBadge threshold={ff.threshold} /></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

// ─── Test Card ───────────────────────────────────────────────────────────────

function TestCard({
  scenario,
  result,
  onRun,
  running,
}: {
  scenario: ScenarioDef;
  result?: TestResult;
  onRun: (id: string) => void;
  running: boolean;
}) {
  return (
    <div className={`rounded-2xl border transition-all ${result ? (result.passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-gray-700/50 bg-gray-800/20'}`}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-base font-medium text-gray-100">{scenario.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{scenario.date} × {scenario.shift} × {scenario.slots} slot(s)</p>
        </div>
        <button
          onClick={() => onRun(scenario.id)}
          disabled={running}
          className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
        >
          {running ? '⏳' : '▶ Run'}
        </button>
      </div>

      {/* Scenario description */}
      <div className="px-5 py-2 border-t border-b border-gray-700/30">
        <p className="text-xs text-gray-400 leading-relaxed">{scenario.shouldHappen}</p>
      </div>

      {/* Results area */}
      {result && (
        <>
          {/* Verdict bar */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-700/30">
            <span className={`text-2xl ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
              {result.passed ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              {result.passed ? (
                <p className="text-sm text-green-400 font-medium">Test passed</p>
              ) : (
                <p className="text-sm text-red-400 font-medium">
                  Expected watcher: {result.expectedWatcher ?? 'null'} → got: {result.actualWatcher ?? 'null'} ({result.assignmentsCount} assignments)
                </p>
              )}
            </div>
            {result.assignmentsCount > 0 && (
              <span className="text-xs text-gray-400">
                {result.assignmentsCount}/{result.expectedSlots} filled
              </span>
            )}
          </div>

          {/* Assigned firefighters */}
          {result.assigned.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-700/30">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned</h4>
              <div className="flex flex-wrap gap-2">
                {result.assigned.map((ff: AssignedFF, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
                    <WatchBadge watch={ff.watch} />
                    <span className="text-sm text-gray-200">{ff.name}</span>
                    <span className="text-[10px] text-gray-500">{ff.rank}</span>
                    <ThresholdBadge threshold={ff.threshold} />
                    {ff.distance !== undefined && <span className="text-[10px] text-gray-500">{ff.distance}km</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watch Eligibility Matrix */}
          <div className="px-5 py-3 border-b border-gray-700/30">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Watch Matrix</h4>
            <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/70">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Watch</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Shift</th>
                    <th className="text-center py-2 px-3 text-gray-400 font-medium text-xs w-16">Eligible</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {WATCH_NAMES.map((watchName, i) => {
                    const entry = result.watchMatrix[i];
                    return (
                      <tr key={watchName} className={i < 3 ? 'border-b border-gray-800/30' : ''}>
                        <td className="py-2 px-3"><WatchBadge watch={watchName} /></td>
                        <td className="py-2 px-3 font-mono text-xs text-gray-300">{entry.shift}</td>
                        <td className="py-2 px-3 text-center text-lg">
                          {entry.eligible ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                        </td>
                        <td className={`py-2 px-3 text-xs ${entry.eligible ? 'text-green-400/50' : 'text-gray-400'}`}>
                          {entry.eligible ? '✓ Eligible' : entry.reason}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Debug trace (collapsible) */}
          {result.debugTrace && (
            <details className="px-5 py-3 border-b border-gray-700/30">
              <summary className="cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 select-none">
                🔬 Step-by-step allocation debug trace
              </summary>
              <TraceRenderer trace={result.debugTrace} />
            </details>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="px-5 py-3">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Errors</h4>
              <pre className="text-xs text-red-300 bg-red-500/5 rounded-lg p-3 overflow-x-auto">
                {result.errors.join('\n')}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  async function runScenario(scenarioId: string) {
    setRunning(true);
    try {
      setResults((r) => ({ ...r, [scenarioId]: undefined as any }));
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (Array.isArray(data.results)) {
        const result = data.results[0];
        if (result) {
          setResults((prev) => {
            const updated = { ...prev, [scenarioId]: result };
            return updated;
          });
          // Update totals
          const allVals = Object.values({ ...results, [scenarioId]: result });
          setPassCount(allVals.filter((r) => r && r.passed).length);
          setTotalCount(allVals.filter(Boolean).length);
        }
      }
    } catch (e) {
      console.error('Failed to run scenario:', e);
    }
    setRunning(false);
  }

  async function runAll() {
    setRunning(true);
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.passCount !== undefined && data.total !== undefined) {
        setPassCount(data.passCount);
        setTotalCount(data.total);
        setTimestamp(data.timestamp);
      }

      if (Array.isArray(data.results)) {
        const newResults: Record<string, TestResult> = {};
        for (const result of data.results) {
          newResults[result.id] = result;
        }
        setResults(newResults);
      }
    } catch (e) {
      console.error('Failed to run all scenarios:', e);
    }
    setRunning(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Test Scenarios</h1>
            <p className="text-sm text-gray-400 mt-1">Allocation engine regression tests</p>
          </div>
          <div className="flex items-center gap-3">
            {timestamp && (
              <span className="text-xs text-gray-500">
                Last run: {new Date(timestamp).toLocaleTimeString('en-NZ', {
                  timeZone: 'Pacific/Auckland',
                })}
              </span>
            )}
            {(passCount > 0 || totalCount > 0) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
                <span className="text-sm text-green-400">{passCount}/{totalCount}</span>
                <span className="text-xs text-gray-500">passed</span>
              </div>
            )}
            <button
              onClick={runAll}
              disabled={running}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 font-medium text-white text-sm transition-all"
            >
              {running ? '⏳ Running...' : '▶ Run all tests'}
            </button>
          </div>
        </div>

        {/* Scenario cards */}
        <div className="space-y-4">
          {SCENARIOS.map((scenario) => (
            <TestCard
              key={scenario.id}
              scenario={scenario}
              result={results[scenario.id]}
              onRun={runScenario}
              running={running}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
