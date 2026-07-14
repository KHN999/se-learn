"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

// A bursty workload: idle, a spike, then idle again. Each unit is roughly one
// concurrent request at that moment in the timeline.
const TRAFFIC = [0, 0, 2, 9, 14, 7, 1, 0, 0];
const SERVER_CAPACITY = 10; // what one always-on server can serve at once
const MAX_UNITS = 14; // the spike — fixes the chart scale
const COST_PER_STEP_CENTS = 50; // always-on: billed for every tick it runs
const COST_PER_REQ_CENTS = 5; // serverless: billed only per invocation

type Mode = "server" | "serverless";

const isColdStart = (t: number) =>
  TRAFFIC[t] > 0 && (t === 0 || TRAFFIC[t - 1] === 0);

const cumReq = (t: number) =>
  TRAFFIC.slice(0, t + 1).reduce((s, v) => s + v, 0);

const alwaysCents = (t: number) => (t + 1) * COST_PER_STEP_CENTS;
const serverlessCents = (t: number) => cumReq(t) * COST_PER_REQ_CENTS;
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function ServerlessDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("serverless");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step >= TRAFFIC.length - 1;
  const isPlaying = playing && !atEnd;

  // Restart the timeline when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, TRAFFIC.length - 1)),
      800,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const serverless = mode === "serverless";
  const now = TRAFFIC[step];
  const served = serverless ? now : Math.min(now, SERVER_CAPACITY);
  const overflow = serverless ? 0 : Math.max(0, now - SERVER_CAPACITY);
  const cold = serverless && isColdStart(step);
  const instances = serverless ? now : 1;
  const costCents = serverless ? serverlessCents(step) : alwaysCents(step);
  const otherCents = serverless ? alwaysCents(step) : serverlessCents(step);

  const note = (() => {
    if (serverless) {
      if (now === 0)
        return "Idle: zero instances running. Serverless scaled to zero, so right now you pay nothing.";
      if (cold)
        return `Traffic returns after idle, so the platform boots a fresh instance — this first call pays a cold start (extra latency while it warms up). Now serving ${now}.`;
      return `${now} instances running, one per concurrent request — auto-scaled to match demand. You are billed only for these invocations.`;
    }
    if (now === 0)
      return "Idle: no requests arriving, but the server keeps running — you pay for it whether or not anyone calls.";
    if (overflow > 0)
      return `Spike of ${now} requests, but one server tops out at ${SERVER_CAPACITY} — ${overflow} requests are queued or dropped. Avoiding this means over-provisioning: paying for even more idle capacity.`;
    return `Serving ${served} of ${SERVER_CAPACITY} capacity. Fine for now, but that capacity is fixed and paid for around the clock.`;
  })();

  const closing = serverless
    ? " Tradeoff: no idle cost and instant autoscaling — at the price of cold starts, execution limits, and less control over the runtime."
    : " Tradeoff: full control and no cold starts — but you pay around the clock and one box has a hard capacity ceiling.";
  const status = atEnd ? note + closing : note;

  const modes: { k: Mode; l: string }[] = [
    { k: "server", l: "Always-on server" },
    { k: "serverless", l: "Serverless functions" },
  ];

  const legend: { t: string; sw: CSSProperties }[] = serverless
    ? [
        { t: "serving", sw: { background: GOOD } },
        { t: "cold start", sw: { background: WARN } },
        { t: "scaled to zero", sw: { border: "1px dashed var(--color-line)" } },
      ]
    : [
        { t: "served", sw: { background: color } },
        { t: "dropped", sw: { background: BAD } },
        { t: "paid capacity", sw: { border: `1px dashed ${tint(color, 55)}` } },
      ];

  const capacityBottom = `${(SERVER_CAPACITY / MAX_UNITS) * 100}%`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Serverless: scale to zero, pay per request
      </h3>
      <p className="mt-1 text-sm text-dim">
        Bursty traffic — idle, then a spike, then idle. Step through the timeline
        and watch how each hosting model copes, and what each one costs.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {modes.map((m) => {
          const on = m.k === mode;
          return (
            <button
              key={m.k}
              onClick={() => setMode(m.k)}
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
              {m.l}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, TRAFFIC.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            concurrent requests over time
          </p>
          <p className="font-mono text-[10px] text-faint">
            {serverless ? "instances follow demand" : `1 server · cap ${SERVER_CAPACITY}`}
          </p>
        </div>

        <div className="relative mt-3 flex h-32 items-end gap-1.5">
          {TRAFFIC.map((v, i) => {
            const active = i <= step;
            const current = i === step;
            const cServed = serverless ? v : Math.min(v, SERVER_CAPACITY);
            const cOver = serverless ? 0 : Math.max(0, v - SERVER_CAPACITY);
            const cCold = serverless && isColdStart(i);
            const barColor = cCold ? WARN : serverless ? GOOD : color;
            return (
              <div
                key={i}
                className="relative flex h-full flex-1 flex-col justify-end gap-px rounded-md px-0.5"
                style={current ? { background: tint(color, 10) } : undefined}
              >
                {cOver > 0 && (
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${(cOver / MAX_UNITS) * 100}%`,
                      background: active ? BAD : tint(BAD, 22),
                    }}
                  />
                )}
                <div
                  className={cOver > 0 ? "w-full" : "w-full rounded-t-sm"}
                  style={{
                    height: `${(cServed / MAX_UNITS) * 100}%`,
                    background:
                      v === 0
                        ? "transparent"
                        : active
                          ? barColor
                          : tint(barColor, 20),
                  }}
                />
              </div>
            );
          })}
          {!serverless && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 border-t border-dashed"
                style={{ bottom: capacityBottom, borderColor: tint(color, 55) }}
              />
              <span
                className="pointer-events-none absolute right-1 -translate-y-1/2 rounded bg-bg-2 px-1 font-mono text-[9px] text-faint"
                style={{ bottom: capacityBottom }}
              >
                capacity {SERVER_CAPACITY}
              </span>
            </>
          )}
        </div>

        <div className="mt-1.5 flex gap-1.5">
          {TRAFFIC.map((_, i) => (
            <div
              key={i}
              className={`flex-1 text-center font-mono text-[9px] ${i === step ? "font-semibold" : "text-faint"}`}
              style={i === step ? { color } : undefined}
            >
              {i === step ? "now" : i + 1}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {legend.map((item) => (
            <span
              key={item.t}
              className="inline-flex items-center gap-1.5 text-[11px] text-dim"
            >
              <span className="h-2.5 w-2.5 rounded-sm" style={item.sw} />
              {item.t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            requests this tick
          </p>
          <p className="mt-1 font-mono text-2xl text-text">{now}</p>
        </div>

        <div className="rounded-lg border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {serverless ? "instances running" : "servers running"}
          </p>
          <p
            className="mt-1 font-mono text-2xl"
            style={{
              color: serverless
                ? now > 0
                  ? GOOD
                  : "var(--color-dim)"
                : color,
            }}
          >
            {instances}
          </p>
          {serverless ? (
            cold ? (
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ color: WARN, background: tint(WARN, 14) }}
              >
                cold start
              </span>
            ) : now === 0 ? (
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ color: GOOD, background: tint(GOOD, 14) }}
              >
                scaled to zero
              </span>
            ) : null
          ) : overflow > 0 ? (
            <span
              className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ color: BAD, background: tint(BAD, 14) }}
            >
              over capacity
            </span>
          ) : now === 0 ? (
            <span
              className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ color: WARN, background: tint(WARN, 14) }}
            >
              idle, still paid
            </span>
          ) : (
            <span className="mt-1 inline-block text-[10px] text-faint">
              {served}/{SERVER_CAPACITY} used
            </span>
          )}
        </div>

        <div className="rounded-lg border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            running cost
          </p>
          <p
            className="mt-1 font-mono text-2xl"
            style={{ color: serverless ? GOOD : WARN }}
          >
            {money(costCents)}
          </p>
          <span className="mt-1 inline-block text-[10px] text-faint">
            {serverless ? "billed per request" : "billed while running"} · vs{" "}
            {money(otherCents)} {serverless ? "as always-on" : "as serverless"}
          </span>
        </div>
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
