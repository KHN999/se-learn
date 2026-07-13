"use client";

import { Fragment, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BASE = [7, 3, 9];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function LinkedListDemo({ color }: { color: string }) {
  const [nodes, setNodes] = useState(BASE.map((v, i) => ({ id: i, v })));
  const [nid, setNid] = useState(BASE.length);
  const [cur, setCur] = useState<number | null>(null);
  const [found, setFound] = useState<number | null>(null);
  const [target, setTarget] = useState("9");
  const [val, setVal] = useState("5");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "Each node points to the next. Inserting at the head just rewires pointers.",
  );
  const tok = useRef(0);

  async function find() {
    const t = parseInt(target, 10);
    if (isNaN(t)) return;
    const token = ++tok.current;
    setFound(null);
    setBusy(true);
    for (let i = 0; i < nodes.length; i++) {
      if (tok.current !== token) return;
      setCur(i);
      await sleep(420);
      if (nodes[i].v === t) {
        if (tok.current !== token) return;
        setFound(i);
        setBusy(false);
        setNote(`Found ${t} after ${i + 1} hop${i ? "s" : ""} — you must follow next-pointers from the head (O(n)).`);
        return;
      }
    }
    if (tok.current !== token) return;
    setCur(null);
    setBusy(false);
    setNote(`${t} is not in the list — walked all ${nodes.length} nodes (O(n)).`);
  }

  function insertHead() {
    const v = parseInt(val, 10);
    if (isNaN(v)) return;
    tok.current++;
    setCur(null);
    setFound(null);
    setNodes((ns) => [{ id: nid, v }, ...ns]);
    setNid((n) => n + 1);
    setNote(`Inserted ${v} at the head — pointed the new node at the old head. No shifting, O(1).`);
  }

  function reset() {
    tok.current++;
    setNodes(BASE.map((v, i) => ({ id: i, v })));
    setNid(BASE.length);
    setCur(null);
    setFound(null);
    setBusy(false);
    setNote("Each node points to the next. Inserting at the head just rewires pointers.");
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Linked list — cheap inserts, no jumping to an index
      </h3>
      <p className="mt-1 text-sm text-dim">
        Nodes are linked by pointers. Adding at the head is a couple of pointer
        updates; finding a value means hopping node by node.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">value</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={insertHead}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          insert at head
        </button>
        <span className="mx-1 h-4 w-px bg-line" />
        <span className="font-mono text-xs text-faint">find</span>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-14 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={find}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <Search className="h-3.5 w-3.5" /> find
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="thin-scroll mt-6 flex items-center gap-1 overflow-x-auto py-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          head →
        </span>
        <AnimatePresence initial={false} mode="popLayout">
          {nodes.map((nd, i) => {
            const isCur = cur === i;
            const isFound = found === i;
            return (
              <Fragment key={nd.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border font-mono text-sm"
                  style={
                    isFound
                      ? { borderColor: "var(--color-good)", background: tint("#22c55e", 14), color: "var(--color-text)" }
                      : isCur
                        ? { borderColor: color, background: tint(color, 14), color: "var(--color-text)" }
                        : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                  }
                >
                  {nd.v}
                </motion.div>
                <span className="shrink-0 text-faint">→</span>
              </Fragment>
            );
          })}
        </AnimatePresence>
        <span className="shrink-0 font-mono text-xs text-faint">null</span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-dim">{note}</p>
    </div>
  );
}
