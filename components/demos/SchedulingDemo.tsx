"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Tone = "neutral" | "good" | "warn" | "bad";
type Mode = "fcfs" | "rr";
type Event = "idle" | "preempt" | "complete";

type StepState = {
  clock: number;
  active: number | null;
  from: number;
  to: number;
  event: Event;
  queue: number[];
  remaining: Record<number, number>;
  gantt: number[];
  done: number[];
  finish: Record<number, number>;
  switches: number;
  note: string;
  tone: Tone;
};

const PROCS = [
  { id: 1, burst: 6 },
  { id: 2, burst: 2 },
  { id: 3, burst: 3 },
  { id: 4, burst: 1 },
];
const TOTAL = PROCS.reduce((s, p) => s + p.burst, 0);
const QUANTUM = 2;

const MODES: { key: Mode; label: string }[] = [
  { key: "fcfs", label: "FCFS (first come first served)" },
  { key: "rr", label: "Round-robin (time slice)" },
];

function buildFcfs(): StepState[] {
  const steps: StepState[] = [];
  const remaining: Record<number, number> = {};
  for (const p of PROCS) remaining[p.id] = p.burst;
  const queue = PROCS.map((p) => p.id);
  const gantt: number[] = [];
  const done: number[] = [];
  const finish: Record<number, number> = {};
  let clock = 0;
  let sliceCount = 0;

  const snap = (
    active: number | null,
    from: number,
    to: number,
    event: Event,
    note: string,
    tone: Tone,
  ): StepState => ({
    clock,
    active,
    from,
    to,
    event,
    queue: [...queue],
    remaining: { ...remaining },
    gantt: [...gantt],
    done: [...done],
    finish: { ...finish },
    switches: Math.max(0, sliceCount - 1),
    note,
    tone,
  });

  steps.push(
    snap(
      null,
      0,
      0,
      "idle",
      "Four processes are ready at t=0, queued in arrival order P1 to P4. One CPU can run only one at a time, so the scheduler must pick who runs next.",
      "neutral",
    ),
  );

  const FNOTES: Record<number, [string, Tone]> = {
    1: [
      "FCFS runs P1 to completion first: it holds the CPU from t=0 to t=6. P2, P3 and P4 just wait behind one long job. This is the convoy effect.",
      "warn",
    ],
    2: [
      "P2 needed only 2 units but could not start until t=6. It finishes at t=8, having waited 6 units for P1 to clear.",
      "warn",
    ],
    3: ["P3 runs t=8 to t=11 and finishes at t=11.", "neutral"],
    4: [
      "P4 needed just 1 unit yet finishes last at t=12, after waiting 11. FCFS never preempts: simple and high-throughput, but one long job at the front wrecks everyone's response time.",
      "warn",
    ],
  };

  while (queue.length) {
    const pid = queue.shift();
    if (pid === undefined) break;
    const from = clock;
    const burst = remaining[pid];
    for (let u = 0; u < burst; u++) gantt.push(pid);
    clock += burst;
    remaining[pid] = 0;
    done.push(pid);
    finish[pid] = clock;
    sliceCount += 1;
    const [note, tone] = FNOTES[pid];
    steps.push(snap(pid, from, clock, "complete", note, tone));
  }

  return steps;
}

