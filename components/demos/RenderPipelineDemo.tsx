"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Stage = { label: string; sub: string; note: string };

const steps: Stage[] = [
  {
    label: "Parse HTML",
    sub: "→ DOM",
    note: "The browser reads the HTML top to bottom and builds the DOM — a tree of nodes, one per tag.",
  },
  {
    label: "Parse CSS",
    sub: "→ CSSOM",
    note: "The CSS is parsed into the CSSOM: every style rule and which elements it applies to.",
  },
  {
    label: "Render tree",
    sub: "combine",
    note: "DOM + CSSOM merge into the render tree — only the nodes that will actually be visible.",
  },
  {
    label: "Layout",
    sub: "geometry",
    note: "Layout walks the render tree and computes each box's size and position on the page.",
  },
  {
    label: "Paint",
    sub: "pixels",
    note: "Paint fills in the pixels — text, colors, borders, shadows — onto layers.",
  },
  {
    label: "Composite",
    sub: "→ screen",
    note: "The compositor stacks the layers in order and hands the finished frame to the screen.",
  },
];

type Box = { id: string; label: string; left: string; top: string; width: string; height: string };

const boxes: Box[] = [
  { id: "header", label: "header", left: "8%", top: "9%", width: "84%", height: "18%" },
  { id: "nav", label: "nav", left: "8%", top: "33%", width: "26%", height: "48%" },
  { id: "main", label: "main", left: "38%", top: "33%", width: "54%", height: "48%" },
  { id: "footer", label: "footer", left: "8%", top: "87%", width: "84%", height: "8%" },
];

export default function RenderPipelineDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;
  const stage = steps[step];

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  // Mock-page phase, derived from the step (no state).
  const laidOut = step >= 3; // Layout has run: boxes have geometry.
  const painted = step >= 4; // Paint has run: boxes have pixels.
  const composited = step >= 5; // Frame is on the screen.
  const pageCaption = composited
    ? "composited to the screen — done"
    : painted
      ? "pixels filled in (paint)"
      : laidOut
        ? "boxes positioned, not yet colored (layout)"
        : "blank — nothing to paint yet";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The critical rendering path, one stage at a time
      </h3>
      <p className="mt-1 text-sm text-dim">
        Step through how the browser turns files into pixels. Watch the mock page
        stay blank until layout, gain shape, then color.
      </p>

      {/* Controls */}
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

      {/* Stage row */}
      <div className="thin-scroll mt-4 flex items-stretch gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div
              key={s.label}
              className="flex min-w-[92px] flex-1 flex-col rounded-lg border px-2.5 py-2 transition-colors"
              style={{
                borderColor: active ? color : "var(--color-line)",
                background: active ? tint(color, 12) : "transparent",
                opacity: done || active ? 1 : 0.5,
              }}
            >
              <span className="font-mono text-[10px] text-faint">
                {done ? "✓" : i + 1}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: active ? color : "var(--color-text)" }}
              >
                {s.label}
              </span>
              <span className="font-mono text-[10px] text-faint">{s.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Detail + mock page */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            stage {step + 1} of {steps.length}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color }}>
            {stage.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-dim">{stage.note}</p>
        </div>

        <div>
          <div className="relative h-44 overflow-hidden rounded-xl border border-line bg-bg-2">
            {laidOut ? (
              boxes.map((b) => (
                <div
                  key={b.id}
                  className="absolute grid place-items-center rounded-md border transition-colors"
                  style={{
                    left: b.left,
                    top: b.top,
                    width: b.width,
                    height: b.height,
                    borderColor: painted ? tint(color, 45) : "var(--color-line)",
                    background: painted ? tint(color, 14) : "transparent",
                  }}
                >
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: painted ? color : "var(--color-faint)" }}
                  >
                    {b.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="grid h-full place-items-center">
                <span className="font-mono text-[11px] text-faint">
                  no pixels yet
                </span>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            {pageCaption}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {stage.note}
      </p>
    </div>
  );
}
