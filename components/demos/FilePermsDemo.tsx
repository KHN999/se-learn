"use client";

import { useState } from "react";
import { Ban, Check, FileText } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

const CLASSES = [
  { key: "user", label: "User", who: "the owner, alice" },
  { key: "group", label: "Group", who: "the staff group" },
  { key: "other", label: "Other", who: "everyone else" },
] as const;

const COLS = [
  { key: "r", label: "read", bit: 4 },
  { key: "w", label: "write", bit: 2 },
  { key: "x", label: "execute", bit: 1 },
] as const;

// Initial bits form -rwxr-xr-- (octal 754): the classic sane default.
const INITIAL: boolean[][] = [
  [true, true, true], // user  rwx = 7
  [true, false, true], // group r-x = 5
  [true, false, false], // other r-- = 4
];

const ACTORS = [
  { label: "alice (the owner)", note: "reads the User bits" },
  { label: "a member of staff", note: "reads the Group bits" },
  { label: "someone else", note: "reads the Other bits" },
] as const;

export default function FilePermsDemo({ color }: { color: string }) {
  const [grid, setGrid] = useState<boolean[][]>(INITIAL);
  const [actor, setActor] = useState(0); // index into the three classes
  const [action, setAction] = useState(0); // index into read / write / execute

  const symbolFor = (row: boolean[]) =>
    COLS.map((c, i) => (row[i] ? c.key : "-")).join("");
  const octalFor = (row: boolean[]) =>
    COLS.reduce((sum, c, i) => sum + (row[i] ? c.bit : 0), 0);

  const symbolic = "-" + grid.map(symbolFor).join("");
  const octal = grid.map(octalFor).join("");

  const allowed = grid[actor][action];
  const actorLabel = ACTORS[actor].label;
  const actionLabel = COLS[action].label;
  const classLabel = CLASSES[actor].label;
  const resultColor = allowed ? GOOD : BAD;

  const toggle = (r: number, c: number) =>
    setGrid((g) =>
      g.map((row, ri) =>
        ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row,
      ),
    );

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Unix file permissions: rwx for user, group, and other
      </h3>
      <p className="mt-1 text-sm text-dim">
        One file owned by alice in the staff group. Toggle the nine bits and
        watch the symbolic string and octal number update live.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-text">
          <FileText className="h-4 w-4" style={{ color }} />
          report.sh
        </span>
        <span className="font-mono text-sm">
          <span className="text-faint">perms </span>
          <span className="text-text">{symbolic}</span>
        </span>
        <span className="font-mono text-sm sm:ml-auto">
          <span className="text-faint">chmod </span>
          <span style={{ color }}>{octal}</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-1.5">
        <div />
        {COLS.map((c) => (
          <div
            key={c.key}
            className="text-center font-mono text-[10px] uppercase tracking-widest text-faint"
          >
            {c.label}
          </div>
        ))}
        {CLASSES.map((cls, r) => (
          <div key={cls.key} className="contents">
            <div className="flex flex-col justify-center pr-2">
              <span className="text-sm font-medium text-text">{cls.label}</span>
              <span className="text-[11px] text-faint">{cls.who}</span>
            </div>
            {COLS.map((c, ci) => {
              const on = grid[r][ci];
              return (
                <button
                  key={c.key}
                  onClick={() => toggle(r, ci)}
                  aria-pressed={on}
                  aria-label={`${cls.label} ${c.label}: ${on ? "on" : "off"}`}
                  className="rounded-lg border py-2.5 text-center font-mono text-sm transition-colors"
                  style={
                    on
                      ? {
                          background: tint(color, 16),
                          color,
                          borderColor: tint(color, 45),
                        }
                      : {
                          color: "var(--color-faint)",
                          borderColor: "var(--color-line)",
                        }
                  }
                >
                  {on ? c.key : "-"}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          access check
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div>
            <p className="mb-1.5 text-xs text-dim">Who is acting</p>
            <div className="flex flex-wrap gap-1.5">
              {ACTORS.map((a, i) => {
                const on = i === actor;
                return (
                  <button
                    key={a.label}
                    onClick={() => setActor(i)}
                    aria-pressed={on}
                    className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                    style={
                      on
                        ? {
                            background: tint(color, 16),
                            color,
                            borderColor: tint(color, 45),
                          }
                        : {
                            color: "var(--color-dim)",
                            borderColor: "var(--color-line)",
                          }
                    }
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-dim">Wants to</p>
            <div className="flex flex-wrap gap-1.5">
              {COLS.map((c, i) => {
                const on = i === action;
                return (
                  <button
                    key={c.key}
                    onClick={() => setAction(i)}
                    aria-pressed={on}
                    className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                    style={
                      on
                        ? {
                            background: tint(color, 16),
                            color,
                            borderColor: tint(color, 45),
                          }
                        : {
                            color: "var(--color-dim)",
                            borderColor: "var(--color-line)",
                          }
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
          style={{
            borderColor: tint(resultColor, 45),
            background: tint(resultColor, 12),
          }}
          aria-live="polite"
        >
          {allowed ? (
            <Check className="h-4 w-4" style={{ color: resultColor }} />
          ) : (
            <Ban className="h-4 w-4" style={{ color: resultColor }} />
          )}
          <span
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: resultColor }}
          >
            {allowed ? "Allowed" : "Denied"}
          </span>
          <span className="text-sm text-dim">
            {actorLabel} {allowed ? "can" : "cannot"} {actionLabel} this file —
            the OS {ACTORS[actor].note} ({symbolFor(grid[actor])}).
          </span>
        </div>

        <p className="mt-3 text-xs text-faint">
          Note: on a directory, the x bit means you may enter or traverse it,
          rather than run it.
        </p>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        Permissions are three sets — user, group, other — each with read, write,
        and execute. chmod {octal} writes exactly these bits ({symbolic}); when
        someone acts, the OS finds which class they fall into and checks only
        that set. Here the {classLabel} bits decide.
      </p>
    </div>
  );
}
