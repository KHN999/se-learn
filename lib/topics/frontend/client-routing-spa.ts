import type { TopicContent } from "@/lib/topics";

export const clientRoutingSpa: TopicContent = {
  slug: "client-routing-spa",
  tagline:
    "How a web app navigates between pages instantly, without reloading the whole thing from the server each time.",
  problem:
    "Click a link on a classic website and the browser throws away everything it has and asks the server for a brand-new HTML page. You see a white flash, the whole layout re-downloads and re-renders, your scroll position is lost, and any half-typed form or open menu is gone. On a fast connection it's a stutter; on a slow one it's a wait every single click. If the header, sidebar, and styles are identical on every page, why re-fetch and rebuild all of them just to change the part in the middle?",
  demo: "spa-nav",
  how: [
    {
      type: "para",
      text: "A traditional multi-page app (MPA) treats every navigation as a fresh request: the server sends a complete HTML document, and the browser tears down the current page and builds the new one from scratch. A single-page app (SPA) flips this. It loads one HTML shell and a JavaScript bundle exactly once. After that, JavaScript stays in charge: it intercepts link clicks before the browser can leave, and updates the view in place.",
    },
    {
      type: "para",
      text: "The trick that makes this feel like real navigation is the History API. When you click a link, the app calls history.pushState to change the URL in the address bar — no request, no reload — then a client-side router reads the new path and decides which view to show. Often it fetches just the DATA it needs (a small JSON payload), not a whole page, and slots that into the existing layout. The back button still works because the browser fires a popstate event the router listens for.",
    },
    {
      type: "code",
      code: "// Intercept the click, keep the browser on the page\nlink.addEventListener('click', (e) => {\n  e.preventDefault();\n  history.pushState({}, '', '/about'); // change the URL, no reload\n  render('/about');                    // swap the view in place\n});\n\n// Make the back/forward buttons work too\nwindow.addEventListener('popstate', () => render(location.pathname));",
      caption:
        "The client route handler: cancel the default navigation, push the new URL, render the matching view — the server is never asked for a page.",
    },
    {
      type: "demo",
      demo: "spa-nav",
    },
    {
      type: "points",
      items: [
        "MPA: every click = a full round trip; the server returns a whole HTML page and the browser rebuilds everything.",
        "SPA: one shell + JS bundle loads once; later clicks swap the view in place and fetch only data (JSON).",
        "The History API (pushState / popstate) keeps the URL and back button honest without a reload.",
        "Client-side routing means the router lives in the browser; server-side routing means the server maps each URL to a page.",
      ],
    },
    {
      type: "note",
      text: "An SPA is not automatically better. The first visit pays for a large JS bundle and slower first paint, and search engines see an empty shell until the JS runs. That's why the common answer today is a hybrid: server-side rendering (SSR) sends real HTML for the first page, then hydration attaches the JavaScript so later navigations are instant. Plenty of content sites are perfectly fine — often faster and simpler — as a plain MPA.",
    },
  ],
  tradeoffs: {
    good: [
      "Navigation feels instant: no white flash, no reload, scroll and app state survive.",
      "Only data moves over the wire after the first load, not entire HTML pages.",
      "Rich, app-like interactions (modals, transitions, live updates) are natural once the app owns the page.",
      "The server does less per navigation — it just serves data, not rendered pages.",
    ],
    costs: [
      "A big initial JS bundle must download and run before anything is interactive — a worse first paint.",
      "SEO and link previews are harder: crawlers may see an empty shell until JavaScript executes.",
      "You now own routing, history, scroll restoration, and loading states that the browser used to handle for free.",
      "More can break: a single JS error can blank the whole app, where an MPA would only break one page.",
    ],
  },
  realWorld:
    "Gmail, Figma, Trello, and most dashboards are SPAs — you'd never tolerate a full reload every time you open an email or drag a card. But open a news article or a docs site and you're usually on an MPA or SSR page, because fast first paint and search visibility matter more there than in-app snappiness. Modern frameworks (Next.js, Remix, SvelteKit) blur the line: they render the first page on the server, then behave like an SPA for every click after.",
  related: [
    {
      slug: "http-request-response",
      note: "An MPA fetches whole pages; an SPA fetches only data over the same request/response.",
    },
    {
      slug: "browser-rendering",
      note: "The full-reload flash an SPA avoids is the browser rebuilding the page from scratch.",
    },
    {
      slug: "reactivity-rerender",
      note: "Swapping the view in place is a re-render — the mechanism a client router leans on.",
    },
    {
      slug: "bundling-build",
      note: "The JS bundle an SPA ships up front is produced by the build step.",
    },
    {
      slug: "web-performance",
      note: "The honest cost of SPAs — bundle size and first paint — is measured here.",
    },
  ],
};
