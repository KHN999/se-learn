"use client";

import { useState } from "react";
import { Eye, KeyRound, Lock, ShieldAlert, ShieldCheck, Timer } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Account = {
  user: string;
  password: string;
  salt: string;
  hash: string;
};

// Fixed, illustrative bcrypt strings — no real hashing is performed.
// alice and carol deliberately share the password "hunter2" to show that
// identical passwords produce different stored hashes because of the salt.
const ACCOUNTS: Account[] = [
  {
    user: "alice",
    password: "hunter2",
    salt: "N9qo8uLOickgx2ZMRZoMye",
    hash: "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  },
  {
    user: "bob",
    password: "password1",
    salt: "kIZ2i2p.uSJ9x3lHnT4kBu",
    hash: "$2b$12$kIZ2i2p.uSJ9x3lHnT4kBuOq1sK9m5jZ0pW.7cVeXr3mNbL8dHqYa",
  },
  {
    user: "carol",
    password: "hunter2",
    salt: "R3kFq7wXeT2yUvB1nMxL0e",
    hash: "$2b$12$R3kFq7wXeT2yUvB1nMxL0eJ8pQ5tYc.7zAoW2rNdVfMkL9sHbGpCu",
  },
];

// Passwords that appear on more than one account.
const REUSED = new Set(
  ACCOUNTS.map((a) => a.password).filter(
    (p, i, arr) => arr.indexOf(p) !== arr.lastIndexOf(p),
  ),
);

type Mode = "plain" | "hash";

export default function PasswordHashDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("plain");
  const isPlain = mode === "plain";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Why passwords are hashed (and salted)
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same three accounts, stored two different ways. Flip the switch and
        imagine the whole users table just leaked.
      </p>

      {/* Mode toggle */}
      <div
        className="mt-4 inline-flex flex-wrap gap-1.5 rounded-xl border bg-bg-2/50 p-1"
        style={{ borderColor: tint(color, 22) }}
      >
        <button
          onClick={() => setMode("plain")}
          aria-pressed={isPlain}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={
            isPlain
              ? { background: tint(BAD, 16), color: BAD, boxShadow: `inset 0 0 0 1px ${tint(BAD, 45)}` }
              : { color: "var(--color-dim)" }
          }
        >
          <span
            className="rounded px-1 py-px font-mono text-[10px] font-bold tracking-wide"
            style={{ background: tint(BAD, 22), color: BAD }}
          >
            BAD
          </span>
          Plaintext (never do this)
        </button>
        <button
          onClick={() => setMode("hash")}
          aria-pressed={!isPlain}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={
            !isPlain
              ? { background: tint(GOOD, 16), color: GOOD, boxShadow: `inset 0 0 0 1px ${tint(GOOD, 45)}` }
              : { color: "var(--color-dim)" }
          }
        >
          <span
            className="rounded px-1 py-px font-mono text-[10px] font-bold tracking-wide"
            style={{ background: tint(GOOD, 22), color: GOOD }}
          >
            GOOD
          </span>
          Salted hash (bcrypt)
        </button>
      </div>

      {/* Users table */}
      <div className="thin-scroll mt-4 overflow-x-auto rounded-xl border border-line-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b border-line px-3 py-2 font-mono text-xs uppercase tracking-widest text-faint">
                username
              </th>
              {isPlain ? (
                <th className="border-b border-line px-3 py-2 font-mono text-xs uppercase tracking-widest text-faint">
                  password
                </th>
              ) : (
                <>
                  <th className="border-b border-line px-3 py-2 font-mono text-xs uppercase tracking-widest text-faint">
                    salt
                  </th>
                  <th className="border-b border-line px-3 py-2 font-mono text-xs uppercase tracking-widest text-faint">
                    stored hash (bcrypt)
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((a) => {
              const reused = REUSED.has(a.password);
              return (
                <tr key={a.user} className="border-b border-line-soft last:border-0">
                  <td className="px-3 py-2 font-mono text-dim">{a.user}</td>
                  {isPlain ? (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-sm"
                          style={{ background: tint(BAD, 12), color: BAD }}
                        >
                          {a.password}
                        </span>
                        {reused && (
                          <span
                            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide"
                            style={{ color: BAD }}
                          >
                            <Eye className="h-3 w-3" /> reused
                          </span>
                        )}
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-mono text-xs text-faint">
                        {a.salt}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="whitespace-nowrap font-mono text-xs text-dim">
                            {a.hash}
                          </span>
                          {reused && (
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide"
                              style={{ color: GOOD }}
                            >
                              <ShieldCheck className="h-3 w-3" /> same password, different hash
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Breach callout */}
      {isPlain ? (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: tint(BAD, 40), background: tint(BAD, 8) }}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: BAD }} />
            <p className="text-sm font-semibold text-text">
              Database leaked — game over
            </p>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-dim">
            <li>
              Every password is sitting right there in the open. All three
              accounts are compromised the instant the table leaks.
            </li>
            <li>
              You can plainly SEE that alice and carol both use
              <span
                className="mx-1 rounded px-1 py-0.5 font-mono text-xs"
                style={{ background: tint(BAD, 14), color: BAD }}
              >
                hunter2
              </span>
              — so one stolen file also exposes every place they reused it.
            </li>
          </ul>
        </div>
      ) : (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: tint(GOOD, 40), background: tint(GOOD, 8) }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: GOOD }} />
            <p className="text-sm font-semibold text-text">
              Database leaked — attackers get almost nothing
            </p>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-dim">
            <li className="flex gap-2">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOOD }} />
              <span>
                <span className="font-medium text-text">One-way.</span> A bcrypt
                hash cannot be turned back into the password — there is no
                &quot;decrypt&quot; step.
              </span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOOD }} />
              <span>
                <span className="font-medium text-text">Salt hides reuse.</span>{" "}
                alice and carol share hunter2, yet their stored hashes are
                completely different because each row has its own salt. You
                cannot tell they match, and cracking one does not crack the
                other.
              </span>
            </li>
            <li className="flex gap-2">
              <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOOD }} />
              <span>
                <span className="font-medium text-text">Login still works.</span>{" "}
                Hash the typed password with that user&apos;s stored salt, then
                compare it to the stored hash — a match means the password was
                correct.
              </span>
            </li>
            <li className="flex gap-2">
              <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOOD }} />
              <span>
                <span className="font-medium text-text">Deliberately slow.</span>{" "}
                bcrypt and argon2 are tuned to be expensive, so testing billions
                of brute-force guesses costs attackers real time and money.
              </span>
            </li>
          </ul>
        </div>
      )}

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
        style={{ color: isPlain ? BAD : GOOD }}
      >
        {isPlain
          ? "Breach outcome: catastrophic. The leaked table hands attackers every password directly, and reused passwords are obvious at a glance."
          : "Breach outcome: contained. Attackers get only salted, one-way hashes — no passwords, no way to spot reuse, and each guess is slow and expensive to test."}
      </p>
    </div>
  );
}