function buildRr(): StepState[] {
  const steps: StepState[] = [];
  const remaining: Record<number, number> = {};
  for (const p of PROCS) remaining[p.id] = p.burst;
  const queue = PROCS.map((p) => p.id);
  const gantt: number[] = [];
  const done: number[] = [];
  const finish: Record<number, number> = {};
  let clock = 0;
  let sliceCount = 0;

  const snap = (
    active: number | null,
    from: number,
    to: number,
    event: Event,
    note: string,
    tone: Tone,
  ): StepState => ({
    clock,
    active,
    from,
    to,
    event,
    queue: [...queue],
    remaining: { ...remaining },
    gantt: [...gantt],
    done: [...done],
    finish: { ...finish },
    switches: Math.max(0, sliceCount - 1),
    note,
    tone,
  });

  steps.push(
    snap(
      null,
      0,
      0,
      "idle",
      "Same four processes and bursts. Round-robin gives each one a fixed time slice (quantum = 2), then rotates to the next ready process.",
      "neutral",
    ),
  );

  const RNOTES: string[] = [
    "P1 runs one 2-unit slice (t=0 to t=2) but still has 4 units left, so it is preempted and sent to the BACK of the queue. The CPU moves on rather than finishing it.",
    "P2 gets the CPU next (t=2 to t=4) and finishes. A short job is already done at t=4, instead of t=8 under FCFS.",
    "P3 runs t=4 to t=6, has 1 unit left, and rotates to the back. Fair sharing, but every rotation costs a context switch.",
    "P4 runs its single unit (t=6 to t=7) and finishes at t=7, instead of waiting 11 units behind P1.",
    "P1 comes back around for another slice (t=7 to t=9); it still has 2 units left, so back it goes.",
    "P3 returns for its final unit (t=9 to t=10) and finishes.",
    "P1 finally finishes at t=12. Round-robin let the short jobs finish first and kept every process responsive, at the cost of 6 context switches versus FCFS's 3.",
  ];
  const RTONE: Tone[] = [
    "neutral",
    "good",
    "neutral",
    "good",
    "neutral",
    "good",
    "good",
  ];

  let idx = 0;
  while (queue.length) {
    const pid = queue.shift();
    if (pid === undefined) break;
    const from = clock;
    const run = Math.min(QUANTUM, remaining[pid]);
    for (let u = 0; u < run; u++) gantt.push(pid);
    clock += run;
    remaining[pid] -= run;
    sliceCount += 1;
    let event: Event;
    if (remaining[pid] === 0) {
      done.push(pid);
      finish[pid] = clock;
      event = "complete";
    } else {
      queue.push(pid);
      event = "preempt";
    }
    steps.push(snap(pid, from, clock, event, RNOTES[idx], RTONE[idx]));
    idx += 1;
  }

  return steps;
}

const FCFS_STEPS = buildFcfs();
const RR_STEPS = buildRr();
const SHADE: Record<number, number> = { 1: 46, 2: 32, 3: 20, 4: 12 };

