"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, ScrollText, Waypoints } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Pillar = "metrics" | "logs" | "traces";

type Tab = { key: Pillar; label: string; Icon: LucideIcon; role: string };

const TABS: Tab[] = [
  {
    key: "metrics",
    label: "Metrics",
    Icon: BarChart3,
    role: "Metrics are aggregate numbers over time. They tell you THAT something is wrong and when it started — perfect for alerts and trends, but not why.",
  },
  {
    key: "logs",
    label: "Logs",
    Icon: ScrollText,
    role: "Logs are discrete timestamped events. They tell you the specific errors that happened and are searchable — but they get noisy at scale.",
  },
  {
    key: "traces",
    label: "Traces",
    Icon: Waypoints,
    role: "A trace follows one request across services. It shows you WHERE the time went — here, the database span is the culprit.",
  },
];

// Deterministic sample data for a single incident: /checkout got slow at 14:03.
const LATENCY: { t: string; ms: number; spike?: boolean }[] = [
  { t: "14:00", ms: 205 },
  { t: "14:01", ms: 210 },
  { t: "14:02", ms: 198 },
  { t: "14:03", ms: 1200, spike: true },
  { t: "14:04", ms: 1150 },
  { t: "14:05", ms: 1180 },
];

const LOGS: { time: string; level: "INFO" | "WARN" | "ERROR"; msg: string }[] = [
  { time: "14:03:11", level: "INFO", msg: "POST /checkout received user=42" },
  { time: "14:03:12", level: "WARN", msg: "db query slow 900ms user=42" },
  { time: "14:03:12", level: "ERROR", msg: "checkout failed: upstream timeout user=42" },
  { time: "14:03:13", level: "INFO", msg: "POST /checkout received user=88" },
  { time: "14:03:14", level: "WARN", msg: "db query slow 870ms user=88" },
  { time: "14:03:15", level: "INFO", msg: "GET /health 200 ok" },
];

const SPANS: { name: string; start: number; dur: number; culprit?: boolean }[] = [
  { name: "api-gateway", start: 0, dur: 20 },
  { name: "orders-svc", start: 20, dur: 30 },
  { name: "db query", start: 50, dur: 900, culprit: true },
  { name: "payment-svc", start: 950, dur: 40 },
];

const MAX_MS = Math.max(...LATENCY.map((d) => d.ms));
const TRACE_TOTAL = 990;

export default function ObservabilityDemo({ color }: { color: string }) {
  const [tab, setTab] = useState<Pillar>("metrics");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The three pillars of observability</h3>
      <p className="mt-1 text-sm text-dim">
        The checkout endpoint suddenly got slow. Here is what each pillar tells
        you about the same incident.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const on = t.key === tab;
          const Icon = t.Icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "metrics" && (
        <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              p95 latency · /checkout (ms)
            </p>
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{ background: tint(BAD, 16), color: BAD }}
            >
              spike at 14:03
            </span>
          </div>

          <div className="mt-3 flex h-32 items-end gap-2">
            {LATENCY.map((d) => (
              <div key={d.t} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className="font-mono text-[10px]"
                  style={{ color: d.spike ? BAD : "var(--color-faint)" }}
                >
                  {d.ms}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(d.ms / MAX_MS) * 100}%`,
                      background: d.spike ? BAD : tint(color, 40),
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-faint">{d.t}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-line-soft p-3">
              <p className="text-[11px] text-faint">p95 latency</p>
              <p className="mt-0.5 font-mono text-text">
                200ms <span style={{ color: BAD }}>→ 1200ms</span>
              </p>
            </div>
            <div className="rounded-lg border border-line-soft p-3">
              <p className="text-[11px] text-faint">error rate</p>
              <p className="mt-0.5 font-mono text-text">
                0.2% <span style={{ color: BAD }}>→ 4.8%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            application logs · grep /checkout
          </p>
          <div className="thin-scroll overflow-x-auto">
            <div className="flex min-w-max flex-col gap-1 font-mono text-xs">
              {LOGS.map((l, i) => {
                const c =
                  l.level === "ERROR"
                    ? BAD
                    : l.level === "WARN"
                      ? WARN
                      : "var(--color-faint)";
                return (
                  <div key={i} className="flex items-center gap-3 whitespace-nowrap">
                    <span className="text-faint">{l.time}</span>
                    <span className="w-12 font-semibold" style={{ color: c }}>
                      {l.level}
                    </span>
                    <span className="text-dim">{l.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "traces" && (
        <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-faint">
            trace · one checkout request · {TRACE_TOTAL}ms total
          </p>
          <div className="flex flex-col gap-2">
            {SPANS.map((s) => (
              <div
                key={s.name}
                className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 sm:grid-cols-[8rem_1fr_auto]"
              >
                <span className="truncate font-mono text-xs text-dim">{s.name}</span>
                <div
                  className="relative h-5 overflow-hidden rounded"
                  style={{ background: "var(--color-line-soft)" }}
                >
                  <div
                    className="absolute inset-y-0 rounded"
                    style={{
                      left: `${(s.start / TRACE_TOTAL) * 100}%`,
                      width: `${(s.dur / TRACE_TOTAL) * 100}%`,
                      minWidth: "0.35rem",
                      background: s.culprit ? BAD : tint(color, 60),
                    }}
                  />
                </div>
                <span
                  className="whitespace-nowrap font-mono text-[10px]"
                  style={{ color: s.culprit ? BAD : "var(--color-faint)" }}
                >
                  {s.dur}ms{s.culprit ? " · culprit" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p
        className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span>
          <span className="font-medium text-text">{active.label}:</span> {active.role}
        </span>
      </p>

      <p className="mt-2 text-xs leading-relaxed text-faint">
        Metrics flag that something broke; logs and traces explain why and where.
        You need all three, and the color coding is backed by labels like{" "}
        <span style={{ color: GOOD }}>OK</span>,{" "}
        <span style={{ color: WARN }}>WARN</span>, and{" "}
        <span style={{ color: BAD }}>ERROR</span> so meaning never rides on color
        alone.
      </p>
    </div>
  );
}
