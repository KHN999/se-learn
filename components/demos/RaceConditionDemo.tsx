"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BAD = "#f87171";
const GOOD = "#34d399";

type Mode = "naive" | "locked";
type Actor = "T1" | "T2" | "sys";
type Phase = "idle" | "lock" | "wait" | "read" | "add" | "write" | "done";

type Thread = { phase: Phase; local: number | null; op: string | null };

type Step = {
  actor: Actor;
  counter: number;
  t1: Thread;
  t2: Thread;
  lock: Actor | null;
  note: string;
  verdict?: "bad" | "good";
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: "idle",
  lock: "holds lock",
  wait: "waiting",
  read: "read",
  add: "add 1",
  write: "write",
  done: "done",
};

const idle: Thread = { phase: "idle", local: null, op: null };

const intro: Step = {
  actor: "sys",
  counter: 0,
  t1: idle,
  t2: idle,
  lock: null,
  note:
    "The shared counter starts at 0. Each thread runs counter += 1 — which is really three steps: read the value, add 1, write it back.",
};

function build(mode: Mode): Step[] {
  if (mode === "naive") {
    return [
      intro,
      {
        actor: "T1",
        counter: 0,
        t1: { phase: "read", local: 0, op: "read counter → 0" },
        t2: idle,
        lock: null,
        note: "T1 reads the shared counter and copies 0 into its own local register.",
      },
      {
        actor: "T2",
        counter: 0,
        t1: { phase: "read", local: 0, op: "read counter → 0" },
        t2: { phase: "read", local: 0, op: "read counter → 0" },
        lock: null,
        note:
          "T2 reads before T1 has written anything. Both threads now hold 0 — this is the race: both read before either writes.",
      },
      {
        actor: "T1",
        counter: 0,
        t1: { phase: "add", local: 1, op: "0 + 1 = 1" },
        t2: { phase: "read", local: 0, op: "read counter → 0" },
        lock: null,
        note: "T1 adds 1 to its local copy: 0 + 1 = 1.",
      },
      {
        actor: "T1",
        counter: 1,
        t1: { phase: "write", local: 1, op: "write 1 → counter" },
        t2: { phase: "read", local: 0, op: "read counter → 0" },
        lock: null,
        note: "T1 writes 1 back. The shared counter is now 1.",
      },
      {
        actor: "T2",
        counter: 1,
        t1: { phase: "done", local: 1, op: null },
        t2: { phase: "add", local: 1, op: "0 + 1 = 1" },
        lock: null,
        note: "T2 adds 1 to its stale copy of 0: 0 + 1 = 1. It never saw T1's write.",
      },
      {
        actor: "T2",
        counter: 1,
        t1: { phase: "done", local: 1, op: null },
        t2: { phase: "write", local: 1, op: "write 1 → counter" },
        lock: null,
        note:
          "T2 writes 1, clobbering T1's update. Two increments ran, but the counter is 1 — a lost update.",
        verdict: "bad",
      },
    ];
  }

  return [
    intro,
    {
      actor: "T1",
      counter: 0,
      t1: { phase: "lock", local: null, op: "acquire lock" },
      t2: idle,
      lock: "T1",
      note: "T1 acquires the lock. The critical section is now T1's alone.",
    },
    {
      actor: "T2",
      counter: 0,
      t1: { phase: "lock", local: null, op: "holds lock" },
      t2: { phase: "wait", local: null, op: "blocked on lock" },
      lock: "T1",
      note:
        "T2 tries to acquire the same lock, but T1 holds it. T2 blocks here — it cannot read a stale value.",
    },
    {
      actor: "T1",
      counter: 0,
      t1: { phase: "read", local: 0, op: "read counter → 0" },
      t2: { phase: "wait", local: null, op: "blocked on lock" },
      lock: "T1",
      note: "Inside the lock, T1 reads the counter: 0.",
    },
    {
      actor: "T1",
      counter: 0,
      t1: { phase: "add", local: 1, op: "0 + 1 = 1" },
      t2: { phase: "wait", local: null, op: "blocked on lock" },
      lock: "T1",
      note: "T1 adds 1 to its local copy: 0 + 1 = 1.",
    },
    {
      actor: "T1",
      counter: 1,
      t1: { phase: "write", local: 1, op: "write 1, release lock" },
      t2: { phase: "wait", local: null, op: "blocked on lock" },
      lock: null,
      note: "T1 writes 1 and releases the lock. The counter is now 1.",
    },
    {
      actor: "T2",
      counter: 1,
      t1: { phase: "done", local: 1, op: null },
      t2: { phase: "lock", local: null, op: "acquire lock" },
      lock: "T2",
      note: "T1 released the lock. T2 wakes up and acquires it.",
    },
    {
      actor: "T2",
      counter: 1,
      t1: { phase: "done", local: 1, op: null },
      t2: { phase: "read", local: 1, op: "read counter → 1" },
      lock: "T2",
      note: "T2 reads the counter — now 1, the value T1 wrote. No stale read this time.",
    },
    {
      actor: "T2",
      counter: 1,
      t1: { phase: "done", local: 1, op: null },
      t2: { phase: "add", local: 2, op: "1 + 1 = 2" },
      lock: "T2",
      note: "T2 adds 1 to its fresh copy: 1 + 1 = 2.",
    },
    {
      actor: "T2",
      counter: 2,
      t1: { phase: "done", local: 1, op: null },
      t2: { phase: "write", local: 2, op: "write 2, release lock" },
      lock: null,
      note:
        "T2 writes 2 and releases the lock. Both increments counted — the lock serialized read-add-write.",
      verdict: "good",
    },
  ];
}

