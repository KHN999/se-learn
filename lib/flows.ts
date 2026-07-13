import type { Flow } from "@/lib/types";
import { loginFlow } from "@/lib/flows/login";
import { saveConflictFlow } from "@/lib/flows/save-conflict";
import { scaleFlow } from "@/lib/flows/scale";
import { deployFlow } from "@/lib/flows/deploy";
import { chatFlow } from "@/lib/flows/chat";
import { searchFlow } from "@/lib/flows/search";

// ---------------------------------------------------------------------------
// Flow: What happens when you type a URL and press Enter?
//
// The canonical full-stack journey. One request touches DNS, TCP, TLS, HTTP,
// load balancing, application code, a database, caching, and browser rendering
// — which is exactly why it is the best first lesson: it shows that these are
// not separate subjects but stops on a single path.
//
// Latencies are deliberately rough, order-of-magnitude figures for a first
// visit from a typical home connection. They exist to build intuition about
// *where time goes*, not to be benchmarks.
// ---------------------------------------------------------------------------

const requestFlow: Flow = {
  slug: "request",
  title: "A web request, end to end",
  question: "What happens when you type a URL and press Enter?",
  summary:
    "You type an address and a page appears a moment later. In that moment a request crosses your machine, the network, a company's infrastructure, its database, and comes back to be drawn on screen. Follow it stop by stop — each one exists to solve a specific problem, and each one adds a specific cost.",
  outcome: "The page is on your screen — the whole trip took a few hundred milliseconds.",
  unit: "ms",
  stages: [
    {
      id: "parse",
      label: "URL parsed",
      icon: "TextCursorInput",
      oneLiner:
        "The browser breaks the address into its parts and checks whether it already has the answer.",
      problem:
        "Before talking to anyone, the browser has to know exactly what you want — and whether it needs the network at all. Re-fetching something that hasn't changed wastes time and battery.",
      how: "It splits https://example.com/pricing?ref=x into a scheme (https), host (example.com), path (/pricing) and query (ref=x). Then it checks its own caches and its HSTS list (a rule saying \"this site must be HTTPS\"). A cache hit can end the whole journey right here.",
      input: "The text you typed, or the link you clicked.",
      output: "A decision: serve it from cache, or make a network request to example.com.",
      tradeoff:
        "Caching is what makes the web feel instant, but a stale cache is the classic reason you keep seeing an old version after something changed.",
      latencyMs: 1,
      related: [
        { label: "Browser cache", note: "Where a previous response may already be stored." },
        { label: "HSTS", note: "Forces HTTPS so the request can't be silently downgraded." },
        { label: "Service workers", note: "Can intercept the request and answer offline." },
      ],
    },
    {
      id: "dns",
      label: "DNS lookup",
      icon: "Compass",
      oneLiner:
        "The domain name is translated into an IP address the network can actually route to.",
      problem:
        "People remember names like example.com. Routers only understand numeric addresses like 93.184.216.34. Something has to bridge the two.",
      how: "The browser asks a DNS resolver (your ISP's, or one like 1.1.1.1). On a cache miss the resolver walks the hierarchy — root, then the .com servers, then example.com's authoritative server — and returns the IP. Answers are cached for a set time (TTL) so the next lookup is instant.",
      input: "example.com",
      output: "An IP address, e.g. 93.184.216.34.",
      tradeoff:
        "That TTL caching is what makes DNS fast, but it also means changes — like moving to a new server — take time to spread across the world.",
      latencyMs: 40,
      related: [
        { label: "TTL & DNS cache", note: "How long an answer is trusted before re-checking." },
        { label: "CDN", note: "DNS often hands you the IP of the nearest edge server." },
        { label: "Anycast", note: "One IP that routes to whichever server is closest." },
      ],
    },
    {
      id: "tcp",
      label: "TCP connection",
      icon: "Cable",
      oneLiner:
        "The browser opens a reliable, ordered channel to the server with a three-way handshake.",
      problem:
        "Raw internet packets can be lost, duplicated, or arrive out of order. Loading a page needs data to arrive complete and in the right sequence.",
      how: "Three packets set it up: the browser sends SYN, the server replies SYN-ACK, the browser answers ACK. Only then does real data flow. That exchange costs one full round trip before you've sent a single useful byte.",
      input: "The server's IP address and port (443 for HTTPS).",
      output: "An open connection that guarantees ordered, complete delivery.",
      tradeoff:
        "The handshake adds a round trip of pure waiting up front — which is why reusing connections, and newer protocols like HTTP/3 (QUIC) that fold this step in, matter so much.",
      latencyMs: 50,
      related: [
        { label: "TCP vs UDP", note: "Reliability and ordering, versus raw speed." },
        { label: "Ports", note: "Which service on the machine the request is for." },
        { label: "HTTP/3 (QUIC)", note: "Combines connection setup and encryption to save round trips." },
      ],
    },
    {
      id: "tls",
      label: "TLS handshake",
      icon: "Lock",
      oneLiner:
        "Both sides agree on encryption keys and the server proves who it is, so the connection is private.",
      problem:
        "A plain connection is readable by anyone on the path — the coffee-shop wifi, your ISP. Passwords and data must not travel in the clear, and you need proof you're talking to the real example.com, not an impostor.",
      how: "The server presents a certificate signed by a trusted authority. The browser verifies it, then both sides derive a shared secret key. Everything after this is encrypted. TLS 1.3 does all of it in about one round trip.",
      input: "The open TCP connection.",
      output: "An encrypted, authenticated channel — the padlock in the address bar.",
      tradeoff:
        "It costs another round trip (fewer with TLS 1.3 or a resumed session) and some CPU. That's the price of privacy and trust.",
      latencyMs: 50,
      related: [
        { label: "Certificates & CAs", note: "How the browser decides a server's identity is genuine." },
        { label: "Public-key crypto", note: "Lets two strangers agree on a secret in the open." },
        { label: "TLS 1.3", note: "The current version — faster and with fewer weak options." },
      ],
    },
    {
      id: "request",
      label: "HTTP request",
      icon: "ArrowUpRight",
      oneLiner:
        "The browser sends a structured message saying which resource it wants and how.",
      problem:
        "The server needs to know precisely what you're asking for: which page, which method, who you are, and what formats you can handle.",
      how: "A request is a method (GET, POST, ...), a path, and headers. The Host header says which site; Cookie carries who you are; Accept says which formats you want. This is how a logged-in user is recognised — the session lives in a cookie sent on every request.",
      input: "The encrypted channel.",
      output: "A request message travelling to the server, e.g. GET /pricing.",
      tradeoff:
        "Headers and cookies add overhead to every single request; HTTP/2 and HTTP/3 pack many requests over one connection to claw that back.",
      latencyMs: 5,
      related: [
        { label: "HTTP methods", note: "GET reads, POST/PUT/PATCH write, DELETE removes." },
        { label: "Cookies", note: "The small tokens that keep you logged in across requests." },
        { label: "Status codes", note: "The server's short answer: 200, 404, 500, and friends." },
      ],
    },
    {
      id: "routing",
      label: "Server & routing",
      icon: "Split",
      oneLiner:
        "The request reaches the infrastructure, which decides which application server should handle it.",
      problem:
        "A busy site runs many servers. Something has to receive the raw request, handle encryption, and spread traffic so no single machine is overwhelmed or becomes a single point of failure.",
      how: "A reverse proxy or load balancer (Nginx, or a cloud load balancer) takes the request first. It can serve static files or cached responses itself, and forwards the rest to one of several healthy app servers, skipping any that are failing health checks.",
      input: "The incoming HTTP request.",
      output: "The request handed to a healthy app server and routed, by its path, to the right handler.",
      tradeoff:
        "It adds a hop and more infrastructure to run — but it's exactly what makes scaling out and zero-downtime deploys possible.",
      latencyMs: 3,
      related: [
        { label: "Load balancing", note: "Spreading requests so no one server is overloaded." },
        { label: "Health checks", note: "How the balancer knows to stop sending to a dead server." },
        { label: "Horizontal scaling", note: "Adding more servers instead of a bigger one." },
      ],
    },
    {
      id: "app-db",
      label: "App logic + database",
      icon: "Database",
      oneLiner:
        "Your code runs — validating the request, applying the rules, and reading or writing the database.",
      problem:
        "The answer usually depends on data that lives somewhere durable — your profile, the product list, today's prices — plus rules about who is allowed to see or change what.",
      how: "The handler validates the input, checks that you're authenticated and allowed, then queries the database (often with SQL). A fast in-memory cache like Redis may answer first to avoid a slow query. The result is assembled into a response body (HTML or JSON).",
      input: "The routed request.",
      output: "The response data, ready to send back.",
      tradeoff:
        "This is usually the slowest and most variable step. One missing database index or an N+1 query pattern here can dominate the whole page load. Caching helps, at the cost of data that can go stale.",
      latencyMs: 60,
      related: [
        { label: "Indexes", note: "Let the database find rows without scanning the whole table." },
        { label: "Redis cache", note: "Answers hot reads in memory instead of hitting the database." },
        { label: "N+1 queries", note: "A loop of tiny queries where one query would do — a common trap." },
        { label: "Authentication", note: "Deciding who you are before deciding what you may see." },
      ],
    },
    {
      id: "response",
      label: "HTTP response",
      icon: "ArrowDownLeft",
      oneLiner:
        "The server sends back a status code, headers, and the body of the page.",
      problem:
        "The browser needs to know whether the request worked, how to interpret what came back, and whether it's allowed to remember it for next time.",
      how: "A status line (200 OK, 404 Not Found, 500 error), headers (Content-Type, Cache-Control, Set-Cookie), and the body. The Cache-Control header is the server telling the browser whether it can skip most of this journey on the next visit.",
      input: "The assembled response.",
      output: "Bytes travelling back over the encrypted connection to your browser.",
      tradeoff:
        "Good caching headers make repeat visits dramatically faster — but then invalidating the cache when something changes (like a fresh deploy) becomes its own real problem.",
      latencyMs: 20,
      related: [
        { label: "Status codes", note: "The category of outcome: success, client error, server error." },
        { label: "Cache-Control", note: "How long, and by whom, a response may be cached." },
        { label: "Compression", note: "gzip/brotli shrink the body so it travels faster." },
      ],
    },
    {
      id: "render",
      label: "Browser render",
      icon: "MonitorPlay",
      oneLiner:
        "The browser turns the received HTML, CSS, and JavaScript into the pixels you see.",
      problem:
        "A response is just text and bytes. It has to become a laid-out, interactive visual page.",
      how: "The browser parses HTML into a DOM tree, applies CSS to decide how everything looks, works out where each element goes (layout), and paints it. Along the way it fetches more resources — CSS, JS, images — each often repeating this whole journey. Then JavaScript wires up interactivity.",
      input: "The response bytes.",
      output: "The finished, interactive page in front of you.",
      tradeoff:
        "Heavy JavaScript bundles and render-blocking files delay what the user actually sees — the entire discipline of frontend performance lives in this step.",
      latencyMs: 120,
      related: [
        { label: "DOM & CSSOM", note: "The tree of content and the rules that style it." },
        { label: "Critical rendering path", note: "The shortest route from bytes to first paint." },
        { label: "Core Web Vitals", note: "How Google measures perceived load speed and stability." },
      ],
    },
  ],
};

export const flows: Flow[] = [
  requestFlow,
  loginFlow,
  saveConflictFlow,
  scaleFlow,
  deployFlow,
  chatFlow,
  searchFlow,
];

export function getFlow(slug: string): Flow | undefined {
  return flows.find((f) => f.slug === slug);
}

export function getAllFlowSlugs(): string[] {
  return flows.map((f) => f.slug);
}

// All seven flows are built; nothing is planned-but-unwritten anymore.
export const plannedFlows: { title: string; question: string }[] = [];
