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
}

interface WatchMatrixEntry {
  watch: string;
  shift: string;
  statusLabel: string;
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
  mismatches: { position: number; expected: string; actual: string }[];
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

// ─── Visual Constants ────────────────────────────────────────────────────────

const WATCH_COLORS: Record<string, { bg: string; ring: string; text: string; dot: string; fill: string }> = {
  Green: { bg: 'bg-green-500/15', ring: 'ring-green-500/60', text: 'text-green-400', dot: 'bg-green-400', fill: '#4ade80' },
  Red:   { bg: 'bg-red-500/15',   ring: 'ring-red-500/60',   text: 'text-red-400',   dot: 'bg-red-400',   fill: '#f87171' },
  Brown: { bg: 'bg-amber-500/15', ring: 'ring-amber-500/60', text: 'text-amber-400', dot: 'bg-amber-500', fill: '#f59e0b' },
  Blue:  { bg: 'bg-blue-500/15',  ring: 'ring-blue-500/60',  text: 'text-blue-400',  dot: 'bg-blue-400',  fill: '#60a5fa' },
};

const PHASE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'ff-callback':        { label: 'FF Callback',     color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  'ff-noncallback':     { label: 'FF Non-CB',       color: 'text-green-400',   bg: 'bg-green-500/10' },
  'ood-ff-callback':    { label: 'OOD FF CB',       color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  'ood-ff-noncallback': { label: 'OOD FF Non-CB',   color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  'so-callback':        { label: 'SO Callback',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  'sso-callback':       { label: 'SSO Callback',    color: 'text-pink-400',    bg: 'bg-pink-500/10' },
  'so-noncallback':     { label: 'SO Non-CB',       color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  'sso-noncallback':    { label: 'SSO Non-CB',      color: 'text-red-400',     bg: 'bg-red-500/10' },
  'specialist-steal':   { label: 'Specialist Steal', color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

// ─── OT Bar (visual weight) ─────────────────────────────────────────────────

function OTBar({ days, nights, maxOT }: { days: number; nights: number; maxOT: number }) {
  const total = days + nights;
  const pct = maxOT > 0 ? Math.min((total / maxOT) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${total === 0 ? 'bg-emerald-500' : pct > 60 ? 'bg-red-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500 font-mono w-4 text-right">{total}</span>
    </div>
  );
}

// ─── Distance Indicator ─────────────────────────────────────────────────────

function DistanceRing({ km }: { km: number }) {
  const size = km === 0 ? 'w-5 h-5' : km <= 6 ? 'w-7 h-7' : km <= 15 ? 'w-9 h-9' : 'w-11 h-11';
  const color = km === 0 ? 'border-emerald-500/60 bg-emerald-500/10' : km <= 6 ? 'border-blue-500/40 bg-blue-500/5' : km <= 15 ? 'border-amber-500/40 bg-amber-500/5' : 'border-red-500/40 bg-red-500/5';
  return (
    <div className={`${size} ${color} rounded-full border flex items-center justify-center`}>
      <span className="text-[9px] font-mono text-gray-400">{km}</span>
    </div>
  );
}

// ─── Allocation Flow Diagram ────────────────────────────────────────────────

function AllocationFlowDiagram({ data }: { data: TestAPIResponse }) {
  const maxOT = Math.max(...data.allFirefightersDetail.map(f => f.otDays + f.otNights), 1);

  // Group eligible FFs by district
  const eligible = data.allFirefightersDetail.filter(f => f.isEligible || f.isAssigned);
  const byDistrict: Record<string, FFDetail[]> = {};
  for (const ff of data.allFirefightersDetail) {
    // Determine district from home station
    const isWaitemata = ['Albany', 'Devonport', 'Silverdale', 'Takapuna', 'East Coast Bays', 'Birkenhead', 'Glenfield', 'Warkworth'].includes(ff.homeStation);
    const isAuckland = ['Henderson', 'Te Atatu', 'Glen Eden', 'Grey Lynn', 'Ponsonby', 'Auckland City', 'Avondale', 'St Heliers', 'Remuera', 'Parnell'].includes(ff.homeStation);
    const district = isWaitemata ? 'Waitemata' : isAuckland ? 'Auckland' : 'Counties Manukau';
    if (!byDistrict[district]) byDistrict[district] = [];
    byDistrict[district].push(ff);
  }

  return (
    <div className="space-y-8">
      {/* ─── Watch Eligibility (horizontal strip) ─── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Watch Eligibility</h3>
        <div className="flex gap-3">
          {data.watchMatrix.map(w => {
            const wc = WATCH_COLORS[w.watch];
            return (
              <div
                key={w.watch}
                className={`flex-1 rounded-xl border px-4 py-3 transition-all ${
                  w.eligible
                    ? `${wc.bg} border-${w.watch === 'Green' ? 'green' : w.watch === 'Blue' ? 'blue' : w.watch === 'Red' ? 'red' : 'amber'}-500/30`
                    : 'bg-gray-800/30 border-gray-700/30 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${wc.text}`}>{w.watch}</span>
                  <span className={`text-lg ${w.eligible ? 'text-green-400' : 'text-red-400/50'}`}>
                    {w.eligible ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{w.statusLabel}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Station Allocation Cards ─── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Station Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.stationResults.map((sr, si) => {
            // Find ALL eligible FFs for this station (assigned + unassigned)
            const stationEligible = eligible.filter(f => {
              // Show assigned FFs for this station
              if (f.isAssigned && f.otStation === sr.stationName) return true;
              return false;
            });

            return (
              <div key={si} className="rounded-xl border border-gray-700/40 bg-gray-800/20 overflow-hidden">
                {/* Station header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700/30">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">{sr.stationName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {sr.specialist && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                          {sr.specialist} required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: sr.slots }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border ${
                          i < sr.assignedFirefighters.length
                            ? 'bg-green-500/60 border-green-500/80'
                            : 'bg-gray-700/30 border-gray-600/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Assigned FFs */}
                <div className="p-3 space-y-2">
                  {sr.assignedFirefighters.map((af, fi) => {
                    const wc = WATCH_COLORS[af.watch] || WATCH_COLORS.Blue;
                    const phase = PHASE_LABELS[af.cascadePhase] || { label: af.cascadePhase, color: 'text-gray-400', bg: 'bg-gray-500/10' };
                    const ffDetail = data.allFirefightersDetail.find(f => f.id === af.id);
                    const otDays = ffDetail?.otDays ?? 0;
                    const otNights = ffDetail?.otNights ?? 0;

                    return (
                      <div
                        key={fi}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${wc.bg} ring-1 ${wc.ring}`}
                      >
                        {/* Watch dot */}
                        <div className={`w-2.5 h-2.5 rounded-full ${wc.dot} shrink-0`} />

                        {/* Name + details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-100 truncate">{af.name}</span>
                            <span className="text-[10px] text-gray-500">{af.rank}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {/* Phase badge */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${phase.color}`}>
                              {phase.label}
                            </span>
                            {/* From station */}
                            <span className="text-[10px] text-gray-500">
                              from {af.homeStation}
                            </span>
                          </div>
                        </div>

                        {/* Visual indicators (right side) */}
                        <div className="flex items-center gap-3 shrink-0">
                          <OTBar days={otDays} nights={otNights} maxOT={maxOT} />
                          <DistanceRing km={af.distance} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty slots */}
                  {sr.assignedFirefighters.length < sr.slots && (
                    <div className="flex items-center justify-center py-2 rounded-lg border border-dashed border-gray-700/40 text-gray-600 text-xs">
                      {sr.slots - sr.assignedFirefighters.length} unfilled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Who Was Available But Not Chosen ─── */}
      {(() => {
        const unassigned = data.allFirefightersDetail.filter(f => f.isEligible && !f.isAssigned);
        if (unassigned.length === 0) return null;

        return (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Available But Not Assigned ({unassigned.length})
            </h3>
            <div className="bg-gray-800/20 rounded-xl border border-gray-700/30 p-3">
              <div className="flex flex-wrap gap-2">
                {unassigned.map((ff, i) => {
                  const wc = WATCH_COLORS[ff.watch] || WATCH_COLORS.Blue;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 opacity-60"
                    >
                      <div className={`w-2 h-2 rounded-full ${wc.dot}`} />
                      <span className="text-xs text-gray-400">{ff.name}</span>
                      <span className="text-[9px] text-gray-600">{ff.homeStation}</span>
                      <span className="text-[9px] font-mono text-gray-600">OT:{ff.otDays + ff.otNights}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Cascade Flow Summary ─── */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cascade Flow</h3>
        <div className="flex items-stretch gap-1">
          {['ff-callback', 'ff-noncallback', 'ood-ff-callback', 'ood-ff-noncallback', 'so-callback', 'sso-callback', 'so-noncallback', 'sso-noncallback'].map((phase, pi) => {
            const assigned = data.allFirefightersDetail.filter(f => f.isAssigned && f.cascadePhase === phase);
            const pl = PHASE_LABELS[phase] || { label: phase, color: 'text-gray-400', bg: 'bg-gray-500/10' };
            const hasAssignments = assigned.length > 0;

            return (
              <div key={phase} className="flex items-center gap-1">
                {pi > 0 && (
                  <div className={`text-lg ${hasAssignments ? 'text-gray-500' : 'text-gray-700'}`}>→</div>
                )}
                <div className={`flex-1 rounded-lg border px-3 py-2 min-w-[120px] ${
                  hasAssignments
                    ? `${pl.bg} border-gray-600/30`
                    : 'bg-gray-800/10 border-gray-800/20 opacity-30'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${pl.color}`}>
                      {pl.label}
                    </span>
                    {hasAssignments && (
                      <span className="text-xs font-mono text-gray-400">{assigned.length}</span>
                    )}
                  </div>
                  {hasAssignments && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assigned.map((ff, i) => {
                        const wc = WATCH_COLORS[ff.watch] || WATCH_COLORS.Blue;
                        return (
                          <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-900/40">
                            <div className={`w-1.5 h-1.5 rounded-full ${wc.dot}`} />
                            <span className="text-[9px] text-gray-300">{ff.name.split(' ')[1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Reading Guide ─── */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">Key:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-gray-500">Low OT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-red-500" />
          <span className="text-[10px] text-gray-500">High OT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full border border-emerald-500/60 flex items-center justify-center"><span className="text-[8px] text-gray-500">0</span></div>
          <span className="text-[10px] text-gray-500">Home station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-9 h-9 rounded-full border border-amber-500/40 flex items-center justify-center"><span className="text-[8px] text-gray-500">15</span></div>
          <span className="text-[10px] text-gray-500">Far away</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-11 h-11 rounded-full border border-red-500/40 flex items-center justify-center"><span className="text-[8px] text-gray-500">30</span></div>
          <span className="text-[10px] text-gray-500">Cross-district</span>
        </div>
      </div>
    </div>
  );
}

// ─── Scenario Selector ───────────────────────────────────────────────────────

const SCENARIOS = [
  { id: 'default', apiKey: 'default', name: 'Waitemata Day — 5 Stations', desc: '11 slots, full cascade' },
  { id: 'known-result-simple', apiKey: 'known-result-simple', name: 'Known Result — Albany 2-slot', desc: 'Deterministic test' },
  { id: 'known-result-complex', apiKey: 'known-result-complex', name: 'Known Result — 3 Stations + Specialist', desc: 'Multi-phase + specialist quals' },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DiagramPage() {
  const [data, setData] = useState<TestAPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('known-result-complex');

  async function runTest(scenarioKey: string) {
    setLoading(true);
    try {
      // Reset OT counts
      await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_ot_counts' }),
      });

      // Run scenario
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioKey }),
      });
      const result: TestAPIResponse = await res.json();
      if (!result.error) {
        setData(result);
      }
    } catch (e) {
      console.error('Test failed:', e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Allocation Flow</h1>
          <p className="text-sm text-gray-400 mt-1">Visual breakdown of firefighter selection</p>
        </div>

        {/* Scenario picker + Run */}
        <div className="flex flex-wrap items-center gap-3">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(s.apiKey)}
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                selectedScenario === s.apiKey
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-gray-800/30 border-gray-700/30 text-gray-400 hover:border-gray-600/50'
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.desc}</div>
            </button>
          ))}
          <button
            onClick={() => runTest(selectedScenario)}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 font-medium text-white text-sm transition-all ml-auto"
          >
            {loading ? '⏳ Running...' : '▶ Run & Visualize'}
          </button>
        </div>

        {/* Result header */}
        {data && (
          <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">{data.name}</h2>
              <p className="text-xs text-gray-500">{data.date} • {data.shift} shift</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${data.totalAssigned === data.totalSlots ? 'text-green-400' : 'text-amber-400'}`}>
                {data.totalAssigned}/{data.totalSlots}
              </div>
              {data.knownResultCheck && (
                <span className={`text-2xl ${data.knownResultCheck.passed ? '' : ''}`}>
                  {data.knownResultCheck.passed ? '✅' : '❌'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* The Diagram */}
        {data && <AllocationFlowDiagram data={data} />}
      </div>
    </div>
  );
}
