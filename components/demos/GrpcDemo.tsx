"use client";

import { useState } from "react";
import { Binary, FileJson } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

const MODES = [
  { key: "rest", label: "REST + JSON" },
  { key: "grpc", label: "gRPC + Protobuf" },
] as const;
type Mode = (typeof MODES)[number]["key"];

type View = {
  defLabel: string;
  def: string;
  schemaNote: string;
  payloadLabel: string;
  payload: string;
  caption: string;
};

const REST_VIEW: View = {
  defLabel: "Request · plain HTTP",
  def: `GET /users/42  HTTP/1.1
Host: api.example.com
Accept: application/json`,
  schemaNote:
    "No enforced schema — the response shape is a convention. Fields can appear or vanish, so clients must stay defensive.",
  payloadLabel: "Response · text over HTTP/1.1",
  payload: `HTTP/1.1 200 OK
content-type: application/json

{"id":42,"name":"Ada","email":"ada@nine.dev"}`,
  caption:
    "Human-readable: a status line, text headers, then a JSON body — about 120 B on the wire. Trivial to curl and debug from any browser.",
};

const GRPC_VIEW: View = {
  defLabel: "Contract · user.proto",
  def: `syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}

message GetUserRequest { int32 id = 1; }

message User {
  int32  id    = 1;
  string name  = 2;
  string email = 3;
}`,
  schemaNote:
    "Contract-first: the .proto compiles to typed client and server stubs in every language, and the shape is enforced at build time.",
  payloadLabel: "Response · binary over HTTP/2",
  payload: `08 2A 12 03 41 64 61 1A 0C 61
64 61 40 6E 69 6E 65 2E 64 65
76`,
  caption:
    "Not human-readable — a 21-byte protobuf message plus a 5-byte frame (about 26 B). Decodes to the same id=42, name=Ada, email=ada@nine.dev.",
};

type Tone = "good" | "warn" | "bad";
type Cell = { text: string; tone: Tone };
type Cmp = { label: string; rest: Cell; grpc: Cell };

const COMPARE: Cmp[] = [
  {
    label: "Payload size",
    rest: { text: "about 120 B (text)", tone: "warn" },
    grpc: { text: "about 26 B (binary)", tone: "good" },
  },
  {
    label: "Format",
    rest: { text: "Human-readable text", tone: "good" },
    grpc: { text: "Compact binary, opaque", tone: "warn" },
  },
  {
    label: "Transport",
    rest: { text: "HTTP/1.1", tone: "warn" },
    grpc: { text: "HTTP/2, multiplexed", tone: "good" },
  },
  {
    label: "Schema",
    rest: { text: "Loose convention", tone: "warn" },
    grpc: { text: "Enforced .proto contract", tone: "good" },
  },
  {
    label: "Browser support",
    rest: { text: "Native fetch and curl", tone: "good" },
    grpc: { text: "Needs a grpc-web proxy", tone: "bad" },
  },
  {
    label: "Streaming",
    rest: { text: "Request / response only", tone: "warn" },
    grpc: { text: "Client, server and bi-di", tone: "good" },
  },
];

const toneColor = (t: Tone) => (t === "good" ? GOOD : t === "warn" ? WARN : BAD);

const BEST = [
  {
    key: "grpc" as Mode,
    title: "gRPC + Protobuf",
    best: "Internal service-to-service calls",
    why: "Low latency, tiny payloads and strong contracts between services you control. Streaming and generated stubs shine deep inside a backend.",
  },
  {
    key: "rest" as Mode,
    title: "REST + JSON",
    best: "Public and browser-facing APIs",
    why: "Anyone can call it with fetch or curl, no tooling or proxy required. Readable payloads make it easy to debug and adopt.",
  },
];

const REST_STATUS =
  "Selected: REST + JSON — readable text over HTTP/1.1 with a loose schema, callable from any browser or curl. The pragmatic default for public, browser-facing APIs.";
const GRPC_STATUS =
  "Selected: gRPC + Protobuf — a strongly-typed .proto contract compiled to stubs, sending compact binary over HTTP/2 with streaming. Faster and smaller for internal service-to-service calls, but not browser-native.";

export default function GrpcDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("rest");

  const isRest = mode === "rest";
  const view = isRest ? REST_VIEW : GRPC_VIEW;
  const Icon = isRest ? FileJson : Binary;
  const status = isRest ? REST_STATUS : GRPC_STATUS;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        gRPC vs REST: the same call, two very different wires
      </h3>
      <p className="mt-1 text-sm text-dim">
        Both answer the same request, GetUser(id: 42). Switch modes to see the
        contract, the exact bytes on the wire, and the trade-offs each style
        makes.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {view.defLabel}
            </span>
          </div>
          <pre className="thin-scroll overflow-x-auto rounded-lg border border-line bg-bg-2 p-3 font-mono text-xs leading-relaxed text-dim">
            {view.def}
          </pre>
          <p className="mt-2 text-xs leading-relaxed text-faint">{view.schemaNote}</p>
        </div>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {view.payloadLabel}
            </span>
          </div>
          <pre
            className="thin-scroll overflow-x-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"
            style={{
              background: tint(color, 6),
              borderColor: tint(color, 30),
              color: "var(--color-text)",
            }}
          >
            {view.payload}
          </pre>
          <p className="mt-2 text-xs leading-relaxed text-faint">{view.caption}</p>
        </div>
      </div>

      <div className="thin-scroll mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
                Compare
              </th>
              {MODES.map((m) => {
                const sel = m.key === mode;
                return (
                  <th
                    key={m.key}
                    className="border-b border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{
                      color: sel ? color : "var(--color-faint)",
                      background: sel ? tint(color, 10) : "transparent",
                    }}
                  >
                    {m.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((row) => (
              <tr key={row.label} className="border-b border-line-soft">
                <td className="px-3 py-1.5 font-mono text-xs text-faint">{row.label}</td>
                <td
                  className="px-3 py-1.5 font-mono text-xs"
                  style={{
                    color: toneColor(row.rest.tone),
                    background: isRest ? tint(color, 8) : "transparent",
                  }}
                >
                  {row.rest.text}
                </td>
                <td
                  className="px-3 py-1.5 font-mono text-xs"
                  style={{
                    color: toneColor(row.grpc.tone),
                    background: isRest ? "transparent" : tint(color, 8),
                  }}
                >
                  {row.grpc.text}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {BEST.map((card) => {
          const sel = card.key === mode;
          const CardIcon = card.key === "rest" ? FileJson : Binary;
          return (
            <div
              key={card.key}
              className="rounded-xl border p-3 transition-colors"
              style={{
                borderColor: sel ? color : "var(--color-line)",
                background: sel ? tint(color, 8) : "transparent",
              }}
            >
              <div className="flex items-center gap-2">
                <CardIcon
                  className="h-4 w-4"
                  style={{ color: sel ? color : "var(--color-faint)" }}
                  aria-hidden="true"
                />
                <span className="font-mono text-xs font-semibold text-text">
                  {card.title}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium" style={{ color: GOOD }}>
                Best for: {card.best}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-dim">{card.why}</p>
            </div>
          );
        })}
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
