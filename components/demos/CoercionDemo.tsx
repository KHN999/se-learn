"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Type } from "lucide-react";
import { tint } from "@/lib/curriculum";

export default function CoercionDemo({ color }: { color: string }) {
  const [value, setValue] = useState("30");
  const [asNumber, setAsNumber] = useState(false);

  const n = Number(value);
  const nan = asNumber && (value.trim() === "" || Number.isNaN(n));

  const storedValue = asNumber
    ? nan
      ? "NaN"
      : String(n)
    : `"${value}"`;
  const detectedType = asNumber ? (nan ? "number (NaN)" : "number") : "string";
  const operation = asNumber
    ? "addition — + adds numbers"
    : "concatenation — + joins text";
  const result = asNumber ? (nan ? "NaN" : String(n + 1)) : `"${value}1"`;

  const rows = [
    { k: "Variable", v: "age" },
    { k: "Stored value", v: storedValue },
    { k: "Detected type", v: detectedType },
    { k: "Operation (age + 1)", v: operation },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4" style={{ color }} />
        <h3 className="font-semibold text-text">Try it: what is age + 1?</h3>
      </div>
      <p className="mt-1 text-sm text-dim">
        Change the value, then flip how it&apos;s treated. The + never changes —
        the type decides what it means.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-mono text-faint">age =</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="value for age"
            className="w-28 rounded-lg border border-line bg-bg-2 px-2.5 py-1.5 font-mono text-sm text-text focus:outline-none"
          />
        </label>
        <div className="flex overflow-hidden rounded-lg border border-line">
          {[
            { on: false, label: "as text" },
            { on: true, label: "as number" },
          ].map((opt) => {
            const active = asNumber === opt.on;
            return (
              <button
                key={opt.label}
                onClick={() => setAsNumber(opt.on)}
                aria-pressed={active}
                className="px-3 py-1.5 text-xs transition-colors"
                style={
                  active
                    ? { background: tint(color, 16), color }
                    : { color: "var(--color-faint)" }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <pre className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {`age = ${asNumber ? (value.trim() === "" ? "0" : value) : `"${value}"`}\nage + 1`}
      </pre>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex items-center justify-between rounded-lg border border-line-soft bg-bg-2/60 px-3 py-2"
          >
            <span className="font-mono text-xs text-faint">{r.k}</span>
            <span className="font-mono text-sm text-dim">{r.v}</span>
          </div>
        ))}
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border p-4"
        style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
      >
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color }}
        >
          result
        </span>
        <ArrowRight className="h-4 w-4 text-faint" />
        <motion.span
          key={result}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-lg font-semibold text-text"
        >
          {result}
        </motion.span>
        {nan && (
          <span className="text-xs text-warn">
            — that text isn&apos;t a number
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">
        {asNumber
          ? "Treated as a number, + adds — you get a number back."
          : 'Treated as text, + concatenates — the 1 is stuck on the end. That is coercion, and the source of the "301" bug.'}
      </p>
    </div>
  );
}
