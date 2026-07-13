"use client";

import { useRef, useState } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import { tint } from "@/lib/curriculum";

const START = [5, 2, 8, 1, 9, 3, 7, 4, 6];
const MAX = 9;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SortDemo({ color }: { color: string }) {
  const [bars, setBars] = useState<number[]>(START);
  const [mode, setMode] = useState<"bubble" | "insertion">("bubble");
  const [compare, setCompare] = useState<[number, number] | null>(null);
  const [sortedFrom, setSortedFrom] = useState<number | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "Bubble and insertion sort do about n² comparisons. Efficient sorts do n·log n.",
  );
  const tok = useRef(0);

  function clear(next?: number[]) {
    tok.current++;
    setCompare(null);
    setSortedFrom(null);
    setComparisons(0);
    setSwaps(0);
    setBusy(false);
    if (next) setBars(next);
  }

  async function run() {
    const token = ++tok.current;
    setBusy(true);
    setComparisons(0);
    setSwaps(0);
    setSortedFrom(null);
    const a = [...bars];
    const n = a.length;
    let cmp = 0;
    let swp = 0;
    if (mode === "bubble") {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          if (tok.current !== token) return;
          setCompare([j, j + 1]);
          cmp += 1;
          setComparisons(cmp);
          await sleep(70);
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            swp += 1;
            setSwaps(swp);
            setBars([...a]);
            await sleep(80);
          }
        }
        setSortedFrom(n - 1 - i);
      }
      setSortedFrom(0);
    } else {
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > key) {
          if (tok.current !== token) return;
          setCompare([j, j + 1]);
          cmp += 1;
          setComparisons(cmp);
          a[j + 1] = a[j];
          swp += 1;
          setSwaps(swp);
          setBars([...a]);
          await sleep(90);
          j -= 1;
        }
        a[j + 1] = key;
        setBars([...a]);
      }
    }
    if (tok.current !== token) return;
    setCompare(null);
    setSortedFrom(0);
    setBusy(false);
    const nlogn = Math.round(n * Math.log2(n));
    setNote(
      `Done: ${cmp} comparisons, ${swp} moves (O(n²)). An O(n log n) sort would need about ${nlogn} comparisons — and the gap explodes as the list grows.`,
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Sort the bars: simple vs. efficient
      </h3>
      <p className="mt-1 text-sm text-dim">
        Watch a simple sort compare and swap neighbours. Count the comparisons —
        that number is what separates O(n²) from O(n log n).
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["bubble", "insertion"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  clear();
                }}
                aria-pressed={on}
                className="px-3 py-1.5 text-xs transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {m}
              </button>
            );
          })}
        </div>
        <button
          onClick={run}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          sort
        </button>
        <button
          onClick={() =>
            clear(
              [...START]
                .map((v) => ({ v, r: Math.random() }))
                .sort((a, b) => a.r - b.r)
                .map((x) => x.v),
            )
          }
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <Shuffle className="h-3.5 w-3.5" /> shuffle
        </button>
        <button
          onClick={() => clear(START)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div
        className="mt-5 flex h-40 items-end justify-center gap-1.5"
        role="img"
        aria-label="A bar chart of values being sorted"
      >
        {bars.map((v, i) => {
          const inCompare = compare && (compare[0] === i || compare[1] === i);
          const sorted = sortedFrom !== null && i >= sortedFrom;
          return (
            <div
              key={i}
              className="w-7 rounded-t transition-all"
              style={{
                height: `${(v / MAX) * 100}%`,
                background: inCompare
                  ? color
                  : sorted
                    ? tint("#22c55e", 55)
                    : tint(color, 30),
              }}
            />
          );
        })}
      </div>

      <div className="mt-2 font-mono text-xs text-faint">
        comparisons: <span className="text-text">{comparisons}</span> · moves:{" "}
        <span className="text-text">{swaps}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
