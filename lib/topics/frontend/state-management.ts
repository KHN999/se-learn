import type { TopicContent } from "@/lib/topics";

export const stateManagement: TopicContent = {
  slug: "state-management",
  tagline:
    "Deciding where a piece of state should live — and resisting the urge to make it global.",
  problem:
    "Your app knows who's logged in and which theme they picked. A header at the top needs it, a sidebar off to the left needs it, and a settings modal that pops up somewhere else entirely needs it too. These three live far apart in the component tree, so there's no obvious shared parent to hang the value on. The only way to get it from where it's known to where it's used is to hand it down through every component in between — most of which don't care about it at all. That threading is tedious to write, easy to break when you refactor, and it only gets worse as the app grows. Where should this state actually live?",
  demo: "prop-drilling",
  how: [
    {
      type: "para",
      text: "State is just data that changes while your app runs — a counter, a form's contents, the logged-in user. The first and most important question is never how to store it but where it should live. The default answer is local: keep the state inside the single component that uses it. Local state is the easiest kind to reason about, because only one place can read or change it, and you can move or delete that component without touching anything else.",
    },
    {
      type: "para",
      text: "When two sibling components need the same value, you lift it up to their nearest common ancestor and pass it back down to each as a prop. That works cleanly while the components are close together. The trouble starts when the component that owns the value sits far above the one that needs it: the value has to travel down through every layer in between, and each of those layers must accept a prop and forward it even though it never reads it. This is prop drilling, and it couples a whole chain of unrelated components to data they don't use.",
    },
    {
      type: "para",
      text: "The fix is to let any component read the shared value directly, without threading it through the middle. React's Context does exactly this, and dedicated stores — Redux, Zustand, signals — do it too, holding state off to the side so any component can subscribe to it. One more distinction matters: a lot of what looks like global state is really server state (the current user, a list of orders) that came from an API. That's usually better kept in a data-fetching cache like React Query, which knows how to fetch, cache, and refresh it, than hand-copied into a client store where you'd have to manage staleness yourself.",
    },
    {
      type: "code",
      code: "// Prop drilling: Sidebar must accept and forward `user`…\nfunction Sidebar({ user }) {\n  return <UserBadge user={user} />; // …it never reads it itself.\n}\n\n// Shared store: Sidebar doesn't mention `user` at all.\nfunction Sidebar() {\n  return <UserBadge />;             // UserBadge reads it directly: useUser()\n}",
      caption:
        "With a store or Context, the intermediate components stop carrying props they don't use — the consumer reads the value straight from the source.",
    },
    {
      type: "demo",
      demo: "prop-drilling",
    },
    {
      type: "points",
      items: [
        "Default to local state — the component that uses a value should own it.",
        "Lift state to the nearest common ancestor when siblings must share it.",
        "Reach for Context or a store only when a shared value has to cross many layers that don't care about it.",
        "Data from an API is server state — let a data-fetching cache own it, not a hand-managed global store.",
      ],
    },
    {
      type: "note",
      text: "Global stores are overused. Most state is genuinely local, and putting everything in one global store makes an app harder to reason about — any component can change the value from anywhere, so a bug could originate almost anywhere. Reach for a store only when passing props around genuinely hurts, not by default.",
    },
  ],
  tradeoffs: {
    good: [
      "Local state keeps components self-contained — easy to understand, move, or delete in isolation.",
      "Lifting state to a common ancestor is the simplest way for siblings to stay in sync.",
      "Context or a store removes the tedious prop-forwarding through components that never use the value.",
      "A data-fetching cache handles loading, caching, and refetching of server data almost for free.",
    ],
    costs: [
      "Global state is harder to trace: a value can be changed from anywhere, so bugs are harder to pin down.",
      "Stores add indirection and boilerplate — worth it only once sharing genuinely hurts.",
      "A Context value that changes often can re-render every component that reads it, hurting performance.",
      "Dumping server data into a client store means re-implementing fetching and staleness by hand.",
    ],
  },
  realWorld:
    "Almost every team reaches for a global store too early, then spends months untangling state that never needed to be global. The rule they converge on is simple: keep state local, lift it when siblings share, and only introduce Context or a store like Zustand or Redux when a value is truly needed far apart. The theme, the logged-in user, and a shopping cart are the classic handful of things that earn a global home — most everything else is happier living close to where it's used.",
  related: [
    {
      slug: "components-state",
      note: "Where local state lives and how a single component owns its own data.",
    },
    {
      slug: "reactivity-rerender",
      note: "Why reading shared state can re-render more components than you expect.",
    },
    {
      slug: "client-routing-spa",
      note: "In an SPA the app stays mounted, so shared state persists as you move between pages.",
    },
    {
      slug: "accessibility",
      note: "Shared UI state — like whether a modal is open — drives the ARIA attributes assistive tech relies on.",
    },
  ],
};
