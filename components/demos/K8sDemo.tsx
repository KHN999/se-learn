"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type PodStatus = "starting" | "running" | "crashed";
type Pod = { id: string; status: PodStatus };
type Step = { desired: number; pods: Pod[]; note: string };

const STEPS: Step[] = [
  {
    desired: 3,
    pods: [
      { id: "p1", status: "starting" },
      { id: "p2", status: "starting" },
      { id: "p3", status: "starting" },
    ],
    note: "You applied the manifest: desired = 3. Kubernetes records WHAT you want and schedules 3 pods — they are starting up.",
  },
  {
    desired: 3,
    pods: [
      { id: "p1", status: "running" },
      { id: "p2", status: "running" },
      { id: "p3", status: "running" },
    ],
    note: "Converged: 3 of 3 running. Actual now matches desired, so the control loop has nothing left to fix.",
  },
  {
    desired: 3,
    pods: [
      { id: "p1", status: "running" },
      { id: "p2", status: "running" },
      { id: "p3", status: "crashed" },
    ],
    note: "A node died and one pod crashed: actual dropped to 2 of 3. Reality no longer matches your desired state.",
  },
  {
    desired: 3,
    pods: [
      { id: "p1", status: "running" },
      { id: "p2", status: "running" },
      { id: "p4", status: "running" },
    ],
    note: "The control loop noticed the 2 of 3 gap, terminated the dead pod and scheduled a replacement — back to 3 of 3, self-healed with no command from you.",
  },
  {
    desired: 5,
    pods: [
      { id: "p1", status: "running" },
      { id: "p2", status: "running" },
      { id: "p4", status: "running" },
      { id: "p5", status: "running" },
      { id: "p6", status: "running" },
    ],
    note: "You changed desired to 5. Kubernetes reconciled by scheduling 2 more pods → 5 of 5. You declare the target; the loop makes reality match it.",
  },
];

const META: Record<PodStatus, { c: string; label: string }> = {
  running: { c: GOOD, label: "running" },
  starting: { c: WARN, label: "starting" },
  crashed: { c: BAD, label: "crashed" },
};

export default function K8sDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const running = cur.pods.filter((p) => p.status === "running").length;
  const hasCrash = cur.pods.some((p) => p.status === "crashed");
  const converged = running === cur.desired && !hasCrash;
  const actualColor = converged ? GOOD : hasCrash ? BAD : WARN;
  const statusLabel = converged ? "converged" : hasCrash ? "gap detected" : "reconciling";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Kubernetes reconciles to your desired state
      </h3>
      <p className="mt-1 text-sm text-dim">
        You declare the desired state; the control loop continuously restarts,
        reschedules, and scales pods so reality matches it.
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
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: tint(color, 45), background: tint(color, 10) }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            desired
          </p>
          <p className="mt-1 text-2xl font-semibold" style={{ color }}>
            {cur.desired}
          </p>
        </div>
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: tint(actualColor, 45), background: tint(actualColor, 10) }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            actual (running)
          </p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: actualColor }}>
            {running}
            <span className="text-base text-dim">/{cur.desired}</span>
          </p>
        </div>
        <div className="col-span-2 flex items-center gap-2 rounded-xl border border-line-soft bg-bg-2/50 p-3 sm:col-span-1">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: actualColor }}
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              control loop
            </p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: actualColor }}>
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          cluster — step {step + 1} of {STEPS.length}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {cur.pods.map((pod) => {
              const meta = META[pod.status];
              return (
                <motion.div
                  key={pod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-24 flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5"
                  style={{
                    borderColor: tint(meta.c, 45),
                    background: tint(meta.c, 10),
                    borderStyle: pod.status === "crashed" ? "dashed" : "solid",
                  }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                    pod
                  </span>
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      className="h-2 w-2 rounded-full"
                      style={{ background: meta.c }}
                      animate={
                        pod.status === "starting"
                          ? { opacity: [1, 0.3, 1] }
                          : { opacity: 1 }
                      }
                      transition={
                        pod.status === "starting"
                          ? { duration: 1, repeat: Infinity }
                          : { duration: 0.2 }
                      }
                    />
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: meta.c }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {cur.note}
      </p>
    </div>
  );
}
