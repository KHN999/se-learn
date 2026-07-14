"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const N = 3;

const TASKS = ["T1", "T2", "T3", "T4", "T5"] as const;
type Task = (typeof TASKS)[number];
type Status = "idle" | "running" | "waiting" | "done";

type Step = {
  permits: number;
  running: Task[];
  waiting: Task[];
  done: Task[];
  note: string;
};

const steps: Step[] = [
  {
    permits: 3,
    running: [],
    waiting: [],
    done: [],
    note: "A semaphore starts with 3 permits. Five tasks (T1–T5) want the shared resource — but only 3 may hold it at once.",
  },
  {
    permits: 2,
    running: ["T1"],
    waiting: [],
    done: [],
    note: "T1 acquires a permit (3 → 2) and starts running.",
  },
  {
    permits: 1,
    running: ["T1", "T2"],
    waiting: [],
    done: [],
    note: "T2 acquires a permit (2 → 1) and runs alongside T1.",
  },
  {
    permits: 0,
    running: ["T1", "T2", "T3"],
    waiting: [],
    done: [],
    note: "T3 acquires the last permit (1 → 0). Three tasks now run concurrently.",
  },
  {
    permits: 0,
    running: ["T1", "T2", "T3"],
    waiting: ["T4"],
    done: [],
    note: "T4 arrives, but permits = 0, so it WAITS for one to free up.",
  },
  {
    permits: 0,
    running: ["T1", "T2", "T3"],
    waiting: ["T4", "T5"],
    done: [],
    note: "T5 also arrives to a full pool (0 permits) and WAITS.",
  },
  {
    permits: 1,
    running: ["T2", "T3"],
    waiting: ["T4", "T5"],
    done: ["T1"],
    note: "T1 finishes and RELEASES its permit (0 → 1).",
  },
  {
    permits: 0,
    running: ["T2", "T3", "T4"],
    waiting: ["T5"],
    done: ["T1"],
    note: "Waiting T4 acquires the freed permit (1 → 0) and starts running.",
  },
  {
    permits: 1,
    running: ["T3", "T4"],
    waiting: ["T5"],
    done: ["T1", "T2"],
    note: "T2 finishes and RELEASES its permit (0 → 1).",
  },
  {
    permits: 0,
    running: ["T3", "T4", "T5"],
    waiting: [],
    done: ["T1", "T2"],
    note: "T5 acquires the permit (1 → 0). Nothing is waiting now.",
  },
  {
    permits: 1,
    running: ["T4", "T5"],
    waiting: [],
    done: ["T1", "T2", "T3"],
    note: "T3 finishes and RELEASES a permit (0 → 1). With no one waiting, the permit stays free.",
  },
  {
    permits: 2,
    running: ["T5"],
    waiting: [],
    done: ["T1", "T2", "T3", "T4"],
    note: "T4 finishes and RELEASES a permit (1 → 2).",
  },
  {
    permits: 3,
    running: [],
    waiting: [],
    done: ["T1", "T2", "T3", "T4", "T5"],
    note: "T5 finishes (2 → 3). All five tasks completed — the semaphore capped concurrency to 3, letting several run at once instead of one.",
  },
];

function statusOf(frame: Step, task: Task): Status {
  if (frame.running.includes(task)) return "running";
  if (frame.waiting.includes(task)) return "waiting";
  if (frame.done.includes(task)) return "done";
  return "idle";
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "idle",
  running: "running",
  waiting: "waiting",
  done: "done",
};

export default function SemaphoreDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[step];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Semaphore: allow up to N at once
      </h3>
      <p className="mt-1 text-sm text-dim">
        A semaphore of N=3 permits lets three tasks share a limited resource
        (say a connection pool of 3, or 3 parking spots). Extra tasks wait until
        a permit is released.
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            available permits
          </span>
          <span className="font-mono text-sm" style={{ color }}>
            {frame.permits} / {N}
          </span>
        </div>
        <div className="mt-2 flex gap-2">
          {Array.from({ length: N }, (_, i) => {
            const free = i < frame.permits;
            return (
              <motion.span
                key={i}
                layout
                aria-hidden="true"
                className="h-6 flex-1 rounded-md border"
                animate={{ opacity: free ? 1 : 0.35 }}
                transition={{ duration: 0.25 }}
                style={{
                  borderColor: free ? color : "var(--color-line)",
                  background: free ? tint(color, 22) : "transparent",
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {TASKS.map((task) => {
          const st = statusOf(frame, task);
          const accent =
            st === "running" ? GOOD : st === "waiting" ? WARN : null;
          return (
            <motion.div
              key={task}
              layout
              className="rounded-lg border px-2 py-2 text-center transition-colors"
              style={{
                borderColor: accent ?? "var(--color-line)",
                background: accent ? tint(accent, 12) : "transparent",
              }}
            >
              <div
                className="font-mono text-sm font-semibold"
                style={{ color: accent ?? "var(--color-faint)" }}
              >
                {task}
              </div>
              <div
                className="mt-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{ color: accent ?? "var(--color-faint)" }}
              >
                {STATUS_LABEL[st]}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm sm:flex-row sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: GOOD }}>
            running {frame.running.length}/{N}:
          </span>
          <span className="flex flex-wrap gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.running.length === 0 ? (
                <span className="text-faint">none</span>
              ) : (
                frame.running.map((t) => (
                  <motion.span
                    key={t}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="rounded px-1.5 py-0.5 font-mono text-xs"
                    style={{ background: tint(GOOD, 14), color: GOOD }}
                  >
                    {t}
                  </motion.span>
                ))
              )}
            </AnimatePresence>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: WARN }}>
            waiting:
          </span>
          <span className="flex flex-wrap gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.waiting.length === 0 ? (
                <span className="text-faint">none</span>
              ) : (
                frame.waiting.map((t) => (
                  <motion.span
                    key={t}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="rounded px-1.5 py-0.5 font-mono text-xs"
                    style={{ background: tint(WARN, 14), color: WARN }}
                  >
                    {t}
                  </motion.span>
                ))
              )}
            </AnimatePresence>
          </span>
        </div>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>

      <div className="mt-3 rounded-lg border border-line-soft bg-bg-2/40 p-3 text-xs leading-relaxed text-faint">
        <span className="font-mono uppercase tracking-widest" style={{ color }}>
          vs. mutex
        </span>{" "}
        A mutex is just a semaphore with N=1 — it admits exactly one task at a
        time. A semaphore caps concurrency to N, protecting a limited resource,
        so several tasks proceed at once rather than strictly one.
      </div>
    </div>
  );
}
