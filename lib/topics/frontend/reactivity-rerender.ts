import type { TopicContent } from "@/lib/topics";

export const reactivityRerender: TopicContent = {
  slug: "reactivity-rerender",
  tagline:
    "How a framework turns a state change into the smallest possible edit to the real page.",
  problem:
    "You type into a search box and the results list updates as you go. The framework's promise is that your UI is just a function of state: describe what the page should look like for the current state, and it appears. But taken literally, that's alarming — if the whole UI is recomputed from state on every change, wouldn't rebuilding the entire page from scratch on each keystroke be far too slow? Redrawing thousands of DOM nodes sixty times a second would make the page crawl. So how does 'recompute everything' stay fast?",
  demo: "vdom-diff",
  how: [
    {
      type: "para",
      text: "The trick is that recomputing the UI and touching the real page are two different things. When state changes, the component function runs again and returns a NEW description of the UI — a lightweight tree of plain objects, often called a virtual DOM. Building that tree is cheap: it's just JavaScript in memory, no pixels involved.",
    },
    {
      type: "para",
      text: "Before changing anything on screen, the framework DIFFs the new tree against the previous one — a step called reconciliation. It walks both trees and works out the minimal set of real-DOM edits needed to turn the old page into the new one: this text node changed, that attribute flipped, this child was added. Then it applies only those patches. Everything that didn't change is left untouched.",
    },
    {
      type: "para",
      text: "This matters because the real DOM is the expensive part. Editing an element can force the browser to recompute layout and repaint — work that scales with how much of the page is affected. An in-memory object comparison is orders of magnitude cheaper, so trading a diff for avoided DOM work is a good deal.",
    },
    {
      type: "code",
      code: "// State changes → the component re-runs → a new tree is produced.\nsetCount(count + 1); // schedules a re-render\n\n// Lists need a stable `key` so the diff can match items across renders:\nitems.map((it) => <li key={it.id}>{it.text}</li>);\n// Without keys, reordering looks like \"everything changed\" and gets rebuilt.\n// With keys, the framework moves/patches the same node instead.",
      caption:
        "Calling setState re-runs the component; keys let the diff match list items between the old and new tree.",
    },
    {
      type: "demo",
      demo: "vdom-diff",
    },
    {
      type: "points",
      items: [
        "State change → the component re-runs and returns a new virtual tree.",
        "Reconciliation diffs new vs. old to find what actually changed.",
        "Only the differing nodes are patched onto the real DOM.",
        "Keys let list items be matched across renders — move and patch, not rebuild.",
        "Re-running a component is cheap; editing the real DOM is what costs.",
      ],
    },
    {
      type: "note",
      text: "The virtual DOM is not magic speed — the diff itself is work, and a needless re-render still runs it. That's why memoization exists: to skip re-running subtrees whose inputs didn't change. Some frameworks avoid the diff entirely — signals and other fine-grained reactivity track exactly which values a piece of UI depends on, so a change updates just those nodes with no tree comparison at all.",
    },
  ],
  tradeoffs: {
    good: [
      "You write UI as a function of state and let the framework find the edits.",
      "Only the parts of the page that changed are touched, keeping updates fast.",
      "Declarative code is easier to reason about than manual DOM manipulation.",
      "Keys make list updates (reorder, insert, remove) cheap and correct.",
    ],
    costs: [
      "The diff isn't free — large trees or frequent updates add up.",
      "Unnecessary re-renders still cost, so you reach for memoization to prune them.",
      "Missing or unstable keys silently cause wrong reuse and full rebuilds.",
      "The abstraction hides real-DOM cost, so performance bugs can be non-obvious.",
    ],
  },
  realWorld:
    "Every React, Vue, or similar app you use is doing this on each interaction. When a list 'flickers' or an input loses focus after an update, the usual cause is a missing or index-based key that broke the diff's ability to match items. Profiling tools that flag 'wasted renders' are pointing at components that re-ran and re-diffed without producing any real change.",
  related: [
    {
      slug: "components-state",
      note: "The state whose changes trigger a re-render in the first place.",
    },
    {
      slug: "html-dom",
      note: "The real tree of nodes that the diff produces patches against.",
    },
    {
      slug: "browser-rendering",
      note: "Why touching the real DOM is expensive: layout and paint.",
    },
    {
      slug: "state-management",
      note: "As state grows, where it lives shapes what re-renders and when.",
    },
    {
      slug: "web-performance",
      note: "Memoization and cutting wasted renders to keep updates smooth.",
    },
  ],
};
