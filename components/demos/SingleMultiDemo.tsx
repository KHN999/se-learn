"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Tone = "neutral" | "good" | "bad" | "warn";
type Mode = "single" | "multi";

type StepState = { t: number; note: string; tone: Tone };
type Slot = number | null;
type Lane = { core: string; slots: Slot[] };

const MODES: { key: Mode; label: string }[] = [
  { key: "single", label: "Single-threaded (1 core)" },
  { key: "multi", label: "Multi-threaded (4 cores)" },
];

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

// One core works the 4 chunks in columns 0..3, one after another (t = 0..4).
const SINGLE_LANES: Lane[] = [{ core: "Core 1", slots: [1, 2, 3, 4] }];

// Four cores each own one chunk in column 0; they all start at t=0 (done by t=1).
const MULTI_LANES: Lane[] = [1, 2, 3, 4].map((c) => ({
  core: `Core ${c}`,
  slots: [c, null, null, null] as Slot[],
}));

function buildSingle(): StepState[] {
  const ts = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  return ts.map((t) => {
    const done = Math.min(Math.floor(t), 4);
    const current = t < 4 ? Math.floor(t) + 1 : 4;
    const note =
      t === 0
        ? "One core, four CPU-bound chunks. It can run only one chunk at a time, so it begins with chunk 1."
        : t === 4
          ? "All 4 chunks are finished — but strictly one after another, so it took about 4 time units on a single core."
          : Number.isInteger(t)
            ? `Chunk ${done} finished at t=${done}. The single core now moves on to chunk ${current}.`
            : `The core is partway through chunk ${current}. The other chunks stay queued behind it — one core means one chunk at a time.`;
    return { t, note, tone: "neutral" as Tone };
  });
}

function buildMulti(): StepState[] {
  const ts = [0, 0.5, 1];
  return ts.map((t) => {
    const note =
      t === 0
        ? "Four cores, four chunks. Each core grabs one chunk and they all start at the very same instant."
        : t === 0.5
          ? "Every core is halfway through its own chunk at once — the work runs in parallel, not in sequence."
          : "All 4 chunks finish together at about t=1: roughly a 4x speedup over one core for this splittable CPU-bound work.";
    return { t, note, tone: (t === 1 ? "good" : "neutral") as Tone };
  });
}

const SINGLE_STEPS = buildSingle();
const MULTI_STEPS = buildMulti();

export default function SingleMultiDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("single");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isMulti = mode === "multi";
  const steps = isMulti ? MULTI_STEPS : SINGLE_STEPS;
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
    const timer = setTimeout(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      700,
    );
    return () => clearTimeout(timer);
  }, [isPlaying, step, steps.length]);

  const t = current.t;
  const lanes = isMulti ? MULTI_LANES : SINGLE_LANES;
  const total = isMulti ? 1 : 4;
  const toneColor = (tone: Tone) =>
    tone === "good"
      ? GOOD
      : tone === "bad"
        ? BAD
        : tone === "warn"
          ? WARN
          : color;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Single-threaded vs multi-threaded
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same CPU-bound job is split into 4 equal chunks. Compare one core
        doing them in sequence with four cores running them in parallel.
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

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            elapsed
          </div>
          <div className="font-mono text-lg font-semibold" style={{ color }}>
            {t.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-faint">units</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            finish time · {isMulti ? "4 cores" : "1 core"}
          </div>
          <div
            className="font-mono text-lg font-semibold"
            style={{ color: isMulti ? GOOD : WARN }}
          >
            {total.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-faint">units</span>
          </div>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 font-mono text-xs"
          style={
            isMulti
              ? {
                  background: tint(GOOD, 12),
                  borderColor: tint(GOOD, 45),
                  color: GOOD,
                }
              : {
                  background: tint(WARN, 10),
                  borderColor: tint(WARN, 40),
                  color: WARN,
                }
          }
        >
          {isMulti ? "≈4x faster (parallel)" : "baseline · 1x (serial)"}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3 sm:p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-faint">
          {isMulti ? "4 cores in parallel" : "1 core, one chunk at a time"} ·
          timeline (0 to 4 time units)
        </p>

        <div className="flex flex-col gap-2">
          {lanes.map((lane) => (
            <div key={lane.core} className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-faint">
                {lane.core}
              </span>
              <div className="flex flex-1 gap-1">
                {lane.slots.map((chunk, i) => {
                  if (chunk === null) {
                    return (
                      <div
                        key={i}
                        className="h-9 flex-1 rounded-md border border-dashed border-line-soft"
                        aria-hidden="true"
                      />
                    );
                  }
                  const progress = clamp(t - i, 0, 1);
                  const done = t >= i + 1;
                  const running = progress > 0 && !done;
                  const fillColor = done ? GOOD : color;
                  return (
                    <div
                      key={i}
                      className="relative h-9 flex-1 overflow-hidden rounded-md border"
                      style={{
                        borderColor: done
                          ? tint(GOOD, 55)
                          : running
                            ? color
                            : "var(--color-line)",
                      }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0"
                        initial={false}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.55, ease: "linear" }}
                        style={{ background: tint(fillColor, done ? 28 : 20) }}
                        aria-hidden="true"
                      />
                      <span
                        className="absolute inset-0 grid place-items-center font-mono text-[11px]"
                        style={{
                          color: done
                            ? GOOD
                            : running
                              ? color
                              : "var(--color-faint)",
                        }}
                      >
                        C{chunk}
                        {done ? " done" : running ? "…" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="w-16 shrink-0" aria-hidden="true" />
          <div className="relative flex-1 pt-3">
            <motion.div
              className="absolute top-0"
              initial={false}
              animate={{ left: `${(t / 4) * 100}%` }}
              transition={{ duration: 0.55, ease: "linear" }}
              aria-hidden="true"
            >
              <div
                className="h-2 w-0.5 -translate-x-1/2"
                style={{ background: color }}
              />
            </motion.div>
            <div className="flex justify-between font-mono text-[10px] text-faint">
              {[0, 1, 2, 3, 4].map((n) => (
                <span key={n}>t={n}</span>
              ))}
            </div>
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/40 p-3 sm:p-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: WARN }}
            aria-hidden="true"
          />
          Honest caveats
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-dim">
          <li>
            Parallel speedup only helps CPU-bound work that can actually be split
            into independent pieces.
          </li>
          <li>
            Coordination and scheduling add overhead, so you rarely get a perfect
            Nx speedup.
          </li>
          <li>
            Shared data now needs locks — otherwise threads race and corrupt
            state.
          </li>
          <li>
            I/O-bound work (waiting on disk or network) gains more from
            async/concurrency than from adding threads.
          </li>
          <li>
            Amdahl: the part that must run serially caps the maximum speedup, no
            matter how many cores you add.
          </li>
        </ul>
      </div>
    </div>
  );
}