export default function SchedulingDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("fcfs");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isRr = mode === "rr";
  const steps = isRr ? RR_STEPS : FCFS_STEPS;
  const current = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      800,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const toneColor = (t: Tone) =>
    t === "good" ? GOOD : t === "warn" ? WARN : t === "bad" ? BAD : color;
  const shadeOf = (pid: number) => tint(color, SHADE[pid] ?? 22);

  // Group the timeline into contiguous segments for a Gantt-style bar.
  const segments: { pid: number; start: number; len: number }[] = [];
  for (let i = 0; i < current.gantt.length; i++) {
    const pid = current.gantt[i];
    const last = segments[segments.length - 1];
    if (last && last.pid === pid) last.len += 1;
    else segments.push({ pid, start: i, len: 1 });
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">OS scheduling: who runs next?</h3>
      <p className="mt-1 text-sm text-dim">
        Four processes are ready, but there is only one CPU. Pick a policy and
        step through to watch who runs, who waits, and how the timeline fills up.
      </p>

      <div className="mt-4 inline-flex flex-wrap rounded-lg border border-line p-0.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color }
                  : { color: "var(--color-dim)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" aria-hidden="true" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> reset
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3 sm:p-4">
        {/* CPU + clock */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              CPU
            </span>
            {current.active === null ? (
              <span className="font-mono text-sm text-faint">idle</span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span
                  className="rounded-md border px-2 py-0.5 font-mono text-sm text-text"
                  style={{
                    background: shadeOf(current.active),
                    borderColor: tint(color, 45),
                  }}
                >
                  P{current.active}
                </span>
                <span className="font-mono text-xs text-dim">
                  ran t={current.from}
                  {"→"}
                  {current.to}
                </span>
                {current.event === "preempt" ? (
                  <span
                    className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                    style={{ background: tint(WARN, 16), color: WARN }}
                  >
                    preempted {"→"} back of queue
                  </span>
                ) : (
                  <span
                    className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
                    style={{ background: tint(GOOD, 14), color: GOOD }}
                  >
                    completed
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-faint">
            <span>
              t ={" "}
              <span className="text-dim">
                {current.clock}/{TOTAL}
              </span>
            </span>
            <span>
              switches ={" "}
              <span style={{ color: isRr ? WARN : GOOD }}>
                {current.switches}
              </span>
            </span>
          </div>
        </div>

        {/* Ready queue */}
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          ready queue {"·"} front runs next
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {current.queue.length === 0 ? (
              <motion.span
                key="q-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-faint"
              >
                queue empty {"—"} all processes done
              </motion.span>
            ) : (
              current.queue.map((id, i) => (
                <motion.span
                  key={`q-${id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs"
                  style={{
                    borderColor: i === 0 ? color : "var(--color-line)",
                    background: i === 0 ? tint(color, 10) : "transparent",
                    color: i === 0 ? color : "var(--color-dim)",
                  }}
                >
                  P{id}
                  <span className="text-faint">{current.remaining[id]}u</span>
                  {i === 0 ? (
                    <span className="text-[9px] uppercase tracking-wide">
                      next
                    </span>
                  ) : null}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Process table with remaining time */}
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          processes {"·"} remaining time
        </p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {PROCS.map((p) => {
            const rem = current.remaining[p.id];
            const isDone = current.done.includes(p.id);
            const isRunning = !isDone && current.active === p.id;
            const frac = (p.burst - rem) / p.burst;
            const barColor = isDone ? GOOD : color;
            return (
              <div key={p.id} className="flex items-center gap-2.5">
                <span
                  className="w-7 shrink-0 rounded-md border px-1 py-0.5 text-center font-mono text-xs text-text"
                  style={{
                    background: shadeOf(p.id),
                    borderColor: tint(color, 40),
                  }}
                >
                  P{p.id}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full border border-line-soft bg-bg-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: barColor }}
                    animate={{ width: `${Math.round(frac * 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span
                  className="w-40 shrink-0 text-right font-mono text-[11px]"
                  style={{
                    color: isDone
                      ? GOOD
                      : isRunning
                        ? color
                        : "var(--color-faint)",
                  }}
                >
                  {isDone
                    ? `done · finished t=${current.finish[p.id]}`
                    : isRunning
                      ? `running · ${rem}u left`
                      : `waiting · ${rem}u of ${p.burst}u left`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gantt timeline */}
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          timeline {"·"} Gantt chart of the CPU
        </p>
        <div className="thin-scroll mt-1.5 overflow-x-auto">
          <div className="flex min-w-[18rem] gap-0.5">
            {segments.length === 0 ? (
              <span className="font-mono text-xs text-faint">
                nothing has run yet
              </span>
            ) : (
              segments.map((seg) => (
                <motion.div
                  key={`${seg.pid}-${seg.start}`}
                  layout
                  initial={{ opacity: 0, scaleX: 0.6 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center rounded-md border py-2"
                  style={{
                    flex: `${seg.len} 1 0%`,
                    minWidth: "2.5rem",
                    background: shadeOf(seg.pid),
                    borderColor: tint(color, 40),
                  }}
                >
                  <span className="font-mono text-xs font-semibold text-text">
                    P{seg.pid}
                  </span>
                  <span className="font-mono text-[9px] text-faint">
                    {seg.start}
                    {"–"}
                    {seg.start + seg.len}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <p
        className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        <span
          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: toneColor(current.tone) }}
          aria-hidden="true"
        />
        <span>{current.note}</span>
      </p>
    </div>
  );
}
