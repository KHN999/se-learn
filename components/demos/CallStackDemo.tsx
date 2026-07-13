"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const CODE = [
  "function calculateTotal(prices) {",
  "  let total = 0",
  "  for (const price of prices) {",
  "    total = total + price",
  "  }",
  "  return total",
  "}",
  "",
  "const result = calculateTotal([10, 20, 5])",
];

type Var = { name: string; value: string | number };
type Frame = { fn: string; vars: Var[] };
type Step = { line: number; stack: Frame[]; note: string };

const main = (result: string | number): Frame => ({
  fn: "main",
  vars: [{ name: "result", value: result }],
});
const calc = (vars: Var[]): Frame => ({ fn: "calculateTotal", vars });
const prices: Var = { name: "prices", value: "[10, 20, 5]" };

const STEPS: Step[] = [
  {
    line: 8,
    stack: [main("—")],
    note: "main is running. It calls calculateTotal([10, 20, 5]).",
  },
  {
    line: 0,
    stack: [main("—"), calc([prices])],
    note: "A new frame is pushed for calculateTotal. prices is bound to the argument [10, 20, 5].",
  },
  {
    line: 1,
    stack: [main("—"), calc([prices, { name: "total", value: 0 }])],
    note: "Local variable total = 0 — it lives only in this frame.",
  },
  {
    line: 3,
    stack: [main("—"), calc([prices, { name: "total", value: 10 }, { name: "price", value: 10 }])],
    note: "price = 10 → total = 0 + 10 = 10",
  },
  {
    line: 3,
    stack: [main("—"), calc([prices, { name: "total", value: 30 }, { name: "price", value: 20 }])],
    note: "price = 20 → total = 10 + 20 = 30",
  },
  {
    line: 3,
    stack: [main("—"), calc([prices, { name: "total", value: 35 }, { name: "price", value: 5 }])],
    note: "price = 5 → total = 30 + 5 = 35",
  },
  {
    line: 5,
    stack: [main("—"), calc([prices, { name: "total", value: 35 }])],
    note: "return total — the frame is about to hand back 35.",
  },
  {
    line: 8,
    stack: [main(35)],
    note: "calculateTotal's frame is popped. main resumes with result = 35.",
  },
];

export default function CallStackDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[step];
  const atEnd = step >= STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearTimeout(t);
  }, [playing, step, atEnd]);

  const view = [...frame.stack].reverse(); // active frame on top

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4" style={{ color }} />
        <h3 className="font-semibold text-text">
          Watch the call stack: one frame per active call
        </h3>
      </div>
      <p className="mt-1 text-sm text-dim">
        Step through the call. A frame is pushed when the function starts and
        popped when it returns — each holds its own local variables.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Code */}
        <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
          {CODE.map((ln, i) => {
            const active = i === frame.line;
            return (
              <div
                key={i}
                className="rounded px-1.5"
                style={
                  active
                    ? { background: tint(color, 16), color }
                    : { color: "var(--color-dim)" }
                }
              >
                {ln || " "}
              </div>
            );
          })}
        </pre>

        {/* Call stack */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            call stack (top = running)
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {view.map((fr, idx) => {
                const isTop = idx === 0;
                return (
                  <motion.div
                    key={fr.fn}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border p-2.5"
                    style={{
                      borderColor: isTop ? color : "var(--color-line)",
                      background: isTop ? tint(color, 8) : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-sm font-semibold"
                        style={{ color: isTop ? color : "var(--color-dim)" }}
                      >
                        {fr.fn}()
                      </span>
                      {isTop && (
                        <span
                          className="font-mono text-[10px] uppercase tracking-widest"
                          style={{ color }}
                        >
                          running
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {fr.vars.map((v) => (
                        <div
                          key={v.name}
                          className="flex items-center justify-between font-mono text-xs"
                        >
                          <span className="text-faint">{v.name}</span>
                          <motion.span
                            key={`${v.name}-${v.value}`}
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-text"
                          >
                            {v.value}
                          </motion.span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{frame.note}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" />
          Run one step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <span className="font-mono text-[11px] text-faint">
          step {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
}
