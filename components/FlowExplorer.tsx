"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Cable,
  Check,
  Cloud,
  Compass,
  Container,
  Cookie,
  Database,
  Eye,
  FileText,
  Filter,
  Fingerprint,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  Hash,
  Inbox,
  KeyRound,
  Layers,
  ListOrdered,
  Lock,
  MessageSquare,
  MonitorPlay,
  Network,
  Package,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  RotateCcw,
  Scale,
  Search,
  Send,
  Server,
  ShieldCheck,
  Split,
  Terminal,
  TextCursorInput,
  Timer,
  Users,
  Webhook,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Flow } from "@/lib/types";

// Map the string names used in the flow data to real icon components.
const ICONS: Record<string, LucideIcon> = {
  TextCursorInput,
  Compass,
  Cable,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Split,
  Database,
  MonitorPlay,
  KeyRound,
  Cookie,
  ShieldCheck,
  Server,
  HardDrive,
  Send,
  Inbox,
  Bell,
  Users,
  RefreshCw,
  GitBranch,
  Package,
  Rocket,
  Cloud,
  Container,
  Search,
  ListOrdered,
  Filter,
  Gauge,
  Scale,
  Network,
  Timer,
  Hash,
  FileText,
  Zap,
  Layers,
  Globe,
  MessageSquare,
  Eye,
  Terminal,
  Radio,
  Webhook,
  Fingerprint,
  Boxes,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Real latencies span 1ms to ~120ms. Scale them into watchable durations so
// the slow steps visibly take longer than the fast ones.
function animMs(latencyMs: number) {
  return Math.min(1600, 340 + latencyMs * 6);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-widest text-accent-2">
      {children}
    </p>
  );
}

