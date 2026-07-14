"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Loader2,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";
const BAD = "#f87171";

type PrState = "Open" | "Checks" | "Changes requested" | "Approved" | "Merged";
type CheckState = "queued" | "running" | "passed" | "failed";
type ReviewState = "pending" | "changes" | "approved";

type Step = {
  pr: PrState;
  checks: CheckState;
  review: ReviewState;
  showComment: boolean;
  fixCommit: boolean;
  merged: boolean;
  note: string;
};

const BRANCH = "feature/checkout-discount";

const DIFF = [
  { file: "checkout/DiscountField.tsx", add: 38, del: 0 },
  { file: "checkout/total.ts", add: 6, del: 2 },
  { file: "checkout/total.test.ts", add: 4, del: 5 },
];
const ADDED = DIFF.reduce((s, f) => s + f.add, 0);
const REMOVED = DIFF.reduce((s, f) => s + f.del, 0);

const CHECKS = ["unit tests", "lint", "type-check"];

const TIMELINE: PrState[] = [
  "Open",
  "Checks",
  "Changes requested",
  "Approved",
  "Merged",
];

const STEPS: Step[] = [
  {
    pr: "Open",
    checks: "running",
    review: "pending",
    showComment: false,
    fixCommit: false,
    merged: false,
    note: `You pushed the branch and opened a pull request. It proposes merging ${BRANCH} into main — nothing has changed on main yet.`,
  },
  {
    pr: "Checks",
    checks: "passed",
    review: "pending",
    showComment: false,
    fixCommit: false,
    merged: false,
    note: "CI ran automatically on the PR — tests, lint and type-check all passed. Green checks are required, but they are not enough on their own.",
  },
  {
    pr: "Changes requested",
    checks: "passed",
    review: "changes",
    showComment: true,
    fixCommit: false,
    merged: false,
    note: "A reviewer read the diff and requested changes: a human caught something the tests did not. The PR is blocked until it is resolved.",
  },
  {
    pr: "Approved",
    checks: "passed",
    review: "approved",
    showComment: true,
    fixCommit: true,
    merged: false,
    note: "You pushed a fix commit. CI re-ran and stayed green, and the reviewer approved. Both gates — checks and review — are now satisfied.",
  },
  {
    pr: "Merged",
    checks: "passed",
    review: "approved",
    showComment: true,
    fixCommit: true,
    merged: true,
    note: `With green checks and an approval, the PR was squash-merged into main. Your branch work is now on main and ${BRANCH} can be deleted.`,
  },
];

type Meta = { Icon: LucideIcon; label: string; color: string; spin: boolean };

function checkMeta(s: CheckState): Meta {
  switch (s) {
    case "passed":
      return { Icon: CheckCircle2, label: "Passed", color: GOOD, spin: false };
    case "failed":
      return { Icon: XCircle, label: "Failed", color: BAD, spin: false };
    case "running":
      return { Icon: Loader2, label: "Running", color: WARN, spin: true };
    default:
      return { Icon: Clock, label: "Queued", color: WARN, spin: false };
  }
}

function reviewMeta(s: ReviewState): Meta {
  switch (s) {
    case "approved":
      return { Icon: CheckCircle2, label: "Approved", color: GOOD, spin: false };
    case "changes":
      return {
        Icon: MessageSquare,
        label: "Changes requested",
        color: WARN,
        spin: false,
      };
    default:
      return {
        Icon: Clock,
        label: "Review pending",
        color: "var(--color-faint)",
        spin: false,
      };
  }
}

