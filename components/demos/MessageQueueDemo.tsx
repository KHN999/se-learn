"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Tone = "good" | "bad" | "warn" | "normal";
type Mode = "direct" | "queued";

type Step = {
  note: string;
  producer: string;
  producerTone: Tone;
  queue: number[];
  consumer: string;
  consumerTone: Tone;
  active: number | null;
  done: number[];
  dropped: number[];
};

// Direct (synchronous): the producer calls the consumer and blocks. A burst plus
// a crash means work is dropped — there is no buffer to hold overflow.
const DIRECT: Step[] = [
  {
    note: "Direct call: the producer invokes the consumer with request #1 and waits for it to return.",
    producer: "calling #1, waiting",
    producerTone: "warn",
    queue: [],
    consumer: "receiving #1",
    consumerTone: "normal",
    active: 1,
    done: [],
    dropped: [],
  },
  {
    note: "The consumer is slow. The producer is BLOCKED — it cannot send anything else or do other work until this call returns.",
    producer: "blocked",
    producerTone: "warn",
    queue: [],
    consumer: "processing #1 (slow)",
    consumerTone: "normal",
    active: 1,
    done: [],
    dropped: [],
  },
  {
    note: "#1 finishes. The producer is free again — but it spent the whole time waiting on a single request.",
    producer: "free",
    producerTone: "normal",
    queue: [],
    consumer: "idle",
    consumerTone: "normal",
    active: null,
    done: [1],
    dropped: [],
  },
  {
    note: "A burst hits: #2, #3, #4 and #5 arrive together. A direct call handles one at a time, so the producer sends #2 and blocks. There is no queue to hold #3, #4, #5.",
    producer: "blocked on #2",
    producerTone: "bad",
    queue: [],
    consumer: "processing #2 (slow)",
    consumerTone: "normal",
    active: 2,
    done: [1],
    dropped: [],
  },
  {
    note: "The consumer crashes while handling #2. With no queue, #2 is gone — and #3, #4, #5 were never accepted. Four requests are lost.",
    producer: "stuck, call failed",
    producerTone: "bad",
    queue: [],
    consumer: "DOWN, crashed",
    consumerTone: "bad",
    active: null,
    done: [1],
    dropped: [2, 3, 4, 5],
  },
  {
    note: "Synchronous and tightly coupled: one slow or failed consumer blocks the producer and drops work. This cannot survive a burst.",
    producer: "stuck",
    producerTone: "bad",
    queue: [],
    consumer: "DOWN",
    consumerTone: "bad",
    active: null,
    done: [1],
    dropped: [2, 3, 4, 5],
  },
];

// Queued (async): the producer enqueues and moves on. The queue buffers a burst,
// the consumer drains it steadily, and a crash costs only a retry.
const QUEUED: Step[] = [
  {
    note: "The producer enqueues message #1 and immediately moves on — it does not wait for the consumer.",
    producer: "enqueued #1, moved on",
    producerTone: "good",
    queue: [1],
    consumer: "idle",
    consumerTone: "normal",
    active: null,
    done: [],
    dropped: [],
  },
  {
    note: "A burst hits: the producer rapidly enqueues #2, #3, #4, #5 and keeps going. The queue absorbs the spike — the producer never blocks.",
    producer: "free, never blocked",
    producerTone: "good",
    queue: [1, 2, 3, 4, 5],
    consumer: "starting up",
    consumerTone: "normal",
    active: null,
    done: [],
    dropped: [],
  },
  {
    note: "The consumer pulls the front message, #1, and processes it at its own pace.",
    producer: "free",
    producerTone: "normal",
    queue: [2, 3, 4, 5],
    consumer: "processing #1",
    consumerTone: "normal",
    active: 1,
    done: [],
    dropped: [],
  },
  {
    note: "#1 is acknowledged and done. The consumer takes the next message, #2.",
    producer: "free",
    producerTone: "normal",
    queue: [3, 4, 5],
    consumer: "processing #2",
    consumerTone: "normal",
    active: 2,
    done: [1],
    dropped: [],
  },
  {
    note: "The consumer crashes mid-#2. Because #2 was not yet acknowledged, it stays on the queue — nothing is lost.",
    producer: "free",
    producerTone: "normal",
    queue: [2, 3, 4, 5],
    consumer: "DOWN, crashed",
    consumerTone: "warn",
    active: null,
    done: [1],
    dropped: [],
  },
  {
    note: "A fresh consumer picks up #2 again and retries it. This is at-least-once delivery: a message is redelivered until it is acknowledged.",
    producer: "free",
    producerTone: "normal",
    queue: [3, 4, 5],
    consumer: "processing #2, retry",
    consumerTone: "warn",
    active: 2,
    done: [1],
    dropped: [],
  },
  {
    note: "#2 done. The consumer drains the next message, #3, steadily.",
    producer: "free",
    producerTone: "normal",
    queue: [4, 5],
    consumer: "processing #3",
    consumerTone: "normal",
    active: 3,
    done: [1, 2],
    dropped: [],
  },
  {
    note: "#3 done. Next up is #4. The backlog shrinks by one message per tick.",
    producer: "free",
    producerTone: "normal",
    queue: [5],
    consumer: "processing #4",
    consumerTone: "normal",
    active: 4,
    done: [1, 2, 3],
    dropped: [],
  },
  {
    note: "#4 done. The last message, #5, is now being processed.",
    producer: "free",
    producerTone: "normal",
    queue: [],
    consumer: "processing #5",
    consumerTone: "normal",
    active: 5,
    done: [1, 2, 3, 4],
    dropped: [],
  },
  {
    note: "Queue empty, all five processed. The burst was buffered, the producer never blocked, and the crash cost only a retry — no work lost.",
    producer: "free",
    producerTone: "good",
    queue: [],
    consumer: "idle, all done",
    consumerTone: "good",
    active: null,
    done: [1, 2, 3, 4, 5],
    dropped: [],
  },
];

