"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const HANDSHAKE_MS = 100;
const QUERY_MS = 10;
const POOL_SIZE = 3;
const REQUESTS = 4;
const BAR_MAX = HANDSHAKE_MS + QUERY_MS;

type Mode = "new" | "pooled";
type ConnState = "ready" | "handshake" | "inuse" | "query" | "discarded";
type Conn = { id: number; state: ConnState; req?: number };
type LogRow = { req: number; handshake: number; query: number };
type Step = {
  note: string;
  conns: Conn[];
  reqIndex: number;
  reqCost: number;
  reqParts: string;
  total: number;
  handshakes: number;
  log: LogRow[];
};

function readyPool(): Conn[] {
  const arr: Conn[] = [];
  for (let i = 0; i < POOL_SIZE; i++) arr.push({ id: i + 1, state: "ready" });
  return arr;
}

function build(mode: Mode): Step[] {
  const steps: Step[] = [];
  const log: LogRow[] = [];
  let total = 0;
  let handshakes = mode === "pooled" ? POOL_SIZE : 0;

  if (mode === "pooled") {
    steps.push({
      note: `The pool opens ${POOL_SIZE} connections up front and keeps them alive. The expensive handshake is paid once here, not on every request.`,
      conns: readyPool(),
      reqIndex: 0,
      reqCost: 0,
      reqParts: `${POOL_SIZE} connections ready — handshake already done`,
      total,
      handshakes,
      log: [],
    });
  }

  for (let r = 1; r <= REQUESTS; r++) {
    if (mode === "new") {
      handshakes += 1;
      steps.push({
        note: `Request ${r}: no connection exists yet, so it opens a brand-new one — TCP, TLS and auth handshake (~${HANDSHAKE_MS}ms) before any query can run.`,
        conns: [{ id: r, state: "handshake", req: r }],
        reqIndex: r,
        reqCost: HANDSHAKE_MS,
        reqParts: `handshake ~${HANDSHAKE_MS}ms (in progress)`,
        total,
        handshakes,
        log: [...log],
      });
      steps.push({
        note: `Request ${r}: handshake finished. Only now can it run the query (~${QUERY_MS}ms).`,
        conns: [{ id: r, state: "query", req: r }],
        reqIndex: r,
        reqCost: HANDSHAKE_MS + QUERY_MS,
        reqParts: `handshake ${HANDSHAKE_MS}ms + query ~${QUERY_MS}ms`,
        total,
        handshakes,
        log: [...log],
      });
      total += HANDSHAKE_MS + QUERY_MS;
      log.push({ req: r, handshake: HANDSHAKE_MS, query: QUERY_MS });
      steps.push({
        note: `Request ${r}: done, then the connection is closed and thrown away. All that handshake work is discarded — the next request pays it again.`,
        conns: [{ id: r, state: "discarded", req: r }],
        reqIndex: r,
        reqCost: HANDSHAKE_MS + QUERY_MS,
        reqParts: `${HANDSHAKE_MS + QUERY_MS}ms total, connection discarded`,
        total,
        handshakes,
        log: [...log],
      });
    } else {
      const slot = (r - 1) % POOL_SIZE;
      const withSlot = (state: ConnState): Conn[] =>
        readyPool().map((c, i) => (i === slot ? { ...c, state, req: r } : c));
      steps.push({
        note: `Request ${r}: borrows a ready connection from the pool. The handshake was already paid, so it can query straight away.`,
        conns: withSlot("inuse"),
        reqIndex: r,
        reqCost: 0,
        reqParts: `borrowed connection #${slot + 1} — no handshake`,
        total,
        handshakes,
        log: [...log],
      });
      steps.push({
        note: `Request ${r}: runs the query on the borrowed connection (~${QUERY_MS}ms). No setup cost this time.`,
        conns: withSlot("query"),
        reqIndex: r,
        reqCost: QUERY_MS,
        reqParts: `query ~${QUERY_MS}ms (handshake reused)`,
        total,
        handshakes,
        log: [...log],
      });
      total += QUERY_MS;
      log.push({ req: r, handshake: 0, query: QUERY_MS });
      steps.push({
        note: `Request ${r}: returns the connection to the pool, still open and ready for the next request. Just ~${QUERY_MS}ms.`,
        conns: readyPool(),
        reqIndex: r,
        reqCost: QUERY_MS,
        reqParts: `${QUERY_MS}ms total, connection returned`,
        total,
        handshakes,
        log: [...log],
      });
    }
  }

  steps.push({
    note:
      mode === "new"
        ? `All ${REQUESTS} requests done: ${handshakes} full handshakes and ${total}ms total — most of it wasted re-opening connections.`
        : `All ${REQUESTS} requests done: still only ${handshakes} handshakes (paid once) and ${total}ms total. Reuse skipped the handshake every time.`,
    conns: mode === "new" ? [] : readyPool(),
    reqIndex: 0,
    reqCost: 0,
    reqParts: mode === "new" ? "connections discarded" : "pool ready for more",
    total,
    handshakes,
    log: [...log],
  });

  return steps;
}

