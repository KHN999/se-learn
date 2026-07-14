"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Gauge,
  Package,
  Repeat,
  SearchCheck,
  Server,
  Wifi,
  X,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "real" | "mock";
type Tone = typeof GOOD | typeof BAD | typeof WARN;

function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  const Icon = tone === GOOD ? Check : tone === BAD ? X : AlertTriangle;
  return <Icon className={className} style={{ color: tone }} />;
}

type Row = {
  label: string;
  DimIcon: typeof Check;
  real: { text: string; tone: Tone };
  mock: { text: string; tone: Tone };
};

const ROWS: Row[] = [
  {
    label: "Speed",
    DimIcon: Gauge,
    real: { text: "~800 ms per run", tone: BAD },
    mock: { text: "instant (<1 ms)", tone: GOOD },
  },
  {
    label: "Network",
    DimIcon: Wifi,
    real: { text: "required to pass", tone: BAD },
    mock: { text: "none needed", tone: GOOD },
  },
  {
    label: "Side effects",
    DimIcon: CreditCard,
    real: { text: "charges a real card", tone: BAD },
    mock: { text: "no real charge", tone: GOOD },
  },
  {
    label: "Determinism",
    DimIcon: Repeat,
    real: { text: "flaky / nondeterministic", tone: BAD },
    mock: { text: "same result every run", tone: GOOD },
  },
  {
    label: "Verify the call",
    DimIcon: SearchCheck,
    real: { text: "black box, cannot assert", tone: WARN },
    mock: { text: "asserts charge(4200)", tone: GOOD },
  },
];

const CODE: Record<Mode, string> = {
  real: `test("checkout charges the order total", () => {
  const gateway = realGateway;        // hits the network
  const result = checkout(order, gateway);

  expect(result.paid).toBe(true);
  // no way to assert the amount —
  // the real gateway is a black box
});`,
  mock: `const mockGateway = {
  charge: () => ({ success: true, id: "ch_123" }),
};

test("checkout charges the order total", () => {
  const gateway = mockGateway;        // canned stand-in
  const result = checkout(order, gateway);

  expect(result.paid).toBe(true);
  expect(mockGateway.charge).calledWith(4200);
});`,
};

const STATUS: Record<Mode, string> = {
  real: "Calling the real PaymentGateway makes this a slow, networked, flaky test that can charge a real card — the wrong tool for a unit test.",
  mock: "The mock returns a canned reply instantly, needs no network, charges nothing, and lets you assert that checkout called charge(4200) — fast and repeatable.",
};

const LESSON =
  "Rule of thumb: mock the boundaries you do not control — network, time, randomness, payments — so you can test your own logic fast and repeatably. But do not over-mock: replace everything and the test proves nothing real.";

export default function MockingDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("real");
  const isReal = mode === "real";
  const verdictTone: Tone = isReal ? BAD : GOOD;
  const verdictText = isReal ? "Bad fit for a unit test" : "Good unit test";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Mock a dependency to test in isolation
      </h3>
      <p className="mt-1 text-sm text-dim">
        The unit under test is checkout(order), which calls an external
        PaymentGateway. Swap the real gateway for a mock and watch what happens
        to the test.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div
          className="flex overflow-hidden rounded-lg border border-line"
          role="group"
          aria-label="dependency mode"
        >
          {(["real", "mock"] as const).map((m) => {
            const on = mode === m;
            const Icon = m === "real" ? Server : Package;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  on
                    ? { background: tint(color, 16), color }
                    : { color: "var(--color-faint)" }
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {m === "real" ? "Real dependency" : "Mock"}
              </button>
            );
          })}
        </div>

        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium"
          style={{
            background: tint(verdictTone, 14),
            color: verdictTone,
            borderColor: tint(verdictTone, 40),
          }}
        >
          <ToneIcon tone={verdictTone} className="h-3.5 w-3.5" />
          {verdictText}
        </span>
      </div>

      <pre className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
        {CODE[mode]}
      </pre>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ROWS.map((row) => {
          const cell = isReal ? row.real : row.mock;
          const DimIcon = row.DimIcon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-bg-2/50 px-3 py-2"
            >
              <span className="inline-flex items-center gap-2 text-sm text-dim">
                <DimIcon className="h-3.5 w-3.5 text-faint" />
                {row.label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-right font-mono text-xs"
                style={{ color: cell.tone }}
              >
                <ToneIcon tone={cell.tone} className="h-3.5 w-3.5" />
                {cell.text}
              </span>
            </div>
          );
        })}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {STATUS[mode]} {LESSON}
      </p>
    </div>
  );
}
