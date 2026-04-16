'use client';

import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AssignedFF {
  name: string;
  id: number;
  watch: string;
  rank: string;
  threshold: string;
  distance: number;
  homeStation: string;
  cascadePhase: string;
  callback: string | null;
  qualifications: string[];
  stolenFrom?: string;
}

interface StationResult {
  stationName: string;
  stationId: number;
  slots: number;
  specialist: string | null;
  assignedFirefighters: AssignedFF[];
  phasesUsed: string[];
  traceLogs?: { phase: string; logs: { type: string; message: string; detail?: string }[] }[];
}

interface WatchMatrixEntry {
  watch: string;
  shift: string;
  statusLabel: string;
  onLeave: boolean;
  callback: string | null;
  eligible: boolean;
  reason: string;
}

interface FFDetail {
  id: number;
  name: string;
  watch: string;
  rank: string;
  homeStation: string;
  otStation: string;
  distance: number;
  otDays: number;
  otNights: number;
  isAssigned: boolean;
  isEligible: boolean;
  cascadePhase: string;
  callback: string | null;
  quals: string[];
  stolenFrom: string | null;
  threshold: string;
}

interface KnownResultCheck {
  passed: boolean;
  expected: { name: string }[];
  actual: string[];
  mismatches: { position: number; expected: string; actual: string; match: boolean }[];
}

interface TestAPIResponse {
  id: string;
  name: string;
  date: string;
  shift: string;
  totalSlots: number;
  totalAssigned: number;
  watchMatrix: WatchMatrixEntry[];
  stationResults: StationResult[];
  allFirefightersDetail: FFDetail[];
  phasesUsed: string[];
  knownResultCheck?: KnownResultCheck;
  error?: string;
}

// ─── Scenario Definitions ───────────────────────────────────────────────────

interface ScenarioDef {
  id: string;
  apiKey: string; // Value sent as { scenario: apiKey }
  name: string;
  description: string;
  expectedResult: string;
  stations: string;
}