function ThreadCard({
  id,
  sub,
  color,
  active,
  thread,
}: {
  id: string;
  sub: string;
  color: string;
  active: boolean;
  thread: Thread;
}) {
  const waiting = thread.phase === "wait";
  const badgeColor = waiting ? BAD : active ? color : "var(--color-faint)";
  return (
    <div
      className="flex-1 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: active ? color : "var(--color-line)",
        background: active ? tint(color, 8) : "transparent",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-text">{id}</span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: badgeColor }}
        >
          {PHASE_LABEL[thread.phase]}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-faint">{sub}</p>
      <div className="mt-2 flex items-baseline justify-between rounded-lg border border-line-soft bg-bg-2/50 px-2.5 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
          local
        </span>
        <span
          className="font-mono text-lg"
          style={{
            color:
              thread.local === null ? "var(--color-faint)" : "var(--color-text)",
          }}
        >
          {thread.local === null ? "—" : thread.local}
        </span>
      </div>
      <p className="mt-2 min-h-[1.25rem] font-mono text-[11px] leading-relaxed text-dim">
        {thread.op ?? "—"}
      </p>
    </div>
  );
}

export default function RaceConditionDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("naive");
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
  const counterColor =
    verdict === "bad" ? BAD : verdict === "good" ? GOOD : "var(--color-text)";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">A race condition on a shared counter</h3>
      <p className="mt-1 text-sm text-dim">
        Two threads each run counter += 1 on one shared counter. That += is really
        read, add 1, write. Step through with no lock, then with a lock, and watch
        the final value change.
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
              {m === "naive" ? "Unsynchronized (interleaved)" : "With a lock"}
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
        <ThreadCard
          id="T1"
          sub="runs counter += 1"
          color={color}
          active={frame.actor === "T1"}
          thread={frame.t1}
        />
        <ThreadCard
          id="T2"
          sub="runs counter += 1"
          color={color}
          active={frame.actor === "T2"}
          thread={frame.t2}
        />
      </div>

      {mode === "locked" && (
        <div className="mt-2 rounded-xl border border-line-soft bg-bg-2/50 px-3 py-2 text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            lock
          </span>{" "}
          <span
            className="font-mono text-xs"
            style={{ color: frame.lock ? color : "var(--color-dim)" }}
          >
            {frame.lock ? `held by ${frame.lock}` : "free"}
          </span>
        </div>
      )}

      <div
        className="mt-2 rounded-xl border p-3 text-center"
        style={{
          borderColor:
            verdict === "bad"
              ? BAD
              : verdict === "good"
                ? GOOD
                : "var(--color-line-soft)",
          background:
            verdict === "bad"
              ? tint(BAD, 10)
              : verdict === "good"
                ? tint(GOOD, 10)
                : "color-mix(in srgb, var(--color-bg-2) 50%, transparent)",
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          shared counter
        </p>
        <p className="mt-1 font-mono text-3xl" style={{ color: counterColor }}>
          {frame.counter}
        </p>
        <p className="mt-1 font-mono text-[10px] text-faint">
          two increments ran · expected 2
        </p>
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
            ? "✗ Lost update — expected 2, got 1. One increment was silently overwritten."
            : "✓ Correct: 2. The lock made read-add-write run as one indivisible unit."}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-faint">
        A race condition is unsynchronized access to shared mutable state, where the
        result depends on timing. The fix is to serialize the critical section — a
        lock lets only one thread read-add-write at a time.
      </p>
    </div>
  );
}