export default function FlowExplorer({ flow }: { flow: Flow }) {
  const stages = flow.stages;

  // Two independent concerns, deliberately not coupled:
  //  - the JOURNEY animation (active packet, elapsed, done) — driven by run()
  //  - the READING selection (selected)                     — driven by pick()
  // The run animation must never move the reading panel, or the long-form text
  // flips past faster than anyone can read it.
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const runToken = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const totalMs = stages.reduce((sum, s) => sum + s.latencyMs, 0);
  const progressIndex = done ? stages.length - 1 : active;
  const isReached = (i: number) =>
    done || (progressIndex !== null && i <= progressIndex);

  // Keep the focused stop visible inside the horizontally-scrolling track.
  // Only uses refs, so it is stable across renders.
  const scrollTrackTo = useCallback((i: number) => {
    const node = nodeRefs.current[i];
    const track = trackRef.current;
    if (!node || !track) return;
    const nodeRect = node.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const delta =
      nodeRect.left +
      nodeRect.width / 2 -
      (trackRect.left + trackRect.width / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: "smooth" });
  }, []);

  // Follow the packet while a run is playing...
  useEffect(() => {
    if (active !== null) scrollTrackTo(active);
  }, [active, scrollTrackTo]);

  // ...and follow manual selection (clicks, Prev/Next) the rest of the time.
  useEffect(() => {
    scrollTrackTo(selected);
  }, [selected, scrollTrackTo]);

  async function run() {
    const token = ++runToken.current;
    setRunning(true);
    setDone(false);
    setElapsed(0);
    setActive(null);
    for (let i = 0; i < stages.length; i++) {
      if (runToken.current !== token) return;
      setActive(i);
      await sleep(animMs(stages[i].latencyMs));
      if (runToken.current !== token) return;
      setElapsed((e) => e + stages[i].latencyMs);
    }
    if (runToken.current !== token) return;
    setActive(null);
    setRunning(false);
    setDone(true);
  }

  function reset() {
    runToken.current++;
    setRunning(false);
    setDone(false);
    setActive(null);
    setElapsed(0);
  }

  // Reading is independent of the animation — opening a stop never interrupts
  // (or is interrupted by) the travelling packet.
  function pick(i: number) {
    setSelected(i);
  }

  const current = stages[selected];
  const CurrentIcon = ICONS[current.icon] ?? Compass;

  return (
    <section>
      {/* Controls + latency meter (the journey view) */}
      <div className="rounded-2xl border border-line bg-panel/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {running ? "Playing…" : done ? "Run again" : "Run it"}
          </button>
          <button
            onClick={reset}
            disabled={!done && active === null && elapsed === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-2 px-4 py-2.5 text-dim transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <span className="font-mono text-xs text-faint">
            press play — then click any stop to read
          </span>

          <span className="ml-auto flex items-center gap-2 font-mono text-sm">
            {done ? (
              <span className="inline-flex items-center gap-1.5 text-good">
                <Check className="h-4 w-4" />
                {flow.outcome}
              </span>
            ) : (
              <span className="text-dim">
                <span className="text-text">{elapsed}</span> / {totalMs}{" "}
                {flow.unit ?? "ms"}
              </span>
            )}
          </span>
        </div>

        {/* Segmented latency bar — shows where the time actually goes */}
        <div className="mt-4 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
          {stages.map((s, i) => (
            <div
              key={s.id}
              title={`${s.label} · ≈${s.latencyMs} ms`}
              style={{ flexGrow: Math.max(s.latencyMs, 2) }}
              className={`h-full transition-colors duration-300 ${
                isReached(i)
                  ? "bg-accent"
                  : active === i
                    ? "bg-accent/50"
                    : "bg-bg-2"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-faint">
          each block is one stop — wider means it takes longer
        </p>
      </div>

      {/* The track of stops */}
      <div ref={trackRef} className="thin-scroll mt-5 overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch">
          {stages.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Compass;
            const reached = isReached(i);
            const isActive = active === i;
            const isSelected = selected === i;
            return (
              <Fragment key={s.id}>
                {i > 0 && (
                  <div className="flex items-center px-1">
                    <ArrowRight
                      className={`h-4 w-4 transition-colors ${
                        reached ? "text-accent" : "text-faint"
                      }`}
                    />
                  </div>
                )}
                <button
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  onClick={() => pick(i)}
                  className={`relative flex w-[124px] shrink-0 flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-center transition-colors ${
                    isSelected
                      ? "border-accent bg-panel"
                      : "border-line bg-panel/40 hover:border-line hover:bg-panel/70"
                  } ${isActive ? "ring-2 ring-accent/40" : ""}`}
                >
                  <span className="absolute left-2 top-2 font-mono text-[10px] text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{
                      repeat: isActive ? Infinity : 0,
                      duration: 0.9,
                    }}
                    className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${
                      reached || isSelected
                        ? "border-accent/60 bg-accent/10 text-accent"
                        : "border-line bg-bg-2 text-dim"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span
                    className={`text-xs font-medium leading-tight ${
                      isSelected ? "text-text" : "text-dim"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="font-mono text-[10px] text-faint">
                    ≈{s.latencyMs}ms
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Detail panel for the selected stop (reading, fully manual) */}
      <AnimatePresence mode="wait">
        <motion.article
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="mt-5 rounded-2xl border border-line bg-panel/60 p-6 sm:p-7"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-accent/50 bg-accent/10 text-accent">
              <CurrentIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-mono text-xs text-faint">
                STOP {selected + 1} / {stages.length}
              </p>
              <h2 className="text-xl font-semibold text-text sm:text-2xl">
                {current.label}
              </h2>
            </div>
            <span className="ml-auto hidden shrink-0 rounded-full border border-line bg-bg-2 px-3 py-1 font-mono text-xs text-dim sm:block">
              ≈ {current.latencyMs} ms
            </span>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-text">
            {current.oneLiner}
          </p>

          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <SectionTitle>Why it exists</SectionTitle>
                <p className="mt-2 leading-relaxed text-dim">
                  {current.problem}
                </p>
              </div>
              <div>
                <SectionTitle>How it works</SectionTitle>
                <p className="mt-2 leading-relaxed text-dim">{current.how}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line-soft bg-bg-2 p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-faint">
                  in
                </p>
                <p className="mt-1 text-sm text-dim">{current.input}</p>
                <div className="my-3 flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-accent-2" />
                  <span className="h-px flex-1 bg-line-soft" />
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-faint">
                  out
                </p>
                <p className="mt-1 text-sm text-dim">{current.output}</p>
              </div>

              <div className="rounded-xl border border-warn/30 bg-warn/5 p-4">
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-warn">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  the tradeoff
                </p>
                <p className="mt-2 text-sm leading-relaxed text-dim">
                  {current.tradeoff}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-line pt-5">
            <SectionTitle>Connects to</SectionTitle>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {current.related.map((r) => (
                <li
                  key={r.label}
                  className="rounded-lg border border-line-soft bg-panel/40 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-text">
                    {r.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-dim">
                    {r.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prev / next linear navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => pick(selected - 1)}
              disabled={selected === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-dim transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => pick(selected + 1)}
              disabled={selected === stages.length - 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-dim transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.article>
      </AnimatePresence>
    </section>
  );
}
