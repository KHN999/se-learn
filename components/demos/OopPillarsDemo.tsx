"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Pillar = {
  key: string;
  label: string;
  definition: string;
  code: string;
  buys: string;
};

const PILLARS: Pillar[] = [
  {
    key: "encapsulation",
    label: "Encapsulation",
    definition:
      "Bundle data with the methods that guard it, and hide the internals behind a public interface.",
    code: `class BankAccount {
  #balance = 0;              // private — no outside tampering

  deposit(amount) {
    if (amount <= 0) throw new Error("must be positive");
    this.#balance += amount;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("insufficient funds");
    this.#balance -= amount;
  }

  get balance() { return this.#balance; }
}`,
    buys: "Buys you: the invariants (like “balance never goes negative”) can't be broken from outside.",
  },
  {
    key: "inheritance",
    label: "Inheritance",
    definition: "A subclass reuses and extends the behavior of a base class.",
    code: `class Animal {
  speak() { return "..."; }
}

class Dog extends Animal {
  speak() { return "Woof"; }   // reuse + extend
}

new Dog().speak();  // "Woof"`,
    buys:
      "Buys you: shared common behavior — but favor composition when the “is-a” relationship is shaky.",
  },
  {
    key: "polymorphism",
    label: "Polymorphism",
    definition:
      "One interface, many implementations: call the same method on different types.",
    code: `const shapes = [
  { area: () => Math.PI * 2 * 2 },   // circle
  { area: () => 3 * 3 },             // square
];

shapes.forEach(s => console.log(s.area()));
// each type answers area() its own way`,
    buys: "Buys you: add new shape types later without touching the calling code.",
  },
  {
    key: "abstraction",
    label: "Abstraction",
    definition: "Expose the essential; hide the how.",
    code: `const list = [3, 1, 2];
list.sort();   // [1, 2, 3]

// you asked for "sorted" — you never
// picked or wrote the sort algorithm`,
    buys: "Buys you: use things by what they do, without knowing their internals.",
  },
];

export default function OopPillarsDemo({ color }: { color: string }) {
  const [key, setKey] = useState("encapsulation");
  const pillar = PILLARS.find((p) => p.key === key) ?? PILLARS[0];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">The four pillars of OOP</h3>
      <p className="mt-1 text-sm text-dim">
        Object-oriented design rests on four ideas. Pick one to see a plain
        definition, a short snippet, and what it actually buys you.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PILLARS.map((p) => {
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

      <p className="mt-4 text-sm leading-relaxed text-text">{pillar.definition}</p>

      <pre className="thin-scroll mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
        {pillar.code}
      </pre>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {pillar.buys}
      </p>
    </div>
  );
}
