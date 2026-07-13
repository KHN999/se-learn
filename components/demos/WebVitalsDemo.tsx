"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ImageIcon,
  Loader2,
  MousePointerClick,
  RotateCcw,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const RES = 96; // the image's real rendered height, in px

type Mode = "bad" | "good";

type Vital = {
  k: string;
  v: string;
  note: string;
  ok: boolean | null; // null = still measuring
};

export default function WebVitalsDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("bad");
  const [loaded, setLoaded] = useState(false);
  const [runId, setRunId] = useState(0);

  // Reset the load whenever the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setLoaded(false);
    setRunId((r) => r + 1);
  }

  // Deterministic timed reveal: the image "loads" a beat after each run.
  // A slower beat for the bad build so its main content also appears late.
  const delay = mode === "good" ? 800 : 1500;
  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(t);
  }, [runId, loaded, delay]);

  const replay = () => {
    setLoaded(false);
    setRunId((r) => r + 1);
  };

  // Derived, computed during render — never in an effect.
  const reservedHeight = mode === "good" ? RES : loaded ? RES : 0;
  const shifted = mode === "bad" && loaded;

  const vitals: Vital[] = !loaded
    ? [
        { k: "LCP", v: "measuring…", note: "loading", ok: null },
        { k: "INP", v: "measuring…", note: "loading", ok: null },
        { k: "CLS", v: "0.00", note: "stable so far", ok: null },
      ]
    : mode === "good"
      ? [
          { k: "LCP", v: "1.2 s", note: "good", ok: true },
          { k: "INP", v: "45 ms", note: "snappy", ok: true },
          { k: "CLS", v: "0.00", note: "no shift", ok: true },
        ]
      : [
          { k: "LCP", v: "4.2 s", note: "poor", ok: false },
          { k: "INP", v: "220 ms", note: "sluggish", ok: false },
          { k: "CLS", v: "0.31", note: "shifted", ok: false },
        ];

  const status = !loaded
    ? mode === "good"
      ? "The image's box is reserved (width/height set), so the Buy button already sits in its final spot while the picture loads."
      : "No space is reserved for the image. The Buy button is sitting high — right under where you'd tap…"
    : mode === "good"
      ? "The image dropped into its reserved box and nothing moved — stable layout, CLS 0.00. The Buy button never left your finger."
      : "The image popped in above the button and shoved the whole column down — the Buy button jumped out from under your finger. That downward jump is Cumulative Layout Shift (CLS 0.31).";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Reserve space, or the page jumps (CLS)
      </h3>
      <p className="mt-1 text-sm text-dim">
        A product page loads its image a beat after the shell. Toggle whether the
        image&apos;s space is reserved, and watch whether the Buy button stays put.
      </p>

      {/* mode toggle + replay */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line p-0.5">
          {(
            [
              ["bad", "Bad (no reserved space)"],
              ["good", "Good (space reserved)"],
            ] as const
          ).map(([m, label]) => {
            const on = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={on}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                style={
                  on
                    ? { background: tint(color, 16), color }
                    : { color: "var(--color-dim)" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={replay}
          disabled={!loaded}
          aria-label="reload and replay the image load"
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-faint transition-colors hover:text-dim disabled:opacity-50"
        >
          {loaded ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" /> reload
            </>
          ) : (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading…
            </>
          )}
        </button>
      </div>

      {/* mock article */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            product page
          </span>
          {loaded && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                color: shifted ? BAD : GOOD,
                background: tint(shifted ? BAD : GOOD, 12),
              }}
            >
              {shifted ? (
                <>
                  <AlertTriangle className="h-3 w-3" /> layout shifted! (CLS)
                </>
              ) : (
                <>
                  <Check className="h-3 w-3" /> stable — no shift
                </>
              )}
            </span>
          )}
        </div>

        <div className="rounded-lg border border-line bg-panel p-3">
          <h4 className="text-sm font-semibold text-text">Weekly Deals</h4>

          {/* the region that shifts: image slot + Buy row + text */}
          <div className="relative mt-2">
            {/* image slot — its height animates, pushing everything below */}
            <motion.div
              initial={false}
              animate={{ height: reservedHeight }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
              className="rounded-md"
            >
              {loaded ? (
                <div
                  className="grid h-full w-full place-items-center rounded-md"
                  style={{
                    height: RES,
                    background: tint(color, 22),
                    border: `1px solid ${tint(color, 40)}`,
                  }}
                >
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-dim">
                    <ImageIcon className="h-4 w-4" style={{ color }} /> 800 × 450
                  </span>
                </div>
              ) : (
                <div
                  className="grid w-full place-items-center rounded-md border border-dashed border-line-soft bg-bg-2"
                  style={{ height: RES }}
                >
                  <span className="font-mono text-[11px] text-faint">
                    reserving space…
                  </span>
                </div>
              )}
            </motion.div>

            {/* ghost of where the Buy button was, before the shift */}
            {shifted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute right-0 top-0 flex h-8 w-[92px] items-center justify-center gap-1 rounded-md border border-dashed text-[9px] font-medium"
                style={{ borderColor: BAD, background: tint(BAD, 12), color: BAD }}
              >
                <MousePointerClick className="h-3 w-3" /> you tapped here
              </motion.div>
            )}

            {/* Buy row — pushed down when the image slot grows */}
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-sm text-text">$29</span>
              <span
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-bg"
                style={{ background: color }}
              >
                Buy now
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-dim">
              Limited-time bundle. Free returns within 30 days on every order.
            </p>
          </div>
        </div>
      </div>

      {/* vitals readouts — value + text label + icon, never colour alone */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {vitals.map((vit) => {
          const c = vit.ok === null ? "var(--color-faint)" : vit.ok ? GOOD : BAD;
          return (
            <div
              key={vit.k}
              className="rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2"
            >
              <div className="text-[10px] uppercase tracking-widest text-faint">
                {vit.k}
              </div>
              <div className="mt-0.5 font-mono text-sm text-text">{vit.v}</div>
              <div
                className="mt-0.5 inline-flex items-center gap-1 text-[11px]"
                style={{ color: c }}
              >
                {vit.ok === null ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : vit.ok ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {vit.note}
              </div>
            </div>
          );
        })}
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
