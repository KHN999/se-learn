"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Code = { code: number; name: string; react: string };
type Klass = { range: string; label: string; color: string; codes: Code[] };

const CLASSES: Klass[] = [
  {
    range: "2xx",
    label: "success",
    color: "#34d399",
    codes: [
      { code: 200, name: "OK", react: "Use the response body." },
      { code: 201, name: "Created", react: "The resource now exists; often read Location." },
      { code: 204, name: "No Content", react: "Success, nothing to render." },
    ],
  },
  {
    range: "3xx",
    label: "redirect",
    color: "#60a5fa",
    codes: [
      { code: 301, name: "Moved Permanently", react: "Follow the new URL (and remember it)." },
      { code: 302, name: "Found", react: "Follow the new URL this time." },
      { code: 304, name: "Not Modified", react: "Use your cached copy." },
    ],
  },
  {
    range: "4xx",
    label: "client error",
    color: "#fbbf24",
    codes: [
      { code: 400, name: "Bad Request", react: "Fix the request — it's malformed." },
      { code: 401, name: "Unauthorized", react: "Authenticate, then retry." },
      { code: 403, name: "Forbidden", react: "You're authenticated but not allowed." },
      { code: 404, name: "Not Found", react: "The resource doesn't exist." },
      { code: 429, name: "Too Many Requests", react: "Back off and retry after the delay." },
    ],
  },
  {
    range: "5xx",
    label: "server error",
    color: "#f87171",
    codes: [
      { code: 500, name: "Internal Server Error", react: "Server bug — a retry may or may not help." },
      { code: 502, name: "Bad Gateway", react: "An upstream server failed." },
      { code: 503, name: "Service Unavailable", react: "Temporarily down — retry with backoff." },
    ],
  },
];

const note =
  "The first digit is the class — that single digit is what caches (304), redirects (301), and retry logic (429/503) act on automatically, before anyone reads the body.";

export default function StatusCodeDemo({ color }: { color: string }) {
  const [selected, setSelected] = useState(404);

  const active = CLASSES.find((k) => k.codes.some((c) => c.code === selected))!;
  const activeCode = active.codes.find((c) => c.code === selected)!;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">HTTP status code explorer</h3>
      <p className="mt-1 text-sm text-dim">
        Every response carries a three-digit code. Pick one to see its class and
        how a well-behaved client should react.
      </p>

      <div
        className="mt-4 flex flex-col gap-3 border-l-2 pl-4"
        style={{ borderColor: tint(color, 40) }}
      >
        {CLASSES.map((k) => (
          <div
            key={k.range}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div
              className="font-mono text-xs sm:w-40 sm:shrink-0"
              style={{ color: k.color }}
            >
              {k.range} · {k.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {k.codes.map((c) => {
                const on = c.code === selected;
                return (
                  <button
                    key={c.code}
                    onClick={() => setSelected(c.code)}
                    aria-pressed={on}
                    className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
                    style={
                      on
                        ? { background: k.color, color: "var(--color-bg)", borderColor: k.color }
                        : { background: tint(k.color, 10), color: k.color, borderColor: tint(k.color, 40) }
                    }
                  >
                    {c.code}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: tint(active.color, 40), background: tint(active.color, 8) }}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-4xl font-semibold" style={{ color: active.color }}>
            {activeCode.code}
          </span>
          <div>
            <div className="font-semibold text-text">{activeCode.name}</div>
            <div className="font-mono text-xs" style={{ color: active.color }}>
              {active.range} · {active.label}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-dim">
          Client reacts: <span className="text-text">{activeCode.react}</span>
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
