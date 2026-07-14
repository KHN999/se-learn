"use client";

import { useState } from "react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Risk = {
  code: string;
  name: string;
  what: string;
  example: string;
  fix: string;
};

const RISKS: Risk[] = [
  {
    code: "A01",
    name: "Broken Access Control",
    what: "Users act outside their intended permissions.",
    example:
      "Editing the id in /account/123 to /account/124 and reading someone else's data.",
    fix: "Deny by default and enforce authorization on the server for every request.",
  },
  {
    code: "A02",
    name: "Cryptographic Failures",
    what: "Sensitive data is exposed through weak or missing cryptography.",
    example:
      "Storing passwords or card numbers in plain text, or serving a login page over HTTP.",
    fix: "Encrypt data in transit and at rest with strong algorithms, and protect the keys.",
  },
  {
    code: "A03",
    name: "Injection (incl. SQLi/XSS)",
    what: "Untrusted input is treated as code by an interpreter.",
    example:
      "A search box that lets \"'; DROP TABLE users; --\" reach the database as a query.",
    fix: "Use parameterized queries plus context-aware output encoding.",
  },
  {
    code: "A04",
    name: "Insecure Design",
    what: "Security controls are missing from the design itself.",
    example:
      "A password-reset flow with no rate limit, so attackers can brute-force the code.",
    fix: "Threat-model early and build on secure design patterns.",
  },
  {
    code: "A05",
    name: "Security Misconfiguration",
    what: "Default credentials, verbose errors, or open storage buckets.",
    example:
      "A cloud bucket left public, or an admin panel still using admin/admin.",
    fix: "Harden every component, apply least privilege, and disable defaults.",
  },
  {
    code: "A06",
    name: "Vulnerable & Outdated Components",
    what: "Dependencies with known, published vulnerabilities.",
    example:
      "Shipping a library version with a public CVE that has a working exploit.",
    fix: "Keep an inventory, patch promptly, and monitor security advisories.",
  },
  {
    code: "A07",
    name: "Identification & Authentication Failures",
    what: "Weak login or session handling lets attackers impersonate users.",
    example:
      "Allowing unlimited login attempts, or session IDs that never expire.",
    fix: "Require MFA, manage sessions strongly, and remove default credentials.",
  },
  {
    code: "A08",
    name: "Software & Data Integrity Failures",
    what: "Untrusted updates, deserialization, or CI/CD steps go unverified.",
    example:
      "An auto-update that installs code without checking the vendor signature.",
    fix: "Verify signatures on updates and protect the build pipeline.",
  },
  {
    code: "A09",
    name: "Security Logging & Monitoring Failures",
    what: "Breaches go undetected because nothing meaningful is recorded.",
    example:
      "No alert fires while an attacker probes logins for hours every night.",
    fix: "Log security events, raise alerts, and actively monitor them.",
  },
  {
    code: "A10",
    name: "Server-Side Request Forgery (SSRF)",
    what: "The server is tricked into fetching attacker-controlled URLs.",
    example:
      "An image-preview feature fetching http://169.254.169.254 to steal cloud metadata.",
    fix: "Allowlist permitted destinations and block requests to internal IPs.",
  },
];

export default function OwaspDemo({ color }: { color: string }) {
  const [code, setCode] = useState("A01");
  const selected = RISKS.find((r) => r.code === code) ?? RISKS[0];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The OWASP Top 10 explorer</h3>
      <p className="mt-1 text-sm text-dim">
        A widely-used awareness list of the most critical web application
        security risks, refreshed periodically. Pick a risk to see what it is,
        an example, and the core fix. (2021 edition.)
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <ul className="flex flex-col gap-1.5">
          {RISKS.map((r) => {
            const on = r.code === selected.code;
            return (
              <li key={r.code}>
                <button
                  onClick={() => setCode(r.code)}
                  aria-pressed={on}
                  className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                  style={
                    on
                      ? {
                          background: tint(color, 14),
                          borderColor: tint(color, 45),
                          color: "var(--color-text)",
                        }
                      : {
                          borderColor: "var(--color-line)",
                          color: "var(--color-dim)",
                        }
                  }
                >
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: on ? color : "var(--color-faint)" }}
                  >
                    {r.code}
                  </span>
                  <span className={on ? "font-medium" : ""}>{r.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 font-mono text-xs font-semibold"
              style={{ background: tint(color, 16), color }}
            >
              {selected.code}
            </span>
            <h4 className="font-semibold text-text">{selected.name}</h4>
          </div>

          <dl className="mt-4 flex flex-col gap-4">
            <div className="flex gap-2.5">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color }}
                aria-hidden="true"
              />
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  What it is
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-dim">
                  {selected.what}
                </dd>
              </div>
            </div>

            <div className="flex gap-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color }}
                aria-hidden="true"
              />
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  Example
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-dim">
                  {selected.example}
                </dd>
              </div>
            </div>
          </dl>

          <div
            className="mt-4 flex gap-2.5 rounded-lg border p-3"
            role="status"
            aria-live="polite"
            style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
          >
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color }}
              aria-hidden="true"
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                Core fix
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-text">
                {selected.fix}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
