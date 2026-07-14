"use client";

import { Check, X } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Focus = "naming" | "functions" | "dry";

type Sample = {
  heading: string;
  before: string;
  after: string;
  takeaway: string;
};

const SAMPLES: Record<Focus, Sample> = {
  naming: {
    heading: "Naming",
    before: `function f(d) {
  return d * 0.9; // what is d?
}`,
    after: `function applyDiscount(price) {
  return price * 0.9;
}`,
    takeaway:
      "After: clear names make the code read like a sentence, so the “what is d?” comment isn't needed. Good names are the cheapest documentation you'll ever write.",
  },
  functions: {
    heading: "One function, one job",
    before: `function checkout(raw) {
  // parse
  const order = JSON.parse(raw);
  // validate
  if (!order.items.length) throw Error("empty");
  if (order.total < 0) throw Error("bad total");
  // calculate
  let sum = 0;
  for (const i of order.items) sum += i.price * i.qty;
  order.total = sum * 1.08;
  // save
  db.orders.insert(order);
  // email
  smtp.send(order.email, "Receipt", order.total);
  return order;
}`,
    after: `function checkout(raw) {
  const order = parseOrder(raw);
  validate(order);
  order.total = total(order.items);
  save(order);
  sendReceipt(order);
  return order;
}
// parseOrder · validate · total · save · sendReceipt
// each helper does exactly one thing`,
    takeaway:
      "After: a tiny orchestrator delegates to parseOrder, validate, total, save and sendReceipt — each doing one job. Small single-purpose functions are testable, reusable, and readable.",
  },
  dry: {
    heading: "Don't repeat yourself",
    before: `// admin view
const priceA = item.base;
const offA = priceA * 0.2;
const adminPrice = priceA - offA;

// user view
const priceU = item.base;
const offU = priceU * 0.2; // copy-pasted — one drifts, both break
const userPrice = priceU - offU;`,
    after: `function extractDiscount(price) {
  return price - price * 0.2;
}

const adminPrice = extractDiscount(item.base);
const userPrice = extractDiscount(item.base);
// one source of truth — fix the rate in ONE place`,
    takeaway:
      "After: the discount lives in one helper called in both places — fix a bug once, not in five copies. But don't over-DRY: leave unrelated code that only looks similar apart.",
  },
};

export default function RefactorDemo({
  color,
  focus,
}: {
  color: string;
  focus: Focus;
}) {
  const sample = SAMPLES[focus];

  const panels = [
    { kind: "before", label: "Before", code: sample.before, tone: BAD, Icon: X },
    { kind: "after", label: "After", code: sample.after, tone: GOOD, Icon: Check },
  ] as const;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Before → after: the same code, cleaned up
      </h3>
      <p className="mt-1 text-sm text-dim">
        The behaviour does not change — only how the code is written. Compare
        the messy version with the tidy one.
      </p>

      <div className="mt-4">
        <span
          className="inline-block rounded-lg border px-2.5 py-1.5 text-xs font-medium"
          style={{
            background: tint(color, 16),
            color,
            borderColor: tint(color, 45),
          }}
        >
          {sample.heading}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {panels.map((p) => (
          <div key={p.kind}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <p.Icon className="h-3.5 w-3.5" style={{ color: p.tone }} />
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: p.tone }}
              >
                {p.label}
              </span>
            </div>
            <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-xs leading-relaxed text-dim">
              {p.code}
            </pre>
          </div>
        ))}
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {sample.takeaway}
      </p>
    </div>
  );
}
