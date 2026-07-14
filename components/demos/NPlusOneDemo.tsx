"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Database, Layers, Repeat } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const QUERY_MS = 20;

const POSTS = [
  { id: 1, title: "Getting started with SQL", authorId: 1, author: "Ada" },
  { id: 2, title: "Why indexes matter", authorId: 2, author: "Grace" },
  { id: 3, title: "Understanding joins", authorId: 1, author: "Ada" },
  { id: 4, title: "Caching basics", authorId: 3, author: "Alan" },
  { id: 5, title: "Intro to N+1", authorId: 2, author: "Grace" },
] as const;

type Mode = "naive" | "batched";

const NAIVE_COUNT = 1 + POSTS.length; // 1 for the posts + 1 per post
const BATCH_COUNT = 1;

const MODES: { key: Mode; label: string; count: number; verdict: string; good: boolean }[] = [
  { key: "naive", label: "N+1 (naive)", count: NAIVE_COUNT, verdict: "Slow", good: false },
  { key: "batched", label: "Single join / batched", count: BATCH_COUNT, verdict: "Fast", good: true },
];

const JOIN_SQL =
  "SELECT posts.*, authors.*\nFROM posts\nJOIN authors ON authors.id = posts.author_id\nLIMIT 5;";

const authorQueries = POSTS.map((p) => ({
  key: p.id,
  title: p.title,
  sql: `SELECT * FROM authors WHERE id = ${p.authorId};`,
}));

export default function NPlusOneDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("naive");

  const naive = mode === "naive";
  const count = naive ? NAIVE_COUNT : BATCH_COUNT;
  const ms = count * QUERY_MS;
  const accent = naive ? BAD : GOOD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The N+1 query problem</h3>
      <p className="mt-1 text-sm text-dim">
        Render a page of 5 blog posts, each with its author. The naive way fires a
        separate query for every post. Switch modes and watch the query count.
      </p>

      {/* Mode toggle — the two cards are the toggle, so the contrast stays visible. */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODES.map((m) => {
          const on = m.key === mode;
          const semantic = m.good ? GOOD : BAD;
          const rowMs = m.count * QUERY_MS;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-xl border p-4 text-left transition-colors"
              style={
                on
                  ? { background: tint(color, 10), borderColor: tint(color, 45) }
                  : { background: "var(--color-bg-2)", borderColor: "var(--color-line)" }
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text">{m.label}</span>
                <span
                  className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: semantic, background: tint(semantic, 14) }}
                >
                  {m.verdict}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-semibold" style={{ color: semantic }}>
                  {m.count}
                </span>
                <span className="text-xs text-faint">
                  {m.count === 1 ? "query" : "queries"}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-dim">
                <Clock className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
                <span className="font-mono">~{rowMs}ms</span>
                {on && <span className="text-faint">· selected</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actual queries issued for the selected mode. */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          <Database className="h-3.5 w-3.5" aria-hidden="true" />
          queries actually issued
        </p>

        <div className="flex flex-col gap-2">
          {/* Query 1 — always: fetch the posts (a plain list, or a JOIN). */}
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-[11px]"
              style={{ color, background: tint(color, 14) }}
            >
              1
            </span>
            <pre className="thin-scroll flex-1 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-dim">
              {naive ? "SELECT * FROM posts LIMIT 5;" : JOIN_SQL}
            </pre>
          </div>

          {naive ? (
            <div
              className="ml-2.5 mt-1 rounded-lg border border-dashed p-2.5"
              style={{ borderColor: tint(color, 40) }}
            >
              <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                <Repeat className="h-3 w-3" aria-hidden="true" />
                then one query per post — the loop
              </p>
              <div className="flex flex-col gap-1.5">
                {authorQueries.map((q, i) => (
                  <div key={q.key} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-line font-mono text-[11px] text-faint">
                      {i + 2}
                    </span>
                    <div className="flex-1">
                      <pre className="thin-scroll overflow-x-auto whitespace-pre font-mono text-xs text-dim">
                        {q.sql}
                      </pre>
                      <span className="font-mono text-[11px] text-faint">
                        {`-- author for "${q.title}"`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="ml-7 flex items-center gap-1.5 text-xs text-dim">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              One round trip loads the posts and their authors together — no loop.
            </p>
          )}
        </div>

        {/* Totals for the selected mode. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-sm">
          <span className="text-dim">
            Total:{" "}
            <span className="font-mono font-semibold" style={{ color: accent }}>
              {count} {count === 1 ? "query" : "queries"}
            </span>
          </span>
          <span className="text-dim">
            Est. time:{" "}
            <span className="font-mono font-semibold" style={{ color: accent }}>
              ~{ms}ms
            </span>
          </span>
          <span className="ml-auto font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
            {naive ? "Slow" : "Fast"}
          </span>
        </div>
      </div>

      {/* Scaling note — the whole point of N+1. */}
      <div className="mt-3 flex items-start gap-1.5 text-xs" style={{ color: naive ? WARN : GOOD }}>
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          {naive
            ? "Grows linearly: at 100 posts this becomes 101 queries."
            : "Stays flat: at 100 posts this is still 1 query."}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {naive
          ? "N+1 is a query fired inside a loop: one query for the list, then one more for each row — 6 queries here, and it scales with the list. Fix it by eager-loading: a single JOIN, or one batched SELECT ... WHERE id IN (...)."
          : "Fixed: one query loads the posts and their authors together — a JOIN, or a single batched SELECT ... WHERE id IN (...). The count stays at 1 no matter how many posts, because you fetch everything up front instead of a query per row."}
      </p>
    </div>
  );
}
