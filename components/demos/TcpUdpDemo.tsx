"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type WireStatus = "arrive" | "lost" | "retransmit";
type Wire = { packet: number; status: WireStatus } | null;
type Step = {
  note: string;
  sent: number[]; // distinct packets dispatched so far (faded in the sender)
  wire: Wire; // what is crossing the link right now
  buffer: number[]; // TCP only: received but held back (out of order)
  delivered: number[]; // receiver's delivered list, in the order the app sees it
};

const ALL = [1, 2, 3, 4, 5];

// Deterministic, hand-written scripts. The link always drops 2 and 4 on their
// first attempt — no randomness.
const TCP_STEPS: Step[] = [
  {
    note: "Sender has 5 numbered packets to deliver. TCP will guarantee they reach the app in order — even if some are lost.",
    sent: [],
    wire: null,
    buffer: [],
    delivered: [],
  },
  {
    note: "Packet 1 crosses the link and is delivered to the app in order.",
    sent: [1],
    wire: { packet: 1, status: "arrive" },
    buffer: [],
    delivered: [1],
  },
  {
    note: "Packet 2 is lost on the link (✗). The receiver never sees it — but TCP is tracking acknowledgements, so it will notice.",
    sent: [1, 2],
    wire: { packet: 2, status: "lost" },
    buffer: [],
    delivered: [1],
  },
  {
    note: "Packet 3 arrives, but TCP can't deliver it yet — packet 2 is still missing. It's held in a buffer. This wait is head-of-line blocking.",
    sent: [1, 2, 3],
    wire: { packet: 3, status: "arrive" },
    buffer: [3],
    delivered: [1],
  },
  {
    note: "Packet 2 was never acknowledged, so TCP retransmits it.",
    sent: [1, 2, 3],
    wire: { packet: 2, status: "retransmit" },
    buffer: [3],
    delivered: [1],
  },
  {
    note: "Packet 2 arrives — now TCP can release it AND the buffered 3, back in order.",
    sent: [1, 2, 3],
    wire: { packet: 2, status: "arrive" },
    buffer: [],
    delivered: [1, 2, 3],
  },
  {
    note: "Packet 4 is lost on the link (✗). Everything behind it will have to wait again.",
    sent: [1, 2, 3, 4],
    wire: { packet: 4, status: "lost" },
    buffer: [],
    delivered: [1, 2, 3],
  },
  {
    note: "Packet 5 arrives but can't be delivered — packet 4 is missing, so 5 waits in the buffer (head-of-line blocking again).",
    sent: [1, 2, 3, 4, 5],
    wire: { packet: 5, status: "arrive" },
    buffer: [5],
    delivered: [1, 2, 3],
  },
  {
    note: "TCP retransmits the missing packet 4.",
    sent: [1, 2, 3, 4, 5],
    wire: { packet: 4, status: "retransmit" },
    buffer: [5],
    delivered: [1, 2, 3],
  },
  {
    note: "TCP guarantees every byte, in order — at the cost of retransmit delay and head-of-line blocking (one lost packet stalls everything behind it).",
    sent: [1, 2, 3, 4, 5],
    wire: { packet: 4, status: "arrive" },
    buffer: [],
    delivered: [1, 2, 3, 4, 5],
  },
];

const UDP_STEPS: Step[] = [
  {
    note: "Sender has the same 5 packets. UDP just fires each one — no acknowledgements, no ordering, no memory of what was sent.",
    sent: [],
    wire: null,
    buffer: [],
    delivered: [],
  },
  {
    note: "Packet 1 arrives and is handed to the app immediately.",
    sent: [1],
    wire: { packet: 1, status: "arrive" },
    buffer: [],
    delivered: [1],
  },
  {
    note: "Packet 2 is lost (✗). UDP does not retransmit — it's gone for good, and the sender never even knows.",
    sent: [1, 2],
    wire: { packet: 2, status: "lost" },
    buffer: [],
    delivered: [1],
  },
  {
    note: "Packet 3 arrives and is delivered right away — no waiting for the missing 2. The app sees a gap.",
    sent: [1, 2, 3],
    wire: { packet: 3, status: "arrive" },
    buffer: [],
    delivered: [1, 3],
  },
  {
    note: "Packet 4 is lost (✗). Again, no retransmit — best-effort means best-effort.",
    sent: [1, 2, 3, 4],
    wire: { packet: 4, status: "lost" },
    buffer: [],
    delivered: [1, 3],
  },
  {
    note: "UDP just fires and forgets — lowest latency, no waiting, but lost packets stay lost and order isn't guaranteed. For live voice/video, dropping a stale packet is the right call.",
    sent: [1, 2, 3, 4, 5],
    wire: { packet: 5, status: "arrive" },
    buffer: [],
    delivered: [1, 3, 5],
  },
];

