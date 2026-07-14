"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

// A JWT is three base64url strings joined by dots. These are illustrative.
const HEADER_B64 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const PAYLOAD_USER_B64 = "eyJzdWIiOiI0MiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzM1Njg5NjAwfQ";
const PAYLOAD_ADMIN_B64 = "eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTczNTY4OTYwMH0";
const SIG_B64 = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDemo({ color }: { color: string }) {
  const [tampered, setTampered] = useState(false);

  const headerColor = color;
  const payloadColor = WARN;
  const sigColor = tampered ? BAD : GOOD;

  const role = tampered ? "admin" : "user";
  const payloadLines = [
    { key: `"sub": `, val: `"42"`, comma: true, changed: false },
    { key: `"role": `, val: `"${role}"`, comma: true, changed: tampered },
    { key: `"exp": `, val: `1735689600`, comma: false, changed: false },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        What is inside a JWT (and what is not secret)
      </h3>
      <p className="mt-1 text-sm text-dim">
        A JWT is just three base64url strings joined by dots. Two of them are
        plain text anyone can read; the third is what makes the token
        trustworthy.
      </p>

      {/* Tamper control */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTampered((t) => !t)}
          aria-pressed={tampered}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          style={
            tampered
              ? { background: tint(BAD, 16), color: BAD, borderColor: tint(BAD, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          Tamper with the payload
        </button>
        <span className="text-xs text-faint">
          {tampered ? "role rewritten to admin" : "token as issued by the server"}
        </span>
      </div>

      {/* The token */}
      <div className="mt-4 rounded-xl border border-line bg-bg-2 p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          header . payload . signature
        </p>
        <p className="thin-scroll break-all font-mono text-sm leading-relaxed">
          <span style={{ color: headerColor }}>{HEADER_B64}</span>
          <span className="text-faint">.</span>
          <span style={{ color: payloadColor }}>
            {tampered ? PAYLOAD_ADMIN_B64 : PAYLOAD_USER_B64}
          </span>
          <span className="text-faint">.</span>
          <span style={{ color: sigColor }}>{SIG_B64}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: headerColor }} />
            Header
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: payloadColor }} />
            Payload
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: sigColor }} />
            Signature
          </span>
        </div>
      </div>

      {/* Verification banner */}
      <div
        className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
        style={{ borderColor: tint(sigColor, 45), background: tint(sigColor, 10) }}
      >
        <span aria-hidden className="font-mono text-base font-bold" style={{ color: sigColor }}>
          {tampered ? "✗" : "✓"}
        </span>
        <span className="font-medium" style={{ color: sigColor }}>
          {tampered
            ? "Signature invalid — token rejected"
            : "Signature valid — verified against the server secret"}
        </span>
      </div>

      {/* Decoded parts */}
      <div className="mt-4 space-y-3">
        {/* Header */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: headerColor }} />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: headerColor }}
            >
              Header
            </span>
          </div>
          <p className="mt-2 break-all font-mono text-sm text-dim">
            {`{ "alg": "HS256", "typ": "JWT" }`}
          </p>
          <p className="mt-1.5 text-xs text-faint">
            Says which algorithm and token type to use when verifying — not a
            secret.
          </p>
        </div>

        {/* Payload */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: payloadColor }} />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: payloadColor }}
            >
              Payload
            </span>
          </div>
          <div
            className="mt-2 flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-xs"
            style={{ background: tint(WARN, 12), color: WARN }}
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              base64url-encoded, NOT encrypted — anyone with the token can read
              this
            </span>
          </div>
          <div className="mt-2 font-mono text-sm leading-relaxed">
            <div className="text-dim">{"{"}</div>
            {payloadLines.map((l) => (
              <div key={l.key} className="pl-4 text-dim">
                {l.key}
                <span
                  className={l.changed ? "font-semibold" : undefined}
                  style={l.changed ? { color: BAD } : undefined}
                >
                  {l.val}
                </span>
                {l.comma ? "," : ""}
                {l.changed ? (
                  <span
                    className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: tint(BAD, 16), color: BAD }}
                  >
                    {"✗ changed"}
                  </span>
                ) : null}
              </div>
            ))}
            <div className="text-dim">{"}"}</div>
          </div>
        </div>

        {/* Signature */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: sigColor }} />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: sigColor }}
            >
              Signature
            </span>
          </div>
          <p className="mt-2 break-all font-mono text-xs text-dim">{SIG_B64}</p>
          <p className="mt-1.5 text-xs text-faint">
            Proves the server issued this token and that it was not changed. Only
            the server secret can produce it.
          </p>
          <div
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: sigColor }}
          >
            <span aria-hidden className="font-mono">
              {tampered ? "✗" : "✓"}
            </span>
            <span>
              {tampered
                ? "does not match the payload — rejected"
                : "matches the payload — verified"}
            </span>
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {tampered
          ? "You changed role to admin, so the payload no longer matches the signature. The server recomputes the signature with its secret, sees the mismatch, and rejects the token. Without the secret you cannot forge a valid signature — that is what makes JWTs trustworthy, and why you must never put secrets in the payload."
          : "A JWT is signed, not secret: the header and payload are just base64url text you can read, so never put passwords or secrets in them. The signature — produced with the server secret — is what makes the token trustworthy, and changing any part breaks it."}
      </p>
    </div>
  );
}
