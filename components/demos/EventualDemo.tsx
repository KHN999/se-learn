"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

const REPLICAS = ["R1", "R2", "R3"] as const;

type Tag = "sync" | "stale" | "conflict";
type Pulse = "write" | "read" | "gossip-out" | "gossip-in" | null;
type Cell = { value: number; tag: Tag; pulse: Pulse };
type Step = {
  cells: Cell[];
  event: string;
  badge: { tone: "good" | "warn"; label: string };
  read?: { at: number; value: number; stale: boolean };
  note: string;
};

const steps: Step[] = [
  {
    cells: [
      { value: 10, tag: "sync", pulse: null },
      { value: 10, tag: "sync", pulse: null },
      { value: 10, tag: "sync", pulse: null },
    ],
    event: "Starting state — every replica holds likes = 10.",
    badge: { tone: "good", label: "converged" },
    note: "All three replicas agree, so a read from any of them returns 10. With no writes in flight, the system is converged.",
  },
  {
    cells: [
      { value: 11, tag: "sync", pulse: "write" },
      { value: 10, tag: "stale", pulse: null },
      { value: 10, tag: "stale", pulse: null },
    ],
    event: "Write: likes = 11 lands on R1.",
    badge: { tone: "warn", label: "inconsistent window" },
    note: "R1 accepts the write and jumps to 11, but R2 and R3 still hold 10. The replicas now disagree — this is the inconsistent window.",
  },
  {
    cells: [
      { value: 11, tag: "sync", pulse: null },
      { value: 10, tag: "stale", pulse: "read" },
      { value: 10, tag: "stale", pulse: null },
    ],
    event: "Read: a client reads from R2.",
    badge: { tone: "warn", label: "inconsistent window" },
    read: { at: 1, value: 10, stale: true },
    note: "A read routed to R2 returns the stale value 10, even though 11 was already written on R1. Under eventual consistency the app must tolerate reads like this.",
  },
  {
    cells: [
      { value: 11, tag: "sync", pulse: "gossip-out" },
      { value: 11, tag: "sync", pulse: "gossip-in" },
      { value: 10, tag: "stale", pulse: null },
    ],
    event: "Propagate: R1 gossips the update to R2.",
    badge: { tone: "warn", label: "inconsistent window" },
    note: "R1 propagates likes = 11 to R2, so R2 catches up. R3 still lags at 10, so the system has not converged yet.",
  },
  {
    cells: [
      { value: 11, tag: "sync", pulse: "gossip-out" },
      { value: 11, tag: "sync", pulse: null },
      { value: 11, tag: "sync", pulse: "gossip-in" },
    ],
    event: "Propagate: R1 gossips the update to R3.",
    badge: { tone: "good", label: "converged" },
    read: { at: 2, value: 11, stale: false },
    note: "R3 receives the update too. All three replicas now agree at 11 — the system has converged, and a read from any replica returns 11.",
  },
  {
    cells: [
      { value: 12, tag: "conflict", pulse: "write" },
      { value: 11, tag: "stale", pulse: null },
      { value: 13, tag: "conflict", pulse: "write" },
    ],
    event: "Conflict: two writes happen at once — 12 on R1, 13 on R3.",
    badge: { tone: "warn", label: "write conflict" },
    note: "Two clients write different values to different replicas at the same time. There is no single truth yet — the replicas hold 12, 11, and 13. This is a write conflict.",
  },
  {
    cells: [
      { value: 13, tag: "sync", pulse: "gossip-in" },
      { value: 13, tag: "sync", pulse: "gossip-in" },
      { value: 13, tag: "sync", pulse: null },
    ],
    event: "Resolve: last-write-wins keeps 13 (R3 had the later timestamp).",
    badge: { tone: "good", label: "converged" },
    note: "A conflict rule — here last-write-wins — picks 13 as the winner and propagates it everywhere, so the replicas converge again. Note the write of 12 was dropped: eventual consistency buys availability and scale, but the app must tolerate stale reads and resolve conflicts.",
  },
];

const tagColor = (t: Tag) => (t === "sync" ? GOOD : WARN);
const tagText = (t: Tag) =>
  t === "sync" ? "in sync" : t === "stale" ? "stale" : "conflict";
const pulseText = (p: Pulse) =>
  p === "write"
    ? "write"
    : p === "read"
      ? "read"
      : p === "gossip-out"
        ? "gossip out"
        : p === "gossip-in"
          ? "gossip in"
          : "";

export default function EventualDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const badgeColor = frame.badge.tone === "good" ? GOOD : WARN;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Eventual consistency: diverge, then converge
      </h3>
      <p className="mt-1 text-sm text-dim">
        Three replicas hold the same counter. A write makes them diverge, and
        they converge again once the update propagates.
      </p>

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
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-dim">{frame.event}</p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
          style={{
            borderColor: tint(badgeColor, 45),
            background: tint(badgeColor, 12),
            color: badgeColor,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: badgeColor }}
          />
          {frame.badge.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {frame.cells.map((cell, i) => (
          <div
            key={REPLICAS[i]}
            className="rounded-xl border p-3 transition-colors"
            style={{
              borderColor: cell.pulse ? color : "var(--color-line)",
              background: cell.pulse ? tint(color, 8) : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-faint">
                {REPLICAS[i]}
              </span>
              {cell.pulse ? (
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color }}
                >
                  {pulseText(cell.pulse)}
                </span>
              ) : null}
            </div>
            <div className="mt-2 font-mono text-sm text-text">
              likes ={" "}
              <motion.span
                key={cell.value}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-block font-semibold"
              >
                {cell.value}
              </motion.span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: tagColor(cell.tag) }}
              />
              <span
                className="text-[11px]"
                style={{ color: tagColor(cell.tag) }}
              >
                {tagText(cell.tag)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {frame.read ? (
        <p
          className="mt-3 font-mono text-xs"
          style={{ color: frame.read.stale ? WARN : GOOD }}
        >
          Read from {REPLICAS[frame.read.at]} returned {frame.read.value}{" "}
          {frame.read.stale ? "(stale)" : "(fresh)"}
        </p>
      ) : null}

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>
    </div>
  );
}
