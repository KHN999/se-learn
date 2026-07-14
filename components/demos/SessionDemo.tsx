"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const SID = "sess_9f3a";
const STORED = '{ userId: 42, role: "user" }';

type Side = "browser" | "server";
type Wire = { dir: "toServer" | "toBrowser"; line: string; detail: string };
type Cookie = "none" | "live" | "dead";
type Glow = "create" | "read" | "delete" | null;

type Step = {
  actor: Side;
  browserStatus: string;
  serverStatus: string;
  cookie: Cookie;
  storeRow: boolean;
  glow: Glow;
  wire: Wire | null;
  note: string;
};

const STEPS: Step[] = [
  {
    actor: "browser",
    browserStatus: "Sending your credentials",
    serverStatus: "Waiting for a request",
    cookie: "none",
    storeRow: false,
    glow: null,
    wire: {
      dir: "toServer",
      line: "POST /login",
      detail: "username + password",
    },
    note: "Step 1 — The browser posts your username and password to the server. Nothing is stored yet.",
  },
  {
    actor: "server",
    browserStatus: "Waiting for a response",
    serverStatus: "Verified credentials, created a session",
    cookie: "none",
    storeRow: true,
    glow: "create",
    wire: null,
    note: `Step 2 — The server checks the password, generates a random id (${SID}…), and saves session[${SID}] = ${STORED} in its store.`,
  },
  {
    actor: "server",
    browserStatus: "Received and saved the cookie",
    serverStatus: "Sent a Set-Cookie header",
    cookie: "live",
    storeRow: true,
    glow: null,
    wire: {
      dir: "toBrowser",
      line: `Set-Cookie: sid=${SID}`,
      detail: "HttpOnly; Secure",
    },
    note: "Step 3 — Only the opaque id travels back as a cookie. HttpOnly hides it from JavaScript, Secure keeps it on HTTPS. The user data never leaves the server.",
  },
  {
    actor: "browser",
    browserStatus: "Requesting a protected page",
    serverStatus: "Waiting for a request",
    cookie: "live",
    storeRow: true,
    glow: null,
    wire: {
      dir: "toServer",
      line: "GET /account",
      detail: `Cookie: sid=${SID} (auto-sent)`,
    },
    note: "Step 4 — On the next visit the browser attaches the cookie automatically. It sends only the id — never the username or password again.",
  },
  {
    actor: "server",
    browserStatus: "Waiting for a response",
    serverStatus: "Looked up sid, found userId 42",
    cookie: "live",
    storeRow: true,
    glow: "read",
    wire: null,
    note: "Step 5 — The server reads the id from the cookie, finds the matching row in its store, and knows you are user 42 — no re-login required.",
  },
  {
    actor: "server",
    browserStatus: "Logged out",
    serverStatus: "Deleted the session record",
    cookie: "dead",
    storeRow: false,
    glow: "delete",
    wire: {
      dir: "toServer",
      line: "POST /logout",
      detail: `sid=${SID}`,
    },
    note: "Step 6 — Logout removes the row from the store. The browser may still hold the cookie, but the id no longer resolves to anyone — the session is dead.",
  },
];

const GLOW_LABEL: Record<Exclude<Glow, null>, string> = {
  create: "row created",
  read: "row read",
  delete: "row deleted",
};

