"use client";

import { useState } from "react";
import { ArrowRight, Eye, TriangleAlert } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Frame = {
  fn: string;
  file: string;
  line: number;
  lib: boolean;
  note: string;
};

const ERROR_MESSAGE =
  "TypeError: Cannot read properties of undefined (reading 'total')";

const FRAMES: Frame[] = [
  {
    fn: "calculateTax",
    file: "checkout.js",
    line: 42,
    lib: false,
    note: "calculateTax at checkout.js:42 is the top frame and a file you wrote — this is exactly where the error was thrown. Open line 42 and check why the value it reads is undefined.",
  },
  {
    fn: "processOrder",
    file: "checkout.js",
    line: 88,
    lib: false,
    note: "processOrder at checkout.js:88 is what called calculateTax. If line 42 itself looks correct, check what this caller passed in.",
  },
  {
    fn: "handleSubmit",
    file: "app.js",
    line: 15,
    lib: false,
    note: "handleSubmit at app.js:15 started the whole chain when the form was submitted.",
  },
  {
    fn: "onClick",
    file: "react-dom.js",
    line: 9421,
    lib: true,
    note: "onClick in react-dom.js is framework code you did not write. Skip past it — the bug is not here.",
  },
  {
    fn: "dispatchEvent",
    file: "react-dom.js",
    line: 6842,
    lib: true,
    note: "dispatchEvent in react-dom.js is the React plumbing that delivered the click. Library code, not your bug — skip it.",
  },
];

const CULPRIT = FRAMES.findIndex((f) => !f.lib);

const DEFAULT_STATUS =
  "Do not panic at the wall of text. Read the message first (what went wrong), then jump to the top frame in a file you wrote.";

export default function StackTraceDemo({ color }: { color: string }) {
  const [highlight, setHighlight] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const status =
    selected !== null
      ? FRAMES[selected].note
      : highlight
        ? FRAMES[CULPRIT].note
        : DEFAULT_STATUS;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Reading a stack trace to the culprit
      </h3>
      <p className="mt-1 text-sm text-dim">
        The message says what broke. The frames below say where — the top is
        where it was thrown, and each line under it is the caller that led there.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setHighlight((h) => !h)}
          aria-pressed={highlight}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          style={{ background: color }}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {highlight ? "Showing my code" : "Highlight my code"}
        </button>
        <span className="text-xs text-faint">
          {highlight
            ? "Framework frames dimmed — start at the highlighted line."
            : "Dim the framework noise and find where to start."}
        </span>
      </div>

      <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4">
        <div
          className="flex items-start gap-2 font-mono text-sm"
          style={{ color: BAD }}
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-max">{ERROR_MESSAGE}</span>
        </div>
        <p className="mt-1 pl-6 text-[10px] uppercase tracking-widest text-faint">
          the message: what went wrong
        </p>

        <ul className="mt-3 flex flex-col gap-1.5">
          {FRAMES.map((f, i) => {
            const isCulprit = i === CULPRIT;
            const isSelected = selected === i;
            const dimmed = highlight && f.lib;
            const spotlight = highlight && isCulprit;
            return (
              <li key={f.fn}>
                <button
                  onClick={() => setSelected((s) => (s === i ? null : i))}
                  aria-pressed={isSelected}
                  className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-left transition-colors"
                  style={{
                    opacity: dimmed ? 0.4 : 1,
                    borderColor: spotlight
                      ? WARN
                      : isSelected
                        ? color
                        : "var(--color-line-soft)",
                    background: spotlight
                      ? tint(WARN, 12)
                      : isSelected
                        ? tint(color, 10)
                        : "transparent",
                  }}
                >
                  <span className="font-mono text-xs text-faint">at</span>
                  <span className="font-mono text-sm text-text">{f.fn}</span>
                  <span className="font-mono text-xs text-dim">
                    ({f.file}:{f.line})
                  </span>
                  <span
                    className="ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={
                      f.lib
                        ? {
                            color: "var(--color-faint)",
                            background: "var(--color-line-soft)",
                          }
                        : { color: GOOD, background: tint(GOOD, 14) }
                    }
                  >
                    {f.lib ? "library" : "your code"}
                  </span>
                  {spotlight ? (
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: WARN, background: tint(WARN, 16) }}
                    >
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      start here
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ol className="mt-4 flex flex-col gap-1.5 text-sm text-dim">
        <li>
          <span className="font-medium text-text">1.</span> Read the message — it
          names what went wrong: a value was undefined when the code expected an
          object with a total.
        </li>
        <li>
          <span className="font-medium text-text">2.</span> The top frame is
          where it was thrown; each line below is the caller that led there.
        </li>
        <li>
          <span className="font-medium text-text">3.</span> Walk down past any
          library frames to the first file you wrote — here, checkout.js:42 — and
          inspect that line.
        </li>
      </ol>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
