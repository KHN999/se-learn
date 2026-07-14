"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Mode = "merge" | "rebase";
type Tone = "info" | "good" | "warn";

type Node = {
  id: string;
  label: string;
  hash: string;
  col: number;
  row: number;
  kind?: "merge" | "fresh";
  ghost?: boolean;
};
type Edge = { from: string; to: string; ghost?: boolean; merge?: boolean };
type Graph = { nodes: Node[]; edges: Edge[] };
type Step = {
  cmd?: string;
  graph: Graph;
  note: string;
  tone: Tone;
  highlight: string[];
};

// Fixed, deterministic short hashes — no randomness.
const C1: Node = { id: "C1", label: "C1", hash: "3a4f9c1", col: 0, row: 0 };
const C2: Node = { id: "C2", label: "C2", hash: "7b2e8d0", col: 1, row: 0 };
const C3: Node = { id: "C3", label: "C3", hash: "c19a4f2", col: 2, row: 0 };
const F1: Node = { id: "F1", label: "F1", hash: "e8d3b60", col: 2, row: 1 };
const F2: Node = { id: "F2", label: "F2", hash: "5f1a92c", col: 3, row: 1 };

const REWRITE_WARN =
  "rebase gives every commit a new id, so your branch stops matching any copy others already have. Never rebase commits you have pushed or shared.";

function build(mode: Mode): Step[] {
  const mainEdges: Edge[] = [
    { from: "C1", to: "C2" },
    { from: "C2", to: "C3" },
  ];
  const featEdges: Edge[] = [
    { from: "C2", to: "F1" },
    { from: "F1", to: "F2" },
  ];
  const start: Graph = {
    nodes: [C1, C2, C3, F1, F2],
    edges: [...mainEdges, ...featEdges],
  };

  if (mode === "merge") {
    const M: Node = {
      id: "M",
      label: "M",
      hash: "2b9c7e1",
      col: 4,
      row: 1,
      kind: "merge",
    };
    const merged: Graph = {
      nodes: [C1, C2, C3, F1, F2, M],
      edges: [
        ...mainEdges,
        ...featEdges,
        { from: "F2", to: "M", merge: true },
        { from: "C3", to: "M", merge: true },
      ],
    };
    return [
      {
        graph: start,
        highlight: [],
        tone: "info",
        note: "You are on feature. It split from main at C2, while main moved ahead to C3. Two lines of history now sit side by side.",
      },
      {
        cmd: "git merge main",
        graph: start,
        highlight: ["C3", "F2"],
        tone: "info",
        note: "git merge main will fold main's new work (C3) into feature by joining the two branch tips together.",
      },
      {
        cmd: "git merge main",
        graph: merged,
        highlight: ["M"],
        tone: "good",
        note: "Git records a merge commit M with TWO parents — F2 and C3. F1 and F2 keep their original ids; nothing already made is rewritten.",
      },
      {
        cmd: "git merge main",
        graph: merged,
        highlight: ["M"],
        tone: "good",
        note: "Done. The graph forks at C2 and rejoins at M, so it preserves exactly what happened — the trade-off is a busier, non-linear shape.",
      },
    ];
  }

  const F1g: Node = { ...F1, ghost: true };
  const F2g: Node = { ...F2, ghost: true };
  const F1p: Node = {
    id: "F1p",
    label: "F1′",
    hash: "a71fd94",
    col: 3,
    row: 0,
    kind: "fresh",
  };
  const F2p: Node = {
    id: "F2p",
    label: "F2′",
    hash: "6c0e2a8",
    col: 4,
    row: 0,
    kind: "fresh",
  };
  const ghostFeat: Edge[] = [
    { from: "C2", to: "F1", ghost: true },
    { from: "F1", to: "F2", ghost: true },
  ];
  const replay1: Graph = {
    nodes: [C1, C2, C3, F1g, F2g, F1p],
    edges: [...mainEdges, ...ghostFeat, { from: "C3", to: "F1p" }],
  };
  const replay2: Graph = {
    nodes: [C1, C2, C3, F1g, F2g, F1p, F2p],
    edges: [
      ...mainEdges,
      ...ghostFeat,
      { from: "C3", to: "F1p" },
      { from: "F1p", to: "F2p" },
    ],
  };
  const linear: Graph = {
    nodes: [C1, C2, C3, F1p, F2p],
    edges: [
      ...mainEdges,
      { from: "C3", to: "F1p" },
      { from: "F1p", to: "F2p" },
    ],
  };
  return [
    {
      graph: start,
      highlight: [],
      tone: "info",
      note: "Same start: feature (F1, F2) split from main at C2, and main has moved on to C3.",
    },
    {
      cmd: "git rebase main",
      graph: start,
      highlight: ["C3", "F1", "F2"],
      tone: "info",
      note: "git rebase main will lift your commits off C2 and replay them, one at a time, on top of main's tip C3.",
    },
    {
      cmd: "git rebase main",
      graph: replay1,
      highlight: ["F1p"],
      tone: "warn",
      note: "F1 is re-applied onto C3 as a NEW commit F1′ (a71fd94) — same change, brand-new hash. The old F1 is left behind.",
    },
    {
      cmd: "git rebase main",
      graph: replay2,
      highlight: ["F2p"],
      tone: "warn",
      note: "F2 is replayed onto F1′ as F2′ (6c0e2a8) — again a fresh id. The originals F1 and F2 are now orphaned.",
    },
    {
      cmd: "git rebase main",
      graph: linear,
      highlight: ["F1p", "F2p"],
      tone: "warn",
      note: "Done. History is one straight line, as if you had branched from C3 — but every replayed commit has a new id. Rebase REWRITES history.",
    },
  ];
}

