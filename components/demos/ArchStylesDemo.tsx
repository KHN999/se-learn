"use client";

import { useState } from "react";
import {
  CreditCard,
  Database,
  Lock,
  Network,
  Search,
  Server,
  ShoppingCart,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Mode = "monolith" | "modular" | "microservices";
type Tone = "good" | "bad" | "neutral";

const MODULES = [
  { name: "Auth", Icon: Lock },
  { name: "Orders", Icon: ShoppingCart },
  { name: "Payments", Icon: CreditCard },
  { name: "Search", Icon: Search },
];

const MODES: { key: Mode; label: string }[] = [
  { key: "monolith", label: "Monolith" },
  { key: "modular", label: "Modular monolith" },
  { key: "microservices", label: "Microservices" },
];

type Config = {
  deploy: string;
  calls: string;
  scale: string;
  scaleTone: Tone;
  blast: string;
  blastTone: Tone;
  summary: string;
};

const CONFIG: Record<Mode, Config> = {
  monolith: {
    deploy: "1",
    calls: "in-process",
    scale: "No",
    scaleTone: "bad",
    blast: "whole app",
    blastTone: "bad",
    summary:
      "Monolith: one box, one database — the simplest thing to build, deploy, and reason about. The catch is that it scales and fails as one unit, so a spike or crash in one module drags the whole app with it.",
  },
  modular: {
    deploy: "1",
    calls: "in-process",
    scale: "No",
    scaleTone: "bad",
    blast: "whole app",
    blastTone: "bad",
    summary:
      "Modular monolith: still one deployable and one database, so you keep the monolith's simplicity — but enforced boundaries between modules give you clean seams to split into services later without a rewrite.",
  },
  microservices: {
    deploy: "4",
    calls: "network",
    scale: "Yes",
    scaleTone: "good",
    blast: "one service",
    blastTone: "good",
    summary:
      "Microservices: each service deploys, scales, and fails on its own. You buy that independence with network calls between services, more operational overhead, and all the usual distributed-systems problems.",
  },
};

function toneColor(tone: Tone): string {
  if (tone === "good") return GOOD;
  if (tone === "bad") return BAD;
  return "var(--color-text)";
}

export default function ArchStylesDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("monolith");
  const cfg = CONFIG[mode];

  const attrs: { label: string; value: string; tone: Tone }[] = [
    { label: "Deploy units", value: cfg.deploy, tone: "neutral" },
    { label: "Calls", value: cfg.calls, tone: "neutral" },
    { label: "Scale independently", value: cfg.scale, tone: cfg.scaleTone },
    { label: "Failure blast radius", value: cfg.blast, tone: cfg.blastTone },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">One app, three architectures</h3>
      <p className="mt-1 text-sm text-dim">
        The same app has four modules — Auth, Orders, Payments, Search. What
        changes is how they are packaged, deployed, and how they talk to each
        other.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        {mode === "microservices" ? (
          <>
            <div
              className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-dashed py-1.5 text-xs"
              style={{ borderColor: tint(color, 40), color }}
            >
              <Network className="h-3.5 w-3.5" />
              Calls between services go over the network
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MODULES.map((m) => {
                const Icon = m.Icon;
                return (
                  <div
                    key={m.name}
                    className="rounded-xl border-2 p-3"
                    style={{ borderColor: tint(color, 35), background: tint(color, 5) }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text">
                        <Icon className="h-4 w-4" style={{ color }} />
                        {m.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-faint">
                        <Server className="h-3 w-3" />
                        own deploy
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-dim">
                      <Database className="h-3.5 w-3.5" style={{ color }} />
                      own database
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div
            className="rounded-xl border-2 p-3"
            style={{ borderColor: tint(color, 45), background: tint(color, 6) }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text">
                <Server className="h-4 w-4" style={{ color }} />
                One deployable
              </span>
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-faint">
                in-process calls
              </span>
            </div>

            {mode === "monolith" ? (
              <div className="flex flex-wrap gap-2">
                {MODULES.map((m) => {
                  const Icon = m.Icon;
                  return (
                    <div
                      key={m.name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line-soft bg-panel px-2.5 py-1.5 text-xs text-dim"
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                      {m.name}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {MODULES.map((m) => {
                  const Icon = m.Icon;
                  return (
                    <div
                      key={m.name}
                      className="rounded-lg border border-line bg-panel p-2.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" style={{ color }} />
                        <span className="text-xs font-medium text-text">
                          {m.name}
                        </span>
                      </div>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-faint">
                        bounded module
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-dashed border-line-soft py-2 text-xs text-dim">
              <Database className="h-3.5 w-3.5" style={{ color }} />
              One shared database
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {attrs.map((a) => (
          <div
            key={a.label}
            className="rounded-lg border border-line-soft bg-bg-2/50 p-3"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
              {a.label}
            </div>
            <div
              className="mt-1 text-sm font-medium"
              style={{ color: toneColor(a.tone) }}
            >
              {a.value}
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {cfg.summary}
      </p>
    </div>
  );
}
