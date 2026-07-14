"use client";

import { useState } from "react";
import { ArrowRight, Ban, CheckCircle2, Globe, Server, ShieldAlert } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

// The server will only fetch hosts explicitly on this list (safe mode).
const ALLOWLIST = ["example.com"];

type Mode = "vuln" | "safe";

type Target = {
  key: string;
  url: string;
  host: string;
  ip: string;
  internal: boolean;
  label: string;
  note: string; // why this IP is (or is not) internal
  loot: string; // what a vulnerable fetch actually returns
};

const TARGETS: Target[] = [
  {
    key: "legit",
    url: "https://example.com/image.png",
    host: "example.com",
    ip: "93.184.216.34",
    internal: false,
    label: "Legit image",
    note: "public host, resolves to a public IP",
    loot: "the image bytes — exactly what the feature is for",
  },
  {
    key: "metadata",
    url: "http://169.254.169.254/latest/meta-data/",
    host: "169.254.169.254",
    ip: "169.254.169.254",
    internal: true,
    label: "Cloud metadata",
    note: "link-local metadata address (169.254.169.254)",
    loot: "IAM role credentials — AccessKeyId, SecretAccessKey, Token",
  },
  {
    key: "localhost",
    url: "http://localhost/admin",
    host: "localhost",
    ip: "127.0.0.1",
    internal: true,
    label: "Internal admin",
    note: "loopback address (127.0.0.1) — the server itself",
    loot: "the internal admin panel, never meant to face the internet",
  },
];

const MODES: { key: Mode; label: string; accent: string }[] = [
  { key: "vuln", label: "No validation (vulnerable)", accent: BAD },
  { key: "safe", label: "Allowlist + block internal IPs (safe)", accent: GOOD },
];

type Outcome = {
  color: string;
  headline: string;
  detail: string;
  kind: "leak" | "ok" | "blocked";
};

function evaluate(vulnerable: boolean, t: Target): Outcome {
  const allowlisted = ALLOWLIST.includes(t.host);
  if (vulnerable) {
    return t.internal
      ? {
          color: BAD,
          headline: "Server fetched internal resource — creds leaked",
          detail: `The trusted server reached ${t.host} and handed back ${t.loot}.`,
          kind: "leak",
        }
      : {
          color: GOOD,
          headline: "Fetched successfully",
          detail: `Returned ${t.loot}.`,
          kind: "ok",
        };
  }
  if (t.internal) {
    return {
      color: GOOD,
      headline: "Request refused",
      detail: `Blocked: ${t.host} resolves to a private IP (${t.ip}).`,
      kind: "blocked",
    };
  }
  if (!allowlisted) {
    return {
      color: GOOD,
      headline: "Request refused",
      detail: `Blocked: ${t.host} is not on the allowlist.`,
      kind: "blocked",
    };
  }
  return {
    color: GOOD,
    headline: "Fetched successfully",
    detail: `Allowlisted host on a public IP — returned ${t.loot}.`,
    kind: "ok",
  };
}

