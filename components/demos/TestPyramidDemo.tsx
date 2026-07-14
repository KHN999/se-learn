"use client";

import { useState } from "react";
import { Check, Code2, Link2, Monitor, type LucideIcon } from "lucide-react";
import { tint } from "@/lib/curriculum";

type LayerKey = "unit" | "integration" | "e2e";

type Layer = {
  key: LayerKey;
  name: string;
  icon: LucideIcon;
  width: string; // bar width reflects how many you write
  dots: number;
  howMany: string;
  speed: string;
  cost: string;
  realism: string;
  checks: string;
  takeaway: string;
};

// Ordered base -> top. The pyramid is rendered reversed so the narrow tip sits
// on top and the wide, numerous unit layer forms the base.
const LAYERS: Layer[] = [
  {
    key: "unit",
    name: "Unit",
    icon: Code2,
    width: "100%",
    dots: 8,
    howMany: "Many",
    speed: "Milliseconds",
    cost: "Cheap",
    realism: "Low — one piece, isolated",
    checks:
      "One function or unit on its own — given these inputs, does it return the right output? Its dependencies are stubbed out so nothing else can interfere.",
    takeaway:
      "Unit tests are fast and cheap, so write lots of them — they pin down each piece of logic in isolation.",
  },
  {
    key: "integration",
    name: "Integration",
    icon: Link2,
    width: "70%",
    dots: 4,
    howMany: "Some",
    speed: "Seconds",
    cost: "Medium",
    realism: "Medium — parts wired together",
    checks:
      "That components work together across a real seam — a service talking to a real database, or two modules calling each other — not just each part alone.",
    takeaway:
      "Integration tests catch the bugs that live between the parts, where units that each pass can still fail together. Keep a solid middle layer.",
  },
  {
    key: "e2e",
    name: "End-to-end",
    icon: Monitor,
    width: "46%",
    dots: 2,
    howMany: "A handful",
    speed: "Slow — seconds to minutes, and flakier",
    cost: "Expensive",
    realism: "Highest — the whole app, like a user",
    checks:
      "The whole application from the outside — driving the real interface the way a user would, through to the database and back — to prove the critical journeys actually work.",
    takeaway:
      "End-to-end tests give the most confidence but are slow and brittle, so keep them to a handful of critical paths.",
  },
];

const GUIDANCE =
  "The shape is the point: lots of unit tests at the base, fewer integration tests, and a handful of end-to-end tests on top. Flip it into an inverted pyramid — mostly end-to-end — and the suite turns slow, flaky, and painful to maintain.";

export default function TestPyramidDemo({ color }: { color: string }) {
  const [selected, setSelected] = useState<LayerKey>("unit");
  const current = LAYERS.find((l) => l.key === selected) ?? LAYERS[0];

  const stats: { label: string; value: string; dots?: number }[] = [
    { label: "How many", value: current.howMany, dots: current.dots },
    { label: "Speed", value: current.speed },
    { label: "Cost & upkeep", value: current.cost },
    { label: "Realism", value: current.realism },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The testing pyramid</h3>
      <p className="mt-1 text-sm text-dim">
        Three kinds of test, stacked by how many you should write. Pick a layer
        to see what it costs and what it actually proves.
      </p>

      <div className="mt-5 flex flex-col items-center gap-1.5">
        {[...LAYERS].reverse().map((layer) => {
          const on = layer.key === selected;
          const Icon = layer.icon;
          return (
            <button
              key={layer.key}
              onClick={() => setSelected(layer.key)}
              aria-pressed={on}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border font-medium transition-colors"
              style={{
                width: layer.width,
                minWidth: "9rem",
                background: on ? tint(color, 16) : "var(--color-bg-2)",
                borderColor: on ? tint(color, 55) : "var(--color-line)",
                color: on ? color : "var(--color-dim)",
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap text-sm">{layer.name}</span>
              {on ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
        width = how many you write
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line-soft bg-bg-2/50 p-3"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {s.label}
            </p>
            <p className="mt-1 text-sm text-text">{s.value}</p>
            {s.dots !== undefined ? (
              <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
                {Array.from({ length: s.dots }).map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          What it checks
        </p>
        <p className="mt-1 text-sm leading-relaxed text-dim">{current.checks}</p>
      </div>

      <p
        className="mt-4 rounded-lg border-l-2 px-3 py-2 text-sm leading-relaxed text-text"
        role="status"
        aria-live="polite"
        style={{ borderColor: color, background: tint(color, 8) }}
      >
        <span className="font-semibold">{current.name} tests:</span>{" "}
        {current.takeaway}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-dim">{GUIDANCE}</p>
    </div>
  );
}
