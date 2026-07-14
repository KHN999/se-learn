"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const CAP = 2; // channel buffer capacity
const TOTAL = 3; // values the producer will send

type Snap = {
  pending: number[]; // values still held by the producer
  blocked: boolean; // front value is trying to send but the buffer is full
  buffer: number[]; // channel contents (length <= CAP)
  got: number[]; // values the consumer has received
  note: string;
};

const STEPS: Snap[] = [
  {
    pending: [1, 2, 3],
    blocked: false,
    buffer: [],
    got: [],
    note: "The producer holds 1, 2, 3 to send. The channel is an empty buffer (capacity 2). The consumer waits to receive.",
  },
  {
    pending: [2, 3],
    blocked: false,
    buffer: [1],
    got: [],
    note: "ch <- 1 — the producer sends 1 into the channel. Buffer: [1].",
  },
  {
    pending: [3],
    blocked: false,
    buffer: [1, 2],
    got: [],
    note: "ch <- 2 — the producer sends 2. Buffer: [1, 2] — now FULL.",
  },
  {
    pending: [3],
    blocked: true,
    buffer: [1, 2],
    got: [],
    note: "ch <- 3 BLOCKS — the buffer is full, so the send waits. That is backpressure: a fast producer is paced by a slower consumer.",
  },
  {
    pending: [3],
    blocked: false,
    buffer: [2],
    got: [1],
    note: "v := <-ch — the consumer receives 1. Buffer: [2]. A slot frees up, so the blocked send can proceed.",
  },
  {
    pending: [],
    blocked: false,
    buffer: [2, 3],
    got: [1],
    note: "ch <- 3 unblocks and completes. Buffer: [2, 3]. The producer has sent everything.",
  },
  {
    pending: [],
    blocked: false,
    buffer: [3],
    got: [1, 2],
    note: "v := <-ch — the consumer receives 2. Buffer: [3].",
  },
  {
    pending: [],
    blocked: false,
    buffer: [],
    got: [1, 2, 3],
    note: "v := <-ch — the consumer receives 3. Buffer empty. All three values were delivered, in order.",
  },
];

const SNIPPET = [
  "ch := make(chan int, 2)   // buffered channel, capacity 2",
  "ch <- v                   // send    (blocks when full)",
  "v := <-ch                 // receive (blocks when empty)",
].join("\n");

const CONCEPT =
  "Channels pass messages between concurrent tasks, so they coordinate without shared mutable state or locks: “do not communicate by sharing memory; share memory by communicating.” A full buffer provides natural backpressure.";

function Chip({
  value,
  accent,
  label,
}: {
  value: number;
  accent: string;
  label?: string;
}) {
  return (
    <motion.div
      layout
      layoutId={`tok-${value}`}
      transition={{ duration: 0.35 }}
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-sm text-text"
      style={{ borderColor: accent, background: tint(accent, 12) }}
    >
      {value}
      {label ? (
        <span
          className="font-mono text-[9px] font-semibold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {label}
        </span>
      ) : null}
    </motion.div>
  );
}

export default function ChannelsDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const isFull = frame.buffer.length >= CAP;
  const done = frame.got.length >= TOTAL;

  const state = done
    ? { text: "done", accent: GOOD }
    : frame.blocked
      ? { text: "send blocked", accent: WARN }
      : isFull
        ? { text: "buffer full", accent: WARN }
        : step === 0
          ? { text: "ready", accent: color }
          : { text: "flowing", accent: color };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Channels: share memory by communicating
      </h3>
      <p className="mt-1 text-sm text-dim">
        A producer sends values into a channel; a consumer receives them. The
        buffer smooths the handoff — and when it fills up, it pushes back.
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
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
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
          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>

        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]"
          style={{ borderColor: state.accent, color: state.accent }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: state.accent }}
            aria-hidden
          />
          {state.text}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* Producer */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            producer · send →
          </p>
          <div className="flex min-h-[3.5rem] flex-wrap content-start gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.pending.length === 0 ? (
                <motion.span
                  key="p-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs text-faint"
                >
                  nothing left to send
                </motion.span>
              ) : (
                frame.pending.map((v, i) => (
                  <Chip
                    key={v}
                    value={v}
                    accent={frame.blocked && i === 0 ? WARN : color}
                    label={frame.blocked && i === 0 ? "blocked" : undefined}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Channel */}
        <div
          className="rounded-xl border p-3 transition-colors"
          style={{
            borderColor: isFull ? WARN : "var(--color-line)",
            background: isFull ? tint(WARN, 7) : "var(--color-bg-2)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              channel · buffer (cap {CAP})
            </p>
            {isFull ? (
              <span
                className="font-mono text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: WARN }}
              >
                full
              </span>
            ) : null}
          </div>
          <div className="flex min-h-[3.5rem] items-center gap-2">
            {Array.from({ length: CAP }).map((_, i) => {
              const v = frame.buffer[i];
              if (v === undefined) {
                return (
                  <div
                    key={`slot-${i}`}
                    className="grid h-9 flex-1 place-items-center rounded-md border border-dashed border-line font-mono text-[10px] text-faint"
                  >
                    empty
                  </div>
                );
              }
              return (
                <div key={`filled-${i}`} className="flex-1">
                  <Chip value={v} accent={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Consumer */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            consumer · ← receive
          </p>
          <div className="flex min-h-[3.5rem] flex-wrap content-start gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.got.length === 0 ? (
                <motion.span
                  key="c-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs text-faint"
                >
                  waiting to receive
                </motion.span>
              ) : (
                frame.got.map((v) => <Chip key={v} value={v} accent={GOOD} />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
        {SNIPPET}
      </pre>

      <div
        className="mt-3 space-y-2"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm leading-relaxed text-dim">{frame.note}</p>
        <p className="text-xs leading-relaxed text-faint">{CONCEPT}</p>
      </div>
    </div>
  );
}
