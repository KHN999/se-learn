"use client";

import { useState } from "react";

const N_MAX = 32;
const CLASSES = [
  { key: "O(1)", color: "#22c55e", f: () => 1 },
  { key: "O(log n)", color: "#38bdf8", f: (n: number) => Math.max(1, Math.ceil(Math.log2(n))) },
  { key: "O(n)", color: "#fbbf24", f: (n: number) => n },
  { key: "O(n log n)", color: "#fb923c", f: (n: number) => n * Math.max(1, Math.ceil(Math.log2(n))) },
  { key: "O(n²)", color: "#f43f5e", f: (n: number) => n * n },
];

const maxOps = N_MAX * N_MAX;
const logMax = Math.log10(maxOps + 1);
const xOf = (n: number) => 4 + ((n - 1) / (N_MAX - 1)) * 93;
const yOf = (ops: number) => 57 - (Math.log10(ops + 1) / logMax) * 53;

export default function BigODemo({ color }: { color: string }) {
  const [n, setN] = useState(16);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        How the classes diverge as n grows
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same n, five growth rates. Slide n and watch the gap between them
        explode — that gap is the whole point of Big-O.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="font-mono text-xs text-faint" htmlFor="bigo-n">
          n = <span className="text-text">{n}</span>
        </label>
        <input
          id="bigo-n"
          type="range"
          min={1}
          max={N_MAX}
          value={n}
          onChange={(e) => setN(parseInt(e.target.value, 10))}
          aria-label="input size n"
          className="flex-1 accent-[color:var(--x)]"
          style={{ ["--x"]: color } as React.CSSProperties}
        />
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-2">
        <svg
          viewBox="0 0 100 60"
          className="h-auto w-full"
          style={{ maxHeight: 220 }}
          role="img"
          aria-label="A log-scale chart of five complexity classes; higher classes rise far more steeply as n increases."
        >
          {CLASSES.map((c) => {
            const pts = Array.from({ length: N_MAX }, (_, i) => `${xOf(i + 1)},${yOf(c.f(i + 1))}`).join(" ");
            return <polyline key={c.key} points={pts} fill="none" stroke={c.color} strokeWidth={0.8} opacity={0.85} />;
          })}
          {/* marker at current n */}
          <line x1={xOf(n)} y1={2} x2={xOf(n)} y2={58} stroke="var(--color-line)" strokeWidth={0.5} strokeDasharray="1 1" />
          {CLASSES.map((c) => (
            <circle key={c.key} cx={xOf(n)} cy={yOf(c.f(n))} r={1.3} fill={c.color} />
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {CLASSES.map((c) => (
          <div key={c.key} className="rounded-lg border border-line-soft bg-bg-2/40 p-2 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span className="font-mono text-[11px] text-dim">{c.key}</span>
            </div>
            <div className="mt-1 font-mono text-sm text-text">
              {c.f(n).toLocaleString("en-US")}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        At n = {n}, O(n²) already does {(n * n).toLocaleString("en-US")} steps
        while O(log n) does {Math.max(1, Math.ceil(Math.log2(n)))}. Double n and
        that gap widens — the class, not the constant, decides what survives at
        scale.
      </p>
    </div>
  );
}
