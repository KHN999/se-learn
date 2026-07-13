"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Plus, RotateCcw, StepForward, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Frame = {
  line: number;
  node: string;
  total: number;
  i?: number;
  price?: number;
  note: string;
  warn?: boolean;
};
type FlowNode = { id: string; label: string; decision?: boolean };

const NORMAL_CODE = [
  "let total = 0",
  "for (const price of cart) {",
  "  total = total + price",
  "}",
  "if (hasCoupon) {",
  "  total = total * 0.9",
  "}",
  "show total",
];
const NORMAL_NODES: FlowNode[] = [
  { id: "init", label: "total = 0" },
  { id: "more", label: "more items?", decision: true },
  { id: "add", label: "total += price" },
  { id: "coupon", label: "has coupon?", decision: true },
  { id: "discount", label: "apply 10% off" },
  { id: "show", label: "show total" },
];

const BROKEN_CODE = [
  "let total = 0",
  "let i = 0",
  "while (i < cart.length) {",
  "  total = total + cart[i]",
  "  // forgot: i = i + 1",
  "}",
];
const BROKEN_NODES: FlowNode[] = [
  { id: "init", label: "total = 0" },
  { id: "initi", label: "i = 0" },
  { id: "check", label: "i < length?", decision: true },
  { id: "badd", label: "total += cart[i]" },
  { id: "noinc", label: "i never changes" },
];

const round2 = (x: number) => Math.round(x * 100) / 100;
const CART_CYCLE = [10, 20, 5, 8, 15, 3, 12];

function buildNormal(cart: number[], coupon: boolean): Frame[] {
  const f: Frame[] = [];
  let total = 0;
  f.push({ line: 0, node: "init", total, note: "Start — total = 0" });
  for (let i = 0; i < cart.length; i++) {
    const price = cart[i];
    f.push({
      line: 1,
      node: "more",
      total,
      price,
      i,
      note: `More items? Yes — take item ${i + 1} (${price})`,
    });
    const before = total;
    total = round2(total + price);
    f.push({
      line: 2,
      node: "add",
      total,
      price,
      i,
      note: `total = ${before} + ${price} = ${total}`,
    });
  }
  f.push({ line: 1, node: "more", total, note: "More items? No — leave the loop" });
  f.push({
    line: 4,
    node: "coupon",
    total,
    note: coupon ? "Has coupon? Yes" : "Has coupon? No — skip the discount",
  });
  if (coupon) {
    const before = total;
    total = round2(total * 0.9);
    f.push({
      line: 5,
      node: "discount",
      total,
      note: `Apply 10% off → ${before} × 0.9 = ${total}`,
    });
  }
  f.push({ line: 7, node: "show", total, note: `Show total: ${total}` });
  return f;
}

function buildBroken(cart: number[]): Frame[] {
  const f: Frame[] = [];
  let total = 0;
  const first = cart[0] ?? 0;
  f.push({ line: 0, node: "init", total, i: 0, note: "total = 0" });
  f.push({ line: 1, node: "initi", total, i: 0, note: "i = 0" });
  for (let k = 0; k < 5; k++) {
    f.push({
      line: 2,
      node: "check",
      total,
      i: 0,
      note: `i (0) < length (${cart.length})? Yes`,
    });
    total = round2(total + first);
    f.push({
      line: 3,
      node: "badd",
      total,
      i: 0,
      note: `total = ... + cart[0] (${first}) → ${total}`,
    });
    f.push({ line: 4, node: "noinc", total, i: 0, note: "i is never increased…" });
  }
  f.push({
    line: 2,
    node: "check",
    total,
    i: 0,
    warn: true,
    note: "i is STILL 0, so the condition never becomes false. This loop runs forever — an infinite loop.",
  });
  return f;
}

function Toggle({
  on,
  onClick,
  disabled,
  color,
  children,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className="rounded-lg border px-3 py-1.5 text-xs transition-colors disabled:opacity-40"
      style={
        on
          ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
          : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
      }
    >
      {children}
    </button>
  );
}

