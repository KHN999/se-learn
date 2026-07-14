"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type NodeId = "primary" | "r1" | "r2";
type Kind = "idle" | "write" | "read" | "replicate" | "failover";

type Step = {
  primary: number;
  r1: number;
  r2: number;
  primaryDown: boolean;
  promoted: NodeId | null;
  action: { kind: Kind; target?: NodeId; readValue?: number; stale?: boolean };
  note: string;
};

const STEPS: Step[] = [
  {
    primary: 50,
    r1: 50,
    r2: 50,
    primaryDown: false,
    promoted: null,
    action: { kind: "idle" },
    note: "Steady state: the primary and both read replicas all hold balance = 50. Any replica can answer a read.",
  },
  {
    primary: 100,
    r1: 50,
    r2: 50,
    primaryDown: false,
    promoted: null,
    action: { kind: "write", target: "primary" },
    note: "A client sends WRITE set balance = 100. It goes to the primary only — read replicas never accept writes directly.",
  },
  {
    primary: 100,
    r1: 50,
    r2: 50,
    primaryDown: false,
    promoted: null,
    action: { kind: "read", target: "r2", readValue: 50, stale: true },
    note: "Right after the write, a read is routed to a replica that has not caught up yet. It returns the STALE old value 50 — that is replication lag.",
  },
  {
    primary: 100,
    r1: 100,
    r2: 50,
    primaryDown: false,
    promoted: null,
    action: { kind: "replicate", target: "r1" },
    note: "The primary asynchronously ships the change to its replicas. Replica 1 applies it — balance = 100 there now.",
  },
  {
    primary: 100,
    r1: 100,
    r2: 100,
    primaryDown: false,
    promoted: null,
    action: { kind: "replicate", target: "r2" },
    note: "Replication catches up on Replica 2 as well. All three nodes now agree: balance = 100.",
  },
  {
    primary: 100,
    r1: 100,
    r2: 100,
    primaryDown: false,
    promoted: null,
    action: { kind: "read", target: "r2", readValue: 100, stale: false },
    note: "The same read now returns the fresh value 100 — consistent again. Spreading reads across replicas is how you scale read traffic.",
  },
  {
    primary: 100,
    r1: 100,
    r2: 100,
    primaryDown: true,
    promoted: "r1",
    action: { kind: "failover", target: "r1" },
    note: "The primary crashes. A replica is PROMOTED to new primary (failover) so writes can resume — replicas add redundancy, not just read capacity.",
  },
];

const REPLICAS: { id: NodeId; name: string }[] = [
  { id: "r1", name: "Replica 1" },
  { id: "r2", name: "Replica 2" },
];

function banner(frame: Step): string {
  const a = frame.action;
  if (a.kind === "write") return "client → primary: set balance = 100";
  if (a.kind === "replicate")
    return `primary → ${a.target === "r1" ? "replica 1" : "replica 2"}: propagate balance = 100`;
  if (a.kind === "read")
    return a.stale
      ? `${a.target === "r1" ? "replica 1" : "replica 2"} → client: returns ${a.readValue} (stale)`
      : `${a.target === "r1" ? "replica 1" : "replica 2"} → client: returns ${a.readValue}`;
  if (a.kind === "failover") return "promote replica → new primary";
  return "idle — cluster in steady state";
}

