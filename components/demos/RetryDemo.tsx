"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const JITTER = 0.3; // small fixed offset (seconds) — deterministic, not real randomness
const TIMELINE_MAX = 9; // seconds shown on the shared timeline

type Mode = "naive" | "backoff";
type Outcome = "timeout" | "ok";
type Attempt = { n: number; at: number; wait: number; outcome: Outcome; note: string };

// Naive: no delay between tries — every attempt lands at nearly the same instant.
const NAIVE: Attempt[] = [
  { n: 1, at: 0, wait: 0, outcome: "timeout", note: "The first call times out. The client retries at once, with zero delay." },
  { n: 2, at: 0.15, wait: 0, outcome: "timeout", note: "Attempt 2 fires immediately — no pause between tries." },
  { n: 3, at: 0.3, wait: 0, outcome: "timeout", note: "Attempt 3, still hammering with no wait." },
  { n: 4, at: 0.45, wait: 0, outcome: "timeout", note: "Attempt 4 piles more load onto a service that is already struggling." },
  { n: 5, at: 0.6, wait: 0, outcome: "timeout", note: "Attempt 5 — the requests stack up at nearly the same instant." },
  { n: 6, at: 0.75, wait: 0, outcome: "timeout", note: "Six attempts in under a second: a retry storm that keeps the service pinned down, so it never recovers." },
];

// Backoff: wait 1s, 2s, 4s (doubling) plus a fixed jitter offset before each retry.
const BACKOFF: Attempt[] = [
  { n: 1, at: 0, wait: 0, outcome: "timeout", note: "The first call times out. Wait 1s before retrying." },
  { n: 2, at: 1.3, wait: 1, outcome: "timeout", note: "Attempt 2 times out after the 1s wait. Double the delay to 2s." },
  { n: 3, at: 3.6, wait: 2, outcome: "timeout", note: "Attempt 3 times out after 2s. Double again to 4s." },
  { n: 4, at: 7.9, wait: 4, outcome: "ok", note: "Attempt 4 succeeds. Spacing the retries out gave the service room to recover." },
];

const MODES: { key: Mode; label: string }[] = [
  { key: "naive", label: "Immediate retries (naive)" },
  { key: "backoff", label: "Exponential backoff + jitter" },
];

export default function RetryDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("naive");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const attempts = mode === "naive" ? NAIVE : BACKOFF;
  const atEnd = step >= attempts.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset the run when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState<Mode>(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, attempts.length - 1)), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step, attempts.length]);

  const revealed = attempts.slice(0, step + 1);
  const current = attempts[Math.min(step, attempts.length - 1)];
  const succeeded = mode === "backoff";
  const outcomeColor = succeeded ? GOOD : BAD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Timeouts, retries, and backoff</h3>
      <p className="mt-1 text-sm text-dim">
        A client calls a flaky service. Compare hammering it with instant retries
        against spacing them out with exponential backoff plus jitter.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
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
          onClick={() => setStep((s) => Math.min(s + 1, attempts.length - 1))}
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
            Timeline of attempts
          </span>
          <span className="font-mono text-[10px] text-faint">
            {mode === "naive" ? "clustered at t≈0" : "spaced by growing delays"}
          </span>
        </div>

        <div className="relative mt-3 h-16">
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "var(--color-line)" }} />
          <AnimatePresence initial={false}>
            {revealed.map((a) => {
              const c = a.outcome === "ok" ? GOOD : WARN;
              const isCurrent = a.n === current.n;
              const pos = (a.at / TIMELINE_MAX) * 100;
              const height = a.outcome === "ok" ? 60 : 34;
              return (
                <motion.div
                  key={`${mode}-tick-${a.n}`}
                  className="absolute bottom-0"
                  style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      width: "4px",
                      height: `${height}px`,
                      borderRadius: "9999px",
                      transformOrigin: "bottom",
                      background: c,
                      boxShadow: isCurrent ? `0 0 0 3px ${tint(color, 35)}` : "none",
                    }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>t = 0s</span>
          <span>t = {TIMELINE_MAX}s</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {revealed.map((a) => {
            const c = a.outcome === "ok" ? GOOD : WARN;
            const waitText =
              a.n === 1
                ? "first call"
                : mode === "naive"
                  ? "retry now — 0s delay"
                  : `wait ${a.wait}s + ${JITTER}s jitter`;
            return (
              <motion.div
                key={`${mode}-row-${a.n}`}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-soft px-3 py-2"
              >
                <span className="font-mono text-sm text-text">Attempt {a.n}</span>
                <span className="font-mono text-xs text-faint">{waitText}</span>
                <span
                  className="inline-flex items-center gap-1.5 font-mono text-xs"
                  style={{ color: c }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                  {a.outcome === "ok" ? "succeeded" : "timed out"}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {atEnd && (
        <motion.div
          key={`${mode}-result`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: tint(outcomeColor, 45),
            background: tint(outcomeColor, 12),
            color: outcomeColor,
          }}
        >
          {succeeded
            ? "Result: the call recovered and succeeded after a few spaced-out retries."
            : "Result: a retry storm kept the struggling service down — no call ever succeeded."}
        </motion.div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {current.note}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-faint">
        Only retry idempotent, safe operations — repeating a non-idempotent call can
        double-charge or duplicate data. A circuit breaker stops retrying a service
        that stays dead, so clients fail fast instead of piling on. Each attempt is
        also capped by a timeout, and retries give up after a few tries.
      </p>
    </div>
  );
}
