"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

const N = 1000; // list size

export default function TimeSpaceDemo({ color }: { color: string }) {
  const [q, setQ] = useState(20);

  // "Is X in the list?", answered Q times.
  const rescanTime = q * N; // scan all N, every query
  const indexTime = N + q; // build a hash set once, then O(1) per query
  const maxTime = Math.max(rescanTime, indexTime);
  const rescanSpace = 1; // O(1) extra
  const indexSpace = N; // holds a set of N

  const bar = (v: number, max: number) => `${Math.max(2, (v / max) * 100)}%`;
  const cheaper = indexTime < rescanTime ? "index" : "rescan";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Spend memory to save time — but only when it pays off
      </h3>
      <p className="mt-1 text-sm text-dim">
        Answer &ldquo;is this value in the list?&rdquo; over and over. Rescan
        every time (no memory), or build a hash index once (uses memory). Slide
        the number of queries.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label className="font-mono text-xs text-faint" htmlFor="ts-q">
          queries = <span className="text-text">{q}</span>
        </label>
        <input
          id="ts-q"
          type="range"
          min={1}
          max={60}
          value={q}
          onChange={(e) => setQ(parseInt(e.target.value, 10))}
          aria-label="number of queries"
          className="flex-1"
          style={{ accentColor: color }}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          { name: "Rescan each time", time: rescanTime, space: rescanSpace, sub: "O(n) per query · O(1) space" },
          { name: "Build a hash index", time: indexTime, space: indexSpace, sub: "O(1) per query · O(n) space" },
        ].map((s) => (
          <div key={s.name} className="rounded-xl border border-line-soft bg-bg-2/40 p-3">
            <p className="text-sm font-medium text-text">{s.name}</p>
            <p className="font-mono text-[11px] text-faint">{s.sub}</p>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex justify-between font-mono text-[11px] text-faint">
                  <span>time</span>
                  <span className="text-dim">{s.time.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-0.5 h-3 overflow-hidden rounded bg-bg-2">
                  <div className="h-full rounded" style={{ width: bar(s.time, maxTime), background: color }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-mono text-[11px] text-faint">
                  <span>memory</span>
                  <span className="text-dim">{s.space.toLocaleString("en-US")}</span>
                </div>
                <div className="mt-0.5 h-3 overflow-hidden rounded bg-bg-2">
                  <div className="h-full rounded" style={{ width: bar(s.space, N), background: tint(color, 45) }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cheaper === "index"
          ? `At ${q} queries, the index wins on time (${indexTime.toLocaleString("en-US")} vs ${rescanTime.toLocaleString("en-US")}) — the memory it costs pays for itself once you query enough.`
          : `At ${q} quer${q === 1 ? "y" : "ies"}, rescanning is fine — not worth the memory of an index yet. Query more and that flips.`}
      </p>
    </div>
  );
}
