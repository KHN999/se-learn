"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Op = {
  key: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  body?: string;
  status: number;
  statusText: string;
  response?: string;
  note: string;
};

const OPS: Op[] = [
  {
    key: "list",
    method: "GET",
    path: "/articles",
    summary: "read collection",
    status: 200,
    statusText: "OK",
    response: `[
  { "id": 41, "title": "HTTP basics" },
  { "id": 42, "title": "What is REST?" }
]`,
    note: "GET /articles returns 200 with the whole collection as JSON. The URL is a noun (the resource) and GET carries the read action — that is the uniform interface. The token rides along in every request, so the server stays stateless.",
  },
  {
    key: "read",
    method: "GET",
    path: "/articles/42",
    summary: "read one item",
    status: 200,
    statusText: "OK",
    response: `{
  "id": 42,
  "title": "What is REST?",
  "author": "ada",
  "tags": ["http", "api"]
}`,
    note: "GET /articles/42 returns 200 with one article. Same noun-based URL and same GET verb — the path just narrows to a single item, and the request still carries its own auth.",
  },
  {
    key: "create",
    method: "POST",
    path: "/articles",
    summary: "create",
    body: `{
  "title": "Idempotency",
  "author": "grace"
}`,
    status: 201,
    statusText: "Created",
    response: `{
  "id": 43,
  "title": "Idempotency",
  "author": "grace"
}`,
    note: "POST /articles sends a JSON body and returns 201 Created with the server-assigned id. POST is not idempotent: repeat it and you create another article.",
  },
  {
    key: "replace",
    method: "PUT",
    path: "/articles/42",
    summary: "full update",
    body: `{
  "title": "What REST really means",
  "author": "ada",
  "tags": ["http", "api", "design"]
}`,
    status: 200,
    statusText: "OK",
    response: `{
  "id": 42,
  "title": "What REST really means",
  "author": "ada",
  "tags": ["http", "api", "design"]
}`,
    note: "PUT /articles/42 replaces the whole article with your body and returns 200. PUT is idempotent — sending it again leaves the resource in the same state.",
  },
  {
    key: "patch",
    method: "PATCH",
    path: "/articles/42",
    summary: "partial update",
    body: `{
  "title": "REST, explained"
}`,
    status: 200,
    statusText: "OK",
    response: `{
  "id": 42,
  "title": "REST, explained",
  "author": "ada",
  "tags": ["http", "api"]
}`,
    note: "PATCH /articles/42 updates only the fields you send and returns 200 with the merged result — a partial update rather than a full replace.",
  },
  {
    key: "delete",
    method: "DELETE",
    path: "/articles/42",
    summary: "delete",
    status: 204,
    statusText: "No Content",
    note: "DELETE /articles/42 removes the article and returns 204 No Content: success with an empty body. DELETE is idempotent — deleting an already-gone article is still a no-op.",
  },
];

const PRINCIPLES: [string, string][] = [
  [
    "Resources are nouns",
    "The URL names a thing (/articles, /articles/42), never an action like /getArticle.",
  ],
  [
    "The method is the verb",
    "GET, POST, PUT, PATCH, and DELETE carry the action, so one URL supports many operations.",
  ],
  [
    "Stateless",
    "Each request stands alone and re-sends its own auth; the server keeps no session between calls.",
  ],
  [
    "Standard status codes",
    "200, 201, and 204 report success; the client reads the code, not prose.",
  ],
];

export default function RestDemo({ color }: { color: string }) {
  const [key, setKey] = useState("list");
  const op = OPS.find((o) => o.key === key) ?? OPS[0];

  const requestText = [
    "Host: api.example.com",
    "Authorization: Bearer <token>",
    ...(op.body ? ["Content-Type: application/json", "", op.body] : []),
  ].join("\n");

  const accent = { background: tint(color, 16), color, borderColor: tint(color, 45) };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        REST: resources and verbs (a uniform interface)
      </h3>
      <p className="mt-1 text-sm text-dim">
        One resource and the standard HTTP verbs. Pick an operation to see the
        request the client sends and the response the server returns.
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-faint">Resource</span>
        <code className="rounded-md border border-line bg-bg-2 px-2 py-0.5 font-mono text-text">
          /articles
        </code>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {OPS.map((o) => {
          const on = o.key === key;
          return (
            <button
              key={o.key}
              onClick={() => setKey(o.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-2 text-left transition-colors"
              style={
                on
                  ? accent
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <span className="font-mono text-xs font-semibold">{o.method}</span>{" "}
              <span className="font-mono text-xs">{o.path}</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-faint">
                {o.summary}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            Request
          </p>
          <div className="flex items-center gap-2">
            <span
              className="rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold"
              style={accent}
            >
              {op.method}
            </span>
            <code className="font-mono text-sm text-text">{op.path}</code>
          </div>
          <pre className="thin-scroll mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-dim">
            {requestText}
          </pre>
        </div>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            Response
          </p>
          <div className="flex items-center gap-2">
            <span
              className="rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold"
              style={{ background: tint(GOOD, 16), color: GOOD, borderColor: tint(GOOD, 45) }}
            >
              {op.status}
            </span>
            <span className="text-sm text-dim">{op.statusText}</span>
          </div>
          <pre className="thin-scroll mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-dim">
            {op.response ?? "(no response body)"}
          </pre>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          REST principles
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-dim">
          {PRINCIPLES.map(([term, detail]) => (
            <li key={term}>
              <span className="font-medium text-text">{term}.</span> {detail}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          className="rounded-xl border p-3 text-sm"
          style={{ borderColor: tint(BAD, 45), background: tint(BAD, 8) }}
        >
          <p className="mb-1 flex items-center gap-1.5 font-medium" style={{ color: BAD }}>
            <X className="h-4 w-4" /> BAD — verbs in the path
          </p>
          <code className="block font-mono text-xs text-dim">GET /getArticle?id=42</code>
          <code className="block font-mono text-xs text-dim">POST /deleteArticle</code>
        </div>
        <div
          className="rounded-xl border p-3 text-sm"
          style={{ borderColor: tint(GOOD, 45), background: tint(GOOD, 8) }}
        >
          <p className="mb-1 flex items-center gap-1.5 font-medium" style={{ color: GOOD }}>
            <Check className="h-4 w-4" /> GOOD — noun plus method
          </p>
          <code className="block font-mono text-xs text-dim">GET /articles/42</code>
          <code className="block font-mono text-xs text-dim">DELETE /articles/42</code>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {op.note}
      </p>
    </div>
  );
}
