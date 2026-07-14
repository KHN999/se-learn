"use client";

import { useState } from "react";
import { Bug, Check, Wrench, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Item = { price: number; qty: number };

// The function under test, in two versions. The buggy one forgets to multiply
// by quantity, so any line with qty > 1 comes out short.
const buggy = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.price, 0);

const fixed = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0);

const BUGGY_SRC = `function cartTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.price,
    0
  );
}`;

const FIXED_SRC = `function cartTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
}`;

type Case = { expr: string; input: Item[]; expected: number };

const CASES: Case[] = [
  { expr: "cartTotal([])", input: [], expected: 0 },
  {
    expr: "cartTotal([{ price: 5, qty: 1 }])",
    input: [{ price: 5, qty: 1 }],
    expected: 5,
  },
  {
    expr: "cartTotal([{ price: 3, qty: 4 }])",
    input: [{ price: 3, qty: 4 }],
    expected: 12,
  },
  {
    expr: "cartTotal([{ price: 2, qty: 2 }, { price: 10, qty: 1 }])",
    input: [
      { price: 2, qty: 2 },
      { price: 10, qty: 1 },
    ],
    expected: 14,
  },
  {
    expr: "cartTotal([{ price: 8, qty: 1 }, { price: 1, qty: 1 }])",
    input: [
      { price: 8, qty: 1 },
      { price: 1, qty: 1 },
    ],
    expected: 9,
  },
];

const TOGGLES = [
  { buggy: true, label: "Buggy version", Icon: Bug },
  { buggy: false, label: "Fixed version", Icon: Wrench },
];

export default function TestRunnerDemo({ color }: { color: string }) {
  const [isBuggy, setIsBuggy] = useState(true);

  const fn = isBuggy ? buggy : fixed;
  const src = isBuggy ? BUGGY_SRC : FIXED_SRC;
  const results = CASES.map((c) => {
    const actual = fn(c.input);
    return { ...c, actual, pass: actual === c.expected };
  });
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  const allPass = failed === 0;
  const tone = allPass ? GOOD : BAD;

  const status = allPass
    ? `A unit test pins the behavior of one function. All ${passed} tests are green — the suite now documents and guards cartTotal, so any later change that breaks it turns a test red right away.`
    : `A unit test pins the behavior of one function. ${failed} of ${results.length} tests are red — each failing row shows the expected value beside what the code actually returned. Fix the function and rerun to see green: fast feedback that also documents what the code should do.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Unit tests: red to green</h3>
      <p className="mt-1 text-sm text-dim">
        One tiny pure function, five tests. Flip the toggle to introduce a bug
        and watch two tests turn red.
      </p>

      <div className="mt-4 inline-flex gap-1.5" role="group" aria-label="function version">
        {TOGGLES.map((t) => {
          const on = t.buggy === isBuggy;
          return (
            <button
              key={t.label}
              onClick={() => setIsBuggy(t.buggy)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <t.Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        function under test
      </p>
      <pre className="thin-scroll mt-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {src}
      </pre>

      <div className="mt-4 divide-y divide-line-soft rounded-xl border border-line-soft">
        {results.map((r) => (
          <div
            key={r.expr}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2"
          >
            <code className="thin-scroll min-w-0 overflow-x-auto whitespace-nowrap font-mono text-xs text-dim">
              expect({r.expr}).toBe({r.expected})
            </code>
            <span className="flex items-center gap-3">
              {!r.pass && (
                <span className="font-mono text-[11px] text-faint">
                  expected {r.expected}, got {r.actual}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1 font-mono text-xs"
                style={{ color: r.pass ? GOOD : BAD }}
              >
                {r.pass ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                {r.pass ? "pass" : "fail"}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-medium"
        style={{ color: tone, background: tint(tone, 12), borderColor: tint(tone, 40) }}
      >
        {allPass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        {passed} passed{failed > 0 ? `, ${failed} failed` : ""}
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
