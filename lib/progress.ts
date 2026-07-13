// Client-side progress: a set of completed topic/flow slugs in localStorage.
// One global set, shared across every path (finishing a topic counts wherever
// it appears). Only call these from client components.

const KEY = "se-progress";

export function readProgress(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeProgress(p: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function toggleProgress(slug: string): Record<string, boolean> {
  const p = readProgress();
  if (p[slug]) delete p[slug];
  else p[slug] = true;
  writeProgress(p);
  return p;
}
