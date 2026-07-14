"use client";

import { useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const TOTAL = 1000;

type Call = { name: string; guess: number; real: number };

// Deterministic, fixed numbers. Both columns sum to TOTAL ms.
// The developer guesses loadUser (the database) is slow; the profiler proves
// renderThumbnails is the real hog.
const CALLS: Call[] = [
  { name: "parseInput", guess: 60, real: 20 },
  { name: "loadUser", guess: 620, real: 40 },
  { name: "renderThumbnails", guess: 200, real: 900 },
  { name: "sendResponse", guess: 120, real: 40 },
];

const MODES = [
  { key: "guess", label: "Developer's guess" },
  { key: "real", label: "Profiler result" },
] as const;

type ModeKey = (typeof MODES)[number]["key"];

export default function ProfilerDemo({ color }: { color: string }) {
  const [key, setKey] = useState<ModeKey>("guess");

  const isReal = key === "real";
  const bars = CALLS.map((c) => {
    const ms = isReal ? c.real : c.guess;
    return { name: c.name, ms, pct: Math.round((ms / TOTAL) * 100) };
  });
  const peak = bars.reduce((a, b) => (b.ms > a.ms ? b : a), bars[0]);

  const peakColor = isReal ? BAD : WARN;
  const PeakIcon = isReal ? AlertTriangle : HelpCircle;

  const status = isReal
    ? `Measured: renderThumbnails is the real hog at ${peak.pct}% of ${TOTAL} ms — optimize the biggest bar first. A breakpoint pauses execution so you can inspect state; a profiler shows where the time actually goes.`
    : `The developer blames loadUser, the database call — but that is only a hunch. Profile first, then optimize the biggest bar. A breakpoint pauses execution to inspect state; a profiler shows where the time actually goes.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Measure, do not guess</h3>
      <p className="mt-1 text-sm text-dim">
        A profiler breaks one request into function calls and times each. The
        biggest bar is where the time actually goes — often not where you would
        look first.
      </p>

      <div
        className="mt-4 inline-flex rounded-lg border border-line p-0.5"
        role="group"
        aria-label="view mode"
      >
        {MODES.map((m) => {
          const on = m.key === key;
          return (
            <button
              key={m.key}
              onClick={() => setKey(m.key)}
              aria-pressed={on}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          flame chart · one request
        </p>

        <div
          className="flex h-7 items-center rounded-md border border-line px-2"
          style={{ background: tint(color, 10) }}
        >
          <span className="font-mono text-xs text-dim">
            handleRequest — {TOTAL} ms (100%)
          </span>
        </div>

        <div className="mt-1 flex h-7 gap-px overflow-hidden rounded-md">
          {bars.map((b) => {
            const on = b.name === peak.name;
            return (
              <div
                key={b.name}
                title={`${b.name} · ${b.ms} ms`}
                className="flex items-center overflow-hidden px-1"
                style={{
                  width: `${b.pct}%`,
                  background: on ? tint(peakColor, 80) : tint(color, 45),
                }}
              >
                {b.pct >= 30 ? (
                  <span className="truncate font-mono text-[10px] font-medium text-text">
                    {b.name}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {bars.map((b) => {
          const on = b.name === peak.name;
          return (
            <div key={b.name} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate font-mono text-xs text-dim">
                {b.name}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-md border border-line-soft bg-bg-2">
                <div
                  className="h-full rounded-md transition-all"
                  style={{
                    width: `${b.pct}%`,
                    background: on ? peakColor : tint(color, 55),
                  }}
                />
              </div>
              <span
                className="w-24 shrink-0 text-right font-mono text-xs"
                style={on ? { color: peakColor } : { color: "var(--color-dim)" }}
              >
                {b.ms} ms · {b.pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        style={{
          borderColor: tint(peakColor, 45),
          background: tint(peakColor, 12),
          color: peakColor,
        }}
      >
        <PeakIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          {isReal ? "Bottleneck: " : "Guessed culprit: "}
          <span className="font-semibold">{peak.name}</span> — {peak.pct}% of{" "}
          {TOTAL} ms
          {isReal ? (
            <span style={{ color: GOOD }}> (fix this one first)</span>
          ) : null}
        </span>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
