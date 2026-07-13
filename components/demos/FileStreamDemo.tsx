"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Play, Plus, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const CAP = 5; // memory budget, in chunks
const RED = "#ef4444";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function FileStreamDemo({ color }: { color: string }) {
  const [chunks, setChunks] = useState(8);
  const [mode, setMode] = useState<"whole" | "stream">("whole");
  const [inMem, setInMem] = useState<number[]>([]);
  const [processed, setProcessed] = useState(0);
  const [peak, setPeak] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "oom">("idle");
  const tok = useRef(0);

  // Reset the visualization when the file size or mode changes.
  const key = `${mode}|${chunks}`;
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setInMem([]);
    setProcessed(0);
    setPeak(0);
    setStatus("idle");
  }

  useEffect(() => {
    // Cancel any in-flight run when the inputs change (ref write only).
    tok.current++;
  }, [mode, chunks]);

  async function run() {
    const token = ++tok.current;
    setInMem([]);
    setProcessed(0);
    setPeak(0);
    setStatus("running");
    if (mode === "whole") {
      const all = Array.from({ length: chunks }, (_, i) => i);
      setInMem(all);
      setPeak(chunks);
      if (chunks > CAP) {
        setStatus("oom");
        return;
      }
      for (let i = 0; i < chunks; i++) {
        if (tok.current !== token) return;
        setProcessed(i + 1);
        await sleep(260);
      }
      if (tok.current !== token) return;
      setInMem([]);
      setStatus("done");
    } else {
      for (let i = 0; i < chunks; i++) {
        if (tok.current !== token) return;
        setInMem([i]);
        setPeak(1);
        await sleep(200);
        if (tok.current !== token) return;
        setProcessed(i + 1);
        await sleep(120);
      }
      if (tok.current !== token) return;
      setInMem([]);
      setStatus("done");
    }
  }

  function reset() {
    tok.current++;
    setInMem([]);
    setProcessed(0);
    setPeak(0);
    setStatus("idle");
  }

  const running = status === "running";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Whole file vs. streaming: where does the memory go?
      </h3>
      <p className="mt-1 text-sm text-dim">
        Reading a file whole is simple but holds all of it in memory at once.
        Streaming keeps just one chunk in memory. Grow the file and watch which
        one runs out of room.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-faint">file size</span>
          <button
            onClick={() => setChunks((c) => Math.max(3, c - 1))}
            className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
            aria-label="smaller file"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-16 text-center font-mono text-xs text-text">
            {chunks} chunks
          </span>
          <button
            onClick={() => setChunks((c) => Math.min(12, c + 1))}
            className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
            aria-label="bigger file"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["whole", "stream"] as const).map((m) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="px-3 py-1.5 text-xs transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {m === "whole" ? "read whole" : "stream"}
              </button>
            );
          })}
        </div>
        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          <Play className="h-3.5 w-3.5" /> Run
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      {/* File on disk */}
      <div className="mt-4">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          file on disk ({chunks} chunks)
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: chunks }, (_, i) => {
            const done = i < processed;
            return (
              <div
                key={i}
                className="h-6 w-6 rounded-sm border transition-colors"
                style={
                  done
                    ? { borderColor: color, background: tint(color, 30) }
                    : { borderColor: "var(--color-line-soft)", background: "var(--color-bg-2)" }
                }
              />
            );
          })}
        </div>
      </div>

      {/* Memory */}
      <div className="mt-4">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          memory (budget: {CAP} chunks)
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: Math.max(CAP, inMem.length) }, (_, i) => {
            const filled = i < inMem.length;
            const over = i >= CAP;
            return (
              <div
                key={i}
                className="h-6 w-6 rounded-sm border"
                style={
                  filled && over
                    ? { borderColor: RED, background: tint(RED, 35) }
                    : filled
                      ? { borderColor: color, background: tint(color, 35) }
                      : { borderColor: "var(--color-line-soft)", borderStyle: over ? "solid" : "dashed", background: "transparent" }
                }
              />
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-mono text-xs text-faint">
          peak memory:{" "}
          <span style={{ color: peak > CAP ? RED : "var(--color-text)" }}>
            {peak} chunk{peak === 1 ? "" : "s"}
          </span>
        </span>
        {status === "oom" && (
          <span className="font-mono text-xs font-semibold" style={{ color: RED }}>
            ⚠ out of memory — the whole file doesn&apos;t fit
          </span>
        )}
        {status === "done" && (
          <span className="font-mono text-xs" style={{ color: "var(--color-good)" }}>
            ✓ finished
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">
        {mode === "whole"
          ? "Reading whole holds the entire file in memory — peak memory grows with the file, so a big enough file runs out of room."
          : "Streaming holds one chunk at a time — peak memory stays flat no matter how big the file is. That is why huge files are processed as streams."}
      </p>
    </div>
  );
}
