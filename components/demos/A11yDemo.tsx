"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Mode = "div" | "button";

type Row = {
  area: string;
  pass: boolean;
  detail: string;
  /** Optional monospace token, e.g. what the screen reader says. */
  mono?: string;
};

const MODES: { key: Mode; label: string; markup: string }[] = [
  {
    key: "div",
    label: "<div> styled as a button",
    markup: '<div class="btn" onclick="submit()">Submit</div>',
  },
  {
    key: "button",
    label: "semantic <button>",
    markup: "<button onclick=\"submit()\">Submit</button>",
  },
];

const DATA: Record<Mode, Row[]> = {
  div: [
    {
      area: "Screen reader announces",
      pass: false,
      mono: '"clickable" — no name, no role',
      detail:
        "A blind user can't tell it's a button or what it does. Often nothing useful is read at all.",
    },
    {
      area: "Keyboard",
      pass: false,
      detail:
        "Tab skips right past it (not in the focus order), and Enter / Space do nothing. Unreachable without a mouse.",
    },
    {
      area: "Accessibility tree node",
      pass: false,
      mono: "generic",
      detail:
        "Exposed as an anonymous box — no role, no accessible name. Assistive tech has nothing to work with.",
    },
  ],
  button: [
    {
      area: "Screen reader announces",
      pass: true,
      mono: '"Submit, button"',
      detail:
        "The name and role come for free from the element — the user knows exactly what it is.",
    },
    {
      area: "Keyboard",
      pass: true,
      detail:
        "Focusable with Tab, and both Enter and Space activate it. Works with no mouse at all.",
    },
    {
      area: "Accessibility tree node",
      pass: true,
      mono: 'button "Submit"',
      detail:
        "A proper button node with a role and an accessible name. Assistive tech knows what it is and how to use it.",
    },
  ],
};

export default function A11yDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("div");

  const rows = DATA[mode];
  const passCount = rows.filter((r) => r.pass).length;
  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  const summary =
    mode === "div"
      ? "Visually identical to the real button — but it fails all three. No screen-reader name, no keyboard access, no role in the accessibility tree. Every non-mouse user is silently locked out."
      : "One native <button> passes all three — screen reader, keyboard, and accessibility tree — with no extra code to write.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        A styled &lt;div&gt; vs a real &lt;button&gt;
      </h3>
      <p className="mt-1 text-sm text-dim">
        Both render the same pixels on screen. Flip between them and watch what
        actually reaches someone using a screen reader or a keyboard.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
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

      {/* Decorative preview: both modes render this identical pixel-perfect box. */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          what it looks like (identical either way)
        </p>
        <div className="flex justify-center" aria-hidden="true">
          <span
            className="rounded-lg px-4 py-2 text-sm font-medium text-bg"
            style={{ background: color }}
          >
            Submit
          </span>
        </div>
        <pre className="thin-scroll mt-3 overflow-x-auto rounded-lg border border-line bg-bg-2 p-3 font-mono text-xs text-dim">
          {active.markup}
        </pre>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {rows.map((r) => {
          const Icon = r.pass ? Check : X;
          const iconColor = r.pass ? GOOD : BAD;
          return (
            <li
              key={r.area}
              className="flex items-start gap-3 rounded-xl border border-line px-3 py-2.5"
            >
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"
                style={{ background: tint(iconColor, 16) }}
              >
                <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-faint">
                    {r.area}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: iconColor }}
                  >
                    {r.pass ? "Pass" : "Fail"}
                  </span>
                  {r.mono && (
                    <code className="rounded bg-bg-2 px-1.5 py-0.5 font-mono text-xs text-dim">
                      {r.mono}
                    </code>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-dim">{r.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {passCount} of 3 checks pass. {summary}
      </p>
    </div>
  );
}