export default function SessionDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const s = STEPS[Math.min(step, STEPS.length - 1)];
  const atEnd = step >= STEPS.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(
      () => setStep((v) => Math.min(v + 1, STEPS.length - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const browserActive = s.actor === "browser";
  const serverActive = s.actor === "server";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        How a login session works (server-side)
      </h3>
      <p className="mt-1 text-sm text-dim">
        You log in once. The server keeps the real state and hands your browser
        only an opaque id — a cookie that unlocks the row on every later request.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((v) => Math.min(v + 1, STEPS.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <span className="font-mono text-xs text-faint">
          step {step + 1} / {STEPS.length}
        </span>
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Browser column */}
        <div
          className="rounded-xl border p-3 transition-colors"
          style={{
            borderColor: browserActive ? color : "var(--color-line-soft)",
            background: browserActive ? tint(color, 6) : "var(--color-bg-2)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              Browser
            </span>
            {browserActive && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: tint(color, 16), color }}
              >
                acting
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text">{s.browserStatus}</p>
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              cookie jar
            </p>
            {s.cookie === "none" ? (
              <p className="mt-1 font-mono text-xs text-faint">
                (no cookie yet)
              </p>
            ) : (
              <div className="mt-1">
                <span
                  className="inline-block rounded-md px-2 py-1 font-mono text-xs"
                  style={
                    s.cookie === "dead"
                      ? {
                          background: "var(--color-bg-2)",
                          color: "var(--color-faint)",
                          textDecoration: "line-through",
                        }
                      : { background: tint(color, 12), color }
                  }
                >
                  sid={SID}
                </span>
                <span className="ml-2 text-[11px] text-faint">
                  {s.cookie === "dead"
                    ? "stale — no longer resolves"
                    : "HttpOnly · Secure"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Server column */}
        <div
          className="rounded-xl border p-3 transition-colors"
          style={{
            borderColor: serverActive ? color : "var(--color-line-soft)",
            background: serverActive ? tint(color, 6) : "var(--color-bg-2)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
              Server
            </span>
            {serverActive && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ background: tint(color, 16), color }}
              >
                acting
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text">{s.serverStatus}</p>
          <p className="mt-3 text-[11px] text-faint">
            Holds the real state. The browser never sees the user record — only
            the id that points at it.
          </p>
        </div>
      </div>

      {/* Wire */}
      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        {s.wire ? (
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={
                  s.wire.dir === "toServer"
                    ? "font-medium text-text"
                    : "text-faint"
                }
              >
                Browser
              </span>
              <span aria-hidden className="text-faint">
                {s.wire.dir === "toServer" ? "→" : "←"}
              </span>
              <span
                className={
                  s.wire.dir === "toServer"
                    ? "text-faint"
                    : "font-medium text-text"
                }
              >
                Server
              </span>
              <span
                className="ml-auto font-mono text-[10px] uppercase tracking-widest"
                style={{ color }}
              >
                {s.wire.dir === "toServer" ? "request →" : "← response"}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm text-text">{s.wire.line}</p>
            <p className="font-mono text-xs text-dim">{s.wire.detail}</p>
          </div>
        ) : (
          <p className="text-center text-xs text-faint">
            Nothing on the wire — the server is working locally.
          </p>
        )}
      </div>

      {/* Session store */}
      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            Session store · server-side
          </p>
          {s.glow && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: tint(color, 16), color }}
            >
              {GLOW_LABEL[s.glow]}
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-faint">
                  session id
                </th>
                <th className="border-b border-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-faint">
                  user
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false} mode="popLayout">
                {s.storeRow ? (
                  <motion.tr
                    key="row"
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background:
                        s.glow === "read" ? tint(color, 8) : "transparent",
                    }}
                  >
                    <td className="px-3 py-1.5 font-mono text-dim">{SID}</td>
                    <td className="px-3 py-1.5 font-mono text-dim">{STORED}</td>
                  </motion.tr>
                ) : (
                  <motion.tr
                    key="empty"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td
                      colSpan={2}
                      className="px-3 py-2 text-center font-mono text-xs text-faint"
                    >
                      {s.glow === "delete"
                        ? "session deleted — the id no longer resolves"
                        : "(no active sessions)"}
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {s.note}
      </p>

      <p className="mt-3 rounded-lg border border-line-soft bg-bg-2/50 px-3 py-2 text-xs leading-relaxed text-faint">
        Takeaway: the cookie carries only an opaque id — the real state lives in
        the server&apos;s store, so logout can revoke it instantly. A JWT is the
        stateless opposite: the state travels inside the signed token, which
        needs no lookup but is harder to revoke before it expires.
      </p>
    </div>
  );
}
