"use client";

import { useRef, useState } from "react";
import { Coins, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const SYSTEMS: Record<"friendly" | "trap", number[]> = {
  friendly: [25, 10, 5, 1],
  trap: [4, 3, 1],
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function greedy(amount: number, coins: number[]): number[] {
  const desc = [...coins].sort((a, b) => b - a);
  const picks: number[] = [];
  let rem = amount;
  for (const c of desc) while (rem >= c) {
    picks.push(c);
    rem -= c;
  }
  return picks;
}

function optimal(amount: number, coins: number[]): number[] {
  const dp = Array(amount + 1).fill(Infinity);
  const pick = Array(amount + 1).fill(-1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) {
        dp[a] = dp[a - c] + 1;
        pick[a] = c;
      }
    }
  }
  const picks: number[] = [];
  let a = amount;
  while (a > 0 && pick[a] !== -1) {
    picks.push(pick[a]);
    a -= pick[a];
  }
  return picks;
}

function Coin({ v, color }: { v: number; color: string }) {
  return (
    <span
      className="grid h-9 w-9 place-items-center rounded-full border font-mono text-sm"
      style={{ borderColor: color, background: tint(color, 12), color: "var(--color-text)" }}
    >
      {v}
    </span>
  );
}

export default function GreedyDemo({ color }: { color: string }) {
  const [system, setSystem] = useState<"friendly" | "trap">("trap");
  const [amountStr, setAmountStr] = useState("6");
  const [greedyCoins, setGreedyCoins] = useState<number[]>([]);
  const [reveal, setReveal] = useState(0);
  const [optimalCoins, setOptimalCoins] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    "Greedy grabs the biggest coin that fits, over and over. Does that give the fewest coins?",
  );
  const tok = useRef(0);

  function clear() {
    tok.current++;
    setGreedyCoins([]);
    setReveal(0);
    setOptimalCoins(null);
    setBusy(false);
    setNote("Greedy grabs the biggest coin that fits, over and over. Does that give the fewest coins?");
  }

  async function run() {
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < 1 || amount > 99) {
      setNote("Pick an amount between 1 and 99.");
      return;
    }
    const token = ++tok.current;
    const coins = SYSTEMS[system];
    const g = greedy(amount, coins);
    const o = optimal(amount, coins);
    setBusy(true);
    setOptimalCoins(null);
    setGreedyCoins(g);
    setReveal(0);
    for (let i = 0; i < g.length; i++) {
      if (tok.current !== token) return;
      setReveal(i + 1);
      await sleep(380);
    }
    if (tok.current !== token) return;
    setOptimalCoins(o);
    setBusy(false);
    setNote(
      g.length === o.length
        ? `Greedy used ${g.length} coins — and that is optimal for the ${system === "friendly" ? "{25,10,5,1}" : "{4,3,1}"} system.`
        : `Greedy used ${g.length} coins, but the optimum is ${o.length}. Its local "take the biggest" choice locked it out of the better answer.`,
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4" style={{ color }} />
        <h3 className="font-semibold text-text">
          Make change: when does &ldquo;take the biggest&rdquo; win?
        </h3>
      </div>
      <p className="mt-1 text-sm text-dim">
        Greedy repeatedly takes the largest coin that fits. It&apos;s optimal for
        normal coins — try the {"{4,3,1}"} system to see it fail.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-line">
          {(["friendly", "trap"] as const).map((s) => {
            const on = system === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setSystem(s);
                  clear();
                }}
                aria-pressed={on}
                className="px-3 py-1.5 font-mono text-xs transition-colors"
                style={on ? { background: tint(color, 16), color } : { color: "var(--color-faint)" }}
              >
                {s === "friendly" ? "{25,10,5,1}" : "{4,3,1}"}
              </button>
            );
          })}
        </div>
        <span className="font-mono text-xs text-faint">amount</span>
        <input
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          aria-label="amount of change to make"
          className="w-16 rounded-lg border border-line bg-bg-2 px-2 py-1.5 text-center font-mono text-sm text-text focus:outline-none"
        />
        <button
          onClick={run}
          disabled={busy}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          run greedy
        </button>
        <button
          onClick={clear}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            greedy{greedyCoins.length ? ` — ${reveal} coin${reveal === 1 ? "" : "s"}` : ""}
          </p>
          <div className="flex min-h-[36px] flex-wrap gap-1.5">
            {greedyCoins.slice(0, reveal).map((c, i) => (
              <Coin key={i} v={c} color={color} />
            ))}
          </div>
        </div>
        {optimalCoins && (
          <div>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              optimal — {optimalCoins.length} coin{optimalCoins.length === 1 ? "" : "s"}
              {optimalCoins.length < greedyCoins.length && (
                <span className="ml-1 text-good">fewer!</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {optimalCoins.map((c, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-full border font-mono text-sm"
                  style={{ borderColor: "var(--color-good)", background: tint("#22c55e", 12), color: "var(--color-text)" }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
