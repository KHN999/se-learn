"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  HardDrive,
  Layers,
  MemoryStick,
  Zap,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

// The process's private, contiguous virtual pages V0..V5.
const VPAGES = [0, 1, 2, 3, 4, 5] as const;

type FrameOwner = { kind: "us"; page: number } | { kind: "other" };

type Mode = {
  // Physical RAM: array index === frame number. Some frames belong to another
  // process, so RAM is shared and our pages land in it fragmented.
  frames: FrameOwner[];
  // Our resident pages: virtual page -> frame number.
  resident: Record<number, number>;
  // The page evicted on a fault (a fixed, deterministic LRU victim).
  victim: number;
};

// Roomy: our process holds 3 of 5 frames; the rest belong to another process.
const ROOMY: Mode = {
  frames: [
    { kind: "us", page: 0 },
    { kind: "us", page: 3 },
    { kind: "other" },
    { kind: "us", page: 1 },
    { kind: "other" },
  ],
  resident: { 0: 0, 3: 1, 1: 3 },
  victim: 3,
};

// Cramped: our process is starved down to 2 frames, so its working set of six
// pages cannot fit and almost every access faults -> thrashing.
const TIGHT: Mode = {
  frames: [
    { kind: "us", page: 0 },
    { kind: "other" },
    { kind: "us", page: 1 },
    { kind: "other" },
    { kind: "other" },
  ],
  resident: { 0: 0, 1: 2 },
  victim: 0,
};

type Result = {
  hit: boolean;
  accessFrame: number;
  victim: number | null;
  frames: FrameOwner[];
  residentAfter: Map<number, number>;
};

function resolve(mode: Mode, page: number): Result {
  const residentFrame = mode.resident[page];
  const hit = residentFrame !== undefined;

  const residentAfter = new Map<number, number>(
    Object.entries(mode.resident).map(([p, f]) => [Number(p), f]),
  );

  if (hit) {
    return {
      hit: true,
      accessFrame: residentFrame,
      victim: null,
      frames: mode.frames,
      residentAfter,
    };
  }

  // Page fault: RAM is full, so evict the victim to disk and load the page
  // into the freed frame.
  const victim = mode.victim;
  const freed = mode.resident[victim];
  const frames = mode.frames.map((f, i) =>
    i === freed ? { kind: "us" as const, page } : f,
  );
  residentAfter.delete(victim);
  residentAfter.set(page, freed);
  return { hit: false, accessFrame: freed, victim, frames, residentAfter };
}

