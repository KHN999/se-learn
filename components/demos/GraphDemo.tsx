"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const NODES: Record<string, { x: number; y: number }> = {
  A: { x: 50, y: 8 },
  B: { x: 22, y: 30 },
  C: { x: 78, y: 30 },
  D: { x: 50, y: 46 },
  E: { x: 86, y: 58 },
  F: { x: 38, y: 66 },
};
const ADJ: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D", "E"],
  D: ["B", "C", "F"],
  E: ["C", "F"],
  F: ["D", "E"],
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "C"],
  ["B", "D"],
  ["C", "D"],
  ["C", "E"],
  ["D", "F"],
  ["E", "F"],
];
const START = "A";

type Step = { current: string; visited: string[]; frontier: string[]; note: string };

function traverse(mode: "bfs" | "dfs"): Step[] {
  const visited = new Set([START]);
  let frontier = [START];
  const steps: Step[] = [];
  const struct = mode === "bfs" ? "queue" : "stack";
  while (frontier.length) {
    const current = mode === "bfs" ? frontier.shift()! : frontier.pop()!;
    const toAdd = ADJ[current].filter((n) => !visited.has(n));
    const ordered = mode === "bfs" ? toAdd : [...toAdd].reverse();
    for (const n of ordered) {
      visited.add(n);
      frontier.push(n);
    }
    steps.push({
      current,
      visited: [...visited],
      frontier: [...frontier],
      note: toAdd.length
        ? `Visit ${current}. Add ${toAdd.join(", ")} to the ${struct}.`
        : `Visit ${current}. No new neighbours.`,
    });
  }
  return steps;
}

export default function GraphDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"bfs" | "dfs">("bfs");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(() => traverse(mode), [mode]);
  const cur = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearTimeout(t);
  }, [playing, step, atEnd, steps.length]);

  const order = steps.slice(0, step + 1).map((s) => s.current);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Graph traversal — breadth-first vs. depth-first
      </h3>
      <p className="mt-1 text-sm text-dim">
        Both visit every node from A, but BFS uses a queue (explores level by
        level) and DFS uses a stack (goes deep first). Watch the frontier.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["bfs", "dfs"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 font-mono text-xs uppercase transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {m}
              </button>
            );
          })}
        </div>
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-2">
          <svg viewBox="0 0 100 74" className="h-auto w-full" style={{ maxHeight: 280 }}>
            {EDGES.map(([a, b]) => (
              <line
                key={`${a}${b}`}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="var(--color-line)"
                strokeWidth={0.5}
              />
            ))}
            {Object.entries(NODES).map(([id, p]) => {
              const isCur = cur.current === id;
              const isVisited = cur.visited.includes(id);
              return (
                <g key={id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={7}
                    fill={isCur ? color : isVisited ? tint(color, 22) : "var(--color-bg-2)"}
                    stroke={isCur || isVisited ? color : "var(--color-line)"}
                    strokeWidth={0.6}
                  />
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: 6, fill: isCur ? "var(--color-bg)" : "var(--color-text)" }}
                    className="font-mono"
                  >
                    {id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              frontier — {mode === "bfs" ? "queue (FIFO)" : "stack (LIFO)"}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {cur.frontier.length === 0 && (
                <span className="font-mono text-xs text-faint">empty</span>
              )}
              {cur.frontier.map((n, i) => (
                <span
                  key={i}
                  className="rounded-md border px-2 py-0.5 font-mono text-xs"
                  style={{ borderColor: tint(color, 45), color: "var(--color-dim)" }}
                >
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-1 font-mono text-[10px] text-faint">
              {mode === "bfs" ? "next out ← front" : "next out ← top (right)"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              visit order
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {order.map((n, i) => (
                <span
                  key={i}
                  className="rounded-md px-2 py-0.5 font-mono text-xs text-bg"
                  style={{ background: color }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{cur.note}</p>
    </div>
  );
}
