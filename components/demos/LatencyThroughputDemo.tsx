"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Gauge, Timer, TrendingDown, TrendingUp } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

type Mode = "sequential" | "batched";

type Strategy = {
  key: Mode;
  label: string;
  short: string;
  latency: number; // milliseconds to finish one request
  throughput: number; // requests finished per second
  lanes: number[][]; // task numbers, grouped by worker
  laneNote: string;
  status: string;
};

const STRATEGIES: Strategy[] = [
  {
    key: "sequential",
    label: "One at a time (low latency)",
    short: "batched",
    latency: 100,
    throughput: 10,
    lanes: [[1, 2, 3, 4, 5, 6, 7, 8]],
    laneNote:
      "1 worker, single file: each request is served in about 100ms, but all eight line up, so only about ten finish every second.",
    status:
      "One at a time: each request finishes in about 100ms, so a person waiting on a single page feels the app as snappy. But the system clears only about 10 requests per second, so a large job crawls. Reach for this when one waiting user is what matters — latency wins.",
  },
  {
    key: "batched",
    label: "Batched / parallel (high throughput)",
    short: "serial",
    latency: 300,
    throughput: 80,
    lanes: [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
    ],
    laneNote:
      "4 workers in parallel: the eight tasks clear fast, but each one waits for its batch, so a single request now takes about 300ms.",
    status:
      "Batched and parallel: the system clears about 80 requests per second, so a big batch job finishes far sooner. But each individual request now waits in a queue for about 300ms, so it feels slower to one waiting person. Reach for this when total volume is what matters — throughput wins.",
  },
];

function Metric({
  name,
  value,
  unit,
  good,
  delta,
  deltaUnit,
  otherLabel,
  Icon,
}: {
  name: string;
  value: number;
  unit: string;
  good: boolean;
  delta: number;
  deltaUnit: string;
  otherLabel: string;
  Icon: LucideIcon;
}) {
  const accent = good ? GOOD : WARN;
  const up = delta > 0;
  const Dir = up ? TrendingUp : TrendingDown;
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: tint(accent, 40), background: tint(accent, 8) }}
    >
      <div className="flex items-center gap-1.5 text-xs text-dim">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {name}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums text-text">
          {value}
        </span>
        <span className="text-xs text-dim">{unit}</span>
      </div>
      <div
        className="mt-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium"
        style={{ color: accent, background: tint(accent, 14) }}
      >
        {good ? "the win here" : "the tradeoff"}
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-faint">
        <Dir className="h-3 w-3" aria-hidden="true" />
        {Math.abs(delta)}
        {deltaUnit} {up ? "higher" : "lower"} than {otherLabel}
      </p>
    </div>
  );
}

export default function LatencyThroughputDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("sequential");
  const selected = STRATEGIES.find((s) => s.key === mode) ?? STRATEGIES[0];
  const other = STRATEGIES.find((s) => s.key !== mode) ?? STRATEGIES[1];

  const latencyGood = selected.latency <= other.latency;
  const throughputGood = selected.throughput >= other.throughput;
  const latencyDelta = selected.latency - other.latency;
  const throughputDelta = selected.throughput - other.throughput;
  const chipWidth = mode === "batched" ? 56 : 34;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Latency and throughput are not the same
      </h3>
      <p className="mt-1 text-sm text-dim">
        Latency is the time to finish one request. Throughput is how many
        requests finish each second. Improving one can quietly hurt the other.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text">
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
            Latency
          </div>
          <p className="mt-1 text-xs text-dim">
            Time to complete one request, start to finish. Lower is faster for a
            single waiting user.
          </p>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text">
            <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
            Throughput
          </div>
          <p className="mt-1 text-xs text-dim">
            How many requests finish each second. Higher means more total work
            gets done.
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">
        Picture a highway. Latency is how long your own car takes to drive the
        route; throughput is how many cars pass the exit each second. Adding
        lanes moves more cars per second, but it does not make your drive any
        shorter — and heavy batching can leave your car idling in a queue.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {STRATEGIES.map((s) => {
          const on = s.key === mode;
          return (
            <button
              key={s.key}
              onClick={() => setMode(s.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
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
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric
          name="Latency"
          value={selected.latency}
          unit="ms / request"
          good={latencyGood}
          delta={latencyDelta}
          deltaUnit="ms"
          otherLabel={other.short}
          Icon={Timer}
        />
        <Metric
          name="Throughput"
          value={selected.throughput}
          unit="requests / second"
          good={throughputGood}
          delta={throughputDelta}
          deltaUnit=" req/s"
          otherLabel={other.short}
          Icon={Gauge}
        />
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="text-xs font-medium text-text">
          Tuning for throughput by batching can worsen latency, and tuning for
          latency can waste throughput. They trade off — you rarely get both.
        </p>
        <p className="mt-1 text-xs text-dim">
          A user waiting on one page cares about latency. A batch job chewing
          through millions of rows cares about throughput.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          8 tasks flowing through
        </p>
        <div className="flex flex-col gap-2">
          {selected.lanes.map((lane, li) => (
            <div key={`lane-${li}`} className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono text-[10px] text-faint">
                worker {li + 1}
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-1.5">
                {lane.map((t) => (
                  <div
                    key={t}
                    className="grid h-8 place-items-center rounded-md border font-mono text-xs text-text"
                    style={{
                      width: chipWidth,
                      borderColor: tint(color, 45),
                      background: tint(color, 14),
                    }}
                  >
                    {t}
                  </div>
                ))}
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-faint"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] text-faint">done</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-dim">{selected.laneNote}</p>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {selected.status}
      </p>
    </div>
  );
}
