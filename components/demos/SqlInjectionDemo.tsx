"use client";

import { useState } from "react";
import { Database, ShieldAlert, ShieldCheck } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

// The (pretend) contents of the users table.
const TABLE = ["alice", "bob", "carol"];

type Input = { key: string; value: string; name: string; malicious: boolean };

const INPUTS: Input[] = [
  { key: "alice", value: "alice", name: "normal (alice)", malicious: false },
  { key: "bypass", value: "' OR '1'='1", name: "auth bypass", malicious: true },
  { key: "drop", value: "'; DROP TABLE users; --", name: "drop table", malicious: true },
];

type Mode = "vulnerable" | "safe";

const MODES: { key: Mode; label: string; tone: string }[] = [
  { key: "vulnerable", label: "Concatenated query (vulnerable)", tone: BAD },
  { key: "safe", label: "Parameterized query (safe)", tone: GOOD },
];

type Result = {
  tone: "good" | "bad" | "neutral";
  headline: string;
  matched: string[] | null; // null = the table was destroyed
};

function computeResult(input: Input, vulnerable: boolean): Result {
  if (!vulnerable) {
    // Parameterized: the value is always bound as literal data.
    if (input.malicious) {
      return {
        tone: "good",
        headline: "treated as data, not code — it matches no username",
        matched: [],
      };
    }
    return {
      tone: "neutral",
      headline: "one matching user — a normal, expected lookup",
      matched: ["alice"],
    };
  }
  // Concatenated: the input can escape the string and become SQL.
  if (input.key === "bypass") {
    return {
      tone: "bad",
      headline: "injection succeeded — returns every row",
      matched: TABLE,
    };
  }
  if (input.key === "drop") {
    return {
      tone: "bad",
      headline: "injection succeeded — the users table is gone",
      matched: null,
    };
  }
  return {
    tone: "neutral",
    headline: "one matching user — a normal, expected lookup",
    matched: ["alice"],
  };
}

export default function SqlInjectionDemo({ color }: { color: string }) {
  const [inputKey, setInputKey] = useState("bypass");
  const [mode, setMode] = useState<Mode>("vulnerable");

  const input = INPUTS.find((i) => i.key === inputKey) ?? INPUTS[0];
  const vulnerable = mode === "vulnerable";
  const result = computeResult(input, vulnerable);
  const toneColor =
    result.tone === "good" ? GOOD : result.tone === "bad" ? BAD : color;
  const Icon =
    result.tone === "good" ? ShieldCheck : result.tone === "bad" ? ShieldAlert : Database;

  const buildCode = vulnerable
    ? `query = "SELECT * FROM users WHERE name = '" + username + "'"\ndb.execute(query)`
    : `query = "SELECT * FROM users WHERE name = ?"\ndb.execute(query, [username])`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        SQL injection: string-building vs parameterized
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same username field, sent to the database two different ways. Watch
        what a malicious value does in each.
      </p>

      {/* Login form field the attacker controls */}
      <div className="mt-4">
        <label className="font-mono text-[10px] uppercase tracking-widest text-faint">
          login form · username field
        </label>
        <div className="mt-1.5 rounded-lg border border-line bg-bg-2 px-3 py-2 font-mono text-sm text-text">
          {input.value}
        </div>
        <p className="mt-1.5 text-xs text-faint">
          The users table holds three rows: alice, bob, carol.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {INPUTS.map((i) => {
            const on = i.key === inputKey;
            return (
              <button
                key={i.key}
                type="button"
                onClick={() => setInputKey(i.key)}
                aria-pressed={on}
                className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                style={
                  on
                    ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                    : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                }
              >
                {i.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? { background: tint(m.tone, 16), color: m.tone, borderColor: tint(m.tone, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* How the app builds the query */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        how the app builds the query
      </p>
      <pre className="thin-scroll mt-1.5 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {buildCode}
      </pre>

      {/* What the database executes */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        what the database executes
      </p>
      {vulnerable ? (
        <pre className="thin-scroll mt-1.5 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
          <span className="text-dim">{"SELECT * FROM users WHERE name = '"}</span>
          <span
            className="rounded px-0.5"
            style={{ color: toneColor, background: tint(toneColor, 16) }}
          >
            {input.value}
          </span>
          <span className="text-dim">{"';"}</span>
        </pre>
      ) : (
        <div className="mt-1.5">
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
            SELECT * FROM users WHERE name = ?
          </pre>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-faint">? bound to</span>
            <span
              className="rounded px-1 font-mono"
              style={{ color: GOOD, background: tint(GOOD, 14) }}
            >
              {`"${input.value}"`}
            </span>
            <span className="text-faint">— kept as a literal value</span>
          </div>
        </div>
      )}

      {/* Outcome */}
      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: tint(toneColor, 35), background: tint(toneColor, 8) }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" style={{ color: toneColor }} />
          <span className="text-sm font-medium text-text">{result.headline}</span>
        </div>
        {result.matched === null ? (
          <p className="mt-1 text-sm text-dim">
            Every row was deleted — the users table no longer exists.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-dim">
              {result.matched.length} row{result.matched.length === 1 ? "" : "s"}{" "}
              returned
              {result.tone === "bad" && result.matched.length === TABLE.length
                ? " — the entire table"
                : ""}
              .
            </p>
            {result.matched.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.matched.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-line-soft bg-bg-2 px-2 py-0.5 font-mono text-xs text-dim"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {vulnerable
          ? "Concatenation splices your text straight into the SQL string, so the database cannot tell your data from its own commands — one stray quote lets the input rewrite the query. Switch to a parameterized query to send the value separately."
          : "The database compiles name = ? first, then binds your text purely as a value. Because the query and the data travel to the database separately, quotes and keywords in the input can never execute as SQL."}
      </p>
    </div>
  );
}
