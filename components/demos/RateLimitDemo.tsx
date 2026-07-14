"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Check, Droplet, Pause, Play, Plus, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const CAP = 5; // bucket capacity
const REFILL = 1; // tokens added per tick

type Outcome = "start" | "allowed" | "throttled" | "refill";
type Step = {
  bucket: number;
  outcome: Outcome;
  reqId?: number;
  allowed: number;
  throttled: number;
  note: string;
};

// A deterministic scripted burst: a client fires many requests fast, drains the
// bucket, gets 429s, then some succeed again as tokens refill over ticks.
type Action = "tick" | { req: number };
const SCRIPT: Action[] = [
  { req: 1 },
  { req: 2 },
  { req: 3 },
  { req: 4 },
  { req: 5 }, // burst drains 5 -> 0, all allowed
  { req: 6 },
  { req: 7 },
  { req: 8 }, // empty bucket -> 429
  "tick", // refill 0 -> 1
  { req: 9 }, // allowed again
  "tick", // refill 0 -> 1
  "tick", // refill 1 -> 2
  { req: 10 },
  { req: 11 }, // 2 -> 1 -> 0, allowed
  { req: 12 }, // empty again -> 429
];

function buildSteps(): Step[] {
  let bucket = CAP;
  let allowed = 0;
  let throttled = 0;
  const out: Step[] = [
    {
      bucket,
      outcome: "start",
      allowed,
      throttled,
      note: `The bucket starts full with ${CAP} tokens and refills ${REFILL} token per tick, never past ${CAP}.`,
    },
  ];
  for (const action of SCRIPT) {
    if (action === "tick") {
      bucket = Math.min(CAP, bucket + REFILL);
      out.push({
        bucket,
        outcome: "refill",
        allowed,
        throttled,
        note: `Tick: one token refilled. The bucket is now ${bucket} of ${CAP}.`,
      });
    } else if (bucket > 0) {
      bucket -= 1;
      allowed += 1;
      out.push({
        bucket,
        outcome: "allowed",
        reqId: action.req,
        allowed,
        throttled,
        note: `Request #${action.req} spends 1 token and is allowed. ${bucket} left in the bucket.`,
      });
    } else {
      throttled += 1;
      out.push({
        bucket,
        outcome: "throttled",
        reqId: action.req,
        allowed,
        throttled,
        note: `Request #${action.req} hits an empty bucket, so it is rejected with 429 Too Many Requests.`,
      });
    }
  }
  return out;
}

const steps = buildSteps();

export default function RateLimitDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 700);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const oColor =
    frame.outcome === "allowed"
      ? GOOD
      : frame.outcome === "throttled"
        ? BAD
        : frame.outcome === "refill"
          ? WARN
          : color;

  const oLabel =
    frame.outcome === "allowed"
      ? "Allowed"
      : frame.outcome === "throttled"
        ? "429 Too Many Requests"
        : frame.outcome === "refill"
          ? "Token refilled"
          : "Bucket full";

  const oSub =
    frame.outcome === "allowed"
      ? `request #${frame.reqId} · 200 OK`
      : frame.outcome === "throttled"
        ? `request #${frame.reqId} · rejected`
        : frame.outcome === "refill"
          ? `+${REFILL} per tick`
          : `capacity ${CAP}`;

  const OutcomeIcon =
    frame.outcome === "allowed"
      ? Check
      : frame.outcome === "throttled"
        ? Ban
        : frame.outcome === "refill"
          ? Plus
          : Droplet;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Rate limiting with a token bucket</h3>
      <p className="mt-1 text-sm text-dim">
        A bucket holds up to {CAP} tokens and refills {REFILL} per tick. Each
        request spends a token; when the bucket is empty, the request gets a 429.
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            token bucket
          </span>
          <span className="font-mono text-xs text-dim">
            {frame.bucket} / {CAP} tokens
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {Array.from({ length: CAP }).map((_, i) => {
            const filled = i < frame.bucket;
            return (
              <div
                key={i}
                className="relative h-9 flex-1 overflow-hidden rounded-lg border border-line bg-bg-2"
              >
                <AnimatePresence>
                  {filled ? (
                    <motion.div
                      key="fill"
                      initial={{ opacity: 0, scaleY: 0.4 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0.4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 origin-bottom rounded-lg"
                      style={{ background: tint(color, 30), borderColor: color }}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5"
        style={{ borderColor: tint(oColor, 45), background: tint(oColor, 12) }}
      >
        <span
          className="grid h-6 w-6 place-items-center rounded-full"
          style={{ background: tint(oColor, 22), color: oColor }}
        >
          <OutcomeIcon className="h-3.5 w-3.5" />
        </span>
        <span className="text-sm font-medium" style={{ color: oColor }}>
          {oLabel}
        </span>
        <span className="ml-auto font-mono text-xs text-faint">{oSub}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2">
          <Check className="h-4 w-4" style={{ color: GOOD }} />
          <span className="text-sm text-dim">Allowed</span>
          <span className="ml-auto font-mono text-sm" style={{ color: GOOD }}>
            {frame.allowed}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2">
          <Ban className="h-4 w-4" style={{ color: BAD }} />
          <span className="text-sm text-dim">Throttled</span>
          <span className="ml-auto font-mono text-sm" style={{ color: BAD }}>
            {frame.throttled}
          </span>
        </div>
      </div>

      <div
        className="mt-3 space-y-1.5 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        <p className="text-text">{frame.note}</p>
        <p>
          A token bucket lets short bursts through up to capacity, but caps the
          sustained rate. That turns cheap high-volume abuse like brute force or
          scraping into slow, expensive attempts. Reject the overflow with 429
          Too Many Requests and a Retry-After header.
        </p>
      </div>
    </div>
  );
}
