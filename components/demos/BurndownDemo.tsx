"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

const TOTAL = 40; // story points committed
const SPRINT_DAYS = 10; // working days in a 2-week sprint

// Straight ideal burndown: 40 points evenly retired over 10 days → 0.
const IDEAL = Array.from(
  { length: SPRINT_DAYS + 1 },
  (_, d) => TOTAL - (TOTAL / SPRINT_DAYS) * d,
);

type Tone = "good" | "warn" | "accent";
type Mode = {
  key: string;
  label: string;
  tone: Tone;
  remaining: number[]; // remaining points at day 0..10 (fixed, deterministic)
  status: string;
};

const MODES: Mode[] = [
  {
    key: "ontrack",
    label: "On track",
    tone: "good",
    remaining: [40, 38, 33, 30, 24, 21, 16, 11, 7, 3, 0],
    status:
      "On track: the actual burndown hugs the ideal line and clears all 40 points by day 10. That is steady, sustainable delivery — keep scope stable and protect the pace.",
  },
  {
    key: "behind",
    label: "Behind",
    tone: "warn",
    remaining: [40, 39, 37, 34, 32, 29, 27, 24, 20, 15, 8],
    status:
      "Behind: actual stays above the ideal line all sprint and ends with 8 points unfinished. The answer is to cut scope or clear the blocker and carry work over — not to demand more hours, which burns people out and does not change the estimate.",
  },
  {
    key: "ahead",
    label: "Ahead",
    tone: "accent",
    remaining: [40, 34, 28, 22, 17, 12, 8, 4, 0, 0, 0],
    status:
      "Ahead: the team burned down faster than ideal and cleared all 40 points by day 8, two days early. That can signal strong flow, or a sprint that was under-committed — consider pulling the next item in rather than inflating estimates.",
  },
];

// Plot geometry inside a 100 x 62 viewBox.
const PLOT_L = 9;
const PLOT_R = 98;
const PLOT_T = 4;
const PLOT_B = 52;
const xOf = (day: number) =>
  PLOT_L + (day / SPRINT_DAYS) * (PLOT_R - PLOT_L);
const yOf = (pts: number) =>
  PLOT_B - (pts / TOTAL) * (PLOT_B - PLOT_T);

const GRID = [0, 10, 20, 30, 40];
const DAY_TICKS = [0, 2, 4, 6, 8, 10];

