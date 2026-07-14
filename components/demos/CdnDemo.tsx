"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "nocdn" | "cdn";
type Cache = "HIT" | "MISS" | "—";

type Served = {
  id: number;
  city: string;
  path: "origin" | "edge";
  ms: number;
  cache: Cache;
};

type Step = { served: Served[]; cached: string[]; note: string };

// Edge locations sit near their users; the round trip to the far US origin is
// long, the trip to the local edge is short.
const EDGES = [
  { name: "London", originMs: 90, edgeMs: 12 },
  { name: "Tokyo", originMs: 180, edgeMs: 15 },
  { name: "Sydney", originMs: 200, edgeMs: 18 },
];

// A deterministic stream of requests. Regions repeat so a CDN can show a second
// (cached) visit landing as a HIT.
const SEQUENCE = ["London", "Tokyo", "London", "Sydney", "Tokyo", "Sydney"];

function edgeFor(city: string) {
  return EDGES.find((e) => e.name === city)!;
}

function makeNote(mode: Mode, city: string, cache: Cache, ms: number): string {
  if (mode === "nocdn") {
    return `${city} fetches the 2 MB bundle straight from the US origin — a ${ms} ms round trip. Every user pays it, and the origin serves all of them.`;
  }
  if (cache === "HIT") {
    return `${city} gets a cache HIT from the nearby ${city} edge — just ${ms} ms. The request never reaches the origin.`;
  }
  return `${city} is the first request in its region: a cache MISS. The ${city} edge pulls from the origin, stores a copy, and serves it in ${ms} ms. The next ${city} user will be fast.`;
}

function build(mode: Mode): Step[] {
  const steps: Step[] = [];
  const cached = new Set<string>();
  const served: Served[] = [];
  SEQUENCE.forEach((city, i) => {
    const edge = edgeFor(city);
    const hit = mode === "cdn" && cached.has(city);
    const path = hit ? "edge" : "origin";
    const cache: Cache = mode === "nocdn" ? "—" : hit ? "HIT" : "MISS";
    const ms = hit ? edge.edgeMs : edge.originMs;
    if (mode === "cdn" && !hit) cached.add(city);
    served.push({ id: i, city, path, ms, cache });
    steps.push({
      served: [...served],
      cached: [...cached],
      note: makeNote(mode, city, cache, ms),
    });
  });
  return steps;
}

function avgOf(served: Served[]): number {
  return Math.round(served.reduce((a, s) => a + s.ms, 0) / served.length);
}

function originOf(served: Served[]): number {
  return served.filter((s) => s.path === "origin").length;
}

const STEPS: Record<Mode, Step[]> = { nocdn: build("nocdn"), cdn: build("cdn") };

function finalStats(mode: Mode) {
  const s = STEPS[mode][STEPS[mode].length - 1].served;
  return { avg: avgOf(s), origin: originOf(s) };
}

const FINAL: Record<Mode, { avg: number; origin: number }> = {
  nocdn: finalStats("nocdn"),
  cdn: finalStats("cdn"),
};

const MODES: { key: Mode; label: string }[] = [
  { key: "nocdn", label: "No CDN" },
  { key: "cdn", label: "With CDN" },
];

