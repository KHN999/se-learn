"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Network, Pause, Play, RotateCcw, Server, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

const A1 = "10.0.0.7:8080";
const A2 = "10.0.0.9:8080";

type Health = "healthy" | "crashed";
type Actor = "inst-1" | "inst-2" | "registry" | "client";
type Instance = { id: "1" | "2"; addr: string; health: Health };
type Step = {
  instances: Instance[];
  registry: string[];
  active: Actor[];
  clientText: string;
  note: string;
};

const STEPS: Step[] = [
  {
    instances: [{ id: "1", addr: A1, health: "healthy" }],
    registry: [A1],
    active: ["inst-1", "registry"],
    clientText: "waiting — doesn't know any address",
    note: `Orders instance #1 starts at ${A1} and REGISTERS itself with the registry under the name "orders".`,
  },
  {
    instances: [
      { id: "1", addr: A1, health: "healthy" },
      { id: "2", addr: A2, health: "healthy" },
    ],
    registry: [A1, A2],
    active: ["inst-2", "registry"],
    clientText: "waiting — doesn't know any address",
    note: `A second instance starts at ${A2} and registers too. The registry now lists two healthy addresses for "orders".`,
  },
  {
    instances: [
      { id: "1", addr: A1, health: "healthy" },
      { id: "2", addr: A2, health: "healthy" },
    ],
    registry: [A1, A2],
    active: ["client", "registry"],
    clientText: 'asks the registry: where is "orders"?',
    note: 'The client needs Orders. Instead of hardcoding an address, it asks the registry: where is "orders"?',
  },
  {
    instances: [
      { id: "1", addr: A1, health: "healthy" },
      { id: "2", addr: A2, health: "healthy" },
    ],
    registry: [A1, A2],
    active: ["client", "registry", "inst-1"],
    clientText: `calls ${A1}`,
    note: `The registry returns a current healthy address (${A1}). The client calls that instance directly.`,
  },
  {
    instances: [
      { id: "1", addr: A1, health: "crashed" },
      { id: "2", addr: A2, health: "healthy" },
    ],
    registry: [A2],
    active: ["inst-1", "registry"],
    clientText: "idle",
    note: `Instance #1 crashes. Its health check fails, so the registry DEREGISTERS it — ${A1} is unhealthy and removed.`,
  },
  {
    instances: [
      { id: "1", addr: A1, health: "crashed" },
      { id: "2", addr: A2, health: "healthy" },
    ],
    registry: [A2],
    active: ["client", "registry", "inst-2"],
    clientText: `calls ${A2}`,
    note: `The client asks again and is handed the remaining healthy instance (${A2}). Nothing breaks — that resilience is what makes autoscaling and rolling deploys possible.`,
  },
];

export default function ServiceDiscoveryDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const isActive = (a: Actor) => frame.active.includes(a);
  const cardStyle = (on: boolean) =>
    on
      ? { borderColor: color, background: tint(color, 8) }
      : { borderColor: "var(--color-line)", background: "transparent" };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Finding a service whose address keeps changing
      </h3>
      <p className="mt-1 text-sm text-dim">
        In the cloud, instances start, stop, and move, so their IP addresses
        change. A service registry tracks healthy addresses so callers never
        hardcode one.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          step {step + 1} / {STEPS.length}
        </span>
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

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Orders service */}
        <motion.div layout className="rounded-xl border p-3" style={cardStyle(isActive("inst-1") || isActive("inst-2"))}>
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-dim" />
            <span className="text-xs font-medium text-text">Orders service</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {frame.instances.map((inst) => {
                const on = isActive(inst.id === "1" ? "inst-1" : "inst-2");
                const crashed = inst.health === "crashed";
                return (
                  <motion.div
                    key={inst.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: crashed ? 0.6 : 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border px-2.5 py-2"
                    style={{
                      borderColor: on ? color : "var(--color-line-soft)",
                      background: on ? tint(color, 8) : "var(--color-bg-2)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-xs ${crashed ? "text-faint line-through" : "text-text"}`}>
                        {inst.addr}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: crashed ? BAD : GOOD }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: crashed ? BAD : GOOD }} />
                        {crashed ? "unhealthy — removed" : "healthy"}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] text-faint">instance #{inst.id}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Service Registry */}
        <motion.div layout className="rounded-xl border p-3" style={cardStyle(isActive("registry"))}>
          <div className="flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5 text-dim" />
            <span className="text-xs font-medium text-text">Service registry</span>
            {isActive("registry") && (
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                active
              </span>
            )}
          </div>
          <p className="mt-2 mb-1 font-mono text-[10px] uppercase tracking-widest text-faint">
            name → healthy addresses
          </p>
          <table className="w-full border-collapse text-left">
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
                {frame.registry.map((addr) => (
                  <motion.tr
                    key={addr}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-line-soft"
                  >
                    <td className="py-1.5 pr-2 font-mono text-[11px] text-dim">orders</td>
                    <td className="py-1.5 font-mono text-[11px] text-text">{addr}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {frame.registry.length === 0 && (
            <p className="mt-1 font-mono text-[11px] text-faint">no healthy addresses</p>
          )}
        </motion.div>

        {/* Client */}
        <motion.div layout className="rounded-xl border p-3" style={cardStyle(isActive("client"))}>
          <div className="flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-dim" />
            <span className="text-xs font-medium text-text">Client (web app)</span>
            {isActive("client") && (
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
                active
              </span>
            )}
          </div>
          <div
            className="mt-2 rounded-lg border px-2.5 py-2"
            style={{
              borderColor: isActive("client") ? color : "var(--color-line-soft)",
              background: "var(--color-bg-2)",
            }}
          >
            <p className="font-mono text-[11px] leading-relaxed text-dim">{frame.clientText}</p>
          </div>
        </motion.div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
