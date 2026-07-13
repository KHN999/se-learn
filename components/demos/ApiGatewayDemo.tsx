"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Gauge,
  KeyRound,
  Laptop,
  Pause,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShoppingCart,
  Split,
  StepForward,
  Users,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";

type Hop = "c2g" | "g2s" | "s2g" | "g2c";

type Step = {
  note: string;
  clientActive: boolean;
  gatewayActive: boolean;
  service: string | null;
  hop: Hop | null;
  payload: string | null;
};

const steps: Step[] = [
  {
    clientActive: true,
    gatewayActive: true,
    service: null,
    hop: "c2g",
    payload: "GET /orders/42",
    note: "The client sends GET /orders/42 to the gateway. It knows just one address — the gateway is the single entry point for the whole system.",
  },
  {
    clientActive: false,
    gatewayActive: true,
    service: null,
    hop: null,
    payload: null,
    note: "Authentication: the gateway checks the request's token. Valid ✓ — the caller is who they say they are, so the request continues.",
  },
  {
    clientActive: false,
    gatewayActive: true,
    service: null,
    hop: null,
    payload: null,
    note: "Rate limiting: the gateway counts how many requests this client has made recently. Within the limit ✓ — the request is allowed through.",
  },
  {
    clientActive: false,
    gatewayActive: true,
    service: "orders",
    hop: "g2s",
    payload: "GET /orders/42",
    note: "Routing: the gateway matches the path. /orders/* maps to the Orders service, so it forwards the request there.",
  },
  {
    clientActive: false,
    gatewayActive: true,
    service: "orders",
    hop: "s2g",
    payload: "200 OK",
    note: "The Orders service does the actual work and returns a 200 response back to the gateway.",
  },
  {
    clientActive: true,
    gatewayActive: true,
    service: "orders",
    hop: "g2c",
    payload: "200 OK",
    note: "The gateway relays the 200 response to the client — which never had to know which backend service handled it.",
  },
];

// Which side each hop sits on, its direction, and whether it is a response.
const HOP = {
  c2g: { side: "left", dir: "right", good: false },
  g2c: { side: "left", dir: "left", good: true },
  g2s: { side: "right", dir: "right", good: false },
  s2g: { side: "right", dir: "left", good: true },
} as const;

const CONCERNS = [
  {
    key: "auth",
    label: "Authenticate",
    icon: KeyRound,
    at: 1,
    idle: "awaiting token",
    active: "checking token…",
    done: "✓ token valid",
  },
  {
    key: "rate",
    label: "Rate limit",
    icon: Gauge,
    at: 2,
    idle: "not checked yet",
    active: "counting requests…",
    done: "✓ within limit",
  },
  {
    key: "route",
    label: "Route by path",
    icon: Split,
    at: 3,
    idle: "not routed yet",
    active: "matching path…",
    done: "/orders/* → Orders",
  },
] as const;

const SERVICES = [
  { key: "users", label: "Users", path: "/users/*", icon: Users },
  { key: "orders", label: "Orders", path: "/orders/*", icon: ShoppingCart },
  { key: "search", label: "Search", path: "/search/*", icon: Search },
] as const;

