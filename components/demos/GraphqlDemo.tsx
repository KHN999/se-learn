"use client";

import { useState } from "react";
import { ArrowRight, Repeat, Trash2 } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Field = "name" | "email" | "total" | "date";

// The full user object REST hands back from GET /users/42. The screen only
// needs `name`; everything else is over-fetch.
const REST_USER: { k: string; v: string; used: boolean }[] = [
  { k: "id", v: "42", used: false },
  { k: "name", v: '"Ada Lovelace"', used: true },
  { k: "email", v: '"ada@corp.io"', used: false },
  { k: "phone", v: '"+1-555-0142"', used: false },
  { k: "avatarUrl", v: '"/img/42.png"', used: false },
  { k: "bio", v: '"Computing pioneer"', used: false },
  { k: "role", v: '"member"', used: false },
  { k: "locale", v: '"en-GB"', used: false },
  { k: "timezone", v: '"Europe/London"', used: false },
  { k: "city", v: '"London"', used: false },
  { k: "country", v: '"UK"', used: false },
  { k: "isVerified", v: "true", used: false },
  { k: "createdAt", v: '"2019-03-11"', used: false },
];

// Each order comes back fat too — the screen only reads `total`.
const REST_ORDER_FIELDS: { k: string; used: boolean }[] = [
  { k: "id", used: false },
  { k: "total", used: true },
  { k: "status", used: false },
  { k: "createdAt", used: false },
];
const REST_ORDERS: Record<string, string>[] = [
  { id: "5007", total: '"£42.00"', status: '"shipped"', createdAt: '"2026-07-10"' },
  { id: "5001", total: '"£18.50"', status: '"shipped"', createdAt: '"2026-07-02"' },
  { id: "4990", total: '"£7.20"', status: '"delivered"', createdAt: '"2026-06-28"' },
];

// Values GraphQL returns for exactly the fields you name.
const ORDER_ROWS = [
  { total: "£42.00", date: "2026-07-10" },
  { total: "£18.50", date: "2026-07-02" },
  { total: "£7.20", date: "2026-06-28" },
];

const FIELD_CHIPS: { key: Field; label: string }[] = [
  { key: "name", label: "user.name" },
  { key: "email", label: "user.email" },
  { key: "total", label: "orders.total" },
  { key: "date", label: "orders.date" },
];

