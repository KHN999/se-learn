"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { tint } from "@/lib/curriculum";

const WIDTH = 120; // the value the `width` property is set to (fixed)

type Layer = { key: string; label: string; strength: number; value: number };

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-dim">{label}</span>
      <button
        onClick={onDec}
        aria-label={`decrease ${label}`}
        className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-12 text-center font-mono text-sm text-text">{value}px</span>
      <button
        onClick={onInc}
        aria-label={`increase ${label}`}
        className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim hover:text-text"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function BoxModelDemo({ color }: { color: string }) {
  const [padding, setPadding] = useState(16);
  const [border, setBorder] = useState(6);
  const [margin, setMargin] = useState(12);
  const [boxSizing, setBoxSizing] = useState<"content-box" | "border-box">(
    "content-box",
  );

  // Derived values, computed during render (never via useEffect).
  const extra = 2 * (padding + border);
  const clamped = boxSizing === "border-box" && WIDTH - extra < 0;
  const contentWidth =
    boxSizing === "border-box" ? Math.max(0, WIDTH - extra) : WIDTH;
  const totalWidth = contentWidth + extra; // border edge to border edge
  const footprint = totalWidth + 2 * margin; // space it claims, incl. margin

  const legend: Layer[] = [
    { key: "margin", label: "margin", strength: 8, value: margin },
    { key: "border", label: "border", strength: 20, value: border },
    { key: "padding", label: "padding", strength: 34, value: padding },
    { key: "content", label: "content", strength: 58, value: contentWidth },
  ];

  const status =
    boxSizing === "content-box"
      ? `box-sizing: content-box — width (${WIDTH}px) sizes only the content, so the browser ADDS 2×(padding + border) = ${extra}px on top. The rendered box is ${WIDTH} + ${extra} = ${totalWidth}px, and the ${margin}px margin on each side pushes neighbors a further ${2 * margin}px out (total footprint ${footprint}px).`
      : `box-sizing: border-box — width (${WIDTH}px) already INCLUDES padding and border, so the content shrinks to ${WIDTH} − ${extra} = ${contentWidth}px${
          clamped ? " (clamped at 0 — padding + border alone exceed the width, so the box has to grow)" : ""
        } and the rendered box stays ${totalWidth}px. Margin still adds ${2 * margin}px of outside space (total footprint ${footprint}px).`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The box model: where the extra pixels come from
      </h3>
      <p className="mt-1 text-sm text-dim">
        The content stays a fixed {WIDTH}px wide. Add padding, border, and margin,
        then flip box-sizing — watch what happens to the total width.
      </p>

      {/* controls */}
      <div className="mt-4 flex flex-col gap-2.5">
        <Stepper
          label="padding"
          value={padding}
          onDec={() => setPadding((v) => Math.max(0, v - 4))}
          onInc={() => setPadding((v) => Math.min(40, v + 4))}
        />
        <Stepper
          label="border"
          value={border}
          onDec={() => setBorder((v) => Math.max(0, v - 2))}
          onInc={() => setBorder((v) => Math.min(20, v + 2))}
        />
        <Stepper
          label="margin"
          value={margin}
          onDec={() => setMargin((v) => Math.max(0, v - 4))}
          onInc={() => setMargin((v) => Math.min(40, v + 4))}
        />
        <div className="mt-1 flex items-center gap-2">
          <span className="w-16 text-xs text-dim">box-sizing</span>
          <div className="inline-flex rounded-lg border border-line p-0.5">
            {(["content-box", "border-box"] as const).map((mode) => {
              const on = boxSizing === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setBoxSizing(mode)}
                  aria-pressed={on}
                  className="rounded-md px-2.5 py-1 font-mono text-xs transition-colors"
                  style={on ? { background: tint(color, 16), color } : { color: "var(--color-dim)" }}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* nested box visual */}
      <div className="thin-scroll mt-4 flex justify-center overflow-x-auto rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div
          style={{ padding: margin, background: tint(color, 8), borderRadius: 14, outline: `1px dashed ${tint(color, 35)}` }}
        >
          <div style={{ padding: border, background: tint(color, 20), borderRadius: 10 }}>
            <div style={{ padding, background: tint(color, 34), borderRadius: 7 }}>
              <div
                style={{ width: contentWidth, background: tint(color, 58), borderRadius: 4 }}
                className="grid min-h-[52px] place-items-center px-1 text-center"
              >
                <span className="font-mono text-[11px] leading-tight text-text">
                  content
                  <br />
                  {contentWidth}px
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* legend — swatch + text, never colour alone */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map((l) => (
          <span key={l.key} className="inline-flex items-center gap-1.5 text-xs text-dim">
            <span
              className="h-3 w-3 rounded-sm border border-line-soft"
              style={{ background: tint(color, l.strength) }}
            />
            {l.label} <span className="font-mono text-faint">{l.value}px</span>
          </span>
        ))}
      </div>

      {/* numeric readout */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { k: "width property", v: `${WIDTH}px` },
          { k: "content width", v: `${contentWidth}px` },
          { k: "total width", v: `${totalWidth}px` },
          { k: "with margin", v: `${footprint}px` },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-faint">{s.k}</div>
            <div className="font-mono text-sm text-text">{s.v}</div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
