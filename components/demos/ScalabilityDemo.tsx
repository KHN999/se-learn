"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  CheckCircle2,
  Cpu,
  Network,
  Plus,
  Server,
  ShieldAlert,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "vertical" | "horizontal";
type Level = "low" | "medium" | "high";

const LEVELS: { key: Level; label: string; demand: number }[] = [
  { key: "low", label: "Low", demand: 200 },
  { key: "medium", label: "Medium", demand: 400 },
  { key: "high", label: "High", demand: 800 },
];

// Vertical: one box, sized up. The largest tier is the biggest box you can buy.
const TIERS: { size: string; cpu: number; ram: number; capacity: number }[] = [
  { size: "small", cpu: 2, ram: 4, capacity: 200 },
  { size: "medium", cpu: 8, ram: 32, capacity: 400 },
  { size: "large", cpu: 32, ram: 128, capacity: 500 },
];
const CEILING = TIERS[TIERS.length - 1].capacity;
const PER_NODE = 200; // each horizontal node serves this many req/s
const SCALE_MAX = 900; // top of the traffic bar

export default function ScalabilityDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("vertical");
  const [level, setLevel] = useState<Level>("low");

  const demand = (LEVELS.find((l) => l.key === level) ?? LEVELS[0]).demand;

  const tierIndex = TIERS.findIndex((t) => t.capacity >= demand);
  const activeTierIdx = tierIndex === -1 ? TIERS.length - 1 : tierIndex;
  const chosenTier = TIERS[activeTierIdx];
  const nodes = Math.ceil(demand / PER_NODE);

  const capacity = mode === "vertical" ? chosenTier.capacity : nodes * PER_NODE;
  const served = Math.min(demand, capacity);
  const dropped = Math.max(0, demand - capacity);
  const capped = mode === "vertical" && dropped > 0;
  const vertical = mode === "vertical";

  const statusText = vertical
    ? capped
      ? `Vertical scaling hit the wall: even the biggest box you can buy tops out at ${CEILING} req/s, so ${dropped} of the ${demand} req/s is dropped. Scaling up needs no app changes, but it is capped by hardware and stays a single point of failure — if that one box dies, everything is down.`
      : `Vertical scaling: one server, sized up to ${chosenTier.cpu} vCPU / ${chosenTier.ram} GB to serve ${demand} req/s. It is the simplest path — no app changes — but you ride one machine toward a hardware ceiling of ${CEILING} req/s, and that box is a single point of failure.`
    : `Horizontal scaling: ${nodes} ${nodes === 1 ? "server" : "servers"} behind a load balancer serve ${demand} req/s, and capacity grows almost linearly as you add boxes — lose one and the rest keep serving. The catch: every server must be stateless (no per-server session) so any box can handle any request, which means more coordination.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Scaling up vs scaling out</h3>
      <p className="mt-1 text-sm text-dim">
        Same growing traffic, two ways to keep up: give one server a bigger box,
        or add more servers behind a load balancer.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(
          [
            { key: "vertical", label: "Vertical (scale up)" },
            { key: "horizontal", label: "Horizontal (scale out)" },
          ] as { key: Mode; label: string }[]
        ).map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
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
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-xs text-faint">traffic</span>
        {LEVELS.map((l) => {
          const on = l.key === level;
          return (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
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
              {l.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-text">Incoming traffic</span>
          <span className="font-mono text-dim">{demand} req/s</span>
        </div>
        <div className="relative mt-2 h-3 w-full rounded-full bg-bg-2">
          <div className="flex h-full overflow-hidden rounded-full">
            <div
              className="h-full"
              style={{ width: `${(served / SCALE_MAX) * 100}%`, background: GOOD }}
            />
            {dropped > 0 ? (
              <div
                className="h-full"
                style={{ width: `${(dropped / SCALE_MAX) * 100}%`, background: BAD }}
              />
            ) : null}
          </div>
          <div
            className="absolute top-1/2 h-4 -translate-y-1/2"
            style={{
              left: `calc(${(capacity / SCALE_MAX) * 100}% - 1px)`,
              borderLeft: "2px dashed var(--color-faint)",
            }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-dim">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: GOOD }}
              aria-hidden="true"
            />
            served {served} req/s
          </span>
          {dropped > 0 ? (
            <span className="inline-flex items-center gap-1.5" style={{ color: BAD }}>
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: BAD }}
                aria-hidden="true"
              />
              dropped {dropped} req/s
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-faint">
            capacity {capacity} req/s
          </span>
        </div>
      </div>

      {vertical ? (
        <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            one server, swapped for a bigger box
          </p>
          <div className="flex items-end justify-center gap-3">
            {TIERS.map((t, i) => {
              const on = i === activeTierIdx;
              const isMax = i === TIERS.length - 1;
              const accent = capped && isMax ? WARN : color;
              const px = 44 + i * 22;
              return (
                <div key={t.size} className="flex flex-col items-center gap-1.5">
                  <div
                    className="grid place-items-center rounded-lg border transition-colors"
                    style={{
                      width: px,
                      height: px,
                      borderColor: on ? accent : "var(--color-line)",
                      background: on ? tint(accent, 14) : "transparent",
                    }}
                  >
                    <Server
                      className="h-5 w-5"
                      style={{ color: on ? accent : "var(--color-faint)" }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-faint">{t.size}</span>
                  {isMax ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-faint">
                      max box
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-dim">
            <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono">
              {chosenTier.cpu} vCPU / {chosenTier.ram} GB
            </span>
            <span className="text-faint">·</span>
            <span>serves {chosenTier.capacity} req/s</span>
          </div>
          {capped ? (
            <div
              className="mt-3 rounded-lg border p-2.5"
              style={{ borderColor: tint(WARN, 45), background: tint(WARN, 10) }}
            >
              <p
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: WARN }}
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Hardware ceiling reached
              </p>
              <p className="mt-1 text-xs text-dim">
                The large box is the biggest you can buy. Traffic beyond {CEILING}{" "}
                req/s has nowhere to go, so it is dropped. There is no bigger box to
                upgrade to.
              </p>
            </div>
          ) : null}
          <p
            className="mt-3 flex items-start gap-1.5 text-xs"
            style={{ color: BAD }}
          >
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Single point of failure: if this one box goes down, the whole service
              goes down with it.
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            more servers behind a load balancer
          </p>
          <div
            className="mx-auto flex w-fit items-center gap-2 rounded-lg border px-3 py-1.5"
            style={{ borderColor: tint(color, 45), background: tint(color, 12) }}
          >
            <Network className="h-4 w-4" style={{ color }} aria-hidden="true" />
            <span className="text-xs font-medium" style={{ color }}>
              load balancer
            </span>
          </div>
          <div className="my-2 flex justify-center">
            <ArrowDown className="h-4 w-4 text-faint" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[...Array(nodes).keys()].map((i) => (
              <div
                key={`node-${i}`}
                className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2"
                style={{ borderColor: tint(color, 45), background: tint(color, 10) }}
              >
                <Server className="h-5 w-5" style={{ color }} aria-hidden="true" />
                <span className="font-mono text-[10px] text-dim">node {i + 1}</span>
                <span className="font-mono text-[9px] text-faint">
                  {PER_NODE} req/s
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-line px-3 py-2">
              <Plus className="h-5 w-5 text-faint" aria-hidden="true" />
              <span className="font-mono text-[10px] text-faint">add node</span>
            </div>
          </div>
          <p
            className="mt-3 flex items-start gap-1.5 text-xs"
            style={{ color: GOOD }}
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Resilient: lose one node and the load balancer routes around it — the
              rest keep serving.
            </span>
          </p>
          <p
            className="mt-2 flex items-start gap-1.5 text-xs"
            style={{ color: WARN }}
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              The catch: every node must be stateless — no per-server session — so
              any node can serve any request.
            </span>
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-xl border p-3"
          style={
            vertical
              ? { borderColor: tint(color, 40), background: tint(color, 8) }
              : { borderColor: "var(--color-line)" }
          }
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-text">
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            Vertical — scale up
          </div>
          <p className="mt-1 text-xs text-dim">
            Give one server a bigger box (more CPU/RAM). Simplest — no app changes
            — but capped by a hardware ceiling and a single point of failure.
          </p>
        </div>
        <div
          className="rounded-xl border p-3"
          style={
            vertical
              ? { borderColor: "var(--color-line)" }
              : { borderColor: tint(color, 40), background: tint(color, 8) }
          }
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-text">
            <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
            Horizontal — scale out
          </div>
          <p className="mt-1 text-xs text-dim">
            Add more servers behind a load balancer. Near-linear capacity and
            survives a lost node — but every server must be stateless.
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
