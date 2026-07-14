"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const STAGES = [
  { id: "push", label: "Push" },
  { id: "build", label: "Build" },
  { id: "unit", label: "Unit tests" },
  { id: "lint", label: "Lint" },
  { id: "integration", label: "Integration tests" },
  { id: "staging", label: "Deploy to staging" },
  { id: "prod", label: "Deploy to prod" },
] as const;

const FAIL_INDEX = 2; // Unit tests

type Status = "pending" | "running" | "passed" | "failed";
type DisplayStatus = Status | "skipped";
type Snapshot = { states: Status[]; note: string; done?: "shipped" | "blocked" };

function buildPass(): Snapshot[] {
  const steps: Snapshot[] = [];
  const states: Status[] = STAGES.map((): Status => "pending");
  steps.push({
    states: [...states],
    note: "Nothing has run yet — a push kicks off the pipeline.",
  });
  STAGES.forEach((stage, i) => {
    states[i] = "running";
    steps.push({ states: [...states], note: `${stage.label} is running…` });
    states[i] = "passed";
    const last = i === STAGES.length - 1;
    steps.push({
      states: [...states],
      note: last
        ? "Every stage is green — the change deploys to production automatically."
        : `${stage.label} passed. Next up: ${STAGES[i + 1].label}.`,
      done: last ? "shipped" : undefined,
    });
  });
  return steps;
}

function buildFail(failIndex: number): Snapshot[] {
  const steps: Snapshot[] = [];
  const states: Status[] = STAGES.map((): Status => "pending");
  steps.push({
    states: [...states],
    note: "Nothing has run yet — a push kicks off the pipeline.",
  });
  for (let i = 0; i <= failIndex; i++) {
    const stage = STAGES[i];
    states[i] = "running";
    steps.push({ states: [...states], note: `${stage.label} is running…` });
    if (i === failIndex) {
      states[i] = "failed";
      steps.push({
        states: [...states],
        note: `${stage.label} FAILED. The pipeline stops here — later stages never run, so the broken change never reaches production.`,
        done: "blocked",
      });
    } else {
      states[i] = "passed";
      steps.push({
        states: [...states],
        note: `${stage.label} passed. Next up: ${STAGES[i + 1].label}.`,
      });
    }
  }
  return steps;
}

const PASS_STEPS = buildPass();
const FAIL_STEPS = buildFail(FAIL_INDEX);

export default function CiCdDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"pass" | "fail">("pass");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = mode === "pass" ? PASS_STEPS : FAIL_STEPS;
  const snapshot = steps[Math.min(step, steps.length - 1)];
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

  const meta: Record<
    DisplayStatus,
    { label: string; mark: string; fg: string; border: string; bg: string; pulse?: boolean }
  > = {
    pending: { label: "pending", mark: "•", fg: "var(--color-faint)", border: "var(--color-line)", bg: "transparent" },
    running: { label: "running", mark: "•", fg: color, border: color, bg: tint(color, 12), pulse: true },
    passed: { label: "passed", mark: "✓", fg: GOOD, border: tint(GOOD, 45), bg: tint(GOOD, 10) },
    failed: { label: "failed", mark: "✗", fg: BAD, border: tint(BAD, 55), bg: tint(BAD, 14) },
    skipped: { label: "skipped", mark: "–", fg: "var(--color-faint)", border: "var(--color-line-soft)", bg: "transparent" },
  };

  const failedIdx = snapshot.states.indexOf("failed");

  const banner =
    snapshot.done === "shipped"
      ? { fg: GOOD, mark: "✓", text: "Shipped to production", border: tint(GOOD, 45), bg: tint(GOOD, 12) }
      : snapshot.done === "blocked"
        ? { fg: WARN, mark: "✗", text: "Pipeline failed — deploy blocked", border: tint(WARN, 45), bg: tint(WARN, 12) }
        : null;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        A CI/CD pipeline gates every change
      </h3>
      <p className="mt-1 text-sm text-dim">
        Every push runs through the same stages in order. One red stage stops the
        line — the broken change never reaches production.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(
          [
            { key: "pass", label: "Passing run", accent: GOOD },
            { key: "fail", label: "Failing run", accent: WARN },
          ] as const
        ).map((m) => {
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(m.accent, 16), color: m.accent, borderColor: tint(m.accent, 45) }
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

      <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          pipeline · push → prod
        </p>
        <div className="flex items-stretch gap-1.5">
          {STAGES.map((stage, i) => {
            const raw = snapshot.states[i];
            const display: DisplayStatus =
              raw === "pending" && failedIdx >= 0 && i > failedIdx ? "skipped" : raw;
            const m = meta[display];
            return (
              <Fragment key={stage.id}>
                <motion.div
                  layout
                  className="flex w-28 shrink-0 flex-col items-center justify-between gap-2 rounded-xl border px-2.5 py-3 text-center transition-colors"
                  style={{ borderColor: m.border, background: m.bg }}
                >
                  <span className="font-mono text-[11px] leading-tight text-text">
                    {stage.label}
                  </span>
                  <motion.span
                    key={display}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18 }}
                    className={`inline-flex items-center gap-1 font-mono text-[11px] ${m.pulse ? "animate-pulse" : ""}`}
                    style={{ color: m.fg }}
                  >
                    <span aria-hidden>{m.mark}</span>
                    {m.label}
                  </motion.span>
                </motion.div>
                {i < STAGES.length - 1 && (
                  <div aria-hidden className="flex shrink-0 items-center text-faint">
                    →
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {banner && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium"
          style={{ color: banner.fg, borderColor: banner.border, background: banner.bg }}
        >
          <span aria-hidden>{banner.mark}</span>
          {banner.text}
        </motion.div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {snapshot.note}
      </p>

      <p className="mt-3 border-t border-line-soft pt-3 text-xs leading-relaxed text-faint">
        CI runs the build and tests automatically on every push, so problems
        surface fast and main stays releasable. CD then deploys the passing build
        on its own. A red stage blocks the release — that is the whole point.
      </p>
    </div>
  );
}
