"use client";

import { useState } from "react";
import { ArrowRight, Check, Database, Flame, Link2, Split } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const NUM_SHARDS = 3;

type User = { id: number; name: string; age: number };

const USERS: User[] = [
  { id: 12, name: "Ada", age: 36 },
  { id: 30, name: "Grace", age: 29 },
  { id: 33, name: "Lin", age: 45 },
  { id: 7, name: "Alan", age: 41 },
  { id: 22, name: "Edsger", age: 27 },
  { id: 55, name: "Kay", age: 33 },
  { id: 41, name: "Barbara", age: 52 },
  { id: 44, name: "Guido", age: 24 },
  { id: 50, name: "Margaret", age: 38 },
];

const shardOf = (id: number) => id % NUM_SHARDS;

const SHARDS: User[][] = Array.from({ length: NUM_SHARDS }, (_, s) =>
  USERS.filter((u) => shardOf(u.id) === s),
);

type Query = { key: string; label: string; id: number | null };

const QUERIES: Query[] = [
  { key: "u7", label: "read user 7", id: 7 },
  { key: "u12", label: "read user 12", id: 12 },
  { key: "u30", label: "read user 30", id: 30 },
  { key: "u41", label: "read user 41", id: 41 },
  { key: "scan", label: "users older than 30", id: null },
];

export default function ShardingDemo({ color }: { color: string }) {
  const [queryKey, setQueryKey] = useState("u7");
  const [hotKey, setHotKey] = useState(false);

  const query = QUERIES.find((q) => q.key === queryKey) ?? QUERIES[0];
  const isScan = query.id === null;
  const targetShard = isScan ? -1 : shardOf(query.id as number);
  const hitColor = isScan ? WARN : GOOD;

  const isHit = (s: number) => isScan || s === targetShard;
  const isMatch = (u: User) => (isScan ? u.age > 30 : u.id === query.id);

  const load = hotKey ? [16, 68, 16] : [33, 33, 34];

  const statusHead = isScan
    ? "No shard key on this query, so it fans out to all 3 shards and merges the results — every node does work."
    : `The shard key routes this read with ${query.id} % ${NUM_SHARDS} = ${targetShard}, so only Shard ${targetShard} is touched — the other ${NUM_SHARDS - 1} shards stay idle.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Sharding: split the data across nodes by a key
      </h3>
      <p className="mt-1 text-sm text-dim">
        Nine users are partitioned across 3 shards by id % 3. Pick a query and
        watch how it is routed — one shard for a keyed lookup, all of them when
        the shard key is missing.
      </p>

      {/* query buttons */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {QUERIES.map((q) => {
          const on = q.key === queryKey;
          return (
            <button
              key={q.key}
              onClick={() => setQueryKey(q.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* routing */}
      <div
        className="thin-scroll mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border p-3 text-sm"
        style={{ borderColor: tint(hitColor, 40), background: tint(hitColor, 8) }}
      >
        {isScan ? (
          <>
            <span className="whitespace-nowrap font-mono text-dim">age &gt; 30</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            <span className="whitespace-nowrap font-mono" style={{ color: WARN }}>
              no shard key
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            <Split className="h-4 w-4 shrink-0" style={{ color: WARN }} aria-hidden />
            <span className="whitespace-nowrap" style={{ color: WARN }}>
              fan out to all {NUM_SHARDS} shards, then merge
            </span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap font-mono text-dim">
              hash({query.id})
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            <span className="whitespace-nowrap font-mono text-text">
              {query.id} % {NUM_SHARDS} = {targetShard}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
            <Check className="h-4 w-4 shrink-0" style={{ color: GOOD }} aria-hidden />
            <span className="whitespace-nowrap" style={{ color: GOOD }}>
              reads Shard {targetShard} only (1 of {NUM_SHARDS})
            </span>
          </>
        )}
      </div>

      {/* shards */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SHARDS.map((rows, s) => {
          const hit = isHit(s);
          const hotShard = hotKey && s === 1;
          const barColor = hotShard
            ? BAD
            : hotKey
              ? tint(GOOD, 28)
              : tint(GOOD, 55);
          return (
            <div
              key={s}
              className="rounded-xl border p-3 transition-colors"
              style={{
                borderColor: hit ? hitColor : "var(--color-line)",
                background: hit ? tint(hitColor, 8) : "transparent",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text">
                  <Database className="h-3.5 w-3.5 text-faint" aria-hidden />
                  Shard {s}
                </span>
                {hit ? (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: tint(hitColor, 16), color: hitColor }}
                  >
                    {isScan ? "fan-out" : "queried"}
                  </span>
                ) : (
                  <span className="text-[10px] text-faint">idle</span>
                )}
              </div>

              <ul className="mt-2 flex flex-col gap-1">
                {rows.map((u) => {
                  const match = hit && isMatch(u);
                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between rounded-md px-2 py-1 font-mono text-xs"
                      style={{
                        background: match ? tint(hitColor, 16) : "var(--color-bg-2)",
                        color: match ? hitColor : "var(--color-dim)",
                      }}
                    >
                      <span>
                        #{u.id} {u.name}
                      </span>
                      <span className="text-faint">age {u.age}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${load[s]}%`, background: barColor }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-faint">
                  {load[s]}% of load{hotShard ? " — hot key" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* hot key toggle */}
      <div className="mt-3">
        <button
          onClick={() => setHotKey((v) => !v)}
          aria-pressed={hotKey}
          className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
          style={
            hotKey
              ? { background: tint(BAD, 16), color: BAD, borderColor: tint(BAD, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          <Flame className="h-3.5 w-3.5" aria-hidden />
          {hotKey ? "hot key: on" : "simulate a hot key"}
        </button>
      </div>

      {/* hard parts */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          the hard parts
        </p>
        <ul className="flex flex-col gap-2 text-sm text-dim">
          <li className="flex items-start gap-2">
            <Split
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: WARN }}
              aria-hidden
            />
            <span>
              <span style={{ color: WARN }}>No shard key.</span> A query that does
              not filter on the key cannot be routed, so it fans out to every
              shard and merges — no faster than one big table.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Flame
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: WARN }}
              aria-hidden
            />
            <span>
              <span style={{ color: WARN }}>Hot keys and skew.</span> If one key or
              range takes most of the traffic, a single shard is overloaded while
              the rest sit idle.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Link2
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: WARN }}
              aria-hidden
            />
            <span>
              <span style={{ color: WARN }}>Cross-shard work.</span> JOINs and
              transactions that span shards are slow and hard to keep atomic, and
              adding a shard forces rebalancing.
            </span>
          </li>
        </ul>
      </div>

      {/* status */}
      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {statusHead} Sharding spreads storage and writes across nodes by
        partitioning on a key, at the cost of cross-shard operations and
        rebalancing.
      </p>
    </div>
  );
}