function toneColor(tone: Tone, color: string): string {
  return tone === "good" ? GOOD : tone === "bad" ? BAD : tone === "warn" ? WARN : color;
}

function boxStyle(tone: Tone, color: string): React.CSSProperties {
  if (tone === "normal") return { borderColor: "var(--color-line)" };
  const c = toneColor(tone, color);
  return { borderColor: c, background: tint(c, 12), color: c };
}

const MODES: { key: Mode; label: string }[] = [
  { key: "direct", label: "Direct (synchronous)" },
  { key: "queued", label: "Queued (async)" },
];

export default function MessageQueueDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("direct");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = mode === "direct" ? DIRECT : QUEUED;
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;
  const hasQueue = mode === "queued";

  // Reset the walkthrough when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const connector = (
    <span
      aria-hidden
      className="self-center font-mono text-lg text-faint rotate-90 sm:rotate-0"
    >
      →
    </span>
  );

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        A message queue decouples producer from consumer
      </h3>
      <p className="mt-1 text-sm text-dim">
        A queue sits between the two sides, so a burst of work never blocks the
        producer or gets dropped when a consumer is slow or down.
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
        <span className="font-mono text-xs text-faint">
          {step + 1} / {steps.length}
        </span>
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {/* Producer */}
        <div className="flex-1 rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            Producer
          </p>
          <div
            className="rounded-lg border px-3 py-2 text-center text-sm text-dim"
            style={boxStyle(frame.producerTone, color)}
          >
            {frame.producer}
          </div>
        </div>

        {connector}

        {/* Queue / transport */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3 sm:flex-[1.4]">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            {hasQueue ? `Queue · FIFO · ${frame.queue.length}` : "Direct call"}
          </p>
          {hasQueue ? (
            frame.queue.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <AnimatePresence initial={false} mode="popLayout">
                  {frame.queue.map((id, idx) => {
                    const isFront = idx === 0;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between rounded-lg border px-3 py-1.5"
                        style={
                          isFront
                            ? { borderColor: color, background: tint(color, 8) }
                            : { borderColor: "var(--color-line)" }
                        }
                      >
                        <span className="font-mono text-sm text-text">#{id}</span>
                        {isFront ? (
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color }}
                          >
                            next out
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-faint">waiting</span>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <p className="py-3 text-center font-mono text-xs text-faint">empty</p>
            )
          ) : (
            <p className="py-3 text-center text-xs leading-relaxed text-faint">
              No queue between them. Nothing buffers a burst or holds a message
              when the consumer is down.
            </p>
          )}
        </div>

        {connector}

        {/* Consumer */}
        <div className="flex-1 rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            Consumer
          </p>
          <div
            className="rounded-lg border px-3 py-2 text-center text-sm text-dim"
            style={boxStyle(frame.consumerTone, color)}
          >
            {frame.consumer}
          </div>
          {frame.active !== null && (
            <motion.div
              key={frame.active}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5"
              style={{ borderColor: color, background: tint(color, 8) }}
            >
              <span className="font-mono text-sm text-text">#{frame.active}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                in flight
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md border border-line-soft px-2 py-1 font-mono text-faint">
          in queue: {frame.queue.length}
        </span>
        <span
          className="rounded-md border px-2 py-1 font-mono"
          style={{ color: GOOD, borderColor: tint(GOOD, 40), background: tint(GOOD, 10) }}
        >
          done: {frame.done.length}
        </span>
        <span
          className="rounded-md border px-2 py-1 font-mono"
          style={{ color: BAD, borderColor: tint(BAD, 40), background: tint(BAD, 10) }}
        >
          lost: {frame.dropped.length}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
