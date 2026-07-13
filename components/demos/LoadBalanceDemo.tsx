"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Server = "A" | "B" | "C";
type Mode = "round" | "least" | "down";

const SERVERS: Server[] = ["A", "B", "C"];
const REQUESTS = [1, 2, 3, 4, 5, 6];

const MODES: { key: Mode; label: string; desc: string }[] = [
  {
    key: "round",
    label: "Round-robin",
    desc: "Round-robin sends each request to the next server in turn — A, B, C, then back to A — so load is spread evenly.",
  },
  {
    key: "least",
    label: "Least-connections",
    desc: "Least-connections routes each request to the server with the fewest requests so far (ties go to the earliest server).",
  },
  {
    key: "down",
    label: "Server B down",
    desc: "A health check marked Server B unhealthy, so the balancer skips it and routes only to A and C — no request is lost.",
  },
];

type Step = {
  current: number | null;
  target: Server | null;
  counts: Record<Server, number>;
  note: string;
};

function build(mode: Mode): Step[] {
  const desc = MODES.find((m) => m.key === mode)!.desc;
  const healthy: Record<Server, boolean> = { A: true, B: mode !== "down", C: true };
  const pool = SERVERS.filter((s) => healthy[s]);
  const counts: Record<Server, number> = { A: 0, B: 0, C: 0 };

  const steps: Step[] = [
    {
      current: null,
      target: null,
      counts: { ...counts },
      note: `Six requests are queued. ${desc}`,
    },
  ];

  let rr = 0;
  for (const req of REQUESTS) {
    let target: Server;
    if (mode === "least") {
      target = pool.reduce((best, s) => (counts[s] < counts[best] ? s : best), pool[0]);
    } else {
      target = pool[rr % pool.length];
      rr += 1;
    }
    counts[target] += 1;
    steps.push({
      current: req,
      target,
      counts: { ...counts },
      note: `Request ${req} routed to Server ${target}. ${desc}`,
    });
  }
  return steps;
}

export default function LoadBalanceDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("round");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(mode);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the strategy changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const processed = Object.values(frame.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        A load balancer spreading traffic across servers
      </h3>
      <p className="mt-1 text-sm text-dim">
        Six requests arrive and the balancer forwards each to one of three
        backend servers. Pick a strategy and step through the requests.
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
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
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

      {/* Incoming request queue */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          incoming requests
        </p>
        <div className="flex flex-wrap gap-1.5">
          {REQUESTS.map((r) => {
            const isCurrent = r === frame.current;
            const done = r <= processed && !isCurrent;
            return (
              <div
                key={r}
                className="grid h-8 w-8 place-items-center rounded-md border font-mono text-sm"
                style={{
                  borderColor: isCurrent ? color : "var(--color-line)",
                  background: isCurrent ? tint(color, 14) : "transparent",
                  color: isCurrent ? color : "var(--color-dim)",
                  opacity: done ? 0.35 : 1,
                }}
              >
                {done ? "✓" : r}
              </div>
            );
          })}
        </div>
      </div>

      {/* Load balancer */}
      <div className="mt-3 flex flex-col items-center">
        <div
          className="w-full rounded-xl border px-4 py-2.5 text-center"
          style={{ borderColor: tint(color, 45), background: tint(color, 8) }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            load balancer
          </p>
          <div className="mt-0.5 h-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${frame.current}-${frame.target}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.18 }}
                className="font-mono text-sm"
                style={{ color }}
              >
                {frame.current !== null && frame.target !== null
                  ? `request ${frame.current} → server ${frame.target}`
                  : "waiting for requests…"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className="h-3 w-px" style={{ background: "var(--color-line)" }} />
      </div>

      {/* Backend servers */}
      <div className="grid grid-cols-3 gap-2">
        {SERVERS.map((s) => {
          const down = mode === "down" && s === "B";
          const isTarget = s === frame.target;
          return (
            <div
              key={s}
              className="rounded-xl border p-3 text-center transition-colors"
              style={{
                borderColor: down ? BAD : isTarget ? color : "var(--color-line)",
                background: isTarget ? tint(color, 10) : "transparent",
                opacity: down ? 0.75 : 1,
              }}
            >
              <p className="font-mono text-sm font-semibold text-text">Server {s}</p>
              <motion.p
                key={frame.counts[s]}
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mt-1 font-mono text-2xl"
                style={{ color: down ? "var(--color-faint)" : isTarget ? color : "var(--color-dim)" }}
              >
                {frame.counts[s]}
              </motion.p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                requests
              </p>
              <p
                className="mt-1.5 font-mono text-[11px]"
                style={{ color: down ? BAD : GOOD }}
              >
                {down ? "✗ unhealthy" : "● healthy"}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-faint">
        Because any server can serve any request, you handle more traffic just by
        adding servers behind the balancer — that is horizontal scaling. And when a
        server fails its health check, the balancer keeps routing to the healthy
        ones, so the service stays up — high availability.
      </p>
    </div>
  );
}