// SVG layout geometry.
const PAD_X = 52;
const PAD_Y = 28;
const COL_W = 66;
const ROW_H = 56;
const R = 15;
const VB_W = PAD_X * 2 + 4 * COL_W;
const VB_H = PAD_Y + ROW_H + 40;
const cx = (col: number) => PAD_X + col * COL_W;
const cy = (row: number) => PAD_Y + row * ROW_H;

export default function RebaseDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("merge");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset the walkthrough when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  const steps = build(mode);
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;
  const current = steps[Math.min(step, steps.length - 1)];
  const graph = current.graph;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const pos = new Map(graph.nodes.map((n) => [n.id, n]));
  const hasFeature = graph.nodes.some((n) => n.row === 1);
  const toneColor =
    current.tone === "warn" ? WARN : current.tone === "good" ? GOOD : color;

  const modes: { key: Mode; label: string }[] = [
    { key: "merge", label: "Merge" },
    { key: "rebase", label: "Rebase" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Merge vs rebase</h3>
      <p className="mt-1 text-sm text-dim">
        A feature branch split from main at C2, then main moved on to C3. See how
        merge and rebase each reconcile the two — one keeps the fork, the other
        rewrites it into a straight line.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-line p-0.5">
        {modes.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
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
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          {step + 1}/{steps.length}
        </span>
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

      <div className="mt-4 rounded-lg border border-line bg-bg-2 px-3 py-2 font-mono text-xs">
        <span className="text-faint">$ </span>
        <span className="text-dim">{current.cmd ?? "git log --graph --oneline"}</span>
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          commit graph
        </p>
        <div className="thin-scroll overflow-x-auto">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="mx-auto block"
            style={{ width: "100%", maxWidth: VB_W }}
            role="img"
            aria-label={`${mode} commit graph`}
          >
            <text
              x={6}
              y={cy(0) + 4}
              className="font-mono"
              fontSize={9}
              fill="var(--color-faint)"
            >
              main
            </text>
            {hasFeature && (
              <text
                x={6}
                y={cy(1) + 4}
                className="font-mono"
                fontSize={9}
                fill="var(--color-faint)"
              >
                feature
              </text>
            )}

            {graph.edges.map((ed) => {
              const a = pos.get(ed.from);
              const b = pos.get(ed.to);
              if (!a || !b) return null;
              return (
                <line
                  key={`${ed.from}-${ed.to}`}
                  x1={cx(a.col)}
                  y1={cy(a.row)}
                  x2={cx(b.col)}
                  y2={cy(b.row)}
                  stroke={ed.ghost ? BAD : ed.merge ? GOOD : "var(--color-line)"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray={ed.ghost ? "3 4" : undefined}
                  opacity={ed.ghost ? 0.4 : 1}
                />
              );
            })}

            <AnimatePresence initial={false}>
              {graph.nodes.map((n) => {
                const hl = current.highlight.includes(n.id);
                const stroke = n.ghost
                  ? BAD
                  : hl
                    ? color
                    : n.kind === "merge"
                      ? GOOD
                      : n.kind === "fresh"
                        ? color
                        : "var(--color-line)";
                const fill = n.ghost
                  ? "var(--color-panel)"
                  : hl
                    ? tint(color, 20)
                    : n.kind === "fresh"
                      ? tint(color, 10)
                      : n.kind === "merge"
                        ? tint(GOOD, 12)
                        : "var(--color-bg-2)";
                return (
                  <motion.g
                    key={n.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: n.ghost ? 0.45 : 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <circle
                      cx={cx(n.col)}
                      cy={cy(n.row)}
                      r={R}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={hl ? 2.5 : 2}
                      strokeDasharray={n.ghost ? "3 3" : undefined}
                    />
                    <text
                      x={cx(n.col)}
                      y={cy(n.row) + 3}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize={10}
                      fontWeight={600}
                      fill={n.ghost ? "var(--color-faint)" : "var(--color-text)"}
                    >
                      {n.label}
                    </text>
                    <text
                      x={cx(n.col)}
                      y={cy(n.row) + R + 11}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize={8}
                      fill={
                        n.ghost
                          ? BAD
                          : n.kind === "fresh"
                            ? color
                            : "var(--color-faint)"
                      }
                    >
                      {n.hash}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </svg>
        </div>
      </div>

      {mode === "rebase" && (
        <div
          className="mt-3 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: tint(WARN, 45), background: tint(WARN, 10) }}
        >
          <span className="font-semibold" style={{ color: WARN }}>
            Rewrite warning
          </span>
          <span className="text-dim"> — {REWRITE_WARN}</span>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className="mt-3 flex gap-2 text-sm leading-relaxed text-dim"
      >
        <span
          aria-hidden
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: toneColor }}
        />
        <span>
          {current.note}
          {atEnd
            ? mode === "rebase"
              ? " Rebase buys a clean linear history by rewriting commit ids."
              : " Merge preserves the true history at the cost of a busier graph."
            : ""}
        </span>
      </p>
    </div>
  );
}
