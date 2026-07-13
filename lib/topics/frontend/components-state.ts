import type { TopicContent } from "@/lib/topics";

export const componentsState: TopicContent = {
  slug: "components-state",
  tagline:
    "The modern UI model: describe what the screen should look like for the current data, and let the framework keep them in sync.",
  problem:
    "Say the screen shows a like count and a heart. The old way to update it is to find the exact nodes and change them by hand: grab the count element, set its text to the new number; grab the heart, swap its icon; maybe toggle a class. That works for one button. But a real app has dozens of these, and the same piece of data shows up in several places at once. Every event has to remember every node it might affect, and it's on you to touch each one. Miss a spot and the screen quietly disagrees with the data. How do you keep what's on screen in step with your data without hand-patching the page after every change?",
  demo: "ui-state",
  how: [
    {
      type: "para",
      text: "The answer is to stop building the page once and then editing it. Instead you write a component: a reusable function that takes some inputs and returns a description of what the UI should look like. Give it different inputs and you get different UI back — and crucially, the same inputs always produce the same output. The screen becomes a function of your data: UI = f(state).",
    },
    {
      type: "para",
      text: "Two kinds of data feed that function. PROPS are inputs handed down from the parent — read-only from the child's point of view, exactly like function arguments. STATE is data the component owns and is allowed to change over time: the current count, whether a menu is open, what's typed in a box. Props flow in from outside; state lives inside. Together they are the input, and the returned UI is the output.",
    },
    {
      type: "code",
      code: 'function LikeButton({ likes, liked }) {\n  // props/state in → UI description out\n  return (\n    <button>\n      {liked ? "♥" : "♡"} {likes} likes\n    </button>\n  );\n}',
      caption:
        "A component is UI as a function of its inputs: same state in, same markup out — no manual DOM edits anywhere in sight.",
    },
    {
      type: "demo",
      demo: "ui-state",
    },
    {
      type: "para",
      text: "This is called declarative rendering. You never write \"find that node and set its text to 5.\" You describe what the UI should be for the current state, and the framework compares that description to what's already on screen and makes the real DOM match. There is one source of truth — the state — and the visible page is always just a view of it. Data moves in one direction: state flows down into child components as props, and events (a click, a keystroke) flow back up to change state. That single, predictable direction is what keeps a growing app from turning back into the tangle of manual updates you started with.",
    },
    {
      type: "points",
      items: [
        "A component is a function: inputs (props + state) go in, a description of UI comes out.",
        "Props are passed down from the parent and are read-only; state is owned by the component and can change.",
        "Declarative: you describe the UI for a given state and the framework makes the DOM match — you don't poke nodes yourself.",
        "One source of truth: the state. The screen is always recomputed from it, so the two can't drift apart.",
        "Unidirectional flow: state flows down as props, events flow up to change state.",
      ],
    },
    {
      type: "note",
      text: "Don't store what you can compute. If a value follows from existing state — a cart total, a filtered list, an \"is it empty?\" flag — derive it during render instead of keeping it as a second piece of state that can silently fall out of sync. And note the trigger: changing state is exactly what tells the framework to re-run the function and update the screen. How that re-render actually works is the next topic.",
    },
  ],
  tradeoffs: {
    good: [
      "The screen can't drift out of sync with the data — it's always recomputed from a single source of truth.",
      "You reason about one state at a time, not the countless click-by-click paths that led to it.",
      "Components are reusable and composable: write small functions of state, then nest them into bigger ones.",
      "Describing the target UI is far less error-prone than writing the step-by-step mutations to reach it.",
    ],
    costs: [
      "Re-running a description on every change isn't free; frameworks add machinery (a virtual DOM, diffing) to make it cheap.",
      "Deciding what belongs in state — and keeping it to one source of truth — takes real design thought.",
      "Duplicate a fact into two pieces of state instead of deriving it, and you reintroduce the exact sync bugs you were escaping.",
      "The framework re-runs your component often, so it must be a predictable function of its inputs — no hidden surprises.",
    ],
  },
  realWorld:
    "Every React, Vue, or Svelte app you've used works this way. When you tap a like button and the count ticks up, nobody wrote code to hunt down that number and change it — you changed a piece of state and the framework re-rendered the button from it. Once \"the UI is just a picture of the current state\" clicks, most frontend bugs collapse into a single question: is the state right?",
  related: [
    {
      slug: "reactivity-rerender",
      note: "What actually happens when state changes and the framework updates the screen.",
    },
    {
      slug: "html-dom",
      note: "The live tree the framework edits for you so you never touch nodes by hand.",
    },
    {
      slug: "dom-events",
      note: "The user events that flow up and become state changes.",
    },
    {
      slug: "state-management",
      note: "Where state lives once many components need to share the same source of truth.",
    },
    {
      slug: "browser-rendering",
      note: "How the UI you described finally becomes pixels on screen.",
    },
  ],
};
