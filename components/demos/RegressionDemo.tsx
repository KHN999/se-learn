"use client";

import { useState } from "react";
import { AlertTriangle, Bug, Check, FlaskConical, ShieldCheck, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type CodeLine = { text: string; kind: "normal" | "removed" | "added" };

function codeLines(risky: boolean): CodeLine[] {
  const head: CodeLine[] = [
    { text: "function applyDiscount(price, pct) {", kind: "normal" },
    { text: "  const net = price * (1 - pct / 100);", kind: "normal" },
  ];
  const body: CodeLine[] = risky
    ? [
        { text: "  return Math.round(net); // correct", kind: "removed" },
        { text: "  return Math.floor(net); // off-by-one: drops the cents", kind: "added" },
      ]
    : [{ text: "  return Math.round(net);", kind: "normal" }];
  return [...head, ...body, { text: "}", kind: "normal" }];
}

type TestCase = { price: number; pct: number; expected: number };

const TESTS: TestCase[] = [
  { price: 100, pct: 10, expected: 90 },
  { price: 50, pct: 50, expected: 25 },
  { price: 101, pct: 10, expected: 91 },
];

function actual(t: TestCase, risky: boolean): number {
  const net = t.price * (1 - t.pct / 100);
  return risky ? Math.floor(net) : Math.round(net);
}

export default function RegressionDemo({ color }: { color: string }) {
  const [risky, setRisky] = useState(false);
  const [hasTests, setHasTests] = useState(true);

  const lines = codeLines(risky);
  const results = TESTS.map((t) => {
    const got = actual(t, risky);
    return {
      call: `applyDiscount(${t.price}, ${t.pct})`,
      expected: t.expected,
      got,
      pass: got === t.expected,
    };
  });
  const passCount = results.filter((r) => r.pass).length;
  const allPass = passCount === results.length;

  const caught = risky && hasTests; // a test goes red before release — GOOD
  const shipped = risky && !hasTests; // bug slips to production — BAD

  const outcome = shipped
    ? {
        color: BAD,
        Icon: AlertTriangle,
        title: "Shipped to production — users affected",
        detail:
          "There was no suite to run, so the buggy build passed straight through and real customers hit the pricing error.",
      }
    : caught
      ? {
          color: GOOD,
          Icon: ShieldCheck,
          title: "Caught before production",
          detail:
            "CI ran the suite, a test went red, and the release was blocked. The bug never reached a user.",
        }
      : {
          color,
          Icon: Check,
          title: "No risky change",
          detail: hasTests
            ? "The current code is correct and the suite is green. Flip the risky change to see what the tests do."
            : "The current code is correct, but nothing is guarding it. Flip the risky change to see what ships.",
        };
  const OutcomeIcon = outcome.Icon;

  const summary = shipped
    ? "Without tests, the risky change went straight to production and real users hit the bug. Nothing stood between the mistake and the customer — exactly the incident a test suite exists to prevent."
    : caught
      ? "The tests turned a would-be production incident into a red build. CI caught the bug in seconds, before any user saw it — that is the safety net tests give you for every change."
      : hasTests
        ? "No risky change yet, and the suite is green. The moment someone does change this code, those tests are ready to catch a mistake before it ships."
        : "No risky change yet, so nothing breaks. But with no tests, the next change ships blind — nothing would catch a mistake before users do.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Do tests actually help?</h3>
      <p className="mt-1 text-sm text-dim">
        Ship the same change with and without a test suite, and watch one bug
        become either a caught red build or a production incident.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRisky((v) => !v)}
          aria-pressed={risky}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          style={
            risky
              ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          <Bug className="h-3.5 w-3.5" />
          Ship a risky change
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {risky ? "on" : "off"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setHasTests((v) => !v)}
          aria-pressed={hasTests}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          style={
            hasTests
              ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Team has tests
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {hasTests ? "on" : "off"}
          </span>
        </button>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        the code {risky ? "(after the change)" : ""}
      </p>
      <pre className="thin-scroll mt-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
        {lines.map((ln, i) => {
          const prefix = ln.kind === "added" ? "+" : ln.kind === "removed" ? "-" : " ";
          return (
            <div key={i} className="whitespace-pre">
              <span className="select-none text-faint">{prefix} </span>
              <span
                className={
                  ln.kind === "removed"
                    ? "text-faint line-through"
                    : ln.kind === "added"
                      ? "font-medium"
                      : "text-dim"
                }
                style={ln.kind === "added" ? { color: BAD } : undefined}
              >
                {ln.text}
              </span>
            </div>
          );
        })}
      </pre>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        test suite
      </p>
      {hasTests ? (
        <div className="mt-2 rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex flex-col gap-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 font-mono text-sm"
              >
                {r.pass ? (
                  <Check className="h-4 w-4 shrink-0" style={{ color: GOOD }} />
                ) : (
                  <X className="h-4 w-4 shrink-0" style={{ color: BAD }} />
                )}
                <span className="text-dim">{r.call}</span>
                <span className="text-faint">expected {r.expected}</span>
                {!r.pass && (
                  <span style={{ color: BAD }}>got {r.got}</span>
                )}
                <span
                  className="ml-auto text-[10px] uppercase tracking-widest"
                  style={{ color: r.pass ? GOOD : BAD }}
                >
                  {r.pass ? "pass" : "fail"}
                </span>
              </div>
            ))}
          </div>
          <p
            className="mt-2 text-xs font-medium"
            style={{ color: allPass ? GOOD : BAD }}
          >
            {passCount}/{results.length} passing — suite is {allPass ? "green" : "red"}
          </p>
        </div>
      ) : (
        <div className="mt-2 rounded-xl border border-dashed border-line-soft bg-bg-2/30 p-3">
          <div className="flex flex-col gap-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 font-mono text-sm text-faint"
              >
                <span className="w-4 shrink-0 text-center">—</span>
                <span>{r.call}</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest">
                  not run
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">
            No tests exist, so the suite never runs.
          </p>
        </div>
      )}

      <div
        className="mt-3 flex items-start gap-3 rounded-xl border p-4"
        style={{ borderColor: tint(outcome.color, 45), background: tint(outcome.color, 10) }}
      >
        <OutcomeIcon
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: outcome.color }}
        />
        <div>
          <p className="text-sm font-semibold" style={{ color: outcome.color }}>
            {outcome.title}
          </p>
          <p className="mt-0.5 text-sm text-dim">{outcome.detail}</p>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {summary}
      </p>
    </div>
  );
}
