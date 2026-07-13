import type { TopicContent } from "@/lib/topics";

export const domEvents: TopicContent = {
  slug: "dom-events",
  tagline:
    "How a click, key, or tap becomes something your code can respond to — and how it travels through the page.",
  problem:
    "A page shows a card, and inside that card sits a 'Delete' button. The user clicks the button — but that click doesn't land on the button alone. It lands on the button, which sits in the card, which sits in the page, all at once. If several of those elements have their own click handler, which one runs, and in what order? And how does your code know it was the button, specifically, that was pressed? Without a clear model, wiring up interaction is guesswork.",
  demo: "event-bubbling",
  how: [
    {
      type: "para",
      text: "A page becomes interactive when you attach handlers to it. element.addEventListener('click', fn) tells the browser: when a click happens on this element, call this function. When it fires, the browser hands your function an event object — a description of what happened: which element, which mouse button or key, the coordinates, and methods to influence what happens next.",
    },
    {
      type: "para",
      text: "A click doesn't fire on just one element, though — it travels through the whole chain of nested elements in two passes. First the capture phase runs top-down, from the document root inward to the element you actually clicked. Then the bubble phase runs the other way, from that element back up through every ancestor, firing each one's handler in turn. Throughout, event.target stays fixed to what was actually clicked, while event.currentTarget points to whichever element's handler is running right now.",
    },
    {
      type: "code",
      code: "// direct: one handler bound to one element\nbutton.addEventListener('click', (e) => {\n  e.preventDefault();          // cancel the browser's default action\n  console.log(e.currentTarget); // the element this handler is bound to\n});\n\n// delegation: ONE handler on the parent serves every child,\n// including rows added to the list later\nlist.addEventListener('click', (e) => {\n  const row = e.target.closest('li'); // what was actually clicked\n  if (row) select(row);\n});",
      caption:
        "One handler on the element itself, versus one on the parent that serves every child — now and in the future.",
    },
    {
      type: "demo",
      demo: "event-bubbling",
    },
    {
      type: "para",
      text: "That bubbling is what makes event delegation possible: instead of binding a listener to each of a hundred rows, you bind one to their shared parent and read event.target to see which row was hit. Two more tools ride on the event object. preventDefault() cancels the browser's built-in reaction — following a link, submitting a form — without stopping the event's travel. stopPropagation() does the opposite: it lets the default happen but halts the bubble, so no ancestor handler above the current one ever runs.",
    },
    {
      type: "points",
      items: [
        "Capture runs top-down from the document to the target; the bubble phase then runs bottom-up through every ancestor.",
        "event.target is what was clicked; event.currentTarget is the element whose handler is running right now.",
        "Delegation: one listener on a parent handles all its children — even ones added to the DOM later.",
        "preventDefault() cancels the default browser action; it does not stop propagation.",
        "stopPropagation() halts the bubble so ancestor handlers never fire; it does not cancel the default action.",
      ],
    },
    {
      type: "note",
      text: "Reach for delegation whenever a list grows or changes at runtime — you never rewire listeners as rows come and go. But use stopPropagation sparingly: it silently kills every handler further up the tree, and a click that mysteriously 'does nothing' is often one that was quietly stopped three levels down.",
    },
  ],
  tradeoffs: {
    good: [
      "A single delegated listener can serve thousands of elements, and any added later, at near-zero cost.",
      "Handlers can inspect exactly what was clicked via event.target while staying bound to a stable parent.",
      "preventDefault lets you replace default browser behavior with your own — custom form handling, in-app navigation.",
      "The same bubbling model powers every framework's onClick; React attaches just one listener near the root and lets events bubble to it.",
    ],
    costs: [
      "Overusing stopPropagation breaks unrelated features that legitimately listen higher up — a classic 'why did nothing happen?' bug.",
      "Confusing target with currentTarget: reading target when a child was clicked gives you the wrong element.",
      "Binding a fresh listener per row instead of delegating — memory grows with the list, and you must remember to remove each one.",
      "Forgetting that preventDefault and stopPropagation are different jobs: one cancels the default, the other stops the travel.",
    ],
  },
  tradeoffLabels: { good: "What it enables", costs: "Common mistakes" },
  realWorld:
    "Every button, form, menu, and drag interaction on the web runs through this. When a click 'does nothing,' the DevTools Event Listeners panel and a stray stopPropagation are the first things to check; when a long, dynamic list feels sluggish, swapping per-row handlers for one delegated listener is the standard fix. React, Vue, and Svelte all sit directly on top of this exact model.",
  related: [
    { slug: "html-dom", note: "The tree of nodes that events travel down and back up through." },
    { slug: "components-state", note: "What a handler usually does — update state, which triggers a re-render." },
    { slug: "reactivity-rerender", note: "How a state change from an event becomes a visible update on screen." },
    { slug: "browser-rendering", note: "The default actions and repaints an event can set off." },
    { slug: "accessibility", note: "Keyboard and screen-reader events matter as much as mouse clicks." },
  ],
};
