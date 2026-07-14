"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, Database, Server } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type Rating = "good" | "warn" | "bad";
const RATING_COLOR: Record<Rating, string> = { good: GOOD, warn: WARN, bad: BAD };

type Model = {
  key: string;
  label: string;
  full: string;
  correctness: Rating;
  correctnessNote: string;
  cost: Rating;
  costNote: string;
  coordination: number; // 1..3 — cost meter (higher = more coordination/latency)
  availability: number; // 1..3 — availability meter (higher = more available)
  guarantee: string;
  tradeoff: string;
};

// Strongest -> weakest.
const MODELS: Model[] = [
  {
    key: "strong",
    label: "Strong",
    full: "linearizable",
    correctness: "good",
    correctnessNote:
      "Every read after the write returns the newest value, as if there were a single copy.",
    cost: "warn",
    costNote:
      "Coordination on every read and write — the highest latency and the lowest availability.",
    coordination: 3,
    availability: 1,
    guarantee: "Reads and writes behave as one copy in real-time order.",
    tradeoff: "You pay coordination on every operation to guarantee freshness.",
  },
  {
    key: "causal",
    label: "Causal",
    full: "causal consistency",
    correctness: "warn",
    correctnessNote:
      "Causally related operations are seen in the same order everywhere; unrelated operations may be seen in different orders.",
    cost: "warn",
    costNote:
      "A middle ground — less coordination than strong, more than eventual.",
    coordination: 2,
    availability: 2,
    guarantee: "If you saw a reply, you also see the message it replied to.",
    tradeoff: "Order is kept where it matters, without coordinating everything.",
  },
  {
    key: "eventual",
    label: "Eventual",
    full: "eventual consistency",
    correctness: "warn",
    correctnessNote:
      "A read may return a stale or out-of-order value for a while; all replicas converge once writes stop.",
    cost: "good",
    costNote:
      "No coordination on the read path — the highest availability and the lowest latency.",
    coordination: 1,
    availability: 3,
    guarantee: "All replicas converge to the same value, eventually.",
    tradeoff: "You trade freshness for speed and availability.",
  },
];

type Observed = { value: string; tone: Rating; note: string };

function observe(key: string, stopped: boolean): Observed {
  if (key === "strong") {
    return {
      value: "X = 2",
      tone: "good",
      note: "The read is coordinated with the leader, so it returns X = 2 — the newest value — every time.",
    };
  }
  if (key === "causal") {
    return stopped
      ? {
          value: "X = 2",
          tone: "good",
          note: "With no new writes the replica has caught up and returns X = 2, and causal order held throughout.",
        }
      : {
          value: "X = 1 or 2",
          tone: "warn",
          note: "The read may still return the old X = 1, but you will never see an effect of X = 2 without also seeing X = 2 — causal order holds.",
        };
  }
  return stopped
    ? {
        value: "X = 2",
        tone: "good",
        note: "Writes stopped, so every replica has converged to X = 2 — eventual consistency delivers, eventually.",
      }
    : {
        value: "X = 1",
        tone: "warn",
        note: "The read can return the stale X = 1 for a while — this replica has not received the update yet.",
      };
}

function Meter({
  label,
  level,
  tone,
  word,
}: {
  label: string;
  level: number;
  tone: string;
  word: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-faint">{label}</span>
        <span className="text-xs font-medium" style={{ color: tone }}>
          {word}
        </span>
      </div>
      <div className="mt-1.5 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: i < level ? tone : "var(--color-line)" }}
          />
        ))}
      </div>
    </div>
  );
}

const LEVEL_WORD = ["", "Low", "Medium", "High"];

export default function ConsistencyDemo({ color }: { color: string }) {
  const [key, setKey] = useState("strong");
  const [stopped, setStopped] = useState(false);

  const model = MODELS.find((m) => m.key === key) ?? MODELS[0];
  const obs = observe(model.key, stopped);
  const obsColor = RATING_COLOR[obs.tone];

  const coordTone =
    model.coordination === 3 ? BAD : model.coordination === 2 ? WARN : GOOD;
  const availTone =
    model.availability === 3 ? GOOD : model.availability === 2 ? WARN : BAD;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The consistency spectrum</h3>
      <p className="mt-1 text-sm text-dim">
        One value, three promises. A client writes X = 2 on the leader; pick how
        strong a guarantee a replica read must honor — and see what it costs.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODELS.map((m) => {
          const on = m.key === key;
          return (
            <button
              key={m.key}
              onClick={() => setKey(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-widest text-faint">
        <span>Stronger, coordinated</span>
        <span>Faster, more available</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-1.5 text-faint">
            <Database className="h-3.5 w-3.5" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              On the leader
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md border border-line px-2 py-1 font-mono text-sm text-dim">
              X = 1
            </span>
            <ArrowRight className="h-4 w-4 text-faint" />
            <span
              className="rounded-md border px-2 py-1 font-mono text-sm font-medium"
              style={{ color, borderColor: tint(color, 45), background: tint(color, 12) }}
            >
              X = 2
            </span>
          </div>
          <p className="mt-2 text-xs text-dim">The client writes the new value.</p>
        </div>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <div className="flex items-center gap-1.5 text-faint">
            <Server className="h-3.5 w-3.5" />
            <span className="font-mono text-[10px] uppercase tracking-widest">
              On a replica
            </span>
          </div>
          <div className="mt-2">
            <span
              className="inline-block rounded-md border px-2.5 py-1 font-mono text-base font-semibold"
              style={{ color: obsColor, borderColor: tint(obsColor, 45), background: tint(obsColor, 12) }}
            >
              {obs.value}
            </span>
          </div>
          <p className="mt-2 text-xs text-dim">The reader sees this shortly after.</p>
        </div>
      </div>

      <button
        onClick={() => setStopped((s) => !s)}
        aria-pressed={stopped}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
        style={
          stopped
            ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
            : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
        }
      >
        <span
          className="grid h-3.5 w-3.5 place-items-center rounded-sm border"
          style={{ borderColor: stopped ? color : "var(--color-line)" }}
        >
          {stopped ? <Check className="h-3 w-3" /> : null}
        </span>
        Writes stopped
      </button>

      <p className="mt-2 text-sm leading-relaxed text-dim">{obs.note}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(
          [
            { title: "Correctness", rating: model.correctness, note: model.correctnessNote },
            { title: "Cost", rating: model.cost, note: model.costNote },
          ] as const
        ).map((b) => {
          const bc = RATING_COLOR[b.rating];
          return (
            <div
              key={b.title}
              className="rounded-xl border p-3"
              style={{ borderColor: tint(bc, 30), background: tint(bc, 8) }}
            >
              <div className="flex items-center gap-1.5">
                {b.rating === "good" ? (
                  <Check className="h-3.5 w-3.5" style={{ color: bc }} />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" style={{ color: bc }} />
                )}
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: bc }}
                >
                  {b.title}
                </span>
              </div>
              <p className="mt-1 text-sm text-dim">{b.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 rounded-xl border border-line-soft bg-bg-2/50 p-3 sm:grid-cols-2">
        <Meter
          label="Coordination & latency"
          level={model.coordination}
          tone={coordTone}
          word={LEVEL_WORD[model.coordination]}
        />
        <Meter
          label="Availability"
          level={model.availability}
          tone={availTone}
          word={LEVEL_WORD[model.availability]}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {model.label} ({model.full}): {model.guarantee} {model.tradeoff} Consistency
        is a dial — stronger guarantees cost coordination and latency, so pick the
        weakest model your correctness needs allow.
      </p>
    </div>
  );
}
