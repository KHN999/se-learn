"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

const NS = [10, 100, 1000, 10000, 100000];
const CLASSES = [
  { key: "O(1)", color: "#22c55e", f: () => 1 },
  { key: "O(log n)", color: "#38bdf8", f: (n: number) => Math.max(1, Math.ceil(Math.log2(n))) },
  { key: "O(n)", color: "#fbbf24", f: (n: number) => n },
  { key: "O(n log n)", color: "#fb923c", f: (n: number) => n * Math.max(1, Math.ceil(Math.log2(n))) },
  { key: "O(n²)", color: "#f43f5e", f: (n: number) => n * n },
];

export default function ClassBarsDemo({ color }: { color: string }) {
  const [n, setN] = useState(1000);
  const values = CLASSES.map((c) => c.f(n));
  const logMax = Math.log10(Math.max(...values) + 1);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The same job, five growth rates — in real numbers
      </h3>
      <p className="mt-1 text-sm text-dim">
        Pick an input size and see how many operations each class actually does.
        (Bars are on a log scale — the true gaps are even bigger.)
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">n =</span>
        {NS.map((v) => {
          const on = n === v;
          return (
            <button
              key={v}
              onClick={() => setN(v)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
              style={on ? { background: tint(color, 16), color, borderColor: tint(color, 45) } : { color: "var(--color-dim)", borderColor: "var(--color-line)" }}
            >
              {v.toLocaleString("en-US")}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {CLASSES.map((c, i) => {
          const ops = values[i];
          const w = Math.max(2, (Math.log10(ops + 1) / logMax) * 100);
          return (
            <div key={c.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 font-mono text-xs text-dim">{c.key}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-bg-2">
                <div className="h-full rounded" style={{ width: `${w}%`, background: c.color }} />
              </div>
              <span className="w-28 shrink-0 text-right font-mono text-xs text-text">
                {ops.toLocaleString("en-US")}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        At n = {n.toLocaleString("en-US")}, O(n²) does{" "}
        {(n * n).toLocaleString("en-US")} operations — versus{" "}
        {Math.max(1, Math.ceil(Math.log2(n)))} for O(log n). That difference is
        why the complexity class, not clever micro-tuning, decides what scales.
      </p>
    </div>
  );
}
