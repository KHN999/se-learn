"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeftRight, Check, Scissors, Server, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const OLD_VALUE = "x = 1";
const NEW_VALUE = "x = 2";

type Mode = "CP" | "AP";

const EXAMPLES: Record<Mode, { title: string; blurb: string; systems: string[] }> = {
  CP: {
    title: "CP-leaning",
    blurb: "Refuse rather than serve data it cannot confirm.",
    systems: ["Bank ledger", "ZooKeeper", "etcd"],
  },
  AP: {
    title: "AP-leaning",
    blurb: "Always answer, reconcile the difference later.",
    systems: ["Shopping cart", "DynamoDB", "Cassandra"],
  },
};

function Node({
  name,
  action,
  value,
  note,
  stale = false,
  color,
}: {
  name: string;
  action: string;
  value: string;
  note: string;
  stale?: boolean;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-bg-2 p-3">
      <div className="flex items-center gap-1.5">
        <Server className="h-3.5 w-3.5" style={{ color }} />
        <span className="font-mono text-sm text-text">{name}</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-faint">
          {action}
        </span>
      </div>
      <div
        className={`mt-2 font-mono text-sm ${stale ? "" : "text-text"}`}
        style={stale ? { color: WARN } : undefined}
      >
        {value}
      </div>
      <p
        className={`mt-1 text-[11px] ${stale ? "" : "text-faint"}`}
        style={stale ? { color: WARN } : undefined}
      >
        {note}
      </p>
    </div>
  );
}

export default function CapDemo({ color }: { color: string }) {
  const [partitioned, setPartitioned] = useState(false);
  const [mode, setMode] = useState<Mode>("CP");

  const replicated = !partitioned;
  const n2Value = replicated ? NEW_VALUE : OLD_VALUE;

  // What the reading client actually gets back from N2 — derived purely from
  // whether the network is cut and which side of CAP we chose.
  const outcome = !partitioned
    ? {
        tone: GOOD,
        icon: Check,
        value: NEW_VALUE,
        verdict: "consistent + available",
        detail: "N2 is in sync with N1, so the read is fresh.",
      }
    : mode === "CP"
      ? {
          tone: WARN,
          icon: X,
          value: "read refused (503)",
          verdict: "unavailable to stay consistent",
          detail: "N2 will not serve a value it cannot confirm is current.",
        }
      : {
          tone: WARN,
          icon: AlertTriangle,
          value: `${OLD_VALUE} (stale)`,
          verdict: "stale to stay available",
          detail: "N2 answers with its last known value anyway.",
        };

  const status = !partitioned
    ? "No partition: N1 replicates to N2, so a read from either node returns the latest write. You get both consistency and availability — the tradeoff only appears once the network is cut."
    : mode === "CP"
      ? "Network cut: N2 cannot see the write on N1, so it refuses the read instead of returning stale data. You kept consistency and gave up availability. Partition tolerance is not optional in a distributed system, so under a partition you must trade C for A or A for C."
      : "Network cut: N2 keeps answering with its last known value even though the write on N1 has not reached it. You kept availability and gave up consistency. Partition tolerance is not optional in a distributed system, so under a partition you must trade C for A or A for C.";

  const OutcomeIcon = outcome.icon;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">CAP: during a partition, pick C or A</h3>
      <p className="mt-1 text-sm text-dim">
        Two data centers normally replicate. Cut the network, then watch a read from N2 while a
        fresh write sits on N1 — the mode decides what N2 does.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPartitioned((p) => !p)}
          aria-pressed={partitioned}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
          style={
            partitioned
              ? { background: tint(BAD, 14), color: BAD, borderColor: tint(BAD, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          <Scissors className="h-3.5 w-3.5" />
          {partitioned ? "Network cut" : "Cut the network"}
        </button>

        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-line">
          {(["CP", "AP"] as Mode[]).map((m) => {
            const on = m === mode;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className={`px-3 py-1.5 text-sm transition-colors ${on ? "" : "text-faint"}`}
                style={on ? { background: tint(color, 16), color } : undefined}
              >
                {m === "CP" ? "CP (consistency)" : "AP (availability)"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Node
          name="N1"
          action="client writes"
          value={NEW_VALUE}
          note="latest write landed here"
          color={color}
        />

        <div className="flex items-center justify-center">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
            style={
              partitioned
                ? { borderColor: tint(BAD, 45), color: BAD, background: tint(BAD, 10) }
                : { borderColor: tint(GOOD, 45), color: GOOD, background: tint(GOOD, 10) }
            }
          >
            {partitioned ? (
              <Scissors className="h-3.5 w-3.5" />
            ) : (
              <ArrowLeftRight className="h-3.5 w-3.5" />
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {partitioned ? "link down" : "replicating"}
            </span>
          </div>
        </div>

        <Node
          name="N2"
          action="client reads"
          value={n2Value}
          note={replicated ? "in sync with N1" : "stuck at the old value"}
          stale={!replicated}
          color={color}
        />
      </div>

      <div
        className="mt-4 rounded-xl border p-4"
        style={{ borderColor: tint(outcome.tone, 45), background: tint(outcome.tone, 8) }}
      >
        <div className="flex items-center gap-2">
          <OutcomeIcon className="h-4 w-4" style={{ color: outcome.tone }} />
          <span className="text-sm text-text">
            Client reads N2 →{" "}
            <span className="font-mono" style={{ color: outcome.tone }}>
              {outcome.value}
            </span>
          </span>
        </div>
        <p className="mt-1 text-sm font-medium" style={{ color: outcome.tone }}>
          {outcome.verdict}
        </p>
        <p className="mt-1 text-xs text-faint">{outcome.detail}</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["CP", "AP"] as Mode[]).map((m) => {
          const ex = EXAMPLES[m];
          const on = m === mode;
          return (
            <div
              key={m}
              className="rounded-xl border p-3"
              style={
                on
                  ? { borderColor: tint(color, 45), background: tint(color, 8) }
                  : { borderColor: "var(--color-line)" }
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{ex.title}</span>
                {on && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color }}
                  >
                    selected
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-dim">{ex.blurb}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {ex.systems.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-line-soft bg-bg-2 px-1.5 py-0.5 font-mono text-[11px] text-faint"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
