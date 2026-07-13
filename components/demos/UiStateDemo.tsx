"use client";

import { useState } from "react";
import { ArrowRight, Heart, Moon, Plus, RotateCcw, Sun } from "lucide-react";
import { tint } from "@/lib/curriculum";

type Theme = "light" | "dark";

export default function UiStateDemo({ color }: { color: string }) {
  // The single source of truth. Everything on the right is derived from this.
  const [likes, setLikes] = useState(3);
  const [liked, setLiked] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  // Toggling the like is an event that flows UP and changes state.
  const toggleLike = () => {
    setLikes((n) => (liked ? n - 1 : n + 1));
    setLiked((was) => !was);
  };

  const reset = () => {
    setLikes(3);
    setLiked(false);
    setTheme("dark");
  };

  // --- Derived from state during render. Never stored, so it can't drift. ---
  const label = liked ? "Liked" : "Like";
  const isDark = theme === "dark";
  const ui = isDark
    ? { bg: "#17171c", panel: "#212129", fg: "#e9e9ee", sub: "#9a9aa4" }
    : { bg: "#f4f4f7", panel: "#ffffff", fg: "#1a1a1f", sub: "#6b6b73" };

  const stateText = `{\n  likes: ${likes},\n  liked: ${liked},\n  theme: "${theme}",\n}`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        UI = f(state): change the state, the UI recomputes
      </h3>
      <p className="mt-1 text-sm text-dim">
        The state on the left is the only source of truth. The button on the
        right is <em>computed</em> from it — you never edit the DOM by hand.
      </p>

      {/* Controls: each one changes STATE, not the screen. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-faint">
          change state
        </span>
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          aria-label="Toggle theme"
          aria-pressed={isDark}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          theme: {theme}
        </button>
        <button
          onClick={() => setLikes((n) => n + 1)}
          aria-label="Add one like"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text"
        >
          <Plus className="h-3.5 w-3.5" /> like
        </button>
        <button
          onClick={reset}
          aria-label="Reset state"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {/* STATE — the source of truth */}
        <div className="flex-1 rounded-xl border border-line-soft bg-bg-2/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            state · source of truth
          </p>
          <pre className="font-mono text-sm leading-relaxed text-dim">
            {stateText}
          </pre>
        </div>

        {/* The function that maps state → UI */}
        <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-1 text-center">
          <span className="font-mono text-[11px]" style={{ color }}>
            render(state)
          </span>
          <ArrowRight
            className="h-5 w-5 rotate-90 sm:rotate-0"
            style={{ color: tint(color, 55) }}
            aria-hidden="true"
          />
        </div>

        {/* RENDERED UI — purely derived from state */}
        <div className="flex-1 rounded-xl border border-line-soft p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            rendered ui · derived
          </p>
          <div
            className="flex items-center justify-center rounded-lg p-5 transition-colors"
            style={{ background: ui.bg }}
          >
            <button
              onClick={toggleLike}
              aria-pressed={liked}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-0.5"
              style={{
                background: liked ? tint(color, isDark ? 22 : 16) : ui.panel,
                color: liked ? color : ui.fg,
                borderColor: liked ? tint(color, 55) : tint(ui.sub, 40),
              }}
            >
              <Heart
                className="h-4 w-4"
                style={{ color: liked ? color : ui.sub }}
                fill={liked ? color : "none"}
                aria-hidden="true"
              />
              {label} · {likes}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px]" style={{ color: ui.sub }}>
            heart, label, count &amp; colors are all computed from state
          </p>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        You changed <span className="font-mono text-text">state</span> —{" "}
        {liked ? "liked is true" : "liked is false"}, likes is {likes}, theme is{" "}
        {theme}. You never touched the DOM: the framework re-ran{" "}
        <span className="font-mono text-text">render(state)</span> and made the
        button match. Clicking the button itself is an event that flows up and
        changes state, which renders again.
      </p>
    </div>
  );
}
