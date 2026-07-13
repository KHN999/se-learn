"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BASE = [14, 9, 22, 7, 30];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ArrayDemo({ color }: { color: string }) {
  const [arr, setArr] = useState<number[]>(BASE);
  const [hi, setHi] = useState<number | null>(null);
  const [shiftFrom, setShiftFrom] = useState<number | null>(null);
  const [idx, setIdx] = useState("2");
  const [val, setVal] = useState("5");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "Access by index is one step. Inserting at the front moves everything.",
  );
  const tok = useRef(0);

  function get() {
    const i = parseInt(idx, 10);
    if (isNaN(i) || i < 0 || i >= arr.length) {
      setNote(`Index ${idx} is out of range (0–${arr.length - 1}).`);
      return;
    }
    tok.current++;
    setShiftFrom(null);
    setBusy(false);
    setHi(i);
    setNote(`arr[${i}] = ${arr[i]} — jumped straight there in one step (O(1)).`);
  }

  async function insertFront() {
    const v = parseInt(val, 10);
    if (isNaN(v)) return;
    const token = ++tok.current;
    setHi(null);
    setBusy(true);
    const n = arr.length;
    for (let i = n - 1; i >= 0; i--) {
      if (tok.current !== token) return;
      setShiftFrom(i);
      await sleep(220);
    }
    if (tok.current !== token) return;
    setArr((a) => [v, ...a]);
    setShiftFrom(null);
    setBusy(false);
    setNote(`Inserted ${v} at the front — all ${n} elements shifted right one slot (O(n)).`);
  }

  function push() {
    const v = parseInt(val, 10);
    if (isNaN(v)) return;
    tok.current++;
    setShiftFrom(null);
    setArr((a) => {
      setHi(a.length);
      return [...a, v];
    });
    setNote(`Pushed ${v} at the end — no shifting, one step (O(1)).`);
  }

  function reset() {
    tok.current++;
    setArr(BASE);
    setHi(null);
    setShiftFrom(null);
    setBusy(false);
    setNote("Access by index is one step. Inserting at the front moves everything.");
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Array — instant by index, costly to shift
      </h3>
      <p className="mt-1 text-sm text-dim">
        Values sit back-to-back, so index access is one step. But inserting at
        the front has to move everything after it.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">get index</span>
        <input
          value={idx}
          onChange={(e) => setIdx(e.target.value)}
          aria-label="index to get"
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={get}
          disabled={busy}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          get
        </button>
        <span className="mx-1 h-4 w-px bg-line" />
        <span className="font-mono text-xs text-faint">value</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          aria-label="value to insert"
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={insertFront}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          insert at front
        </button>
        <button
          onClick={push}
          disabled={busy}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          push (end)
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="thin-scroll mt-6 flex items-end gap-1.5 overflow-x-auto py-2">
        {arr.map((v, i) => {
          const accessed = hi === i;
          const shifting = shiftFrom !== null && i >= shiftFrom;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border font-mono text-sm transition-colors"
                style={
                  accessed
                    ? { borderColor: color, background: tint(color, 16), color: "var(--color-text)" }
                    : shifting
                      ? { borderColor: "var(--color-warn)", background: tint("#f5b13d", 14), color: "var(--color-text)" }
                      : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                }
              >
                {v}
              </div>
              <span className="font-mono text-[10px] text-faint">{i}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-dim">{note}</p>
    </div>
  );
}
