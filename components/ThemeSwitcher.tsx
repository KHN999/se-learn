"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette } from "lucide-react";

type ThemeDef = {
  id: string;
  name: string;
  hint: string;
  swatches: [string, string, string]; // bg, accent, text
};

const THEMES: ThemeDef[] = [
  { id: "midnight", name: "Midnight", hint: "deep dark", swatches: ["#0a0e1a", "#6ea8ff", "#e5eafc"] },
  { id: "slate", name: "Slate", hint: "soft dark", swatches: ["#181b21", "#7aa2f7", "#e2e6ee"] },
  { id: "paper", name: "Paper", hint: "light, high contrast", swatches: ["#faf8f4", "#2f6bd8", "#23272f"] },
  { id: "sepia", name: "Sepia", hint: "warm reading", swatches: ["#f3ead6", "#b4530a", "#3b3423"] },
];

const STORAGE_KEY = "se-theme";
const THEME_EVENT = "se-theme-change";

function themeSnapshot(): string {
  if (typeof document === "undefined") return "midnight";
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }
  return saved || document.documentElement.getAttribute("data-theme") || "midnight";
}

function themeSubscribe(cb: () => void): () => void {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(themeSubscribe, themeSnapshot, () => "midnight");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function apply(id: string) {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(THEME_EVENT));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-line bg-bg-2/70 px-2.5 py-1.5 text-faint transition-colors hover:text-dim"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[90] mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel p-1.5 shadow-2xl"
        >
          <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
            Theme
          </p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => apply(t.id)}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent/10"
            >
              <span className="flex -space-x-1.5">
                {t.swatches.map((c, i) => (
                  <span
                    key={i}
                    style={{ background: c }}
                    className="h-4 w-4 rounded-full border border-line"
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-text">{t.name}</span>
                <span className="block text-xs text-faint">{t.hint}</span>
              </span>
              {theme === t.id && (
                <Check className="h-4 w-4 shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
