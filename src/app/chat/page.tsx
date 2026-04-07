'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Send,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Users,
  Zap,
} from 'lucide-react';

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AssignedFF {
  name: string;
  watch: string;
  rank: string;
  threshold: string;
  distance?: number;
  cascadePhase: string;
}

interface WatchMatrixEntry {
  watch: string;
  shift: string;
  onLeave: boolean;
  callback: string | null;
  eligible: boolean;
  reason: string;
}

interface ChatResult {
  assignmentsCount: number;
  expectedSlots: number;
  assigned: AssignedFF[];
  watchMatrix: WatchMatrixEntry[];
  phasesUsed: string[];
  errors: string[];
  debugTrace?: { steps: any[]; candidates: any[]; summary: any } | null;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'system' | 'error';
  content: string;
  result?: ChatResult;
  timestamp: string;
  scenarioName?: string;
}

interface QuickPrompt {
  label: string;
  icon: string;
  params: { date: string; shift: string; stationId: number; slots: number };
}

// ━━━ Color Maps ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WATCH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  Red:   { bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/30' },
  Brown: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Blue:  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/30' },
};

const PHASE_COLORS: Record<string, string> = {
  callback: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  'non-callback': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  'out-of-district': 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  SO: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  SSO: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const THRESHOLD_COLORS: Record<string, { bg: string; text: string }> = {
  must:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  might:      { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  locked_out: { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  won_t:      { bg: 'bg-gray-500/15',    text: 'text-gray-400' },
};

// ━━━ Station map ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

const STATIONS: Record<string, number> = {
  albany: 1135, devonport: 1136, silverdale: 1138, warkworth: 1139,
  birkenhead: 1140, takapuna: 1141, 'auckland city': 1144,
  manurewa: 1163, botany: 1168,
};

// ━━━ Quick Prompts ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: 'Blue callback × 3 slots', icon: '🔵', params: { date: '2026-04-10', shift: 'Day', stationId: 1135, slots: 3 } },
  { label: 'Full cascade stress test', icon: '⚡', params: { date: '2026-04-15', shift: 'Day', stationId: 1135, slots: 30 } },
  { label: 'Night shift Albany', icon: '🌙', params: { date: '2026-04-10', shift: 'Night', stationId: 1135, slots: 3 } },
  { label: 'Emergency — nobody wants OT', icon: '🚨', params: { date: '2026-04-17', shift: 'Day', stationId: 1135, slots: 1 } },
  { label: 'Green callback × 5 slots', icon: '🟢', params: { date: '2026-04-12', shift: 'Day', stationId: 1135, slots: 5 } },
  { label: 'Takapuna × 2', icon: '📍', params: { date: '2026-04-10', shift: 'Day', stationId: 1141, slots: 2 } },
  { label: 'Weekend night × 8', icon: '🎉', params: { date: '2026-04-18', shift: 'Night', stationId: 1135, slots: 8 } },
  { label: 'Single slot — lowest OT wins', icon: '🎯', params: { date: '2026-04-14', shift: 'Day', stationId: 1141, slots: 1 } },
];

// ━━━ Badges ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━──

function WatchBadge({ watch }: { watch: string }) {
  const c = WATCH_COLORS[watch] || { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      {watch}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const cls = PHASE_COLORS[phase] || 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {phase}
    </span>
  );
}

function ThresholdBadge({ threshold }: { threshold: string }) {
  const c = THRESHOLD_COLORS[threshold] || THRESHOLD_COLORS.won_t;
  const label = threshold === 'won_t' ? "won't" : threshold.replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${c.bg} ${c.text}`}>
      {label}
    </span>
  );
}

// ━━━ Result Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─────

function ResultCard({ result, scenarioName }: { result: ChatResult; scenarioName?: string }) {
  const [open, setOpen] = useState(false);
  const pct = result.expectedSlots > 0 ? Math.round((result.assignmentsCount / result.expectedSlots) * 100) : 0;
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {result.assignmentsCount >= result.expectedSlots
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                : result.assignmentsCount > 0
                  ? <Zap className="w-5 h-5 text-amber-500" />
                  : <XCircle className="w-5 h-5 text-red-500" />
              }
              <div>
                <p className="text-sm font-medium text-zinc-100">
                  {result.assignmentsCount} / {result.expectedSlots} slots filled
                </p>
                {scenarioName && <p className="text-xs text-zinc-500">{scenarioName}</p>}
              </div>
            </div>
            <span className="text-lg font-bold text-zinc-300">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${result.assignmentsCount >= result.expectedSlots ? 'bg-emerald-500' : result.assignmentsCount > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          {/* Phase badges */}
          {result.phasesUsed.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.phasesUsed.map((phase) => (
                <PhaseBadge key={phase} phase={phase} />
              ))}
            </div>
          )}
        </div>

        {/* Assigned firefighters */}
        {result.assigned.length > 0 && (
          <>
            <Separator className="bg-zinc-700/50" />
            <div className="px-4 py-3">
              <h5 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Assigned Firefighters
              </h5>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-1.5">
                  {result.assigned.map((ff, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800/60 border border-zinc-700/30">
                      <WatchBadge watch={ff.watch} />
                      <span className="text-xs text-zinc-200 font-medium w-32 truncate">{ff.name}</span>
                      <span className="text-[10px] text-zinc-500">{ff.rank}</span>
                      <ThresholdBadge threshold={ff.threshold} />
                      <PhaseBadge phase={ff.cascadePhase} />
                      <span className="text-[10px] text-zinc-600 ml-auto">{ff.distance}km</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Watch matrix */}
        {result.watchMatrix && result.watchMatrix.length > 0 && (
          <>
            <Separator className="bg-zinc-700/50" />
            <div className="px-4 py-3">
              <h5 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Watch Eligibility
              </h5>
              <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-700/50 bg-zinc-800/60">
                      <th className="text-left py-1.5 px-2 text-zinc-500 font-medium">Watch</th>
                      <th className="text-left py-1.5 px-2 text-zinc-500 font-medium">Shift</th>
                      <th className="text-center py-1.5 px-2 text-zinc-500 font-medium w-10">OK</th>
                      <th className="text-left py-1.5 px-2 text-zinc-500 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.watchMatrix.map((entry, i) => (
                      <tr key={i} className="border-b border-zinc-800/30">
                        <td className="py-1.5 px-2"><WatchBadge watch={entry.watch} /></td>
                        <td className="py-1.5 px-2 font-mono text-zinc-400 text-[11px]">{entry.shift}</td>
                        <td className="py-1.5 px-2 text-center">
                          {entry.eligible ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}
                        </td>
                        <td className={`py-1.5 px-2 text-[11px] ${entry.eligible ? 'text-emerald-400/70' : 'text-zinc-500'}`}>
                          {entry.eligible ? 'Eligible' : entry.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty slots warning */}
        {result.assignmentsCount < result.expectedSlots && result.assignmentsCount > 0 && (
          <>
            <Separator className="bg-amber-500/20" />
            <div className="px-4 py-3">
              <p className="text-xs text-amber-400">
                ⚠️ {result.expectedSlots - result.assignmentsCount} slot(s) unfilled — cascade exhausted
              </p>
            </div>
          </>
        )}

        {/* Errors */}
        {hasErrors && (
          <>
            <Separator className="bg-red-500/20" />
            <div className="px-4 py-3">
              <p className="text-xs text-red-400">{result.errors.join(', ')}</p>
            </div>
          </>
        )}
      </div>

      {/* Debug trace (collapsible) */}
      {result.debugTrace && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            Debug trace ({result.debugTrace.steps.length} steps)
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 bg-zinc-950/80 rounded-lg border border-zinc-800 font-mono text-xs overflow-hidden">
              <ScrollArea className="max-h-[400px]">
                <div className="p-3 space-y-0.5">
                  {result.debugTrace.steps.map((step: any, i: number) => {
                    const colors: Record<string, string> = {
                      info: 'text-blue-400', pass: 'text-emerald-400', assign: 'text-green-400',
                      reject: 'text-red-400/80', warn: 'text-amber-400', header: 'text-zinc-500',
                    };
                    const isHeader = step.message.startsWith('━');
                    return (
                      <div key={i} className={`py-0.5 ${isHeader ? 'border-b border-zinc-800/50 pb-1 mb-1' : ''}`}>
                        <span className={colors[step.badge] || 'text-zinc-300'}>{step.message}</span>
                        {step.detail && (
                          <div className={`text-zinc-600 text-[11px] ${step.indent ? 'ml-4' : ''}`}>{step.detail}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ━━━ Chat Message Bubble ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━─

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5">
          <p className="text-sm">{msg.content}</p>
          <p className="text-[10px] text-blue-200/60 mt-1 text-right">{msg.timestamp}</p>
        </div>
      </div>
    );
  }

  if (msg.type === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-sm px-4 py-2.5">
          <p className="text-sm text-red-400">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[95%] w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px]">
            🤖
          </div>
          <span className="text-xs text-zinc-500">Allocation Engine</span>
          <span className="text-[10px] text-zinc-600 ml-auto">{msg.timestamp}</span>
        </div>
        {msg.result && <ResultCard result={msg.result} scenarioName={msg.scenarioName} />}
      </div>
    </div>
  );
}

// ━━━ Parse user input ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function parseInput(input: string): { params: { date: string; shift: string; stationId: number; slots: number } | null; description: string } {
  const lower = input.toLowerCase();

  // Try to extract slot count
  const slotMatch = lower.match(/(\d+)\s*slot/);
  const slots = slotMatch ? parseInt(slotMatch[1]) : 3;

  // Try to extract shift
  const shift = lower.includes('night') ? 'Night' : 'Day';

  // Try to extract station
  let stationId = 1135; // Albany default
  for (const [name, id] of Object.entries(STATIONS)) {
    if (lower.includes(name)) { stationId = id; break; }
  }

  // Try to extract date
  const dateMatch = lower.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch
    ? dateMatch[1]
    : '2026-04-10'; // default

  // If the input is just a number or too short, can't parse
  if (input.trim().length < 2) {
    return { params: null, description: input };
  }

  return {
    params: { date, shift, stationId, slots },
    description: input,
  };
}

// ━━━ Main Chat Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━──

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'system',
        content: "Hi Adam! I'm the FENZ OT Allocation Engine. Type a scenario or pick a quick prompt below to test firefighter overtime allocations.",
        timestamp: new Date().toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [messages.length]);

  async function sendMessage(text?: string) {
    const msgText = text || input.trim();
    if (!msgText || running) return;

    setShowPrompts(false);
    setRunning(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: msgText,
      timestamp: new Date().toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const parsed = parseInput(msgText);

    if (!parsed.params) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: "I couldn't understand that request. Try something like 'Blue callback, Albany, Day shift, 3 slots' or click a quick prompt.",
        timestamp: new Date().toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setRunning(false);
      return;
    }

    try {
      const res = await fetch('/api/chat-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.params),
        cache: 'no-store',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const systemMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: `Allocation complete for ${parsed.params.shift} shift on ${parsed.params.date} at station #${parsed.params.stationId}`,
        result: {
          assignmentsCount: data.assignmentsCount,
          expectedSlots: data.expectedSlots,
          assigned: data.assigned,
          watchMatrix: data.watchMatrix,
          phasesUsed: data.phasesUsed,
          errors: data.errors,
          debugTrace: data.debugTrace,
        },
        scenarioName: parsed.description,
        timestamp: new Date().toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, systemMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }

    setRunning(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h1 className="text-base font-semibold text-white">FENZ OT Chat Test Runner</h1>
          </div>
          {running && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Computing allocation...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div ref={scrollRef} className="max-w-3xl mx-auto py-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {running && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-xs text-zinc-500 px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-300" />
                <span className="ml-2">Running allocation engine...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick prompts */}
      {showPrompts && messages.length <= 1 && (
        <div className="px-4 sm:px-6 pb-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-zinc-600 mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const name = `${prompt.params.shift} shift × ${prompt.params.slots} slots`;
                    sendMessage(`${prompt.icon} ${name} — ${prompt.params.date}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
                >
                  {prompt.icon} {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick prompts (always accessible if empty) */}
      {showPrompts && messages.length > 1 && (
        <div className="px-4 sm:px-6 pb-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.slice(0, 4).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const name = `${prompt.params.shift} shift × ${prompt.params.slots} slots`;
                    sendMessage(`${prompt.icon} ${name}`);
                  }}
                  className="px-2.5 py-1 rounded-md bg-zinc-800/40 border border-zinc-800 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {prompt.icon} {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-zinc-800 bg-zinc-900/50 px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a scenario... e.g. 'Blue callback, Albany, Day, 3 slots'"
            disabled={running}
            className="flex-1 h-10 px-4 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-40"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={running || !input.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
