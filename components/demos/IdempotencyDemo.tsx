"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  Database,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const AMOUNT = 50;

type Mode = "none" | "key";
type Tone = "neutral" | "good" | "bad";

type Charge = { id: string; amount: number };
type StoreEntry = { key: string; chargeId: string };
type Req = {
  n: number;
  title: string;
  hasKey: boolean;
  code: string;
  response: string;
  tone: Tone;
};

function run(mode: Mode): {
  charges: Charge[];
  store: StoreEntry[];
  requests: Req[];
  total: number;
  good: boolean;
} {
  const withKey = mode === "key";
  const charges: Charge[] = withKey
    ? [{ id: "ch_101", amount: AMOUNT }]
    : [
        { id: "ch_101", amount: AMOUNT },
        { id: "ch_102", amount: AMOUNT },
      ];
  const store: StoreEntry[] = withKey
    ? [{ key: "abc123", chargeId: "ch_101" }]
    : [];
  const requests: Req[] = [
    {
      n: 1,
      title: "original request",
      hasKey: withKey,
      code: "201 Created",
      response: withKey
        ? "New charge ch_101 for $50, and key abc123 is stored"
        : "New charge ch_101 for $50",
      tone: "neutral",
    },
    {
      n: 2,
      title: "retry — the response to #1 was lost",
      hasKey: withKey,
      code: withKey ? "200 OK" : "201 Created",
      response: withKey
        ? "Key abc123 recognized — replayed cached charge ch_101, nothing charged again"
        : "Another new charge ch_102 for $50",
      tone: withKey ? "good" : "bad",
    },
  ];
  const total = charges.reduce((sum, c) => sum + c.amount, 0);
  return { charges, store, requests, total, good: withKey };
}

const toneColor = (tone: Tone, accent: string): string =>
  tone === "good" ? GOOD : tone === "bad" ? BAD : accent;

export default function IdempotencyDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("none");
  const scenario = run(mode);
  const outcomeColor = scenario.good ? GOOD : BAD;

  const MODES: { key: Mode; label: string }[] = [
    { key: "none", label: "No idempotency key" },
    { key: "key", label: "With idempotency key" },
  ];

  const statusText = scenario.good
    ? "With an idempotency key, the retry carries Idempotency-Key: abc123. The server sees it has already handled that key, returns the original charge, and does not charge again — exactly $50. An idempotent operation has the same effect whether applied once or many times, so a retry cannot double-apply."
    : "Without an idempotency key, the server treats the retry as a brand-new request and charges the customer a second time — $100. An idempotent operation has the same effect whether applied once or many times; since networks force retries, attach an idempotency key (or use a naturally idempotent PUT / DELETE) so a retry cannot double-apply.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Idempotency: safe retries</h3>
      <p className="mt-1 text-sm text-dim">
        A lost response makes the client retry, so the server sees the request
        twice. See why a naive charge double-bills, and how an idempotency key
        makes the retry safe.
      </p>

      <div
        role="group"
        aria-label="Idempotency mode"
        className="mt-4 flex flex-wrap gap-1.5"
      >
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
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

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-line-soft bg-bg-2/50 p-3 text-sm text-dim">
        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
        <p>
          The client sends <span className="font-mono text-xs text-text">POST /charge</span>{" "}
          for $50, but the network hiccups and the response is lost. Not knowing
          whether it succeeded, the client retries — so the server receives the
          same request twice.
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {scenario.requests.map((r) => {
          const c = toneColor(r.tone, color);
          return (
            <div
              key={r.n}
              className="rounded-xl border border-line-soft bg-bg-2/50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-faint">
                  Request {r.n}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-dim">
                  {r.n === 2 ? <RefreshCw className="h-3 w-3" /> : null}
                  {r.title}
                </span>
              </div>

              <pre className="mt-2 font-mono text-xs text-dim">
                {`POST /charge\n{ "amount": 50 }`}
              </pre>

              <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px]">
                <KeyRound
                  className="h-3 w-3"
                  style={{ color: r.hasKey ? color : "var(--color-faint)" }}
                />
                {r.hasKey ? (
                  <span style={{ color }}>Idempotency-Key: abc123</span>
                ) : (
                  <span className="text-faint">no idempotency key</span>
                )}
              </div>

              <div
                className="mt-2 flex items-start gap-1.5 rounded-lg border px-2.5 py-1.5"
                style={{ borderColor: tint(c, 40), background: tint(c, 10) }}
              >
                {r.tone === "bad" ? (
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: BAD }}
                  />
                ) : (
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: c }}
                  />
                )}
                <span className="font-mono text-[11px] text-dim">
                  <span className="font-semibold" style={{ color: c }}>
                    {r.code}
                  </span>{" "}
                  — {r.response}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-faint" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              charges on the server
            </span>
          </div>
          {scenario.charges.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between py-0.5 font-mono text-xs text-dim"
            >
              <span>{c.id}</span>
              <span>${c.amount}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-faint" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              idempotency-key store
            </span>
          </div>
          {scenario.store.length === 0 ? (
            <p className="font-mono text-xs text-faint">
              empty — the server tracks no keys
            </p>
          ) : (
            scenario.store.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-0.5 font-mono text-xs"
              >
                <span style={{ color }}>{s.key}</span>
                <span className="text-dim">to {s.chargeId}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        className="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
        style={{ borderColor: tint(outcomeColor, 45), background: tint(outcomeColor, 12) }}
      >
        <span
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: outcomeColor }}
        >
          {scenario.good ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {scenario.good ? "Charged once" : "Double charge"}
        </span>
        <span
          className="font-mono text-lg font-semibold"
          style={{ color: outcomeColor }}
        >
          ${scenario.total} total
        </span>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {statusText}
      </p>
    </div>
  );
}
