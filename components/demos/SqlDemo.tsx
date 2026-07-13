"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Row = Record<string, string | number>;

const users = [
  { id: 1, name: "Ada", age: 36, city: "London" },
  { id: 2, name: "Grace", age: 29, city: "Boston" },
  { id: 3, name: "Alan", age: 41, city: "London" },
  { id: 4, name: "Edsger", age: 52, city: "Austin" },
  { id: 5, name: "Katherine", age: 33, city: "Boston" },
];
const orders = [
  { id: 101, userId: 1, item: "Book", amount: 12 },
  { id: 102, userId: 3, item: "Pen", amount: 3 },
  { id: 103, userId: 1, item: "Lamp", amount: 40 },
  { id: 104, userId: 2, item: "Desk", amount: 120 },
];

type Preset = { key: string; label: string; sql: string; columns: string[]; rows: () => Row[] };

const PRESETS: Preset[] = [
  {
    key: "filter",
    label: "WHERE + ORDER BY",
    sql: "SELECT * FROM users\nWHERE age > 35\nORDER BY age",
    columns: ["id", "name", "age", "city"],
    rows: () => users.filter((u) => u.age > 35).sort((a, b) => a.age - b.age),
  },
  {
    key: "project",
    label: "SELECT columns",
    sql: "SELECT name, city\nFROM users",
    columns: ["name", "city"],
    rows: () => users.map((u) => ({ name: u.name, city: u.city })),
  },
  {
    key: "join",
    label: "JOIN",
    sql: "SELECT u.name, o.item, o.amount\nFROM users u\nJOIN orders o ON o.userId = u.id",
    columns: ["name", "item", "amount"],
    rows: () =>
      orders.map((o) => {
        const u = users.find((x) => x.id === o.userId)!;
        return { name: u.name, item: o.item, amount: o.amount };
      }),
  },
  {
    key: "group",
    label: "GROUP BY",
    sql: "SELECT city, COUNT(*) AS users, ROUND(AVG(age)) AS avg_age\nFROM users\nGROUP BY city",
    columns: ["city", "users", "avg_age"],
    rows: () => {
      const by = new Map<string, number[]>();
      for (const u of users) (by.get(u.city) ?? by.set(u.city, []).get(u.city)!).push(u.age);
      return [...by.entries()].map(([city, ages]) => ({
        city,
        users: ages.length,
        avg_age: Math.round(ages.reduce((s, a) => s + a, 0) / ages.length),
      }));
    },
  },
];

export default function SqlDemo({
  color,
  focus = "filter",
}: {
  color: string;
  focus?: string;
}) {
  const [key, setKey] = useState(focus);
  const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0];
  const rows = preset.rows();

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Run a query against a tiny users table
      </h3>
      <p className="mt-1 text-sm text-dim">
        Same 5 users (and their orders). Pick a query and see exactly which rows
        and columns come back.
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
              style={on ? { background: tint(color, 16), color, borderColor: tint(color, 45) } : { color: "var(--color-dim)", borderColor: "var(--color-line)" }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {preset.sql}
      </pre>

      <div className="thin-scroll mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              {preset.columns.map((c) => (
                <th
                  key={c}
                  className="border-b border-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-faint"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line-soft">
                {preset.columns.map((c) => (
                  <td key={c} className="px-3 py-1.5 font-mono text-dim">
                    {String(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {rows.length} row{rows.length === 1 ? "" : "s"} returned. The database
        filtered, joined, or grouped the data for you — you described the result,
        not the steps.
      </p>
    </div>
  );
}
