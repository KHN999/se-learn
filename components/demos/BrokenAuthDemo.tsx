"use client";

import { useState } from "react";
import {
  Fingerprint,
  Gauge,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

// The attacker's raw material and the pool of accounts that are actually
// guessable (owners who reused a password that shows up in the leak).
const LEAKED_PAIRS = 50000;
const VULNERABLE = 1600;

type DefenseKey = "rate" | "mfa" | "breached" | "lockout";

const TOGGLES: {
  key: DefenseKey;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { key: "rate", label: "Rate limiting", hint: "Throttle attempts per IP and account", icon: Gauge },
  { key: "lockout", label: "Account lockout / backoff", hint: "Freeze an account after failed tries", icon: Lock },
  { key: "breached", label: "Breached-password check", hint: "Reject known-leaked passwords", icon: Fingerprint },
  { key: "mfa", label: "MFA", hint: "Require a second factor to log in", icon: Smartphone },
];

const SCALE: { label: string; tone: "bad" | "mid" | "good" }[] = [
  { label: "Critical", tone: "bad" },
  { label: "High", tone: "bad" },
  { label: "Elevated", tone: "mid" },
  { label: "Moderate", tone: "mid" },
  { label: "Low", tone: "good" },
];

// Deterministic thousands separator — avoids locale-dependent formatting so
// server and client render identically.
function fmt(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function BrokenAuthDemo({ color }: { color: string }) {
  const [defenses, setDefenses] = useState<Record<DefenseKey, boolean>>({
    rate: false,
    lockout: false,
    breached: false,
    mfa: false,
  });

  const toggle = (key: DefenseKey) =>
    setDefenses((d) => ({ ...d, [key]: !d[key] }));

  // MFA blocks takeover even with the right password; a breached-password check
  // removes the reused-password root cause. Rate limiting and lockout only
  // throttle the flood — real, but not a cure on their own.
  const passwordDefeated = defenses.mfa || defenses.breached;
  const throttle = (defenses.rate ? 0.08 : 1) * (defenses.lockout ? 0.3 : 1);
  const compromised = passwordDefeated
    ? 0
    : Math.round(VULNERABLE * throttle);

  const risk = defenses.mfa
    ? { label: "Low", tone: "good" as const }
    : compromised === 0
      ? { label: "Low", tone: "good" as const }
      : compromised > 800
        ? { label: "Critical", tone: "bad" as const }
        : compromised > 200
          ? { label: "High", tone: "bad" as const }
          : compromised > 50
            ? { label: "Elevated", tone: "mid" as const }
            : { label: "Moderate", tone: "mid" as const };

  const toneColor =
    risk.tone === "good" ? GOOD : risk.tone === "bad" ? BAD : color;
  const HeadIcon = risk.tone === "good" ? ShieldCheck : ShieldAlert;

  const headline = defenses.mfa
    ? "Even a correct password fails at the second factor — automated takeover is blocked."
    : defenses.breached
      ? "Reused leaked passwords are rejected, so the credential dump no longer unlocks accounts."
      : compromised >= VULNERABLE
        ? `Account takeover: about ${fmt(compromised)} accounts compromised — everyone who reused a breached password.`
        : `Guessing is throttled to a crawl: about ${fmt(compromised)} takeovers still get through.`;

  const notes: { text: string; good: boolean }[] = [];
  if (defenses.rate)
    notes.push({ good: true, text: "Rate limiting throttles the flood of attempts down to a trickle." });
  if (defenses.lockout)
    notes.push({ good: true, text: "Account lockout and backoff freeze an account after repeated failures." });
  if (defenses.breached)
    notes.push({ good: true, text: "Breached-password checks reject known-leaked passwords, so reused credentials no longer match." });
  if (defenses.mfa)
    notes.push({ good: true, text: "MFA requires a second factor, so a stolen password is not enough by itself." });
  if (notes.length === 0)
    notes.push({ good: false, text: "No defenses stand between the attacker and every reused password in the dump." });

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Credential stuffing vs a hardened login
      </h3>
      <p className="mt-1 text-sm text-dim">
        An attacker runs a script trying thousands of leaked email and password
        pairs against your login endpoint. Turn defenses on and watch the
        outcome change.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 rounded-xl border border-line-soft bg-bg-2/50 p-3 text-sm">
        <span className="text-dim">
          Attacker script:{" "}
          <span className="font-mono text-text">{fmt(LEAKED_PAIRS)}</span> leaked
          email / password pairs
        </span>
        <span className="text-dim">
          Vulnerable pool:{" "}
          <span className="font-mono text-text">~{fmt(VULNERABLE)}</span> reused a
          breached password
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TOGGLES.map((t) => {
          const on = defenses[t.key];
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => toggle(t.key)}
              aria-pressed={on}
              className="flex items-start gap-3 rounded-xl border bg-transparent p-3 text-left transition-colors"
              style={
                on
                  ? { borderColor: tint(color, 45), background: tint(color, 10) }
                  : { borderColor: "var(--color-line)" }
              }
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: on ? color : "var(--color-faint)" }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-text">
                  {t.label}
                </span>
                <span className="block text-xs text-dim">{t.hint}</span>
              </span>
              <span
                className="ml-auto rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={
                  on
                    ? { color, background: tint(color, 16) }
                    : { color: "var(--color-faint)" }
                }
              >
                {on ? "on" : "off"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: tint(toneColor, 40), background: tint(toneColor, 8) }}
      >
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          attack risk (worse to safer)
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {SCALE.map((s) => {
            const active = s.label === risk.label;
            const c = s.tone === "good" ? GOOD : s.tone === "bad" ? BAD : color;
            return (
              <span
                key={s.label}
                className="rounded-md px-2 py-0.5 font-mono text-xs"
                style={
                  active
                    ? { color: c, background: tint(c, 16), fontWeight: 600 }
                    : { color: "var(--color-faint)" }
                }
              >
                {s.label}
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <HeadIcon className="h-4 w-4 shrink-0" style={{ color: toneColor }} />
          <span className="font-semibold" style={{ color: toneColor }}>
            Risk: {risk.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-text">{headline}</p>

        <ul className="mt-3 space-y-1.5">
          {notes.map((nt, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-dim">
              {nt.good ? (
                <ShieldCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: GOOD }}
                />
              ) : (
                <ShieldAlert
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: BAD }}
                />
              )}
              <span>{nt.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        Broken authentication is a cluster of failures, not a single bug. MFA
        alone stops most automated takeovers; rate limiting, breached-password
        checks, and proper session handling close the routes that remain.
      </p>
    </div>
  );
}
