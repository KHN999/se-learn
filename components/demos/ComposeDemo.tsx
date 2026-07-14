"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

const COMPOSE = `services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
      - cache
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
  cache:
    image: redis:7

volumes:
  pgdata:`;

type SvcKey = "web" | "db" | "cache";
type SvcStatus = "pending" | "up";

type Step = {
  action: string;
  note: string;
  network: boolean;
  web: SvcStatus;
  db: SvcStatus;
  cache: SvcStatus;
  wired: boolean;
};

const STEPS: Step[] = [
  {
    action: "read compose.yaml",
    note: "docker compose up reads compose.yaml and finds three services — web, db and cache — plus their volume and network.",
    network: false,
    web: "pending",
    db: "pending",
    cache: "pending",
    wired: false,
  },
  {
    action: "create network",
    note: "Compose creates one shared network so the services can reach each other by name instead of by IP address.",
    network: true,
    web: "pending",
    db: "pending",
    cache: "pending",
    wired: false,
  },
  {
    action: "start db",
    note: "db starts first: postgres comes up and passes its healthcheck before anything that depends on it is allowed to start.",
    network: true,
    web: "pending",
    db: "up",
    cache: "pending",
    wired: false,
  },
  {
    action: "start cache",
    note: "cache starts next: redis joins the same shared network.",
    network: true,
    web: "pending",
    db: "up",
    cache: "up",
    wired: false,
  },
  {
    action: "start web",
    note: "web starts once its depends_on — db and cache — are ready, then publishes port 3000 to your machine.",
    network: true,
    web: "up",
    db: "up",
    cache: "up",
    wired: false,
  },
  {
    action: "all running",
    note: "All three run together, wired by service name — web reaches db:5432 and cache:6379 with no IP wiring. One compose.yaml declares the whole local stack (app, database, cache, plus their networks, volumes and env) so docker compose up brings it all up reproducibly. For production-scale orchestration you graduate to Kubernetes.",
    network: true,
    web: "up",
    db: "up",
    cache: "up",
    wired: true,
  },
];

const SERVICES: {
  key: SvcKey;
  name: string;
  build: string;
  extra: string;
  up: string;
  depends: string | null;
}[] = [
  {
    key: "web",
    name: "web",
    build: "build: .",
    extra: "ports 3000:3000",
    up: "running",
    depends: "depends_on: db, cache",
  },
  {
    key: "db",
    name: "db",
    build: "image: postgres:16",
    extra: "volume pgdata",
    up: "healthy",
    depends: null,
  },
  {
    key: "cache",
    name: "cache",
    build: "image: redis:7",
    extra: "in-memory",
    up: "running",
    depends: null,
  },
];

const CONNECTIONS: { key: string; label: string }[] = [
  { key: "db", label: "db:5432" },
  { key: "cache", label: "cache:6379" },
];

export default function ComposeDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Docker Compose runs a multi-container app together
      </h3>
      <p className="mt-1 text-sm text-dim">
        One compose.yaml declares web, db and cache. docker compose up starts them
        on a shared network, wired by service name.
      </p>

      <pre className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
        {COMPOSE}
      </pre>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
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
          docker compose up · {frame.action}
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

      <div
        className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs"
        style={{
          borderColor: frame.network ? color : "var(--color-line)",
          background: frame.network ? tint(color, 8) : "transparent",
          color: frame.network ? color : "var(--color-faint)",
        }}
      >
        <span>network: app-net</span>
        <span className="ml-auto">
          {frame.network ? "created" : "not created"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {SERVICES.map((svc) => {
          const up = frame[svc.key] === "up";
          const badge = up ? GOOD : WARN;
          return (
            <motion.div
              key={svc.key}
              animate={{ opacity: up ? 1 : 0.9 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border p-3"
              style={{
                borderColor: up ? tint(GOOD, 45) : "var(--color-line)",
                background: up ? tint(GOOD, 8) : "var(--color-bg-2)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-text">
                  {svc.name}
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: badge }}
                >
                  {up ? svc.up : "pending"}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-dim">{svc.build}</p>
              <p className="font-mono text-[11px] text-faint">{svc.extra}</p>
              {svc.depends ? (
                <p className="mt-1 font-mono text-[10px] text-faint">
                  {svc.depends}
                </p>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          web talks by service name
        </p>
        <div className="flex flex-wrap gap-2">
          {CONNECTIONS.map((c) => (
            <motion.span
              key={c.key}
              animate={{ opacity: frame.wired ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs"
              style={{
                borderColor: frame.wired ? color : "var(--color-line)",
                background: frame.wired ? tint(color, 12) : "transparent",
                color: frame.wired ? color : "var(--color-faint)",
              }}
            >
              web → {c.label}
            </motion.span>
          ))}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>
    </div>
  );
}