const SCENARIOS: ScenarioDef[] = [
  {
    id: 'default',
    apiKey: 'default',
    name: 'Waitemata Day — 5 Stations (11 slots)',
    description: 'Full 5-station Waitemata OT request for April 10 Day shift. Blue watch has callback #1, Green is off-duty. Tests the complete cascade: callback → non-callback → out-of-district.',
    expectedResult: '11/11 slots filled. Blue=4 (callback), Green=5-7 (non-callback + OOD). No Red/Brown (excluded).',
    stations: 'Albany(3), Devonport(2), Silverdale(2), Takapuna(2), East Coast Bays(2)',
  },
  {
    id: 'known-result-simple',
    apiKey: 'known-result-simple',
    name: 'Known Result — Albany 2-slot',
    description: 'Simple 1-station test. Albany needs 2 FFs, no specialist. Only Blue Waitemata callback FFs eligible. With all OT counts at 0, the 2 closest FFs should be assigned.',
    expectedResult: 'Zoe Fletcher (Albany→Albany, 0km) + Kate Sullivan (Silverdale→Albany, 4km)',
    stations: 'Albany(2)',
  },
  {
    id: 'known-result-complex',
    apiKey: 'known-result-complex',
    name: 'Known Result — 3 Stations + Specialist',
    description: 'Multi-station test with specialist qualification requirement. Albany needs 2 (no spec), Silverdale needs 1 with PRT qualification, Takapuna needs 1 (no spec). Tests callback exhaustion, specialist filtering, cross-station tracking, and phase fallback.',
    expectedResult: 'Albany: Zoe+Kate (Blue CB). Silverdale: Emma Chen (Green NC, has PRT). Takapuna: Rongo Parata (Blue CB, home station).',
    stations: 'Albany(2), Silverdale(1,prt), Takapuna(1)',
  },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const WATCH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Red:   { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/30' },
  Brown: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Blue:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/30' },
};

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  callback:           { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  'non-callback':     { bg: 'bg-green-500/15',   text: 'text-green-400' },
  'out-of-district':  { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  'specialist-steal': { bg: 'bg-purple-500/15',  text: 'text-purple-400' },
  SO:                 { bg: 'bg-yellow-500/15',  text: 'text-yellow-400' },
  SSO:                { bg: 'bg-red-500/15',     text: 'text-red-400' },
};

// ─── Badge Components ───────────────────────────────────────────────────────

function WatchBadge({ watch }: { watch: string }) {
  const color = WATCH_COLORS[watch] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color.bg} ${color.text} ${color.border}`}>
      {watch}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const c = PHASE_COLORS[phase] || { bg: 'bg-gray-500/15', text: 'text-gray-400' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${c.bg} ${c.text}`}>
      {phase}
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

// ─── Trace Log Renderer ────────────────────────────────────────────────────

function TraceLogRenderer({ traceLogs }: { traceLogs: { phase: string; logs: { type: string; message: string; detail?: string }[] }[] }) {
  const typeColors: Record<string, string> = {
    header: 'text-blue-400 font-semibold',
    pass:   'text-emerald-400',
    skip:   'text-gray-500',
    assign: 'text-green-400 font-medium',
  };

  return (
    <div className="bg-gray-950/80 rounded-lg border border-gray-700/50 font-mono text-xs overflow-hidden max-h-[500px] overflow-y-auto">
      {traceLogs.map((phaseGroup, pi) => (
        <div key={pi} className="border-b border-gray-800/50 last:border-0">
          {phaseGroup.logs.map((log, li) => (
            <div key={li} className={`flex items-start gap-2 px-3 py-1 ${log.type === 'header' ? 'bg-gray-800/40' : ''}`}>
              <span className="text-gray-600 w-4 shrink-0">
                {log.type === 'assign' ? '✓' : log.type === 'skip' ? '·' : log.type === 'header' ? '▸' : '•'}
              </span>
              <div>
                <span className={typeColors[log.type] || 'text-gray-400'}>{log.message}</span>
                {log.detail && <div className="text-gray-600 mt-0.5">{log.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
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
  result?: TestAPIResponse;
  onRun: (id: string) => void;
  running: boolean;
}) {
  const hasResult = !!result;
  const kr = result?.knownResultCheck;
  const allFilled = result ? result.totalAssigned === result.totalSlots : false;
  const passed = kr ? kr.passed : allFilled;

  return (
    <div className={`rounded-2xl border transition-all ${hasResult ? (passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-gray-700/50 bg-gray-800/20'}`}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-base font-medium text-gray-100">{scenario.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{scenario.stations}</p>
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
        <p className="text-xs text-gray-400 leading-relaxed">{scenario.description}</p>
        <p className="text-xs text-blue-400/70 mt-1">Expected: {scenario.expectedResult}</p>
      </div>

      {/* Results area */}
      {hasResult && result && (
        <>
          {/* Verdict bar */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-700/30">
            <span className={`text-2xl ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              {kr ? (
                kr.passed ? (
                  <p className="text-sm text-green-400 font-medium">Known result matched — all {kr.expected.length} positions correct</p>
                ) : (
                  <div>
                    <p className="text-sm text-red-400 font-medium">Known result mismatch</p>
                    {kr.mismatches.map((m, i) => (
                      <p key={i} className="text-xs text-red-300 mt-0.5">
                        Position {m.position}: expected &quot;{m.expected}&quot; → got &quot;{m.actual}&quot;
                      </p>
                    ))}
                  </div>
                )
              ) : (
                <p className={`text-sm font-medium ${allFilled ? 'text-green-400' : 'text-amber-400'}`}>
                  {result.totalAssigned}/{result.totalSlots} slots filled
                  {!allFilled && ` (${result.totalSlots - result.totalAssigned} unfilled)`}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {result.totalAssigned}/{result.totalSlots} filled
            </span>
          </div>

          {/* Station Results */}
          <div className="px-5 py-3 border-b border-gray-700/30">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Station Assignments</h4>
            <div className="space-y-3">
              {result.stationResults.map((sr, si) => (
                <div key={si} className="bg-gray-800/40 rounded-lg border border-gray-700/40 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">{sr.stationName}</span>
                      {sr.specialist && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {sr.specialist}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-mono ${sr.assignedFirefighters.length === sr.slots ? 'text-green-400' : 'text-amber-400'}`}>
                      {sr.assignedFirefighters.length}/{sr.slots}
                    </span>
                  </div>
                  {sr.assignedFirefighters.length > 0 && (
                    <div className="px-4 py-2 space-y-1.5">
                      {sr.assignedFirefighters.map((af, fi) => (
                        <div key={fi} className="flex items-center gap-2 flex-wrap">
                          <WatchBadge watch={af.watch} />
                          <span className="text-sm text-gray-200 font-medium">{af.name}</span>
                          <span className="text-[10px] text-gray-500">{af.rank}</span>
                          <PhaseBadge phase={af.cascadePhase} />
                          <ThresholdBadge threshold={af.threshold} />
                          <span className="text-[10px] text-gray-500 font-mono">{af.distance}km</span>
                          <span className="text-[10px] text-gray-600">from {af.homeStation}</span>
                          {af.stolenFrom && (
                            <span className="text-[10px] text-purple-400">(stolen from {af.stolenFrom})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Watch Eligibility Matrix */}
          <div className="px-5 py-3 border-b border-gray-700/30">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Watch Matrix</h4>
            <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/70">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Watch</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Shift</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Status</th>
                    <th className="text-center py-2 px-3 text-gray-400 font-medium text-xs w-16">Eligible</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.watchMatrix.map((entry, i) => (
                    <tr key={i} className={i < 3 ? 'border-b border-gray-800/30' : ''}>
                      <td className="py-2 px-3"><WatchBadge watch={entry.watch} /></td>
                      <td className="py-2 px-3 font-mono text-xs text-gray-300">{entry.shift}</td>
                      <td className="py-2 px-3 text-xs text-gray-400">{entry.statusLabel}</td>
                      <td className="py-2 px-3 text-center text-lg">
                        {entry.eligible ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                      </td>
                      <td className={`py-2 px-3 text-xs ${entry.eligible ? 'text-green-400/50' : 'text-gray-400'}`}>
                        {entry.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phase Distribution */}
          <div className="px-5 py-3 border-b border-gray-700/30">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignment Distribution</h4>
            <div className="flex flex-wrap gap-3">
              {(() => {
                const byWatch: Record<string, number> = {};
                const byPhase: Record<string, number> = {};
                for (const ff of result.allFirefightersDetail) {
                  if (ff.isAssigned) {
                    byWatch[ff.watch] = (byWatch[ff.watch] || 0) + 1;
                    byPhase[ff.cascadePhase] = (byPhase[ff.cascadePhase] || 0) + 1;
                  }
                }
                return (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">By Watch:</span>
                      {Object.entries(byWatch).map(([w, c]) => (
                        <span key={w} className="flex items-center gap-1">
                          <WatchBadge watch={w} />
                          <span className="text-xs text-gray-300 font-mono">{c}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">By Phase:</span>
                      {Object.entries(byPhase).map(([p, c]) => (
                        <span key={p} className="flex items-center gap-1">
                          <PhaseBadge phase={p} />
                          <span className="text-xs text-gray-300 font-mono">{c}</span>
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Trace logs (collapsible) */}
          {result.stationResults.some(sr => sr.traceLogs && sr.traceLogs.length > 0) && (
            <details className="px-5 py-3 border-b border-gray-700/30">
              <summary className="cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 select-none">
                🔬 Allocation Trace Logs
              </summary>
              <div className="mt-3 space-y-3">
                {result.stationResults.map((sr, si) => (
                  sr.traceLogs && sr.traceLogs.length > 0 && (
                    <div key={si}>
                      <h5 className="text-xs font-medium text-gray-400 mb-1">{sr.stationName}</h5>
                      <TraceLogRenderer traceLogs={sr.traceLogs} />
                    </div>
                  )
                ))}
              </div>
            </details>
          )}

          {/* All Firefighters (collapsible) */}
          <details className="px-5 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 select-none">
              📋 All Firefighters ({result.allFirefightersDetail.length})
            </summary>
            <div className="mt-2 bg-gray-800/50 rounded-lg overflow-x-auto border border-gray-700/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/70">
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Watch</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Rank</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Home Station</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">OT Station</th>
                    <th className="text-center py-2 px-2 text-gray-400 font-medium">Dist</th>
                    <th className="text-center py-2 px-2 text-gray-400 font-medium">OT Count</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Phase</th>
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {result.allFirefightersDetail.map((ff, i) => {
                    const status = ff.isAssigned ? '🟢' : ff.isEligible ? '🟡' : '⏸️';
                    const rowBg = ff.isAssigned ? 'bg-green-900/20' : ff.isEligible ? 'bg-yellow-900/10' : '';
                    return (
                      <tr key={i} className={`border-b border-gray-800/30 ${rowBg}`}>
                        <td className="py-1.5 px-2 text-center text-sm">{status}</td>
                        <td className="py-1.5 px-2 text-gray-200 font-medium">{ff.name}</td>
                        <td className="py-1.5 px-2"><WatchBadge watch={ff.watch} /></td>
                        <td className="py-1.5 px-2 text-gray-400">{ff.rank}</td>
                        <td className="py-1.5 px-2 text-gray-400">{ff.homeStation}</td>
                        <td className="py-1.5 px-2 text-gray-300">{ff.otStation}</td>
                        <td className="py-1.5 px-2 font-mono text-center text-gray-400">{ff.distance > 0 ? ff.distance + 'km' : '—'}</td>
                        <td className="py-1.5 px-2 font-mono text-center text-gray-400">{ff.otDays}D/{ff.otNights}N</td>
                        <td className="py-1.5 px-2">{ff.cascadePhase !== 'unassigned' && ff.cascadePhase !== 'locked_out' ? <PhaseBadge phase={ff.cascadePhase} /> : <span className="text-gray-600 text-[10px]">{ff.cascadePhase}</span>}</td>
                        <td className="py-1.5 px-2">{ff.threshold !== '—' ? <ThresholdBadge threshold={ff.threshold} /> : <span className="text-gray-600">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TestPage() {
  const [results, setResults] = useState<Record<string, TestAPIResponse>>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  async function runScenario(scenarioId: string) {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setRunningId(scenarioId);
    try {
      // Reset OT counts first
      await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_ot_counts' }),
      });

      // Run scenario
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.apiKey }),
      });
      const data: TestAPIResponse = await res.json();

      if (!data.error) {
        setResults(prev => ({ ...prev, [scenarioId]: data }));
      }
    } catch (e) {
      console.error('Failed to run scenario:', e);
    }
    setRunningId(null);
  }

  async function runAll() {
    setRunningAll(true);
    for (const scenario of SCENARIOS) {
      await runScenario(scenario.id);
    }
    setRunningAll(false);
  }

  const completedCount = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => {
    if (r.knownResultCheck) return r.knownResultCheck.passed;
    return r.totalAssigned === r.totalSlots;
  }).length;

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
            {completedCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
                <span className={`text-sm ${passedCount === completedCount ? 'text-green-400' : 'text-amber-400'}`}>
                  {passedCount}/{completedCount}
                </span>
                <span className="text-xs text-gray-500">passed</span>
              </div>
            )}
            <button
              onClick={runAll}
              disabled={runningAll || runningId !== null}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 font-medium text-white text-sm transition-all"
            >
              {runningAll ? '⏳ Running...' : '▶ Run all tests'}
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
              running={runningId === scenario.id || runningAll}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
