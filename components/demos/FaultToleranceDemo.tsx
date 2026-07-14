"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  LifeBuoy,
  Power,
  RefreshCw,
  Server,
  ServerOff,
  Timer,
  X,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "fragile" | "resilient";
type Tone = "neutral" | "warn" | "bad" | "good";
type CallStep = { label: string; tone: Tone };

const CATALOG = [
  { name: "Mechanical keyboard", price: 89 },
  { name: "4K monitor", price: 329 },
  { name: "USB-C hub", price: 42 },
  { name: "Desk mat", price: 24 },
];

const CALLS: Record<Mode, CallStep[]> = {
  fragile: [
    { label: "GET /recommendations", tone: "neutral" },
    { label: "no timeout set — the call waits on a dead service", tone: "warn" },
    { label: "connection error thrown, and nothing catches it", tone: "bad" },
    { label: "the whole page render aborts", tone: "bad" },
  ],
  resilient: [
    { label: "GET /recommendations", tone: "neutral" },
    { label: "timeout after 2s — the slow call fails fast", tone: "warn" },
    { label: "retry once for a transient blip — still failing", tone: "warn" },
    { label: "circuit breaker opens — stop hammering the dead service", tone: "warn" },
    { label: 'fall back to "Recommendations unavailable"', tone: "good" },
  ],
};

const PATTERNS = [
  {
    key: "timeout",
    icon: Timer,
    name: "Timeout",
    desc: "A slow call fails fast instead of hanging forever.",
  },
  {
    key: "retry",
    icon: RefreshCw,
    name: "Retry",
    desc: "Retry a transient blip once before giving up.",
  },
  {
    key: "circuit-breaker",
    icon: Power,
    name: "Circuit breaker",
    desc: "After repeated failures, stop calling the dead service.",
  },
  {
    key: "fallback",
    icon: LifeBuoy,
    name: "Graceful degradation",
    desc: "Serve a fallback so the rest of the page still works.",
  },
] as const;

function toneColor(tone: Tone): string {
  if (tone === "good") return GOOD;
  if (tone === "bad") return BAD;
  if (tone === "warn") return WARN;
  return "var(--color-faint)";
}

export default function FaultToleranceDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("fragile");
  const fragile = mode === "fragile";
  const calls = CALLS[mode];

  const modes: { key: Mode; label: string }[] = [
    { key: "fragile", label: "Fragile (no tolerance)" },
    { key: "resilient", label: "Fault-tolerant" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Fault tolerance: keep working when a dependency fails
      </h3>
      <p className="mt-1 text-sm text-dim">
        A web app needs a core service and a non-core one. The non-core service
        is down — watch what that does to the page in each mode.
      </p>

      <div className="mt-4 inline-flex flex-wrap gap-1.5">
        {modes.map((m) => {
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
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

      {/* Services */}
      <p className="mt-5 mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
        Services
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-2/50 p-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-text">
              <Server className="h-4 w-4" style={{ color: GOOD }} />
              Catalog service
            </span>
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{ background: tint(GOOD, 16), color: GOOD }}
            >
              <Check className="h-3 w-3" /> UP
            </span>
          </div>
          <p className="mt-1.5 text-xs text-dim">
            Core — the page needs this to render.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-bg-2/50 p-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-text">
              <ServerOff className="h-4 w-4" style={{ color: BAD }} />
              Recommendations
            </span>
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{ background: tint(BAD, 16), color: BAD }}
            >
              <X className="h-3 w-3" /> DOWN
            </span>
          </div>
          <p className="mt-1.5 text-xs text-dim">
            Non-core — nice to have, not essential.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* The failing call */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            The call to recommendations
          </p>
          <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-bg-2 p-3">
            {calls.map((c, i) => {
              const tc = toneColor(c.tone);
              return (
                <div
                  key={i}
                  className="rounded-lg border-l-2 py-1 pl-2.5 pr-2 font-mono text-xs leading-relaxed text-dim"
                  style={{ borderColor: tc, background: tint(tc, 8) }}
                >
                  {c.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* What the user sees */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            What the user sees
          </p>
          <div className="overflow-hidden rounded-xl border border-line bg-bg-2/50">
            <div className="flex items-center gap-1.5 border-b border-line-soft px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="ml-1 font-mono text-[10px] text-faint">shop.example</span>
            </div>

            {fragile ? (
              <div
                className="p-4 text-center"
                style={{ background: tint(BAD, 8) }}
              >
                <AlertTriangle className="mx-auto h-6 w-6" style={{ color: BAD }} />
                <p className="mt-1.5 text-sm font-semibold" style={{ color: BAD }}>
                  500 — page failed to render
                </p>
                <p className="mt-0.5 text-xs text-faint">
                  One failed dependency took the whole page down.
                </p>
              </div>
            ) : (
              <div className="p-3">
                <ul className="flex flex-col gap-1.5">
                  {CATALOG.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-md border border-line-soft px-2.5 py-1.5 text-xs text-text"
                    >
                      <span>{p.name}</span>
                      <span className="font-mono text-dim">${p.price}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-2 rounded-md border border-dashed px-2.5 py-2 text-center"
                  style={{ borderColor: tint(WARN, 45), background: tint(WARN, 8) }}
                >
                  <p className="inline-flex items-center gap-1.5 text-xs" style={{ color: WARN }}>
                    <LifeBuoy className="h-3.5 w-3.5" />
                    Recommendations unavailable
                  </p>
                  <p className="mt-0.5 text-[10px] text-faint">
                    section degraded — the rest of the page still works
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: fragile ? BAD : GOOD }}>
            {fragile
              ? "Broken: the user gets nothing."
              : "Usable: core catalog renders, recommendations degraded."}
          </p>
        </div>
      </div>

      {/* Patterns */}
      <p className="mt-5 mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
        Patterns applied
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PATTERNS.map((pat) => {
          const Icon = pat.icon;
          const applied = !fragile;
          const accent = applied ? GOOD : "var(--color-faint)";
          return (
            <div
              key={pat.key}
              className="flex items-start gap-2.5 rounded-xl border p-3"
              style={{
                borderColor: applied ? tint(GOOD, 35) : "var(--color-line)",
                background: applied ? tint(GOOD, 8) : "transparent",
              }}
            >
              <span
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                style={{ background: tint(applied ? GOOD : BAD, 14), color: accent }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text">{pat.name}</span>
                  <span
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]"
                    style={{
                      background: tint(applied ? GOOD : BAD, 16),
                      color: applied ? GOOD : BAD,
                    }}
                  >
                    {applied ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {applied ? "applied" : "off"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-dim">{pat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {fragile
          ? "Fragile: recommendations is down and the page called it with no timeout, so one dead dependency cascaded into a full outage. Fault tolerance means isolating failures so that cannot happen."
          : "Fault-tolerant: timeout, retry, circuit breaker and a fallback contain the failure — the core catalog still renders while recommendations is quietly degraded. The system keeps delivering a reduced but working service instead of going down."}
      </p>
    </div>
  );
}
