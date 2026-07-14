"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

const LIMIT = 2;

type Col = "todo" | "wip" | "done";

const TASKS: Record<string, string> = {
  a: "Login page",
  b: "Search API",
  c: "Payments",
  d: "Email alerts",
};

const COLUMNS: { key: Col; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "wip", title: "In Progress" },
  { key: "done", title: "Done" },
];

type Step = {
  cols: Record<Col, string[]>;
  note: string;
  startedId?: string;
  doneId?: string;
  blockedId?: string;
};

const STEPS: Step[] = [
  {
    cols: { todo: ["a", "b", "c", "d"], wip: [], done: [] },
    note: "Four tasks wait in To Do. In Progress carries a WIP limit of 2 — it can never hold more than two cards at once.",
  },
  {
    cols: { todo: ["b", "c", "d"], wip: ["a"], done: [] },
    startedId: "a",
    note: "Pull 'Login page' into In Progress (1 of 2). The board makes the whole flow of work visible at a glance.",
  },
  {
    cols: { todo: ["c", "d"], wip: ["a", "b"], done: [] },
    startedId: "b",
    note: "Pull 'Search API' in as well. In Progress is now full at 2 of 2.",
  },
  {
    cols: { todo: ["c", "d"], wip: ["a", "b"], done: [] },
    blockedId: "c",
    note: "Try to start 'Payments' — blocked. WIP limit reached — finish something first.",
  },
  {
    cols: { todo: ["c", "d"], wip: ["b"], done: ["a"] },
    doneId: "a",
    note: "Finish 'Login page' and move it to Done. Completing work frees a slot (1 of 2).",
  },
  {
    cols: { todo: ["d"], wip: ["b", "c"], done: ["a"] },
    startedId: "c",
    note: "Now 'Payments' can start (2 of 2). Limiting WIP pushes the team to finish before starting, so the bottleneck surfaces instead of hiding.",
  },
  {
    cols: { todo: ["d"], wip: ["c"], done: ["a", "b"] },
    doneId: "b",
    note: "'Search API' reaches Done, freeing another slot.",
  },
  {
    cols: { todo: [], wip: ["c", "d"], done: ["a", "b"] },
    startedId: "d",
    note: "The last task, 'Email alerts', is pulled in (2 of 2). Work flows continuously — there is no fixed sprint boundary.",
  },
  {
    cols: { todo: [], wip: ["d"], done: ["a", "b", "c"] },
    doneId: "c",
    note: "'Payments' is finished and moves to Done.",
  },
  {
    cols: { todo: [], wip: [], done: ["a", "b", "c", "d"] },
    doneId: "d",
    note: "All work is done. Kanban means visualize the flow and limit work-in-progress, so bottlenecks show up early and throughput stays smooth.",
  },
];

function cardStyle(
  col: Col,
  id: string,
  frame: Step,
  color: string,
): { border: string; bg: string; dot: string } {
  if (col === "wip") {
    const started = id === frame.startedId;
    return {
      border: started ? color : tint(color, 40),
      bg: started ? tint(color, 12) : tint(color, 6),
      dot: color,
    };
  }
  if (col === "done") {
    return { border: tint(GOOD, 40), bg: tint(GOOD, 8), dot: GOOD };
  }
  if (id === frame.blockedId) {
    return { border: WARN, bg: tint(WARN, 12), dot: WARN };
  }
  return { border: "var(--color-line-soft)", bg: "var(--color-bg-2)", dot: "var(--color-faint)" };
}

export default function KanbanDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const wipCount = frame.cols.wip.length;
  const wipFull = wipCount >= LIMIT;
  const countColor = frame.blockedId ? BAD : wipFull ? WARN : GOOD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">A Kanban board with WIP limits</h3>
      <p className="mt-1 text-sm text-dim">
        Visualize the flow, cap work-in-progress, and let finishing beat starting.
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

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {COLUMNS.map((column) => {
          const ids = frame.cols[column.key];
          const isWip = column.key === "wip";
          return (
            <div
              key={column.key}
              className="rounded-xl border border-line-soft bg-bg-2/50 p-2 sm:p-2.5"
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {column.title}
                </span>
                {isWip && (
                  <span
                    className="font-mono text-[10px] font-semibold"
                    style={{ color: countColor }}
                  >
                    {wipCount}/{LIMIT}
                  </span>
                )}
              </div>

              <div className="flex min-h-[7rem] flex-col gap-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {ids.map((id) => {
                    const s = cardStyle(column.key, id, frame, color);
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
                        style={{ borderColor: s.border, background: s.bg }}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: s.dot }}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs text-text">
                          {TASKS[id]}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {ids.length === 0 && (
                  <p className="py-4 text-center text-[11px] text-faint">empty</p>
                )}

                {isWip && frame.blockedId && (
                  <div
                    className="rounded-md border px-2 py-1.5 text-[11px] leading-snug"
                    style={{
                      borderColor: tint(WARN, 45),
                      background: tint(WARN, 12),
                      color: WARN,
                    }}
                  >
                    WIP limit reached — finish something first
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
