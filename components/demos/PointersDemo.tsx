"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const OBJ1 = "0x1A4";
const OBJ2 = "0x2C8";

type Action = "init" | "mutate" | "reassign" | "primitive";

export default function PointersDemo({ color }: { color: string }) {
  // a always points at OBJ1. b starts there too, then can be repointed.
  const [bAddr, setBAddr] = useState(OBJ1);
  const [n1, setN1] = useState(1); // value of the object at 0x1A4
  const [n2, setN2] = useState(0); // value of the object at 0x2C8
  const [y, setY] = useState(5); // primitive: y = x, then maybe y = 6
  const [last, setLast] = useState<Action>("init");

  const allocated = bAddr === OBJ2;

  const mutate = () => {
    if (bAddr === OBJ1) setN1(9);
    else setN2(9);
    setLast("mutate");
  };
  const reassign = () => {
    setBAddr(OBJ2);
    setN2(0);
    setLast("reassign");
  };
  const toggleY = () => {
    setY((v) => (v === 6 ? 5 : 6));
    setLast("primitive");
  };
  const reset = () => {
    setBAddr(OBJ1);
    setN1(1);
    setN2(0);
    setY(5);
    setLast("init");
  };

  // Which variable names currently hold each address.
  const refsTo = (addr: string) => {
    const names: string[] = [];
    if (addr === OBJ1) names.push("a");
    if (bAddr === addr) names.push("b");
    return names;
  };

  const chip =
    "rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-colors";
  const accentStyle = {
    background: tint(color, 16),
    color,
    borderColor: tint(color, 45),
  };

  const status = (() => {
    if (last === "mutate") {
      if (bAddr === OBJ1) {
        return `Mutating through b changed the object at ${OBJ1}. a holds that same address, so a.n is now ${n1} too — one object, seen through two names.`;
      }
      return `b now holds ${OBJ2}, so b.n = 9 only touched that object (n is ${n2}). a still holds ${OBJ1}, so a.n stays ${n1}.`;
    }
    if (last === "reassign") {
      return `Reassigning b repointed just that one name to a new address (${OBJ2}). a still holds ${OBJ1}, so a is unchanged — you moved the pointer, not the target it referred to.`;
    }
    if (last === "primitive") {
      return `y = x copied the value 5 into a separate box, not a link to x. Setting y to ${y} leaves x at 5, because primitives are copied by value.`;
    }
    return `a and b both hold the address ${OBJ1}: two names for one object. x and y are primitives, each copied by value into its own box.`;
  })();

  const objectBox = (addr: string, n: number, live: boolean) => {
    const names = live ? refsTo(addr) : [];
    const shared = names.length > 1;
    const flagged = last === "mutate" && addr === bAddr && shared;
    const boxStyle = !live
      ? { borderColor: "var(--color-line-soft)", background: "transparent" }
      : flagged
        ? { borderColor: WARN, background: tint(WARN, 12) }
        : names.length > 0
          ? { borderColor: color, background: tint(color, 8) }
          : { borderColor: "var(--color-line)", background: "transparent" };
    return (
      <div className="rounded-lg border px-3 py-2" style={boxStyle}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-faint">{addr}</span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{
              color: flagged ? WARN : names.length > 0 ? color : undefined,
            }}
          >
            {live
              ? names.length > 0
                ? `held by ${names.join(", ")}`
                : "unreferenced"
              : "not allocated"}
          </span>
        </div>
        <div className="mt-1 font-mono text-sm text-text">
          {live ? `{ n: ${n} }` : "reassign b to allocate"}
        </div>
      </div>
    );
  };

  const varBox = (name: string, addr: string) => {
    const shared = refsTo(addr).length > 1;
    return (
      <div
        className="flex items-center justify-between rounded-lg border px-3 py-2"
        style={{
          borderColor: shared ? color : "var(--color-line)",
          background: shared ? tint(color, 8) : "transparent",
        }}
      >
        <span className="font-mono text-sm text-text">{name}</span>
        <span
          className="inline-flex items-center gap-1 font-mono text-xs"
          style={{ color }}
        >
          <ArrowRight className="h-3 w-3" /> {addr}
        </span>
      </div>
    );
  };

  const primBox = (name: string, value: number) => (
    <div
      className="flex items-center justify-between rounded-lg border px-3 py-2"
      style={{ borderColor: tint(GOOD, 45), background: tint(GOOD, 8) }}
    >
      <span className="font-mono text-sm text-text">{name}</span>
      <span className="font-mono text-xs" style={{ color: GOOD }}>
        = {value}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Pointers and references: a name holds an address, not the value
      </h3>
      <p className="mt-1 text-sm text-dim">
        a and b are two names for one object; x and y are separate primitive
        copies. Change things and watch what each name sees.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={mutate} className={chip} style={accentStyle} aria-label="Mutate the object through b, set n to 9">
          b.n = 9
        </button>
        <button
          onClick={reassign}
          disabled={allocated}
          aria-label="Reassign b to a brand new object at a new address"
          className={`${chip} disabled:opacity-40`}
          style={accentStyle}
        >
          b = {"{ n: 0 }"}
        </button>
        <button
          onClick={reset}
          aria-label="Reset the diagram"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            variables (names hold addresses)
          </p>
          <div className="flex flex-col gap-2">
            {varBox("a", OBJ1)}
            {varBox("b", bAddr)}
          </div>
        </div>
        <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
            heap (the actual objects)
          </p>
          <div className="flex flex-col gap-2">
            {objectBox(OBJ1, n1, true)}
            {objectBox(OBJ2, n2, allocated)}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            primitives (copied by value)
          </p>
          <button
            onClick={toggleY}
            aria-pressed={y === 6}
            aria-label="Toggle y between 5 and 6"
            className={chip}
            style={
              y === 6
                ? { background: tint(GOOD, 16), color: GOOD, borderColor: tint(GOOD, 45) }
                : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
            }
          >
            y = 6
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {primBox("x", 5)}
          {primBox("y", y)}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        A reference can also hold{" "}
        <span className="font-mono" style={{ color: BAD }}>
          null
        </span>{" "}
        — it points at nothing, so reading .n through it is the classic
        null-pointer crash (a dangling reference is worse: it points at memory
        that has already been freed).
      </p>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
