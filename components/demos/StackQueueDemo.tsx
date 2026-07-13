"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const BASE = [
  { id: 0, v: 1 },
  { id: 1, v: 2 },
  { id: 2, v: 3 },
];

export default function StackQueueDemo({
  color,
  mode,
}: {
  color: string;
  mode: "stack" | "queue";
}) {
  const isStack = mode === "stack";
  const [items, setItems] = useState(BASE);
  const [nid, setNid] = useState(3);
  const [nextV, setNextV] = useState(4);
  const [removed, setRemoved] = useState<number | null>(null);

  function add() {
    setItems((xs) => [...xs, { id: nid, v: nextV }]);
    setNid((n) => n + 1);
    setNextV((v) => v + 1);
    setRemoved(null);
  }
  function remove() {
    setItems((xs) => {
      if (xs.length === 0) return xs;
      if (isStack) {
        setRemoved(xs[xs.length - 1].v);
        return xs.slice(0, -1);
      }
      setRemoved(xs[0].v);
      return xs.slice(1);
    });
  }
  function reset() {
    setItems(BASE);
    setNid(3);
    setNextV(4);
    setRemoved(null);
  }

  const addLabel = isStack ? "push" : "enqueue";
  const removeLabel = isStack ? "pop" : "dequeue";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        {isStack ? "Stack — last in, first out" : "Queue — first in, first out"}
      </h3>
      <p className="mt-1 text-sm text-dim">
        {isStack
          ? "push adds to the top; pop removes the top. You only ever touch the top."
          : "enqueue adds to the back; dequeue removes from the front. Items leave in the order they arrived."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          style={{ background: color }}
        >
          <Plus className="h-3.5 w-3.5" /> {addLabel}({nextV})
        </button>
        <button
          onClick={remove}
          disabled={items.length === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" /> {removeLabel}()
        </button>
        {removed !== null && (
          <span className="font-mono text-xs text-dim">
            {removeLabel}ed → <span className="text-text">{removed}</span>
          </span>
        )}
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="thin-scroll mt-6 flex min-h-[64px] items-center gap-2 overflow-x-auto py-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.length === 0 && (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-faint"
            >
              empty
            </motion.span>
          )}
          {items.map((it, i) => {
            const label = isStack
              ? i === items.length - 1
                ? "top"
                : ""
              : i === 0
                ? "front"
                : i === items.length - 1
                  ? "back"
                  : "";
            const highlight = isStack
              ? i === items.length - 1
              : i === 0 || i === items.length - 1;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isStack ? 30 : -30, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative grid h-12 w-12 shrink-0 place-items-center rounded-lg border font-mono text-sm"
                style={
                  highlight
                    ? { borderColor: color, background: tint(color, 12), color: "var(--color-text)" }
                    : { borderColor: "var(--color-line)", color: "var(--color-dim)" }
                }
              >
                {it.v}
                {label && (
                  <span
                    className="absolute -top-4 font-mono text-[9px] uppercase tracking-widest"
                    style={{ color }}
                  >
                    {label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-dim">
        {isStack
          ? "Both push and pop touch the same end — the top — so both are O(1)."
          : "enqueue touches the back, dequeue the front; both are O(1) with the right backing structure."}
      </p>
    </div>
  );
}
