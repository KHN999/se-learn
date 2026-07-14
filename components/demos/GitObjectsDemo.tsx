"use client";

import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

type Commit = { hash: string; message: string; parent: string | null };
type Branch = { name: string; on: string };
type Step = {
  cmd: string;
  commits: Commit[];
  branches: Branch[];
  head: string; // the branch HEAD is attached to
  note: string;
  newHash?: string;
};

// Deterministic, fixed commit objects — a hash chain, oldest to newest.
const C1: Commit = { hash: "a1b2c3", message: "init repo", parent: null };
const C2: Commit = { hash: "d4e5f6", message: "add readme", parent: "a1b2c3" };
const C3: Commit = { hash: "7a8b9c", message: "fix login bug", parent: "d4e5f6" };

const steps: Step[] = [
  {
    cmd: 'git commit -m "init repo"',
    commits: [C1],
    branches: [{ name: "main", on: "a1b2c3" }],
    head: "main",
    newHash: "a1b2c3",
    note: "The first commit, a1b2c3, is the root — it has no parent. A commit stores a full snapshot of every file at that moment, not a diff. main is a pointer to it, and HEAD points at main, so that is where you are.",
  },
  {
    cmd: 'git commit -m "add readme"',
    commits: [C1, C2],
    branches: [{ name: "main", on: "d4e5f6" }],
    head: "main",
    newHash: "d4e5f6",
    note: "The new commit is another full snapshot, and its parent pointer links back to a1b2c3 — the start of a hash chain. main moved forward to the new commit, and HEAD followed along with it.",
  },
  {
    cmd: 'git commit -m "fix login bug"',
    commits: [C1, C2, C3],
    branches: [{ name: "main", on: "7a8b9c" }],
    head: "main",
    newHash: "7a8b9c",
    note: "7a8b9c points back to d4e5f6, which points to a1b2c3: a chain of snapshots, each remembering its parent. That linked structure is the commit graph (a DAG). main and HEAD advanced to the newest commit.",
  },
  {
    cmd: "git branch feature",
    commits: [C1, C2, C3],
    branches: [
      { name: "main", on: "7a8b9c" },
      { name: "feature", on: "7a8b9c" },
    ],
    head: "main",
    note: "A branch is just a movable pointer to a commit — creating one copies nothing. feature is a second label sitting on the same commit as main. HEAD still points at main, so main is the branch you are on.",
  },
];

export default function GitObjectsDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const branchesOn = (hash: string) => frame.branches.filter((b) => b.on === hash);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The Git model: commits are snapshots linked to their parent
      </h3>
      <p className="mt-1 text-sm text-dim">
        Each commit is a full snapshot of the tree, linked to its parent. A
        branch and HEAD are just movable pointers into that chain.
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
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          {step + 1} / {steps.length}
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

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-3 font-mono text-sm text-dim">
        <span className="text-faint">$ </span>
        <span style={{ color }}>{frame.cmd}</span>
      </pre>

      <div className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          commit history (oldest to newest)
        </p>
        <div className="flex min-w-max items-start justify-center">
          {frame.commits.map((c, i) => {
            const here = branchesOn(c.hash);
            const isNew = c.hash === frame.newHash;
            return (
              <Fragment key={c.hash}>
                {i > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="h-16" />
                    <div className="flex h-14 items-center px-1">
                      <span
                        aria-hidden
                        className="font-mono text-xl leading-none text-faint"
                      >
                        &larr;
                      </span>
                    </div>
                    <span className="mt-1 text-[9px] uppercase tracking-widest text-faint">
                      parent
                    </span>
                  </div>
                )}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex h-16 flex-row items-end justify-center gap-1.5">
                    {here.map((b) => {
                      const isHead = frame.head === b.name;
                      const pc = b.name === "main" ? color : GOOD;
                      return (
                        <div key={b.name} className="flex flex-col items-center gap-0.5">
                          {isHead && (
                            <>
                              <span
                                className="rounded font-mono text-[10px] font-semibold"
                                style={{
                                  background: tint(WARN, 18),
                                  color: WARN,
                                  border: `1px solid ${tint(WARN, 45)}`,
                                  padding: "1px 5px",
                                }}
                              >
                                HEAD
                              </span>
                              <span
                                aria-hidden
                                className="text-[10px] leading-none"
                                style={{ color: WARN }}
                              >
                                &darr;
                              </span>
                            </>
                          )}
                          <span
                            className="rounded font-mono text-[10px] font-medium"
                            style={{
                              background: tint(pc, 16),
                              color: pc,
                              border: `1px solid ${tint(pc, 45)}`,
                              padding: "1px 6px",
                            }}
                          >
                            {b.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="flex h-14 w-28 flex-col items-center justify-center rounded-xl border px-2"
                    style={{
                      borderColor: isNew ? color : "var(--color-line)",
                      background: isNew ? tint(color, 8) : "transparent",
                    }}
                  >
                    <span className="font-mono text-sm font-semibold text-text">
                      {c.hash}
                    </span>
                    <span className="mt-0.5 text-center text-[11px] leading-tight text-dim">
                      {c.message}
                    </span>
                  </div>

                  <span className="mt-1 h-4 text-[9px] uppercase tracking-widest text-faint">
                    {c.parent === null ? "root · no parent" : ""}
                  </span>
                </motion.div>
              </Fragment>
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
    </div>
  );
}
