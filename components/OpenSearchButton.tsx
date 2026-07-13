"use client";

import { Search } from "lucide-react";

// A large, hero-style trigger that opens the global command palette by
// dispatching the same event CommandPalette listens for.
export default function OpenSearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("se-open-search"))}
      className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-panel/60 px-4 py-3 text-left text-dim transition-colors hover:border-accent/50"
    >
      <Search className="h-5 w-5 text-faint transition-colors group-hover:text-accent" />
      <span className="flex-1">Jump to any topic…</span>
      <kbd className="rounded border border-line bg-bg-2 px-2 py-1 font-mono text-xs text-faint">
        ⌘K
      </kbd>
    </button>
  );
}
