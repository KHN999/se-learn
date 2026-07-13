"use client";

import { useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

const DATA = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SearchDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"linear" | "binary">("binary");
  const [target, setTarget] = useState("43");
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(DATA.length - 1);
  const [cur, setCur] = useState<number | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "Linear search checks every element; binary search halves a sorted list each step.",
  );
  const tok = useRef(0);

  function clear() {
    tok.current++;
    setLo(0);
    setHi(DATA.length - 1);
    setCur(null);
    setFound(null);
    setComparisons(0);
    setBusy(false);
  }

  async function run() {
    const t = parseInt(target, 10);
    if (isNaN(t)) return;
    const token = ++tok.current;
    setFound(null);
    setBusy(true);
    setComparisons(0);
    let c = 0;
    if (mode === "linear") {
      setLo(0);
      setHi(DATA.length - 1);
      for (let i = 0; i < DATA.length; i++) {
        if (tok.current !== token) return;
        setCur(i);
        c += 1;
        setComparisons(c);
        await sleep(320);
        if (DATA[i] === t) {
          if (tok.current !== token) return;
          setFound(i);
          setBusy(false);
          setNote(`Found ${t} after ${c} comparison${c > 1 ? "s" : ""} — linear search is O(n).`);
          return;
        }
      }
      if (tok.current !== token) return;
      setCur(null);
      setBusy(false);
      setNote(`${t} not found — linear search checked all ${DATA.length} (O(n)).`);
    } else {
      let l = 0;
      let h = DATA.length - 1;
      while (l <= h) {
        if (tok.current !== token) return;
        const mid = (l + h) >> 1;
        setLo(l);
        setHi(h);
        setCur(mid);
        c += 1;
        setComparisons(c);
        await sleep(520);
        if (DATA[mid] === t) {
          if (tok.current !== token) return;
          setFound(mid);
          setBusy(false);
          setNote(`Found ${t} after ${c} comparison${c > 1 ? "s" : ""} — binary search is O(log n).`);
          return;
        }
        if (DATA[mid] < t) l = mid + 1;
        else h = mid - 1;
      }
      if (tok.current !== token) return;
      setCur(null);
      setBusy(false);
      setNote(`${t} not found — binary search still only took ${c} comparisons (O(log n)).`);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Find a value: check every item, or halve a sorted list
      </h3>
      <p className="mt-1 text-sm text-dim">
        The list is sorted. Linear search walks it end to end; binary search
        jumps to the middle and throws away half each time.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["linear", "binary"] as const).map((m) => {
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
        <span className="font-mono text-xs text-faint">find</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          aria-label="value to find"
          className="w-16 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={run}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          <Search className="h-3.5 w-3.5" /> search
        </button>
        <button
          onClick={clear}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="thin-scroll mt-5 flex items-end gap-1 overflow-x-auto py-2" role="img" aria-label="A sorted array being searched">
        {DATA.map((v, i) => {
          const excluded = mode === "binary" && (i < lo || i > hi);
          const isCur = cur === i;
          const isFound = found === i;
          return (
            <div
              key={i}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border font-mono text-sm transition-colors"
              style={
                isFound
                  ? { borderColor: "var(--color-good)", background: tint("#22c55e", 14), color: "var(--color-text)" }
                  : isCur
                    ? { borderColor: color, background: tint(color, 16), color: "var(--color-text)" }
                    : excluded
                      ? { borderColor: "var(--color-line-soft)", color: "var(--color-faint)", opacity: 0.35 }
                      : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
              }
            >
              {v}
            </div>
          );
        })}
      </div>

      <div className="mt-2 font-mono text-xs text-faint">
        comparisons: <span className="text-text">{comparisons}</span>
        {mode === "binary" && " · greyed cells have been ruled out"}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