export default function VirtualMemoryDemo({ color }: { color: string }) {
  const [page, setPage] = useState(0);
  const [tight, setTight] = useState(false);

  const mode = tight ? TIGHT : ROOMY;
  const r = resolve(mode, page);

  const diskPages = VPAGES.filter((v) => !r.residentAfter.has(v));

  const stateColor = r.hit ? GOOD : WARN;
  const stateLabel = r.hit ? "HIT" : "PAGE FAULT";
  const cost = r.hit ? "≈100 ns" : "≈10 ms";

  const flow = r.hit
    ? `V${page} is resident, so the MMU translates the virtual address through the page table and reads frame F${r.accessFrame} directly — a HIT, about 100 ns.`
    : `V${page} isn't in RAM, so the CPU traps to the OS — a PAGE FAULT. RAM is full, so the OS evicts V${r.victim} to disk, reads V${page} from swap into frame F${r.accessFrame}, updates the page table, then restarts the access — roughly 10 ms, about 100,000× slower than a hit.`;

  const context = tight
    ? " With this little RAM the pages you keep touching don't fit, so nearly every access faults and evicts a page you'll need again next — the OS thrashes, spending its time swapping instead of running your code."
    : " Your process sees V0–V5 as one private, contiguous block, yet its frames sit scattered across RAM that's shared with other processes. RAM is just a fast cache over the disk.";

  const status = flow + context;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Virtual memory: a private address space mapped to real RAM
      </h3>
      <p className="mt-1 text-sm text-dim">
        Each process sees its own contiguous pages V0–V5. The page table maps
        them to scattered RAM frames, or to disk. Pick a page to trace the
        translation.
      </p>

      {/* Access controls */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {VPAGES.map((v) => {
          const on = v === page;
          return (
            <button
              key={v}
              onClick={() => setPage(v)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              Access V{v}
            </button>
          );
        })}
      </div>

      {/* RAM-size mode */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          RAM
        </span>
        <button
          onClick={() => setTight(false)}
          aria-pressed={!tight}
          className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
          style={
            !tight
              ? { background: tint(GOOD, 16), color: GOOD, borderColor: tint(GOOD, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          Enough RAM
        </button>
        <button
          onClick={() => setTight(true)}
          aria-pressed={tight}
          className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
          style={
            tight
              ? { background: tint(BAD, 16), color: BAD, borderColor: tint(BAD, 45) }
              : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
          }
        >
          Too little RAM
        </button>
      </div>

      {/* Translation flow + result */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line-soft bg-bg-2/50 p-3 text-sm">
        <span
          className="rounded-md px-2 py-1 font-mono"
          style={{ background: tint(color, 14), color }}
        >
          V{page}
        </span>
        <ArrowRight className="h-4 w-4 text-faint" />
        <span className="font-mono text-dim">page table</span>
        <ArrowRight className="h-4 w-4 text-faint" />
        <span className="font-mono text-dim">
          {r.hit ? `RAM F${r.accessFrame}` : `disk → RAM F${r.accessFrame}`}
        </span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ background: tint(stateColor, 16), color: stateColor }}
        >
          {r.hit ? (
            <Zap className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {stateLabel} · {cost}
        </span>
        {tight && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: tint(BAD, 16), color: BAD }}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> THRASHING
          </span>
        )}
      </div>

      {/* Three-column map: virtual -> page table -> physical + disk */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {/* Virtual address space */}
        <div className="min-w-0 rounded-xl border border-line-soft bg-bg-2/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <Layers className="h-3 w-3" /> Virtual space
          </div>
          <div className="flex flex-col gap-1.5">
            {VPAGES.map((v) => {
              const on = v === page;
              return (
                <div
                  key={v}
                  className="flex items-center justify-between rounded-lg border border-line-soft px-2.5 py-1.5 text-sm"
                  style={on ? { borderColor: color, background: tint(color, 10) } : undefined}
                >
                  <span className="font-mono text-text">V{v}</span>
                  <span className="font-mono text-[10px] text-faint">
                    0x{(v * 0x1000).toString(16).padStart(4, "0")}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-faint">private + contiguous</p>
        </div>

        {/* Page table */}
        <div className="min-w-0 rounded-xl border border-line-soft bg-bg-2/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <ArrowRight className="h-3 w-3" /> Page table
          </div>
          <div className="flex flex-col gap-1.5">
            {VPAGES.map((v) => {
              const fr = r.residentAfter.get(v);
              const resident = fr !== undefined;
              const on = v === page;
              return (
                <div
                  key={v}
                  className="flex items-center gap-2 rounded-lg border border-line-soft px-2.5 py-1.5 text-sm"
                  style={on ? { borderColor: color, background: tint(color, 10) } : undefined}
                >
                  <span className="w-6 font-mono text-text">V{v}</span>
                  <ArrowRight className="h-3 w-3 text-faint" />
                  {resident ? (
                    <span className="font-mono text-xs" style={{ color: GOOD }}>
                      F{fr}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-faint">disk</span>
                  )}
                  {on && (
                    <span
                      className="ml-auto font-mono text-[10px] font-medium"
                      style={{ color: stateColor }}
                    >
                      {stateLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical RAM + disk */}
        <div className="min-w-0 rounded-xl border border-line-soft bg-bg-2/40 p-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <MemoryStick className="h-3 w-3" /> Physical RAM
          </div>
          <div className="flex flex-col gap-1.5">
            {r.frames.map((f, i) => {
              const isAccess = i === r.accessFrame;
              const isUs = f.kind === "us";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-line-soft px-2.5 py-1.5 text-sm"
                  style={
                    isAccess
                      ? { borderColor: stateColor, background: tint(stateColor, 12) }
                      : undefined
                  }
                >
                  <span className="font-mono text-[10px] text-faint">F{i}</span>
                  {isUs ? (
                    <span
                      className="font-mono text-sm text-dim"
                      style={isAccess ? { color: stateColor } : undefined}
                    >
                      V{f.page}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-faint">P2</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-faint">shared with P2, fragmented</p>

          <div className="mb-2 mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            <HardDrive className="h-3 w-3" /> Disk (swap)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {diskPages.length === 0 ? (
              <span className="font-mono text-xs text-faint">none</span>
            ) : (
              diskPages.map((v) => (
                <span
                  key={v}
                  className="rounded-md border border-line-soft px-2 py-1 font-mono text-xs text-faint"
                  style={
                    !r.hit && v === r.victim
                      ? { borderColor: WARN, color: WARN }
                      : undefined
                  }
                >
                  V{v}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
