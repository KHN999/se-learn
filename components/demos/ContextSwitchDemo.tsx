"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type TaskId = "A" | "B" | "C";
type Phase = "run" | "save" | "load";
type Status = "running" | "saving" | "loading" | "waiting" | "ready";
type TaskView = { status: Status; pc: number; sp: number; runs: number };
type Step = {
  phase: Phase;
  active: TaskId;
  useful: number;
  overhead: number;
  switches: number;
  tasks: Record<TaskId, TaskView>;
  note: string;
};

const IDS: TaskId[] = ["A", "B", "C"];

const META: Record<TaskId, { name: string; job: string; sp: number }> = {
  A: { name: "Task A", job: "video encode", sp: 0x7ffc },
  B: { name: "Task B", job: "web server", sp: 0x7fa0 },
  C: { name: "Task C", job: "file sync", sp: 0x7f10 },
};

const STATUS_META: Record<Status, { label: string; tone: "run" | "warn" | "idle" }> = {
  running: { label: "on CPU", tone: "run" },
  saving: { label: "saving state", tone: "warn" },
  loading: { label: "loading state", tone: "warn" },
  waiting: { label: "context saved", tone: "idle" },
  ready: { label: "not started", tone: "idle" },
};

// A short useful run costs SLICE time; each save and each load costs COST time
// doing no useful work — that is the switching overhead we accumulate.
const SLICE = 5;
const COST = 1;

function build(): Step[] {
  const order: TaskId[] = ["A", "B", "C", "A"];
  const steps: Step[] = [];
  const pc: Record<TaskId, number> = { A: 0x0040, B: 0x0120, C: 0x0210 };
  const runs: Record<TaskId, number> = { A: 0, B: 0, C: 0 };
  const started: Record<TaskId, boolean> = { A: false, B: false, C: false };
  const saved: Record<TaskId, boolean> = { A: false, B: false, C: false };
  let useful = 0;
  let overhead = 0;
  let switches = 0;
  let current: TaskId | null = null;

  const snap = (phase: Phase, active: TaskId, note: string): Step => {
    const tasks = {} as Record<TaskId, TaskView>;
    for (const id of IDS) {
      let status: Status;
      if (phase === "save" && id === active) status = "saving";
      else if (phase === "load" && id === active) status = "loading";
      else if (phase === "run" && id === current) status = "running";
      else if (started[id]) status = "waiting";
      else status = "ready";
      tasks[id] = { status, pc: pc[id], sp: META[id].sp, runs: runs[id] };
    }
    return { phase, active, useful, overhead, switches, tasks, note };
  };

  order.forEach((task, i) => {
    if (i > 0) {
      const prev = order[i - 1];
      switches += 1;
      saved[prev] = true;
      overhead += COST;
      steps.push(
        snap(
          "save",
          prev,
          `${META[prev].name}'s time slice ended. Before switching, the OS SAVES its context — program counter, stack pointer, and registers — into ${prev}'s control block so it can resume later. No useful work happens during a save.`,
        ),
      );
      overhead += COST;
      steps.push(
        snap(
          "load",
          task,
          `The OS LOADS ${META[task].name}'s saved context into the CPU, restoring its registers, program counter, and stack pointer so it continues exactly where it left off. This is more overhead — still no useful work.`,
        ),
      );
    }
    current = task;
    started[task] = true;
    saved[task] = false;
    pc[task] += 0x08;
    runs[task] += 1;
    useful += SLICE;
    const resumed = runs[task] > 1;
    const note =
      i === 0
        ? `The CPU runs ${META[task].name} for one time slice — genuine, useful work. A single core can only run one task at any instant.`
        : resumed
          ? `${META[task].name} resumes right where it paused — the restored context makes the interruption invisible to the program. Rapid save/restore gives the illusion that every task runs at once.`
          : `${META[task].name} now gets the core for its slice. Three tasks sharing one core by taking turns is concurrency — not parallelism, which would need more than one core.`;
    steps.push(snap("run", task, note));
  });

  return steps;
}