export default function SsrfDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("vuln");
  const [targetKey, setTargetKey] = useState("metadata");

  const vulnerable = mode === "vuln";
  const target = TARGETS.find((t) => t.key === targetKey) ?? TARGETS[0];
  const allowlisted = ALLOWLIST.includes(target.host);
  const outcome = evaluate(vulnerable, target);
  const OutcomeIcon =
    outcome.kind === "leak"
      ? ShieldAlert
      : outcome.kind === "blocked"
        ? Ban
        : CheckCircle2;
  const targetAccent = target.internal ? WARN : GOOD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        SSRF: tricking the server into fetching internal targets
      </h3>
      <p className="mt-1 text-sm text-dim">
        Your app offers a link-preview feature: it fetches a URL the user submits
        and shows what is there. Watch what the server can reach when the URL
        points inward.
      </p>

      <div className="mt-4">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          server-side url validation
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => {
            const on = m.key === mode;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                aria-pressed={on}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  on
                    ? { background: tint(m.accent, 16), color: m.accent, borderColor: tint(m.accent, 45) }
                    : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                }
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          url the user submits
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TARGETS.map((t) => {
            const on = t.key === targetKey;
            return (
              <button
                key={t.key}
                onClick={() => setTargetKey(t.key)}
                aria-pressed={on}
                className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                style={
                  on
                    ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                    : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 break-all rounded-lg border border-line-soft bg-bg-2 px-3 py-2 font-mono text-xs text-text">
        {target.url}
      </p>

      <div className="thin-scroll mt-3 overflow-x-auto">
        <div className="flex min-w-max items-stretch gap-2">
          <div className="w-40 shrink-0 rounded-xl border border-line-soft bg-bg-2/50 p-3">
            <div className="flex items-center gap-1.5 text-faint">
              <Globe className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                attacker input
              </span>
            </div>
            <p className="mt-1 text-sm text-text">A URL you paste</p>
            <p className="text-xs text-dim">the link-preview field</p>
          </div>

          <div className="flex shrink-0 items-center">
            <ArrowRight className="h-4 w-4 text-faint" />
          </div>

          <div
            className="w-40 shrink-0 rounded-xl border p-3"
            style={{ borderColor: tint(color, 45), background: tint(color, 8) }}
          >
            <div className="flex items-center gap-1.5" style={{ color }}>
              <Server className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-widest">
                your server
              </span>
            </div>
            <p className="mt-1 text-sm text-text">Fetches the URL</p>
            <p className="text-xs text-dim">trusted, inside the network</p>
          </div>

          <div className="flex shrink-0 items-center">
            <ArrowRight className="h-4 w-4 text-faint" />
          </div>

          <div
            className="w-40 shrink-0 rounded-xl border p-3"
            style={{ borderColor: tint(targetAccent, 45), background: tint(targetAccent, 8) }}
          >
            <div className="flex items-center gap-1.5" style={{ color: targetAccent }}>
              {target.internal ? (
                <ShieldAlert className="h-3.5 w-3.5" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              <span className="font-mono text-[10px] uppercase tracking-widest">
                {target.internal ? "internal target" : "external target"}
              </span>
            </div>
            <p className="mt-1 break-all font-mono text-sm text-text">{target.host}</p>
            <p className="text-xs text-dim">resolves to {target.ip}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
        <div className="rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2">
          <span className="text-faint">internal / private IP</span>
          <p className="mt-0.5 font-medium" style={{ color: targetAccent }}>
            {target.internal ? `yes — ${target.note}` : `no — ${target.note}`}
          </p>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2">
          <span className="text-faint">on host allowlist</span>
          <p className="mt-0.5 font-medium" style={{ color: allowlisted ? GOOD : BAD }}>
            {allowlisted ? "yes — example.com" : "no — host not permitted"}
          </p>
        </div>
      </div>

      <div
        className="mt-3 rounded-xl border p-4"
        style={{ borderColor: tint(outcome.color, 45), background: tint(outcome.color, 8) }}
      >
        <div className="flex items-center gap-2">
          <OutcomeIcon className="h-4 w-4 shrink-0" style={{ color: outcome.color }} />
          <p className="text-sm font-semibold" style={{ color: outcome.color }}>
            {outcome.headline}
          </p>
        </div>
        <p className="mt-1.5 text-sm text-dim">{outcome.detail}</p>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {vulnerable
          ? "SSRF turns your server into a proxy: because it sits inside the trusted network, a URL you hand it can reach cloud metadata, localhost, and private services you never could directly. The fix — resolve the host, block private, loopback, and link-local IPs (127.0.0.1, 10.x, 192.168.x, 169.254.169.254), allow only known hosts, and re-check after every redirect."
          : "Validation resolves the host and rejects private, loopback, and link-local IP ranges, so the metadata and localhost attacks are refused while the allowlisted public URL still works. Re-checking after each redirect stops a public link from bouncing to an internal one."}
      </p>
    </div>
  );
}
