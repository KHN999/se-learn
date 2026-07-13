"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const RED = "#ef4444";

type CatchAt = "loadConfig" | "main" | "none";
type Phase = {
  stack: string[];
  active?: string;
  error?: string;
  finallyAt?: string;
  caught?: string;
  crashed?: boolean;
  note: string;
};

function build(catchAt: CatchAt): Phase[] {
  const s: Phase[] = [];
  s.push({ stack: ["main"], active: "main", note: "main() runs and calls loadConfig()." });
  s.push({ stack: ["main", "loadConfig"], active: "loadConfig", note: "loadConfig() runs and calls readFile()." });
  s.push({ stack: ["main", "loadConfig", "readFile"], active: "readFile", note: "readFile() tries to open the file — but it's missing." });
  s.push({ stack: ["main", "loadConfig", "readFile"], error: "readFile", note: 'readFile throws Error("file not found"). Normal execution stops.' });
  s.push({ stack: ["main", "loadConfig", "readFile"], error: "readFile", finallyAt: "readFile", note: "readFile's finally runs on the way out — the file handle is closed no matter what." });
  s.push({ stack: ["main", "loadConfig"], error: "loadConfig", note: "No catch in readFile — its frame is popped and the error propagates up to loadConfig." });
  if (catchAt === "loadConfig") {
    s.push({ stack: ["main", "loadConfig"], caught: "loadConfig", note: "loadConfig has a try/catch — the error is caught here. It falls back to defaults and the program continues." });
    return s;
  }
  s.push({ stack: ["main"], error: "main", note: "No catch in loadConfig — popped; the error propagates up to main." });
  if (catchAt === "main") {
    s.push({ stack: ["main"], caught: "main", note: "main has a try/catch — the error is caught here and shown to the user." });
    return s;
  }
  s.push({ stack: [], crashed: true, note: 'No catch anywhere — the error is unhandled. The program crashes and prints a stack trace: "Error: file not found".' });
  return s;
}

function codeFor(catchAt: CatchAt): string {
  const readFile =
    'function readFile(path) {\n  try {\n    throw new Error("file not found")\n  } finally {\n    closeHandle()          // finally always runs\n  }\n}';
  const loadConfig =
    catchAt === "loadConfig"
      ? 'function loadConfig() {\n  try {\n    return readFile("config.json")\n  } catch (err) {\n    return DEFAULTS       // caught here\n  }\n}'
      : 'function loadConfig() {\n  return readFile("config.json")   // no catch\n}';
  const main =
    catchAt === "main"
      ? "function main() {\n  try {\n    loadConfig()\n  } catch (err) {\n    showError(err)        // caught here\n  }\n}"
      : "function main() {\n  loadConfig()             // no catch\n}";
  return `${readFile}\n\n${loadConfig}\n\n${main}`;
}

export default function ErrorPropagationDemo({ color }: { color: string }) {
  const [catchAt, setCatchAt] = useState<CatchAt>("loadConfig");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const phases = build(catchAt);
  const phase = phases[Math.min(step, phases.length - 1)];
  const atEnd = step >= phases.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the catch location changes (adjust state during render).
  const [prevCatch, setPrevCatch] = useState(catchAt);
  if (catchAt !== prevCatch) {
    setPrevCatch(catchAt);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, phases.length - 1)), 950);
    return () => clearTimeout(t);
  }, [isPlaying, step, phases.length]);

  const view = [...phase.stack].reverse();

  function styleFor(fn: string) {
    if (phase.caught === fn) return { border: "var(--color-good)", bg: tint("#22c55e", 10), badge: "caught" };
    if (phase.error === fn) return { border: RED, bg: tint(RED, 10), badge: "error" };
    if (phase.active === fn) return { border: color, bg: tint(color, 8), badge: "running" };
    return { border: "var(--color-line)", bg: "transparent", badge: "" };
  }

  const options: { key: CatchAt; label: string }[] = [
    { key: "loadConfig", label: "catch in loadConfig" },
    { key: "main", label: "catch in main" },
    { key: "none", label: "no catch" },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Watch an error travel up the stack
      </h3>
      <p className="mt-1 text-sm text-dim">
        readFile throws. Choose where the try/catch lives, then step through and
        watch the error propagate until it&apos;s caught — or crashes the program.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = catchAt === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setCatchAt(o.key)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
          {codeFor(catchAt)}
        </pre>

        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            call stack
          </p>
          {phase.crashed ? (
            <div
              className="rounded-lg border p-4 text-center"
              style={{ borderColor: RED, background: tint(RED, 10) }}
            >
              <AlertTriangle className="mx-auto h-5 w-5" style={{ color: RED }} />
              <p className="mt-1 font-mono text-sm font-semibold" style={{ color: RED }}>
                program crashed
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-faint">
                Uncaught Error: file not found
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {view.map((fn) => {
                  const st = styleFor(fn);
                  return (
                    <motion.div
                      key={fn}
                      layout
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-lg border p-2.5"
                      style={{ borderColor: st.border, background: st.bg }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-text">
                          {fn}()
                        </span>
                        <span className="flex items-center gap-1.5">
                          {phase.finallyAt === fn && (
                            <span className="rounded px-1.5 py-0.5 font-mono text-[10px]" style={{ background: tint("#f5b13d", 20), color: "var(--color-warn)" }}>
                              finally
                            </span>
                          )}
                          {st.badge === "caught" && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: "var(--color-good)" }}>
                              <Check className="h-3 w-3" /> caught
                            </span>
                          )}
                          {st.badge === "error" && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: RED }}>
                              <AlertTriangle className="h-3 w-3" /> error
                            </span>
                          )}
                          {st.badge === "running" && (
                            <span className="font-mono text-[10px]" style={{ color }}>
                              running
                            </span>
                          )}
                        </span>
                      </div>
                      {phase.error === fn && (
                        <p className="mt-1 font-mono text-[11px]" style={{ color: RED }}>
                          holds: Error(&quot;file not found&quot;)
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{phase.note}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
          onClick={() => setStep((s) => Math.min(s + 1, phases.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" />
          Run one step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <span className="font-mono text-[11px] text-faint">
          step {Math.min(step + 1, phases.length)} / {phases.length}
        </span>
      </div>
    </div>
  );
}