const MODES = [
  { key: "tcp", label: "TCP" },
  { key: "udp", label: "UDP" },
] as const;
type Mode = (typeof MODES)[number]["key"];

function PacketChip({
  n,
  color,
  bg,
  border,
  suffix,
}: {
  n: number;
  color: string;
  bg: string;
  border: string;
  suffix?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs"
      style={{ color, background: bg, borderColor: border }}
    >
      <span className="font-semibold">{n}</span>
      {suffix ? <span className="text-[10px] uppercase tracking-wider">{suffix}</span> : null}
    </span>
  );
}

export default function TcpUdpDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("tcp");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = mode === "tcp" ? TCP_STEPS : UDP_STEPS;

  // Reset when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  const current = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const { wire } = current;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        TCP vs UDP: how each handles lost, out-of-order packets
      </h3>
      <p className="mt-1 text-sm text-dim">
        The sender ships 5 numbered packets. The link always drops 2 and 4 on
        their first try — watch how each protocol reacts.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
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
          aria-label="reset to start"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Sender */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            sender
          </p>
          <div className="flex flex-col items-center gap-1.5">
            {ALL.map((n) => {
              const dispatched = current.sent.includes(n);
              return (
                <span
                  key={n}
                  className="w-full rounded-md border px-2 py-1 text-center font-mono text-xs transition-opacity"
                  style={{
                    color: dispatched ? "var(--color-faint)" : "var(--color-text)",
                    borderColor: "var(--color-line)",
                    opacity: dispatched ? 0.4 : 1,
                  }}
                >
                  {n}
                </span>
              );
            })}
          </div>
        </div>

        {/* Wire */}
        <div className="flex flex-col rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            wire
          </p>
          <div className="relative grid min-h-[7.5rem] flex-1 place-items-center overflow-hidden">
            <AnimatePresence mode="wait">
              {wire ? (
                <motion.div
                  key={`${step}-${wire.packet}-${wire.status}`}
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 28 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  {wire.status === "lost" ? (
                    <PacketChip
                      n={wire.packet}
                      color={BAD}
                      bg={`${BAD}1f`}
                      border={`${BAD}66`}
                      suffix="✗ lost"
                    />
                  ) : wire.status === "retransmit" ? (
                    <PacketChip
                      n={wire.packet}
                      color={WARN}
                      bg={`${WARN}1f`}
                      border={`${WARN}66`}
                      suffix="retransmit"
                    />
                  ) : (
                    <PacketChip
                      n={wire.packet}
                      color={GOOD}
                      bg={`${GOOD}1f`}
                      border={`${GOOD}66`}
                      suffix="→ arrives"
                    />
                  )}
                </motion.div>
              ) : (
                <span key="idle" className="font-mono text-[11px] text-faint">
                  idle
                </span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Receiver */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            receiver → app
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <AnimatePresence initial={false}>
              {current.delivered.map((n) => (
                <motion.div
                  key={n}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <PacketChip n={n} color={GOOD} bg={`${GOOD}1f`} border={`${GOOD}66`} />
                </motion.div>
              ))}
            </AnimatePresence>
            {current.delivered.length === 0 ? (
              <span className="font-mono text-[11px] text-faint">nothing yet</span>
            ) : null}
          </div>

          {current.buffer.length > 0 ? (
            <div className="mt-3 border-t border-line-soft pt-2">
              <p className="mb-1.5 text-center font-mono text-[9px] uppercase tracking-widest text-faint">
                buffered — held back
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {current.buffer.map((n) => (
                  <PacketChip
                    key={n}
                    n={n}
                    color={WARN}
                    bg={`${WARN}14`}
                    border={`${WARN}55`}
                    suffix="waiting"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {current.note}
      </p>
    </div>
  );
}
