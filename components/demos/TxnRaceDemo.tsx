"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Actor = "T1" | "T2" | "sys";
type Step = {
  actor: Actor;
  stmt: string;
  seats: number;
  sold: number;
  t1read: number | null;
  t2read: number | null;
  blocked: boolean;
  note: string;
  verdict?: "bad" | "good";
};

const BAD = "#f87171";
const GOOD = "#34d399";

function build(mode: "naive" | "locked"): Step[] {
  const intro: Step = {
    actor: "sys",
    stmt: "1 seat left — two buyers press “Buy” at the same instant.",
    seats: 1,
    sold: 0,
    t1read: null,
    t2read: null,
    blocked: false,
    note: "The row shows seats_left = 1. Watch what each transaction reads before it writes.",
  };

  if (mode === "naive") {
    return [
      intro,
      {
        actor: "T1",
        stmt: "BEGIN; SELECT seats_left → 1",
        seats: 1,
        sold: 0,
        t1read: 1,
        t2read: null,
        blocked: false,
        note: "T1 reads seats_left and sees 1 — a seat is available.",
      },
      {
        actor: "T2",
        stmt: "BEGIN; SELECT seats_left → 1",
        seats: 1,
        sold: 0,
        t1read: 1,
        t2read: 1,
        blocked: false,
        note: "T2 reads too — and also sees 1. Nothing stopped it: both now believe a seat is free.",
      },
      {
        actor: "T1",
        stmt: "UPDATE seats_left = 0; sell ticket",
        seats: 0,
        sold: 1,
        t1read: 1,
        t2read: 1,
        blocked: false,
        note: "T1 acts on what it read: sets seats_left to 0 and issues a ticket.",
      },
      {
        actor: "T2",
        stmt: "UPDATE seats_left = 0; sell ticket",
        seats: 0,
        sold: 2,
        t1read: 1,
        t2read: 1,
        blocked: false,
        note: "T2 acts on its stale read of 1 — and sells a second ticket for a seat that's already gone.",
        verdict: "bad",
      },
    ];
  }

  return [
    intro,
    {
      actor: "T1",
      stmt: "BEGIN; SELECT seats_left FOR UPDATE → 1",
      seats: 1,
      sold: 0,
      t1read: 1,
      t2read: null,
      blocked: false,
      note: "T1 reads with FOR UPDATE — this takes an exclusive lock on the row.",
    },
    {
      actor: "T2",
      stmt: "BEGIN; SELECT seats_left FOR UPDATE → waits",
      seats: 1,
      sold: 0,
      t1read: 1,
      t2read: null,
      blocked: true,
      note: "T2 asks for the same row, but the lock is held. It blocks here — it cannot read a stale value.",
    },
    {
      actor: "T1",
      stmt: "UPDATE seats_left = 0; sell ticket; COMMIT",
      seats: 0,
      sold: 1,
      t1read: 1,
      t2read: null,
      blocked: true,
      note: "T1 sells its ticket and commits, releasing the lock.",
    },
    {
      actor: "T2",
      stmt: "(unblocked) SELECT seats_left → 0",
      seats: 0,
      sold: 1,
      t1read: 1,
      t2read: 0,
      blocked: false,
      note: "T2 wakes up and re-reads — now it sees 0, the value T1 committed.",
    },
    {
      actor: "T2",
      stmt: "0 seats left → refuse, no ticket",
      seats: 0,
      sold: 1,
      t1read: 1,
      t2read: 0,
      blocked: false,
      note: "Seeing 0, T2 correctly refuses. One seat, one ticket.",
      verdict: "good",
    },
  ];
}

function TxnCard({
  id,
  color,
  active,
  read,
  blocked,
  stmt,
}: {
  id: string;
  color: string;
  active: boolean;
  read: number | null;
  blocked: boolean;
  stmt: string | null;
}) {
  return (
    <div
      className="flex-1 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: active ? color : "var(--color-line)",
        background: active ? tint(color, 8) : "transparent",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-text">{id}</span>
        {blocked ? (
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: BAD }}>
            ⏳ waiting
          </span>
        ) : read !== null ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            read: {read}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">idle</span>
        )}
      </div>
      <p className="mt-2 min-h-[2.5rem] font-mono text-[11px] leading-relaxed text-dim">
        {active && stmt ? stmt : "—"}
      </p>
    </div>
  );
}

export default function TxnRaceDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"naive" | "locked">("naive");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(mode);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const verdict = atEnd ? frame.verdict : undefined;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The last-ticket race</h3>
      <p className="mt-1 text-sm text-dim">
        Two transactions try to buy the one remaining seat. Step through with no
        lock, then with a lock, and watch the outcome change.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["naive", "locked"] as const).map((m) => {
          const on = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m === "naive" ? "No lock" : "SELECT … FOR UPDATE"}
            </button>
          );
        })}
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

      <div className="mt-4 flex items-stretch gap-2">
        <TxnCard
          id="T1 · buyer A"
          color={color}
          active={frame.actor === "T1"}
          read={frame.t1read}
          blocked={false}
          stmt={frame.stmt}
        />
        <TxnCard
          id="T2 · buyer B"
          color={color}
          active={frame.actor === "T2"}
          read={frame.t2read}
          blocked={frame.blocked}
          stmt={frame.stmt}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            shows.seats_left
          </p>
          <p className="mt-1 font-mono text-2xl text-text">{frame.seats}</p>
        </div>
        <div
          className="rounded-xl border p-3 text-center"
          style={{
            borderColor:
              frame.sold > 1 ? BAD : "var(--color-line-soft)",
            background:
              frame.sold > 1 ? tint(BAD, 10) : "color-mix(in srgb, var(--color-bg-2) 50%, transparent)",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            tickets sold
          </p>
          <p
            className="mt-1 font-mono text-2xl"
            style={{ color: frame.sold > 1 ? BAD : "var(--color-text)" }}
          >
            {frame.sold}
          </p>
        </div>
      </div>

      {verdict && (
        <div
          className="mt-3 rounded-xl border px-3 py-2 text-sm font-medium"
          style={{
            borderColor: verdict === "bad" ? BAD : GOOD,
            background: tint(verdict === "bad" ? BAD : GOOD, 10),
            color: verdict === "bad" ? BAD : GOOD,
          }}
        >
          {verdict === "bad"
            ? "✗ Oversold — 2 tickets for 1 seat. The lost update."
            : "✓ Correct — 1 ticket for 1 seat. The lock serialized the two buyers."}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
