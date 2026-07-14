"use client";

import { useState } from "react";
import { Check, ShieldCheck, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

// Deterministic 5000-char input (no Math.random / Date.now).
const LONG = "a".repeat(5000);

type Mode = "blocklist" | "allowlist";

type Test = {
  id: string;
  value: string;
  display: string;
  kind: string;
  safe: boolean; // true = a legitimate value that SHOULD be accepted
};

const TESTS: Test[] = [
  { id: "alice", value: "alice", display: "alice", kind: "valid username", safe: true },
  { id: "bob", value: "bob123", display: "bob123", kind: "valid username", safe: true },
  { id: "sqli", value: "a'--", display: "a'--", kind: "SQL injection", safe: false },
  {
    id: "path",
    value: "../../etc/passwd",
    display: "../../etc/passwd",
    kind: "path traversal",
    safe: false,
  },
  {
    id: "xss",
    value: "<script>alert(1)</script>",
    display: "<script>alert(1)</script>",
    kind: "XSS",
    safe: false,
  },
  {
    id: "xssVariant",
    value: "<ScRiPt>alert(1)</ScRiPt>",
    display: "<ScRiPt>alert(1)</ScRiPt>",
    kind: "XSS (case variant)",
    safe: false,
  },
  {
    id: "long",
    value: LONG,
    display: `${LONG.slice(0, 14)}… (5000 chars)`,
    kind: "over-length",
    safe: false,
  },
];

// A naive blocklist: only the exact patterns the developer thought to ban,
// matched case-sensitively — so variants and unforeseen shapes get through.
const BLOCKED = ["'", "<script>"];

// An allowlist: define exactly what a valid username looks like.
const ALLOW = /^[a-z0-9]{3,20}$/;

function accepts(mode: Mode, value: string): boolean {
  if (mode === "blocklist") return !BLOCKED.some((bad) => value.includes(bad));
  return ALLOW.test(value);
}

type Verdict = { label: string; tone: string; Icon: LucideIcon };

function verdictOf(accepted: boolean, safe: boolean): Verdict {
  if (accepted && safe) return { label: "accepted", tone: GOOD, Icon: Check };
  if (!accepted && !safe) return { label: "blocked", tone: GOOD, Icon: ShieldCheck };
  if (accepted && !safe) return { label: "slipped through", tone: BAD, Icon: TriangleAlert };
  return { label: "wrongly rejected", tone: BAD, Icon: X };
}

const MODES: { id: Mode; label: string }[] = [
  { id: "blocklist", label: "Blocklist · reject known-bad" },
  { id: "allowlist", label: "Allowlist · accept known-good" },
];

export default function InputValidationDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("blocklist");

  const results = TESTS.map((t) => {
    const accepted = accepts(mode, t.value);
    return { ...t, accepted, slipped: accepted && !t.safe };
  });
  const slippedCount = results.filter((r) => r.slipped).length;

  const rule =
    mode === "blocklist"
      ? "reject if the value contains a known-bad pattern:\n  '   or   <script>"
      : "accept only if the value matches the pattern:\n  ^[a-z0-9]{3,20}$";

  const lead =
    mode === "allowlist"
      ? "The allowlist rejected every sneaky input and accepted only the valid usernames."
      : `The blocklist let ${slippedCount} sneaky input${slippedCount === 1 ? "" : "s"} slip through — the shapes nobody thought to ban.`;
  const statusMsg = `${lead} Prefer allowlists: define what is valid and reject everything else, and always validate on the server. Validation is a complementary layer — it does not replace parameterized queries or output encoding.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Allowlist vs blocklist: same inputs, different safety
      </h3>
      <p className="mt-1 text-sm text-dim">
        A blocklist tries to name every bad input; an allowlist names what is
        valid and rejects everything else. Run the same test inputs through both
        and watch which sneaky ones get past.
      </p>

      <div
        className="mt-4 inline-flex flex-wrap gap-1.5"
        role="group"
        aria-label="validation strategy"
      >
        {MODES.map((m) => {
          const on = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
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

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-faint">validating field</span>
        <code
          className="rounded-md px-2 py-0.5 font-mono text-xs"
          style={{ background: tint(color, 14), color }}
        >
          username
        </code>
      </div>

      <pre className="thin-scroll mt-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs text-dim">
        {rule}
      </pre>

      <div
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        style={{
          color: slippedCount > 0 ? BAD : GOOD,
          background: tint(slippedCount > 0 ? BAD : GOOD, 12),
        }}
      >
        {slippedCount > 0 ? (
          <TriangleAlert className="h-3.5 w-3.5" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {slippedCount > 0
          ? `${slippedCount} sneaky input${slippedCount === 1 ? "" : "s"} slipped through`
          : "every sneaky input was rejected"}
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {results.map((r) => {
          const v = verdictOf(r.accepted, r.safe);
          const Icon = v.Icon;
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: r.slipped ? tint(BAD, 45) : "var(--color-line-soft)",
                background: r.slipped ? tint(BAD, 8) : "var(--color-bg-2)",
              }}
            >
              <div className="min-w-0 flex-1">
                <code className="block truncate font-mono text-sm text-text">
                  {r.display}
                </code>
                <span className="text-[11px] uppercase tracking-widest text-faint">
                  {r.kind}
                </span>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                style={{ color: v.tone, background: tint(v.tone, 12) }}
              >
                <Icon className="h-3.5 w-3.5" />
                {v.label}
              </span>
            </li>
          );
        })}
      </ul>

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
