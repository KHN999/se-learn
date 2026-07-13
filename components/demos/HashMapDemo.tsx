"use client";

import { useRef, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BUCKETS = 6;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hash(key: string) {
  let h = 0;
  for (const ch of key) h += ch.charCodeAt(0);
  return h;
}

type Entry = { key: string; val: number };

function seed(): Entry[][] {
  const b: Entry[][] = Array.from({ length: BUCKETS }, () => []);
  for (const k of ["cat", "dog", "bird", "fish"]) {
    b[hash(k) % BUCKETS].push({ key: k, val: k.length });
  }
  return b;
}

export default function HashMapDemo({ color }: { color: string }) {
  const [buckets, setBuckets] = useState<Entry[][]>(seed);
  const [input, setInput] = useState("owl");
  const [calc, setCalc] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [scan, setScan] = useState<{ bucket: number; idx: number } | null>(null);
  const [note, setNote] = useState(
    "A hash function turns the key into a bucket number. Same key, same bucket, every time.",
  );
  const tok = useRef(0);

  function put() {
    const key = input.trim();
    if (!key) return;
    tok.current++;
    setScan(null);
    const h = hash(key);
    const b = h % BUCKETS;
    setCalc(`hash("${key}") = ${h} → bucket ${h} % ${BUCKETS} = ${b}`);
    setActive(b);
    setBuckets((prev) => {
      const next = prev.map((x) => [...x]);
      const existing = next[b].find((e) => e.key === key);
      if (existing) existing.val = key.length;
      else next[b].push({ key, val: key.length });
      return next;
    });
    setNote(`put("${key}") → jumped straight to bucket ${b}. O(1) on average.`);
  }

  async function get() {
    const key = input.trim();
    if (!key) return;
    const token = ++tok.current;
    const h = hash(key);
    const b = h % BUCKETS;
    setCalc(`hash("${key}") = ${h} → bucket ${h} % ${BUCKETS} = ${b}`);
    setActive(b);
    const chain = buckets[b];
    for (let i = 0; i < chain.length; i++) {
      if (tok.current !== token) return;
      setScan({ bucket: b, idx: i });
      await sleep(400);
      if (chain[i].key === key) {
        if (tok.current !== token) return;
        setNote(`get("${key}") → bucket ${b}, found after ${i + 1} step(s) in the chain.`);
        return;
      }
    }
    if (tok.current !== token) return;
    setScan(null);
    setNote(`get("${key}") → bucket ${b} has no "${key}". Not present.`);
  }

  function reset() {
    tok.current++;
    setBuckets(seed());
    setCalc(null);
    setActive(null);
    setScan(null);
    setNote("A hash function turns the key into a bucket number. Same key, same bucket, every time.");
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Hash map — jump to the bucket, don&apos;t scan
      </h3>
      <p className="mt-1 text-sm text-dim">
        The key is hashed to a bucket number, so storing and finding go straight
        to the right bucket. Two keys in one bucket is a collision — chained in a
        short list.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">key</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="key"
          className="w-28 rounded-lg border border-line bg-bg-2 px-2.5 py-1.5 font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={put}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          style={{ background: color }}
        >
          put
        </button>
        <button
          onClick={get}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <Search className="h-3.5 w-3.5" /> get
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      {calc && (
        <p className="mt-3 font-mono text-xs" style={{ color }}>
          {calc}
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        {buckets.map((chain, b) => {
          const isActive = active === b;
          return (
            <div
              key={b}
              className="flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors"
              style={
                isActive
                  ? { borderColor: color, background: tint(color, 7) }
                  : { borderColor: "var(--color-line-soft)" }
              }
            >
              <span className="w-16 shrink-0 font-mono text-[11px] text-faint">
                bucket {b}
              </span>
              <div className="flex flex-wrap gap-1">
                {chain.length === 0 && (
                  <span className="font-mono text-[11px] text-faint">empty</span>
                )}
                {chain.map((e, i) => {
                  const scanning = scan && scan.bucket === b && scan.idx === i;
                  return (
                    <span
                      key={e.key}
                      className="rounded-md border px-2 py-0.5 font-mono text-xs transition-colors"
                      style={
                        scanning
                          ? { borderColor: color, background: tint(color, 16), color: "var(--color-text)" }
                          : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                      }
                    >
                      {e.key}: {e.val}
                    </span>
                  );
                })}
                {chain.length > 1 && (
                  <span className="self-center font-mono text-[10px] text-warn">
                    ← collision
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{note}</p>
    </div>
  );
}
