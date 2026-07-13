"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, Cake, Plus, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const PRESETS = [
  { name: "Ada", age: 35 },
  { name: "Grace", age: 28 },
  { name: "Alan", age: 41 },
  { name: "Edsger", age: 52 },
];

const CODE = `class User {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  haveBirthday() {
    this.age = this.age + 1
  }
}`;

type Inst = { id: number; name: string; age: number };

export default function ClassInstanceDemo({ color }: { color: string }) {
  const [instances, setInstances] = useState<Inst[]>([
    { id: 0, name: "Ada", age: 35 },
  ]);
  const [nextIdx, setNextIdx] = useState(1);
  const [nextId, setNextId] = useState(1);
  const [lastId, setLastId] = useState<number | null>(null);

  function add() {
    const p = PRESETS[nextIdx % PRESETS.length];
    setInstances((xs) => [...xs, { id: nextId, name: p.name, age: p.age }]);
    setNextIdx((i) => i + 1);
    setNextId((i) => i + 1);
  }
  function birthday(id: number) {
    setInstances((xs) =>
      xs.map((x) => (x.id === id ? { ...x, age: x.age + 1 } : x)),
    );
    setLastId(id);
  }
  function reset() {
    setInstances([{ id: 0, name: "Ada", age: 35 }]);
    setNextIdx(1);
    setNextId(1);
    setLastId(null);
  }

  const last = instances.find((x) => x.id === lastId);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Boxes className="h-4 w-4" style={{ color }} />
        <h3 className="font-semibold text-text">One blueprint, many objects</h3>
      </div>
      <p className="mt-1 text-sm text-dim">
        The class on the left is a blueprint. Make objects from it — each keeps
        its own data. Call a method and watch{" "}
        <span className="font-mono text-text">this</span> point at the object you
        called it on.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            class (blueprint)
          </p>
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
            {CODE}
          </pre>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              objects (instances)
            </p>
            <button
              onClick={add}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-line px-2 py-1 text-xs text-faint transition-colors hover:text-dim"
            >
              <Plus className="h-3 w-3" /> new User
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {instances.map((it) => {
              const active = it.id === lastId;
              return (
                <div
                  key={it.id}
                  className="rounded-lg border p-3"
                  style={
                    active
                      ? { borderColor: color, background: tint(color, 8) }
                      : { borderColor: "var(--color-line)" }
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-text">
                      {it.name}
                    </span>
                    {active && (
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color }}
                      >
                        this
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between font-mono text-xs">
                    <span className="text-faint">age</span>
                    <motion.span
                      key={it.age}
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-text"
                    >
                      {it.age}
                    </motion.span>
                  </div>
                  <button
                    onClick={() => birthday(it.id)}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-bg transition-transform hover:-translate-y-0.5"
                    style={{ background: color }}
                  >
                    <Cake className="h-3 w-3" /> haveBirthday()
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-dim">
          {last
            ? `${last.name}.haveBirthday()  →  this = ${last.name}, this.age = ${last.age}`
            : "click haveBirthday() on an object"}
        </span>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-dim">
        Calling <span className="font-mono text-text">haveBirthday()</span> on one
        object changes only that object&apos;s age. Same blueprint, separate
        state — and <span className="font-mono text-text">this</span> is whichever
        object you called the method on.
      </p>
    </div>
  );
}