export default function PrReviewDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const s = STEPS[step];

  const accent =
    s.pr === "Changes requested"
      ? WARN
      : s.pr === "Approved" || s.pr === "Merged"
        ? GOOD
        : color;
  const PrIcon: LucideIcon =
    s.pr === "Merged"
      ? GitMerge
      : s.pr === "Approved"
        ? CheckCircle2
        : s.pr === "Changes requested"
          ? MessageSquare
          : GitPullRequest;

  const cm = checkMeta(s.checks);
  const rm = reviewMeta(s.review);

  const merge: Meta = s.merged
    ? { Icon: GitMerge, label: "Merged into main", color: GOOD, spin: false }
    : s.review === "approved"
      ? {
          Icon: CheckCircle2,
          label: "Ready to merge — checks green and approved",
          color: GOOD,
          spin: false,
        }
      : s.review === "changes"
        ? {
            Icon: MessageSquare,
            label: "Merge blocked — changes requested",
            color: WARN,
            spin: false,
          }
        : {
            Icon: Clock,
            label: "Merge blocked — waiting on review approval",
            color: WARN,
            spin: false,
          };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The pull request and code review flow
      </h3>
      <p className="mt-1 text-sm text-dim">
        A branch of work goes through a pull request before it lands on main.
        Step through how a PR is opened, checked, reviewed, approved, then
        merged.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((v) => Math.min(v + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" aria-hidden /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> reset
        </button>
      </div>

      {/* State transitions */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {TIMELINE.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                style={
                  current
                    ? {
                        background: tint(accent, 16),
                        color: accent,
                        borderColor: tint(accent, 45),
                      }
                    : done
                      ? {
                          color: "var(--color-dim)",
                          borderColor: "var(--color-line)",
                        }
                      : {
                          color: "var(--color-faint)",
                          borderColor: "var(--color-line-soft)",
                        }
                }
              >
                {done ? <Check className="h-3 w-3" aria-hidden /> : null}
                {label}
              </span>
              {i < TIMELINE.length - 1 ? (
                <span aria-hidden className="text-xs text-faint">
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* PR card */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-text">
              Add a discount code to checkout
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-dim">
              <GitBranch className="h-3.5 w-3.5 text-faint" aria-hidden />
              {BRANCH}
              <span aria-hidden className="text-faint">
                →
              </span>
              main
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{
              background: tint(accent, 14),
              color: accent,
              borderColor: tint(accent, 45),
            }}
          >
            <PrIcon className="h-3.5 w-3.5" aria-hidden />
            {s.pr}
          </span>
        </div>

        {/* Diff summary */}
        <div className="mt-3 rounded-lg border border-line-soft bg-panel p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {DIFF.length} files changed{" "}
            <span style={{ color: GOOD }}>+{ADDED}</span>{" "}
            <span style={{ color: BAD }}>−{REMOVED}</span>
          </p>
          <ul className="mt-2 space-y-1">
            {DIFF.map((f) => (
              <li
                key={f.file}
                className="flex items-center justify-between gap-3 font-mono text-xs"
              >
                <span className="truncate text-dim">{f.file}</span>
                <span className="shrink-0 tabular-nums">
                  <span style={{ color: GOOD }}>+{f.add}</span>{" "}
                  <span style={{ color: BAD }}>−{f.del}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CI checks */}
        <div className="mt-3 rounded-lg border border-line-soft bg-panel p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              CI checks
            </p>
            {s.fixCommit ? (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-faint">
                <Check className="h-3 w-3" aria-hidden />
                re-ran on fix commit
              </span>
            ) : null}
          </div>
          <ul className="mt-2 space-y-1.5">
            {CHECKS.map((name) => (
              <li key={name} className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-dim">{name}</span>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: cm.color }}
                >
                  <cm.Icon
                    className={`h-3.5 w-3.5${cm.spin ? " animate-spin" : ""}`}
                    aria-hidden
                  />
                  {cm.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Review */}
        <div className="mt-3 rounded-lg border border-line-soft bg-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              Review
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: rm.color }}
            >
              <rm.Icon className="h-3.5 w-3.5" aria-hidden />
              {rm.label}
            </span>
          </div>

          {s.showComment ? (
            <motion.div
              key={s.fixCommit ? "resolved" : "open"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-md border px-2.5 py-2"
              style={{
                borderColor: tint(s.fixCommit ? GOOD : WARN, 45),
                background: tint(s.fixCommit ? GOOD : WARN, 8),
              }}
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-text">
                <MessageSquare
                  className="h-3.5 w-3.5"
                  style={{ color: WARN }}
                  aria-hidden
                />
                alex (maintainer)
              </p>
              <p className="mt-1 text-xs leading-relaxed text-dim">
                total.ts applies the discount before tax — it should apply after
                tax. Please fix it and add a test.
              </p>
              {s.fixCommit ? (
                <p
                  className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px]"
                  style={{ color: GOOD }}
                >
                  <Check className="h-3 w-3" aria-hidden />
                  resolved by fix commit a1b2c3d
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </div>

        {/* Merge status */}
        <div
          className="mt-3 flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
          style={{
            borderColor: tint(merge.color, 45),
            background: tint(merge.color, 8),
            color: merge.color,
          }}
        >
          <merge.Icon className="h-3.5 w-3.5" aria-hidden />
          {merge.label}
          {s.merged ? (
            <span className="inline-flex items-center gap-1 text-faint">
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              branch can be deleted
            </span>
          ) : null}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {s.note}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-faint">
        A pull request proposes merging a branch and gates it behind automated
        checks (CI) and human review, so problems are caught before code reaches
        main — and it is how a team shares knowledge about the change.
      </p>
    </div>
  );
}
