"use client";

import { useState } from "react";
import { type LucideIcon, ArrowRight, Clock, Cpu, FileImage, FileJson } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

// A deliberately slow link so the byte savings show up as time. 1 Mbps ≈ 125 KB/s.
const LINK_KBPS = 125;
const LINK_LABEL = "1 Mbps";

type Content = {
  key: string;
  label: string;
  Icon: LucideIcon;
  originalKB: number;
  gzipKB: number;
  brotliKB: number;
  cpuMs: number; // cost to compress + decompress
  worth: boolean;
};

const CONTENTS: Content[] = [
  {
    key: "text",
    label: "Repetitive text / JSON",
    Icon: FileJson,
    originalKB: 100,
    gzipKB: 15,
    brotliKB: 12,
    cpuMs: 9,
    worth: true,
  },
  {
    key: "binary",
    label: "Already-compressed (JPEG / zip)",
    Icon: FileImage,
    originalKB: 100,
    gzipKB: 99,
    brotliKB: 98,
    cpuMs: 7,
    worth: false,
  },
];

function transferMs(kb: number): number {
  return Math.round((kb / LINK_KBPS) * 1000);
}

export default function CompressionDemo({ color }: { color: string }) {
  const [key, setKey] = useState("text");

  const c = CONTENTS.find((x) => x.key === key) ?? CONTENTS[0];
  const savings = Math.round((1 - c.brotliKB / c.originalKB) * 100);
  const upTime = transferMs(c.originalKB);
  const cpTime = transferMs(c.brotliKB) + c.cpuMs;
  const speedup = Math.round((upTime / cpTime) * 10) / 10;
  const barPct = Math.round((c.brotliKB / c.originalKB) * 100);
  const badge = c.worth ? GOOD : WARN;

  const status = c.worth
    ? `Worth it: this payload compresses from ${c.originalKB} KB to ${c.brotliKB} KB (${savings}% smaller). Over a slow ${LINK_LABEL} link it now arrives about ${speedup}x faster (${upTime} ms to ${cpTime} ms). Compressing and decompressing costs only ~${c.cpuMs} ms of CPU — a tiny price for the bytes saved. That trade is why servers gzip or brotli text, JSON, HTML, CSS and JS by default.`
    : `Not worth it: already-compressed data has almost no repetition left, so it shrinks just ${savings}% (${c.originalKB} KB to ${c.brotliKB} KB). You still spend ~${c.cpuMs} ms of CPU to compress, yet transfer time barely moves (${upTime} ms to ${cpTime} ms). Compressing JPEG, video or zip files trades CPU for nothing — send them as-is.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Compression trades CPU for bytes</h3>
      <p className="mt-1 text-sm text-dim">
        The same 100 KB payload sent over a slow link. Compressing it can shrink the
        transfer dramatically — or just waste CPU. It depends on what is inside.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {CONTENTS.map((opt) => {
          const on = opt.key === key;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.key}
              onClick={() => setKey(opt.key)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-xs">
              <span className="text-faint">Original</span>
              <span className="text-dim">{c.originalKB} KB</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md border border-line bg-bg-2">
              <div className="h-full w-full" style={{ background: tint(color, 22) }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-xs">
              <span className="text-faint">Compressed (brotli)</span>
              <span className="text-dim">{c.brotliKB} KB</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-md border border-line bg-bg-2">
              <div
                className="h-full rounded-r-md transition-all duration-500"
                style={{ width: `${barPct}%`, background: tint(badge, 55) }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[11px]" style={{ color: badge }}>
              {savings}% smaller {c.worth ? "— a big win" : "— barely any gain"}
              <span className="text-faint"> · gzip {c.gzipKB} KB · brotli {c.brotliKB} KB</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-line-soft bg-bg-2/40 p-2.5">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-faint">
            <Clock className="h-3 w-3" /> raw
          </div>
          <div className="mt-1 font-mono text-sm text-text">{upTime} ms</div>
          <div className="text-[10px] text-faint">on a {LINK_LABEL} link</div>
        </div>
        <div className="rounded-lg border p-2.5" style={{ borderColor: tint(badge, 35), background: tint(badge, 8) }}>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest" style={{ color: badge }}>
            <ArrowRight className="h-3 w-3" /> compressed
          </div>
          <div className="mt-1 font-mono text-sm text-text">{cpTime} ms</div>
          <div className="text-[10px] text-faint">transfer + CPU</div>
        </div>
        <div className="rounded-lg border border-line-soft bg-bg-2/40 p-2.5">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-faint">
            <Cpu className="h-3 w-3" /> cpu cost
          </div>
          <div className="mt-1 font-mono text-sm text-text">~{c.cpuMs} ms</div>
          <div className="text-[10px] text-faint">compress + decompress</div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
