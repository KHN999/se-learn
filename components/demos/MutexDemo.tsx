"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

const THREADS = ["T1", "T2", "T3"] as const;
type ThreadId = (typeof THREADS)[number];
type ThreadState = "ready" | "waiting" | "running" | "done";

type Step = {
  holder: ThreadId | null;
  states: Record<ThreadId, ThreadState>;
  queue: ThreadId[];
  resource: number;
  note: string;
};

const STEPS: Step[] = [
  {
    holder: null,
    states: { T1: "ready", T2: "ready", T3: "ready" },
    queue: [],
    resource: 0,
    note: "Three threads each want to enter the critical section. The mutex is free.",
  },
  {
    holder: "T1",
    states: { T1: "running", T2: "ready", T3: "ready" },
    queue: [],
    resource: 0,
    note: "T1 acquires the mutex and enters the critical section.",
  },
  {
    holder: "T1",
    states: { T1: "running", T2: "waiting", T3: "waiting" },
    queue: ["T2", "T3"],
    resource: 0,
    note: "T2 and T3 try to enter, but the mutex is held — they block and join the wait queue.",
  },
  {
    holder: "T1",
    states: { T1: "running", T2: "waiting", T3: "waiting" },
    queue: ["T2", "T3"],
    resource: 1,
    note: "Only T1 is inside, so it safely updates the shared resource to 1.",
  },
  {
    holder: null,
    states: { T1: "done", T2: "waiting", T3: "waiting" },
    queue: ["T2", "T3"],
    resource: 1,
    note: "T1 finishes and releases the mutex. A waiting thread can now proceed.",
  },
  {
    holder: "T2",
    states: { T1: "done", T2: "running", T3: "waiting" },
    queue: ["T3"],
    resource: 1,
    note: "T2 wakes up, acquires the mutex, and enters the critical section.",
  },
  {
    holder: "T2",
    states: { T1: "done", T2: "running", T3: "waiting" },
    queue: ["T3"],
    resource: 2,
    note: "T2 is now the only one inside. It updates the shared resource to 2.",
  },
  {
    holder: null,
    states: { T1: "done", T2: "done", T3: "waiting" },
    queue: ["T3"],
    resource: 2,
    note: "T2 releases the mutex. T3 is still waiting its turn.",
  },
  {
    holder: "T3",
    states: { T1: "done", T2: "done", T3: "running" },
    queue: [],
    resource: 2,
    note: "T3 acquires the mutex and enters the critical section.",
  },
  {
    holder: "T3",
    states: { T1: "done", T2: "done", T3: "running" },
    queue: [],
    resource: 3,
    note: "T3 updates the shared resource to 3 — the last one in line.",
  },
  {
    holder: null,
    states: { T1: "done", T2: "done", T3: "done" },
    queue: [],
    resource: 3,
    note: "T3 releases the mutex. All three ran one at a time — no race, but each waited its turn.",
  },
];

export default function MutexDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[step];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  function meta(state: ThreadState): { label: string; c: string } {
    switch (state) {
      case "running":
        return { label: "in critical section", c: color };
      case "waiting":
        return { label: "waiting (blocked)", c: WARN };
      case "done":
        return { label: "done", c: GOOD };
      default:
        return { label: "ready", c: "var(--color-faint)" };
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Mutex: one thread in the critical section at a time
      </h3>
      <p className="mt-1 text-sm text-dim">
        Three threads want to update one shared resource, but a single mutex
        lets only one of them inside the critical section at any moment.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            mutex
          </p>
          <div
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm"
            style={
              frame.holder
                ? {
                    borderColor: tint(color, 45),
                    background: tint(color, 12),
                    color,
                  }
                : {
                    borderColor: "var(--color-line)",
                    color: "var(--color-faint)",
                  }
            }
          >
            <Lock className="h-4 w-4" />
            {frame.holder ? `held by ${frame.holder}` : "free"}
          </div>
        </div>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            shared resource
          </p>
          <div className="flex h-9 items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={frame.resource}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-2xl font-semibold text-text"
              >
                {frame.resource}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          critical section (max 1 thread)
        </p>
        <div className="flex min-h-9 items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {frame.holder ? (
              <motion.div
                key={frame.holder}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm"
                style={{
                  borderColor: tint(color, 45),
                  background: tint(color, 12),
                  color,
                }}
              >
                {frame.holder} running inside
              </motion.div>
            ) : (
              <motion.span
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-dashed border-line px-3 py-1.5 font-mono text-sm text-faint"
              >
                empty
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {THREADS.map((id) => {
          const m = meta(frame.states[id]);
          const active = frame.states[id] === "running";
          return (
            <div
              key={id}
              className="rounded-lg border px-3 py-2"
              style={{
                borderColor: active ? m.c : "var(--color-line)",
                background: active ? tint(color, 8) : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-text">{id}</span>
                {frame.states[id] === "waiting" ? (
                  <Lock className="h-3.5 w-3.5" style={{ color: m.c }} />
                ) : null}
              </div>
              <span
                className="mt-0.5 block font-mono text-[11px]"
                style={{ color: m.c }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          wait queue
        </p>
        <div className="flex min-h-8 flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {frame.queue.length === 0 ? (
              <motion.span
                key="empty-queue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-sm text-faint"
              >
                empty
              </motion.span>
            ) : (
              frame.queue.map((id, i) => (
                <motion.span
                  key={id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs"
                  style={{
                    borderColor: tint(WARN, 45),
                    background: tint(WARN, 12),
                    color: WARN,
                  }}
                >
                  {i === 0 ? "next: " : ""}
                  {id}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-faint">
        A mutex guarantees mutual exclusion — one thread at a time. That prevents
        races, but it serializes that section: everyone else waits. Hold the lock
        too long and the whole queue stalls (a contention cost).
      </p>
    </div>
  );
}
