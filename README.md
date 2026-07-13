# SE-Map

An interactive map of software engineering. Instead of teaching topics in
isolation, it shows how they connect: follow one real thing that happens (a
web request, a login, a message in a chat) stop by stop, or jump to any of
~150 concepts and see where it fits, why it exists, and what it trades off.

> **Status:** early. The structure, navigation, and interactions are in place;
> most topic content is a first draft and still needs an accuracy review before
> it should be treated as authoritative.

## What's inside

- **Flows** — seven end-to-end stories you step through interactively
  (request, login, save-conflict, scaling, deploy, real-time chat, search).
- **Topics** — ~150 deep-dive pages, each answering the same seven questions
  (where it fits, what happens, why it exists, how it works, in/out, the
  tradeoff, what connects to it), grouped into 22 color-coded areas.
- **Learning paths** — five guided routes (fundamentals, backend, frontend,
  devops, system design) with progress saved in the browser.
- **Navigation** — a ⌘K command palette over every flow, area, topic, and path;
  a browsable area directory; per-topic neighbourhood graphs.
- **Interactive demos** — e.g. the index vs. full-table-scan simulator.
- **Themes** — four (Midnight, Slate, Paper, Sepia), persisted locally.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion. Fully static — no database, no auth, no external services.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed URL (default http://localhost:3000).

## Structure

- `lib/curriculum.ts` — the 22 areas and ~150 topics (the index/nav model).
- `lib/topics.ts` + `lib/topics/*.ts` — deep-dive content per topic.
- `lib/flows.ts` + `lib/flows/*.ts` — the interactive flows.
- `lib/paths.ts` — the learning paths.
- `app/` — routes (home, `flow/[slug]`, `topic/[slug]`, `area/[id]`, `paths`).
- `components/` — the explorer, palette, theme switcher, graphs, demos.
- `CONTENT.md` / `ROADMAP.md` — the content spec and build roadmap.
