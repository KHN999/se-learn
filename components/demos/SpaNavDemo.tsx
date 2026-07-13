"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw, Server, Zap } from "lucide-react";
import { tint } from "@/lib/curriculum";

type NavKey = "home" | "about" | "contact";

const PAGES: Record<
  NavKey,
  { path: string; label: string; title: string; body: string }
> = {
  home: {
    path: "/",
    label: "Home",
    title: "Welcome home",
    body: "The landing page. The header, nav, and styles here are identical on every page.",
  },
  about: {
    path: "/about",
    label: "About",
    title: "About us",
    body: "Only this middle section is different from Home — everything around it is the same.",
  },
  contact: {
    path: "/contact",
    label: "Contact",
    title: "Contact us",
    body: "Same shell again. In an SPA, only this content block needed to change.",
  },
};

const NAV: NavKey[] = ["home", "about", "contact"];

export default function SpaNavDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<"mpa" | "spa">("mpa");
  const [page, setPage] = useState<NavKey>("home");
  const [pending, setPending] = useState<NavKey | null>(null);
  // "Full page loads" — the initial visit already cost one (the shell + bundle).
  const [loads, setLoads] = useState(1);
  const [lastRender, setLastRender] = useState<"" | "full" | "swap">("");

  const loading = pending !== null;
  const shown = pending ?? page;

  // Reset the walkthrough when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setPage("home");
    setPending(null);
    setLoads(1);
    setLastRender("");
  }

  // Commit a navigation after a short delay so the round trip is visible.
  // (A timed transition, not derived state.)
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(
      () => {
        setPage(pending);
        setPending(null);
      },
      mode === "mpa" ? 700 : 350,
    );
    return () => clearTimeout(t);
  }, [pending, mode]);

  const navigate = (target: NavKey) => {
    if (pending || target === page) return;
    if (mode === "mpa") {
      setLoads((n) => n + 1);
      setLastRender("full");
    } else {
      setLastRender("swap");
    }
    setPending(target);
  };

  const reset = () => {
    setPage("home");
    setPending(null);
    setLoads(1);
    setLastRender("");
  };

  const current = PAGES[shown];
  const mechanism = loading
    ? mode === "mpa"
      ? `GET ${current.path} → asking the server for a whole new page`
      : `history.pushState('${current.path}') → URL changed, no request for a page`
    : "History API keeps the URL and the back button in sync";

  const status = loading
    ? mode === "mpa"
      ? `Full reload: the whole browser view blanks while the server sends a fresh ${current.label} page.`
      : `In-place: only the content area updates — fetching a little data (JSON), no reload.`
    : mode === "mpa"
      ? `On ${PAGES[page].label}. Full page loads so far: ${loads}. In an MPA, every link click reloads the entire page.`
      : `On ${PAGES[page].label}. Full page loads so far: ${loads}. After the first load, an SPA just swaps the content — the counter stays put.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        One click, two very different navigations
      </h3>
      <p className="mt-1 text-sm text-dim">
        Click the nav links inside the little browser. Watch the &ldquo;full page
        loads&rdquo; counter and what re-renders — the same clicks behave
        completely differently in each mode.
      </p>

      {/* Mode toggle */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(
          [
            { key: "mpa", label: "Multi-page (MPA)" },
            { key: "spa", label: "Single-page (SPA)" },
          ] as const
        ).map((m) => {
          const on = m.key === mode;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
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
              {m.label}
            </button>
          );
        })}
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> reset
        </button>
      </div>

      {/* Browser mock */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-bg-2/50">
        {/* Chrome: traffic lights + address bar */}
        <div className="flex items-center gap-2 border-b border-line bg-bg-2 px-3 py-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </span>
          <span className="flex flex-1 items-center gap-2 rounded-md border border-line-soft bg-panel px-2.5 py-1 font-mono text-xs text-dim">
            {loading && (
              <RefreshCw className="h-3 w-3 animate-spin text-faint" aria-hidden />
            )}
            example.com{current.path}
          </span>
        </div>

        {/* Nav links — blanked entirely during an MPA reload */}
        {loading && mode === "mpa" ? (
          <div className="flex gap-1.5 border-b border-line-soft px-3 py-2">
            <span className="h-6 w-14 animate-pulse rounded-md bg-line" />
            <span className="h-6 w-14 animate-pulse rounded-md bg-line" />
            <span className="h-6 w-16 animate-pulse rounded-md bg-line" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line-soft px-3 py-2">
            {NAV.map((key) => {
              const active = key === shown;
              return (
                <button
                  key={key}
                  onClick={() => navigate(key)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "text-bg"
                      : "border border-line text-dim hover:text-text"
                  }`}
                  style={active ? { background: color } : undefined}
                >
                  {PAGES[key].label}
                </button>
              );
            })}
            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-faint">
              nav (part of the shell)
            </span>
          </div>
        )}

        {/* Content area */}
        <div className="min-h-[112px] p-4">
          {loading && mode === "mpa" ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
              <RefreshCw
                className="h-5 w-5 animate-spin text-faint"
                aria-hidden
              />
              <p className="text-sm text-dim">
                Reloading — the whole page is being re-fetched and rebuilt.
              </p>
            </div>
          ) : loading && mode === "spa" ? (
            <div className="space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-line" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-line-soft" />
              <p className="pt-1 text-xs text-faint">
                Fetching just the data for this view…
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-text">{current.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-dim">
                {current.body}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mechanism label + stats */}
      <p className="mt-3 font-mono text-[11px] text-faint">{mechanism}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2.5">
          <Server className="h-4 w-4 shrink-0 text-dim" aria-hidden />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              full page loads
            </p>
            <p className="text-sm font-semibold text-text">{loads}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2.5">
          <Zap className="h-4 w-4 shrink-0 text-dim" aria-hidden />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
              last click re-rendered
            </p>
            <p className="text-sm font-semibold text-text">
              {lastRender === "full"
                ? "The entire page (nav + layout + content)"
                : lastRender === "swap"
                  ? "The content area only"
                  : "— (nothing yet)"}
            </p>
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
