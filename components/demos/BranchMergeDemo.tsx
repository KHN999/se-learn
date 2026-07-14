"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

type CommitId = "C1" | "C2" | "C3" | "F1" | "M";

const COMMITS: Record<
  CommitId,
  { x: number; y: number; parents: CommitId[]; hash: string }
> = {
  C1: { x: 12, y: 24, parents: [], hash: "a1b2c3d" },
  C2: { x: 32, y: 24, parents: ["C1"], hash: "e4f5a6b" },
  C3: { x: 62, y: 24, parents: ["C2"], hash: "9c8d7e6" },
  F1: { x: 52, y: 50, parents: ["C2"], hash: "3f2e1d0" },
  M: { x: 82, y: 24, parents: ["C3", "F1"], hash: "b7a6c5d" },
};

type Step = {
  commits: CommitId[];
  main: CommitId;
  feature: CommitId | null;
  head: "main" | "feature";
  highlight: CommitId;
  cmd: string;
  note: string;
};

const STEPS: Step[] = [
  {
    commits: ["C1", "C2"],
    main: "C2",
    feature: null,
    head: "main",
    highlight: "C2",
    cmd: "git log --oneline   # on main",
    note: "A branch is just a movable pointer to a commit. main points at C2 (whose parent is C1), and HEAD points at main — that is the branch you are on.",
  },
  {
    commits: ["C1", "C2"],
    main: "C2",
    feature: "C2",
    head: "feature",
    highlight: "C2",
    cmd: "git checkout -b feature",
    note: "Creating a branch just writes one new pointer, feature, at the current commit C2 — no files are copied, so branches are cheap. HEAD moves to feature, so new commits land there.",
  },
  {
    commits: ["C1", "C2", "F1"],
    main: "C2",
    feature: "F1",
    head: "feature",
    highlight: "F1",
    cmd: 'git commit -m "work"   # on feature',
    note: "Committing on feature adds F1 and slides the feature pointer forward to it. main stays at C2, so the history has begun to fork.",
  },
  {
    commits: ["C1", "C2", "F1", "C3"],
    main: "C3",
    feature: "F1",
    head: "feature",
    highlight: "C3",
    cmd: 'git commit -m "hotfix"   # main advances',
    note: "Meanwhile a commit lands on main → C3 (you are still on feature). Both branches have now moved past their shared base C2 — they have DIVERGED, each holding a commit the other lacks.",
  },
  {
    commits: ["C1", "C2", "F1", "C3", "M"],
    main: "M",
    feature: "F1",
    head: "main",
    highlight: "M",
    cmd: "git checkout main && git merge feature",
    note: "Because the branches diverged, Git cannot just slide a pointer. It creates a MERGE COMMIT M with TWO parents — C3 and F1 — joining the histories. main now points at M; feature stays at F1.",
  },
];

const VB_H = 78;

function nodeAccent(id: CommitId, color: string): string {
  if (id === "M") return GOOD;
  if (id === "F1") return WARN;
  return color;
}

export default function BranchMergeDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;
  const frame = STEPS[Math.min(step, STEPS.length - 1)];

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const edges = frame.commits.flatMap((id) =>
    COMMITS[id].parents
      .filter((p) => frame.commits.includes(p))
      .map((p) => ({ a: p, b: id })),
  );

  const pointers: { name: "main" | "feature"; tip: CommitId; accent: string }[] =
    [
      { name: "main", tip: frame.main, accent: color },
      ...(frame.feature
        ? [{ name: "feature" as const, tip: frame.feature, accent: WARN }]
        : []),
    ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Branching and merging</h3>
      <p className="mt-1 text-sm text-dim">
        A branch is a cheap, movable pointer to a commit. Watch two branches
        diverge, then rejoin at a merge commit with two parents.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          step {step + 1}/{STEPS.length}
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

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-3 font-mono text-sm">
        <span className="text-faint">$ </span>
        <span className="text-text">{frame.cmd}</span>
      </pre>

      <div className="relative mt-3 rounded-xl border border-line-soft bg-bg-2/50 px-4 py-3">
        <svg
          viewBox={`0 0 100 ${VB_H}`}
          className="h-auto w-full"
          style={{ maxHeight: 300 }}
          role="img"
          aria-label="A commit graph. main runs left to right through C1, C2 and C3; a feature branch diverges from C2 down to F1; a merge commit M joins C3 and F1, and main now points at M."
        >
          <AnimatePresence>
            {edges.map(({ a, b }) => {
              const featureEdge = a === "F1" || b === "F1";
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={COMMITS[a].x}
                  y1={COMMITS[a].y}
                  x2={COMMITS[b].x}
                  y2={COMMITS[b].y}
                  stroke={featureEdge ? WARN : color}
                  strokeWidth={0.9}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {frame.commits.map((id) => {
              const c = COMMITS[id];
              const accent = nodeAccent(id, color);
              const isNew = id === frame.highlight;
              return (
                <motion.g
                  key={id}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {isNew && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={8}
                      fill="none"
                      stroke={accent}
                      strokeWidth={0.6}
                      opacity={0.45}
                    />
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={6}
                    fill={isNew ? accent : tint(accent, 16)}
                    stroke={accent}
                    strokeWidth={0.8}
                  />
                  <text
                    x={c.x}
                    y={c.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-mono"
                    style={{
                      fontSize: 4.4,
                      fill: isNew ? "var(--color-bg)" : "var(--color-text)",
                    }}
                  >
                    {id}
                  </text>
                  <text
                    x={c.x}
                    y={c.y + 9.5}
                    textAnchor="middle"
                    className="font-mono"
                    style={{ fontSize: 3, fill: "var(--color-faint)" }}
                  >
                    {c.hash}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {pointers.map(({ name, tip, accent }) => {
            const c = COMMITS[tip];
            const isMain = name === "main";
            const topVal = isMain ? c.y - 13 : c.y + 15;
            const active = frame.head === name;
            return (
              <span
                key={name}
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium"
                style={{
                  left: `${c.x}%`,
                  top: `${(topVal / VB_H) * 100}%`,
                  color: accent,
                  borderColor: tint(accent, active ? 60 : 30),
                  background: tint(accent, active ? 20 : 10),
                  boxShadow: active ? `0 0 0 1.5px ${tint(accent, 45)}` : undefined,
                }}
              >
                {active ? `HEAD → ${name}` : name}
              </span>
            );
          })}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>

      <p
        className="mt-3 rounded-lg border border-line-soft bg-bg-2/50 p-3 text-xs leading-relaxed text-faint"
        style={{ borderColor: tint(GOOD, 25) }}
      >
        <span className="font-mono font-medium" style={{ color: GOOD }}>
          Fast-forward:
        </span>{" "}
        if main had not moved (no C3), merging feature would just slide the main
        pointer forward to F1 — no merge commit needed. A merge commit is created
        only when the branches diverged, so both histories must be kept.
      </p>
    </div>
  );
}
