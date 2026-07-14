"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Kind = "cpu" | "io" | "queued" | "idle" | "free" | "done";
type Seg = { start: number; end: number; kind: Kind };
type Lane = { label: string; segs: Seg[]; worker?: boolean };
type Step = { clock: number; note: string };
type Schedule = { total: number; lanes: Lane[]; steps: Step[] };

type Mode = "sync" | "async";

// Deterministic, hand-scripted timelines. Same CPU work and the same I/O wait
// (~140 ms per task) in both modes — only the worker's behaviour differs.
const SYNC: Schedule = {
  total: 600,
  lanes: [
    {
      label: "Worker",
      worker: true,
      segs: [
        { start: 0, end: 30, kind: "cpu" },
        { start: 30, end: 170, kind: "idle" },
        { start: 170, end: 230, kind: "cpu" },
        { start: 230, end: 370, kind: "idle" },
        { start: 370, end: 430, kind: "cpu" },
        { start: 430, end: 570, kind: "idle" },
        { start: 570, end: 600, kind: "cpu" },
      ],
    },
    {
      label: "Task 1",
      segs: [
        { start: 0, end: 30, kind: "cpu" },
        { start: 30, end: 170, kind: "io" },
        { start: 170, end: 200, kind: "cpu" },
        { start: 200, end: 600, kind: "done" },
      ],
    },
    {
      label: "Task 2",
      segs: [
        { start: 0, end: 200, kind: "queued" },
        { start: 200, end: 230, kind: "cpu" },
        { start: 230, end: 370, kind: "io" },
        { start: 370, end: 400, kind: "cpu" },
        { start: 400, end: 600, kind: "done" },
      ],
    },
    {
      label: "Task 3",
      segs: [
        { start: 0, end: 400, kind: "queued" },
        { start: 400, end: 430, kind: "cpu" },
        { start: 430, end: 570, kind: "io" },
        { start: 570, end: 600, kind: "cpu" },
      ],
    },
  ],
  steps: [
    { clock: 0, note: "The worker runs Task 1's CPU work, then fires off its network request." },
    { clock: 30, note: "Task 1 is now waiting on I/O. The single worker just sits here — blocked — doing nothing at all until the response arrives." },
    { clock: 170, note: "The response is back. The worker spends a brief moment finishing Task 1." },
    { clock: 200, note: "Task 1 done at 200 ms. Only now can Task 2 even begin — it was stuck in the queue the whole time." },
    { clock: 230, note: "Blocked again: the worker idles through the entirety of Task 2's I/O wait." },
    { clock: 400, note: "Task 2 done at 400 ms. Task 3 finally gets its turn." },
    { clock: 430, note: "Blocked a third time, waiting on Task 3's I/O." },
    { clock: 600, note: "All three finished in 600 ms. The worker sat blocked for ~420 of those — the waits stacked up end to end." },
  ],
};

const ASYNC: Schedule = {
  total: 260,
  lanes: [
    {
      label: "Worker",
      worker: true,
      segs: [
        { start: 0, end: 90, kind: "cpu" },
        { start: 90, end: 170, kind: "free" },
        { start: 170, end: 260, kind: "cpu" },
      ],
    },
    {
      label: "Task 1",
      segs: [
        { start: 0, end: 30, kind: "cpu" },
        { start: 30, end: 170, kind: "io" },
        { start: 170, end: 200, kind: "cpu" },
        { start: 200, end: 260, kind: "done" },
      ],
    },
    {
      label: "Task 2",
      segs: [
        { start: 0, end: 30, kind: "queued" },
        { start: 30, end: 60, kind: "cpu" },
        { start: 60, end: 200, kind: "io" },
        { start: 200, end: 230, kind: "cpu" },
        { start: 230, end: 260, kind: "done" },
      ],
    },
    {
      label: "Task 3",
      segs: [
        { start: 0, end: 60, kind: "queued" },
        { start: 60, end: 90, kind: "cpu" },
        { start: 90, end: 230, kind: "io" },
        { start: 230, end: 260, kind: "cpu" },
      ],
    },
  ],
  steps: [
    { clock: 0, note: "The worker runs Task 1's CPU, kicks off its request — and does not wait for it." },
    { clock: 30, note: "Instead of blocking, the worker immediately starts Task 2 while Task 1's I/O is still in flight." },
    { clock: 60, note: "And then Task 3. All three requests are now travelling at the same time." },
    { clock: 90, note: "Every request is out. The worker is free, not blocked. Note: a single thread still runs one instruction at a time — async overlaps the WAITING, it does not add CPU parallelism." },
    { clock: 170, note: "Task 1's response returns first. The worker handles the result right away." },
    { clock: 200, note: "Task 2's response is already here — the worker handles it." },
    { clock: 230, note: "Task 3's response handled." },
    { clock: 260, note: "All three done in 260 ms, because the waits overlapped instead of stacking. Async shines for I/O-bound work like this; for CPU-bound work one thread is still the bottleneck." },
  ],
};

