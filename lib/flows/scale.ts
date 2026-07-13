import type { Flow } from "@/lib/types";

// ---------------------------------------------------------------------------
// Flow: Growing under load — one server at 100 users, what breaks at 100,000?
//
// This is the "watch it grow" story. Unlike a single request's journey, the
// stages here are moments in time: each stop adds ONE component because a
// specific bottleneck just appeared. latencyMs is read as the app's typical
// response time at that point in the story — it spikes when the system strains
// and falls each time a fix lands, so the "where time goes" bar tells the tale
// of pressure rising and being relieved, step by step.
// ---------------------------------------------------------------------------

export const scaleFlow: Flow = {
  slug: "scale",
  title: "Growing under load",
  question: "One server was fine at 100 users. What breaks at 100,000?",
  summary:
    "A weekend project runs happily on one small server. Then it catches on, and the exact setup that served 100 people falls over at 100,000. Scaling isn't one heroic rewrite — it's a sequence of specific bottlenecks, each met with one focused fix. Follow the system as load rises: watch where it strains, and see which component relieves the pressure each time.",
  outcome:
    "The site stays fast at 100,000 users — each bottleneck met with the right fix, and no single machine holding the whole thing up.",
  unit: "ms",
  stages: [
    {
      id: "single-server",
      label: "One server",
      icon: "Server",
      oneLiner:
        "A single machine runs both the application and the database, and at 100 users it has power to spare.",
      problem:
        "When a product is small, complexity is the enemy. You want the fewest moving parts that can serve real users — not infrastructure you don't need yet.",
      how: "One server runs the web app and the database side by side. Requests come in, the code reads or writes the local database, and a response goes back. There are no network hops between components and nothing to coordinate.",
      input: "A modest stream of requests from a handful of users.",
      output: "Fast responses, with CPU, memory, and disk mostly idle.",
      tradeoff:
        "Dead simple and cheap — but every part shares one machine, which is both a single point of failure and a hard ceiling.",
      latencyMs: 80,
      related: [
        { label: "Vertical scaling", note: "Buying a bigger machine — the first answer, and a limited one." },
        { label: "Single point of failure", note: "If this one box dies, the whole site is down." },
        { label: "Monolith", note: "One deployable unit — simple to run until it isn't." },
      ],
    },
    {
      id: "cpu-saturated",
      label: "CPU saturated",
      icon: "Gauge",
      oneLiner:
        "Traffic climbs, the server's CPU pegs at 100%, and every response slows to a crawl.",
      problem:
        "Success brings load. As users multiply, requests arrive faster than one machine can process them, and they start queuing behind each other.",
      how: "With CPU (or memory, or database connections) saturated, each new request waits in line for a core to free up. Response times balloon and some requests time out entirely. A bigger box buys headroom, but it costs far more than double for less than double the capacity — and still leaves you with one machine.",
      input: "Tens of thousands of requests hitting one saturated server.",
      output: "Slow responses, timeouts, and errors under peak load.",
      tradeoff:
        "You can keep buying a bigger machine for a while, but it gets expensive fast and never removes the single point of failure. The real fix is to stop depending on one machine.",
      latencyMs: 900,
      related: [
        { label: "Vertical vs horizontal scaling", note: "A bigger box, versus more boxes working together." },
        { label: "Saturation", note: "When a resource hits 100% and requests pile into a queue." },
        { label: "Timeouts", note: "What a client does when the wait grows unbearable." },
      ],
    },
    {
      id: "app-servers",
      label: "More app servers",
      icon: "Boxes",
      oneLiner:
        "The application is copied onto several servers so many requests can be handled at once.",
      problem:
        "One machine can only do so much. To handle far more traffic, the work has to run across several machines in parallel — but only if the app doesn't assume it's the only one running.",
      how: "You run identical copies of the app on multiple servers, each connecting to the same database. Because they're stateless — no important data kept in one server's memory — any server can handle any request. Need more capacity? Add more servers.",
      input: "The saturating request load from the previous step.",
      output: "Requests processed in parallel across several machines.",
      tradeoff:
        "Capacity now grows by adding boxes, but the app must become stateless, and every server still points at one shared database — the next bottleneck in waiting.",
      latencyMs: 520,
      related: [
        { label: "Horizontal scaling", note: "Adding machines instead of enlarging a single one." },
        { label: "Stateless services", note: "Why any server can safely serve any request." },
        { label: "Shared database", note: "The one resource they all still contend for." },
      ],
    },
    {
      id: "load-balancer",
      label: "Load balancer",
      icon: "Scale",
      oneLiner:
        "A load balancer sits in front and spreads each incoming request across the healthy app servers.",
      problem:
        "With several servers, something must decide which one handles each request, give users a single address to reach, and skip any server that has failed.",
      how: "The load balancer receives every request at one public address and forwards it to an app server using a strategy like round-robin or least-connections. It runs continuous health checks and stops routing to any server that fails them.",
      input: "All traffic aimed at one public address.",
      output: "Requests distributed evenly across healthy servers, with failed ones removed automatically.",
      tradeoff:
        "Adds a hop and a piece of infrastructure to run — but it's exactly what makes horizontal scaling and zero-downtime deploys real.",
      latencyMs: 300,
      related: [
        { label: "Load balancing", note: "Spreading requests so no single server is overwhelmed." },
        { label: "Health checks", note: "How the balancer detects and skips a dead server." },
        { label: "Round-robin vs least-connections", note: "Common ways to choose which server gets the next request." },
      ],
    },
    {
      id: "shared-sessions",
      label: "Shared sessions",
      icon: "Database",
      oneLiner:
        "Login sessions move out of each server's memory into a shared store every server can read.",
      problem:
        "When login state lived in one server's memory, the load balancer could send your next request to a different server that had never heard of you — logging you out at random.",
      how: "Instead of keeping sessions in local memory, each server reads and writes them in a shared store like Redis, so any server can recognise any logged-in user. The alternative — \"sticky sessions\" that pin you to one server — re-concentrates load and breaks the moment that server dies.",
      input: "Requests that could land on any server in the pool.",
      output: "Consistent login state no matter which server responds.",
      tradeoff:
        "Sessions now survive across servers and restarts, at the cost of a fast network lookup on each request and one more service to keep alive.",
      latencyMs: 260,
      related: [
        { label: "Session store", note: "A shared home for login state, outside any one server." },
        { label: "Sticky sessions", note: "The fragile alternative this replaces." },
        { label: "Redis", note: "An in-memory store fast enough to check on every request." },
        { label: "Stateless services", note: "Kept true by moving state out of the app servers." },
      ],
    },
    {
      id: "cache",
      label: "Cache layer",
      icon: "Zap",
      oneLiner:
        "A fast in-memory cache answers the most common reads so the database doesn't have to.",
      problem:
        "Every app server now points at the same database, and the same popular queries — the homepage, a hot product — run over and over, dragging the database toward saturation.",
      how: "Before querying the database, the app checks a cache like Redis or Memcached. On a hit, the answer returns from memory in well under a millisecond; on a miss, it queries the database and stores the result for next time. Hot reads stop touching the database at all.",
      input: "Repeated reads for the same popular data.",
      output: "Most reads served from memory; the database sees a fraction of the traffic.",
      tradeoff:
        "Far faster and much lighter on the database, but cached data can go stale — deciding when to expire or invalidate it is one of the genuinely hard problems in computing.",
      latencyMs: 150,
      related: [
        { label: "Cache hit ratio", note: "The share of reads memory can answer without the database." },
        { label: "Cache invalidation", note: "Keeping cached data from silently going stale." },
        { label: "TTL", note: "A simple expiry that forces entries to refresh." },
        { label: "Read-through cache", note: "The check-then-fill pattern used here." },
      ],
    },
    {
      id: "read-replicas",
      label: "Read replicas",
      icon: "Layers",
      oneLiner:
        "Copies of the database take over read queries so the primary can concentrate on writes.",
      problem:
        "Even with a cache, cache misses and less-common queries keep growing with traffic, and a single database can only serve so many reads before it becomes the wall again.",
      how: "The primary database streams its changes to one or more replica copies. Reads — the bulk of most traffic — are sent to the replicas, while writes still go to the primary. Add replicas to add read capacity.",
      input: "Read and write queries the cache didn't absorb.",
      output: "Reads spread across replicas; the primary handles writes with room to spare.",
      tradeoff:
        "Read capacity scales cheaply, but replicas lag the primary by a moment — so a read taken right after a write can return slightly stale data.",
      latencyMs: 120,
      related: [
        { label: "Read replicas", note: "Scaling reads by adding copies of the database." },
        { label: "Replication lag", note: "Why a just-written value can be briefly missing on a replica." },
        { label: "Primary / replica", note: "Who accepts writes versus who serves reads." },
        { label: "Eventual consistency", note: "The weaker guarantee you trade down to for scale." },
      ],
    },
    {
      id: "queue-workers",
      label: "Queue + workers",
      icon: "Inbox",
      oneLiner:
        "Slow background jobs are handed to a queue and processed later by separate worker processes.",
      problem:
        "Some work is slow — sending email, resizing images, generating reports — and doing it inside the request makes the user wait seconds for something they don't need right now.",
      how: "Instead of doing the slow task inline, the app drops a message onto a queue and responds immediately. Separate worker processes pull jobs off the queue and do the heavy lifting in the background, at their own pace, retrying on failure.",
      input: "A request that would otherwise trigger slow work inline.",
      output: "A fast response now, with the slow work finished shortly after — off the request path.",
      tradeoff:
        "Requests get fast and traffic spikes smooth out, but the system is now asynchronous — you have to handle jobs that fail, run twice, or finish out of order.",
      latencyMs: 100,
      related: [
        { label: "Message queue", note: "The buffer that sits between a request and slow work." },
        { label: "Background workers", note: "Processes whose only job is to drain the queue." },
        { label: "Idempotency", note: "Making a retried job safe to run more than once." },
        { label: "Async processing", note: "Decoupling the response from the work it triggers." },
      ],
    },
    {
      id: "cdn",
      label: "CDN",
      icon: "Globe",
      oneLiner:
        "A content delivery network serves images, scripts, and styles from locations close to each user.",
      problem:
        "Users are spread across the globe, but the servers sit in one region — so someone far away pays for the distance on every round trip, and static files needlessly consume origin bandwidth.",
      how: "A CDN caches static assets on edge servers in many cities worldwide. A user's browser fetches those files from the nearest edge instead of the origin, cutting the distance and offloading your servers. Only requests that truly need fresh, personalised data reach the origin.",
      input: "Requests for static assets from users around the world.",
      output: "Assets delivered from a nearby edge in milliseconds; origin traffic sharply reduced.",
      tradeoff:
        "Global users get a fast, consistent experience, but you now manage cache expiry at the edge — a stale asset can linger worldwide until it's purged.",
      latencyMs: 70,
      related: [
        { label: "Edge caching", note: "Storing copies of assets physically near users." },
        { label: "Points of presence", note: "The global edge locations a CDN serves from." },
        { label: "Cache purge", note: "Forcing every edge to fetch a fresh copy of a file." },
        { label: "Static vs dynamic content", note: "What's safe to cache at the edge, and what isn't." },
      ],
    },
  ],
};
