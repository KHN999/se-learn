import type { TopicContent } from "@/lib/topics";

export const batchE: TopicContent[] = [
  {
    slug: "monolith",
    tagline:
      "One deployable application that holds the whole system's code and runs as a single process.",
    problem:
      "You're building a new product and need users, billing, and a catalog. You could split each into its own service running on its own machine — but you have three engineers and no traffic yet. Standing up separate services, networks, and deployments for each would mean weeks of plumbing before you ship a single feature. Where should the code live so you can move fast now?",
    demo: "arch-styles",
    how: [
      {
        type: "para",
        text: "A monolith keeps all the code in one codebase that compiles or packages into one artifact and runs as one process (or several identical copies of it). A request comes in, and everything it needs — reading a user, charging a card, updating the catalog — happens inside that one program, with modules calling each other as ordinary function calls.",
      },
      {
        type: "para",
        text: "Because it's a single program, there's no network between parts: calls are fast and can't half-fail, and a transaction can span the whole request. You deploy the whole thing at once and scale it by running more identical copies behind a load balancer.",
      },
      {
        type: "code",
        code: "function handleCheckout(req) {\n  const user = users.load(req.userId)   // in-process call\n  billing.charge(user, req.total)       // in-process call\n  catalog.reserve(req.items)            // all one transaction\n  return render(user)\n}\n// one artifact — scaled by running N identical copies behind a load balancer",
        caption: "Inside one process, module calls are ordinary function calls: fast, unable to half-fail, and able to share a single transaction.",
      },
      {
        type: "demo",
        demo: "arch-styles",
      },
      {
        type: "note",
        text: "'Monolith' is not an insult. Most successful products start as one, and many stay that way for a long time. The problems people blame on monoliths are usually really problems of tangled, low-cohesion code — which a monolith can have but doesn't require.",
      },
    ],
    tradeoffs: {
      good: [
        "Simple to build, run, and reason about — one repo, one deploy, one place to look.",
        "In-process calls are fast and can't partially fail like network calls do.",
        "A single database means real transactions across the whole request.",
        "Easy local development: run one thing and the whole app works.",
      ],
      costs: [
        "The whole app is deployed as a unit — one risky change can hold up everyone.",
        "You scale the entire process even if only one part is hot.",
        "Nothing stops modules reaching into each other, so it can rot into a 'big ball of mud'.",
        "A single language and runtime for everything; hard to adopt a different tool for one job.",
      ],
    },
    realWorld:
      "Nearly every startup should start here, and plenty of large companies run huge monoliths successfully. The mistake is jumping to microservices for the imagined scale of a system you haven't built yet, paying distributed-systems costs for problems you don't have.",
    related: [
      {
        slug: "modular-monolith",
        note: "A monolith with real internal boundaries — the disciplined version.",
      },
      {
        slug: "microservices",
        note: "The opposite extreme: many small deployables over a network.",
      },
      {
        slug: "coupling-cohesion",
        note: "Whether a monolith stays healthy comes down to this.",
      },
      {
        slug: "scalability",
        note: "You scale a monolith by running more identical copies.",
      },
      {
        slug: "ci-cd",
        note: "One artifact makes the build-and-deploy pipeline simple.",
      },
    ],
  },
  {
    slug: "modular-monolith",
    tagline:
      "One deployable app, but internally split into modules with enforced boundaries.",
    problem:
      "Your monolith works, but three years in, the billing code imports directly from the catalog code, which reaches into the user code, which calls back into billing. Changing anything means touching everything, and no one can say where a feature begins or ends. You don't want the operational pain of microservices — but you can't keep living in a mud ball. Can you get boundaries without going distributed?",
    demo: "arch-styles",
    how: [
      {
        type: "para",
        text: "A modular monolith still ships as a single deployable, but the code is divided into modules (users, billing, catalog) that each own their data and expose a clear internal interface. Other modules are only allowed to call that interface — never reach into another module's tables or internals directly.",
      },
      {
        type: "para",
        text: "The discipline is what makes it work: the boundaries are chosen along business capabilities, and something enforces them — package structure, build rules, or lint checks that fail the build when one module imports another's internals. You keep in-process speed and single-database transactions while gaining the clarity microservices are praised for.",
      },
      {
        type: "code",
        code: "// billing may use catalog's public interface, but not its internals\nimport { catalog } from \"@/catalog\"       // OK: public entry point\nimport { priceRow } from \"@/catalog/db\"   // BUILD FAILS: reaching inside\n\ncatalog.reserve(items)   // the only sanctioned way across the boundary",
        caption: "A build or lint rule enforces the seam: modules call each other's public interfaces and never touch internals.",
      },
      {
        type: "demo",
        demo: "arch-styles",
      },
      {
        type: "points",
        items: [
          "Each module owns its data; others go through its public interface.",
          "Boundaries follow business domains, not technical layers.",
          "Dependencies are explicit and enforced, not accidental.",
          "If you ever do split into services, the seams are already drawn.",
        ],
      },
    ],
    tradeoffs: {
      good: [
        "Clear boundaries and ownership without any network between parts.",
        "Still one deploy, one database, real transactions — all the monolith's simplicity.",
        "Modules can be understood, tested, and changed in isolation.",
        "A clean starting point if you later extract a service.",
      ],
      costs: [
        "Boundaries only hold if the team keeps enforcing them; discipline can slip.",
        "You still deploy and scale the whole thing as one unit.",
        "Drawing the right module lines up front is genuinely hard.",
        "No independent tech choices or independent scaling per module.",
      ],
    },
    realWorld:
      "This is increasingly the recommended default: capture most of the organizational benefits people wanted from microservices, without distributed-systems tax. Many teams that regretted a premature microservices split have consolidated back into a modular monolith.",
    related: [
      {
        slug: "monolith",
        note: "The base pattern this adds internal discipline to.",
      },
      {
        slug: "microservices",
        note: "The next step if a module truly needs to scale or ship on its own.",
      },
      {
        slug: "coupling-cohesion",
        note: "The exact quality modules are designed to maximize.",
      },
      {
        slug: "solid",
        note: "The module interfaces are these principles applied at large scale.",
      },
      {
        slug: "dry",
        note: "Shared logic lives in one module rather than being copied around.",
      },
    ],
  },
  {
    slug: "microservices",
    tagline:
      "Splitting a system into many small services that deploy and scale independently.",
    problem:
      "Your monolith has 200 engineers committing to it. Every deploy is a coordinated event, the search team's slow code takes down checkout, and the whole thing must scale together even though only search is under load. The single codebase has become the bottleneck for how fast the organization can move. How do you let teams ship independently?",
    demo: "arch-styles",
    how: [
      {
        type: "para",
        text: "Microservices break the system into small, independently deployable services, each owning one business capability and its own data. Services talk to each other over the network — usually HTTP or gRPC APIs, or by passing messages through a queue. Each service can be built, deployed, scaled, and even written in a different language on its own schedule.",
      },
      {
        type: "para",
        text: "The core rule is that a service is the sole owner of its data: nobody else reaches into its database. That's what lets a team change their internals freely. The cost is that every in-process function call that crossed a boundary is now a network call — which is slower, can time out, and can fail while the caller keeps running.",
      },
      {
        type: "code",
        code: "# each service deploys, scales, and owns its data independently\nservices:\n  orders:    { image: orders:1.4,   db: orders-db }\n  payments:  { image: payments:2.1, db: payments-db }\n  catalog:   { image: catalog:0.9,  db: catalog-db }\n# orders -> payments is now a network call (HTTP/gRPC), not a function call",
        caption: "Each service is its own deployable with its own datastore; a call that used to be in-process now crosses the network.",
      },
      {
        type: "demo",
        demo: "arch-styles",
      },
      {
        type: "note",
        text: "Microservices trade code complexity for operational and distributed-systems complexity. You inherit partial failure, eventual consistency, network latency, and the need for real observability. It's a solution to an organizational scaling problem more than a technical one.",
      },
    ],
    tradeoffs: {
      good: [
        "Teams deploy on their own schedule without coordinating a giant release.",
        "Scale only the services that need it, independently.",
        "A crash in one service can be contained instead of taking down everything.",
        "Each service can pick the language and datastore that fits its job.",
      ],
      costs: [
        "Every cross-service call is a network call: latency, timeouts, partial failure.",
        "No transactions across services — you're stuck with eventual consistency.",
        "Operating dozens of services needs heavy tooling: discovery, gateways, tracing.",
        "Testing and debugging span many processes and machines.",
      ],
    },
    realWorld:
      "Big platforms like Netflix and Amazon run thousands of services because their org size demands it. The common failure is a small team adopting microservices for the resume or the hype, then drowning in the operational overhead of a distributed system they didn't need.",
    related: [
      {
        slug: "monolith",
        note: "What you're splitting apart, and often the better default.",
      },
      {
        slug: "modular-monolith",
        note: "A middle ground that captures much of the benefit with less pain.",
      },
      {
        slug: "api-gateway",
        note: "The single front door clients hit instead of dozens of services.",
      },
      {
        slug: "service-discovery",
        note: "How services find each other's changing network locations.",
      },
      {
        slug: "message-queues",
        note: "The usual way services communicate without tight coupling.",
      },
    ],
  },
  {
    slug: "api-gateway",
    tagline:
      "A single entry point that routes, authenticates, and shapes requests to many backend services.",
    problem:
      "You've split into twenty microservices. Now your mobile app needs to know the address of each one, handle auth against every service separately, and make ten calls to render a single screen. Every service also has to re-implement rate limiting and token checks. Exposing all of that raw to the outside world is a mess and a security hazard. Who should clients talk to instead?",
    demo: "api-gateway",
    how: [
      {
        type: "para",
        text: "An API gateway sits in front of your services as the one public endpoint. Clients call the gateway; it looks at the request and routes it to the right internal service. Along the way it handles the concerns every service would otherwise duplicate — authentication, rate limiting, TLS termination, logging — in one place.",
      },
      {
        type: "code",
        code: "GET api.shop.com/orders/42\n  -> gateway: terminate TLS, verify token, check rate limit\n  -> match route  /orders/*  ->  orders-service\n  -> forward to a healthy orders-service instance (private)\n\n# routing table\n/orders/*   -> orders-service\n/users/*    -> users-service\n/catalog/*  -> catalog-service",
        caption: "Clients hit one public address; the gateway authenticates and rate-limits once, then routes each path to the right internal service.",
      },
      {
        type: "demo",
        demo: "api-gateway",
      },
      {
        type: "points",
        items: [
          "Routing: map an incoming path to the correct backend service.",
          "Cross-cutting concerns: auth, rate limiting, TLS, request logging done once.",
          "Aggregation: fan out to several services and combine their replies into one response.",
          "Isolation: internal services and their addresses stay hidden from the outside.",
        ],
      },
      {
        type: "note",
        text: "A gateway is powerful but it's a single point that everything flows through — it must be highly available, and it's easy to let business logic creep into it until it becomes a new monolith. Keep it thin: routing and cross-cutting concerns, not domain rules.",
      },
    ],
    tradeoffs: {
      good: [
        "One public endpoint; clients don't track dozens of service addresses.",
        "Auth, rate limiting, and TLS live in one place instead of every service.",
        "Can combine several backend calls into a single client response.",
        "Backend services can move or change without clients noticing.",
      ],
      costs: [
        "One more hop adds latency to every request.",
        "It's a critical single point of failure — must be redundant.",
        "Logic tends to accumulate in it until it becomes hard to change.",
        "Another component to configure, deploy, and monitor.",
      ],
    },
    realWorld:
      "Almost every microservices deployment has one — managed offerings like AWS API Gateway, or self-run tools like Kong, NGINX, and Envoy. A related pattern, backend-for-frontend, runs a tailored gateway per client type (web, mobile) so each gets exactly the shape of data it needs.",
    related: [
      {
        slug: "microservices",
        note: "The architecture a gateway is built to sit in front of.",
      },
      {
        slug: "load-balancer-proxy",
        note: "A gateway is a specialized reverse proxy with app-level features.",
      },
      {
        slug: "rate-limiting",
        note: "A classic cross-cutting concern the gateway enforces centrally.",
      },
      {
        slug: "api-auth",
        note: "Token checking usually happens at the gateway, once per request.",
      },
      {
        slug: "service-discovery",
        note: "The gateway uses discovery to find where to route each request.",
      },
    ],
  },
  {
    slug: "service-discovery",
    tagline:
      "How services find each other's network addresses when those addresses keep changing.",
    problem:
      "The orders service needs to call the payments service. In a container world, payments might be running on five machines whose IP addresses change every time one restarts or the system scales up. Hard-coding an address breaks the moment that instance dies. How does orders reliably find a live payments instance right now?",
    demo: "service-discovery",
    how: [
      {
        type: "para",
        text: "Service discovery keeps a live registry of which instances of each service exist and where they are. When a service starts, it registers itself ('I'm payments, at this address, and I'm healthy'); when it dies or fails a health check, it's removed. A caller asks the registry for 'a healthy payments instance' and gets a current address.",
      },
      {
        type: "code",
        code: "# payments instances register themselves on startup\nregister  payments  ->  10.0.0.7:8080  (healthy)\nregister  payments  ->  10.0.0.9:8080  (healthy)\n\n# orders resolves the name instead of hard-coding an address\nlookup    payments  ->  10.0.0.9:8080     // a live instance, right now\n# 10.0.0.7 fails its health check -> dropped from the registry",
        caption: "Instances register on startup and drop out when unhealthy; callers resolve a name to a currently-live address at call time.",
      },
      {
        type: "demo",
        demo: "service-discovery",
      },
      {
        type: "points",
        items: [
          "A registry stores the address of every healthy instance of each service.",
          "Instances register on startup and are deregistered when they fail health checks.",
          "Client-side discovery: the caller queries the registry and picks an instance.",
          "Server-side discovery: the caller hits a fixed load balancer that does the lookup.",
        ],
      },
      {
        type: "note",
        text: "Often you don't see this directly. In Kubernetes, DNS plus the service abstraction handles it for you: you call a stable name like 'payments' and the platform routes to a live pod behind it.",
      },
    ],
    tradeoffs: {
      good: [
        "Services find each other without hard-coded, brittle addresses.",
        "Dead instances are dropped automatically as they fail health checks.",
        "New instances start receiving traffic as soon as they register.",
        "Enables auto-scaling and self-healing deployments.",
      ],
      costs: [
        "The registry itself must be highly available or it takes everything down.",
        "There's a lag between an instance dying and being deregistered.",
        "One more piece of infrastructure to run and understand.",
        "Stale entries can send traffic to instances that are already gone.",
      ],
    },
    realWorld:
      "Tools like Consul, etcd, and Eureka provide registries; Kubernetes bakes discovery in via DNS and Services. Whenever you see services referenced by name rather than IP in a cloud deployment, discovery is doing the work of turning that name into a live address.",
    related: [
      {
        slug: "microservices",
        note: "The setting where dynamic addresses make discovery necessary.",
      },
      {
        slug: "load-balancer-proxy",
        note: "Server-side discovery routes through a load balancer.",
      },
      {
        slug: "dns",
        note: "The oldest, simplest form of turning a name into an address.",
      },
      {
        slug: "api-gateway",
        note: "Uses discovery to know where to forward each request.",
      },
      {
        slug: "high-availability",
        note: "Removing dead instances is a core way discovery keeps a system up.",
      },
    ],
  },
  {
    slug: "load-balancer-proxy",
    tagline:
      "A component in front of your servers that spreads traffic across them and speaks for them.",
    problem:
      "One web server can handle a thousand requests a second; you're getting five thousand. You add four more servers — but clients only know one address, and if one server dies you don't want users hitting a dead machine. Something has to sit in front, take every request, and hand it to a server that's alive and not overloaded. What is that something?",
    demo: "load-balance",
    how: [
      {
        type: "para",
        text: "A reverse proxy is a server that receives client requests and forwards them to one of your backend servers, then relays the reply back. A load balancer is a reverse proxy whose main job is spreading incoming requests across a pool of identical servers so no single one is overwhelmed. Clients only ever see the proxy's single address.",
      },
      {
        type: "para",
        text: "It decides where each request goes using a strategy — round-robin (take turns), least-connections (send to the least busy), or hashing on something like the client's IP for stickiness. Health checks let it stop sending traffic to a server that stops responding, so a dead backend simply drops out of rotation.",
      },
      {
        type: "code",
        code: "upstream web_backends {\n  least_conn;                 # send each request to the least-busy server\n  server 10.0.0.11:8080;\n  server 10.0.0.12:8080;\n  server 10.0.0.13:8080;      # a failed health check drops it from rotation\n}\nserver {\n  listen 443;                 # one public address; TLS terminates here\n  location / { proxy_pass http://web_backends; }\n}",
        caption: "An nginx reverse proxy spreads requests across a pool of identical backends behind a single public address.",
      },
      {
        type: "demo",
        demo: "load-balance",
      },
      {
        type: "points",
        items: [
          "Distributes load so one server doesn't get buried while others idle.",
          "Health checks route around dead or unhealthy backends automatically.",
          "Hides backends behind one address, so you can add or remove them freely.",
          "Often also terminates TLS and caches or compresses responses.",
        ],
      },
    ],
    tradeoffs: {
      good: [
        "Scale out by adding more identical servers behind the same address.",
        "A failed server is detected and skipped without downtime.",
        "Backends stay private; clients only ever reach the proxy.",
        "A natural place for TLS termination, caching, and compression.",
      ],
      costs: [
        "One more hop and one more thing to run and secure.",
        "It's a single point of failure unless you make it redundant too.",
        "Sticky sessions or shared state complicate spreading load evenly.",
        "Misconfigured health checks can pull healthy servers out or keep dead ones in.",
      ],
    },
    realWorld:
      "NGINX, HAProxy, and Envoy are common software proxies; cloud load balancers (AWS ELB, GCP's) are managed versions. The 'reverse proxy' framing also covers TLS termination and caching in front of an app — the same box often does all three jobs at once.",
    related: [
      {
        slug: "load-balancing",
        note: "The distribution strategies this component implements, in depth.",
      },
      {
        slug: "api-gateway",
        note: "An app-aware reverse proxy that adds routing, auth, and aggregation.",
      },
      {
        slug: "high-availability",
        note: "Routing around dead servers is how a proxy keeps a service up.",
      },
      {
        slug: "service-discovery",
        note: "How the proxy learns which backends currently exist.",
      },
      {
        slug: "tls-https",
        note: "The proxy commonly terminates TLS for the servers behind it.",
      },
    ],
  },
  {
    slug: "oop-pillars",
    tagline:
      "The four ideas — encapsulation, abstraction, inheritance, polymorphism — that object-oriented code is built on.",
    problem:
      "You're modeling a payment system with credit cards, PayPal, and bank transfers. Each has different internals but callers just want to 'charge $50'. You also want to stop code elsewhere from reaching in and corrupting a payment's internal state. How do you organize code so that shared behavior is reused, internals stay protected, and callers don't care which payment type they hold?",
    how: [
      {
        type: "para",
        text: "Object-oriented programming bundles data and the code that operates on it into objects. Four ideas describe how objects are meant to relate. Encapsulation hides an object's internal state behind methods, so nothing outside can put it in an invalid state. Abstraction exposes only what a caller needs and hides the how.",
      },
      {
        type: "points",
        items: [
          "Encapsulation: keep state private; expose it only through controlled methods.",
          "Abstraction: present a simple interface; hide the messy implementation behind it.",
          "Inheritance: a subclass reuses and extends a parent's behavior (a SavingsAccount is an Account).",
          "Polymorphism: many types share one interface, so one call works on any of them ('charge' on any payment).",
        ],
      },
      {
        type: "note",
        text: "Of the four, inheritance is the one to use sparingly. Deep class hierarchies tightly couple child to parent and get brittle fast. Modern guidance leans on composition and interfaces (polymorphism) for reuse, reserving inheritance for genuine 'is-a' relationships.",
      },
    ],
    tradeoffs: {
      good: [
        "Encapsulation keeps invalid states unreachable from outside.",
        "Polymorphism lets one piece of code work across many types.",
        "Abstraction lets callers ignore implementation detail.",
        "Maps naturally onto domains full of 'things' with state and behavior.",
      ],
      costs: [
        "Inheritance hierarchies grow rigid and couple subclasses to parents.",
        "Over-modeling wraps everything in classes that add ceremony, not value.",
        "Shared mutable state inside objects can hide concurrency bugs.",
        "'Is-a' is often misapplied where 'has-a' composition would be cleaner.",
      ],
    },
    realWorld:
      "These are the vocabulary of everyday OO languages — Java, C#, Python, C++. Interview questions lean on them, but the practical payoff is polymorphism and encapsulation: writing one function that handles any payment type, and being certain no outside code can corrupt an object's state.",
    related: [
      {
        slug: "classes-objects",
        note: "The building blocks these four principles describe how to use.",
      },
      {
        slug: "solid",
        note: "Five design principles that refine how to apply OO well.",
      },
      {
        slug: "coupling-cohesion",
        note: "Encapsulation is the main tool for keeping coupling low.",
      },
      {
        slug: "design-patterns",
        note: "Reusable solutions built on polymorphism and composition.",
      },
      {
        slug: "dry",
        note: "Inheritance and composition are ways to avoid repeating behavior.",
      },
    ],
  },
  {
    slug: "naming",
    tagline:
      "Choosing names that tell a reader what something is and does, so the code explains itself.",
    problem:
      "You open a file and read `d = calc(x, y, f)`. What is `d`? What does `calc` compute? What are `x`, `y`, `f`? You have to read the entire function body — maybe several — just to find out. Multiply that by every variable in a codebase and most of a developer's day is spent decoding names instead of understanding logic. How do you make code readable at a glance?",
    how: [
      {
        type: "para",
        text: "Good names reveal intent. A name should answer why this exists and what it does without the reader having to look elsewhere. `daysUntilExpiry` needs no comment; `d` needs a paragraph. The goal is that reading the code feels like reading a description of the problem, not decoding a puzzle.",
      },
      {
        type: "points",
        items: [
          "Say what it means: `elapsedTimeInDays`, not `d` or `temp`.",
          "Make names pronounceable and searchable — you can't grep for `x`.",
          "Match the scope: short names are fine for a tiny loop; wide scope needs descriptive names.",
          "Use consistent conventions (verbs for functions, nouns for values) so patterns are predictable.",
          "Avoid noise words like `data`, `info`, `manager`, `helper` that carry no meaning.",
        ],
      },
      {
        type: "note",
        text: "If a good name is hard to find, that's a signal the thing is doing too much or isn't well understood yet. Renaming difficulty is often a design smell, not just a wording problem.",
      },
    ],
    tradeoffs: {
      good: [
        "Code becomes self-documenting; fewer comments needed to explain what.",
        "New readers get oriented far faster.",
        "Fewer bugs from misusing something whose purpose was unclear.",
        "Struggling to name something surfaces unclear design early.",
      ],
      costs: [
        "Renaming across a large codebase is real work (though tools help).",
        "Over-long names hurt readability as much as cryptic ones.",
        "Teams argue over conventions; consistency matters more than any one choice.",
        "A good name can go stale if the code's behavior drifts away from it.",
      ],
    },
    realWorld:
      "Naming is cited as one of the two hard problems in computer science for a reason. In code review it's the single most common comment, and in day-to-day work, clear names save more time than almost any clever optimization — because code is read far more often than it's written.",
    related: [
      {
        slug: "functions-one-thing",
        note: "A function that does one thing is easy to name accurately.",
      },
      {
        slug: "dry",
        note: "A well-named concept is easier to spot and reuse than a vague one.",
      },
      {
        slug: "documentation",
        note: "Good names reduce how much explanation you have to write.",
      },
      {
        slug: "coupling-cohesion",
        note: "Names that resist you often mean a module lacks cohesion.",
      },
      {
        slug: "tech-debt-refactoring",
        note: "Renaming for clarity is one of the safest refactors.",
      },
    ],
  },
  {
    slug: "functions-one-thing",
    tagline:
      "Keeping each function focused on a single task so it's easy to read, test, and reuse.",
    problem:
      "You find a 300-line function called `processOrder` that validates input, calculates tax, charges the card, writes to the database, sends an email, and logs metrics. To fix a tax bug you have to understand all of it. You can't test the tax logic without also charging a card and sending an email. Every change risks breaking something unrelated. How should this be structured instead?",
    how: [
      {
        type: "para",
        text: "The principle is that a function should do one thing, do it well, and do only that. If you can describe what a function does without using 'and' or 'then', it's probably focused. The big `processOrder` becomes a short function that calls `validate`, `calculateTax`, `charge`, `save`, and `notify` — each small, named for its one job, and testable on its own.",
      },
      {
        type: "para",
        text: "A useful test is the level of abstraction: a function should operate at one level. Mixing high-level orchestration ('charge the customer') with low-level detail (string formatting, byte manipulation) in the same body is a sign it's doing more than one thing and should be split.",
      },
      {
        type: "note",
        text: "'One thing' is about a single responsibility, not a literal line count — though functions that do one thing tend to be short. Don't shred code into so many one-line functions that following the logic means jumping through twenty files; readability is the actual goal.",
      },
    ],
    tradeoffs: {
      good: [
        "Small focused functions are easy to name, read, and understand.",
        "Each can be unit-tested in isolation without dragging in the rest.",
        "Reuse improves — a focused function is useful in more than one place.",
        "Bugs are localized: a change touches one responsibility, not five.",
      ],
      costs: [
        "Over-splitting scatters logic and hurts readability as much as bloat.",
        "More functions means more names to invent and more indirection to follow.",
        "Where to draw the line between 'one thing' and 'too granular' is judgment.",
        "Passing shared state between many small functions can get awkward.",
      ],
    },
    realWorld:
      "This is the day-to-day version of the single-responsibility principle. The clearest sign you've violated it is a test that needs elaborate setup, or a function you can't describe in one sentence — both point to a job that should have been several.",
    related: [
      {
        slug: "naming",
        note: "A single-purpose function is one you can name precisely.",
      },
      {
        slug: "dry",
        note: "Small focused functions are the units you reuse instead of copying.",
      },
      {
        slug: "solid",
        note: "This is the single-responsibility principle at function scale.",
      },
      {
        slug: "unit-tests",
        note: "Focused functions are what makes isolated testing possible.",
      },
      {
        slug: "coupling-cohesion",
        note: "One function, one job is cohesion at the smallest scale.",
      },
    ],
  },
  {
    slug: "dry",
    tagline:
      "Don't Repeat Yourself: each piece of knowledge should live in exactly one place.",
    problem:
      "The rule 'orders over $100 ship free' is coded in the checkout page, the cart summary, the confirmation email, and a report. Marketing changes the threshold to $75. You update three of the four spots — and now the email quotes a number that contradicts the invoice. Whenever the same fact is written in many places, they drift out of sync. How do you keep one truth?",
    how: [
      {
        type: "para",
        text: "DRY says every piece of knowledge — a rule, a calculation, a constant — should have a single, authoritative representation. Instead of the free-shipping threshold living in four files, it lives in one place that all four call. Change it once and every use updates together, because they all read the same source.",
      },
      {
        type: "note",
        text: "The subtle part: DRY is about duplicated knowledge, not duplicated text. Two functions that look identical today but exist for unrelated reasons will need to change for different reasons later — merging them couples things that should stay separate. Premature deduplication ('the wrong abstraction') is often worse than a little repetition.",
      },
      {
        type: "points",
        items: [
          "Extract a repeated rule or calculation into one named function or constant.",
          "Ask 'is this the same knowledge, or just similar-looking code right now?'",
          "A little duplication is fine while the right abstraction is still unclear.",
          "Prefer waiting for a third occurrence before abstracting — two can be coincidence.",
        ],
      },
    ],
    tradeoffs: {
      good: [
        "A rule changes in one place and stays consistent everywhere.",
        "Less code to read, and one obvious place to look for a piece of logic.",
        "Fewer bugs from copies that quietly drift apart.",
        "Encourages you to name and understand the concept you're extracting.",
      ],
      costs: [
        "Wrongly merging code that only looks alike couples unrelated things.",
        "A shared abstraction becomes a dependency everyone is stuck with.",
        "Chasing DRY too hard produces over-parameterized, unreadable helpers.",
        "Sometimes duplication across service boundaries is healthier than a shared library.",
      ],
    },
    realWorld:
      "DRY is one of the most quoted principles and one of the most over-applied. Experienced engineers temper it with 'a little copying is better than a little coupling' — because a bad shared abstraction, threaded through the whole system, is far harder to unpick than two similar blocks of code.",
    related: [
      {
        slug: "functions-one-thing",
        note: "Focused functions are the natural unit to extract and reuse.",
      },
      {
        slug: "coupling-cohesion",
        note: "The tension DRY navigates: reuse creates coupling.",
      },
      {
        slug: "naming",
        note: "You can only deduplicate a concept once you can name it.",
      },
      {
        slug: "solid",
        note: "SOLID gives you cleaner ways to share behavior without copy-paste.",
      },
      {
        slug: "tech-debt-refactoring",
        note: "Removing duplication is a routine refactoring move.",
      },
    ],
  },
  {
    slug: "coupling-cohesion",
    tagline:
      "How tangled modules are with each other (coupling) versus how focused each one is internally (cohesion).",
    problem:
      "You change one field in the user module and three unrelated features break — reporting, billing, and search all reached directly into that field. Meanwhile the 'utils' module is a junk drawer of date math, string helpers, and tax rules that have nothing to do with each other. The system is hard to change precisely because of how its parts relate. What are we actually measuring here?",
    how: [
      {
        type: "para",
        text: "Coupling measures how much one module depends on the internals of another. Tight coupling means a change over here forces changes over there. Cohesion measures how well the things inside a single module belong together. High cohesion means a module has one clear purpose and everything in it serves that purpose.",
      },
      {
        type: "para",
        text: "The goal is low coupling and high cohesion. Modules interact through small, stable interfaces rather than reaching into each other's guts, and each module is about one thing. That combination is what lets you change one part without a chain reaction, and understand a module without reading the whole system.",
      },
      {
        type: "points",
        items: [
          "Low coupling: modules talk through narrow, stable interfaces, not shared internals.",
          "High cohesion: everything in a module serves that module's single purpose.",
          "A 'utils' or 'manager' grab-bag is the classic low-cohesion smell.",
          "One tweak cascading into far-off files is the classic high-coupling smell.",
        ],
      },
    ],
    tradeoffs: {
      good: [
        "Changes stay local instead of rippling across the system.",
        "Modules can be understood, tested, and replaced on their own.",
        "Cohesive modules are easy to name and reason about.",
        "Reuse improves — a focused, loosely-coupled module drops in cleanly elsewhere.",
      ],
      costs: [
        "Loose coupling adds interfaces and indirection, which is more upfront code.",
        "Drawing the right boundaries is hard and often only clear in hindsight.",
        "Zero coupling is impossible — parts must talk; the aim is minimal, deliberate coupling.",
        "Over-abstracting for decoupling can hurt readability more than it helps.",
      ],
    },
    realWorld:
      "This is the lens behind most architecture debates — from splitting a monolith into modules to designing microservice boundaries. When people say a codebase is 'spaghetti' or a 'big ball of mud', they mean high coupling and low cohesion, measured informally.",
    related: [
      {
        slug: "modular-monolith",
        note: "Its whole point is high cohesion and low coupling between modules.",
      },
      {
        slug: "solid",
        note: "Five principles that are largely about achieving this balance.",
      },
      {
        slug: "dry",
        note: "The counterweight: reuse buys DRY but adds coupling.",
      },
      {
        slug: "microservices",
        note: "Service boundaries are a coupling-and-cohesion decision writ large.",
      },
      {
        slug: "design-patterns",
        note: "Many patterns exist specifically to loosen coupling.",
      },
    ],
  },
  {
    slug: "solid",
    tagline:
      "Five object-oriented design principles for code that's easier to change without breaking.",
    problem:
      "A report class formats data, decides where to save it, and knows about three specific export formats. Adding a fourth format means editing that class and risking the other three. Testing the formatting means also touching the file system. The class does too much and everything is wired to concrete details. Is there a checklist for avoiding this kind of rigid design?",
    how: [
      {
        type: "para",
        text: "SOLID is five principles, each named by a letter, that together push toward code where you can add behavior by adding new code rather than editing existing, working code. They're guidelines for object-oriented design, not laws — applied with judgment, they reduce the blast radius of change.",
      },
      {
        type: "points",
        items: [
          "Single Responsibility: a class should have one reason to change — one job.",
          "Open/Closed: open to extension, closed to modification — add features without editing existing code.",
          "Liskov Substitution: a subtype must be usable anywhere its base type is, without surprises.",
          "Interface Segregation: many small, focused interfaces beat one fat one clients don't fully use.",
          "Dependency Inversion: depend on abstractions, not concrete implementations.",
        ],
      },
      {
        type: "note",
        text: "SOLID can be over-applied. Chasing every principle on a small program produces a maze of interfaces and indirection for flexibility you'll never use. Reach for a principle when you feel the pain it addresses — not preemptively on everything.",
      },
    ],
    tradeoffs: {
      good: [
        "New behavior tends to mean new code, not edits to code that already works.",
        "Depending on abstractions makes swapping implementations and mocking easy.",
        "Small responsibilities and interfaces keep classes focused and testable.",
        "A shared vocabulary for discussing design decisions in review.",
      ],
      costs: [
        "Applied dogmatically, it produces excess interfaces and indirection.",
        "The principles are abstract; knowing when each applies takes experience.",
        "Extra abstraction can hurt readability for simple, stable code.",
        "Easy to cite as a rule to enforce rather than a trade-off to weigh.",
      ],
    },
    realWorld:
      "SOLID is a staple of interviews and code review, especially in Java and C# shops. The most practically valuable letters are S and D: single responsibility keeps classes focused, and dependency inversion (via injection) is what makes large codebases testable and swappable.",
    related: [
      {
        slug: "oop-pillars",
        note: "SOLID refines how to apply the underlying OO principles well.",
      },
      {
        slug: "coupling-cohesion",
        note: "Every SOLID principle serves low coupling and high cohesion.",
      },
      {
        slug: "design-patterns",
        note: "Patterns are concrete recipes that put SOLID into practice.",
      },
      {
        slug: "functions-one-thing",
        note: "Single responsibility at the function level.",
      },
      {
        slug: "dry",
        note: "SOLID offers cleaner ways to reuse than copy-paste.",
      },
    ],
  },
  {
    slug: "design-patterns",
    tagline:
      "Named, reusable solutions to problems that keep coming up in software design.",
    problem:
      "You need exactly one configuration object shared across the app. A teammate needs to create different kinds of report objects without hard-coding which. Another wants UI components to react when data changes. These are recurring shapes of problem, and people keep reinventing clumsy answers — and each invents different vocabulary for the same idea. Is there a shared catalog of proven solutions?",
    how: [
      {
        type: "para",
        text: "A design pattern is a general, reusable solution to a commonly occurring design problem — a template, not copy-paste code. The value is twofold: a tested structure to reach for, and a shared name so you can say 'use an Observer here' and a teammate immediately knows the shape you mean. The classic catalog groups them into three families.",
      },
      {
        type: "points",
        items: [
          "Creational — how objects get made: Factory, Builder, Singleton.",
          "Structural — how objects are composed: Adapter, Decorator, Facade, Proxy.",
          "Behavioral — how objects interact: Observer, Strategy, Command, Iterator.",
          "Strategy, for example, swaps an algorithm at runtime; Observer notifies subscribers when something changes.",
        ],
      },
      {
        type: "note",
        text: "Patterns are a vocabulary, not a goal. Forcing a pattern onto a problem that doesn't need one ('pattern-itis') adds complexity for no benefit. Many patterns also exist to work around limits of older languages — modern features like first-class functions make some of them nearly invisible.",
      },
    ],
    tradeoffs: {
      good: [
        "Reuse a proven structure instead of reinventing a shaky one.",
        "A shared name makes design intent communicable in a few words.",
        "Most patterns nudge you toward looser coupling and easier change.",
        "They encode hard-won experience you'd otherwise learn the slow way.",
      ],
      costs: [
        "Overuse ('everything's a factory') buries simple code in ceremony.",
        "Applying a pattern you don't fully understand can make things worse.",
        "Some patterns are workarounds for old language limits, now unnecessary.",
        "Adds indirection that can obscure what the code actually does.",
      ],
    },
    realWorld:
      "The 'Gang of Four' book made these mainstream, and the names are everywhere in real code and interviews — Factory, Singleton, Observer, Strategy, Decorator. You've almost certainly used several without naming them; learning the catalog mostly gives you the words to discuss designs you already build.",
    related: [
      {
        slug: "solid",
        note: "The principles most patterns are concrete applications of.",
      },
      {
        slug: "oop-pillars",
        note: "Patterns lean heavily on polymorphism and composition.",
      },
      {
        slug: "coupling-cohesion",
        note: "Many patterns exist specifically to reduce coupling.",
      },
      {
        slug: "dry",
        note: "Patterns give structured ways to reuse rather than repeat.",
      },
      {
        slug: "classes-objects",
        note: "The building blocks most classic patterns are expressed in.",
      },
    ],
  },
];
