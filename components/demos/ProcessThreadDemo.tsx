"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Ban,
  Cable,
  Check,
  Cpu,
  Lock,
  MemoryStick,
  Share2,
  ShieldCheck,
  Split,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "threads" | "processes";

const MODES: { key: Mode; label: string; Icon: typeof Share2 }[] = [
  { key: "threads", label: "Threads (shared memory)", Icon: Share2 },
  { key: "processes", label: "Processes (isolated memory)", Icon: Split },
];

const THREAD_IDS = [1, 2, 3] as const;

type Kind = "good" | "warn" | "bad";
type Cell = { kind: Kind; text: string };
type Aspect = { dim: string; process: Cell; thread: Cell };

const KIND = {
  good: { color: GOOD, Icon: Check },
  warn: { color: WARN, Icon: TriangleAlert },
  bad: { color: BAD, Icon: X },
} as const;

const COMPARE: Aspect[] = [
  {
    dim: "Memory",
    process: { kind: "good", text: "Isolated, private per process" },
    thread: { kind: "warn", text: "Shared heap + globals" },
  },
  {
    dim: "Communication",
    process: { kind: "warn", text: "IPC: pipes / sockets" },
    thread: { kind: "good", text: "Read / write shared vars" },
  },
  {
    dim: "Creation cost",
    process: { kind: "warn", text: "Heavy, a new address space" },
    thread: { kind: "good", text: "Light, just a stack" },
  },
  {
    dim: "Crash blast radius",
    process: { kind: "good", text: "Contained to one process" },
    thread: { kind: "bad", text: "Takes down the whole process" },
  },
];

const STATUS: Record<Mode, string> = {
  threads:
    "Threads live in one address space, so passing data is just a variable read: cheap and instant. The price is that shared mutable memory needs locks to stay correct, and one crashing thread can bring down every thread in the process.",
  processes:
    "Each process gets its own private memory, so a crash or bad write in one cannot corrupt another: strong isolation. The price is that they cannot share variables directly, so talking means IPC (pipes or sockets), and spinning up a process is heavyweight.",
};

function VerdictCell({ cell, active }: { cell: Cell; active: boolean }) {
  const k = KIND[cell.kind];
  const Icon = k.Icon;
  return (
    <td className="px-3 py-2" style={{ opacity: active ? 1 : 0.5 }}>
      <span className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: k.color }} />
        <span className="text-dim">{cell.text}</span>
      </span>
    </td>
  );
}

export default function ProcessThreadDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("threads");
  const isThreads = mode === "threads";

  const processBox = (name: string) => (
    <div
      className="rounded-xl border-2 p-4"
      style={{ borderColor: tint(color, 40), background: tint(color, 5) }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Cpu className="h-4 w-4" style={{ color }} />
        <span className="font-mono text-xs font-semibold text-text">{name}</span>
        <span
          className="ml-auto inline-flex items-center gap-1 text-[11px]"
          style={{ color: GOOD }}
        >
          <ShieldCheck className="h-3.5 w-3.5" /> isolated
        </span>
      </div>
      <div
        className="rounded-lg border px-3 py-2"
        style={{ borderColor: tint(GOOD, 40), background: tint(GOOD, 8) }}
      >
        <div className="flex items-center gap-2">
          <MemoryStick className="h-4 w-4 shrink-0" style={{ color: GOOD }} />
          <span className="font-mono text-xs text-text">
            Private heap + globals
          </span>
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-line bg-bg-2 px-3 py-2">
        <div className="font-mono text-xs text-text">Thread</div>
        <div className="text-[10px] text-faint">own stack + registers</div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Process vs thread: isolated vs shared memory
      </h3>
      <p className="mt-1 text-sm text-dim">
        A process owns its memory; threads inside a process share it. Toggle to
        see how that one difference changes safety, speed, and cost.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-line p-0.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          const Icon = m.Icon;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={on ? { background: tint(color, 16), color } : { color: "var(--color-dim)" }}
            >
              <Icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          );
        })}
      </div>

      {isThreads ? (
        <div
          className="mt-4 rounded-xl border-2 p-4"
          style={{ borderColor: tint(color, 40), background: tint(color, 5) }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" style={{ color }} />
            <span className="font-mono text-xs font-semibold text-text">
              One process
            </span>
            <span
              className="ml-auto inline-flex items-center gap-1 text-[11px]"
              style={{ color: GOOD }}
            >
              <Zap className="h-3.5 w-3.5" /> light + instant to share
            </span>
          </div>

          <div
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: tint(WARN, 45), background: tint(WARN, 10) }}
          >
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 shrink-0" style={{ color: WARN }} />
              <span className="font-mono text-xs text-text">
                Shared heap + globals
              </span>
              <span
                className="ml-auto inline-flex items-center gap-1 text-[11px]"
                style={{ color: WARN }}
              >
                <Lock className="h-3.5 w-3.5" /> needs locks
              </span>
            </div>
          </div>

          <div className="my-2 grid grid-cols-3 gap-2">
            {THREAD_IDS.map((i) => (
              <div key={i} className="flex flex-col items-center" style={{ color }}>
                <ArrowUpDown className="h-4 w-4" />
                <span className="font-mono text-[10px]">read / write</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {THREAD_IDS.map((i) => (
              <div
                key={i}
                className="rounded-lg border border-line bg-bg-2 px-2 py-2 text-center"
              >
                <div className="font-mono text-xs text-text">Thread {i}</div>
                <div className="text-[10px] text-faint">
                  own stack + registers
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-3 flex items-start gap-1.5 text-[11px]"
            style={{ color: WARN }}
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Shared mutable memory means races unless you lock it, and one
              thread crashing takes every thread down with it.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            {processBox("Process A")}
            <div className="flex flex-col items-center justify-center gap-1 sm:px-1">
              <Cable className="h-5 w-5" style={{ color }} />
              <span className="font-mono text-[10px] text-dim">IPC</span>
              <span className="font-mono text-[10px] text-faint">
                pipe / socket
              </span>
              <span
                className="mt-1 inline-flex items-center gap-1 text-[10px]"
                style={{ color: WARN }}
              >
                <Ban className="h-3 w-3" /> no shared memory
              </span>
            </div>
            {processBox("Process B")}
          </div>

          <div
            className="mt-3 flex items-start gap-1.5 text-[11px]"
            style={{ color: GOOD }}
          >
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              A crash or bad write inside Process A cannot reach the memory of
              Process B, but every message between them has to travel through IPC.
            </span>
          </div>
        </div>
      )}

      <div className="thin-scroll mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-faint">
                Aspect
              </th>
              <th
                className="border-b border-line px-3 py-1.5 text-xs font-semibold"
                style={
                  !isThreads
                    ? { color, background: tint(color, 10) }
                    : { color: "var(--color-faint)" }
                }
              >
                Processes
              </th>
              <th
                className="border-b border-line px-3 py-1.5 text-xs font-semibold"
                style={
                  isThreads
                    ? { color, background: tint(color, 10) }
                    : { color: "var(--color-faint)" }
                }
              >
                Threads
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((row) => (
              <tr key={row.dim} className="border-b border-line-soft">
                <td className="px-3 py-2 font-mono text-xs text-faint">
                  {row.dim}
                </td>
                <VerdictCell cell={row.process} active={!isThreads} />
                <VerdictCell cell={row.thread} active={isThreads} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {STATUS[mode]}
      </p>
    </div>
  );
}
