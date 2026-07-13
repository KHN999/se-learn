"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Compass,
  CornerDownLeft,
  Hash,
  LayoutGrid,
  Route,
  Search,
} from "lucide-react";
import { areas, tint, topics } from "@/lib/curriculum";
import { flows } from "@/lib/flows";
import { paths } from "@/lib/paths";

const FLOW_COLOR = "#43e0c8";

type Kind = "flow" | "area" | "topic" | "path";
type Item = {
  kind: Kind;
  title: string;
  sub: string;
  href: string;
  color: string;
};

// Everything navigable, built once. Flows link to their page, areas and topics
// to their (possibly stub) pages. Planned flows have no page, so they're left
// out to avoid dead ends.
const ITEMS: Item[] = [
  ...paths.map(
    (p): Item => ({
      kind: "path",
      title: p.title,
      sub: `Path · ${p.audience}`,
      href: `/paths/${p.id}`,
      color: p.color,
    }),
  ),
  ...flows.map(
    (f): Item => ({
      kind: "flow",
      title: f.question,
      sub: `Flow · ${f.title}`,
      href: `/flow/${f.slug}`,
      color: FLOW_COLOR,
    }),
  ),
  ...areas.map(
    (a): Item => ({
      kind: "area",
      title: a.title,
      sub: "Area",
      href: `/area/${a.id}`,
      color: a.color,
    }),
  ),
  ...topics.map(
    (t): Item => ({
      kind: "topic",
      title: t.title,
      sub: t.areaTitle,
      href: `/topic/${t.id}`,
      color: t.areaColor,
    }),
  ),
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function search(raw: string): Item[] {
  const query = raw.trim().toLowerCase();
  if (!query) {
    // Empty state: flows first (the marquee), then the area directory.
    return ITEMS.filter((i) => i.kind !== "topic");
  }
  const terms = query.split(/\s+/).filter(Boolean);
  const scored: { item: Item; score: number }[] = [];
  for (const item of ITEMS) {
    const title = item.title.toLowerCase();
    const hay = `${title} ${item.sub.toLowerCase()}`;
    if (!terms.every((t) => hay.includes(t))) continue;
    let score = 0;
    if (title.startsWith(query)) score += 100;
    if (title.includes(query)) score += 40;
    if (new RegExp(`\\b${escapeRegExp(query)}`).test(title)) score += 20;
    score += item.kind === "flow" ? 8 : item.kind === "topic" ? 5 : 3;
    score -= title.length * 0.05; // gently prefer shorter, more specific titles
    scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 40).map((s) => s.item);
}

const KIND_META: Record<Kind, { label: string; icon: typeof Hash }> = {
  path: { label: "Path", icon: Compass },
  flow: { label: "Flow", icon: Route },
  area: { label: "Area", icon: LayoutGrid },
  topic: { label: "Topic", icon: Hash },
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => search(query), [query]);
  // Clamp at read time instead of resetting state in an effect.
  const active = results.length ? Math.min(highlight, results.length - 1) : -1;

  const openPalette = useCallback(() => {
    setQuery("");
    setHighlight(0);
    setOpen(true);
  }, []);

  // Open via ⌘K / Ctrl+K anywhere, or a dispatched event (e.g. the hero button).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("se-open-search", openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("se-open-search", openPalette);
    };
  }, [open, openPalette]);

  // Focus the input and lock body scroll while open (no state writes here).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(item: Item) {
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (results.length ? (h + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) =>
        results.length ? (h - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) go(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <>
      {/* Trigger (lives in the header) */}
      <button
        onClick={openPalette}
        className="group flex items-center gap-2 rounded-lg border border-line bg-bg-2/70 px-3 py-1.5 text-sm text-faint transition-colors hover:border-line hover:text-dim"
        aria-label="Search topics"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search topics…</span>
        <kbd className="ml-1 hidden rounded border border-line bg-panel px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
          ⌘K
        </kbd>
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
              onKeyDown={onKeyDown}
            >
              <div
                className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
                <div className="flex items-center gap-3 border-b border-line px-4">
                  <Search className="h-4 w-4 shrink-0 text-faint" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search flows, areas, and topics…"
                    className="w-full bg-transparent py-4 text-text placeholder:text-faint focus:outline-none"
                  />
                  <kbd className="hidden rounded border border-line bg-bg-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
                    esc
                  </kbd>
                </div>

                <ul
                  ref={listRef}
                  className="thin-scroll max-h-[52vh] overflow-y-auto py-2"
                >
                  {results.length === 0 ? (
                    <li className="px-4 py-8 text-center text-sm text-faint">
                      No matches for &ldquo;{query}&rdquo;
                    </li>
                  ) : (
                    results.map((item, i) => {
                      const meta = KIND_META[item.kind];
                      const Icon = meta.icon;
                      const activeRow = i === active;
                      return (
                        <li key={`${item.kind}-${item.href}`} data-idx={i}>
                          <button
                            onClick={() => go(item)}
                            onMouseMove={() => setHighlight(i)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              activeRow ? "bg-accent/10" : ""
                            }`}
                          >
                            <span
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border"
                              style={{
                                color: item.color,
                                background: tint(item.color, activeRow ? 22 : 12),
                                borderColor: tint(item.color, activeRow ? 60 : 22),
                              }}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-text">
                                {item.title}
                              </span>
                              <span className="block truncate text-xs text-faint">
                                {item.sub}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-faint">
                              {meta.label}
                            </span>
                            {activeRow && (
                              <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-accent" />
                            )}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>

                <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] text-faint">
                  <span>↑↓ move</span>
                  <span>↵ open</span>
                  <span>esc close</span>
                  <span className="ml-auto">{results.length} results</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
