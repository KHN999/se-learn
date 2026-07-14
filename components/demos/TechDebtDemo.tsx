"use client";

import { useState } from "react";
import { Bug, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Mode = "ignore" | "refactor";

type Series = {
  key: Mode;
  label: string;
  velocity: number[]; // features shipped that sprint
  bugs: number[]; // fresh bugs that sprint
};

const SPRINTS = [1, 2, 3, 4, 5, 6, 7, 8];

// Deterministic, hand-picked data. Ignore-debt starts fast then the interest
// compounds; refactor pays a small steady tax and holds a flat, clean line.
const IGNORE: Series = {
  key: "ignore",
  label: "Ignore debt",
  velocity: [8, 8, 7, 6, 5, 3, 2, 2],
  bugs: [1, 2, 3, 4, 6, 8, 10, 12],
};
const REFACTOR: Series = {
  key: "refactor",
  label: "Refactor regularly",
  velocity: [6, 6, 6, 6, 6, 6, 6, 6],
  bugs: [2, 1, 1, 1, 1, 1, 1, 1],
};
const MODES = [IGNORE, REFACTOR];

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

// First sprint where the refactoring team strictly out-ships the shortcut team.
const crossIdx = IGNORE.velocity.findIndex(
  (v, i) => REFACTOR.velocity[i] > v,
);

// Chart geometry (viewBox units).
const W = 340;
const H = 180;
const PADL = 12;
const PADR = 12;
const PADT = 18;
const PADB = 28;
const MAXY = 8;
const N = SPRINTS.length;
const x = (i: number) => PADL + (i / (N - 1)) * (W - PADL - PADR);
const y = (v: number) => PADT + (1 - v / MAXY) * (H - PADT - PADB);
const line = (arr: number[]) =>
  arr.map((v, i) => `${x(i)},${y(v)}`).join(" ");

const STATUS: Record<Mode, string> = {
  ignore:
    "Skipping cleanup buys real speed at first, then the interest compounds — each change fights the last shortcut until the team crawls. Tech debt is a genuine, compounding cost.",
  refactor:
    "A small, steady tax keeps the codebase changeable, so delivery stays sustainable over the long run. The goal is not zero debt — it is a pace the team can hold, which is what keeps a codebase changeable.",
};

const VERDICT: Record<Mode, string> = {
  ignore:
    "Interest on the debt: velocity falls and bugs climb, so everything takes longer.",
  refactor:
    "Sustainable pace: the code stays clean, so velocity holds and bugs stay low.",
};

export default function TechDebtDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("ignore");

  const active = mode === "ignore" ? IGNORE : REFACTOR;
  const other = mode === "ignore" ? REFACTOR : IGNORE;
  const activeColor = mode === "ignore" ? BAD : GOOD;
  const otherColor = mode === "ignore" ? GOOD : BAD;
  const crossSprint = SPRINTS[crossIdx];

  const ariaLabel = `Line chart of features shipped per sprint across ${N} sprints. Ignore debt starts at ${IGNORE.velocity[0]} and falls to ${IGNORE.velocity[N - 1]}. Refactor regularly holds near ${REFACTOR.velocity[0]}. Refactoring overtakes at sprint ${crossSprint}.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Tech debt slows you down; refactoring pays it back
      </h3>
      <p className="mt-1 text-sm text-dim">
        Two teams, the same eight sprints. One takes shortcuts and ignores the
        debt; the other refactors a little every sprint. Toggle to compare.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-xs text-faint">mode</span>
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? {
                      background: tint(color, 16),
                      color,
                      borderColor: tint(color, 45),
                    }
                  : {
                      color: "var(--color-dim)",
                      borderColor: "var(--color-line)",
                    }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        features shipped per sprint
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {/* baseline */}
        <line
          x1={PADL}
          y1={y(0)}
          x2={W - PADR}
          y2={y(0)}
          strokeWidth={1}
          style={{ stroke: "var(--color-line)" }}
        />

        {/* crossover guide */}
        <line
          x1={x(crossIdx)}
          y1={PADT}
          x2={x(crossIdx)}
          y2={y(0)}
          stroke={WARN}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.75}
        />
        <text
          x={x(crossIdx)}
          y={PADT - 6}
          textAnchor="middle"
          fontSize="8"
          fill={WARN}
        >
          refactor overtakes
        </text>

        {/* the non-selected team, faded and dashed */}
        <polyline
          points={line(other.velocity)}
          fill="none"
          stroke={otherColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.4}
        />

        {/* the selected team, solid and emphasized */}
        <polyline
          points={line(active.velocity)}
          fill="none"
          stroke={activeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {active.velocity.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={2.6} fill={activeColor} />
        ))}

        {/* sprint labels */}
        {SPRINTS.map((s, i) => (
          <text
            key={s}
            x={x(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize="8"
            style={{ fill: "var(--color-faint)" }}
          >
            {s}
          </text>
        ))}
      </svg>

      {/* legend — solid vs dashed, so the two teams read without relying on color */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dim">
        <span className="inline-flex items-center gap-1.5">
          <svg width="22" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="22"
              y2="3"
              stroke={BAD}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={mode === "ignore" ? undefined : "4 3"}
            />
          </svg>
          Ignore debt
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="22" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="22"
              y2="3"
              stroke={GOOD}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={mode === "refactor" ? undefined : "4 3"}
            />
          </svg>
          Refactor regularly
        </span>
        <span className="inline-flex items-center gap-1.5 text-faint">
          <svg width="14" height="10" aria-hidden="true">
            <line
              x1="7"
              y1="0"
              x2="7"
              y2="10"
              stroke={WARN}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>
          crossover at sprint {crossSprint}
        </span>
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
        style={{ borderColor: tint(activeColor, 45), background: tint(activeColor, 10) }}
      >
        {mode === "ignore" ? (
          <TrendingDown
            className="h-4 w-4 shrink-0"
            style={{ color: activeColor }}
            aria-hidden="true"
          />
        ) : (
          <TrendingUp
            className="h-4 w-4 shrink-0"
            style={{ color: activeColor }}
            aria-hidden="true"
          />
        )}
        <span className="text-sm text-text">{VERDICT[mode]}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            shipped (8 sprints)
          </p>
          <p className="mt-1 font-mono text-lg text-text">
            {sum(active.velocity)}
          </p>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            sprint 8 pace
          </p>
          <p className="mt-1 font-mono text-lg" style={{ color: activeColor }}>
            {active.velocity[N - 1]}
            <span className="text-xs text-faint"> /sprint</span>
          </p>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-faint">
            <Bug className="h-3 w-3" aria-hidden="true" /> bugs total
          </p>
          <p className="mt-1 font-mono text-lg" style={{ color: activeColor }}>
            {sum(active.bugs)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-text">
          <Wrench className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
          What refactoring actually is
        </p>
        <p className="mt-1 text-sm leading-relaxed text-dim">
          Improving the internal structure without changing what the software
          does — carried out under tests, so every small step stays safe.
          Before: tangled code that fights each change. After: the same behavior,
          now easy to extend.
        </p>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {STATUS[mode]}
      </p>
    </div>
  );
}
