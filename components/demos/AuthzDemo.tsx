"use client";

import { useState } from "react";
import { ArrowDown, Fingerprint, ShieldCheck } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Role = "guest" | "user" | "admin";

const ROLES: { key: Role; label: string }[] = [
  { key: "guest", label: "Guest" },
  { key: "user", label: "User" },
  { key: "admin", label: "Admin" },
];

type Action = {
  key: string;
  label: string;
  // roles allowed to perform this action, once authenticated
  allow: Role[];
  // plain-English description of the rule, used in the summary
  rule: string;
};

const ACTIONS: Action[] = [
  {
    key: "view",
    label: "View public page",
    allow: ["user", "admin"],
    rule: "any signed-in identity may view the public page",
  },
  {
    key: "edit",
    label: "Edit own profile",
    allow: ["user", "admin"],
    rule: "any signed-in user may edit their own profile",
  },
  {
    key: "delete",
    label: "Delete another user",
    allow: ["admin"],
    rule: "only Admins may delete another user",
  },
  {
    key: "admin",
    label: "Open admin panel",
    allow: ["admin"],
    rule: "only Admins may open the admin panel",
  },
];

function Result({
  ok,
  color,
  children,
}: {
  ok: boolean;
  color: string;
  children: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-medium"
      style={{ color, borderColor: tint(color, 45), background: tint(color, 12) }}
    >
      <span aria-hidden="true">{ok ? "✓" : "✗"}</span>
      {children}
    </span>
  );
}

export default function AuthzDemo({ color }: { color: string }) {
  const [role, setRole] = useState<Role>("user");
  const [actionKey, setActionKey] = useState("delete");

  const action = ACTIONS.find((a) => a.key === actionKey) ?? ACTIONS[0];
  const roleLabel = ROLES.find((r) => r.key === role)!.label;

  // Gate 1: authentication. A Guest presents no identity.
  const authenticated = role !== "guest";
  // Gate 2: authorization. Only evaluated when Gate 1 passed.
  const allowed = authenticated && action.allow.includes(role);

  const authNColor = authenticated ? GOOD : BAD;
  const authZColor = !authenticated
    ? "var(--color-faint)"
    : allowed
      ? GOOD
      : BAD;

  const summary = !authenticated
    ? `Gate 1 fails: no identity was presented (Guest), so authorization is never reached → request denied.`
    : allowed
      ? `You are authenticated as ${roleLabel}, and ${action.rule} → allowed.`
      : `You are authenticated as ${roleLabel}, but ${action.rule} → denied.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Authentication vs authorization: two different gates
      </h3>
      <p className="mt-1 text-sm text-dim">
        Every request passes two gates in order. Gate 1 asks{" "}
        <span className="text-text">who you are</span>; Gate 2 asks{" "}
        <span className="text-text">what you may do</span>. Pick an identity and
        an action to watch both gates decide.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            identity
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => {
              const on = r.key === role;
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  aria-pressed={on}
                  className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                  style={
                    on
                      ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                      : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                  }
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            action
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((a) => {
              const on = a.key === actionKey;
              return (
                <button
                  key={a.key}
                  onClick={() => setActionKey(a.key)}
                  aria-pressed={on}
                  className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                  style={
                    on
                      ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                      : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                  }
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-line-soft bg-bg-2 px-3 py-2 text-sm text-dim">
        Request:{" "}
        <span className="font-mono text-text">{roleLabel}</span> wants to{" "}
        <span className="font-mono text-text">{action.label.toLowerCase()}</span>
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {/* Gate 1 — Authentication */}
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: tint(authNColor, 45), background: tint(authNColor, 8) }}
        >
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 shrink-0" style={{ color: authNColor }} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                Gate 1 &middot; Authentication
              </p>
              <p className="text-sm font-medium text-text">Who are you?</p>
            </div>
          </div>
          <div className="mt-3">
            <Result ok={authenticated} color={authNColor}>
              {authenticated
                ? `Authenticated as ${roleLabel}`
                : "Not authenticated"}
            </Result>
            <p className="mt-1.5 text-xs text-dim">
              {authenticated
                ? "Identity verified — a valid signed-in user."
                : "A Guest presented no identity, so this gate fails."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-faint">
          <ArrowDown className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {authenticated ? "then check permission" : "authorization skipped"}
          </span>
        </div>

        {/* Gate 2 — Authorization */}
        <div
          className="rounded-xl border p-4 transition-opacity"
          style={{
            borderColor: authenticated ? tint(authZColor, 45) : "var(--color-line-soft)",
            background: authenticated ? tint(authZColor, 8) : "transparent",
            opacity: authenticated ? 1 : 0.6,
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 shrink-0"
              style={{ color: authenticated ? authZColor : "var(--color-faint)" }}
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                Gate 2 &middot; Authorization
              </p>
              <p className="text-sm font-medium text-text">
                What are you allowed to do?
              </p>
            </div>
          </div>
          <div className="mt-3">
            {authenticated ? (
              <>
                <Result ok={allowed} color={authZColor}>
                  {allowed ? "Allowed" : "Denied"}
                </Result>
                <p className="mt-1.5 text-xs text-dim">
                  {allowed
                    ? "Your role permits this action."
                    : "Your role does not permit this action."}
                </p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft px-2.5 py-1 text-sm font-medium text-faint">
                  <span aria-hidden="true">{"—"}</span>
                  Not reached
                </span>
                <p className="mt-1.5 text-xs text-dim">
                  Authorization only runs after authentication passes.
                </p>
              </>
            )}
          </div>
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
