"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "h1" | "h2" | "h3";
type Step = { bars: number[]; note: string; lostB?: boolean };

const RESOURCES = [
  { label: "A", name: "style.css" },
  { label: "B", name: "big.js" },
  { label: "C", name: "logo.png" },
  { label: "D", name: "font.woff" },
];

// HTTP/1.1 — serial. One request at a time: A -> B -> C -> D.
// B is slow (lost packet), so C and D sit at 0% the whole time. Longest total.
const H1: Step[] = [
  { bars: [0, 0, 0, 0], note: "One TCP connection. HTTP/1.1 sends one request at a time — A goes first; B, C and D wait their turn." },
  { bars: [55, 0, 0, 0], note: "A (style.css) is downloading. Nothing else can start on this connection yet." },
  { bars: [100, 0, 0, 0], note: "A is done. Now B (big.js) starts — C and D still wait in line." },
  { bars: [100, 35, 0, 0], note: "B (big.js) is downloading — it's the big one." },
  { bars: [100, 35, 0, 0], lostB: true, note: "B just lost a packet. The connection stalls waiting for a retransmit — C and D are stuck behind it." },
  { bars: [100, 35, 0, 0], lostB: true, note: "Still waiting on B's retransmit. C and D can't even begin (head-of-line blocking)." },
  { bars: [100, 75, 0, 0], note: "B recovers and resumes downloading. C and D are still blocked." },
  { bars: [100, 100, 0, 0], note: "B finally finishes. Only now can C start." },
  { bars: [100, 100, 100, 0], note: "C (logo.png) downloads quickly. D is next." },
  { bars: [100, 100, 100, 100], note: "HTTP/1.1 sends one request at a time per connection — B's delay blocks C and D behind it (head-of-line blocking)." },
];

// HTTP/2 — multiplexed streams over one TCP connection. All four progress in
// parallel, but one lost TCP packet stalls EVERY stream at once.
const H2: Step[] = [
  { bars: [0, 0, 0, 0], note: "One connection, but HTTP/2 multiplexes: A, B, C and D all stream in parallel from the start." },
  { bars: [30, 25, 35, 35], note: "All four resources download at once, interleaved over the single TCP connection." },
  { bars: [55, 45, 65, 65], note: "Still going in parallel — already far ahead of HTTP/1.1." },
  { bars: [55, 45, 65, 65], lostB: true, note: "B loses a TCP packet. Because all streams share one TCP connection, every stream stalls at once." },
  { bars: [55, 45, 65, 65], lostB: true, note: "TCP won't deliver later data until the lost packet is retransmitted — A, C and D are held back too." },
  { bars: [85, 75, 90, 90], note: "The retransmit arrives; all four streams resume together." },
  { bars: [100, 100, 100, 100], note: "HTTP/2 multiplexes all four over one connection — much faster — but a single lost TCP packet stalls every stream at once." },
];

// HTTP/3 — independent streams over QUIC (UDP). A lost packet on B only stalls
// B; A, C and D keep going and finish uninterrupted.
const H3: Step[] = [
  { bars: [0, 0, 0, 0], note: "HTTP/3 runs over QUIC (UDP). Each resource is an independent stream." },
  { bars: [35, 30, 40, 40], note: "A, B, C and D stream in parallel, just like HTTP/2." },
  { bars: [65, 50, 75, 75], note: "All progressing independently over QUIC." },
  { bars: [85, 50, 95, 95], lostB: true, note: "B loses a packet — but QUIC keeps each stream independent, so only B pauses." },
  { bars: [100, 50, 100, 100], note: "A, C and D finish uninterrupted while B waits for its retransmit." },
  { bars: [100, 80, 100, 100], note: "B's lost packet is retransmitted and B resumes." },
  { bars: [100, 100, 100, 100], note: "HTTP/3 runs each stream independently over QUIC — B's lost packet only stalls B; the others finish uninterrupted." },
];

const SCHEDULES: Record<Mode, Step[]> = { h1: H1, h2: H2, h3: H3 };
const MODES: { key: Mode; label: string }[] = [
  { key: "h1", label: "HTTP/1.1" },
  { key: "h2", label: "HTTP/2" },
  { key: "h3", label: "HTTP/3" },
];

export default function MultiplexingDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("h1");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = SCHEDULES[mode];
  const cur = steps[Math.min(step, steps.length - 1)];
  const prev = step > 0 ? steps[step - 1].bars : cur.bars;
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

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        One connection, many files: HTTP/1.1 vs HTTP/2 vs HTTP/3
      </h3>
      <p className="mt-1 text-sm text-dim">
        Four resources are requested over one connection. B (big.js) hits a lost
        packet — watch how each protocol handles the stall.
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
              style={on ? { background: tint(color, 16), color, borderColor: tint(color, 45) } : { color: "var(--color-dim)", borderColor: "var(--color-line)" }}
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
        <span className="font-mono text-xs text-faint">
          tick {step + 1} / {steps.length}
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

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        {RESOURCES.map((r, i) => {
          const value = cur.bars[i];
          const done = value === 100;
          const isLostB = i === 1 && !!cur.lostB;
          const stalled = step > 0 && value === prev[i] && value > 0 && value < 100;

          const fillColor = done ? GOOD : isLostB ? WARN : color;

          let status = `${value}%`;
          let statusColor = "var(--color-dim)";
          if (done) {
            status = "done";
            statusColor = GOOD;
          } else if (isLostB) {
            status = "packet lost";
            statusColor = BAD;
          } else if (value === 0) {
            status = "waiting";
            statusColor = "var(--color-faint)";
          } else if (stalled) {
            status = "stalled";
            statusColor = WARN;
          }

          return (
            <div key={r.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-xs">
                <span className="text-text">{r.label}</span>{" "}
                <span className="text-faint">{r.name}</span>
              </span>
              <div
                className="relative h-2.5 flex-1 overflow-hidden rounded-full border border-line-soft bg-bg-2"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${r.name} download progress`}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: fillColor }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span
                className="w-20 shrink-0 text-right font-mono text-[11px]"
                style={{ color: statusColor }}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cur.note}
      </p>
    </div>
  );
}
