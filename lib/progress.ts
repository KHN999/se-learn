// Client-side progress: a set of completed topic/flow slugs in localStorage.
// One global set, shared across every path (finishing a topic counts wherever
// it appears). Exposed to React via useSyncExternalStore so components read it
// without setState-in-effect and stay in sync when it changes.

import { useSyncExternalStore } from "react";

const KEY = "se-progress";
const EVENT = "se-progress-change";

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
  window.dispatchEvent(new Event(EVENT));
}

export function toggleProgress(slug: string): Record<string, boolean> {
  const p = readProgress();
  if (p[slug]) delete p[slug];
  else p[slug] = true;
  writeProgress(p);
  return p;
}

// --- React external store ---------------------------------------------------

const EMPTY: Record<string, boolean> = {};
let cache: Record<string, boolean> = EMPTY;
let cacheRaw = "";

function snapshot(): Record<string, boolean> {
  const raw =
    typeof window === "undefined"
      ? "{}"
      : window.localStorage.getItem(KEY) || "{}";
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = JSON.parse(raw);
    } catch {
      cache = {};
    }
  }
  return cache;
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useProgress(): Record<string, boolean> {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
