"use client";

import { useState } from "react";
import { AlertTriangle, Cpu, HardDrive, MemoryStick, Wrench } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Resource = "CPU" | "Memory" | "I/O";

type Workload = {
  key: string;
  label: string;
  example: string;
  cpu: number;
  memory: number;
  io: number;
  bottleneck: Resource;
  bottleneckLabel: string;
  reason: string;
  fix: string;
};

const WORKLOADS: Workload[] = [
  {
    key: "cpu",
    label: "CPU-bound",
    example: "resizing images, hashing, or heavy computation",
    cpu: 96,
    memory: 28,
    io: 10,
    bottleneck: "CPU",
    bottleneckLabel: "CPU",
    reason: "The CPU is pinned near 100% while memory and I/O sit idle — the processor is the limit.",
    fix: "Optimize the algorithm, parallelize the work across cores, and cache results you can reuse.",
  },
  {
    key: "memory",
    label: "Memory-bound",
    example: "loading a huge dataset entirely into RAM",
    cpu: 48,
    memory: 94,
    io: 20,
    bottleneck: "Memory",
    bottleneckLabel: "Memory",
    reason: "Memory is nearly full, so the machine risks swapping to disk or an out-of-memory crash.",
    fix: "Stream or paginate instead of loading everything at once, use leaner data structures, or add RAM.",
  },
  {
    key: "io",
    label: "I/O-bound",
    example: "waiting on a database, network, or disk",
    cpu: 14,
    memory: 26,
    io: 92,
    bottleneck: "I/O",
    bottleneckLabel: "I/O wait",
    reason: "The CPU is idle, waiting on slow I/O — so adding more CPU will not help at all.",
    fix: "Use async or concurrency, batch requests, cache results, and improve queries or indexes.",
  },
];

function statusOf(value: number): { text: string; color: string } {
  if (value >= 85) return { text: "saturated", color: BAD };
  if (value >= 45) return { text: "moderate", color: WARN };
  return { text: "low", color: GOOD };
}

export default function ResourceBoundDemo({ color }: { color: string }) {
  const [key, setKey] = useState("cpu");
  const wl = WORKLOADS.find((w) => w.key === key) ?? WORKLOADS[0];

  const resources: { name: string; value: number; res: Resource; Icon: typeof Cpu }[] = [
    { name: "CPU", value: wl.cpu, res: "CPU", Icon: Cpu },
    { name: "Memory", value: wl.memory, res: "Memory", Icon: MemoryStick },
    { name: "I/O wait", value: wl.io, res: "I/O", Icon: HardDrive },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        What is the bottleneck: CPU, memory, or I/O?
      </h3>
      <p className="mt-1 text-sm text-dim">
        Pick a workload. Before adding hardware, find the one resource that is
        maxed out — that saturated resource is the bottleneck, and it decides the
        right fix.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {WORKLOADS.map((w) => {
          const on = w.key === key;
          return (
            <button
              key={w.key}
              onClick={() => setKey(w.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {w.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-faint">
        <span className="font-mono uppercase tracking-widest">Example</span>{" "}
        {wl.example}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {resources.map((r) => {
          const st = statusOf(r.value);
          const isBottleneck = r.res === wl.bottleneck;
          const Icon = r.Icon;
          return (
            <div
              key={r.name}
              className="rounded-lg px-2 py-1.5"
              style={isBottleneck ? { background: tint(BAD, 10) } : undefined}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-mono text-dim">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {r.name}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <span className="text-dim">{r.value}%</span>
                  <span style={{ color: st.color }}>{st.text}</span>
                  {isBottleneck ? (
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      style={{ background: tint(BAD, 18), color: BAD }}
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      bottleneck
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-bg-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${r.value}%`, background: st.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        role="status"
        aria-live="polite"
        className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-text">
          <AlertTriangle className="h-4 w-4" aria-hidden style={{ color: BAD }} />
          <span>
            {wl.label}: the bottleneck is {wl.bottleneckLabel}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-dim">{wl.reason}</p>
        <div className="mt-3 flex items-start gap-2">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0" aria-hidden style={{ color }} />
          <p className="text-sm leading-relaxed text-dim">
            <span className="font-medium text-text">The fix: </span>
            {wl.fix}
          </p>
        </div>
      </div>
    </div>
  );
}
