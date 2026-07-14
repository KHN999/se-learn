"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CreditCard,
  Lock,
  Mail,
  Network,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const CHANGED = "payments";

type Module = { id: string; label: string; Icon: LucideIcon };

const MODULES: Module[] = [
  { id: "orders", label: "Orders", Icon: ShoppingCart },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "email", label: "Email", Icon: Mail },
  { id: "inventory", label: "Inventory", Icon: Package },
  { id: "auth", label: "Auth", Icon: Lock },
];

// Pentagon layout in percentage coordinates (Orders on top). Deterministic.
const POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  MODULES.map((m, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / MODULES.length;
    return [m.id, { x: 50 + 40 * Math.cos(a), y: 50 + 38 * Math.sin(a) }];
  }),
);

type Edge = [string, string];

// Tightly coupled: a dense web — every module reaches into the others' internals.
const TIGHT: Edge[] = [
  ["orders", "payments"],
  ["orders", "email"],
  ["orders", "inventory"],
  ["orders", "auth"],
  ["payments", "email"],
  ["payments", "inventory"],
  ["payments", "auth"],
  ["email", "inventory"],
  ["inventory", "auth"],
];

// Loosely coupled: few connections, each through a small, stable interface.
const LOOSE: Edge[] = [
  ["orders", "payments"],
  ["orders", "inventory"],
  ["orders", "auth"],
  ["orders", "email"],
];

type NodeState = "target" | "changed" | "affected" | "safe" | "idle";

function edgeStyle(
  touches: boolean,
  changed: boolean,
  mode: "tight" | "loose",
  color: string,
): { stroke: string; width: number; dash?: string } {
  if (!changed) {
    return {
      stroke: tint(color, mode === "tight" ? 26 : 42),
      width: 1.5,
      dash: mode === "loose" ? "3 2.5" : undefined,
    };
  }
  if (mode === "tight") {
    return { stroke: touches ? BAD : tint(color, 10), width: touches ? 2.4 : 1 };
  }
  return {
    stroke: touches ? GOOD : tint(color, 14),
    width: touches ? 2.4 : 1,
    dash: "3 2.5",
  };
}

function accentOf(state: NodeState, color: string): string {
  switch (state) {
    case "changed":
      return WARN;
    case "affected":
      return BAD;
    case "safe":
      return GOOD;
    case "target":
      return color;
    default:
      return "var(--color-faint)";
  }
}

export default function CouplingDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"tight" | "loose">("tight");
  const [changed, setChanged] = useState(false);

  const edges = mode === "tight" ? TIGHT : LOOSE;

  // Everything the changed module is wired to directly.
  const dependents = edges
    .filter((e) => e.includes(CHANGED))
    .map((e) => (e[0] === CHANGED ? e[1] : e[0]));
  const dependentSet = new Set(dependents);

  // In tight coupling, dependents reach into internals, so ALL must change.
  // In loose coupling, the interface stays the same, so none are forced to.
  const affected = mode === "tight" ? dependentSet : new Set<string>();
  const blastRadius = affected.size;
  const others = MODULES.length - 1;

  function stateOf(id: string): NodeState {
    if (id === CHANGED) return changed ? "changed" : "target";
    if (!changed) return "idle";
    if (affected.has(id)) return "affected";
    if (dependentSet.has(id)) return "safe"; // loose: talks via a stable interface
    return "idle";
  }

  const badge: Record<string, { text: string; Icon: LucideIcon } | null> = {
    changed: { text: "changed", Icon: Wrench },
    affected: { text: "must change", Icon: AlertTriangle },
    safe: { text: "via interface", Icon: ShieldCheck },
    target: null,
    idle: null,
  };

  const note =
    mode === "tight"
      ? changed
        ? `Changing Payments forces changes in ${blastRadius} of ${others} other modules — Orders, Email, Inventory and Auth all reached into its internals, so one edit ripples across the system.`
        : `Tightly coupled: ${edges.length} direct connections form a dense web, and modules poke at each other's internals. Fast to wire up, painful to change. Hit "Change Payments" to see the blast radius.`
      : changed
        ? `Payments changed behind its interface, so ${blastRadius} other modules are forced to change — Orders still calls the same interface. That's the goal: loose coupling between modules, plus high cohesion inside each one.`
        : `Loosely coupled: just ${edges.length} connections, each through a small, stable interface. Hit "Change Payments" — because the interface holds, the change barely spreads. Pair this with high cohesion within each module.`;

  const graphLabel =
    mode === "tight"
      ? `Dependency graph of 5 modules (Orders, Payments, Email, Inventory, Auth) with ${edges.length} connections forming a dense web; Payments is wired directly into ${dependentSet.size} other modules.`
      : `Dependency graph of 5 modules (Orders, Payments, Email, Inventory, Auth) with only ${edges.length} connections through stable interfaces; Payments connects to ${dependentSet.size} other module.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Coupling: how far does one change ripple?
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same five modules, wired two ways. Flip the mode, then change the
        Payments module and watch how many others are forced to change with it.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label="coupling mode">
          {(["tight", "loose"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {m === "tight" ? "Tightly coupled" : "Loosely coupled"}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setChanged((c) => !c)}
          aria-pressed={changed}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          style={{ background: color }}
        >
          {changed ? <RotateCcw className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
          {changed ? "Undo change" : "Change Payments"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <Network className="h-3 w-3" /> connections
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text">
            {edges.length}
          </p>
          <p className="text-xs text-dim">links between modules</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <Zap className="h-3 w-3" /> blast radius
          </p>
          <p
            className="mt-1 text-2xl font-semibold tabular-nums"
            style={{ color: blastRadius > 0 ? BAD : GOOD }}
          >
            {blastRadius}
          </p>
          <p className="text-xs text-dim">
            of {others} other modules must change
          </p>
        </div>
      </div>

      <div className="relative mt-3 h-[300px] rounded-xl border border-line-soft bg-bg-2/50 sm:h-[330px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={graphLabel}
        >
          {edges.map(([a, b], i) => {
            const p1 = POS[a];
            const p2 = POS[b];
            const touches = a === CHANGED || b === CHANGED;
            const { stroke, width, dash } = edgeStyle(touches, changed, mode, color);
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={stroke}
                strokeWidth={width}
                strokeDasharray={dash}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {MODULES.map((m) => {
          const p = POS[m.id];
          const state = stateOf(m.id);
          const accent = accentOf(state, color);
          const b = badge[state];
          return (
            <div
              key={m.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div
                className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 shadow-sm"
                style={{
                  borderColor: state === "idle" ? "var(--color-line)" : accent,
                  background:
                    state === "idle"
                      ? "var(--color-panel)"
                      : `color-mix(in srgb, ${accent} 16%, var(--color-panel))`,
                }}
              >
                <m.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                <span className="whitespace-nowrap text-xs font-medium text-text">
                  {m.label}
                </span>
              </div>
              {b && (
                <span
                  className="mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: accent, background: tint(accent, 16) }}
                >
                  <b.Icon className="h-2.5 w-2.5" />
                  {b.text}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
