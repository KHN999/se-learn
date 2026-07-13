"use client";

import { useState } from "react";
import { ArrowDown, Check, Database, MoveRight, User } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Mode = "drill" | "store";

const CHAIN = [
  { key: "app", name: "App" },
  { key: "layout", name: "Layout" },
  { key: "sidebar", name: "Sidebar" },
  { key: "badge", name: "UserBadge" },
] as const;

type NodeState = {
  touches: boolean;
  role: string;
  kind: "source" | "pass" | "use" | "idle";
};

function nodeState(key: string, mode: Mode): NodeState {
  if (mode === "drill") {
    if (key === "app") return { touches: true, role: "owns user", kind: "source" };
    if (key === "badge") return { touches: true, role: "uses user", kind: "use" };
    return { touches: true, role: "just passing through", kind: "pass" };
  }
  if (key === "badge") return { touches: true, role: "reads from store", kind: "use" };
  if (key === "app") return { touches: false, role: "renders children", kind: "idle" };
  return { touches: false, role: "untouched", kind: "idle" };
}

const MODES: [Mode, string][] = [
  ["drill", "Prop drilling"],
  ["store", "Shared store"],
];

export default function StateMgmtDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("drill");

  const states = CHAIN.map((n) => ({ ...n, ...nodeState(n.key, mode) }));
  const touchCount = states.filter((s) => s.touches).length;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Getting <span className="font-mono">user</span> down to a deep component
      </h3>
      <p className="mt-1 text-sm text-dim">
        Only <span className="font-mono">UserBadge</span> actually needs the
        logged-in user. Watch how many components in the chain have to touch it,
        depending on how you share the state.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map(([m, label]) => {
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
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col">
          {states.map((s, i) => (
            <div key={s.key}>
              <div
                className="rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: s.touches ? color : "var(--color-line)",
                  background: s.touches ? tint(color, 8) : "transparent",
                  opacity: s.touches ? 1 : 0.5,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-text">
                    {`<${s.name} />`}
                  </span>
                  {s.touches ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px]"
                      style={{ background: tint(color, 16), color }}
                    >
                      <User className="h-3 w-3" /> user
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-faint">no user</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  {s.kind === "pass" ? (
                    <MoveRight className="h-3 w-3 text-faint" />
                  ) : null}
                  {s.kind === "use" ? (
                    <Check className="h-3 w-3" style={{ color }} />
                  ) : null}
                  <span
                    className={s.kind === "use" ? "font-medium" : "text-faint"}
                    style={s.kind === "use" ? { color } : undefined}
                  >
                    {s.role}
                  </span>
                </div>
              </div>
              {i < states.length - 1 ? (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-3.5 w-3.5 text-faint" />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          {mode === "store" ? (
            <div
              className="rounded-xl border-2 border-dashed px-4 py-3 text-center"
              style={{ borderColor: tint(color, 45), background: tint(color, 6) }}
            >
              <div
                className="inline-flex items-center gap-1.5 font-mono text-xs font-medium"
                style={{ color }}
              >
                <Database className="h-3.5 w-3.5" /> store
              </div>
              <div className="mt-1 font-mono text-[11px] text-dim">{`{ user }`}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-faint">
                <MoveRight className="h-3 w-3" /> UserBadge reads here
              </div>
            </div>
          ) : (
            <p className="max-w-[11rem] text-[11px] leading-relaxed text-faint">
              <span className="font-mono">user</span> is handed down through every
              level to reach UserBadge — even levels that never read it.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2">
        <span className="text-xs text-dim">Components that must touch</span>
        <span className="font-mono text-xs" style={{ color }}>
          user
        </span>
        <span className="text-xs text-dim">:</span>
        <span className="font-mono text-sm font-semibold" style={{ color }}>
          {touchCount}
        </span>
        <span className="text-xs text-faint">of {CHAIN.length}</span>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {mode === "drill"
          ? `Prop drilling: ${touchCount} of ${CHAIN.length} components handle user — Layout and Sidebar only forward it, never using it themselves.`
          : `Shared store: only UserBadge touches user, reading it straight from the store, so Layout and Sidebar are left completely untouched.`}
      </p>
    </div>
  );
}