export default function ReplicationDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = STEPS;
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const writeActive = frame.action.kind === "write" || frame.action.kind === "failover";
  const readActive = frame.action.kind === "read";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Database replication: primary and read replicas
      </h3>
      <p className="mt-1 text-sm text-dim">
        One primary takes every write; read replicas copy its data to serve reads
        and add redundancy. Step through a write, its propagation, and the lag it
        can cause.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
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

      {/* Clients */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: "WRITE client", on: writeActive },
          { label: "READ client", on: readActive },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-lg border px-3 py-2 text-center font-mono text-[11px] uppercase tracking-widest transition-colors"
            style={{
              borderColor: c.on ? color : "var(--color-line)",
              background: c.on ? tint(color, 10) : "transparent",
              color: c.on ? color : "var(--color-faint)",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>

      {/* Action banner */}
      <div className="mt-3 rounded-xl border px-4 py-2.5 text-center" style={{ borderColor: tint(color, 45), background: tint(color, 8) }}>
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          current action
        </p>
        <div className="mt-0.5 h-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={step}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="font-mono text-sm"
              style={{ color }}
            >
              {banner(frame)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Primary */}
      <div className="mt-3">
        <div
          className="rounded-xl border p-3 transition-colors"
          style={{
            borderColor: frame.primaryDown
              ? BAD
              : frame.action.kind === "write"
                ? color
                : "var(--color-line)",
            background: frame.primaryDown
              ? tint(BAD, 8)
              : frame.action.kind === "write"
                ? tint(color, 10)
                : "transparent",
            opacity: frame.primaryDown ? 0.85 : 1,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-semibold text-text">Primary DB</p>
            <p
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: frame.primaryDown ? BAD : GOOD }}
            >
              {frame.primaryDown ? "✗ down — failed over" : "● healthy — accepts writes"}
            </p>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[11px] text-faint">balance =</span>
            <motion.span
              key={frame.primary}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-2xl"
              style={{ color: frame.primaryDown ? "var(--color-faint)" : "var(--color-text)" }}
            >
              {frame.primary}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Replication link */}
      <div className="flex flex-col items-center">
        <div className="h-3 w-px" style={{ background: "var(--color-line)" }} />
        <p
          className="font-mono text-[10px] uppercase tracking-widest transition-colors"
          style={{ color: frame.action.kind === "replicate" ? color : "var(--color-faint)" }}
        >
          asynchronous replication
        </p>
        <div className="h-3 w-px" style={{ background: "var(--color-line)" }} />
      </div>

      {/* Replicas */}
      <div className="grid grid-cols-2 gap-2">
        {REPLICAS.map((rep) => {
          const value = rep.id === "r1" ? frame.r1 : frame.r2;
          const replicating = frame.action.kind === "replicate" && frame.action.target === rep.id;
          const readHit = frame.action.kind === "read" && frame.action.target === rep.id;
          const stale = readHit && frame.action.stale === true;
          const promoted = frame.promoted === rep.id;
          const readColor = stale ? WARN : GOOD;
          const borderColor = promoted
            ? GOOD
            : replicating
              ? color
              : readHit
                ? readColor
                : "var(--color-line)";
          const background = promoted
            ? tint(GOOD, 8)
            : replicating
              ? tint(color, 10)
              : readHit
                ? tint(readColor, 10)
                : "transparent";
          return (
            <div
              key={rep.id}
              className="rounded-xl border p-3 transition-colors"
              style={{ borderColor, background }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm font-semibold text-text">{rep.name}</p>
                <p
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: promoted ? GOOD : "var(--color-faint)" }}
                >
                  {promoted ? "new primary" : "read replica"}
                </p>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[11px] text-faint">balance =</span>
                <motion.span
                  key={value}
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-2xl"
                  style={{ color: "var(--color-text)" }}
                >
                  {value}
                </motion.span>
              </div>
              <div className="mt-1.5 h-4">
                {replicating ? (
                  <p className="font-mono text-[11px]" style={{ color }}>
                    ⇄ applying update…
                  </p>
                ) : stale ? (
                  <p className="font-mono text-[11px]" style={{ color: WARN }}>
                    ⚠ stale read: replica lag → {frame.action.readValue}
                  </p>
                ) : readHit ? (
                  <p className="font-mono text-[11px]" style={{ color: GOOD }}>
                    ✓ fresh read → {frame.action.readValue}
                  </p>
                ) : promoted ? (
                  <p className="font-mono text-[11px]" style={{ color: GOOD }}>
                    ↑ promoted after failover
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-faint">
        Replicas scale reads and add redundancy, but every write still funnels
        through one primary. Because replication is asynchronous, a read can
        briefly return stale data — getting read-your-writes right takes extra
        care.
      </p>
    </div>
  );
}