export default function ApiGatewayDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const box = (active: boolean) => ({
    borderColor: active ? color : "var(--color-line)",
    background: active ? tint(color, 8) : "transparent",
  });

  const renderWire = (side: "left" | "right") => {
    const info = frame.hop ? HOP[frame.hop] : null;
    const on = info?.side === side;
    const good = on && info!.good;
    const dirLeft = on && info!.dir === "left";
    const tone = good ? GOOD : color;
    return (
      <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-1.5 px-0.5 sm:w-20">
        <div className="flex h-4 items-center">
          <AnimatePresence mode="wait">
            {on && frame.payload && (
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap rounded px-1 py-0.5 font-mono text-[9px] sm:text-[10px]"
                style={{ color: tone, background: tint(tone, 14) }}
              >
                {frame.payload}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative flex w-full items-center justify-center">
          <div
            className="absolute h-px w-full"
            style={{ background: on ? tone : "var(--color-line)" }}
          />
          <div className="relative rounded-full bg-panel p-0.5">
            <ArrowRight
              className={`h-3.5 w-3.5 ${dirLeft ? "rotate-180" : ""}`}
              style={{ color: on ? tone : "var(--color-faint)" }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">A request through an API gateway</h3>
      <p className="mt-1 text-sm text-dim">
        One client, one entry point. Watch a single request pass through auth,
        rate limiting, and routing before reaching the right backend service.
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
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          {step + 1} / {steps.length}
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

      <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex min-w-[540px] items-stretch gap-1">
          {/* Client */}
          <div
            className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center transition-colors sm:w-28"
            style={box(frame.clientActive)}
          >
            <Laptop
              className="h-5 w-5"
              style={{ color: frame.clientActive ? color : "var(--color-faint)" }}
            />
            <span className="text-xs font-medium text-text">Client</span>
            <span className="text-[10px] leading-tight text-faint">
              knows only the gateway
            </span>
            {step >= 5 && (
              <span
                className="mt-0.5 inline-flex items-center gap-0.5 font-mono text-[10px]"
                style={{ color: GOOD }}
              >
                <Check className="h-3 w-3" /> got 200
              </span>
            )}
          </div>

          {renderWire("left")}

          {/* Gateway */}
          <div
            className="flex min-w-[168px] flex-1 flex-col rounded-xl border p-3 transition-colors"
            style={box(frame.gatewayActive)}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" style={{ color }} />
              <span className="text-sm font-semibold text-text">API Gateway</span>
            </div>
            <p className="mt-0.5 text-[10px] leading-tight text-faint">
              single entry point · cross-cutting concerns in one place
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {CONCERNS.map((c) => {
                const st = step < c.at ? "pending" : step === c.at ? "active" : "done";
                const accent =
                  st === "pending"
                    ? "var(--color-faint)"
                    : st === "done"
                      ? GOOD
                      : color;
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    className="flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors"
                    style={{
                      borderColor:
                        st === "active"
                          ? color
                          : st === "done"
                            ? tint(GOOD, 40)
                            : "var(--color-line-soft)",
                      background:
                        st === "active"
                          ? tint(color, 10)
                          : st === "done"
                            ? tint(GOOD, 8)
                            : "transparent",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-[11px] font-medium"
                          style={{
                            color:
                              st === "pending"
                                ? "var(--color-faint)"
                                : "var(--color-text)",
                          }}
                        >
                          {c.label}
                        </span>
                        {st === "done" && (
                          <Check className="h-3 w-3 shrink-0" style={{ color: GOOD }} />
                        )}
                      </div>
                      <span
                        className="block font-mono text-[9px] leading-tight sm:text-[10px]"
                        style={{ color: accent }}
                      >
                        {st === "pending" ? c.idle : st === "active" ? c.active : c.done}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {renderWire("right")}

          {/* Backend services */}
          <div className="flex w-24 shrink-0 flex-col gap-1.5 sm:w-28">
            {SERVICES.map((s) => {
              const on = frame.service === s.key;
              const responded = on && step >= 4;
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors"
                  style={box(on)}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: on ? color : "var(--color-faint)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[11px] font-medium"
                      style={{
                        color: on ? "var(--color-text)" : "var(--color-dim)",
                      }}
                    >
                      {s.label}
                    </div>
                    {on ? (
                      <span
                        className="inline-flex items-center gap-0.5 font-mono text-[9px] leading-tight"
                        style={{ color: responded ? GOOD : color }}
                      >
                        {responded && <Check className="h-2.5 w-2.5" />}
                        {responded ? "200 OK" : "handling…"}
                      </span>
                    ) : (
                      <span className="block font-mono text-[9px] leading-tight text-faint">
                        {s.path}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>

      {atEnd && (
        <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3 text-xs leading-relaxed text-dim">
          One entry point: the gateway keeps auth, rate limiting, TLS, and routing
          in one place instead of duplicating them in every service. The trade-off
          is that it&apos;s another hop and a single point of failure / potential
          bottleneck — so in production it&apos;s run as a highly available cluster.
        </div>
      )}
    </div>
  );
}
