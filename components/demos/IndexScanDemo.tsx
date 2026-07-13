"use client";

import { useRef, useState } from "react";
import { Check, Play, RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GRID = 48;
const COST_PER_ROW = 0.00015; // ms, rough — the lesson is the row count, not this

const SIZES = [
  { label: "1K", value: 1_000 },
  { label: "100K", value: 100_000 },
  { label: "1M", value: 1_000_000 },
  { label: "10M", value: 10_000_000 },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Binary-search path over sorted indices [0, GRID-1], ending at target.
function indexPath(target: number): number[] {
  const path: number[] = [];
  let lo = 0;
  let hi = GRID - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    path.push(mid);
    if (mid === target) break;
    if (mid < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return path;
}

function scanPath(target: number): number[] {
  return Array.from({ length: target + 1 }, (_, i) => i);
}

function fmtRows(n: number) {
  return Math.max(1, Math.round(n)).toLocaleString("en-US");
}

function fmtTime(ms: number) {
  if (ms < 0.1) return "<0.1 ms";
  if (ms < 1000) return `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default function IndexScanDemo({ color }: { color: string }) {
  const [size, setSize] = useState(1_000_000);
  const [indexed, setIndexed] = useState(false);
  const [target, setTarget] = useState(33);
  const [visited, setVisited] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tok = useRef(0);

  // Extrapolate the on-screen 48-cell demo to the real table size.
  const scanExamined = Math.round(((target + 1) / GRID) * size);
  const indexExamined = Math.max(1, Math.ceil(Math.log2(size)));
  const examined = indexed ? indexExamined : scanExamined;

  function clear() {
    tok.current++;
    setVisited([]);
    setCurrent(null);
    setRunning(false);
    setDone(false);
  }

  async function run() {
    const token = ++tok.current;
    const path = indexed ? indexPath(target) : scanPath(target);
    const stepMs = indexed ? 320 : 42;
    setRunning(true);
    setDone(false);
    setVisited([]);
    setCurrent(null);
    for (let i = 0; i < path.length; i++) {
      if (tok.current !== token) return;
      setCurrent(path[i]);
      setVisited((v) => [...v, path[i]]);
      await sleep(stepMs);
    }
    if (tok.current !== token) return;
    setCurrent(null);
    setRunning(false);
    setDone(true);
  }

  function newRow() {
    // Randomize only on user action, so the initial SSR render stays stable.
    setTarget(8 + Math.floor(Math.random() * (GRID - 8)));
    clear();
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" style={{ color }} />
        <h3 className="font-semibold text-text">
          Try it: find one row in the table
        </h3>
      </div>
      <p className="mt-1 text-sm text-dim">
        Each square is a chunk of the table. Search with a full scan, then turn
        the index on and search again.
      </p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-faint">rows</span>
          <div className="flex overflow-hidden rounded-lg border border-line">
            {SIZES.map((s) => {
              const on = size === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => {
                    setSize(s.value);
                    clear();
                  }}
                  className="px-2.5 py-1 font-mono text-xs transition-colors"
                  style={
                    on
                      ? { background: tint(color, 18), color }
                      : { color: "var(--color-faint)" }
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            setIndexed((v) => !v);
            clear();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs transition-colors"
          style={
            indexed
              ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
              : { color: "var(--color-dim)" }
          }
        >
          <span
            className="grid h-3.5 w-6 place-items-center rounded-full transition-colors"
            style={{
              background: indexed ? color : "var(--color-line)",
            }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full bg-white transition-transform"
              style={{ transform: indexed ? "translateX(5px)" : "translateX(-5px)" }}
            />
          </span>
          Index on email
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: color }}
          >
            <Play className="h-3.5 w-3.5" />
            {running ? "Searching…" : "Run search"}
          </button>
          <button
            onClick={newRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New row
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-8 gap-1 sm:grid-cols-12">
        {Array.from({ length: GRID }, (_, i) => {
          const isTarget = i === target;
          const isCurrent = current === i;
          const isVisited = visited.includes(i);
          const foundHere = done && isTarget;
          let style: React.CSSProperties = {};
          if (isCurrent) style = { background: color };
          else if (foundHere) style = { background: color };
          else if (isVisited) style = { background: tint(color, 30) };
          return (
            <div
              key={i}
              className="relative grid h-6 place-items-center rounded-sm border sm:h-7"
              style={{
                ...style,
                borderColor: isTarget ? color : "var(--color-line-soft)",
                borderWidth: isTarget ? 2 : 1,
              }}
            >
              {foundHere && <Check className="h-3.5 w-3.5 text-bg" />}
              {isTarget && !foundHere && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isCurrent ? "var(--color-bg)" : color }}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[11px] text-faint">
        outlined square = the row you&apos;re looking for
      </p>

      {/* Comparison */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: !indexed ? tint(color, 45) : "var(--color-line)",
            background: !indexed ? tint(color, 8) : "transparent",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-faint">
            Full scan {!indexed && "· active"}
          </p>
          <p className="mt-2 text-2xl font-semibold text-text">
            {fmtRows(scanExamined)}
          </p>
          <p className="text-sm text-dim">
            rows read · ≈ {fmtTime(scanExamined * COST_PER_ROW)}
          </p>
        </div>
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: indexed ? tint(color, 45) : "var(--color-line)",
            background: indexed ? tint(color, 8) : "transparent",
          }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-faint">
            With index {indexed && "· active"}
          </p>
          <p className="mt-2 text-2xl font-semibold text-text">
            {fmtRows(indexExamined)}
          </p>
          <p className="text-sm text-dim">
            rows read · ≈ {fmtTime(indexExamined * COST_PER_ROW)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-dim">
        At <span className="text-text">{size.toLocaleString("en-US")}</span> rows,
        the scan reads about{" "}
        <span style={{ color }}>
          {Math.max(1, Math.round(scanExamined / indexExamined)).toLocaleString(
            "en-US",
          )}
          ×
        </span>{" "}
        as many rows as the index. That gap only widens as the table grows —
        that&apos;s the difference between O(n) and O(log n).
      </p>
    </div>
  );
}
