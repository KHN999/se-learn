"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Line = { text: string; hi?: boolean };
type Step = {
  label: string;
  actor: "browser" | "server";
  dir: "request" | "response" | "store";
  lines: Line[];
  jar: string | null;
  note: string;
};

const steps: Step[] = [
  {
    label: "First visit",
    actor: "browser",
    dir: "request",
    lines: [
      { text: "GET /account HTTP/1.1" },
      { text: "Host: example.com" },
      { text: "(no Cookie header)" },
    ],
    jar: null,
    note: "You open /account for the first time. The request carries no Cookie header, so the server has no idea who you are — HTTP on its own is stateless and forgets you between requests.",
  },
  {
    label: "Server sets a cookie",
    actor: "server",
    dir: "response",
    lines: [
      { text: "HTTP/1.1 200 OK" },
      { text: "Set-Cookie: session=abc123", hi: true },
    ],
    jar: null,
    note: "The server responds and includes a Set-Cookie header, handing your browser a session id. Nothing is stored yet — the cookie is still on the wire.",
  },
  {
    label: "Browser stores it",
    actor: "browser",
    dir: "store",
    lines: [
      { text: "// nothing on the wire" },
      { text: "browser writes cookie → jar" },
    ],
    jar: "session=abc123",
    note: "The browser reads Set-Cookie and saves session=abc123 in its cookie jar, scoped to this site. That jar is the memory plain HTTP lacks.",
  },
  {
    label: "Next request auto-sends it",
    actor: "browser",
    dir: "request",
    lines: [
      { text: "GET /account HTTP/1.1" },
      { text: "Host: example.com" },
      { text: "Cookie: session=abc123", hi: true },
    ],
    jar: "session=abc123",
    note: "On the very next request the browser AUTOMATICALLY attaches Cookie: session=abc123 — you did nothing. Every future request to this site carries it along.",
  },
  {
    label: "Server recognizes you",
    actor: "server",
    dir: "response",
    lines: [
      { text: "HTTP/1.1 200 OK" },
      { text: "Welcome back — you are logged in." },
    ],
    jar: "session=abc123",
    note: "The server looks up session=abc123 and knows it is you — welcome back. Because the cookie rides along automatically on every request, protective flags exist: HttpOnly stops JavaScript from reading it (blunting XSS theft) and SameSite stops it being sent on cross-site requests (blunting CSRF).",
  },
];

const dirLabel: Record<Step["dir"], string> = {
  request: "browser → server  (request)",
  response: "server → browser  (response)",
  store: "inside the browser",
};

export default function CookieDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const cur = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const browserActing = cur.actor === "browser";
  const serverActing = cur.actor === "server";

  const side = (acting: boolean) => ({
    borderColor: acting ? color : "var(--color-line)",
    background: acting ? tint(color, 8) : "transparent",
  });

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        How a cookie makes stateless HTTP remember you
      </h3>
      <p className="mt-1 text-sm text-dim">
        HTTP forgets you after every request. Watch the server hand your browser
        a cookie, and the browser send it back automatically from then on.
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
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
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
          aria-label="reset"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          <div
            className="rounded-xl border p-3 transition-colors"
            style={side(browserActing)}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              🌐 Browser
            </p>
            <p className="mt-1 text-sm text-text">
              {cur.jar ? "Holds your session cookie" : "No session yet"}
            </p>
          </div>

          <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
              🍪 cookie jar
            </p>
            <div className="flex min-h-[28px] items-center">
              <AnimatePresence initial={false} mode="popLayout">
                {cur.jar ? (
                  <motion.span
                    key="pill"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs"
                    style={{ borderColor: tint(color, 45), background: tint(color, 16), color }}
                  >
                    {cur.jar}
                  </motion.span>
                ) : (
                  <motion.span
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-mono text-xs text-faint"
                  >
                    empty
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border p-3 transition-colors"
          style={side(serverActing)}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
            🖥️ Server
          </p>
          <p className="mt-1 text-sm text-text">
            {atEnd
              ? "Recognizes session=abc123"
              : "Stateless — remembers nothing on its own"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          {dirLabel[cur.dir]}
        </p>
        <AnimatePresence initial={false} mode="wait">
          <motion.pre
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="thin-scroll overflow-x-auto font-mono text-sm leading-relaxed"
          >
            {cur.lines.map((ln, i) => (
              <div
                key={i}
                className={ln.hi ? "font-semibold" : "text-dim"}
                style={ln.hi ? { color } : undefined}
              >
                {ln.text}
              </div>
            ))}
          </motion.pre>
        </AnimatePresence>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cur.note}
      </p>
    </div>
  );
}
