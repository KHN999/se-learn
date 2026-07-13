"use client";

import { useState } from "react";
import { RotateCcw, Zap } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Item = { id: string; label: string; price: number };

// A tiny UI tree: a cart header (root node) plus four item nodes.
const before: Item[] = [
  { id: "coffee", label: "Coffee", price: 4 },
  { id: "bagel", label: "Bagel", price: 3 },
  { id: "juice", label: "Juice", price: 5 },
  { id: "muffin", label: "Muffin", price: 2 },
];

// One scripted state change: Bagel's price goes 3 → 6. Nothing else moves.
const after: Item[] = before.map((it) =>
  it.id === "bagel" ? { ...it, price: 6 } : it,
);

const changedIds = new Set(
  after
    .filter((it, i) => it.price !== before[i].price || it.label !== before[i].label)
    .map((it) => it.id),
);

// Node budget the strategies act on: 1 root + one per item.
const totalNodes = before.length + 1;
const changedNodes = changedIds.size;

type Mode = "naive" | "diff";

export default function VdomDiffDemo({ color }: { color: string }) {
  const [applied, setApplied] = useState(false);
  const [mode, setMode] = useState<Mode>("diff");

  const next = applied ? after : before;
  const ops = !applied ? 0 : mode === "naive" ? totalNodes : changedNodes;
  const saved = totalNodes - changedNodes;

  // Fate of a node in the NEW render, given the strategy.
  const fateOf = (isChanged: boolean): "rebuilt" | "patched" | "reused" => {
    if (!applied) return "reused";
    if (mode === "naive") return "rebuilt";
    return isChanged ? "patched" : "reused";
  };

  const touchedStyle = {
    borderColor: tint(color, 45),
    background: tint(color, 14),
    color,
  };

  const status = !applied
    ? "Nothing has changed yet — the on-screen tree and the next tree are identical. Apply the state change to compare the two strategies."
    : mode === "naive"
      ? `Naive rebuild: every one of the ${totalNodes} nodes is thrown away and recreated — ${totalNodes} DOM operations for a change that really touched only ${changedNodes}.`
      : `Diff: the framework compared the two trees, found only Bagel differs, and made ${changedNodes} DOM operation — ${saved} fewer than a full rebuild.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        One state change, two ways to update the page
      </h3>
      <p className="mt-1 text-sm text-dim">
        Bagel&apos;s price changes from $3 to $6. Watch how many real-DOM
        operations each strategy needs to show it.
      </p>

      {/* Strategy toggle + actions */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {(["naive", "diff"] as const).map((m) => {
          const on = m === mode;
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
              {m === "naive" ? "Naive rebuild" : "Smart diff"}
            </button>
          );
        })}
        <button
          onClick={() => setApplied(true)}
          disabled={applied}
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          <Zap className="h-3.5 w-3.5" /> apply change
        </button>
        <button
          onClick={() => setApplied(false)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      {/* Old tree vs new tree */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Previous render */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            Previous render (on screen)
          </p>
          <div className="space-y-1.5">
            <div className="rounded-md border border-line px-2.5 py-1.5 text-xs text-dim">
              &lt;Cart&gt;
            </div>
            {before.map((it) => (
              <div
                key={it.id}
                className="ml-3 flex items-center justify-between rounded-md border border-line px-2.5 py-1.5 text-xs text-dim"
              >
                <span className="font-mono">{it.label}</span>
                <span className="font-mono text-faint">${it.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next render */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            Next render (from new state)
          </p>
          <div className="space-y-1.5">
            {/* root node */}
            {(() => {
              const fate = fateOf(false);
              const touched = fate !== "reused";
              return (
                <div
                  className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs"
                  style={touched ? touchedStyle : { borderColor: "var(--color-line)", color: "var(--color-dim)" }}
                >
                  <span className="font-mono">&lt;Cart&gt;</span>
                  <Badge fate={fate} color={color} />
                </div>
              );
            })()}
            {next.map((it, i) => {
              const isChanged = changedIds.has(it.id);
              const fate = fateOf(isChanged);
              const touched = fate !== "reused";
              return (
                <div
                  key={it.id}
                  className="ml-3 flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs"
                  style={touched ? touchedStyle : { borderColor: "var(--color-line)", color: "var(--color-dim)" }}
                >
                  <span className="font-mono">{it.label}</span>
                  <span className="flex items-center gap-2">
                    {applied && isChanged ? (
                      <span className="font-mono text-faint">
                        <span className="line-through">${before[i].price}</span> → $
                        {it.price}
                      </span>
                    ) : (
                      <span className="font-mono text-faint">${it.price}</span>
                    )}
                    <Badge fate={fate} color={color} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operation counter */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-line bg-bg-2 p-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
          real-DOM operations
        </span>
        <span className="font-mono text-2xl font-semibold" style={{ color }}>
          {ops}
        </span>
        <span className="text-xs text-dim">
          naive rebuild: {totalNodes} · smart diff: {changedNodes}
          {applied ? ` · diff saves ${saved} operations` : ""}
        </span>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}

function Badge({
  fate,
  color,
}: {
  fate: "rebuilt" | "patched" | "reused";
  color: string;
}) {
  if (fate === "reused") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
        reused
      </span>
    );
  }
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-widest"
      style={{ color }}
    >
      {fate}
    </span>
  );
}
