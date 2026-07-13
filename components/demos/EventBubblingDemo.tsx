"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type NodeId = "document" | "section" | "card" | "button";

// Bubble order: the event fires on the target first, then travels up.
const CHAIN: NodeId[] = ["button", "card", "section", "document"];
const TAG: Record<NodeId, string> = {
  document: "document",
  section: "section",
  card: "div.card",
  button: "button",
};

type Step = {
  active: NodeId | null;
  fired: NodeId[];
  halted: boolean;
  status: string;
};

function build(stop: boolean): Step[] {
  const steps: Step[] = [];
  const fired: NodeId[] = [];
  for (const node of CHAIN) {
    fired.push(node);
    let status: string;
    if (node === "button") {
      status =
        "Click lands on the button — handler fired on <button>, the event.target.";
    } else if (node === "card" && stop) {
      status =
        "Handler fired on <div.card> — and this one calls event.stopPropagation().";
    } else {
      status = `Bubbling up — handler fired on <${TAG[node]}>.`;
    }
    steps.push({ active: node, fired: [...fired], halted: false, status });
    if (stop && node === "card") {
      steps.push({
        active: null,
        fired: [...fired],
        halted: true,
        status:
          "Propagation halted at the card. <section> and <document> never fire — their handlers are skipped entirely.",
      });
      return steps;
    }
  }
  steps.push({
    active: null,
    fired: [...CHAIN],
    halted: false,
    status:
      "The event bubbled all the way to the top — every ancestor's handler ran, in order: button → card → section → document.",
  });
  return steps;
}

export default function EventBubblingDemo({ color }: { color: string }) {
  const [stop, setStop] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(stop);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the toggle changes (adjust state during render, no effect).
  const [prevMode, setPrevMode] = useState(stop);
  if (stop !== prevMode) {
    setPrevMode(stop);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      900,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const start = () => {
    setStep(0);
    setPlaying(true);
  };

  // Per-node state and its human-readable label for this frame.
  function nodeState(node: NodeId) {
    const isActive = frame.active === node;
    const hasFired = frame.fired.includes(node);
    const isSkipped = frame.halted && !hasFired;
    let label: string;
    if (isActive) label = "currentTarget · handler running";
    else if (hasFired) label = "handler fired";
    else if (isSkipped) label = "skipped · never fires";
    else label = "waiting";
    return { isActive, hasFired, isSkipped, label };
  }

  function shellStyle(node: NodeId): React.CSSProperties {
    const { isActive, isSkipped } = nodeState(node);
    if (isActive) {
      return { borderColor: color, background: tint(color, 8) };
    }
    if (isSkipped) {
      return { borderColor: "var(--color-line)", borderStyle: "dashed", opacity: 0.5 };
    }
    return { borderColor: "var(--color-line)" };
  }

  function labelRow(node: NodeId) {
    const { isActive, hasFired, isSkipped, label } = nodeState(node);
    const labelColor = isActive
      ? color
      : isSkipped
        ? "var(--color-faint)"
        : hasFired
          ? "var(--color-dim)"
          : "var(--color-faint)";
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-text">&lt;{TAG[node]}&gt;</span>
          {node === "button" && (
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide"
              style={{ background: tint(color, 14), color }}
            >
              event.target
            </span>
          )}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-wide"
          style={{ color: labelColor }}
        >
          {isSkipped ? "✕ " : ""}
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Event bubbling: one click, handlers up the whole tree
      </h3>
      <p className="mt-1 text-sm text-dim">
        A button nested in a card, in a section, in the document. Click it and
        watch the event fire on the target, then bubble up through each ancestor.
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
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => setStop((s) => !s)}
          aria-pressed={stop}
          className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
          style={
            stop
              ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          stopPropagation on card: {stop ? "on" : "off"}
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
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          DOM path (outer → inner)
        </p>

        {/* document */}
        <div
          className="rounded-xl border p-3 transition-colors"
          style={shellStyle("document")}
        >
          {labelRow("document")}

          {/* section */}
          <div
            className="mt-3 rounded-xl border p-3 transition-colors"
            style={shellStyle("section")}
          >
            {labelRow("section")}

            {/* card */}
            <div
              className="mt-3 rounded-xl border p-3 transition-colors"
              style={shellStyle("card")}
            >
              {labelRow("card")}

              {/* button */}
              <div
                className="mt-3 rounded-xl border p-3 transition-colors"
                style={shellStyle("button")}
              >
                {labelRow("button")}
                <div className="mt-2">
                  <button
                    onClick={start}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                    style={{ background: color }}
                  >
                    Delete
                  </button>
                  <span className="ml-2 text-xs text-faint">
                    ← click to fire the event
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.status}
      </p>
    </div>
  );
}
