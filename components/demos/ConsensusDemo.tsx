"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const TOTAL = 5;
const QUORUM = 3;

type Role = "leader" | "follower" | "candidate" | "down";
type Node = { id: string; role: Role; counted: boolean };
type Phase = "commit" | "election";
type Tone = "neutral" | "good" | "warn";
type Step = { phase: Phase; value?: string; nodes: Node[]; note: string };

const nd = (id: string, role: Role, counted = false): Node => ({ id, role, counted });

const STEPS: Step[] = [
  {
    phase: "commit",
    value: "x = 5",
    nodes: [nd("N1", "leader", true), nd("N2", "follower"), nd("N3", "follower"), nd("N4", "follower"), nd("N5", "follower")],
    note: "Leader N1 receives x = 5 and sends a replicate request to its four followers. Nothing is committed until a majority confirms it.",
  },
  {
    phase: "commit",
    value: "x = 5",
    nodes: [nd("N1", "leader", true), nd("N2", "follower", true), nd("N3", "follower"), nd("N4", "follower"), nd("N5", "follower")],
    note: "Follower N2 acknowledges — it has written x = 5 to its log. That is 2 of 5, still short of a majority.",
  },
  {
    phase: "commit",
    value: "x = 5",
    nodes: [nd("N1", "leader", true), nd("N2", "follower", true), nd("N3", "follower", true), nd("N4", "follower"), nd("N5", "follower")],
    note: "N3 acknowledges too. With 3 of 5 in agreement the quorum is met, so x = 5 is committed by quorum 3/5. Slower followers can catch up later.",
  },
  {
    phase: "commit",
    value: "y = 8",
    nodes: [nd("N1", "leader", true), nd("N2", "follower"), nd("N3", "follower"), nd("N4", "down"), nd("N5", "down")],
    note: "Two followers, N4 and N5, go offline. A new value y = 8 arrives. Only 3 of 5 nodes are reachable — but a majority is still just 3.",
  },
  {
    phase: "commit",
    value: "y = 8",
    nodes: [nd("N1", "leader", true), nd("N2", "follower", true), nd("N3", "follower", true), nd("N4", "down"), nd("N5", "down")],
    note: "N2 and N3 acknowledge, so all three live nodes agree. That is still a majority, so y = 8 is committed by quorum 3/5. A minority failing does not stop progress.",
  },
  {
    phase: "commit",
    value: "z = 2",
    nodes: [nd("N1", "leader", true), nd("N2", "follower"), nd("N3", "down"), nd("N4", "down"), nd("N5", "down")],
    note: "A third node, N3, also fails — only N1 and N2 remain up. A new value z = 2 arrives, but two nodes cannot form the majority of three.",
  },
  {
    phase: "commit",
    value: "z = 2",
    nodes: [nd("N1", "leader", true), nd("N2", "follower", true), nd("N3", "down"), nd("N4", "down"), nd("N5", "down")],
    note: "Even with both live nodes acknowledging, that is only 2 of 5. No quorum: the cluster cannot make progress, so it refuses to commit z = 2 rather than risk two conflicting histories.",
  },
  {
    phase: "election",
    nodes: [nd("N1", "down"), nd("N2", "follower"), nd("N3", "follower"), nd("N4", "follower"), nd("N5", "follower")],
    note: "The failed nodes recover, but now the leader N1 itself dies. Four nodes are up with no leader, so the cluster must hold an election before it can commit anything.",
  },
  {
    phase: "election",
    nodes: [nd("N1", "down"), nd("N2", "candidate", true), nd("N3", "follower"), nd("N4", "follower"), nd("N5", "follower")],
    note: "N2 becomes a candidate and requests votes from the others. A candidate needs a majority of the whole cluster to win.",
  },
  {
    phase: "election",
    nodes: [nd("N1", "down"), nd("N2", "leader", true), nd("N3", "follower", true), nd("N4", "follower", true), nd("N5", "follower")],
    note: "N2 collects 3 votes — a majority — and becomes the new leader. Consensus lets a group agree on one value or one leader despite failures, which is why clusters use an ODD number of nodes and tolerate only a minority going down.",
  },
];

