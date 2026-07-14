"use client";

import { useState } from "react";
import { AlertTriangle, Check, ShieldCheck, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

// A single, explicit allow statement. Everything not covered here is denied.
const POLICY = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow" as const,
      Action: ["s3:PutObject", "s3:GetObject"],
      Resource: "arn:aws:s3:::uploads/*",
    },
  ],
};

type ActionDef = {
  key: string;
  label: string;
  action: string;
  resource: string;
  danger?: boolean;
};

const ACTIONS: ActionDef[] = [
  {
    key: "put-uploads",
    label: "s3:PutObject → uploads/*",
    action: "s3:PutObject",
    resource: "arn:aws:s3:::uploads/photo-01.jpg",
  },
  {
    key: "get-uploads",
    label: "s3:GetObject → uploads/*",
    action: "s3:GetObject",
    resource: "arn:aws:s3:::uploads/photo-01.jpg",
  },
  {
    key: "delete-uploads",
    label: "s3:DeleteObject → uploads/*",
    action: "s3:DeleteObject",
    resource: "arn:aws:s3:::uploads/photo-01.jpg",
  },
  {
    key: "put-secrets",
    label: "s3:PutObject → secrets/*",
    action: "s3:PutObject",
    resource: "arn:aws:s3:::secrets/db-password.json",
  },
  {
    key: "create-user",
    label: "iam:CreateUser",
    action: "iam:CreateUser",
    resource: "arn:aws:iam::123456789012:user/*",
    danger: true,
  },
];

function decide(a: ActionDef) {
  const stmt = POLICY.Statement[0];
  const actionOk = stmt.Action.includes(a.action);
  const pattern = stmt.Resource;
  const resourceOk = pattern.endsWith("*")
    ? a.resource.startsWith(pattern.slice(0, -1))
    : a.resource === pattern;
  const allow = stmt.Effect === "Allow" && actionOk && resourceOk;
  const reason = allow
    ? "Matched the Allow statement — both the action and the resource are explicitly permitted."
    : !actionOk
      ? `${a.action} is not in the statement Action list, so nothing allows it → default deny.`
      : `The resource is outside ${pattern}, so nothing allows it → default deny.`;
  return { allow, reason, actionOk, resourceOk };
}

export default function IamDemo({ color }: { color: string }) {
  const [key, setKey] = useState(ACTIONS[0].key);
  const sel = ACTIONS.find((a) => a.key === key) ?? ACTIONS[0];
  const verdict = decide(sel);
  const tone = verdict.allow ? GOOD : BAD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        IAM: identity + policy decides access
      </h3>
      <p className="mt-1 text-sm text-dim">
        A principal (an identity) can do only what an attached policy explicitly
        allows. Everything else is denied by default.
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ background: tint(color, 14), color }}
        >
          <ShieldCheck className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Principal (identity)
          </p>
          <p className="truncate font-mono text-sm text-text">photo-uploader</p>
          <p className="text-xs text-dim">
            service role — one attached policy, shown below
          </p>
        </div>
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-faint">
        Attached policy
      </p>
      <pre className="thin-scroll mt-1 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
        {JSON.stringify(POLICY, null, 2)}
      </pre>

      <p className="mt-4 text-sm text-dim">Try an action against this policy:</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ACTIONS.map((a) => {
          const on = a.key === key;
          return (
            <button
              key={a.key}
              onClick={() => setKey(a.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
              style={
                on
                  ? {
                      background: tint(color, 16),
                      color,
                      borderColor: tint(color, 45),
                    }
                  : {
                      color: "var(--color-dim)",
                      borderColor: "var(--color-line)",
                    }
              }
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: tint(tone, 45), background: tint(tone, 8) }}
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Decision
          </p>
          <span
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold"
            style={{
              color: tone,
              borderColor: tint(tone, 45),
              background: tint(tone, 14),
            }}
          >
            {verdict.allow ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            {verdict.allow ? "ALLOW" : "DENY"}
          </span>
        </div>

        <p className="mt-2 break-all font-mono text-sm text-text">
          {sel.action} <span className="text-faint">on</span> {sel.resource}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-dim">{verdict.reason}</p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="text-dim">
            Action in policy:{" "}
            <span
              className="font-semibold"
              style={{ color: verdict.actionOk ? GOOD : BAD }}
            >
              {verdict.actionOk ? "yes" : "no"}
            </span>
          </span>
          <span className="text-dim">
            Resource under uploads/*:{" "}
            <span
              className="font-semibold"
              style={{ color: verdict.resourceOk ? GOOD : BAD }}
            >
              {verdict.resourceOk ? "yes" : "no"}
            </span>
          </span>
        </div>
      </div>

      {sel.danger ? (
        <div
          className="mt-3 flex items-start gap-2 rounded-xl border p-3 text-sm leading-relaxed"
          style={{
            borderColor: tint(WARN, 45),
            background: tint(WARN, 8),
            color: "var(--color-dim)",
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: WARN }}
          />
          <span>
            <span className="font-semibold" style={{ color: WARN }}>
              Least privilege:
            </span>{" "}
            a photo uploader never needs to create IAM users. Granting
            iam:CreateUser here would be dangerous over-permission — a takeover
            of this role could mint brand-new admin identities. Grant only what
            the job needs.
          </span>
        </div>
      ) : null}

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        IAM: identities get policies that grant least-privilege access — the
        minimum an action requires. Nothing is permitted unless a policy
        explicitly allows it, so everything is denied by default.
      </p>
    </div>
  );
}
