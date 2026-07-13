"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Pause, Play, Plus, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Frame = { n: number; result?: number };
type Step = { stack: Frame[]; note: string; base?: boolean };

function build(n: number): Step[] {
  const steps: Step[] = [];
  let stack: Frame[] = [];
  for (let k = n; k >= 1; k--) {
    stack = [...stack, { n: k }];
    steps.push({
      stack: [...stack],
      note: `factorial(${k}) can't answer yet — it calls factorial(${k - 1}).`,
    });
  }
  stack = [...stack, { n: 0, result: 1 }];
  steps.push({
    stack: [...stack],
    base: true,
    note: "factorial(0) hits the BASE CASE — it returns 1 without recursing.",
  });
  let child = 1;
  stack = stack.slice(0, -1); // pop the base frame
  for (let k = 1; k <= n; k++) {
    const res = k * child;
    stack = stack.map((fr, i) =>
      i === stack.length - 1 ? { ...fr, result: res } : fr,
    );
    steps.push({
      stack: [...stack],
      note:
        k === n
          ? `factorial(${k}) = ${k} × ${child} = ${res} — the final answer.`
          : `factorial(${k}) = ${k} × ${child} = ${res}, returns to its caller.`,
    });
    child = res;
    if (k < n) stack = stack.slice(0, -1);
  }
  return steps;
}

export default function RecursionDemo({ color }: { color: string }) {
  const [n, setN] = useState(4);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(n);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when n changes (adjust state during render).
  const [prevN, setPrevN] = useState(n);
  if (n !== prevN) {
    setPrevN(n);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const view = [...frame.stack].reverse();

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Recursion: calls pile up, then unwind
      </h3>
      <p className="mt-1 text-sm text-dim">
        factorial(n) calls factorial(n−1) until it reaches the base case, then
        each call returns its result back up the stack.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">n</span>
        <button
          onClick={() => setN((v) => Math.max(2, v - 1))}
          aria-label="decrease n"
          className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center font-mono text-sm text-text">{n}</span>
        <button
          onClick={() => setN((v) => Math.min(6, v + 1))}
          aria-label="increase n"
          className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          call stack (top = running)
        </p>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {view.map((fr, idx) => {
              const isTop = idx === 0;
              const isBase = fr.n === 0;
              return (
                <motion.div
                  key={fr.n}
                  layout
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                  style={{
                    borderColor: isTop ? color : "var(--color-line)",
                    background: isTop ? tint(color, 8) : "transparent",
                  }}
                >
                  <span className="font-mono text-sm text-text">
                    factorial({fr.n})
                  </span>
                  {fr.result !== undefined ? (
                    <span className="font-mono text-xs" style={{ color }}>
                      → {fr.result}
                    </span>
                  ) : isBase ? (
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                      base case
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-faint">waiting…</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
