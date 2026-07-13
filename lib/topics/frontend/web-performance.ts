import type { TopicContent } from "@/lib/topics";

export const webPerformance: TopicContent = {
  slug: "web-performance",
  tagline:
    "Making a page feel fast — measured by what the user actually experiences, not by a passing build.",
  problem:
    "Your page loads. Nothing is broken — the data is right, the links work, the tests are green. But it feels slow. For the first second there's just a blank shell; the headline and the main image pop in one at a time, late. Then, right as you go to tap the 'Buy' button, an image finishes loading above it, the whole column jumps down, and your finger lands on the wrong thing. Technically everything works. So why does it feel cheap and frustrating — and what, exactly, do you measure to fix a feeling?",
  demo: "web-vitals",
  how: [
    {
      type: "para",
      text: "'Fast' isn't one number — it's a few distinct feelings, and Google's Core Web Vitals put a metric on each. LCP (Largest Contentful Paint) asks how soon the main thing you came for actually appears — the hero image or headline, not a spinner. INP (Interaction to Next Paint) asks how responsive the page feels when you click or type — does it react now, or freeze while some JavaScript grinds? CLS (Cumulative Layout Shift) asks whether the page holds still, or whether content keeps jumping around under you as things load. A page can score well on one and badly on another, which is why you track all three.",
    },
    {
      type: "para",
      text: "Each vital points at a lever. LCP is usually about the critical rendering path — the shortest route from 'HTML arrives' to 'main content painted' — so you shrink and split the JavaScript bundle (ship less, and only what this page needs), optimize images, and serve assets from a CDN edge near the user. INP is about not blocking the main thread with heavy work while the user is trying to interact. CLS is the cheapest to fix and the most ignored: reserve space for anything that loads late. When you give an image its width and height up front, the browser holds an empty box the right size, so when the pixels finally arrive nothing below has to move.",
    },
    {
      type: "code",
      code: "<!-- width + height let the browser reserve the box BEFORE the image loads -->\n<img\n  src=\"/hero.jpg\"\n  width=\"800\"\n  height=\"450\"   <!-- keeps a 16:9 slot → the button below never jumps -->\n  loading=\"lazy\" <!-- offscreen images wait until you scroll near them -->\n  alt=\"…\"\n/>",
      caption:
        "Setting width and height holds the space before the pixels arrive, so nothing shifts (CLS); loading=\"lazy\" defers offscreen images so they don't compete with the main content for bandwidth.",
    },
    {
      type: "demo",
      demo: "web-vitals",
    },
    {
      type: "para",
      text: "The last lever isn't code — it's how you measure. Your laptop on office wifi is not your user on a three-year-old phone on a train. Lab data (running a test in a controlled environment) is great for catching regressions before you ship, but it only describes one made-up device. Field data — Real User Monitoring, or RUM — records the vitals from actual visitors on their actual networks. The two often disagree, and when they do, the field is the truth. Optimise for the machines people really hold, not the one on your desk.",
    },
    {
      type: "points",
      items: [
        "LCP — how soon the main content appears. Lever: critical rendering path, smaller bundle, optimized images, CDN.",
        "INP — how responsive input feels. Lever: don't block the main thread with heavy JavaScript.",
        "CLS — visual stability. Lever: reserve space (width/height, fixed slots) for anything that loads late.",
        "Measure real users (field / RUM), not just a lab run on your fast machine — when they disagree, trust the field.",
        "Performance is a feature you can regress; put the vitals in CI so a slow change fails the build.",
      ],
    },
    {
      type: "note",
      text: "Watch the tail, not just the middle. A healthy median can hide a miserable slow tail — the p75 or p95 visitor whose phone and network make the page crawl. Since Core Web Vitals are graded at the 75th percentile, 'fast on average' isn't the bar; 'fast for three out of four real users' is.",
    },
  ],
  tradeoffs: {
    good: [
      "A page that appears fast and stays still feels trustworthy — users stay, scroll, and convert more.",
      "The metrics are concrete and shared: LCP/INP/CLS turn 'it feels slow' into a number you can move.",
      "Many wins are cheap and structural — reserve image space, lazy-load, split the bundle — not endless micro-tuning.",
      "Field data tells you where the real pain is, so effort goes to the slow tail instead of guesswork.",
    ],
    costs: [
      "It's never 'done' — every new feature ships more JavaScript and can quietly regress the vitals.",
      "Lab and field data disagree, and chasing a green lab score can leave real users just as slow.",
      "Optimizing the median can hide a brutal p95; percentiles take discipline to watch.",
      "Some fixes trade against developer convenience — code-splitting, image pipelines, and budgets add build complexity.",
    ],
  },
  realWorld:
    "Open Chrome DevTools' Lighthouse or Performance panel and you'll see these exact metrics scored on any site. Slow, jumpy pages measurably lose users and sales, which is why Core Web Vitals feed into Google Search ranking — performance stopped being a nice-to-have and became a business and SEO number teams are held to.",
  related: [
    {
      slug: "browser-rendering",
      note: "The critical rendering path these metrics measure the tail end of.",
    },
    {
      slug: "bundling-build",
      note: "Shrinking and splitting the JS bundle is the biggest LCP and INP lever you control.",
    },
    {
      slug: "caching-cdn",
      note: "Serving assets from a nearby edge cache is how you cut LCP for real users.",
    },
    {
      slug: "latency-vs-throughput",
      note: "Why the slow tail matters — vitals are graded at p75, not the median.",
    },
    {
      slug: "css-layout",
      note: "Reserving space with width/height on media is what prevents layout shift (CLS).",
    },
  ],
};
