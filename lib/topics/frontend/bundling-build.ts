import type { TopicContent } from "@/lib/topics";

export const bundlingBuild: TopicContent = {
  slug: "bundling-build",
  tagline:
    "How a folder of hundreds of source files becomes the handful of optimized files a browser can actually download and run.",
  problem:
    "A modern web app isn't one file — it's hundreds of small modules, each importing others, written in TypeScript and JSX that no browser can execute directly. You can't just ship them as-is: fetching hundreds of files one request at a time would make the page crawl, and even if you did, the browser has no idea what a .tsx file or an import './Button' means. Something has to run between 'code you wrote' and 'code the browser loads' — turning that pile of source into a few small files a browser understands and downloads fast. What runs, and what does it produce?",
  demo: "bundler",
  how: [
    {
      type: "para",
      text: "Between writing code and shipping it sits a build step, run by a tool called a bundler — Vite, webpack, esbuild, or Turbopack. It starts at one entry file and follows every import statement, then the imports of those files, and so on, until it has mapped the whole module graph: every file your app actually reaches. Anything nothing imports simply isn't in the graph.",
    },
    {
      type: "para",
      text: "For each file in the graph it transpiles the parts browsers don't understand — TypeScript's types are stripped, JSX becomes plain function calls, modern syntax is rewritten so older engines can run it. Then it bundles: instead of hundreds of files fetched one at a time, related modules are concatenated into a few larger files, so the browser makes a handful of requests instead of hundreds.",
    },
    {
      type: "code",
      code: "app.tsx\n ├─ import { formatDate } from './utils'\n └─ import { Modal } from 'ui-lib'   // ui-lib has 5 exports\n\nafter tree-shaking:\n  kept    utils.formatDate        (imported)\n  kept    ui-lib.Modal            (imported)\n  dropped ui-lib.Drawer, Tabs,\n          Carousel, Tooltip       (never reached)",
      caption:
        "The bundler follows imports to build the graph, then drops any export nothing reaches.",
    },
    {
      type: "para",
      text: "From there it optimizes for size, because bytes are load time. Tree-shaking drops any exported code nothing imports — pull one helper out of a big library and only that helper ships. Minification strips whitespace and renames variables to single letters. Code splitting carves rarely-used routes into separate chunks that load only when needed. And because all this rewriting makes the shipped code unreadable, the bundler emits source maps so your browser's debugger can still point at your original lines.",
    },
    {
      type: "demo",
      demo: "bundler",
    },
    {
      type: "points",
      items: [
        "Resolve — follow imports from the entry file to build the module graph.",
        "Transpile — TypeScript, JSX, and modern JS become plain browser-ready JavaScript.",
        "Bundle — concatenate many modules into a few files, so it's a handful of requests, not hundreds.",
        "Tree-shake & minify — drop unused exports, then shrink what's left.",
        "Split & map — break out on-demand chunks, and emit source maps for debugging.",
      ],
    },
    {
      type: "note",
      text: "There are really two builds from the same source. The dev build favors speed and debuggability: unminified, with Hot Module Replacement that swaps a changed file into the running page in milliseconds. The prod build favors the user: fully transpiled, tree-shaken, minified, and split. Same code, two very different outputs.",
    },
  ],
  tradeoffs: {
    good: [
      "One command turns unshippable source (TS, JSX, hundreds of modules) into files any browser runs.",
      "Far fewer, far smaller downloads — the biggest single lever on page load time.",
      "Code splitting means users download only the code for the page they're actually on.",
      "Source maps let you debug your original code even though minified code ships.",
      "Dead code and unused library features are dropped automatically.",
    ],
    costs: [
      "A build step adds a compile phase between saving a file and seeing it run.",
      "The toolchain is real config surface — bundler, transpiler, and plugins to keep working together.",
      "Build time grows with the app; a slow build slows every deploy and CI run.",
      "Tree-shaking only works on static imports — dynamic requires and side effects can defeat it.",
      "It's easy to accidentally bundle a huge dependency and bloat the download without noticing.",
    ],
  },
  realWorld:
    "Every React, Vue, or Svelte app you've used was bundled — the dist/ or .next/ folder is the bundler's output, not your source. When a site feels slow to load, the usual suspect is an oversized JavaScript bundle, and the standard fixes are exactly the bundler's jobs: split the code, tree-shake harder, and lazy-load or drop heavy dependencies. `npm run build` is this whole pipeline in one command.",
  related: [
    {
      slug: "web-performance",
      note: "Bundle size is the single biggest lever on how fast a page loads.",
    },
    {
      slug: "client-routing-spa",
      note: "Code splitting usually happens along route boundaries — one chunk per page.",
    },
    {
      slug: "browser-rendering",
      note: "The browser can only start rendering once it has downloaded and parsed the bundled JS.",
    },
    {
      slug: "reactivity-rerender",
      note: "The framework runtime that drives re-renders is part of what gets bundled and shipped.",
    },
    {
      slug: "components-state",
      note: "The components you write in JSX are transpiled and stitched into the bundle.",
    },
  ],
};