const STEPS = build();
const LAST = STEPS.length - 1;

const hex = (n: number) => `0x${n.toString(16).padStart(4, "0")}`;

export default function ContextSwitchDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, LAST)];
  const atEnd = step >= LAST;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const total = frame.useful + frame.overhead;
  const usefulPct = Math.round((frame.useful / total) * 100);
  const overheadPct = 100 - usefulPct;
  const slicesRun = IDS.reduce((sum, id) => sum + frame.tasks[id].runs, 0);

  const cpu =
    frame.phase === "run"
      ? { verb: "Running", tone: color, sub: "useful work" }
      : frame.phase === "save"
        ? { verb: "Saving", tone: WARN, sub: "overhead — no useful work" }
        : { verb: "Loading", tone: WARN, sub: "overhead — no useful work" };

  const toneColor = (tone: "run" | "warn" | "idle") =>
    tone === "run" ? color : tone === "warn" ? WARN : "var(--color-faint)";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Context switching: one CPU juggling many tasks
      </h3>
      <p className="mt-1 text-sm text-dim">
        A single core runs one task at a time. The OS gives each a brief time
        slice, then saves its state and loads the next — fast enough to feel
        simultaneous.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
          onClick={() => setStep((s) => Math.min(s + 1, LAST))}
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

      {/* The single CPU core: at any instant it is either running one task or
          busy switching (pure overhead). */}
      <div
        className="mt-4 overflow-hidden rounded-xl border p-4 transition-colors"
        style={{ borderColor: cpu.tone, background: tint(cpu.tone, 8) }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          CPU core (1 of 1)
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1 flex items-baseline gap-2"
          >
            <span className="text-lg font-semibold" style={{ color: cpu.tone }}>
              {cpu.verb} {META[frame.active].name}
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ background: tint(cpu.tone, 16), color: cpu.tone }}
            >
              {cpu.sub}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Each task and the context saved for it while it waits its turn. */}
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {IDS.map((id) => {
          const t = frame.tasks[id];
          const sm = STATUS_META[t.status];
          const dot = toneColor(sm.tone);
          const on = t.status === "running";
          return (
            <div
              key={id}
              className="rounded-xl border p-3 transition-colors"
              style={{
                borderColor: on ? color : "var(--color-line)",
                background: on ? tint(color, 8) : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">
                  {META[id].name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: dot }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: dot }}
                  >
                    {sm.label}
                  </span>
                </span>
              </div>
              <p className="mt-0.5 text-xs text-faint">{META[id].job}</p>
              <p className="mt-2 font-mono text-[11px] text-dim">
                PC {hex(t.pc)} · SP {hex(t.sp)}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-faint">
                {t.status === "ready"
                  ? "no saved context yet"
                  : t.status === "running"
                    ? "context live in registers"
                    : "context in control block"}
                {" · "}
                {t.runs} slice{t.runs === 1 ? "" : "s"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Accumulated cost: useful work vs time spent only on bookkeeping. */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5" style={{ color: GOOD }}>
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: GOOD }}
              aria-hidden="true"
            />
            Useful work {usefulPct}%
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: WARN }}>
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: WARN }}
              aria-hidden="true"
            />
            Switching overhead {overheadPct}%
          </span>
        </div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-bg-2">
          <motion.div
            animate={{ width: `${usefulPct}%` }}
            transition={{ duration: 0.3 }}
            style={{ background: GOOD }}
          />
          <motion.div
            animate={{ width: `${overheadPct}%` }}
            transition={{ duration: 0.3 }}
            style={{ background: WARN }}
          />
        </div>
        <p className="mt-2 text-[11px] text-faint">
          {slicesRun} time slice{slicesRun === 1 ? "" : "s"} executed ·{" "}
          {frame.switches} context switch{frame.switches === 1 ? "" : "es"} so far
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-faint">
          More tasks and shorter slices mean more switches — overhead can climb
          until the CPU spends more time on bookkeeping than on work. That is{" "}
          <span style={{ color: BAD }}>thrashing</span>.
        </p>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>
    </div>
  );
}
