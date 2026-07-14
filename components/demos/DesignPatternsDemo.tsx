"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Pattern = {
  key: string;
  label: string;
  problem: string;
  idea: string;
  snippet: string;
  caution: string;
};

const PATTERNS: Pattern[] = [
  {
    key: "strategy",
    label: "Strategy",
    problem: "You need to swap an algorithm at runtime.",
    idea: "Wrap each algorithm behind a shared interface; pick one and plug it in.",
    snippet:
      "sorter.setStrategy(quickSort);\nsorter.run(data);        // uses quickSort\n\nsorter.setStrategy(mergeSort);\nsorter.run(data);        // now uses mergeSort\n\n// the context just calls strategy.run() —\n// it never knows which algorithm it holds",
    caution: "Overkill if you'll only ever have one algorithm.",
  },
  {
    key: "observer",
    label: "Observer",
    problem: "When one object changes, many others need to know.",
    idea: "Let interested parties subscribe; the subject notifies them all on change.",
    snippet:
      "subject.subscribe(fn);   // add a listener\nsubject.notify(value);   // calls every subscriber\n\n// this is how UI event listeners and\n// pub-sub systems work under the hood",
    caution: "Watch for memory leaks from listeners you never remove.",
  },
  {
    key: "factory",
    label: "Factory",
    problem: "Object creation logic is scattered and duplicated.",
    idea: "Centralize creation behind one function that decides what to build.",
    snippet:
      "function createButton(os) {\n  if (os === 'mac') return new MacButton();\n  return new WinButton();\n}\n\nconst btn = createButton(os); // caller\n// doesn't care which class it got",
    caution: "Don't add indirection you don't need yet.",
  },
  {
    key: "singleton",
    label: "Singleton",
    problem: "You want exactly one shared instance across the whole app.",
    idea: "Hide the constructor; hand out the same instance every time.",
    snippet:
      "const a = Config.getInstance();\nconst b = Config.getInstance();\n\na === b;  // true — same object each call",
    caution:
      "It's basically global state — harder to test and reason about, and often overused.",
  },
];

export default function DesignPatternsDemo({ color }: { color: string }) {
  const [key, setKey] = useState("strategy");
  const pattern = PATTERNS.find((p) => p.key === key) ?? PATTERNS[0];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">A few patterns worth knowing</h3>
      <p className="mt-1 text-sm text-dim">
        Design patterns are named solutions to recurring problems. Learn the
        problem each one solves — do not force them in where they do not fit.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PATTERNS.map((p) => {
          const on = p.key === key;
          return (
            <button
              key={p.key}
              onClick={() => setKey(p.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            problem
          </p>
          <p className="mt-1 text-sm text-dim">{pattern.problem}</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            idea
          </p>
          <p className="mt-1 text-sm text-dim">{pattern.idea}</p>
        </div>
      </div>

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {pattern.snippet}
      </pre>

      <div
        className="mt-3 rounded-xl border px-3 py-2.5"
        style={{ borderColor: tint(color, 30), background: tint(color, 6) }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
          when not to
        </span>
        <p className="mt-0.5 text-sm text-dim">{pattern.caution}</p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {pattern.label} — {pattern.problem} {pattern.idea}
      </p>
    </div>
  );
}
