"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Order = { id: number; status: "new" | "paid" };

type Method = {
  key: "GET" | "POST" | "PUT" | "DELETE";
  line: string;
  safe: boolean;
  idempotent: boolean;
  after1: Order[];
  after2: Order[];
  note: string;
};

const METHODS: Method[] = [
  {
    key: "GET",
    line: "GET /orders",
    safe: true,
    idempotent: true,
    after1: [{ id: 1, status: "new" }],
    after2: [{ id: 1, status: "new" }],
    note: "GET is safe and idempotent — reading twice changes nothing, so caches and clients can retry it freely.",
  },
  {
    key: "POST",
    line: "POST /orders",
    safe: false,
    idempotent: false,
    after1: [
      { id: 1, status: "new" },
      { id: 2, status: "new" },
    ],
    after2: [
      { id: 1, status: "new" },
      { id: 2, status: "new" },
      { id: 3, status: "new" },
    ],
    note: "POST is neither safe nor idempotent — a flaky network that retries a POST can create the order twice. That's why double-clicking 'Buy' can charge you twice.",
  },
  {
    key: "PUT",
    line: "PUT /orders/1 {paid}",
    safe: false,
    idempotent: true,
    after1: [{ id: 1, status: "paid" }],
    after2: [{ id: 1, status: "paid" }],
    note: "PUT is not safe (it writes) but it IS idempotent — 'set order #1 to paid' lands on the same end state no matter how many times it runs.",
  },
  {
    key: "DELETE",
    line: "DELETE /orders/1",
    safe: false,
    idempotent: true,
    after1: [],
    after2: [],
    note: "DELETE is not safe (it changes state) but it IS idempotent — once order #1 is gone, deleting it again leaves the same end state: no order #1.",
  },
];

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <span className="font-mono text-xs text-faint">(no orders)</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {orders.map((o) => (
        <span
          key={o.id}
          className="rounded-md border border-line-soft bg-bg-2 px-2 py-0.5 font-mono text-xs text-dim"
        >
          #{o.id} {o.status}
        </span>
      ))}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs"
      style={
        value
          ? { borderColor: tint(GOOD, 45), color: GOOD, background: tint(GOOD, 12) }
          : { borderColor: "var(--color-line)", color: "var(--color-faint)" }
      }
    >
      <span className="font-mono">{value ? "✓" : "✗"}</span>
      {label}: {value ? "yes" : "no"}
    </span>
  );
}

export default function HttpMethodsDemo({ color }: { color: string }) {
  const [key, setKey] = useState<Method["key"]>("GET");
  const m = METHODS.find((x) => x.key === key) ?? METHODS[0];
  const duplicate = m.key === "POST";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Idempotency &amp; safety: what happens if a request runs twice
      </h3>
      <p className="mt-1 text-sm text-dim">
        The server starts with one order:{" "}
        <span className="font-mono text-faint">#1 new</span>. Pick a method and
        compare the server state after one call versus two identical calls.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {METHODS.map((x) => {
          const on = x.key === key;
          return (
            <button
              key={x.key}
              onClick={() => setKey(x.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {x.key}
            </button>
          );
        })}
      </div>

      <p className="mt-3 font-mono text-sm text-text">
        <span style={{ color }}>{m.key}</span>
        {m.line.slice(m.key.length)}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge label="safe" value={m.safe} />
        <Badge label="idempotent" value={m.idempotent} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            After 1 call
          </p>
          <OrderList orders={m.after1} />
        </div>
        <div
          className="rounded-xl border bg-bg-2/50 p-3"
          style={{ borderColor: duplicate ? BAD : "var(--color-line-soft)" }}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            After 2 identical calls
          </p>
          <OrderList orders={m.after2} />
          {duplicate && (
            <p className="mt-2 text-xs" style={{ color: BAD }}>
              ⚠ duplicate created
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {m.note}
      </p>
    </div>
  );
}
