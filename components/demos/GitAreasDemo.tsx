"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

type Commit = { hash: string; msg: string };
type AreaId = "working" | "staging" | "local" | "remote";
type Step = {
  cmd: string;
  edit: boolean;
  active: AreaId;
  modified: boolean;
  staged: boolean;
  local: Commit[];
  remote: Commit[];
  note: string;
};

const C1: Commit = { hash: "a1b2c3d", msg: "Add greeting" };
const C2: Commit = { hash: "9f8e7d6", msg: "Fix typo" };

const STEPS: Step[] = [
  {
    cmd: "you edit app.js in your editor",
    edit: true,
    active: "working",
    modified: true,
    staged: false,
    local: [],
    remote: [],
    note: "You changed app.js. Git sees it as MODIFIED in your working directory — the real files on disk. Nothing is tracked for the next commit yet.",
  },
  {
    cmd: "git add app.js",
    edit: false,
    active: "staging",
    modified: false,
    staged: true,
    local: [],
    remote: [],
    note: "git add copies the change into the STAGING AREA (also called the index). Staging is where you craft exactly what the next commit will contain.",
  },
  {
    cmd: 'git commit -m "Add greeting"',
    edit: false,
    active: "local",
    modified: false,
    staged: false,
    local: [C1],
    remote: [],
    note: "git commit records the staged snapshot as a commit in your LOCAL repository. The staging area clears, ready for the next change.",
  },
  {
    cmd: "you edit app.js again",
    edit: true,
    active: "working",
    modified: true,
    staged: false,
    local: [C1],
    remote: [],
    note: "You edit app.js again, so it is MODIFIED in the working directory once more. Your first commit stays safe in the local repo.",
  },
  {
    cmd: 'git add app.js && git commit -m "Fix typo"',
    edit: false,
    active: "local",
    modified: false,
    staged: false,
    local: [C1, C2],
    remote: [],
    note: "Staged and committed in one go. Your LOCAL repo now holds 2 commits, but the remote still has none — your local branch is AHEAD of the remote.",
  },
  {
    cmd: "git push",
    edit: false,
    active: "remote",
    modified: false,
    staged: false,
    local: [C1, C2],
    remote: [C1, C2],
    note: "git push uploads your local commits to the REMOTE (origin) — the shared server teammates pull from. Local and remote now match.",
  },
];

const AREAS: { id: AreaId; label: string; sub: string }[] = [
  { id: "working", label: "Working directory", sub: "files on disk you edit" },
  { id: "staging", label: "Staging area (index)", sub: "what the next commit will include" },
  { id: "local", label: "Local repo", sub: "commits saved on your machine" },
  { id: "remote", label: "Remote (origin)", sub: "the shared server, like GitHub" },
];

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line-soft px-2.5 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
      {label}
    </div>
  );
}

function CommitList({ list, accent }: { list: Commit[]; accent: string }) {
  if (list.length === 0) return <Empty label="no commits" />;
  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence initial={false} mode="popLayout">
        {[...list].reverse().map((c) => (
          <motion.div
            key={c.hash}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border px-2.5 py-1.5"
            style={{ borderColor: tint(accent, 40), background: tint(accent, 8) }}
          >
            <div className="font-mono text-[11px]" style={{ color: accent }}>
              {c.hash}
            </div>
            <div className="font-mono text-[11px] text-dim">{c.msg}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function GitAreasDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const frame = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The everyday Git flow: working dir → staging → repo → remote
      </h3>
      <p className="mt-1 text-sm text-dim">
        One file, app.js, travels from your editor to a shared server. Step
        through the commands and watch where it lives.
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

      <div className="mt-4 flex items-center gap-2">
        <div className="thin-scroll min-w-0 flex-1 overflow-x-auto rounded-xl border border-line bg-bg-2 px-4 py-2.5 font-mono text-sm">
          <span className="text-faint">{frame.edit ? "#" : "$"}</span>{" "}
          <span
            className={frame.edit ? "italic text-dim" : ""}
            style={frame.edit ? undefined : { color }}
          >
            {frame.cmd}
          </span>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-faint">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AREAS.map((area) => {
          const on = frame.active === area.id;
          const ahead =
            area.id === "local" && frame.local.length > frame.remote.length;
          return (
            <div
              key={area.id}
              className="rounded-xl border p-3 transition-colors"
              style={{
                borderColor: on ? color : "var(--color-line-soft)",
                background: on ? tint(color, 6) : "transparent",
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
                    {area.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-tight text-dim">
                    {area.sub}
                  </div>
                </div>
                {ahead && (
                  <span
                    className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                    style={{ color, borderColor: tint(color, 40) }}
                  >
                    ahead +{frame.local.length - frame.remote.length}
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-col gap-1.5">
                {area.id === "working" && (
                  <motion.div
                    layout
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between rounded-lg border px-2.5 py-1.5"
                    style={{
                      borderColor: frame.modified ? tint(WARN, 45) : "var(--color-line)",
                      background: frame.modified ? tint(WARN, 10) : "transparent",
                    }}
                  >
                    <span className="font-mono text-xs text-text">app.js</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest ${
                        frame.modified ? "" : "text-faint"
                      }`}
                      style={frame.modified ? { color: WARN } : undefined}
                    >
                      {frame.modified ? "modified" : "no changes"}
                    </span>
                  </motion.div>
                )}

                {area.id === "staging" && (
                  <>
                    <AnimatePresence initial={false} mode="popLayout">
                      {frame.staged && (
                        <motion.div
                          key="staged-file"
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between rounded-lg border px-2.5 py-1.5"
                          style={{ borderColor: tint(GOOD, 45), background: tint(GOOD, 10) }}
                        >
                          <span className="font-mono text-xs text-text">app.js</span>
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: GOOD }}
                          >
                            staged
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!frame.staged && <Empty label="empty" />}
                  </>
                )}

                {area.id === "local" && (
                  <CommitList list={frame.local} accent={color} />
                )}
                {area.id === "remote" && (
                  <CommitList list={frame.remote} accent={color} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
