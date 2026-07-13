# Demo standard (accessibility + quality)

Every interactive demo (`components/demos/*`) must meet this before it ships.
Applied as a first pass to the existing 17 demos; required for all new ones.

## Accessibility

1. **Labels** — every `<input>` / `<select>` has a visible `<label>` or an
   `aria-label`.
2. **Toggle state** — buttons that toggle a mode expose `aria-pressed`
   (segmented controls) so assistive tech announces what's selected.
3. **Live results** — the element that changes as the demo runs (the note /
   result line) is a polite live region: `role="status" aria-live="polite"`.
4. **Diagrams** — every `<svg>` has `role="img"` and an `aria-label` describing
   what it shows (a screen reader can't read the shapes).
5. **Not color alone** — state is also carried by text/label/icon, never color
   only (active nodes say "running", found says "found", etc.).
6. **Keyboard** — all controls are real `<button>`/`<input>` (focusable,
   Enter/Space work); focus is visible (global `:focus-visible` ring).
7. **Reduced motion** — respect `prefers-reduced-motion`: CSS transitions are
   already disabled globally; stepped JS animations should present final state
   without the timed intermediate steps. *(Standard defined; JS-animation
   handling still to be completed across demos.)*

## Content shape (every lesson)

Problem → minimal model → code → animated execution → limitations → connections.

- Problem-first (a concrete scenario, not a definition).
- Accuracy: hash lookups are **average O(1)**; tree ops are O(log n) **when
  balanced**; state where costs are worst-case vs. average.
- Tradeoffs use honest labels: "What it enables / Common mistakes" for
  foundational skills, "Strengths / Weaknesses" for data structures.

## Registry

- Add the demo id to the `DemoId` union in `lib/topics.ts`.
- Add the component to the `DEMOS` registry in `app/topic/[slug]/page.tsx`
  (typed `satisfies Record<DemoId, …>`, so a missing entry is a build error).