export default function CdnDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("nocdn");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = STEPS[mode];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;
  const frame = steps[Math.min(step, steps.length - 1)];

  // Reset the walkthrough when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      900,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const served = frame.served;
  const current = served[served.length - 1];
  const avg = avgOf(served);
  const origin = originOf(served);
  const avgAccent = avg <= 50 ? GOOD : avg <= 120 ? WARN : BAD;
  const originAccent = origin < served.length ? GOOD : BAD;

  const statusText = atEnd
    ? `All ${served.length} requests done. Without a CDN every request crossed to the US origin, averaging ${FINAL.nocdn.avg} ms and leaving all ${FINAL.nocdn.origin} on the origin. With a CDN only ${FINAL.cdn.origin} reached the origin and the average fell to ${FINAL.cdn.avg} ms as regional edges served the repeat visits. A CDN caches static content on edge servers close to users to cut latency and offload the origin; set a TTL and invalidate the cache on each update so nobody is served a stale copy.`
    : frame.note;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        A CDN serves assets from the edge, near the user
      </h3>
      <p className="mt-1 text-sm text-dim">
        One origin in the US, three edge locations near users around the world.
        Step through the same requests with and without a CDN and watch the
        latency change.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" aria-hidden="true" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          request {step + 1} / {steps.length}
        </span>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> reset
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div
          className="flex items-center justify-between rounded-xl border p-3"
          style={{
            borderColor: tint(mode === "nocdn" ? BAD : WARN, 40),
            background: tint(mode === "nocdn" ? BAD : WARN, 8),
          }}
        >
          <div>
            <p className="text-sm font-medium text-text">Origin · United States</p>
            <p className="mt-0.5 text-xs text-dim">
              {mode === "nocdn"
                ? "Bears every request"
                : "Shielded — only cache misses reach it"}
            </p>
          </div>
          <div className="text-right">
            <p
              className="font-mono text-lg font-semibold tabular-nums"
              style={{ color: mode === "nocdn" ? BAD : WARN }}
            >
              {origin}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-faint">
              served
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {EDGES.map((e) => {
            const cachedHere = frame.cached.includes(e.name);
            const active = current.city === e.name;
            const stateText =
              mode === "nocdn" ? "bypassed" : cachedHere ? "cached" : "empty";
            const stateColor = cachedHere
              ? GOOD
              : mode === "nocdn"
                ? "var(--color-faint)"
                : "var(--color-faint)";
            const borderColor = cachedHere
              ? tint(GOOD, 45)
              : active && mode === "cdn"
                ? tint(WARN, 45)
                : "var(--color-line)";
            const background = cachedHere
              ? tint(GOOD, 8)
              : active && mode === "cdn"
                ? tint(WARN, 8)
                : "var(--color-bg-2)";
            return (
              <div
                key={e.name}
                className="rounded-xl border p-3 transition-colors"
                style={{
                  borderColor,
                  background,
                  opacity: mode === "nocdn" ? 0.55 : 1,
                }}
              >
                <p className="text-xs font-medium text-text">{e.name} edge</p>
                <p
                  className="mt-1 text-[11px] font-medium"
                  style={{ color: stateColor }}
                >
                  {stateText}
                </p>
                <p className="mt-1 font-mono text-[10px] text-faint">
                  ~{e.edgeMs} ms local
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          requests served so far
        </p>
        <div className="flex flex-col gap-1.5">
          {served.map((s) => {
            const isCurrent = s.id === current.id;
            const rowAccent =
              s.path === "edge" ? GOOD : mode === "cdn" ? WARN : BAD;
            const target =
              s.path === "origin" ? "Origin · US" : `${s.city} edge`;
            const badge = mode === "nocdn" ? "far trip" : s.cache;
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: isCurrent ? color : "var(--color-line-soft)",
                  background: isCurrent ? tint(color, 8) : "transparent",
                }}
              >
                <span className="font-mono text-[11px] text-faint">
                  #{s.id + 1}
                </span>
                <span className="font-medium text-text">{s.city}</span>
                <span className="text-faint">→</span>
                <span className="text-dim">{target}</span>
                <span
                  className="ml-auto font-mono text-xs font-semibold tabular-nums"
                  style={{ color: rowAccent }}
                >
                  {s.ms} ms
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{ color: rowAccent, background: tint(rowAccent, 14) }}
                >
                  {badge}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[11px] text-faint">
          First request in a region is a MISS (fetched from origin, then cached);
          later requests are a HIT from the local edge.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: tint(originAccent, 40), background: tint(originAccent, 8) }}
        >
          <p className="text-xs text-dim">Origin requests</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
            {origin}
            <span className="text-sm text-dim"> / {served.length}</span>
          </p>
          <p className="mt-1 text-[11px]" style={{ color: originAccent }}>
            {mode === "nocdn"
              ? "every request hits the origin"
              : origin < served.length
                ? "edges shield the origin"
                : "warming the cache"}
          </p>
        </div>
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: tint(avgAccent, 40), background: tint(avgAccent, 8) }}
        >
          <p className="text-xs text-dim">Average latency</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
            {avg}
            <span className="text-sm text-dim"> ms</span>
          </p>
          <p className="mt-1 text-[11px]" style={{ color: avgAccent }}>
            {avgAccent === GOOD
              ? "fast — mostly local edge hits"
              : avgAccent === WARN
                ? "mixed — some far origin trips"
                : "slow — every trip crosses the world"}
          </p>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {statusText}
      </p>
    </div>
  );
}