export default function ControlFlowDemo({ color }: { color: string }) {
  const [cart, setCart] = useState<number[]>([10, 20, 5]);
  const [coupon, setCoupon] = useState(true);
  const [broken, setBroken] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frames = useMemo(
    () => (broken ? buildBroken(cart) : buildNormal(cart, coupon)),
    [cart, coupon, broken],
  );
  const code = broken ? BROKEN_CODE : NORMAL_CODE;
  const nodes = broken ? BROKEN_NODES : NORMAL_NODES;
  const frame = frames[Math.min(step, frames.length - 1)];
  const atEnd = step >= frames.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset the run when the program changes (adjust state during render).
  const progKey = `${cart.join(",")}|${coupon}|${broken}`;
  const [prevKey, setPrevKey] = useState(progKey);
  if (progKey !== prevKey) {
    setPrevKey(progKey);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, frames.length - 1)),
      750,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step, frames.length]);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Trace it: where does execution go next?
      </h3>
      <p className="mt-1 text-sm text-dim">
        Step through the checkout. The code line and the flowchart node light up
        together, and the values update as you go.
      </p>

      {/* Inputs */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">cart =</span>
        {cart.map((p, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-xs text-dim"
          >
            {p}
            <button
              onClick={() => setCart((c) => c.filter((_, i) => i !== idx))}
              className="text-faint transition-colors hover:text-warn"
              aria-label="remove item"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() =>
            setCart((c) => [...c, CART_CYCLE[c.length % CART_CYCLE.length]])
          }
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-line px-2 py-1 text-xs text-faint transition-colors hover:text-dim"
        >
          <Plus className="h-3 w-3" /> add
        </button>
        <span className="mx-1 h-4 w-px bg-line" />
        <Toggle on={coupon && !broken} onClick={() => setCoupon((v) => !v)} disabled={broken} color={color}>
          10% coupon: {coupon ? "on" : "off"}
        </Toggle>
        <Toggle on={broken} onClick={() => setBroken((v) => !v)} color={color}>
          {broken ? "⚠ broken loop" : "break the loop"}
        </Toggle>
      </div>

      {/* Code + flowchart */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
          {code.map((ln, i) => {
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

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <div className="flex flex-col items-center gap-1">
            {nodes.map((nd, idx) => {
              const active = nd.id === frame.node;
              return (
                <Fragment key={nd.id}>
                  <div
                    className={`w-full max-w-[210px] border px-3 py-1.5 text-center text-xs transition-colors ${
                      nd.decision ? "rounded-full" : "rounded-lg"
                    }`}
                    style={
                      active
                        ? { background: color, color: "var(--color-bg)", borderColor: color }
                        : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                    }
                  >
                    {nd.label}
                  </div>
                  {idx < nodes.length - 1 && (
                    <span className="text-faint">↓</span>
                  )}
                </Fragment>
              );
            })}
          </div>
          <p className="mt-2 text-center font-mono text-[10px] text-faint">
            watch the highlight jump back up — that&apos;s the loop repeating
          </p>
        </div>
      </div>

      {/* Variables */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { label: "total", value: frame.total, hot: true },
          ...(frame.i !== undefined ? [{ label: "i", value: frame.i, hot: false }] : []),
          ...(frame.price !== undefined
            ? [{ label: "price", value: frame.price, hot: false }]
            : []),
        ].map((v) => (
          <div
            key={v.label}
            className="flex items-center gap-2 rounded-lg border border-line-soft bg-bg-2/60 px-3 py-1.5"
          >
            <span className="font-mono text-xs text-faint">{v.label}</span>
            <motion.span
              key={`${v.label}-${v.value}`}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-sm font-semibold"
              style={{ color: v.hot ? color : "var(--color-text)" }}
            >
              {v.value}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Note */}
      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ color: frame.warn ? "var(--color-warn)" : "var(--color-dim)" }}
      >
        {frame.note}
      </p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
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
          onClick={() => setStep((s) => Math.min(s + 1, frames.length - 1))}
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
          step {Math.min(step + 1, frames.length)} / {frames.length}
        </span>
      </div>
    </div>
  );
}
