"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const EXPECTED = 2;

type Actor = "T1" | "T2" | "sys";
type Kind = "sys" | "load" | "add" | "store" | "atomic";
type Step = {
  actor: Actor;
  op: string;
  counter: number;
  r1: number | null;
  r2: number | null;
  kind: Kind;
  note: string;
  verdict?: "bad" | "good";
};

function build(mode: "naive" | "atomic"): Step[] {
  const intro: Step = {
    actor: "sys",
    counter: 0,
    op: "",
    r1: null,
    r2: null,
    kind: "sys",
    note: "Two threads each run counter++ on a shared counter that starts at 0. The correct final value is 2.",
  };

  if (mode === "naive") {
    return [
      { ...intro, note: "counter++ is not one step — it compiles to LOAD, ADD, STORE. Watch the two threads interleave those sub-steps." },
      {
        actor: "T1",
        op: "LOAD  reg = counter  (0)",
        counter: 0,
        r1: 0,
        r2: null,
        kind: "load",
        note: "T1 copies counter into its own register: reg = 0.",
      },
      {
        actor: "T2",
        op: "LOAD  reg = counter  (0)",
        counter: 0,
        r1: 0,
        r2: 0,
        kind: "load",
        note: "Before T1 finishes, the scheduler switches to T2, which also reads counter and sees 0. Both registers now hold 0.",
      },
      {
        actor: "T1",
        op: "ADD   reg, 1  ->  1",
        counter: 0,
        r1: 1,
        r2: 0,
        kind: "add",
        note: "T1 adds 1 inside its register: reg = 1. The counter in memory is still 0.",
      },
      {
        actor: "T1",
        op: "STORE counter = reg  (1)",
        counter: 1,
        r1: 1,
        r2: 0,
        kind: "store",
        note: "T1 writes its register back: counter = 1.",
      },
      {
        actor: "T2",
        op: "ADD   reg, 1  ->  1",
        counter: 1,
        r1: 1,
        r2: 1,
        kind: "add",
        note: "T2 adds 1 to its stale register value: reg = 1 — it never saw that T1 already moved counter to 1.",
      },
      {
        actor: "T2",
        op: "STORE counter = reg  (1)",
        counter: 1,
        r1: 1,
        r2: 1,
        kind: "store",
        verdict: "bad",
        note: "T2 overwrites counter with 1, erasing T1's increment. Two increments ran, but the counter reads 1. This is a lost update.",
      },
    ];
  }

  return [
    { ...intro, note: "Now the increment is one indivisible instruction. The hardware runs it start-to-finish and cannot be interrupted part-way through." },
    {
      actor: "T1",
      op: "atomicAdd(counter, 1)  ->  1",
      counter: 1,
      r1: 1,
      r2: null,
      kind: "atomic",
      note: "T1 runs atomicAdd as a single fused step: read, add, and write happen as one indivisible operation. counter = 1.",
    },
    {
      actor: "T2",
      op: "atomicAdd(counter, 1)  ->  2",
      counter: 2,
      r1: 1,
      r2: 2,
      kind: "atomic",
      verdict: "good",
      note: "T2's atomicAdd cannot begin in the middle of T1's — it runs whole, reads the up-to-date 1, and writes 2. Both increments counted. Atomic read-modify-write avoids the race without a full lock — far cheaper than a mutex for a simple counter.",
    },
  ];
}

function ThreadCard({
  label,
  color,
  active,
  reg,
  atomicNow,
  op,
}: {
  label: string;
  color: string;
  active: boolean;
  reg: number | null;
  atomicNow: boolean;
  op: string | null;
}) {
  return (
    <div
      className="min-w-0 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: active ? color : "var(--color-line)",
        background: active ? tint(color, 8) : "transparent",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-text">{label}</span>
        {atomicNow ? (
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
            atomic
          </span>
        ) : reg !== null ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            reg = {reg}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">idle</span>
        )}
      </div>
      <p className="mt-2 min-h-[2.5rem] break-words font-mono text-[11px] leading-relaxed text-dim">
        {active && op ? op : "—"}
      </p>
    </div>
  );
}

export default function AtomicDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"naive" | "atomic">("naive");
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
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const verdict = atEnd ? frame.verdict : undefined;
  const counterWrong = verdict === "bad";
  const log = steps.slice(1, step + 1).filter((s) => s.kind !== "sys");

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Atomic operations are indivisible</h3>
      <p className="mt-1 text-sm text-dim">
        Two threads each run counter++ on one shared value. Step through a
        non-atomic increment and watch an update get lost, then switch to an
        atomic one and see both increments survive.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["naive", "atomic"] as const).map((m) => {
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
              {m === "naive"
                ? "Non-atomic (read-modify-write)"
                : "Atomic (compare-and-swap / fetch-add)"}
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

      <div className="mt-4 grid grid-cols-3 items-stretch gap-2">
        <ThreadCard
          label="T1 · thread A"
          color={color}
          active={frame.actor === "T1"}
          reg={frame.r1}
          atomicNow={frame.actor === "T1" && frame.kind === "atomic"}
          op={frame.op}
        />
        <div
          className="flex flex-col items-center justify-center rounded-xl border p-3 text-center"
          style={{
            borderColor: counterWrong ? BAD : "var(--color-line-soft)",
            background: counterWrong
              ? tint(BAD, 10)
              : "color-mix(in srgb, var(--color-bg-2) 50%, transparent)",
          }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            shared counter
          </p>
          <p
            className="mt-1 font-mono text-3xl"
            style={{ color: counterWrong ? BAD : "var(--color-text)" }}
          >
            {frame.counter}
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">expected {EXPECTED}</p>
        </div>
        <ThreadCard
          label="T2 · thread B"
          color={color}
          active={frame.actor === "T2"}
          reg={frame.r2}
          atomicNow={frame.actor === "T2" && frame.kind === "atomic"}
          op={frame.op}
        />
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          execution order (as it interleaves)
        </p>
        {log.length === 0 ? (
          <p className="font-mono text-[11px] text-faint">Press step or play to run the threads.</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {log.map((s, i) => {
              const last = i === log.length - 1;
              const isT1 = s.actor === "T1";
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md px-2 py-1"
                  style={{ background: last ? tint(color, 8) : "transparent" }}
                >
                  <span
                    className="w-6 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: isT1 ? color : "var(--color-dim)" }}
                  >
                    {s.actor}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-dim">
                    {s.op}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-faint">
                    counter = {s.counter}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {mode === "atomic" && (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-faint">
          CAS loop under the hood: read the value, compute new = old + 1, then
          compare-and-swap; if another thread changed it first, the swap fails and
          the loop retries with the fresh value.
        </p>
      )}

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
            ? "✗ Lost update — two increments ran, but the counter reads 1."
            : "✓ Correct — both increments counted, the counter reads 2."}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-faint">
        Atomic operations make a read-modify-write indivisible, closing the race
        without a full lock — cheaper than a mutex for simple counters and flags.
      </p>
    </div>
  );
}