export default function BurndownDemo({ color }: { color: string }) {
  const [key, setKey] = useState("ontrack");
  const mode = MODES.find((m) => m.key === key) ?? MODES[0];
  const accent =
    mode.tone === "good" ? GOOD : mode.tone === "warn" ? WARN : color;

  const remaining = mode.remaining;
  const last = remaining[remaining.length - 1];
  const finishDay = remaining.indexOf(0); // -1 when the sprint never reaches 0
  const finished = finishDay !== -1;
  const delivered = TOTAL - last;

  const finishText = finished
    ? finishDay < SPRINT_DAYS
      ? `Sprint finishes on day ${finishDay} — ${SPRINT_DAYS - finishDay} day${SPRINT_DAYS - finishDay === 1 ? "" : "s"} early`
      : "Sprint finishes on day 10 — right on time"
    : `Sprint does not finish — ${last} points carry to the next sprint`;
  const FinishIcon = finished ? Check : AlertTriangle;
  const finishColor = finished ? accent : BAD;

  const actualPts = remaining
    .map((r, d) => `${xOf(d)},${yOf(r)}`)
    .join(" ");
  const areaPts = `${xOf(0)},${PLOT_B} ${actualPts} ${xOf(SPRINT_DAYS)},${PLOT_B}`;
  const chartLabel =
    mode.tone === "warn"
      ? "Burndown chart: the actual line stays above the dashed ideal line and ends at 8 points remaining on day 10, behind schedule."
      : mode.tone === "accent"
        ? "Burndown chart: the actual line stays below the dashed ideal line and reaches 0 points by day 8, ahead of schedule."
        : "Burndown chart: the actual line closely follows the dashed ideal line from 40 points down to 0 by day 10.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Sprint burndown: are 40 points on pace?
      </h3>
      <p className="mt-1 text-sm text-dim">
        A 2-week sprint of 10 working days, committed to 40 story points. Pick an
        outcome and compare the actual burndown against the straight ideal line.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setKey(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-2">
        <svg
          viewBox="0 0 100 62"
          className="h-auto w-full"
          style={{ maxHeight: 240 }}
          role="img"
          aria-label={chartLabel}
        >
          {/* horizontal gridlines + y labels (remaining story points) */}
          {GRID.map((v) => (
            <g key={v}>
              <line
                x1={PLOT_L}
                y1={yOf(v)}
                x2={PLOT_R}
                y2={yOf(v)}
                stroke="var(--color-line)"
                strokeWidth={0.25}
              />
              <text
                x={PLOT_L - 1.5}
                y={yOf(v) + 1}
                textAnchor="end"
                fontSize={2.6}
                fill="var(--color-faint)"
              >
                {v}
              </text>
            </g>
          ))}

          {/* x-axis day ticks */}
          {DAY_TICKS.map((d) => (
            <text
              key={d}
              x={xOf(d)}
              y={PLOT_B + 5}
              textAnchor="middle"
              fontSize={2.6}
              fill="var(--color-faint)"
            >
              {d}
            </text>
          ))}
          <text
            x={(PLOT_L + PLOT_R) / 2}
            y={PLOT_B + 9}
            textAnchor="middle"
            fontSize={2.4}
            fill="var(--color-faint)"
          >
            working day
          </text>

          {/* ideal line: straight, dashed */}
          <line
            x1={xOf(0)}
            y1={yOf(TOTAL)}
            x2={xOf(SPRINT_DAYS)}
            y2={yOf(0)}
            stroke="var(--color-dim)"
            strokeWidth={0.5}
            strokeDasharray="2 1.6"
          />

          {/* actual burndown: filled area + line + points */}
          <polygon points={areaPts} fill={tint(accent, 12)} stroke="none" />
          <polyline
            points={actualPts}
            fill="none"
            stroke={accent}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
          {remaining.map((r, d) => (
            <circle key={d} cx={xOf(d)} cy={yOf(r)} r={0.8} fill={accent} />
          ))}
        </svg>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-faint">
            <span
              className="inline-block h-0 w-4 border-t-2 border-dashed"
              style={{ borderColor: "var(--color-dim)" }}
            />
            Ideal (40 to 0)
          </span>
          <span className="inline-flex items-center gap-1.5 text-dim">
            <span
              className="inline-block h-0 w-4 border-t-2"
              style={{ borderColor: accent }}
            />
            Actual — {mode.label}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-line-soft bg-bg-2/40 p-2 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            committed
          </div>
          <div className="mt-0.5 font-mono text-sm text-text">{TOTAL} pts</div>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/40 p-2 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            delivered
          </div>
          <div className="mt-0.5 font-mono text-sm" style={{ color: accent }}>
            {delivered} pts
          </div>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/40 p-2 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            remaining
          </div>
          <div
            className="mt-0.5 font-mono text-sm"
            style={{ color: last > 0 ? WARN : "var(--color-text)" }}
          >
            {last} pts
          </div>
        </div>
      </div>

      <div className="thin-scroll mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="border-b border-line px-2 py-1 text-left font-mono text-[10px] uppercase tracking-widest text-faint">
                day
              </th>
              {remaining.map((_, d) => (
                <th
                  key={d}
                  className="border-b border-line px-1.5 py-1 font-mono text-faint"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line-soft">
              <td className="px-2 py-1 text-left font-mono text-faint">ideal</td>
              {IDEAL.map((v, d) => (
                <td key={d} className="px-1.5 py-1 font-mono text-faint">
                  {v}
                </td>
              ))}
            </tr>
            <tr>
              <td
                className="px-2 py-1 text-left font-mono"
                style={{ color: accent }}
              >
                actual
              </td>
              {remaining.map((v, d) => (
                <td key={d} className="px-1.5 py-1 font-mono text-text">
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-xl border p-3"
        style={{ borderColor: tint(finishColor, 45), background: tint(finishColor, 10) }}
      >
        <FinishIcon className="h-4 w-4 shrink-0" style={{ color: finishColor }} />
        <p className="text-sm font-medium" style={{ color: finishColor }}>
          {finishText}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          what a story point is
        </p>
        <p className="mt-1 text-sm leading-relaxed text-dim">
          Story points estimate relative effort and complexity in Fibonacci-ish
          steps (1, 2, 3, 5, 8), not hours. Velocity — points completed per
          sprint — is a forecasting tool for planning the next sprint, not a
          productivity score to inflate or game.
        </p>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {mode.status}
      </p>
    </div>
  );
}
