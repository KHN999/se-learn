"use client";

import { useState } from "react";
import { Check, GitMerge, RotateCcw } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";
const WARN = "#fbbf24";

const FILE = "config.py";

// Marker + line text lives in string constants so the raw "<", "=", ">"
// characters never sit in JSX text (where "<" would start a tag).
const MARK_START = "<<<<<<< HEAD";
const MARK_MID = "=======";
const MARK_END = ">>>>>>> feature";
const OURS_LINE = "price = 10";
const THEIRS_LINE = "price = 12";

type LineKind = "ctx" | "mark" | "ours" | "theirs";

const CONFLICT_LINES: { text: string; kind: LineKind }[] = [
  { text: "# config.py", kind: "ctx" },
  { text: 'name = "shop"', kind: "ctx" },
  { text: MARK_START, kind: "mark" },
  { text: OURS_LINE, kind: "ours" },
  { text: MARK_MID, kind: "mark" },
  { text: THEIRS_LINE, kind: "theirs" },
  { text: MARK_END, kind: "mark" },
  { text: "tax = 0.2", kind: "ctx" },
];

type Choice = "ours" | "theirs" | "other";

const CHOICES: { key: Choice; label: string; line: string }[] = [
  { key: "ours", label: "Keep ours (10)", line: "price = 10" },
  { key: "theirs", label: "Keep theirs (12)", line: "price = 12" },
  { key: "other", label: "Combine/other (e.g. 11)", line: "price = 11" },
];

export default function MergeConflictDemo({ color }: { color: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);

  const active = CHOICES.find((c) => c.key === choice) ?? null;

  const status = active
    ? `You chose "${active.line}". Delete all three markers, keep only the line you want, then run "git add ${FILE}" to stage the fix and "git commit" to finish the merge. The flow is always resolve, then add, then commit.`
    : `Git wrote three markers into ${FILE}. The block from "${MARK_START}" down to "${MARK_MID}" is YOUR branch (ours). The block from "${MARK_MID}" down to "${MARK_END}" is the INCOMING branch (theirs). Git shows both sides because the same line changed on each — a human has to pick.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="flex items-center gap-2 font-semibold text-text">
        <GitMerge className="h-4 w-4" style={{ color }} aria-hidden="true" />
        Resolving a merge conflict
      </h3>
      <p className="mt-1 text-sm text-dim">
        Two branches changed the same line. Git cannot decide which one is right,
        so it hands you both versions and waits for a human to choose.
      </p>

      {/* Setup: both branches edited the SAME line. */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            branch main (ours)
          </p>
          <p className="mt-1 font-mono text-sm text-text">{OURS_LINE}</p>
        </div>
        <div className="rounded-xl border border-line bg-bg-2/50 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            branch feature (theirs)
          </p>
          <p className="mt-1 font-mono text-sm text-text">{THEIRS_LINE}</p>
        </div>
      </div>

      <div
        className="mt-2 rounded-xl border-l-2 px-3 py-2 text-sm"
        style={{ borderColor: BAD, background: tint(BAD, 8), color: BAD }}
      >
        <span className="font-mono text-xs">$ git merge feature</span>
        <span className="ml-2 text-dim">
          CONFLICT (content): merge conflict in {FILE} — automatic merge failed.
        </span>
      </div>

      {/* The conflicted file, with Git's markers. */}
      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
        {FILE} — with conflict markers
      </p>
      <div className="thin-scroll mt-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4">
        <div className="flex min-w-max flex-col gap-0.5 font-mono text-sm">
          {CONFLICT_LINES.map((line, i) => {
            const isOurs = line.kind === "ours";
            const isTheirs = line.kind === "theirs";
            const isMark = line.kind === "mark";
            const badge = isOurs
              ? { text: "main (ours)", c: color }
              : isTheirs
                ? { text: "feature (theirs)", c: WARN }
                : null;
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-6 rounded px-1"
                style={
                  isOurs
                    ? { background: tint(color, 10) }
                    : isTheirs
                      ? { background: tint(WARN, 10) }
                      : undefined
                }
              >
                <span
                  className={isMark ? "font-semibold" : ""}
                  style={{ color: isMark ? WARN : "var(--color-text)" }}
                >
                  {line.text}
                </span>
                {badge ? (
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-widest"
                    style={{ background: tint(badge.c, 16), color: badge.c }}
                  >
                    {badge.text}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-faint">
        Only the same line collides. Edits to different parts of a file merge
        automatically — notice name and tax merged with no markers at all.
      </p>

      {/* Resolution choice. */}
      <p className="mt-4 text-sm font-medium text-text">You decide the value:</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {CHOICES.map((c) => {
          const on = c.key === choice;
          return (
            <button
              key={c.key}
              onClick={() => setChoice(c.key)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {on ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
              {c.label}
            </button>
          );
        })}
        {choice ? (
          <button
            onClick={() => setChoice(null)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" /> start over
          </button>
        ) : null}
      </div>

      {/* Resolved file + commands, once a choice is made. */}
      {active ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            {FILE} — resolved
          </p>
          <div className="mt-2 rounded-xl border border-line bg-bg-2 p-4">
            <div className="flex flex-col gap-0.5 font-mono text-sm">
              <span className="text-text"># config.py</span>
              <span className="text-text">name = &quot;shop&quot;</span>
              <div
                className="flex items-center justify-between gap-6 rounded px-1"
                style={{ background: tint(GOOD, 12) }}
              >
                <span className="text-text">{active.line}</span>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-widest"
                  style={{ background: tint(GOOD, 18), color: GOOD }}
                >
                  kept
                </span>
              </div>
              <span className="text-text">tax = 0.2</span>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm">
            <p className="text-dim">
              <span className="text-faint">$ </span>git add {FILE}
            </p>
            <p className="mt-1 text-dim">
              <span className="text-faint">$ </span>git commit
            </p>
          </div>

          <p
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
            style={{ background: tint(GOOD, 14), color: GOOD }}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            conflict resolved — merge complete
          </p>
        </div>
      ) : null}

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
