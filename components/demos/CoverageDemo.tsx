"use client";

import { useState } from "react";
import { Bug, Check, Circle, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type CodeLine = { n: number; text: string; exec: boolean; bug?: boolean };

// A tiny discount function with a special case for negative input.
// Line 3 is the lurking bug: a negative price flows straight back out
// unchanged instead of being rejected.
const CODE: CodeLine[] = [
  { n: 1, text: "function discount(price, pct) {", exec: true },
  { n: 2, text: "  if (price < 0) {", exec: true },
  { n: 3, text: "    return price;", exec: true, bug: true },
  { n: 4, text: "  }", exec: false },
  { n: 5, text: "  const off = price * (pct / 100);", exec: true },
  { n: 6, text: "  return price - off;", exec: true },
  { n: 7, text: "}", exec: false },
];

type Test = {
  id: string;
  call: string;
  kind: string;
  runs: number[];
  catchesBug: boolean;
};

// Each test executes a set of lines. Only the last one actually ASSERTS
// what should happen for a negative price, so only it can catch the bug.
const TESTS: Test[] = [
  { id: "happy", call: "discount(100, 10) === 90", kind: "happy path", runs: [1, 2, 5, 6], catchesBug: false },
  { id: "zero", call: "discount(0, 50) === 0", kind: "boundary", runs: [1, 2, 5, 6], catchesBug: false },
  { id: "smoke", call: "discount(-100, 10) returns a number", kind: "weak assertion", runs: [1, 2, 3], catchesBug: false },
  { id: "guard", call: "discount(-100, 10) should reject negatives", kind: "real assertion", runs: [1, 2, 3], catchesBug: true },
];

const EXEC_LINES = CODE.filter((c) => c.exec);

export default function CoverageDemo({ color }: { color: string }) {
  const [on, setOn] = useState<Record<string, boolean>>({ happy: true });

  // Everything below is derived during render — no effects, no stored copies.
  const coveredSet = new Set<number>(
    TESTS.filter((t) => on[t.id]).flatMap((t) => t.runs),
  );
  const coveredExec = EXEC_LINES.filter((c) => coveredSet.has(c.n)).length;
  const coveragePct = Math.round((coveredExec / EXEC_LINES.length) * 100);
  const allCovered = coveredExec === EXEC_LINES.length;
  const bugCaught = TESTS.some((t) => on[t.id] && t.catchesBug);

  const falseConfidence = allCovered && !bugCaught;
  const barColor = falseConfidence ? WARN : bugCaught ? GOOD : color;

  const callout = bugCaught
    ? {
        tone: GOOD,
        Icon: ShieldCheck,
        text: "A test now asserts the negative case, so the lurking bug is caught.",
      }
    : falseConfidence
    ? {
        tone: WARN,
        Icon: TriangleAlert,
        text: "100% lines covered — but discount(-100, 10) is still broken.",
      }
    : {
        tone: color,
        Icon: Info,
        text: `Line coverage ${coveragePct}%. Toggle more tests to run the remaining lines.`,
      };

  const lead = bugCaught
    ? "Now a test actually asserts what a negative price should do, so the bug is caught."
    : falseConfidence
    ? "Every line has run, so coverage reads 100% — yet the negative-price bug survives, because no enabled test asserts what negatives should do."
    : `Coverage is ${coveragePct}% — some lines have not run yet.`;
  const statusMsg = `${lead} Coverage shows what code your tests RAN, not whether they CHECKED the right thing. A high number with weak assertions is false confidence; branch coverage and meaningful assertions matter more than the percentage.`;

  const CalloutIcon = callout.Icon;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Coverage measures execution, not correctness
      </h3>
      <p className="mt-1 text-sm text-dim">
        Toggle tests on and each line they run turns covered, nudging the
        percentage up. Push line coverage to 100% and a real bug still slips by.
      </p>

      {/* Tests — the control */}
      <div className="mt-4 flex flex-col gap-2" role="group" aria-label="tests">
        {TESTS.map((t) => {
          const active = !!on[t.id];
          const kindTone = t.catchesBug
            ? GOOD
            : t.id === "smoke"
            ? WARN
            : "var(--color-faint)";
          return (
            <button
              key={t.id}
              onClick={() => setOn((prev) => ({ ...prev, [t.id]: !prev[t.id] }))}
              aria-pressed={active}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors"
              style={
                active
                  ? { borderColor: tint(color, 45), background: tint(color, 10) }
                  : { borderColor: "var(--color-line)", background: "var(--color-bg-2)" }
              }
            >
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-md border"
                style={
                  active
                    ? { borderColor: color, background: tint(color, 20), color }
                    : { borderColor: "var(--color-line)", color: "var(--color-faint)" }
                }
              >
                {active ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <code className="block truncate font-mono text-sm text-text">
                  {t.call}
                </code>
                <span
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: kindTone }}
                >
                  {t.kind}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Coverage summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-2xl font-semibold text-text tabular-nums">
          {coveragePct}%
        </span>
        <div className="min-w-32 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-bg-2" aria-hidden>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${coveragePct}%`, background: barColor }}
            />
          </div>
          <span className="mt-1 block text-[11px] uppercase tracking-widest text-faint">
            {coveredExec} of {EXEC_LINES.length} lines covered
          </span>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
          style={{
            color: bugCaught ? GOOD : BAD,
            background: tint(bugCaught ? GOOD : BAD, 12),
          }}
        >
          {bugCaught ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <TriangleAlert className="h-3.5 w-3.5" />
          )}
          {bugCaught ? "negative case asserted" : "negative case not asserted"}
        </span>
      </div>

      {/* Code coverage report */}
      <div className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-2">
        {CODE.map((c) => {
          const covered = c.exec && coveredSet.has(c.n);
          return (
            <div
              key={c.n}
              className="flex items-center gap-3 rounded-lg px-2 py-1"
              style={{ background: covered ? tint(GOOD, 8) : "transparent" }}
            >
              <span className="w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-faint">
                {c.n}
              </span>
              <code
                className={`flex-1 whitespace-pre font-mono text-sm ${
                  c.exec ? (covered ? "text-text" : "text-dim") : "text-faint"
                }`}
              >
                {c.text}
              </code>
              <span className="flex shrink-0 items-center gap-1.5">
                {c.bug && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                    style={{ color: WARN, background: tint(WARN, 14) }}
                  >
                    <Bug className="h-3 w-3" /> edge case
                  </span>
                )}
                {c.exec && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                    style={
                      covered
                        ? { color: GOOD, background: tint(GOOD, 14) }
                        : { color: "var(--color-faint)", background: "var(--color-panel)" }
                    }
                  >
                    {covered ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    {covered ? "covered" : "not covered"}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        style={{ color: callout.tone, background: tint(callout.tone, 12) }}
      >
        <CalloutIcon className="h-3.5 w-3.5" />
        {callout.text}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {statusMsg}
      </p>
    </div>
  );
}
