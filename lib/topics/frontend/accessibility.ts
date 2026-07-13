import type { TopicContent } from "@/lib/topics";

export const accessibility: TopicContent = {
  slug: "accessibility",
  tagline:
    "Building interfaces that everyone can use — including people who can't see the screen or reach the mouse.",
  problem:
    "You need a clickable control, so you take a <div>, style it to look exactly like a button, and wire up an onclick. On screen it's indistinguishable from the real thing, and with a mouse it works fine. But a keyboard user can never move focus to it — Tab skips right past — and even if they could, Enter and Space do nothing. A blind user's screen reader reaches it and announces… nothing useful, because a bare <div> has no name and no role. The control is invisible to everyone who isn't pointing a mouse at it. You've silently excluded people — and in many places, quietly broken the law. How do you build UIs that work for all of them?",
  demo: "a11y-tree",
  how: [
    {
      type: "para",
      text: "Accessibility (often shortened to a11y) means people can use your interface regardless of how they perceive or operate it — with a screen reader, a keyboard only, voice control, or low vision. The single biggest lever is semantic HTML: using the element that actually means what you're doing. A <button> is focusable, appears in the tab order, fires on Enter and Space, and reports itself to assistive tech as \"a button\" — all for free. A styled <div> gives you none of that, because you have to rebuild every one of those behaviors by hand, and almost nobody does.",
    },
    {
      type: "para",
      text: "The reason a screen reader knows anything at all is the accessibility tree: a second structure the browser derives from your DOM, exposing each element's role (button, link, heading), its accessible name (\"Submit\", or an image's alt text), and its state (checked, disabled, expanded). Assistive tech reads this tree, not your pixels. Semantic elements populate it correctly on their own; a generic <div> shows up as an anonymous \"generic\" node with no role and no name, so there's nothing meaningful to announce.",
    },
    {
      type: "code",
      code: '<!-- Looks like a button. Invisible to keyboard + screen reader. -->\n<div class="btn" onclick="submit()">Submit</div>\n\n<!-- Focusable, keyboard-operable, announced as "Submit, button". -->\n<button onclick="submit()">Submit</button>\n\n<img src="chart.png">              <!-- screen reader: silent, or reads the filename -->\n<img src="chart.png" alt="Q3 revenue up 12%">',
      caption:
        "The <div> and <button> render identical pixels, but only the <button> is reachable and announced. An <img> with no alt is a hole in the page; alt text fills it.",
    },
    {
      type: "demo",
      demo: "a11y-tree",
    },
    {
      type: "para",
      text: "Where no native element fits, ARIA attributes let you add roles, names, and state to fill the gap — but the first rule of ARIA is: don't use ARIA. A native <button> beats role=\"button\" on a <div> every time, because you'd still have to add tabindex and wire up your own key handlers to match what the browser already does. Alongside the right elements, two things people forget: every control needs a visible name (a <label> tied to its input, alt on images) and a visible focus ring so keyboard users can see where they are — never remove the outline without replacing it.",
    },
    {
      type: "points",
      items: [
        "Semantic HTML first: <button>, <a>, <nav>, <label>, headings — they bring roles, focus, and keyboard behavior for free.",
        "The accessibility tree is what assistive tech reads: role + accessible name + state, derived from your DOM.",
        "Every image needs alt text (empty alt=\"\" if purely decorative); every form field needs a real <label>.",
        "Everything must be operable by keyboard alone, with a visible focus indicator on whatever is focused.",
        "Never convey meaning by color alone, and keep text/background contrast high enough to read.",
        "Reach for ARIA only to fill gaps native HTML can't — the first rule of ARIA is don't use ARIA.",
      ],
    },
    {
      type: "note",
      text: "Accessibility isn't a niche add-on — it helps everyone. The same semantic structure improves SEO; captions help people in noisy rooms; keyboard operability speeds up power users; high contrast helps anyone in bright sunlight. Building it in from the start is far cheaper than retrofitting it after a complaint or a lawsuit.",
    },
  ],
  tradeoffs: {
    good: [
      "People using screen readers, keyboards, or low vision can actually use your product.",
      "Semantic HTML gives you focus, keyboard behavior, and correct roles with zero extra code.",
      "Better SEO and clearer markup — search crawlers read the same structure assistive tech does.",
      "Meets legal requirements (WCAG, ADA, EU Accessibility Act) that apply to most public sites.",
      "Accessible patterns tend to help everyone: captions, keyboard shortcuts, readable contrast.",
    ],
    costs: [
      "It takes deliberate effort and testing — with a keyboard and a real screen reader, not just a mouse.",
      "Custom widgets (menus, tabs, modals) need careful ARIA and focus management to get right.",
      "It's easy to do wrong: bad ARIA is often worse than none, misleading assistive tech.",
      "Automated checkers catch only a fraction of issues; the rest need human judgment.",
      "Retrofitting accessibility onto a div-soup codebase is expensive compared to building it in.",
    ],
  },
  realWorld:
    "Try navigating your own app with the mouse unplugged — Tab, Shift+Tab, Enter, Space — and you'll find controls you can't reach and focus you can't see. Turn on VoiceOver (Mac) or NVDA (Windows) and listen to a form: unlabeled fields read as just \"edit text.\" Most accessibility bugs trace back to a <div> that should have been a <button> or an <input> missing its <label> — which is exactly why choosing the right element is the highest-leverage habit a frontend engineer can build.",
  related: [
    {
      slug: "html-dom",
      note: "Assistive tech reads an accessibility tree the browser derives from this same DOM.",
    },
    {
      slug: "dom-events",
      note: "Keyboard operability means handling Enter/Space and focus, not just mouse clicks.",
    },
    {
      slug: "components-state",
      note: "Reusable components are where you bake accessible markup in — or bake bugs in everywhere.",
    },
    {
      slug: "css-layout",
      note: "Focus rings, contrast, and not hiding content from assistive tech are all styling decisions.",
    },
    {
      slug: "browser-rendering",
      note: "The browser builds the accessibility tree alongside the render tree from your DOM.",
    },
  ],
};
