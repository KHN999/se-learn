"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Preset = {
  key: string;
  label: string;
  method: string;
  path: string;
  accept: string;
  body?: string;
  status: string;
  statusOk: boolean;
  resContentType: string;
  resBody: string;
  note: string;
};

const PRESETS: Preset[] = [
  {
    key: "get-pricing",
    label: "GET /pricing",
    method: "GET",
    path: "/pricing",
    accept: "text/html",
    status: "200 OK",
    statusOk: true,
    resContentType: "text/html; charset=utf-8",
    resBody: "<h1>Pricing</h1>",
    note: "The server found the page and sent it back.",
  },
  {
    key: "post-orders",
    label: "POST /orders",
    method: "POST",
    path: "/orders",
    accept: "application/json",
    body: '{"item":"Lamp","qty":1}',
    status: "201 Created",
    statusOk: true,
    resContentType: "application/json",
    resBody: '{"id":102,"item":"Lamp"}',
    note: "The order body was accepted and a new resource was created (201).",
  },
  {
    key: "get-missing",
    label: "GET /missing",
    method: "GET",
    path: "/missing",
    accept: "text/html",
    status: "404 Not Found",
    statusOk: false,
    resContentType: "application/json",
    resBody: '{"error":"not found"}',
    note: "The path didn't match anything, so the response is 404 — the request was well-formed, the resource just isn't there.",
  },
];

export default function HttpExchangeDemo({ color }: { color: string }) {
  const [key, setKey] = useState("get-pricing");
  const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0];
  const statusColor = preset.statusOk ? GOOD : BAD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Inspect one HTTP request and its response
      </h3>
      <p className="mt-1 text-sm text-dim">
        Pick a request and read the raw bytes on the wire. One request goes in,
        exactly one response comes back.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const on = p.key === key;
          return (
            <button
              key={p.key}
              onClick={() => setKey(p.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-faint">
            request
          </p>
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
            <span style={{ color }}>{preset.method}</span> {preset.path} HTTP/1.1
            {"\n"}Host: shop.example.com
            {"\n"}Accept: {preset.accept}
            {"\n"}Authorization: Bearer •••
            {preset.body ? "\n\n" + preset.body : ""}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-faint">
            response
          </p>
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
            HTTP/1.1 <span style={{ color: statusColor }}>{preset.status}</span>
            {"\n"}Content-Type: {preset.resContentType}
            {"\n\n"}{preset.resBody}
          </pre>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {preset.note} One request in, exactly one response out — and the server
        keeps no memory of you afterward (that&apos;s why cookies/tokens exist).
      </p>
    </div>
  );
}
