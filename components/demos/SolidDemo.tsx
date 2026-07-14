"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Principle = {
  letter: string;
  name: string;
  meaning: string;
  smell: string;
  fix: string;
  snippet: string;
};

const PRINCIPLES: Principle[] = [
  {
    letter: "S",
    name: "Single Responsibility",
    meaning: "A class should have one reason to change.",
    smell: "A User class that also formats reports and sends email.",
    fix: "Split it into User, ReportFormatter, and Mailer — each with one job.",
    snippet:
      "// smell\nclass User {\n  save() {}\n  toReport() {}   // formatting\n  sendEmail() {}   // delivery\n}\n\n// fix\nclass User { save() {} }\nclass ReportFormatter { format(u) {} }\nclass Mailer { send(u) {} }",
  },
  {
    letter: "O",
    name: "Open/Closed",
    meaning: "Open for extension, closed for modification.",
    smell: "A giant switch on shape type that you edit for every new shape.",
    fix: "Add new shapes as classes implementing a Shape interface — no switch to touch.",
    snippet:
      "// smell\nfunction area(s) {\n  switch (s.type) {\n    case 'circle': return ...\n    case 'square': return ...\n  } // edit me for each new shape\n}\n\n// fix\ninterface Shape { area(): number }\nclass Circle implements Shape { area() {} }\nclass Square implements Shape { area() {} }",
  },
  {
    letter: "L",
    name: "Liskov Substitution",
    meaning: "A subtype must work anywhere its base type does, without surprises.",
    smell: "A Square subclass of Rectangle that breaks setWidth/setHeight expectations.",
    fix: "Don't force the inheritance — model Square and Rectangle as separate Shapes.",
    snippet:
      "// smell\nclass Rectangle { setWidth(w) {} setHeight(h) {} }\nclass Square extends Rectangle {\n  setWidth(w) { this.w = this.h = w } // surprise!\n}\n\n// fix: no forced 'is-a'\ninterface Shape { area(): number }\nclass Rectangle implements Shape { area() {} }\nclass Square implements Shape { area() {} }",
  },
  {
    letter: "I",
    name: "Interface Segregation",
    meaning: "Many small interfaces beat one fat one.",
    smell: "A Worker interface forcing eat() onto a RobotWorker that never eats.",
    fix: "Split into Workable and Feedable — each type implements only what it needs.",
    snippet:
      "// smell\ninterface Worker { work(): void; eat(): void }\nclass Robot implements Worker {\n  work() {}\n  eat() {} // meaningless\n}\n\n// fix\ninterface Workable { work(): void }\ninterface Feedable { eat(): void }\nclass Robot implements Workable { work() {} }",
  },
  {
    letter: "D",
    name: "Dependency Inversion",
    meaning: "Depend on abstractions, not concretions.",
    smell: "An OrderService that news up a MySQLDatabase directly inside itself.",
    fix: "Inject a Repository interface — the service never names a concrete database.",
    snippet:
      "// smell\nclass OrderService {\n  db = new MySQLDatabase(); // locked in\n}\n\n// fix\ninterface Repository { save(o): void }\nclass OrderService {\n  constructor(private repo: Repository) {}\n}",
  },
];

export default function SolidDemo({ color }: { color: string }) {
  const [letter, setLetter] = useState("S");
  const active = PRINCIPLES.find((p) => p.letter === letter) ?? PRINCIPLES[0];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">SOLID, one letter at a time</h3>
      <p className="mt-1 text-sm text-dim">
        Five principles for classes that stay easy to change. Pick a letter to
        see what it means, the smell to watch for, and the fix.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PRINCIPLES.map((p) => {
          const on = p.letter === letter;
          return (
            <button
              key={p.letter}
              onClick={() => setLetter(p.letter)}
              aria-pressed={on}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              <span className="font-mono">{p.letter}</span>
              <span className="ml-1.5 hidden sm:inline">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl font-mono text-3xl font-bold"
          style={{ background: tint(color, 12), color, border: `1px solid ${tint(color, 45)}` }}
        >
          {active.letter}
        </span>
        <div>
          <p className="text-base font-semibold text-text">{active.name}</p>
          <p className="mt-0.5 text-sm text-dim">{active.meaning}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            smell
          </p>
          <p className="mt-1 text-sm text-dim">{active.smell}</p>
        </div>
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: tint(color, 35), background: tint(color, 8) }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color }}
          >
            fix
          </p>
          <p className="mt-1 text-sm text-dim">{active.fix}</p>
        </div>
      </div>

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
        {active.snippet}
      </pre>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        <span className="font-mono font-semibold" style={{ color }}>
          {active.letter}
        </span>{" "}
        — {active.name}: {active.meaning}
      </p>
    </div>
  );
}
