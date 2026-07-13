"use client";

import { useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Node = { id: number; v: number; left: Node | null; right: Node | null };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildTree(): Node {
  let id = 0;
  function rec(vals: number[]): Node | null {
    if (!vals.length) return null;
    const mid = Math.floor(vals.length / 2);
    return {
      id: id++,
      v: vals[mid],
      left: rec(vals.slice(0, mid)),
      right: rec(vals.slice(mid + 1)),
    };
  }
  return rec([2, 4, 6, 8, 10, 12, 14])!;
}

export default function TreeDemo({ color }: { color: string }) {
  const [root] = useState<Node>(buildTree);
  const [path, setPath] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [sorted, setSorted] = useState<number[]>([]);
  const [target, setTarget] = useState("10");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "In a binary search tree, smaller values go left and larger go right — so in a balanced tree, each step skips about half.",
  );
  const tok = useRef(0);

  // Layout: in-order x-rank, depth for y.
  const positions = new Map<number, { x: number; y: number }>();
  const flat: Node[] = [];
  {
    let order = 0;
    let total = 0;
    (function count(n: Node | null) {
      if (!n) return;
      count(n.left);
      total++;
      count(n.right);
    })(root);
    (function place(n: Node | null, depth: number) {
      if (!n) return;
      place(n.left, depth + 1);
      positions.set(n.id, { x: ((order + 0.5) / total) * 100, y: 12 + depth * 20 });
      order++;
      flat.push(n);
      place(n.right, depth + 1);
    })(root, 0);
  }
  const edges: [number, number][] = [];
  for (const n of flat) {
    if (n.left) edges.push([n.id, n.left.id]);
    if (n.right) edges.push([n.id, n.right.id]);
  }
  const maxDepth = Math.max(...flat.map((n) => positions.get(n.id)!.y));
  const height = maxDepth + 14;

  async function search() {
    const t = parseInt(target, 10);
    if (isNaN(t)) return;
    const token = ++tok.current;
    setBusy(true);
    setFound(null);
    setSorted([]);
    const p: number[] = [];
    let cur: Node | null = root;
    while (cur) {
      if (tok.current !== token) return;
      p.push(cur.id);
      setPath([...p]);
      setActive(cur.id);
      await sleep(550);
      if (cur.v === t) {
        if (tok.current !== token) return;
        setFound(cur.id);
        setBusy(false);
        setNote(`Found ${t} after ${p.length} step${p.length > 1 ? "s" : ""} — each step skipped half the remaining tree (O(log n)).`);
        return;
      }
      cur = t < cur.v ? cur.left : cur.right;
    }
    if (tok.current !== token) return;
    setActive(null);
    setBusy(false);
    setNote(`${t} isn't in the tree — but we only checked ${p.length} nodes, not all of them.`);
  }

  async function inorder() {
    const token = ++tok.current;
    setBusy(true);
    setFound(null);
    setPath([]);
    setSorted([]);
    const ids: number[] = [];
    const vals: number[] = [];
    (function rec(n: Node | null) {
      if (!n) return;
      rec(n.left);
      ids.push(n.id);
      vals.push(n.v);
      rec(n.right);
    })(root);
    for (let k = 0; k < ids.length; k++) {
      if (tok.current !== token) return;
      setActive(ids[k]);
      setSorted(vals.slice(0, k + 1));
      await sleep(420);
    }
    if (tok.current !== token) return;
    setActive(null);
    setBusy(false);
    setNote("In-order traversal visits left → node → right, so the values come out sorted — in O(n), with no separate sort.");
  }

  function reset() {
    tok.current++;
    setPath([]);
    setActive(null);
    setFound(null);
    setSorted([]);
    setBusy(false);
    setNote("In a binary search tree, smaller values go left and larger go right — so each step skips half the tree.");
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Binary search tree — halve the space every step
      </h3>
      <p className="mt-1 text-sm text-dim">
        Search a value and watch it go left or right at each node. Or run an
        in-order traversal and see the values come out sorted.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">find</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          aria-label="value to find"
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={search}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          <Search className="h-3.5 w-3.5" /> search
        </button>
        <button
          onClick={inorder}
          disabled={busy}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          in-order traversal
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-2">
        <svg
          viewBox={`0 0 100 ${height}`}
          className="h-auto w-full"
          style={{ maxHeight: 240 }}
          role="img"
          aria-label="A binary search tree; a search descends left or right at each node, eliminating about half the remaining values each step."
        >
          {edges.map(([a, b]) => {
            const pa = positions.get(a)!;
            const pb = positions.get(b)!;
            return (
              <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="var(--color-line)" strokeWidth={0.5} />
            );
          })}
          {flat.map((n) => {
            const p = positions.get(n.id)!;
            const isFound = found === n.id;
            const isActive = active === n.id && !isFound;
            const inPath = path.includes(n.id);
            let fill = "var(--color-bg-2)";
            let stroke = "var(--color-line)";
            if (isFound) {
              fill = "#22c55e";
              stroke = "#22c55e";
            } else if (isActive) {
              fill = color;
              stroke = color;
            } else if (inPath) {
              fill = tint(color, 22);
              stroke = color;
            }
            return (
              <g key={n.id}>
                <circle cx={p.x} cy={p.y} r={7} fill={fill} stroke={stroke} strokeWidth={0.6} />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 6, fill: isFound || isActive ? "var(--color-bg)" : "var(--color-text)" }}
                  className="font-mono"
                >
                  {n.v}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {sorted.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-faint">
            sorted output
          </span>
          {sorted.map((v, i) => (
            <span
              key={i}
              className="rounded px-1.5 py-0.5 font-mono text-[11px] text-bg"
              style={{ background: color }}
            >
              {v}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim">{note}</p>
    </div>
  );
}
