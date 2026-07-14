"use client";

import { Fragment, useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const DB_MS = 200;
const CACHE_MS = 5;

type Box = "client" | "cache" | "db";
type Outcome = "MISS" | "HIT";
type LogEntry = { req: number; outcome: Outcome; ms: number };
type Step = {
  note: string;
  req: number;
  active: Box[];
  cacheFilled: boolean;
  evict: boolean;
  outcome: Outcome | null;
  reqMs: number | null;
  dbTouched: boolean;
  hits: number;
  misses: number;
  log: LogEntry[];
};

const L1: LogEntry = { req: 1, outcome: "MISS", ms: DB_MS };
const L2: LogEntry = { req: 2, outcome: "HIT", ms: CACHE_MS };
const L3: LogEntry = { req: 3, outcome: "HIT", ms: CACHE_MS };
const L4: LogEntry = { req: 4, outcome: "MISS", ms: DB_MS };

const steps: Step[] = [
  {
    note: "Request #1 for GET /dashboard. The client asks the cache first, keyed by the request.",
    req: 1, active: ["client", "cache"], cacheFilled: false, evict: false,
    outcome: null, reqMs: null, dbTouched: false, hits: 0, misses: 0, log: [],
  },
  {
    note: "Cache MISS: nothing is stored for this key, so the request falls through to the database.",
    req: 1, active: ["cache"], cacheFilled: false, evict: false,
    outcome: "MISS", reqMs: null, dbTouched: false, hits: 0, misses: 0, log: [],
  },
  {
    note: "The database runs the slow query (about 200ms) and returns the freshly computed result.",
    req: 1, active: ["db"], cacheFilled: false, evict: false,
    outcome: "MISS", reqMs: DB_MS, dbTouched: true, hits: 0, misses: 0, log: [],
  },
  {
    note: "The result is written to the cache with a TTL, then returned. Request #1 paid the full cost.",
    req: 1, active: ["cache", "client"], cacheFilled: true, evict: false,
    outcome: "MISS", reqMs: DB_MS, dbTouched: true, hits: 0, misses: 1, log: [L1],
  },
  {
    note: "Request #2, same key: cache HIT, served from memory in about 5ms. The database is untouched.",
    req: 2, active: ["client", "cache"], cacheFilled: true, evict: false,
    outcome: "HIT", reqMs: CACHE_MS, dbTouched: false, hits: 1, misses: 1, log: [L1, L2],
  },
  {
    note: "Request #3: another HIT in about 5ms. Repeat reads stay cheap while the entry is warm.",
    req: 3, active: ["client", "cache"], cacheFilled: true, evict: false,
    outcome: "HIT", reqMs: CACHE_MS, dbTouched: false, hits: 2, misses: 1, log: [L1, L2, L3],
  },
  {
    note: "TTL expired, so the entry is evicted. The cache is empty again and the next read cannot use it.",
    req: 3, active: ["cache"], cacheFilled: false, evict: true,
    outcome: null, reqMs: null, dbTouched: false, hits: 2, misses: 1, log: [L1, L2, L3],
  },
  {
    note: "Request #4: cache MISS (the entry expired), so it is back to the database for about 200ms.",
    req: 4, active: ["cache", "db"], cacheFilled: false, evict: false,
    outcome: "MISS", reqMs: DB_MS, dbTouched: true, hits: 2, misses: 1, log: [L1, L2, L3],
  },
  {
    note: "The cache is refilled from fresh data. The hard part is not hits and misses but invalidation: knowing when cached data is stale.",
    req: 4, active: ["cache", "client"], cacheFilled: true, evict: false,
    outcome: "MISS", reqMs: DB_MS, dbTouched: true, hits: 2, misses: 2, log: [L1, L2, L3, L4],
  },
];

const BOXES: { key: Box; label: string; top: string }[] = [
  { key: "client", label: "Client", top: "GET" },
  { key: "cache", label: "Cache", top: "in-memory" },
  { key: "db", label: "Database", top: "SQL" },
];

export default function CacheDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const total = frame.hits + frame.misses;
  const hitRate = total === 0 ? 0 : Math.round((frame.hits / total) * 100);

  const cacheSub = frame.cacheFilled
    ? "cached · TTL 3s"
    : frame.evict
      ? "TTL expired"
      : "no entry";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Caching: hit vs miss</h3>
      <p className="mt-1 text-sm text-dim">
        The same expensive read, served four times. A MISS pays the full database
        cost and fills the cache; a HIT is served from memory in a few
        milliseconds.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          style={{ background: color }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 flex items-stretch gap-2">
        {BOXES.map((b, i) => {
          const isActive = frame.active.includes(b.key);
          const bColor =
            b.key === "cache" && frame.evict
              ? BAD
              : b.key === "db" && frame.dbTouched
                ? WARN
                : isActive
                  ? color
                  : "var(--color-line)";
          const bBg =
            b.key === "cache" && frame.evict
              ? tint(BAD, 10)
              : b.key === "db" && frame.dbTouched
                ? tint(WARN, 12)
                : isActive
                  ? tint(color, 10)
                  : "transparent";
          const sub =
            b.key === "client"
              ? "/dashboard"
              : b.key === "cache"
                ? cacheSub
                : "query ~200ms";
          const top = b.key === "cache" ? (frame.cacheFilled ? "/dashboard" : "empty") : b.top;
          return (
            <Fragment key={b.key}>
              <div
                className="flex-1 rounded-xl border p-3 text-center transition-colors"
                style={{ borderColor: bColor, background: bBg }}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {b.label}
                </div>
                <div className="mt-1 truncate text-sm font-medium text-text">{top}</div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-dim">{sub}</div>
              </div>
              {i < BOXES.length - 1 && (
                <span className="shrink-0 self-center text-faint" aria-hidden="true">
                  →
                </span>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-faint">Request #{frame.req}</span>
        {frame.outcome !== null && (
          <span
            className="rounded-md px-2 py-0.5 font-mono font-medium"
            style={{
              color: frame.outcome === "HIT" ? GOOD : BAD,
              background: tint(frame.outcome === "HIT" ? GOOD : BAD, 14),
            }}
          >
            {frame.outcome}
          </span>
        )}
        {frame.reqMs !== null && (
          <span
            className="rounded-md px-2 py-0.5 font-mono"
            style={{
              color: frame.reqMs >= 100 ? WARN : GOOD,
              background: tint(frame.reqMs >= 100 ? WARN : GOOD, 12),
            }}
          >
            ~{frame.reqMs}ms
          </span>
        )}
        {frame.outcome !== null && (
          <span
            className="rounded-md px-2 py-0.5 font-mono"
            style={{
              color: frame.dbTouched ? WARN : GOOD,
              background: tint(frame.dbTouched ? WARN : GOOD, 12),
            }}
          >
            {frame.dbTouched ? "Database queried" : "Database skipped"}
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex-1 rounded-xl border border-line bg-bg-2/50 p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Misses
          </div>
          <div className="mt-1 text-2xl font-semibold" style={{ color: BAD }}>
            {frame.misses}
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-line bg-bg-2/50 p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Hits
          </div>
          <div className="mt-1 text-2xl font-semibold" style={{ color: GOOD }}>
            {frame.hits}
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-line bg-bg-2/50 p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Hit rate
          </div>
          <div className="mt-1 text-2xl font-semibold" style={{ color }}>
            {hitRate}%
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-line-soft bg-bg-2/40 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
          Request log
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {frame.log.length === 0 ? (
            <span className="font-mono text-xs text-faint">
              no requests completed yet
            </span>
          ) : (
            frame.log.map((e) => (
              <div
                key={e.req}
                className="flex items-center justify-between font-mono text-xs"
              >
                <span className="text-dim">#{e.req} GET /dashboard</span>
                <span className="flex items-center gap-2">
                  <span style={{ color: e.outcome === "HIT" ? GOOD : BAD }}>
                    {e.outcome}
                  </span>
                  <span className="text-faint">~{e.ms}ms</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>
    </div>
  );
}
