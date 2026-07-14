"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type ObjId = "A" | "B" | "C" | "D";
type ObjState = "live" | "unreachable" | "marked" | "unmarked" | "collected";
type Ref = { from: "root" | ObjId; to: ObjId };
type StepDef = {
  phase: string;
  states: Record<ObjId, ObjState>;
  refs: Ref[];
  note: string;
};

const BOX_W = 58;
const BOX_H = 42;
const ROOT = { x: 16, y: 79, w: 68, h: 42 };
const POS: Record<ObjId, { x: number; y: number }> = {
  A: { x: 150, y: 22 },
  B: { x: 286, y: 22 },
  C: { x: 150, y: 136 },
  D: { x: 286, y: 136 },
};
const EDGES: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  "root-A": { x1: ROOT.x + ROOT.w, y1: 92, x2: POS.A.x - 2, y2: POS.A.y + BOX_H / 2 },
  "A-B": { x1: POS.A.x + BOX_W, y1: POS.A.y + BOX_H / 2, x2: POS.B.x - 2, y2: POS.B.y + BOX_H / 2 },
  "root-C": { x1: ROOT.x + ROOT.w, y1: 108, x2: POS.C.x - 2, y2: POS.C.y + BOX_H / 2 },
  "C-D": { x1: POS.C.x + BOX_W, y1: POS.C.y + BOX_H / 2, x2: POS.D.x - 2, y2: POS.D.y + BOX_H / 2 },
};
const NODE_IDS: ObjId[] = ["A", "B", "C", "D"];

const STEPS: StepDef[] = [
  {
    phase: "reachable",
    states: { A: "live", B: "live", C: "live", D: "live" },
    refs: [
      { from: "root", to: "A" },
      { from: "A", to: "B" },
      { from: "root", to: "C" },
      { from: "C", to: "D" },
    ],
    note: "Mark-and-sweep begins at the roots — the live variables on the stack and in global scope. Following every reference, A, B, C and D are all reachable, so all four objects are live.",
  },
  {
    phase: "c = null",
    states: { A: "live", B: "live", C: "unreachable", D: "unreachable" },
    refs: [
      { from: "root", to: "A" },
      { from: "A", to: "B" },
      { from: "C", to: "D" },
    ],
    note: "The program runs c = null, dropping the root reference to C. Now nothing reachable points to C, and since C was the only thing referencing D, both C and D become unreachable — even though the objects still occupy memory.",
  },
  {
    phase: "mark",
    states: { A: "marked", B: "marked", C: "unmarked", D: "unmarked" },
    refs: [
      { from: "root", to: "A" },
      { from: "A", to: "B" },
      { from: "C", to: "D" },
    ],
    note: "MARK phase: the collector walks outward from the roots and marks every object it can reach — A and B. C and D are never visited, so they stay unmarked. Reachability decides what survives, not whether you meant to keep it.",
  },
  {
    phase: "sweep",
    states: { A: "marked", B: "marked", C: "collected", D: "collected" },
    refs: [
      { from: "root", to: "A" },
      { from: "A", to: "B" },
    ],
    note: "SWEEP phase: unmarked objects are freed, so C and D are collected and their memory returned. That work is the GC pause. Languages without a collector (C, Rust) reclaim memory manually through free or ownership. Watch out: a reference lingering in a cache or event listener keeps an object reachable forever — a memory leak.",
  },
];

function stateColor(s: ObjState): string {
  if (s === "live" || s === "marked") return GOOD;
  if (s === "unreachable") return WARN;
  if (s === "unmarked") return BAD;
  return "var(--color-faint)";
}

function stateLabel(s: ObjState): string {
  if (s === "collected") return "freed";
  return s;
}

const LEGEND: { color: string; label: string; dashed?: boolean }[] = [
  { color: GOOD, label: "reachable / live" },
  { color: WARN, label: "unreachable" },
  { color: BAD, label: "unmarked (doomed)" },
  { color: "var(--color-faint)", label: "freed", dashed: true },
];

export default function GcDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const idx = Math.min(step, STEPS.length - 1);
  const current = STEPS[idx];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Garbage collection: unreachable objects get freed
      </h3>
      <p className="mt-1 text-sm text-dim">
        A collector keeps whatever your program can still reach from its roots,
        and frees the rest. Only reachability decides which objects live — not
        what you intended to keep.
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
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
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

      <div className="mt-4 flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => {
          const on = i === idx;
          return (
            <span
              key={s.phase}
              className="rounded-lg border px-2.5 py-1 font-mono text-xs"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-faint)", borderColor: "var(--color-line)" }
              }
            >
              {i + 1}. {s.phase}
            </span>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <svg viewBox="0 0 360 200" className="mx-auto h-auto w-full max-w-md" aria-hidden="true">
          <defs>
            <marker
              id="gc-head"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-faint)" />
            </marker>
          </defs>

          <AnimatePresence initial={false}>
            {current.refs.map((r) => {
              const key = `${r.from}-${r.to}`;
              const e = EDGES[key];
              return (
                <motion.line
                  key={key}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke="var(--color-faint)"
                  strokeWidth={1.6}
                  markerEnd="url(#gc-head)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              );
            })}
          </AnimatePresence>

          <g>
            <rect
              x={ROOT.x}
              y={ROOT.y}
              width={ROOT.w}
              height={ROOT.h}
              rx={9}
              style={{ fill: tint(color, 12), stroke: color, strokeWidth: 1.5 }}
            />
            <text x={ROOT.x + ROOT.w / 2} y={98} textAnchor="middle" className="font-mono" fontSize="11" fontWeight={600} fill={color}>
              roots
            </text>
            <text x={ROOT.x + ROOT.w / 2} y={110} textAnchor="middle" className="font-mono" fontSize="6.5" fill="var(--color-faint)">
              stack + globals
            </text>
          </g>

          {NODE_IDS.map((id) => {
            const s = current.states[id];
            const p = POS[id];
            const cx = p.x + BOX_W / 2;
            const cy = p.y + BOX_H / 2;
            if (s === "collected") {
              return (
                <g key={id}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={BOX_W}
                    height={BOX_H}
                    rx={9}
                    fill="none"
                    stroke="var(--color-line)"
                    strokeDasharray="3 3"
                  />
                  <text x={cx} y={cy + 2} textAnchor="middle" className="font-mono" fontSize="13" fill="var(--color-faint)">
                    {id}
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" className="font-mono" fontSize="7" fill="var(--color-faint)">
                    freed
                  </text>
                </g>
              );
            }
            const sc = stateColor(s);
            return (
              <g key={id}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={9}
                  style={{
                    fill: tint(sc, 12),
                    stroke: sc,
                    strokeWidth: 1.5,
                    transition: "fill .35s ease, stroke .35s ease",
                  }}
                />
                <text x={cx} y={cy + 2} textAnchor="middle" className="font-mono" fontSize="14" fontWeight={600} fill="var(--color-text)">
                  {id}
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="7"
                  style={{ fill: sc, transition: "fill .35s ease" }}
                >
                  {stateLabel(s)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 font-mono text-[10px] text-faint">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={
                  l.dashed
                    ? { border: "1px dashed var(--color-line)" }
                    : { background: tint(l.color, 40), border: `1px solid ${l.color}` }
                }
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {current.note}
      </p>
    </div>
  );
}
