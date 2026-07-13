"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BASE = [3, 8, 5, 13, 10, 7];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pos(i: number) {
  const d = Math.floor(Math.log2(i + 1));
  const inLevel = i - (2 ** d - 1);
  const x = ((inLevel + 0.5) / 2 ** d) * 100;
  const y = 12 + d * 22;
  return { x, y };
}

export default function HeapDemo({ color }: { color: string }) {
  const [arr, setArr] = useState<number[]>(BASE);
  const [hi, setHi] = useState<number[]>([]);
  const [val, setVal] = useState("2");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "A min-heap keeps the smallest value at the root. Insert bubbles up; extract sifts down.",
  );
  const tok = useRef(0);

  async function insert() {
    const v = parseInt(val, 10);
    if (isNaN(v)) return;
    const token = ++tok.current;
    setBusy(true);
    const a = [...arr, v];
    setArr([...a]);
    await sleep(350);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      if (tok.current !== token) return;
      setHi([i, p]);
      await sleep(450);
      [a[i], a[p]] = [a[p], a[i]];
      setArr([...a]);
      i = p;
      await sleep(200);
    }
    if (tok.current !== token) return;
    setHi([]);
    setBusy(false);
    setNote(`Inserted ${v} at the bottom, then bubbled it up while smaller than its parent — O(log n).`);
  }

  async function extractMin() {
    const token = ++tok.current;
    if (arr.length === 0) return;
    setBusy(true);
    const a = [...arr];
    const min = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      setArr([...a]);
      await sleep(400);
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let s = i;
        if (l < a.length && a[l] < a[s]) s = l;
        if (r < a.length && a[r] < a[s]) s = r;
        if (s === i) break;
        if (tok.current !== token) return;
        setHi([i, s]);
        await sleep(450);
        [a[i], a[s]] = [a[s], a[i]];
        setArr([...a]);
        i = s;
        await sleep(200);
      }
    } else {
      setArr([]);
    }
    if (tok.current !== token) return;
    setHi([]);
    setBusy(false);
    setNote(`Extracted the min (${min}): moved the last item to the root and sifted it down — O(log n).`);
  }

  function reset() {
    tok.current++;
    setArr(BASE);
    setHi([]);
    setBusy(false);
    setNote("A min-heap keeps the smallest value at the root. Insert bubbles up; extract sifts down.");
  }

  const maxDepth = arr.length ? Math.floor(Math.log2(arr.length)) : 0;
  const height = 24 + (maxDepth + 1) * 22;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Heap — the smallest is always at the top
      </h3>
      <p className="mt-1 text-sm text-dim">
        Every parent is smaller than its children, so the minimum sits at the
        root. Inserting and extracting each do about log n swaps.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">value</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={insert}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          insert
        </button>
        <button
          onClick={extractMin}
          disabled={busy || arr.length === 0}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          extract min
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
          style={{ maxHeight: 260 }}
        >
          {arr.map((_, i) => {
            if (i === 0) return null;
            const p = pos((i - 1) >> 1);
            const c = pos(i);
            return (
              <line
                key={`e${i}`}
                x1={p.x}
                y1={p.y}
                x2={c.x}
                y2={c.y}
                stroke="var(--color-line)"
                strokeWidth={0.5}
              />
            );
          })}
          {arr.map((v, i) => {
            const p = pos(i);
            const on = hi.includes(i);
            const isRoot = i === 0;
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill={on ? color : isRoot ? tint(color, 22) : "var(--color-bg-2)"}
                  stroke={on || isRoot ? color : "var(--color-line)"}
                  strokeWidth={0.6}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 6, fill: on ? "var(--color-bg)" : "var(--color-text)" }}
                  className="font-mono"
                >
                  {v}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          as array
        </span>
        {arr.map((v, i) => (
          <span
            key={i}
            className="rounded border px-1.5 py-0.5 font-mono text-[11px]"
            style={
              hi.includes(i)
                ? { borderColor: color, background: tint(color, 16), color: "var(--color-text)" }
                : { borderColor: "var(--color-line-soft)", color: "var(--color-dim)" }
            }
          >
            {v}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{note}</p>
    </div>
  );
}
