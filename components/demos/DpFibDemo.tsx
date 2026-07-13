"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { tint } from "@/lib/curriculum";

type TNode = { id: number; k: number; cached?: boolean; children: TNode[] };

function buildNaive(n: number): TNode {
  let id = 0;
  function rec(k: number): TNode {
    const node: TNode = { id: id++, k, children: [] };
    if (k >= 2) node.children = [rec(k - 1), rec(k - 2)];
    return node;
  }
  return rec(n);
}

function buildMemo(n: number): TNode {
  let id = 0;
  const seen = new Set<number>();
  function rec(k: number): TNode {
    if (k < 2) return { id: id++, k, children: [] };
    if (seen.has(k)) return { id: id++, k, cached: true, children: [] };
    seen.add(k);
    return { id: id++, k, children: [rec(k - 1), rec(k - 2)] };
  }
  return rec(n);
}

function layout(root: TNode) {
  const pos = new Map<number, { x: number; y: number }>();
  const nodes: { id: number; k: number; cached: boolean }[] = [];
  const edges: [number, number][] = [];
  let leaf = 0;
  let maxDepth = 0;
  function walk(node: TNode, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    let x: number;
    if (node.children.length === 0) {
      x = leaf++;
    } else {
      const xs = node.children.map((c) => {
        edges.push([node.id, c.id]);
        return walk(c, depth + 1);
      });
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    pos.set(node.id, { x, y: depth });
    nodes.push({ id: node.id, k: node.k, cached: !!node.cached });
    return x;
  }
  walk(root, 0);
  return { pos, nodes, edges, leaves: Math.max(1, leaf), maxDepth };
}

function count(node: TNode): number {
  return 1 + node.children.reduce((s, c) => s + count(c), 0);
}

export default function DpFibDemo({ color }: { color: string }) {
  const [n, setN] = useState(5);
  const [mode, setMode] = useState<"naive" | "memoized">("naive");

  const { naiveN, memoN, view } = useMemo(() => {
    const naiveTree = buildNaive(n);
    const memoTree = buildMemo(n);
    return {
      naiveN: count(naiveTree),
      memoN: count(memoTree),
      view: layout(mode === "naive" ? naiveTree : memoTree),
    };
  }, [n, mode]);

  const height = 12 + (view.maxDepth + 1) * 15;
  const X = (x: number) => ((x + 0.5) / view.leaves) * 100;
  const Y = (y: number) => 8 + y * 15;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Fibonacci: the same subproblems, over and over
      </h3>
      <p className="mt-1 text-sm text-dim">
        Naive recursion recomputes fib(k) again and again. Turn on memoization
        and the repeats collapse into cached lookups. Each circle is fib(k).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">fib(</span>
        <button
          onClick={() => setN((v) => Math.max(3, v - 1))}
          aria-label="decrease n"
          className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center font-mono text-sm text-text">{n}</span>
        <button
          onClick={() => setN((v) => Math.min(6, v + 1))}
          aria-label="increase n"
          className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="font-mono text-xs text-faint">)</span>
        <div className="ml-2 flex overflow-hidden rounded-lg border border-line">
          {(["naive", "memoized"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="px-3 py-1.5 text-xs transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Call counts */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: mode === "naive" ? tint(color, 45) : "var(--color-line)",
            background: mode === "naive" ? tint(color, 8) : "transparent",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            naive calls
          </p>
          <p className="text-2xl font-semibold text-text">{naiveN}</p>
          <p className="text-xs text-dim">grows exponentially</p>
        </div>
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: mode === "memoized" ? tint(color, 45) : "var(--color-line)",
            background: mode === "memoized" ? tint(color, 8) : "transparent",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            memoized calls
          </p>
          <p className="text-2xl font-semibold text-text">{memoN}</p>
          <p className="text-xs text-dim">grows linearly</p>
        </div>
      </div>

      {/* Tree */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-2">
        <svg
          viewBox={`0 0 100 ${height}`}
          className="h-auto w-full"
          style={{ maxHeight: 260 }}
          role="img"
          aria-label={`The ${mode} call tree for fib(${n}); ${mode === "memoized" ? "repeated subproblems are cached instead of recomputed" : "many subproblems are recomputed"}.`}
        >
          {view.edges.map(([a, b]) => {
            const pa = view.pos.get(a)!;
            const pb = view.pos.get(b)!;
            return (
              <line key={`${a}-${b}`} x1={X(pa.x)} y1={Y(pa.y)} x2={X(pb.x)} y2={Y(pb.y)} stroke="var(--color-line)" strokeWidth={0.4} />
            );
          })}
          {view.nodes.map((nd) => {
            const p = view.pos.get(nd.id)!;
            return (
              <g key={nd.id}>
                <circle
                  cx={X(p.x)}
                  cy={Y(p.y)}
                  r={5.5}
                  fill={nd.cached ? "var(--color-bg-2)" : tint(color, 22)}
                  stroke={nd.cached ? "var(--color-line)" : color}
                  strokeWidth={0.5}
                  strokeDasharray={nd.cached ? "1.5 1.5" : undefined}
                  opacity={nd.cached ? 0.55 : 1}
                />
                <text
                  x={X(p.x)}
                  y={Y(p.y)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 5, fill: nd.cached ? "var(--color-faint)" : "var(--color-text)" }}
                  className="font-mono"
                >
                  {nd.k}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-1 text-center font-mono text-[10px] text-faint">
          dashed nodes are cache hits — computed once, reused after
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {mode === "naive"
          ? `fib(${n}) makes ${naiveN} calls, recomputing the same values repeatedly — O(2ⁿ).`
          : `With memoization, fib(${n}) makes just ${memoN} calls — each subproblem solved once, then cached. O(n).`}
      </p>
    </div>
  );
}
