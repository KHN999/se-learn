import type { TopicContent } from "@/lib/topics";

export const browserRendering: TopicContent = {
  slug: "browser-rendering",
  tagline:
    "The pipeline that turns downloaded HTML, CSS, and JavaScript into the pixels you actually see.",
  problem:
    "The browser has finished downloading your page's HTML, CSS, and JavaScript — a pile of text files sitting in memory. But text files aren't a web page; nobody reads a stylesheet with their eyes. Something has to turn that text into positioned, colored pixels on the screen. And the order it happens in has real consequences: put a <script> tag in the <head> and the page can sit blank noticeably longer before anything shows up. What are the steps between 'files downloaded' and 'pixels visible,' and why does one tag in the wrong place stall them?",
  demo: "render-pipeline",
  how: [
    {
      type: "para",
      text: "The browser reads the HTML top to bottom and builds the DOM: a tree of nodes, one per tag, nested exactly the way the tags are. In parallel it reads the CSS and builds a second tree, the CSSOM, which records every style rule and which elements it applies to. Two separate trees — one for structure, one for style.",
    },
    {
      type: "para",
      text: "Neither tree can be shown on its own, so the browser combines them into the render tree: every visible node paired with the styles that win for it. (Nodes with display:none, and things like <head>, never make it in — they produce no pixels.) Then it runs layout, walking the render tree to compute the exact box for each node: its width, height, and x/y position. With geometry known it paints — filling in the actual pixels for text, colors, borders, and shadows onto layers. Finally the compositor stacks those layers in the right order and hands the finished frame to the screen. Parse → render tree → layout → paint → composite: that's the critical rendering path.",
    },
    {
      type: "para",
      text: "Two things stall this path. CSS is render-blocking: the browser won't paint until it has the full CSSOM, because painting with half the styles would flash unstyled, then restyled, content. Worse, a plain <script> is parser-blocking — when the HTML parser reaches one, it stops building the DOM, downloads and runs the script, and only then continues. A script in the <head> therefore freezes DOM construction before the <body> even exists, so the page stays blank longer. That's why scripts get defer (run after the DOM is built, in document order) or async (run whenever they arrive).",
    },
    {
      type: "code",
      code: "<!-- parser-blocking: DOM construction stops right here -->\n<head>\n  <script src=\"app.js\"></script>\n</head>\n\n<!-- defer: fetched now, run after the DOM is built -->\n<head>\n  <script src=\"app.js\" defer></script>\n</head>",
      caption:
        "A bare <script> pauses HTML parsing until it finishes; `defer` lets the parser keep building the DOM and runs the script once it's done.",
    },
    {
      type: "demo",
      demo: "render-pipeline",
    },
    {
      type: "points",
      items: [
        "DOM = tree built from HTML; CSSOM = tree built from CSS; render tree = the two combined, visible nodes only.",
        "Layout computes geometry (where and how big); paint fills pixels; composite stacks layers onto the screen.",
        "CSS blocks the first paint; a synchronous <script> blocks HTML parsing — reach for defer or async.",
        "Changing a layout property (width, top, font-size) forces reflow: layout and paint run again.",
      ],
    },
    {
      type: "note",
      text: "Layout and paint are the expensive stages. Reading a layout value (like offsetHeight) right after writing one forces the browser to recompute layout mid-frame; doing that in a loop is 'layout thrashing.' Animating transform and opacity sidesteps it entirely — those changes only touch the composite stage, so they stay smooth at 60fps.",
    },
  ],
  tradeoffs: {
    good: [
      "Incremental rendering — the browser can show a first paint before every byte has arrived.",
      "Separating layout from paint lets it repaint a color change without redoing geometry.",
      "The compositor can move and fade existing layers on the GPU, independent of layout and paint.",
      "A clear staged pipeline makes performance measurable: DevTools shows time spent in each stage.",
    ],
    costs: [
      "Layout thrashing: interleaving DOM reads and writes forces repeated reflows within one frame.",
      "Animating width/top/left triggers layout every frame instead of cheap compositing.",
      "A large render-blocking stylesheet, or a <script> in the <head>, delays the first paint.",
      "Deep, complex DOM trees make every layout and paint pass more expensive.",
    ],
  },
  tradeoffLabels: { good: "What it enables", costs: "Common mistakes" },
  realWorld:
    "Every 'why is my page slow to appear' or 'why does this animation stutter' question comes back to this pipeline. In Chrome DevTools' Performance panel you can literally see the Layout, Paint, and Composite bars; a janky scroll is usually Layout firing every frame because something animates a geometry property instead of transform. Moving scripts to defer and animating with transform/opacity are the two most common fixes.",
  related: [
    { slug: "html-dom", note: "The DOM tree is the first thing the pipeline builds — from your HTML." },
    { slug: "css-layout", note: "CSS becomes the CSSOM and drives the layout stage's geometry." },
    { slug: "dom-events", note: "JavaScript that runs can mutate the DOM and trigger fresh layout and paint." },
    { slug: "web-performance", note: "First paint, reflows, and jank are all measured against this pipeline." },
    { slug: "reactivity-rerender", note: "Frequent re-renders push DOM changes that force re-layout and repaint." },
  ],
};