const CONN_LABEL: Record<ConnState, string> = {
  ready: "ready",
  handshake: "handshaking",
  inuse: "in use",
  query: "querying",
  discarded: "discarded",
};

export default function ConnPoolDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("new");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(mode);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const connColor = (s: ConnState): string =>
    s === "ready" ? GOOD : s === "handshake" ? WARN : s === "discarded" ? BAD : color;

  const totalColor = mode === "new" ? BAD : GOOD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Connection pooling: reuse over re-handshaking
      </h3>
      <p className="mt-1 text-sm text-dim">
        Opening a database connection needs a TCP, TLS and auth handshake
        (~{HANDSHAKE_MS}ms) before any query runs. A pool reuses open
        connections so most requests skip that cost.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line p-0.5">
          {(["new", "pooled"] as Mode[]).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-dim)" }}
              >
                {m === "new" ? "New connection each time" : "Pooled"}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          {mode === "pooled" ? "connection pool" : "connection (opened per request)"}
        </p>
        <div className="flex min-h-[3.75rem] flex-wrap items-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {frame.conns.map((c) => {
              const cc = connColor(c.state);
              const active = c.state === "inuse" || c.state === "query";
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex min-w-[6.75rem] flex-col gap-1 rounded-lg border px-3 py-2"
                  style={{ borderColor: cc, background: tint(cc, 10) }}
                >
                  <span className="font-mono text-xs text-text">conn #{c.id}</span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: cc }}
                  >
                    {CONN_LABEL[c.state]}
                    {active && c.req ? ` · req ${c.req}` : ""}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {frame.conns.length === 0 && (
            <span className="font-mono text-xs text-faint">no open connections</span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-line-soft bg-bg-2/50 px-2 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            this request
          </p>
          <p className="mt-1 font-mono text-sm text-text">
            {frame.reqIndex > 0 ? `${frame.reqCost}ms` : "—"}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-dim">{frame.reqParts}</p>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/50 px-2 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            handshakes paid
          </p>
          <p className="mt-1 font-mono text-sm" style={{ color: totalColor }}>
            {frame.handshakes}
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-dim">
            {mode === "new" ? "one per request" : "paid once, up front"}
          </p>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/50 px-2 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            total time
          </p>
          <p className="mt-1 font-mono text-sm" style={{ color: totalColor }}>
            {frame.total}ms
          </p>
          <p className="mt-0.5 text-[10px] leading-tight text-dim">
            {mode === "new" ? "mostly handshake overhead" : "almost all query time"}
          </p>
        </div>
      </div>

      {frame.log.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {frame.log.map((row) => {
            const totalMs = row.handshake + row.query;
            const hPct = (row.handshake / BAR_MAX) * 100;
            const qPct = (row.query / BAR_MAX) * 100;
            return (
              <div key={row.req} className="flex items-center gap-2">
                <span className="w-14 shrink-0 font-mono text-[11px] text-faint">
                  req {row.req}
                </span>
                <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-bg-2">
                  {row.handshake > 0 && (
                    <div style={{ width: `${hPct}%`, background: WARN }} />
                  )}
                  <div style={{ width: `${qPct}%`, background: color }} />
                </div>
                <span className="shrink-0 whitespace-nowrap text-right font-mono text-[10px] text-dim">
                  {row.handshake > 0
                    ? `handshake ${row.handshake} + query ${row.query} = ${totalMs}ms`
                    : `query ${row.query}ms (reused)`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
      <p className="mt-2 text-xs text-faint">
        A pool keeps a few expensive-to-open connections alive and shares them,
        instead of paying the handshake on every request. The pool size caps how
        many queries can run at once.
      </p>
    </div>
  );
}
