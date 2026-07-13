"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type DemoStep = {
  vars: Record<string, string>; // name -> object id
  objs: Record<string, { n: number; dead?: boolean }>;
  note: string;
};
type Scenario = {
  key: string;
  label: string;
  lines: string[];
  steps: DemoStep[];
  takeaway: string;
};

const SCENARIOS: Scenario[] = [
  {
    key: "reassign",
    label: "Reassign",
    lines: ["let a = { n: 1 }", "a = { n: 2 }"],
    steps: [
      { vars: { a: "o1" }, objs: { o1: { n: 1 } }, note: "a is a name pointing at an object." },
      {
        vars: { a: "o2" },
        objs: { o1: { n: 1, dead: true }, o2: { n: 2 } },
        note: "a now points at a NEW object. The first is unreferenced — nothing can reach it.",
      },
    ],
    takeaway: "Reassigning changes what the name points to. The old object is abandoned.",
  },
  {
    key: "mutate",
    label: "Mutate",
    lines: ["let a = { n: 1 }", "a.n = 2"],
    steps: [
      { vars: { a: "o1" }, objs: { o1: { n: 1 } }, note: "a points at an object with n = 1." },
      { vars: { a: "o1" }, objs: { o1: { n: 2 } }, note: "The SAME object changed in place — a still points at it." },
    ],
    takeaway: "Mutating changes the thing itself. The name never moved.",
  },
  {
    key: "shared",
    label: "Two names, one object",
    lines: ["let a = { n: 1 }", "let b = a", "b.n = 2"],
    steps: [
      { vars: { a: "o1" }, objs: { o1: { n: 1 } }, note: "a points at the object." },
      {
        vars: { a: "o1", b: "o1" },
        objs: { o1: { n: 1 } },
        note: "b = a copies the reference, not the object. Both names point at the same one.",
      },
      {
        vars: { a: "o1", b: "o1" },
        objs: { o1: { n: 2 } },
        note: "Change it through b, and a sees it too — it is the same object.",
      },
    ],
    takeaway: "Assigning an object shares a reference. Mutating through one name is visible through the other.",
  },
];

export default function ReferenceDemo({ color }: { color: string }) {
  const [sk, setSk] = useState("shared");
  const [step, setStep] = useState(0);
  const scenario = SCENARIOS.find((s) => s.key === sk) ?? SCENARIOS[0];
  const state = scenario.steps[step];
  const atEnd = step >= scenario.steps.length - 1;

  const varNames = Object.keys(state.vars);
  const objIds = Object.keys(state.objs);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">Reassign vs. mutate vs. share</h3>
      <p className="mt-1 text-sm text-dim">
        Pick a scenario and step through it — watch what each name points at.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SCENARIOS.map((s) => {
          const active = s.key === sk;
          return (
            <button
              key={s.key}
              onClick={() => {
                setSk(s.key);
                setStep(0);
              }}
              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
              style={
                active
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Code, current line marked */}
        <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
          {scenario.lines.map((ln, i) => (
            <div
              key={i}
              style={{
                opacity: i <= step ? 1 : 0.35,
                color: i === step ? color : "var(--color-dim)",
              }}
            >
              {i === step ? "▸ " : "  "}
              {ln}
            </div>
          ))}
        </pre>

        {/* Diagram: names -> objects */}
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-2">
              {varNames.map((name) => (
                <div key={name} className="flex items-center gap-2">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-md border font-mono text-sm text-text"
                    style={{ borderColor: color }}
                  >
                    {name}
                  </span>
                  <span className="text-faint">→</span>
                  <span className="font-mono text-[11px] text-faint">
                    {state.vars[name]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {objIds.map((id) => {
                const o = state.objs[id];
                const pointedBy = varNames.filter((v) => state.vars[v] === id);
                return (
                  <div
                    key={id}
                    className="rounded-lg border p-2.5"
                    style={{
                      borderColor: o.dead
                        ? "var(--color-line-soft)"
                        : tint(color, 45),
                      background: o.dead ? "transparent" : tint(color, 8),
                      opacity: o.dead ? 0.45 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-faint">{id}</span>
                      {o.dead && (
                        <span className="font-mono text-[10px] text-faint">
                          unreferenced
                        </span>
                      )}
                      {!o.dead && pointedBy.length > 1 && (
                        <span className="font-mono text-[10px]" style={{ color }}>
                          shared
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-mono text-sm text-text">
                      {"{ n: "}
                      <motion.span
                        key={`${id}-${o.n}`}
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ color }}
                      >
                        {o.n}
                      </motion.span>
                      {" }"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setStep((s) => Math.min(s + 1, scenario.steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          <StepForward className="h-3.5 w-3.5" />
          {atEnd ? "Done" : "Next step"}
        </button>
        <button
          onClick={() => setStep(0)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restart
        </button>
        <span className="font-mono text-[11px] text-faint">
          step {step + 1} / {scenario.steps.length}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim">{state.note}</p>
      {atEnd && (
        <p
          className="mt-2 rounded-lg border p-3 text-sm leading-relaxed text-text"
          style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
        >
          <span
            className="font-mono text-[11px] uppercase tracking-widest"
            style={{ color }}
          >
            takeaway{" "}
          </span>
          {scenario.takeaway}
        </p>
      )}
    </div>
  );
}
