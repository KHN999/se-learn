"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Tone = "neutral" | "good" | "bad" | "warn";
type Mode = "perTask" | "pool";

type StepState = {
  workers: (number | null)[]; // running task per live thread/worker slot
  queue: number[]; // tasks still waiting
  done: number[]; // finished tasks
  threadsUsed: number;
  note: string;
  tone: Tone;
};

const MODES: { key: Mode; label: string }[] = [
  { key: "perTask", label: "Thread per task" },
  { key: "pool", label: "Fixed pool (3 workers)" },
];

function buildPerTask(): StepState[] {
  const N = 8;
  const steps: StepState[] = [];
  const running: number[] = [];
  const queue: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

  steps.push({
    workers: [],
    queue: [...queue],
    done: [],
    threadsUsed: 0,
    note: "8 tasks arrive. In the thread-per-task model, every task spawns its own brand-new thread.",
    tone: "neutral",
  });

  for (let i = 1; i <= N; i++) {
    queue.shift();
    running.push(i);
    steps.push({
      workers: [...running],
      queue: [...queue],
      done: [],
      threadsUsed: i,
      note: `Task T${i} spawns its own thread #${i}. ${i} thread${i === 1 ? "" : "s"} now alive at once.`,
      tone: "warn",
    });
  }

  steps.push({
    workers: [...running],
    queue: [],
    done: [],
    threadsUsed: N,
    note: "8 threads spawned; unbounded → resource exhaustion at scale. Creating and destroying threads is expensive, and too many threads thrash CPU and memory through context switching.",
    tone: "bad",
  });

  steps.push({
    workers: [],
    queue: [],
    done: [1, 2, 3, 4, 5, 6, 7, 8],
    threadsUsed: N,
    note: "Every thread is destroyed after its single task — nothing is reused. With thousands of incoming tasks this creates thousands of threads and exhausts the machine.",
    tone: "bad",
  });

  return steps;
}

function buildPool(): StepState[] {
  const steps: StepState[] = [];
  const workers: (number | null)[] = [null, null, null];
  const queue: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  const done: number[] = [];
  const snap = (note: string, tone: Tone): StepState => ({
    workers: [...workers],
    queue: [...queue],
    done: [...done],
    threadsUsed: 3,
    note,
    tone,
  });

  steps.push(
    snap(
      "8 tasks queued. A fixed pool of 3 worker threads is created once; they will pull tasks from the queue.",
      "neutral",
    ),
  );

  workers[0] = queue.shift() ?? null;
  workers[1] = queue.shift() ?? null;
  workers[2] = queue.shift() ?? null;
  steps.push(
    snap(
      "Each of the 3 workers grabs a task off the front of the queue. The other 5 tasks WAIT in the queue.",
      "neutral",
    ),
  );

  const notes = [
    "Worker 1 finishes T1 and immediately pulls T4 off the queue — the same thread is reused, not recreated.",
    "Worker 2 frees up and takes T5. At most 3 tasks ever run at once.",
    "Worker 3 takes T6. The queue keeps draining as workers become free.",
    "Worker 1 recycles onto T7 — threads are reused across many tasks, with no per-task creation cost.",
    "Worker 2 takes the last queued task, T8. The queue is now empty.",
    "Worker 3 has nothing left to pull, so it goes idle.",
    "Worker 1 finishes T7 and goes idle.",
    "All 8 tasks done using only 3 threads. A pool reuses a bounded set of workers pulling from a queue instead of creating a thread per task — predictable resource use and no per-task thread cost. The pool size caps throughput.",
  ];

  for (let c = 0; c < 8; c++) {
    const w = c % 3;
    const finished = workers[w];
    if (finished != null) done.push(finished);
    workers[w] = queue.length ? (queue.shift() ?? null) : null;
    steps.push(snap(notes[c], c === 7 ? "good" : "neutral"));
  }

  return steps;
}

const PERTASK_STEPS = buildPerTask();
const POOL_STEPS = buildPool();

export default function ThreadPoolDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("perTask");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isPool = mode === "pool";
  const steps = isPool ? POOL_STEPS : PERTASK_STEPS;
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
    t === "good" ? GOOD : t === "bad" ? BAD : t === "warn" ? WARN : color;

  const slots = isPool
    ? [0, 1, 2].map((i) => ({
        label: `Worker ${i + 1}`,
        task: current.workers[i] ?? null,
      }))
    : current.workers.map((task, i) => ({ label: `Thread #${i + 1}`, task }));

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Thread pool vs a thread per task
      </h3>
      <p className="mt-1 text-sm text-dim">
        8 tasks need to run. Compare giving each task its own thread with a fixed
        pool of 3 workers that pull from a shared queue.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-line p-0.5">
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
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {isPool ? "fixed pool · 3 workers" : "thread per task"}
          </p>
          <div className="inline-flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              threads used
            </span>
            <span
              className="font-mono text-sm font-semibold"
              style={{ color: toneColor(current.tone) }}
            >
              {current.threadsUsed}
            </span>
            <span className="font-mono text-[10px] text-faint">
              {isPool ? "reused" : "spawned"}
            </span>
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
          {isPool ? "workers (pool of 3)" : "threads (one per task)"}
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {slots.length === 0 ? (
            <span className="col-span-full font-mono text-xs text-faint">
              no live threads
            </span>
          ) : (
            slots.map((s) => (
              <motion.div
                key={s.label}
                layout
                className="rounded-lg border px-3 py-2"
                style={{
                  borderColor: s.task != null ? color : "var(--color-line)",
                  background: s.task != null ? tint(color, 8) : "transparent",
                }}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {s.label}
                </div>
                <div className="mt-1 font-mono text-sm">
                  {s.task != null ? (
                    <span style={{ color }}>T{s.task} running</span>
                  ) : (
                    <span className="text-faint">idle</span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
          queue · {current.queue.length} waiting
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {current.queue.length === 0 ? (
              <motion.span
                key="q-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-faint"
              >
                empty
              </motion.span>
            ) : (
              current.queue.map((id) => (
                <motion.span
                  key={`q-${id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-md border border-line px-2 py-1 font-mono text-xs text-dim"
                >
                  T{id}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
          completed · {current.done.length} of 8
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {current.done.length === 0 ? (
              <motion.span
                key="d-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-faint"
              >
                none yet
              </motion.span>
            ) : (
              current.done.map((id) => (
                <motion.span
                  key={`d-${id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-md border px-2 py-1 font-mono text-xs"
                  style={{
                    borderColor: tint(GOOD, 45),
                    color: GOOD,
                    background: tint(GOOD, 10),
                  }}
                >
                  T{id} done
                </motion.span>
              ))
            )}
          </AnimatePresence>
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
