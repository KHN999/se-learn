"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type LockName = "A" | "B";
type LockHolder = "free" | "T1" | "T2";
type ThreadState = { holds: LockName[]; waiting: LockName | null; done: boolean };
type Snap = {
  a: LockHolder;
  b: LockHolder;
  t1: ThreadState;
  t2: ThreadState;
  note: string;
  deadlocked?: boolean;
  finished?: boolean;
};

// T1 grabs A then wants B; T2 grabs B then wants A — inconsistent order.
const DEADLOCK: Snap[] = [
  {
    a: "free",
    b: "free",
    t1: { holds: [], waiting: null, done: false },
    t2: { holds: [], waiting: null, done: false },
    note: "Both locks are free. T1 will take A then B; T2 will take B then A — opposite orders.",
  },
  {
    a: "T1",
    b: "free",
    t1: { holds: ["A"], waiting: null, done: false },
    t2: { holds: [], waiting: null, done: false },
    note: "T1 acquires Lock A.",
  },
  {
    a: "T1",
    b: "T2",
    t1: { holds: ["A"], waiting: null, done: false },
    t2: { holds: ["B"], waiting: null, done: false },
    note: "T2 acquires Lock B. So far so good — each thread holds one lock.",
  },
  {
    a: "T1",
    b: "T2",
    t1: { holds: ["A"], waiting: "B", done: false },
    t2: { holds: ["B"], waiting: null, done: false },
    note: "T1 now wants Lock B, but T2 holds it — T1 must wait for B while still holding A.",
  },
  {
    a: "T1",
    b: "T2",
    t1: { holds: ["A"], waiting: "B", done: false },
    t2: { holds: ["B"], waiting: "A", done: false },
    deadlocked: true,
    note: "T2 now wants Lock A, but T1 holds it — T2 waits for A. Each thread holds one lock and waits for the other. Neither can move.",
  },
];

// Both threads always take A before B — the cycle can never close.
const ORDERED: Snap[] = [
  {
    a: "free",
    b: "free",
    t1: { holds: [], waiting: null, done: false },
    t2: { holds: [], waiting: null, done: false },
    note: "Both locks are free. The rule: every thread acquires Lock A before Lock B.",
  },
  {
    a: "T1",
    b: "free",
    t1: { holds: ["A"], waiting: null, done: false },
    t2: { holds: [], waiting: "A", done: false },
    note: "T1 takes Lock A first. T2 also wants A, so T2 waits — but T2 holds nothing, so no cycle exists.",
  },
  {
    a: "T1",
    b: "T1",
    t1: { holds: ["A", "B"], waiting: null, done: false },
    t2: { holds: [], waiting: "A", done: false },
    note: "T1 takes Lock B (it is free). T1 holds both locks and can do its work.",
  },
  {
    a: "free",
    b: "free",
    t1: { holds: [], waiting: null, done: true },
    t2: { holds: [], waiting: "A", done: false },
    note: "T1 finishes and releases both locks. Lock A is free now, so T2 can take it.",
  },
  {
    a: "T2",
    b: "free",
    t1: { holds: [], waiting: null, done: true },
    t2: { holds: ["A"], waiting: null, done: false },
    note: "T2 acquires Lock A.",
  },
  {
    a: "T2",
    b: "T2",
    t1: { holds: [], waiting: null, done: true },
    t2: { holds: ["A", "B"], waiting: null, done: false },
    note: "T2 acquires Lock B. Same order, so it never waited on a lock T1 still needed.",
  },
  {
    a: "free",
    b: "free",
    t1: { holds: [], waiting: null, done: true },
    t2: { holds: [], waiting: null, done: true },
    finished: true,
    note: "T2 finishes and releases both locks. No cycle ever formed — both threads completed.",
  },
];

const chip = "rounded border px-1.5 py-0.5 font-mono text-[11px]";

