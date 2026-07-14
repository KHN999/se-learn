"use client";

import { useState } from "react";
import { Building2, Check, Cloud, TriangleAlert, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Sentiment = "good" | "warn" | "bad";
type Mode = "onprem" | "cloud";
type Cell = { sentiment: Sentiment; value: string };
type Dimension = { label: string; onprem: Cell; cloud: Cell };

const SENTIMENT: Record<
  Sentiment,
  { color: string; label: string; Icon: typeof Check }
> = {
  good: { color: GOOD, label: "Strength", Icon: Check },
  warn: { color: WARN, label: "Trade-off", Icon: TriangleAlert },
  bad: { color: BAD, label: "Weakness", Icon: X },
};

const MODES: { key: Mode; label: string; Icon: typeof Cloud }[] = [
  { key: "onprem", label: "On-prem (buy servers)", Icon: Building2 },
  { key: "cloud", label: "Cloud (rent)", Icon: Cloud },
];

const DIMENSIONS: Dimension[] = [
  {
    label: "Upfront cost",
    onprem: {
      sentiment: "bad",
      value: "Large capital purchase plus data-center space (CAPEX).",
    },
    cloud: {
      sentiment: "good",
      value: "Almost none — you pay as you go (OPEX).",
    },
  },
  {
    label: "Time to add capacity",
    onprem: {
      sentiment: "bad",
      value: "Weeks — order, rack, and cable the hardware.",
    },
    cloud: {
      sentiment: "good",
      value: "Minutes — one API call, or autoscale does it for you.",
    },
  },
  {
    label: "Handling a traffic spike",
    onprem: {
      sentiment: "warn",
      value:
        "You must pre-buy peak capacity: idle and wasted most of the time, or you fall over.",
    },
    cloud: {
      sentiment: "good",
      value: "Elastic — scale up for the spike, then scale back down.",
    },
  },
  {
    label: "Maintenance",
    onprem: {
      sentiment: "bad",
      value: "You own power, cooling, hardware failures, and security.",
    },
    cloud: {
      sentiment: "good",
      value: "The provider handles the undifferentiated heavy lifting.",
    },
  },
  {
    label: "The flip side",
    onprem: {
      sentiment: "good",
      value:
        "Full control, no lock-in, and can be cheaper at steady, huge scale.",
    },
    cloud: {
      sentiment: "warn",
      value:
        "Ongoing cost can exceed owning at scale, plus vendor lock-in.",
    },
  },
];

function CellView({
  cell,
  active,
  accent,
}: {
  cell: Cell;
  active: boolean;
  accent: string;
}) {
  const sentiment = SENTIMENT[cell.sentiment];
  const Icon = sentiment.Icon;
  return (
    <div
      className="rounded-xl border p-3 transition-all"
      style={
        active
          ? { borderColor: tint(accent, 45), background: tint(accent, 8) }
          : {
              borderColor: "var(--color-line)",
              background: "transparent",
              opacity: 0.5,
            }
      }
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: sentiment.color }}
          aria-hidden="true"
        />
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: sentiment.color }}
        >
          {sentiment.label}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-dim">{cell.value}</p>
    </div>
  );
}

export default function CloudDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("cloud");

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        On-prem vs cloud: buy the servers or rent them
      </h3>
      <p className="mt-1 text-sm text-dim">
        A startup whose traffic keeps growing and spiking. Pick how it runs its
        infrastructure and compare the tradeoffs across each dimension.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {MODES.map((m) => {
          const on = m.key === mode;
          const Icon = m.Icon;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {DIMENSIONS.map((dim) => (
          <div key={dim.label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
              {dim.label}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <CellView
                cell={dim.onprem}
                active={mode === "onprem"}
                accent={color}
              />
              <CellView
                cell={dim.cloud}
                active={mode === "cloud"}
                accent={color}
              />
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {mode === "cloud"
          ? "Cloud trades ownership and CAPEX for elastic, pay-as-you-go rented infra managed by someone else — great for variable or uncertain load, but ongoing cost and lock-in are real."
          : "On-prem means you own everything — full control, no lock-in, and it can win at steady, huge scale — but you pay big upfront CAPEX, wait weeks to add capacity, and carry all the maintenance yourself."}
      </p>
    </div>
  );
}
