"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type ServerState = "active" | "standby" | "crashed";
type Server = { id: string; state: ServerState };
type Status = "up" | "blip" | "down";
type Step = {
  note: string;
  status: Status;
  route: string | null; // which server traffic is aimed at (null = nowhere)
  servers: Server[];
};

const SINGLE_STEPS: Step[] = [
  {
    note: "All traffic hits one server. It is healthy, so every user is served. The service is UP.",
    status: "up",
    route: "A",
    servers: [{ id: "A", state: "active" }],
  },
  {
    note: "Server A crashes. There is no backup, so requests have nowhere to go — the whole service is DOWN and users get errors.",
    status: "down",
    route: null,
    servers: [{ id: "A", state: "crashed" }],
  },
  {
    note: "One server is a single point of failure: when it dies, everything dies. Removing that single point is exactly what high availability is about.",
    status: "down",
    route: null,
    servers: [{ id: "A", state: "crashed" }],
  },
];

const REDUNDANT_STEPS: Step[] = [
  {
    note: "Two servers sit behind a load balancer. A is active, B is a healthy standby, and health checks watch both. The service is UP.",
    status: "up",
    route: "A",
    servers: [
      { id: "A", state: "active" },
      { id: "B", state: "standby" },
    ],
  },
  {
    note: "Server A crashes. The load balancer's health check notices A has stopped responding — at most a brief blip for users.",
    status: "blip",
    route: "A",
    servers: [
      { id: "A", state: "crashed" },
      { id: "B", state: "standby" },
    ],
  },
  {
    note: "Traffic automatically fails over to Server B, which was ready and healthy. Users keep being served with no outage — the service stays UP.",
    status: "up",
    route: "B",
    servers: [
      { id: "A", state: "crashed" },
      { id: "B", state: "active" },
    ],
  },
];

const MODES = [
  { key: "single", label: "Single server (no redundancy)" },
  { key: "redundant", label: "Redundant + failover" },
] as const;

type Mode = (typeof MODES)[number]["key"];

const STATUS_META: Record<Status, { label: string; color: string }> = {
  up: { label: "SERVICE UP", color: GOOD },
  blip: { label: "SERVICE UP (brief blip)", color: WARN },
  down: { label: "SERVICE DOWN", color: BAD },
};

export default function HaDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("single");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = mode === "single" ? SINGLE_STEPS : REDUNDANT_STEPS;
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

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

  const status = STATUS_META[frame.status];
  const flowColor =
    frame.status === "down" ? BAD : frame.status === "blip" ? WARN : color;
  const flowDashed = frame.status !== "up";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        High availability: surviving a server failure
      </h3>
      <p className="mt-1 text-sm text-dim">
        Watch what happens to the service when a server dies — with one server,
        and with a redundant pair that fails over automatically.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            traffic flow
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: tint(status.color, 14),
              color: status.color,
              borderColor: tint(status.color, 40),
            }}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-dim">
            users
          </div>

          <Connector color={flowColor} dashed={flowDashed} />

          {mode === "redundant" && (
            <>
              <div
                className="rounded-lg border px-3 py-1.5 font-mono text-xs"
                style={{
                  color,
                  borderColor: tint(color, 45),
                  background: tint(color, 10),
                }}
              >
                load balancer · health check
              </div>
              <Connector color={flowColor} dashed={flowDashed} />
            </>
          )}

          <div className="flex w-full flex-wrap justify-center gap-3">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.servers.map((s) => {
                const routed = frame.route === s.id;
                const crashed = s.state === "crashed";
                const cardColor = crashed
                  ? BAD
                  : s.state === "standby"
                    ? GOOD
                    : color;
                const stateLabel =
                  s.state === "crashed"
                    ? "CRASHED"
                    : s.state === "standby"
                      ? "STANDBY · healthy"
                      : "ACTIVE · serving";
                const chip = routed
                  ? crashed
                    ? { text: "traffic failing", color: WARN }
                    : { text: "receiving traffic", color }
                  : null;
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-[8.5rem] flex-1 rounded-lg border px-3 py-2.5"
                    style={{
                      borderColor: routed ? cardColor : tint(cardColor, 45),
                      background: tint(cardColor, crashed ? 10 : 8),
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-text">
                        Server {s.id}
                      </span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-wide"
                        style={{ color: cardColor }}
                      >
                        {stateLabel}
                      </span>
                    </div>
                    {chip && (
                      <span
                        className="mt-1.5 inline-block rounded font-mono text-[10px]"
                        style={{ color: chip.color }}
                      >
                        ← {chip.text}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>

      <p className="mt-3 rounded-lg border border-line-soft bg-bg-2/40 p-3 text-xs leading-relaxed text-faint">
        Availability is measured in nines. 99.9% allows about 8.7 hours of
        downtime per year; 99.99% allows about 52 minutes. High availability
        means removing single points of failure with redundancy and automatic
        failover.
      </p>
    </div>
  );
}

function Connector({ color, dashed }: { color: string; dashed: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="my-1.5 h-5"
      style={{ borderLeft: `2px ${dashed ? "dashed" : "solid"} ${color}` }}
    />
  );
}
