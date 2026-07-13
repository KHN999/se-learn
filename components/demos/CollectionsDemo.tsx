"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BASE = ["apple", "banana", "apple", "cherry"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CollectionsDemo({ color }: { color: string }) {
  const [list, setList] = useState<string[]>(BASE);
  const [input, setInput] = useState("mango");
  const [scan, setScan] = useState<{
    idx: number;
    target: string;
    found: boolean | null;
  } | null>(null);
  const tok = useRef(0);

  const set = Array.from(new Set(list));
  const counts = new Map<string, number>();
  for (const x of list) counts.set(x, (counts.get(x) ?? 0) + 1);
  const mapEntries = Array.from(counts.entries());

  const target = scan?.target ?? "";
  const inSet = set.includes(target);

  function add() {
    const v = input.trim();
    if (!v) return;
    tok.current++;
    setScan(null);
    setList((xs) => [...xs, v]);
  }
  async function contains() {
    const v = input.trim();
    if (!v) return;
    const token = ++tok.current;
    for (let i = 0; i < list.length; i++) {
      if (tok.current !== token) return;
      setScan({ idx: i, target: v, found: null });
      await sleep(350);
      if (list[i] === v) {
        if (tok.current !== token) return;
        setScan({ idx: i, target: v, found: true });
        return;
      }
    }
    if (tok.current !== token) return;
    setScan({ idx: list.length - 1, target: v, found: false });
  }
  function reset() {
    tok.current++;
    setList(BASE);
    setScan(null);
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Same data, three containers</h3>
      <p className="mt-1 text-sm text-dim">
        A List keeps everything in order (duplicates and all). A Set keeps the
        distinct values. A Map keeps a value per key — here, how many times each
        appears. Add items, then ask &ldquo;contains?&rdquo; and watch the cost
        differ.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="item to add or find"
          className="w-32 rounded-lg border border-line bg-bg-2 px-2.5 py-1.5 font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          style={{ background: color }}
        >
          <Plus className="h-3.5 w-3.5" /> add
        </button>
        <button
          onClick={contains}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <Search className="h-3.5 w-3.5" /> contains?
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* List */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            List — ordered, dupes
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {list.map((x, i) => {
              const checking = scan && scan.idx === i && scan.found === null;
              const isFound = scan && scan.found && scan.idx === i;
              return (
                <span
                  key={i}
                  className="rounded-md border px-2 py-1 font-mono text-xs transition-colors"
                  style={
                    isFound
                      ? { borderColor: "var(--color-good)", background: tint("#22c55e", 14), color: "var(--color-text)" }
                      : checking
                        ? { borderColor: color, background: tint(color, 14), color: "var(--color-text)" }
                        : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                  }
                >
                  {x}
                </span>
              );
            })}
          </div>
          {scan && (
            <p
              className="mt-2 font-mono text-[11px]"
              style={{
                color: scan.found === false ? "var(--color-warn)" : "var(--color-dim)",
              }}
            >
              {scan.found === null
                ? `scanning… checked ${scan.idx + 1}`
                : scan.found
                  ? `found after ${scan.idx + 1} checks · O(n)`
                  : `not found — scanned all ${list.length} · O(n)`}
            </p>
          )}
        </div>

        {/* Set */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Set — unique
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {set.map((x) => (
              <span
                key={x}
                className="rounded-md border border-line px-2 py-1 font-mono text-xs text-dim"
              >
                {x}
              </span>
            ))}
          </div>
          {scan && (
            <p
              className="mt-2 font-mono text-[11px]"
              style={{ color: inSet ? "var(--color-good)" : "var(--color-warn)" }}
            >
              has(&quot;{target}&quot;) → {inSet ? "yes" : "no"} · O(1) avg
            </p>
          )}
        </div>

        {/* Map */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Map — key → count
          </p>
          <div className="mt-2 space-y-1">
            {mapEntries.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between font-mono text-xs"
              >
                <span className="text-dim">{k}</span>
                <motion.span
                  key={`${k}-${v}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-text"
                >
                  {v}
                </motion.span>
              </div>
            ))}
          </div>
          {scan && (
            <p
              className="mt-2 font-mono text-[11px]"
              style={{ color: inSet ? "var(--color-good)" : "var(--color-warn)" }}
            >
              get(&quot;{target}&quot;) → {counts.get(target) ?? "—"} · O(1) avg
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">
        The List walks item by item to answer &ldquo;is it in here?&rdquo; — that
        is O(n). The Set and Map jump almost straight to the answer — O(1) on
        average. Same question, very different cost as the data grows.
      </p>
    </div>
  );
}