export default function GraphqlDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"rest" | "graphql">("rest");
  const [sel, setSel] = useState<Record<Field, boolean>>({
    name: true,
    email: false,
    total: true,
    date: false,
  });

  const toggle = (k: Field) => setSel((s) => ({ ...s, [k]: !s[k] }));

  const orderFieldsOn = sel.total || sel.date;
  const selectedCount =
    (sel.name ? 1 : 0) + (sel.email ? 1 : 0) + (sel.total ? 1 : 0) + (sel.date ? 1 : 0);

  // Build the GraphQL query text from the toggled fields.
  const queryLines: string[] = ["{", "  user(id: 42) {"];
  if (sel.name) queryLines.push("    name");
  if (sel.email) queryLines.push("    email");
  if (orderFieldsOn) {
    queryLines.push("    orders(last: 3) {");
    if (sel.total) queryLines.push("      total");
    if (sel.date) queryLines.push("      date");
    queryLines.push("    }");
  }
  queryLines.push("  }", "}");
  const query = queryLines.join("\n");

  // The response mirrors the query exactly — nothing extra comes back.
  const userData: Record<string, unknown> = {};
  if (sel.name) userData.name = "Ada Lovelace";
  if (sel.email) userData.email = "ada@corp.io";
  if (orderFieldsOn) {
    userData.orders = ORDER_ROWS.map((o) => {
      const row: Record<string, string> = {};
      if (sel.total) row.total = o.total;
      if (sel.date) row.date = o.date;
      return row;
    });
  }
  const response = JSON.stringify({ data: { user: userData } }, null, 2);

  const restUserWasted = REST_USER.filter((f) => !f.used).length;
  const restOrderWasted =
    REST_ORDERS.length * REST_ORDER_FIELDS.filter((f) => !f.used).length;
  const restWasted = restUserWasted + restOrderWasted;

  const stats =
    mode === "rest"
      ? [
          { Icon: Repeat, label: "round trips", value: "2", tone: BAD },
          { Icon: Trash2, label: "wasted fields", value: String(restWasted), tone: WARN },
        ]
      : [
          { Icon: Repeat, label: "round trips", value: "1", tone: GOOD },
          { Icon: Trash2, label: "wasted fields", value: "0", tone: GOOD },
        ];

  const status =
    mode === "rest"
      ? `REST needed 2 round trips and sent back ${restWasted} fields the screen never shows — over-fetching from /users/42, then a second call just to reach the orders. Each endpoint has a fixed shape, so the client takes whatever it returns.`
      : `GraphQL asked one endpoint for exactly ${selectedCount} field${selectedCount === 1 ? "" : "s"} and got them in a single round trip — no over-fetching and no extra calls. The trade-off versus REST: caching and query-cost limits get harder once every client can shape its own query.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        GraphQL: ask for exactly what you need
      </h3>
      <p className="mt-1 text-sm text-dim">
        A mobile screen needs the name for user 42 plus their 3 latest order
        totals. Watch how each style fetches it.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-line p-0.5">
        {(["rest", "graphql"] as const).map((m) => {
          const on = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={on}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={on ? { background: tint(color, 16), color } : { color: "var(--color-dim)" }}
            >
              {m === "rest" ? "REST" : "GraphQL"}
            </button>
          );
        })}
      </div>

      {mode === "rest" ? (
        <div className="mt-4 space-y-3">
          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-faint">
              2 requests
            </p>
            <div className="flex items-center gap-2 text-dim">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-faint" />
              <span>GET /users/42</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-dim">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-faint" />
              <span>GET /users/42/orders</span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: BAD }}
              >
                extra round trip
              </span>
            </div>
          </div>

          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-faint">
              GET /users/42 response
              <span style={{ color: WARN }}>over-fetch + extra round trips</span>
            </p>
            <div className="text-dim">{"{"}</div>
            {REST_USER.map((f) => (
              <div key={f.k} className="flex flex-wrap items-center gap-2 pl-4">
                <span className={f.used ? "text-text" : "text-faint line-through"}>
                  {`"${f.k}": ${f.v},`}
                </span>
                {f.used ? (
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: GOOD }}
                  >
                    used
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-faint">
                    unused
                  </span>
                )}
              </div>
            ))}
            <div className="text-dim">{"}"}</div>
          </div>

          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-faint">
              GET /users/42/orders response
            </p>
            <div className="text-dim">{"["}</div>
            {REST_ORDERS.map((o, i) => (
              <div key={o.id} className="pl-4">
                <div className="text-dim">{"{"}</div>
                {REST_ORDER_FIELDS.map((f) => (
                  <div key={f.k} className="flex flex-wrap items-center gap-2 pl-4">
                    <span
                      className={f.used ? "text-text" : "text-faint line-through"}
                    >
                      {`"${f.k}": ${o[f.k]},`}
                    </span>
                    {f.used ? (
                      <span
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: GOOD }}
                      >
                        used
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-widest text-faint">
                        unused
                      </span>
                    )}
                  </div>
                ))}
                <div className="text-dim">
                  {i < REST_ORDERS.length - 1 ? "}," : "}"}
                </div>
              </div>
            ))}
            <div className="text-dim">{"]"}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-faint">
              pick fields for the query
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FIELD_CHIPS.map((c) => {
                const on = sel[c.key];
                return (
                  <button
                    key={c.key}
                    onClick={() => toggle(c.key)}
                    aria-pressed={on}
                    className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
                    style={
                      on
                        ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                        : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-dim">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-faint" />
              <span>POST /graphql</span>
              <span className="text-[10px] uppercase tracking-widest text-faint">
                1 request
              </span>
            </div>
            <pre className="whitespace-pre text-dim">{query}</pre>
          </div>

          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-faint">
              response
              <span style={{ color: GOOD }}>exactly what you asked for</span>
            </p>
            <pre className="whitespace-pre text-dim">{response}</pre>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="inline-flex items-center gap-2 rounded-lg border border-line-soft bg-bg-2 px-3 py-1.5"
          >
            <s.Icon className="h-4 w-4 shrink-0" style={{ color: s.tone }} />
            <span className="font-mono text-sm text-text">{s.value}</span>
            <span className="text-xs text-dim">{s.label}</span>
          </div>
        ))}
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
