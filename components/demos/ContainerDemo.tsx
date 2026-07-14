"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Box,
  Boxes,
  Cpu,
  FileCode,
  Layers,
  Server,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

type Mode = "vm" | "container";
type Fact = { label: string; value: string; tone: string };

const MODES: Record<
  Mode,
  {
    label: string;
    engine: string;
    engineHint: string;
    hostTitle: string;
    guestBand?: string;
    appLabel: string;
    facts: Fact[];
  }
> = {
  vm: {
    label: "Virtual machines",
    engine: "Hypervisor",
    engineHint: "boots a full guest OS for every app",
    hostTitle: "Host operating system",
    guestBand: "Guest OS",
    appLabel: "App",
    facts: [
      { label: "Footprint", value: "Gigabytes (heavy)", tone: BAD },
      { label: "Boot time", value: "Seconds to minutes", tone: WARN },
      { label: "Isolation", value: "Strong", tone: GOOD },
    ],
  },
  container: {
    label: "Containers",
    engine: "Container engine",
    engineHint: "apps share the one host kernel below",
    hostTitle: "Host OS — kernel shared by every container",
    appLabel: "App + deps",
    facts: [
      { label: "Footprint", value: "Megabytes (light)", tone: GOOD },
      { label: "Boot time", value: "Milliseconds", tone: GOOD },
      { label: "Isolation", value: "Weaker than a VM", tone: WARN },
    ],
  },
};

const APPS = ["A", "B", "C"];
const CONTAINERS = ["web.1", "web.2", "web.3"];

function Layer({
  icon,
  title,
  hint,
  accent,
  color,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  accent?: boolean;
  color?: string;
}) {
  const inner = (
    <>
      {icon}
      <span className="font-mono text-xs text-text">{title}</span>
      {hint ? (
        <span className="ml-auto text-right text-[11px] text-faint">{hint}</span>
      ) : null}
    </>
  );
  const cls = "mt-2 flex items-center gap-2 rounded-lg border px-3 py-2";
  return accent && color ? (
    <div
      className={cls}
      style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
    >
      {inner}
    </div>
  ) : (
    <div className={`${cls} border-line bg-bg-2`}>{inner}</div>
  );
}

export default function ContainerDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("container");
  const m = MODES[mode];
  const isVm = mode === "vm";

  const status = isVm
    ? "A virtual machine runs a full guest OS on top of a hypervisor: strong isolation, but heavy (gigabytes) and slow to boot. A container instead shares the host kernel and bundles only the app and its dependencies."
    : "A container packages an app with its dependencies so it runs identically anywhere, sharing the host kernel — far lighter than a VM (megabytes, boots in milliseconds). The image is the read-only template; each running container is an instance of it. Note: a container is not as strong a security boundary as a VM.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Containers vs virtual machines
      </h3>
      <p className="mt-1 text-sm text-dim">
        Two ways to package software — and why an image makes a container run the
        same on any machine.
      </p>

      <div
        className="mt-4 flex flex-wrap gap-1.5"
        role="group"
        aria-label="Compare packaging models"
      >
        {(Object.keys(MODES) as Mode[]).map((k) => {
          const on = k === mode;
          return (
            <button
              key={k}
              onClick={() => setMode(k)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? {
                      background: tint(color, 16),
                      color,
                      borderColor: tint(color, 45),
                    }
                  : {
                      color: "var(--color-dim)",
                      borderColor: "var(--color-line)",
                    }
              }
            >
              {MODES[k].label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          the stack (top = your apps)
        </p>

        <div className="grid grid-cols-3 gap-2">
          {APPS.map((a) => (
            <div
              key={a}
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: tint(color, 40), background: tint(color, 6) }}
            >
              {isVm ? (
                <div className="border-b border-line-soft px-2 py-1 text-center font-mono text-[10px] text-faint">
                  {m.guestBand}
                </div>
              ) : null}
              <div className="flex items-center justify-center gap-1 px-2 py-2">
                <Box className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                <span className="font-mono text-xs text-text">
                  {isVm ? `${m.appLabel} ${a}` : m.appLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Layer
          icon={<Layers className="h-3.5 w-3.5 shrink-0" style={{ color }} />}
          title={m.engine}
          hint={m.engineHint}
          accent
          color={color}
        />
        <Layer
          icon={<Cpu className="h-3.5 w-3.5 shrink-0 text-dim" />}
          title={m.hostTitle}
        />
        <Layer
          icon={<Server className="h-3.5 w-3.5 shrink-0 text-dim" />}
          title="Physical hardware"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {m.facts.map((f) => (
          <div
            key={f.label}
            className="rounded-lg border border-line-soft bg-bg-2 px-3 py-2"
          >
            <p className="text-[10px] uppercase tracking-widest text-faint">
              {f.label}
            </p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: f.tone }}>
              {f.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          one image → many identical containers
        </p>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
            <FileCode className="h-4 w-4 shrink-0 text-dim" />
            <div>
              <p className="font-mono text-xs text-text">Dockerfile</p>
              <p className="text-[10px] text-faint">build recipe</p>
            </div>
          </div>

          <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-faint sm:rotate-0" />

          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: tint(color, 45), background: tint(color, 8) }}
          >
            <Boxes className="h-4 w-4 shrink-0" style={{ color }} />
            <div>
              <p className="font-mono text-xs text-text">Image</p>
              <p className="text-[10px] text-faint">
                read-only template: app + deps + config
              </p>
            </div>
          </div>

          <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-faint sm:rotate-0" />

          <div className="grid flex-1 grid-cols-3 gap-2">
            {CONTAINERS.map((c) => (
              <div
                key={c}
                className="flex flex-col items-center gap-1 rounded-lg border px-2 py-2"
                style={{
                  borderColor: tint(color, 35),
                  background: tint(color, 5),
                }}
              >
                <Box className="h-4 w-4 shrink-0" style={{ color }} />
                <span className="font-mono text-[11px] text-text">{c}</span>
                <span className="text-[10px] text-faint">running</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-dim">
          All three run the same image, so they behave the same on any machine —
          that is what solves “works-on-my-machine”.
        </p>
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
