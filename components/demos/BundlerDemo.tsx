"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Stage = {
  key: string;
  label: string;
  note: string;
  /** Approximate total bundle size in KB at this stage (scripted, deterministic). */
  size: number;
};

// The pipeline, start to finish. Sizes shrink from raw source to shipped bundle.
const STAGES: Stage[] = [
  {
    key: "source",
    label: "Source",
    note: "You wrote 3 modules in TypeScript and JSX — code no browser can run as-is.",
    size: 90,
  },
  {
    key: "resolve",
    label: "Resolve",
    note: "The bundler starts at app.tsx and follows every import to map the module graph.",
    size: 90,
  },
  {
    key: "transpile",
    label: "Transpile",
    note: "TypeScript types are stripped and JSX becomes plain function calls — every file is now .js.",
    size: 86,
  },
  {
    key: "treeshake",
    label: "Tree-shake",
    note: "ui-lib exports 5 things but only Modal is imported — the other 4 are dropped as dead code.",
    size: 41,
  },
  {
    key: "minify",
    label: "Minify",
    note: "Whitespace is stripped and names shrink to single letters. Same behavior, a fraction of the bytes.",
    size: 14,
  },
  {
    key: "output",
    label: "Output",
    note: "Two small bundles ship: the rarely-used route is split into its own chunk, loaded on demand. Source maps ride alongside for debugging.",
    size: 14,
  },
];

const MAX_SIZE = STAGES[0].size;

const MODULES = [
  { name: "app", ext: "tsx", role: "entry" },
  { name: "utils", ext: "ts", role: "helpers" },
  { name: "ui-lib", ext: "js", role: "dependency" },
];

const LIB_EXPORTS = [
  { name: "Modal", used: true },
  { name: "Drawer", used: false },
  { name: "Tabs", used: false },
  { name: "Carousel", used: false },
  { name: "Tooltip", used: false },
];

const CODE_READABLE = `export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`;

const CODE_MIN = `export function d(n,t){let e;return(...r)=>{clearTimeout(e),e=setTimeout(()=>n(...r),t)}}`;

const OUTPUT = [
  { name: "main.a1b2c3.js", size: "10 KB", note: "loaded on first paint" },
  { name: "about.d4e5f6.js", size: "4 KB", note: "split chunk — loaded on demand" },
  { name: "main.a1b2c3.js.map", size: "src map", note: "for debugging the original code" },
];

export default function BundlerDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const stage = STAGES[Math.min(step, STAGES.length - 1)];
  const atEnd = step >= STAGES.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((s) => Math.min(s + 1, STAGES.length - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const resolved = step >= 1;
  const transpiled = step >= 2;
  const shaken = step >= 3;
  const minified = step >= 4;
  const done = step >= 5;
  const sizePct = Math.round((stage.size / MAX_SIZE) * 100);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The build step: source in, small bundle out
      </h3>
      <p className="mt-1 text-sm text-dim">
        Step through what a bundler does to your code — resolve, transpile,
        tree-shake, minify, split — and watch the shipped size shrink.
      </p>

      {/* controls */}
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
          onClick={() => setStep((s) => Math.min(s + 1, STAGES.length - 1))}
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

      {/* pipeline indicator */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {STAGES.map((s, i) => {
          const on = i === step;
          const passed = i < step;
          return (
            <span
              key={s.key}
              className="rounded-md border px-2 py-1 font-mono text-[11px] transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : passed
                    ? { color: "var(--color-dim)", borderColor: "var(--color-line)" }
                    : { color: "var(--color-faint)", borderColor: "var(--color-line-soft)" }
              }
            >
              {i + 1}. {s.label}
            </span>
          );
        })}
      </div>

      {/* size readout */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            approx. shipped size
          </span>
          <span className="font-mono text-lg font-semibold text-text">
            {stage.size} KB
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line-soft">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${sizePct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="mt-1 font-mono text-[10px] text-faint">
          from {MAX_SIZE} KB of raw source
        </p>
      </div>

      {/* module graph */}
      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          module graph
        </p>
        <div className="flex flex-col gap-2">
          {MODULES.map((m) => {
            const ext = transpiled ? "js" : m.ext;
            const wasTs = m.ext !== "js";
            const isEntry = m.role === "entry";
            const isLib = m.name === "ui-lib";
            return (
              <div
                key={m.name}
                className="rounded-lg border px-3 py-2"
                style={{
                  borderColor: isEntry ? color : "var(--color-line)",
                  background: isEntry ? tint(color, 8) : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-text">
                    {m.name}.{ext}
                  </span>
                  <span className="rounded border border-line px-1 font-mono text-[10px] uppercase text-faint">
                    {m.role}
                  </span>
                  {transpiled && wasTs && (
                    <span className="font-mono text-[10px] text-faint">
                      (was .{m.ext})
                    </span>
                  )}
                </div>

                {isEntry && resolved && (
                  <p className="mt-1 font-mono text-[11px] text-dim">
                    imports → utils.{transpiled ? "js" : "ts"} · ui-lib.js
                  </p>
                )}

                {isLib && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <AnimatePresence initial={false}>
                      {LIB_EXPORTS.filter((e) => !(shaken && !e.used)).map((e) => {
                        const kept = shaken && e.used;
                        return (
                          <motion.span
                            key={e.name}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                            style={
                              kept
                                ? { color, borderColor: tint(color, 45) }
                                : { color: "var(--color-faint)", borderColor: "var(--color-line)" }
                            }
                          >
                            {e.name}
                            {kept && " · kept"}
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>
                    {shaken && (
                      <span className="rounded px-1.5 py-0.5 font-mono text-[10px] text-faint">
                        4 unused exports dropped
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* code preview: readable -> minified */}
      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          utils.js — {minified ? "minified" : "readable"}
        </p>
        <pre className="thin-scroll overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-dim">
          {minified ? CODE_MIN : CODE_READABLE}
        </pre>
      </div>

      {/* output files */}
      {done && (
        <div className="mt-3 rounded-xl border p-3" style={{ borderColor: tint(color, 40), background: tint(color, 6) }}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
            output bundle
          </p>
          <div className="flex flex-col gap-1.5">
            {OUTPUT.map((f) => (
              <div
                key={f.name}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg border border-line bg-bg-2/60 px-3 py-1.5"
              >
                <span className="font-mono text-xs text-text">{f.name}</span>
                <span className="font-mono text-[11px] text-faint">
                  {f.size} · {f.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {stage.note}
      </p>
    </div>
  );
}
