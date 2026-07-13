"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

type Mode = "poll" | "ws";

type Tick = {
  up?: string; // client → server request (↑)
  down?: string; // server → client response/push (↓)
  tag?: string; // short outcome word, so we never rely on color alone
  status?: "warn" | "good" | "info";
  msg?: boolean; // the message became available on the server this tick (✉)
  seen?: boolean; // the client actually received the message this tick
  note: string;
};

// Deterministic, hand-written schedules for ticks 0..7.
const SCHED: Record<Mode, Tick[]> = {
  poll: [
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: 'Tick 0 — client sends GET /messages: "any new?" Server: "none." A full round trip, nothing gained.',
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: 'Tick 1 — poll again. Still "none." Another wasted request.',
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: "Tick 2 — poll again, empty. The client can't know when a message will arrive, so it just keeps asking.",
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: "Tick 3 — still polling, still nothing on the server.",
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: "Tick 4 — still empty. Every one of these round trips costs bandwidth and a server hit for no result.",
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      msg: true,
      note: 'Tick 5 — the message now exists on the server ✉. But this poll fired a moment too early and still got "none."',
    },
    {
      up: "poll",
      down: "message!",
      tag: "delivered",
      status: "good",
      seen: true,
      note: "Tick 6 — the NEXT poll finally returns the message. Delivered a whole tick after it was available.",
    },
    {
      up: "poll",
      down: "none",
      tag: "wasted",
      status: "warn",
      note: "Polling wastes a request every tick and still shows the message late (available at 5, seen at 6). More frequent polling = less delay but even more waste.",
    },
  ],
  ws: [
    {
      up: "upgrade",
      down: "open",
      tag: "handshake",
      status: "info",
      note: "Tick 0 — one HTTP Upgrade handshake turns the connection into a WebSocket. It now stays open — no more requests needed.",
    },
    { note: "Tick 1 — silence. No polling, no requests. The open connection simply waits." },
    { note: "Tick 2 — still idle. Zero traffic while nothing is happening." },
    { note: "Tick 3 — still waiting on the single open connection." },
    { note: "Tick 4 — nothing yet, and crucially, still no wasted requests." },
    {
      down: "push",
      tag: "delivered",
      status: "good",
      msg: true,
      seen: true,
      note: "Tick 5 — the message exists ✉ and the server pushes it down the open connection instantly. Seen the moment it's available.",
    },
    { note: "Tick 6 — idle again. The connection stays open, ready for the next push." },
    {
      note: "One open connection, zero polling. The server pushes the moment the message exists (seen at 5) — real-time with no wasted requests. The cost: the server holds an open connection per client.",
    },
  ],
};

const MODES: { key: Mode; label: string }[] = [
  { key: "poll", label: "Polling (HTTP)" },
  { key: "ws", label: "WebSocket" },
];

export default function WsPushDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("poll");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = SCHED[mode];
  const current = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const revealed = steps.slice(0, step + 1);
  const requestsSent = revealed.filter((t) => t.up).length;
  const seenTick = steps.findIndex((t) => t.seen);
  const seenAt = seenTick !== -1 && seenTick <= step ? seenTick : null;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Getting live updates: polling vs WebSocket</h3>
      <p className="mt-1 text-sm text-dim">
        Another user&apos;s message lands on the server at tick 5. Watch how each approach gets it
        to the client — and how many requests that costs.
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

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-2 px-3 py-1.5 text-xs text-dim">
          requests sent
          <span className="font-mono text-sm text-text">{requestsSent}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-bg-2 px-3 py-1.5 text-xs text-dim">
          message seen at tick
          <span
            className="font-mono text-sm"
            style={{ color: seenAt !== null ? GOOD : "var(--color-faint)" }}
          >
            {seenAt !== null ? seenAt : "—"}
          </span>
        </span>
      </div>

      <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex min-w-[560px] gap-2">
          {steps.map((t, i) => {
            const shown = i <= step;
            const isCurrent = i === step;
            const statusColor =
              t.status === "good" ? GOOD : t.status === "warn" ? WARN : color;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                {/* client request (↑) */}
                <div className="flex h-9 flex-col items-center justify-end leading-none">
                  {shown && t.up && (
                    <motion.div
                      key={`u${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="font-mono text-sm" style={{ color }}>
                        ↑
                      </span>
                      <span className="font-mono text-[10px]" style={{ color }}>
                        {t.up}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* message available marker (✉) */}
                <div className="flex h-4 items-center justify-center leading-none">
                  {shown && t.msg && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm"
                      style={{ color: GOOD }}
                      title="message available on server"
                    >
                      ✉
                    </motion.span>
                  )}
                </div>

                {/* server response / push (↓) */}
                <div className="flex h-11 flex-col items-center justify-start leading-none">
                  {shown && t.down && (
                    <motion.div
                      key={`d${i}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="font-mono text-sm" style={{ color: statusColor }}>
                        ↓
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: statusColor }}>
                        {t.down}
                      </span>
                      {t.tag && (
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider"
                          style={{ color: statusColor }}
                        >
                          {t.tag}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* numbered tick cell */}
                <div
                  className="grid h-7 w-7 place-items-center rounded-md border font-mono text-xs transition-colors"
                  style={
                    isCurrent
                      ? { borderColor: color, background: tint(color, 14), color }
                      : shown
                        ? { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                        : { borderColor: "var(--color-line-soft)", color: "var(--color-faint)" }
                  }
                >
                  {i}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
        <span>↑ client request</span>
        <span>↓ server message</span>
        <span>✉ message available</span>
        <span style={{ color: WARN }}>■ wasted</span>
        <span style={{ color: GOOD }}>■ delivered</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {current.note}
      </p>
    </div>
  );
}
