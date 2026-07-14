"use client";

import { useState } from "react";
import { Ban, Check, Lock, ShieldX, type LucideIcon } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type MethodId = "apikey" | "bearer" | "oauth";
type StateId = "missing" | "invalid" | "valid" | "insufficient";

type Method = {
  id: MethodId;
  label: string;
  headerKey: string;
  prefix: string;
  valid: string;
  invalid: string;
  blurb: string;
};

const METHODS: Method[] = [
  {
    id: "apikey",
    label: "API key",
    headerKey: "x-api-key",
    prefix: "",
    valid: "ak_live_7Gq2Zt9pFhL0",
    invalid: "ak_live_REVOKED0000",
    blurb:
      "Identifies the calling app or project, not a person. A long random secret sent in a header — never in the URL, where it leaks into logs. Rotate it and revoke leaked keys.",
  },
  {
    id: "bearer",
    label: "Bearer JWT",
    headerKey: "Authorization",
    prefix: "Bearer ",
    valid: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJncmFjZSJ9.Kd9f4aQ",
    invalid: "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjF9.expiredSig",
    blurb:
      "A per-user token in the Authorization header. A JWT is signed and self-describing (subject, scopes, expiry), so the server verifies it without a database lookup. It expires — the client refreshes.",
  },
  {
    id: "oauth",
    label: "OAuth token",
    headerKey: "Authorization",
    prefix: "Bearer ",
    valid: "ya29.a0AfB_xQ7m4s3Qp",
    invalid: "ya29.a0AfB_xQ7mREVOKED",
    blurb:
      "A delegated, scoped access token: a user let a third-party app act on their behalf, for specific scopes only. Sent as a Bearer token; short-lived and exchanged via a refresh token.",
  },
];

const STATES: { id: StateId; label: string }[] = [
  { id: "missing", label: "missing" },
  { id: "invalid", label: "invalid / expired" },
  { id: "valid", label: "valid" },
  { id: "insufficient", label: "valid, wrong scope" },
];

type Outcome = {
  code: number;
  text: string;
  tone: string;
  Icon: LucideIcon;
  gloss: string;
  short: string;
  body: string;
};

function outcomeFor(state: StateId): Outcome {
  switch (state) {
    case "missing":
      return {
        code: 401,
        text: "Unauthorized",
        tone: BAD,
        Icon: Ban,
        gloss:
          "No credential was sent, so the server has no idea who is calling.",
        short: "who are you?",
        body: `{\n  "error": "unauthorized",\n  "message": "no credentials provided"\n}`,
      };
    case "invalid":
      return {
        code: 401,
        text: "Unauthorized",
        tone: BAD,
        Icon: Ban,
        gloss:
          "The credential was sent but does not verify — wrong, revoked, or expired.",
        short: "we cannot verify this",
        body: `{\n  "error": "unauthorized",\n  "message": "credential invalid or expired"\n}`,
      };
    case "insufficient":
      return {
        code: 403,
        text: "Forbidden",
        tone: WARN,
        Icon: ShieldX,
        gloss:
          "The caller is authenticated, but this credential lacks the orders:read scope the endpoint requires.",
        short: "authenticated, but not allowed",
        body: `{\n  "error": "forbidden",\n  "message": "requires scope: orders:read"\n}`,
      };
    default:
      return {
        code: 200,
        text: "OK",
        tone: GOOD,
        Icon: Check,
        gloss:
          "Identified and holding the orders:read scope, so the server returns the data.",
        short: "here you go",
        body: `{\n  "orders": [\n    { "id": 101, "item": "Book", "amount": 12 },\n    { "id": 104, "item": "Desk", "amount": 120 }\n  ]\n}`,
      };
  }
}

export default function ApiAuthDemo({ color }: { color: string }) {
  const [methodId, setMethodId] = useState<MethodId>("apikey");
  const [state, setState] = useState<StateId>("valid");

  const method = METHODS.find((m) => m.id === methodId) ?? METHODS[0];
  const outcome = outcomeFor(state);
  const OutIcon = outcome.Icon;

  const authLine =
    state === "missing"
      ? `# no ${method.headerKey} header sent`
      : `${method.headerKey}: ${method.prefix}${state === "invalid" ? method.invalid : method.valid}`;

  const requestText = [
    "GET /api/orders HTTP/1.1",
    "Host: api.example.com",
    "Accept: application/json",
    authLine,
  ].join("\n");

  const statusMsg =
    `${method.label} sends its credential in the ${method.headerKey} header, always over HTTPS. ` +
    (state === "insufficient"
      ? "Here the credential is valid, so the caller is authenticated — but the server decodes its scopes, finds no orders:read, and refuses. "
      : "") +
    `${outcome.gloss} The server answered ${outcome.code} ${outcome.text} — ${outcome.short}.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        How an API knows who is calling
      </h3>
      <p className="mt-1 text-sm text-dim">
        Send GET /api/orders and watch the server decide. Flip the auth method
        and the credential state to see who gets in — and who does not.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span
          className="rounded-md px-2 py-1 font-mono font-semibold"
          style={{ background: tint(color, 16), color }}
        >
          GET
        </span>
        <code className="font-mono text-sm text-text">/api/orders</code>
        <span className="inline-flex items-center gap-1 rounded-md border border-line-soft px-2 py-1 text-faint">
          <Lock className="h-3 w-3" /> HTTPS
        </span>
        <span className="rounded-md border border-line-soft px-2 py-1 font-mono text-faint">
          requires orders:read
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div role="group" aria-label="auth method">
          <p className="mb-1.5 text-[11px] uppercase tracking-widest text-faint">
            Auth method
          </p>
          <div className="flex flex-wrap gap-1.5">
            {METHODS.map((m) => {
              const on = m.id === methodId;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethodId(m.id)}
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
        </div>

        <div role="group" aria-label="credential state">
          <p className="mb-1.5 text-[11px] uppercase tracking-widest text-faint">
            Credential state
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STATES.map((s) => {
              const on = s.id === state;
              return (
                <button
                  key={s.id}
                  onClick={() => setState(s.id)}
                  aria-pressed={on}
                  className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                  style={
                    on
                      ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                      : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[11px] uppercase tracking-widest text-faint">
            Request
          </p>
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
            {requestText}
          </pre>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] uppercase tracking-widest text-faint">
            Response
          </p>
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: tint(outcome.tone, 40), background: tint(outcome.tone, 8) }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-3xl font-semibold"
                style={{ color: outcome.tone }}
              >
                {outcome.code}
              </span>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-text">
                  <OutIcon className="h-4 w-4" style={{ color: outcome.tone }} />
                  {outcome.text}
                </div>
                <div className="text-xs text-dim">{outcome.short}</div>
              </div>
            </div>
            <pre className="thin-scroll mt-3 overflow-x-auto rounded-lg border border-line-soft bg-bg-2 p-3 font-mono text-xs leading-relaxed text-dim">
              {outcome.body}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {METHODS.map((m) => {
          const on = m.id === methodId;
          return (
            <div
              key={m.id}
              className="rounded-xl border px-3 py-2.5"
              style={{
                borderColor: on ? tint(color, 45) : "var(--color-line-soft)",
                background: on ? tint(color, 8) : "var(--color-bg-2)",
              }}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="shrink-0 text-sm font-semibold"
                  style={{ color: on ? color : "var(--color-text)" }}
                >
                  {m.label}
                </span>
                <span className="font-mono text-[11px] text-faint">
                  {m.headerKey}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-dim">{m.blurb}</p>
            </div>
          );
        })}
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
