"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type NodeId = "computer" | "resolver" | "root" | "tld" | "authoritative";

type Node = { id: NodeId; label: string; meta: string };

const NODES: Node[] = [
  { id: "computer", label: "Your computer", meta: "the app / browser" },
  { id: "resolver", label: "Resolver", meta: "1.1.1.1" },
  { id: "root", label: "Root server", meta: "the . at the top" },
  { id: "tld", label: ".com TLD server", meta: "knows .com names" },
  { id: "authoritative", label: "example.com authoritative", meta: "owns the answer" },
];

const IP = "93.184.216.34";

type Step = {
  active: NodeId[];
  skipped?: NodeId[];
  message: string;
  resolved?: boolean;
  note: string;
};

const COLD: Step[] = [
  {
    active: ["computer", "resolver"],
    message: "Your computer → Resolver: What's the IP for shop.example.com?",
    note: "Nothing is cached, so your resolver has to go find the answer by walking the DNS hierarchy from the top.",
  },
  {
    active: ["root"],
    message: "Resolver → Root: Where's shop.example.com? → Root: Ask the .com servers.",
    note: "The root server doesn't know the IP — it only knows who runs each top-level domain, so it points to the .com servers. Round trip #1.",
  },
  {
    active: ["tld"],
    message: "Resolver → .com TLD: Where's shop.example.com? → TLD: Ask example.com's nameserver.",
    note: "The .com TLD server delegates too — it hands back the nameserver responsible for example.com. Round trip #2.",
  },
  {
    active: ["authoritative"],
    message: `Resolver → example.com authoritative: → shop.example.com = ${IP}`,
    note: "The authoritative nameserver actually owns the record and returns the real answer. Round trip #3.",
  },
  {
    active: ["resolver", "computer"],
    message: `Resolver caches shop.example.com = ${IP} (TTL 300s) and returns it to your computer.`,
    resolved: true,
    note: "Several round trips for one name. The resolver caches the answer for its TTL (300s here) so the next lookup skips the whole walk.",
  },
];

const CACHED: Step[] = [
  {
    active: ["computer", "resolver"],
    skipped: ["root", "tld", "authoritative"],
    message: "Your computer → Resolver: What's the IP for shop.example.com?",
    note: "Same question — but this time the resolver has answered it recently.",
  },
  {
    active: ["resolver", "computer"],
    skipped: ["root", "tld", "authoritative"],
    message: `Resolver has it cached (TTL not expired) → instantly returns ${IP}.`,
    resolved: true,
    note: "No root, TLD, or authoritative hops — the cached answer comes straight back. That's why a warm lookup feels instant. And because answers are trusted for their TTL, a DNS change can take hours to propagate everywhere.",
  },
];

export default function DnsResolveDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"cold" | "cached">("cold");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = mode === "cold" ? COLD : CACHED;
  const current = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const activeSet = new Set(current.active);
  const skippedSet = new Set(current.skipped ?? []);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Resolving a name to an IP (recursive DNS lookup)
      </h3>
      <p className="mt-1 text-sm text-dim">
        Computers talk over IP addresses, not names. Watch a resolver turn{" "}
        <span className="font-mono text-text">shop.example.com</span> into an IP —
        cold from scratch, or warm from cache.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {([
          { key: "cold", label: "Cold (not cached)" },
          { key: "cached", label: "Cached" },
        ] as const).map((m) => {
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={on ? { background: tint(color, 16), color, borderColor: tint(color, 45) } : { color: "var(--color-dim)", borderColor: "var(--color-line)" }}
            >
              {m.label}
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

      <div className="mt-4 flex flex-col gap-2">
        {NODES.map((node) => {
          const isActive = activeSet.has(node.id);
          const isSkipped = skippedSet.has(node.id);
          return (
            <div
              key={node.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors"
              style={{
                borderColor: isActive ? color : "var(--color-line)",
                background: isActive ? tint(color, 10) : "transparent",
                opacity: isSkipped ? 0.4 : 1,
              }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="text-sm text-text"
                  style={isActive ? { color } : undefined}
                >
                  {node.label}
                </span>
                {isSkipped && (
                  <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                    skipped
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-faint">{node.meta}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          this step
        </p>
        <p className="text-center font-mono text-sm text-dim">{current.message}</p>
        {current.resolved && (
          <p className="mt-2 text-center font-mono text-lg font-semibold" style={{ color }}>
            shop.example.com → {IP}
          </p>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {current.note}
      </p>
    </div>
  );
}