function meta(kind: Kind, worker: boolean): { label: string; color: string | null } {
  switch (kind) {
    case "cpu":
      return { label: worker ? "running CPU" : "on CPU", color: null };
    case "io":
      return { label: "waiting on I/O", color: "var(--color-dim)" };
    case "queued":
      return { label: "queued", color: "var(--color-faint)" };
    case "done":
      return { label: "done", color: GOOD };
    case "idle":
      return { label: "blocked / idle", color: WARN };
    case "free":
      return { label: "free (not blocked)", color: GOOD };
  }
}

function fill(kind: Kind, color: string): React.CSSProperties {
  switch (kind) {
    case "cpu":
      return { background: color };
    case "done":
      return { background: tint(GOOD, 16), border: `1px solid ${tint(GOOD, 42)}` };
    case "idle":
      return { background: tint(WARN, 20), border: `1px solid ${tint(WARN, 45)}` };
    case "free":
      return { background: tint(GOOD, 12), border: `1px solid ${tint(GOOD, 38)}` };
    case "io":
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, var(--color-line-soft) 0 5px, transparent 5px 10px)",
        border: "1px solid var(--color-line)",
      };
    case "queued":
      return { background: "color-mix(in srgb, var(--color-faint) 12%, transparent)" };
  }
}

function stateAt(segs: Seg[], t: number): Kind {
  const s = segs.find((seg) => t >= seg.start && t < seg.end);
  return s ? s.kind : "done";
}

const LABEL_W = "6rem";

export default function SyncAsyncDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("sync");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const schedule = mode === "sync" ? SYNC : ASYNC;
  const { steps, total, lanes } = schedule;

  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;
  const frame = steps[Math.min(step, steps.length - 1)];
  const clock = frame.clock;

  // Reset the run when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const blockedMs = lanes[0].segs
    .filter((s) => s.kind === "idle")
    .reduce((a, s) => a + (s.end - s.start), 0);

  const legend: { label: string; style: React.CSSProperties }[] = [
    { label: "CPU (worker busy)", style: { background: color } },
    { label: "I/O in flight", style: fill("io", color) },
    mode === "sync"
      ? { label: "Blocked / idle", style: fill("idle", color) }
      : { label: "Free (not blocked)", style: fill("free", color) },
    { label: "Done", style: fill("done", color) },
  ];

  const modes: { id: Mode; label: string }[] = [
    { id: "sync", label: "Synchronous (blocking)" },
    { id: "async", label: "Asynchronous (non-blocking)" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Synchronous vs asynchronous I/O</h3>
      <p className="mt-1 text-sm text-dim">
        One worker (a single thread) has to handle three I/O-bound tasks. Watch what
        changes when it stops blocking on each wait.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {modes.map((m) => {
          const on = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
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

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl tabular-nums text-text">{clock}</span>
          <span className="font-mono text-sm text-dim">/ {total} ms</span>
          <span className="ml-1 text-[10px] uppercase tracking-widest text-faint">clock</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-faint">
            worker blocked:{" "}
            <span className="font-mono" style={{ color: blockedMs > 0 ? BAD : GOOD }}>
              {blockedMs} ms
            </span>
          </span>
          <span className="text-faint">
            total:{" "}
            <span className="font-mono" style={{ color: mode === "sync" ? WARN : GOOD }}>
              {total} ms
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-dim">
            <span className="h-3 w-3 shrink-0 rounded-[3px]" style={l.style} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="relative mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex flex-col gap-2">
          {lanes.map((lane) => {
            const kind = stateAt(lane.segs, clock);
            const info = meta(kind, !!lane.worker);
            return (
              <div key={lane.label} className="flex items-center">
                <div className="shrink-0 pr-3" style={{ width: LABEL_W }}>
                  <div className="text-xs font-medium text-text">{lane.label}</div>
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: info.color ?? color }}
                  >
                    {info.label}
                  </div>
                </div>
                <div className="relative h-7 flex-1 overflow-hidden rounded-md border border-line-soft bg-panel">
                  {lane.segs.map((s) => {
                    const left = (s.start / total) * 100;
                    const width = ((s.end - s.start) / total) * 100;
                    const active = s.start <= clock && clock < s.end;
                    const past = s.end <= clock;
                    return (
                      <div
                        key={`${s.start}-${s.end}`}
                        className="absolute inset-y-0.5 rounded-[3px]"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          opacity: active ? 1 : past ? 0.92 : 0.3,
                          boxShadow: active ? `0 0 0 1.5px ${color}` : undefined,
                          ...fill(s.kind, color),
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-y-3 right-3" style={{ left: `calc(${LABEL_W} + 0.75rem)` }}>
          <motion.div
            className="absolute inset-y-0 w-px"
            style={{ background: color }}
            animate={{ left: `${(clock / total) * 100}%` }}
            transition={{ type: "tween", duration: 0.4 }}
          >
            <span
              className="absolute -top-1 -translate-x-1/2 rounded px-1 py-0.5 font-mono text-[9px] text-bg"
              style={{ background: color }}
            >
              {clock}
            </span>
          </motion.div>
        </div>

        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint" style={{ marginLeft: `calc(${LABEL_W} + 0.75rem)` }}>
          <span>0 ms</span>
          <span>{total} ms</span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