export default function DeadlockDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"deadlock" | "ordered">("deadlock");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset the walkthrough when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  const steps = mode === "deadlock" ? DEADLOCK : ORDERED;
  const snap = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const threadStatus = (t: ThreadState) => {
    if (t.done) return { label: "done", hue: GOOD };
    if (snap.deadlocked && t.waiting) return { label: "blocked", hue: BAD };
    if (t.waiting) return { label: "waiting", hue: WARN };
    if (t.holds.length > 0) return { label: "running", hue: color };
    return { label: "idle", hue: "var(--color-faint)" };
  };

  const banner = snap.deadlocked
    ? { text: "deadlocked — both wait forever", hue: BAD }
    : snap.finished
      ? { text: "both threads finished — no cycle", hue: GOOD }
      : {
          text:
            mode === "deadlock"
              ? "running — each thread grabs its first lock"
              : "running — every thread takes A before B",
          hue: color,
        };

  const waits = (
    [
      snap.t1.waiting ? { who: "T1", lock: snap.t1.waiting } : null,
      snap.t2.waiting ? { who: "T2", lock: snap.t2.waiting } : null,
    ] as ({ who: string; lock: LockName } | null)[]
  ).filter((w): w is { who: string; lock: LockName } => w !== null);

  const status = snap.deadlocked
    ? `${snap.note} Deadlock needs all four Coffman conditions at once: mutual exclusion, hold-and-wait, no preemption, and a circular wait. Break any one — impose a global lock order, or add lock timeouts / try-lock — and the cycle cannot form.`
    : snap.finished
      ? `${snap.note} Because every thread takes Lock A before Lock B, the circular-wait condition can never hold — a consistent global lock order removes one of the four Coffman conditions. Lock timeouts and try-lock are other ways to break the cycle.`
      : snap.note;

  const threads = [
    { id: "T1", state: snap.t1 },
    { id: "T2", state: snap.t2 },
  ];
  const locks: { name: LockName; holder: LockHolder }[] = [
    { name: "A", holder: snap.a },
    { name: "B", holder: snap.b },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Deadlock, and how lock ordering avoids it
      </h3>
      <p className="mt-1 text-sm text-dim">
        Two threads (T1, T2) and two locks (Lock A, Lock B). When they grab the
        locks in opposite orders, they can wait on each other forever.
      </p>

      {/* Mode toggle */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(
          [
            { key: "deadlock", label: "Deadlock" },
            { key: "ordered", label: "Consistent lock order" },
          ] as const
        ).map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      {/* State banner */}
      <div className="mt-4">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={banner.text}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
            style={{
              borderColor: tint(banner.hue, 45),
              background: tint(banner.hue, 10),
              color: banner.hue,
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: banner.hue }}
            />
            {banner.text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Threads */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {threads.map((t) => {
          const st = threadStatus(t.state);
          return (
            <div key={t.id} className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-text">
                  {t.id}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                  style={{ background: tint(st.hue, 14), color: st.hue }}
                >
                  {st.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-14 text-[11px] text-faint">holds</span>
                {t.state.holds.length === 0 ? (
                  <span className="text-[11px] text-faint">none</span>
                ) : (
                  t.state.holds.map((h) => (
                    <span
                      key={h}
                      className={chip}
                      style={{ background: tint(color, 14), color, borderColor: tint(color, 45) }}
                    >
                      Lock {h}
                    </span>
                  ))
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="w-14 text-[11px] text-faint">waiting</span>
                {t.state.waiting ? (
                  <span
                    className={chip}
                    style={{
                      background: tint(snap.deadlocked ? BAD : WARN, 12),
                      color: snap.deadlocked ? BAD : WARN,
                      borderColor: tint(snap.deadlocked ? BAD : WARN, 45),
                    }}
                  >
                    Lock {t.state.waiting}
                  </span>
                ) : (
                  <span className="text-[11px] text-faint">nothing</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locks */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {locks.map((l) => {
          const held = l.holder !== "free";
          return (
            <div
              key={l.name}
              className="flex items-center justify-between rounded-xl border px-3 py-2"
              style={{
                borderColor: held ? tint(color, 40) : "var(--color-line)",
                background: held ? tint(color, 8) : "transparent",
              }}
            >
              <span className="font-mono text-sm text-text">Lock {l.name}</span>
              {held ? (
                <span className="font-mono text-xs" style={{ color }}>
                  held by {l.holder}
                </span>
              ) : (
                <span className="font-mono text-xs text-faint">free</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Wait-for graph */}
      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          wait-for graph
        </p>
        {snap.deadlocked ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {["Lock A", "T2", "Lock B", "T1"].map((node) => (
              <span key={node} className="flex items-center gap-1.5">
                <span
                  className="rounded-md border px-2 py-1 font-mono text-xs"
                  style={{ borderColor: tint(BAD, 50), background: tint(BAD, 12), color: BAD }}
                >
                  {node}
                </span>
                <span aria-hidden="true" style={{ color: BAD }}>
                  →
                </span>
              </span>
            ))}
            <span
              className="rounded-md border px-2 py-1 font-mono text-xs"
              style={{ borderColor: tint(BAD, 50), background: tint(BAD, 12), color: BAD }}
            >
              Lock A
            </span>
            <span className="text-xs font-medium" style={{ color: BAD }}>
              cycle — closed loop, so no one wins
            </span>
          </div>
        ) : waits.length > 0 ? (
          <div className="flex flex-col gap-1">
            {waits.map((w) => {
              const holder = w.lock === "A" ? snap.a : snap.b;
              return (
                <span key={w.who} className="text-xs" style={{ color: WARN }}>
                  {w.who} waits for Lock {w.lock}
                  {holder === "free" ? " (free — takes it next)" : ` (held by ${holder})`}
                </span>
              );
            })}
            <span className="text-xs font-medium" style={{ color: GOOD }}>
              No thread holds a lock while waiting on another — the chain has no loop.
            </span>
          </div>
        ) : (
          <span className="text-xs font-medium" style={{ color: GOOD }}>
            No thread is blocked — no cycle can form.
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
