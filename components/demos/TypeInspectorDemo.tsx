"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Sample = {
  label: string;
  literal: string;
  typeofResult: string;
  primitive: boolean;
  mutable: boolean;
  note: string;
};

// Grounded in JavaScript's type system (the reference for this lesson), but the
// primitive-vs-object divide it illustrates is near-universal across languages.
const SAMPLES: Sample[] = [
  {
    label: "42",
    literal: "42",
    typeofResult: "number",
    primitive: true,
    mutable: false,
    note: "Every number — integer or decimal — is the one 'number' type: a 64-bit floating-point value.",
  },
  {
    label: '"hi"',
    literal: '"hi"',
    typeofResult: "string",
    primitive: true,
    mutable: false,
    note: "Text. Strings are immutable — methods like toUpperCase() return a NEW string, they never edit the original.",
  },
  {
    label: "true",
    literal: "true",
    typeofResult: "boolean",
    primitive: true,
    mutable: false,
    note: "A boolean is one of exactly two values: true or false. It's what conditions ultimately test.",
  },
  {
    label: "null",
    literal: "null",
    typeofResult: "object",
    primitive: true,
    mutable: false,
    note: 'An intentional "no value here". typeof null is "object" — a famous, permanent bug in JavaScript; null is really its own type. Test it with x === null.',
  },
  {
    label: "undefined",
    literal: "undefined",
    typeofResult: "undefined",
    primitive: true,
    mutable: false,
    note: "A variable that exists but was never given a value. Conceptually distinct from null: 'not set yet' vs 'deliberately empty'.",
  },
  {
    label: "42n",
    literal: "42n",
    typeofResult: "bigint",
    primitive: true,
    mutable: false,
    note: "A BigInt: an integer with no size limit, for values beyond number's safe range. You can't mix it with a plain number in arithmetic.",
  },
  {
    label: "Symbol()",
    literal: 'Symbol("id")',
    typeofResult: "symbol",
    primitive: true,
    mutable: false,
    note: "A guaranteed-unique value, mostly used as a collision-proof object key. Two symbols are never equal, even with the same description.",
  },
  {
    label: "{ }",
    literal: "{ a: 1 }",
    typeofResult: "object",
    primitive: false,
    mutable: true,
    note: "An object: a mutable collection of key/value pairs. Variables hold a reference to it, so two names can share — and mutate — the same object.",
  },
  {
    label: "[ ]",
    literal: "[1, 2, 3]",
    typeofResult: "object",
    primitive: false,
    mutable: true,
    note: 'An array is just a specialized object — typeof returns "object", not "array". Use Array.isArray() to detect one.',
  },
  {
    label: "() => {}",
    literal: "() => {}",
    typeofResult: "function",
    primitive: false,
    mutable: true,
    note: 'A function is a callable object — the one non-primitive that typeof reports specially, as "function".',
  },
];

export default function TypeInspectorDemo({ color }: { color: string }) {
  const [key, setKey] = useState(0);
  const s = SAMPLES[key];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        What kind of value is this? Ask typeof
      </h3>
      <p className="mt-1 text-sm text-dim">
        Pick a value and see the type the language reports — and whether it&apos;s a
        primitive (immutable, copied) or an object (mutable, shared).
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SAMPLES.map((sample, i) => {
          const on = i === key;
          return (
            <button
              key={sample.label}
              onClick={() => setKey(i)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {sample.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <pre className="overflow-x-auto font-mono text-sm text-dim">
          <span className="text-faint">typeof </span>
          <span className="text-text">{s.literal}</span>
          <span className="text-faint"> === </span>
          <span style={{ color }}>&quot;{s.typeofResult}&quot;</span>
        </pre>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className="rounded-lg border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: tint(color, 45),
              background: tint(color, 12),
              color,
            }}
          >
            {s.primitive ? "primitive value" : "object (reference type)"}
          </span>
          <span
            className="rounded-lg border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: "var(--color-line)", color: "var(--color-dim)" }}
          >
            {s.mutable ? "mutable" : "immutable"}
          </span>
          <span
            className="rounded-lg border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: "var(--color-line)", color: "var(--color-dim)" }}
          >
            {s.primitive ? "copied by value" : "shared by reference"}
          </span>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {s.note}
      </p>
    </div>
  );
}