function outcome(nodes: Node[], phase: Phase): { tone: Tone; badge: string } {
  const count = nodes.filter((n) => n.counted).length;
  const up = nodes.filter((n) => n.role !== "down").length;
  if (phase === "election") {
    if (nodes.some((n) => n.role === "leader")) return { tone: "good", badge: "new leader elected" };
    if (nodes.some((n) => n.role === "candidate")) return { tone: "neutral", badge: `${count} / ${QUORUM} votes` };
    return { tone: "warn", badge: "no leader: holding election" };
  }
  if (count >= QUORUM) return { tone: "good", badge: "committed by quorum 3/5" };
  if (up < QUORUM) return { tone: "warn", badge: "no quorum: cannot make progress" };
  return { tone: "neutral", badge: `${count} / ${QUORUM} acknowledged` };
}

function statusOf(node: Node, phase: Phase, accent: string): { text: string; c: string } {
  if (node.role === "down") return { text: "offline", c: BAD };
  if (phase === "election") {
    if (node.role === "leader") return { text: "✓ new leader", c: accent };
    if (node.role === "candidate") return { text: node.counted ? "✓ self-vote" : "candidate", c: WARN };
    return node.counted ? { text: "✓ voted", c: GOOD } : { text: "no vote yet", c: "var(--color-faint)" };
  }
  if (node.role === "leader") return { text: "✓ has value", c: accent };
  return node.counted ? { text: "✓ acknowledged", c: GOOD } : { text: "waiting", c: "var(--color-faint)" };
}

export default function ConsensusDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const cur = STEPS[step];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const count = cur.nodes.filter((n) => n.counted).length;
  const up = cur.nodes.filter((n) => n.role !== "down").length;
  const { tone, badge } = outcome(cur.nodes, cur.phase);
  const accent = tone === "good" ? GOOD : tone === "warn" ? WARN : color;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Consensus: a majority agrees despite failures
      </h3>
      <p className="mt-1 text-sm text-dim">
        Five nodes, Raft-style. A value is committed only when a majority agrees — a quorum of 3 of 5 — so the cluster keeps going even when a minority fails.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span
            className="rounded-md px-2 py-1 font-mono text-xs"
            style={{ background: tint(color, 12), color }}
          >
            {cur.value ? `replicating ${cur.value}` : "electing a new leader"}
          </span>
          <span className="font-mono text-[11px] text-faint">
            {up} of {TOTAL} nodes up
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {cur.nodes.map((node) => {
            const roleColor =
              node.role === "leader" ? color : node.role === "candidate" ? WARN : node.role === "down" ? BAD : "var(--color-faint)";
            const border =
              node.role === "leader" ? color : node.role === "candidate" ? tint(WARN, 45) : node.role === "down" ? tint(BAD, 30) : "var(--color-line)";
            const bg =
              node.role === "leader" ? tint(color, 10) : node.role === "candidate" ? tint(WARN, 10) : "transparent";
            const s = statusOf(node, cur.phase, color);
            return (
              <div
                key={node.id}
                className="rounded-lg border px-1.5 py-2 text-center transition-colors"
                style={{ borderColor: border, background: bg, opacity: node.role === "down" ? 0.6 : 1 }}
              >
                <div className="font-mono text-sm text-text">{node.id}</div>
                <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: roleColor }}>
                  {node.role}
                </div>
                <div className="mt-1 text-[10px] leading-tight" style={{ color: s.c }}>
                  {s.text}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-faint">
              {cur.phase === "election" ? "votes" : "quorum"}
            </span>
            <span className="font-mono text-xs" style={{ color: accent }}>
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: TOTAL }, (_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{ background: i < count ? accent : "var(--color-line)" }}
              />
            ))}
          </div>
          <p className="mt-1 font-mono text-[10px] text-faint">
            majority = {QUORUM} of {TOTAL}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cur.note}
      </p>
    </div>
  );
}
