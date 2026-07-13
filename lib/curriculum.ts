import { getBuiltTopicSlugs } from "@/lib/topics";

// The full curriculum as structured data — the backbone for navigation, the
// area/topic pages, and (later) the knowledge graph. Kept in sync with
// CONTENT.md, which holds the concept-level detail for each topic.
//
// Every topic is a node with a stable slug. `status` is "planned" until a real
// page is written for it; flip it to "built" when the page ships.

export type TopicStatus = "built" | "planned";

export type Area = {
  id: string;
  n: number;
  title: string;
  tagline: string;
  icon: string; // see components/AreaIcon
  color: string; // the area's identity color (hex)
};

export type Topic = {
  id: string;
  title: string;
  areaId: string;
  areaTitle: string;
  areaColor: string;
  status: TopicStatus;
};

type AreaDef = {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  topics: [string, string][]; // [slug, title]
};

const DATA: AreaDef[] = [
  {
    id: "programming-fundamentals",
    title: "Programming Fundamentals",
    tagline: "The building blocks every program is made of.",
    icon: "Braces",
    topics: [
      ["variables-types", "Variables & types"],
      ["control-flow", "Control flow"],
      ["functions", "Functions"],
      ["classes-objects", "Classes & objects"],
      ["error-handling", "Error handling"],
      ["collections", "Collections"],
      ["file-io", "File I/O"],
    ],
  },
  {
    id: "data-structures",
    title: "Data Structures",
    tagline: "How data is arranged so you can use it efficiently.",
    icon: "Boxes",
    topics: [
      ["array", "Array"],
      ["linked-list", "Linked list"],
      ["stack", "Stack"],
      ["queue", "Queue"],
      ["hash-map", "Hash map"],
      ["tree", "Tree"],
      ["heap", "Heap"],
      ["graph", "Graph"],
    ],
  },
  {
    id: "algorithms",
    title: "Algorithms",
    tagline: "Step-by-step methods for solving problems.",
    icon: "Workflow",
    topics: [
      ["searching", "Searching"],
      ["sorting", "Sorting"],
      ["recursion", "Recursion"],
      ["dynamic-programming", "Dynamic programming"],
      ["greedy", "Greedy algorithms"],
    ],
  },
  {
    id: "complexity",
    title: "Complexity (Big-O)",
    tagline: "How to reason about speed as things grow.",
    icon: "TrendingUp",
    topics: [
      ["big-o-notation", "Big-O notation"],
      ["complexity-classes", "The common classes"],
      ["time-vs-space", "Time vs space"],
    ],
  },
  {
    id: "cs-fundamentals",
    title: "CS Fundamentals",
    tagline: "What the machine is actually doing underneath.",
    icon: "Cpu",
    topics: [
      ["stack-vs-heap", "Stack vs heap memory"],
      ["pointers-references", "Pointers & references"],
      ["garbage-collection", "Garbage collection"],
      ["process-vs-thread", "Process vs thread"],
      ["context-switching", "Context switching"],
      ["single-vs-multi-threaded", "Single vs multi-threaded"],
      ["os-scheduling", "OS scheduling"],
      ["virtual-memory", "Virtual memory"],
      ["file-systems-permissions", "File systems & permissions"],
      ["os-locking-sync", "OS locking & synchronization"],
    ],
  },
  {
    id: "git",
    title: "Git & Version Control",
    tagline: "Tracking changes and working with others.",
    icon: "GitBranch",
    topics: [
      ["git-model", "The Git model"],
      ["git-everyday", "Everyday flow"],
      ["branching-merging", "Branching & merging"],
      ["rebase", "Rebase"],
      ["conflict-resolution", "Conflict resolution"],
      ["pull-requests-review", "Pull requests & code review"],
    ],
  },
  {
    id: "sql",
    title: "Databases: SQL",
    tagline: "Asking a relational database questions.",
    icon: "Database",
    topics: [
      ["tables-schema", "Tables & schema"],
      ["select-where", "SELECT / WHERE / ORDER BY"],
      ["insert-update-delete", "INSERT / UPDATE / DELETE"],
      ["joins", "JOINs"],
      ["group-by", "GROUP BY & aggregates"],
      ["foreign-keys", "Foreign keys"],
    ],
  },
  {
    id: "db-internals",
    title: "Databases: Internals",
    tagline: "Why databases are fast, safe, and consistent.",
    icon: "Table2",
    topics: [
      ["indexes", "Indexes"],
      ["transactions-acid", "Transactions & ACID"],
      ["locks", "Locks"],
      ["isolation-levels", "Isolation levels"],
      ["normalization", "Normalization"],
      ["query-planning", "Query planning"],
    ],
  },
  {
    id: "nosql",
    title: "Databases: NoSQL",
    tagline: "When the relational model isn't the right fit.",
    icon: "Layers",
    topics: [
      ["sql-vs-nosql", "SQL vs NoSQL"],
      ["mongodb", "MongoDB"],
      ["redis", "Redis"],
      ["elasticsearch", "Elasticsearch"],
    ],
  },
  {
    id: "web-networking",
    title: "The Web & Networking",
    tagline: "How machines talk across the internet.",
    icon: "Globe",
    topics: [
      ["http-request-response", "HTTP request/response"],
      ["http-methods", "HTTP methods"],
      ["status-codes", "Status codes"],
      ["headers-cookies", "Headers & cookies"],
      ["dns", "DNS"],
      ["tcp-vs-udp", "TCP vs UDP"],
      ["tls-https", "TLS/HTTPS"],
      ["websockets", "WebSockets"],
      ["http2-http3", "HTTP/2 & HTTP/3"],
    ],
  },
  {
    id: "apis",
    title: "APIs",
    tagline: "How programs expose and consume each other.",
    icon: "Webhook",
    topics: [
      ["rest", "REST"],
      ["api-auth", "API authentication"],
      ["grpc", "gRPC"],
      ["graphql", "GraphQL"],
      ["rate-limiting", "Rate limiting"],
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    tagline: "How a system is split into parts.",
    icon: "Network",
    topics: [
      ["monolith", "Monolith"],
      ["modular-monolith", "Modular monolith"],
      ["microservices", "Microservices"],
      ["api-gateway", "API gateway"],
      ["service-discovery", "Service discovery"],
      ["load-balancer-proxy", "Load balancer & reverse proxy"],
    ],
  },
  {
    id: "design-clean-code",
    title: "Design & Clean Code",
    tagline: "Writing code that stays easy to change.",
    icon: "Shapes",
    topics: [
      ["oop-pillars", "OOP pillars"],
      ["naming", "Naming"],
      ["functions-one-thing", "Functions do one thing"],
      ["dry", "DRY / avoid duplication"],
      ["coupling-cohesion", "Coupling & cohesion"],
      ["solid", "SOLID"],
      ["design-patterns", "Design patterns"],
    ],
  },
  {
    id: "authentication",
    title: "Authentication & Identity",
    tagline: "Knowing who a user is, and what they may do.",
    icon: "KeyRound",
    topics: [
      ["auth-vs-authz", "Authentication vs authorization"],
      ["sessions-cookies", "Sessions & cookies"],
      ["jwt", "JWT"],
      ["oauth-oidc", "OAuth & OpenID Connect"],
      ["password-hashing", "Password hashing"],
    ],
  },
  {
    id: "security",
    title: "Security",
    tagline: "Assuming someone is trying to break in.",
    icon: "ShieldCheck",
    topics: [
      ["owasp-top-10", "OWASP Top 10"],
      ["sql-injection", "SQL injection"],
      ["xss", "XSS"],
      ["csrf", "CSRF"],
      ["ssrf", "SSRF"],
      ["broken-auth", "Broken authentication"],
      ["input-validation", "Input validation"],
      ["encryption", "Encryption"],
      ["rate-limiting-defense", "Rate limiting as defense"],
    ],
  },
  {
    id: "testing-debugging",
    title: "Testing & Debugging",
    tagline: "Proving it works, and finding out why it doesn't.",
    icon: "FlaskConical",
    topics: [
      ["why-testing", "Why testing matters"],
      ["unit-tests", "Unit tests"],
      ["integration-tests", "Integration tests"],
      ["e2e-tests", "End-to-end tests"],
      ["mocking", "Mocking"],
      ["test-coverage", "Test coverage"],
      ["logs-stack-traces", "Logs & stack traces"],
      ["breakpoints-profiling", "Breakpoints & profiling"],
    ],
  },
  {
    id: "performance",
    title: "Performance",
    tagline: "Making it fast without guessing.",
    icon: "Gauge",
    topics: [
      ["latency-vs-throughput", "Latency vs throughput"],
      ["cpu-memory-usage", "CPU & memory usage"],
      ["caching-perf", "Caching"],
      ["compression", "Compression"],
      ["connection-pooling", "Connection pooling"],
      ["n-plus-1", "N+1 queries"],
    ],
  },
  {
    id: "concurrency",
    title: "Concurrency",
    tagline: "Doing many things at once, correctly.",
    icon: "GitFork",
    topics: [
      ["sync-vs-async", "Synchronous vs asynchronous"],
      ["race-conditions", "Race conditions"],
      ["mutex", "Mutex"],
      ["semaphore", "Semaphore"],
      ["deadlock", "Deadlock"],
      ["atomic-operations", "Atomic operations"],
      ["thread-pools", "Thread pools"],
      ["channels", "Channels (Go)"],
    ],
  },
  {
    id: "system-design",
    title: "System Design",
    tagline: "Assembling components into a system that scales.",
    icon: "Blocks",
    topics: [
      ["caching-cdn", "Caching & CDN"],
      ["message-queues", "Message queues"],
      ["replication", "Database replication"],
      ["sharding", "Sharding"],
      ["load-balancing", "Load balancing"],
      ["high-availability", "High availability"],
      ["scalability", "Scalability"],
      ["fault-tolerance", "Fault tolerance"],
    ],
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems",
    tagline: "When one machine isn't enough, and things fail.",
    icon: "Share2",
    topics: [
      ["cap-theorem", "CAP theorem"],
      ["consistency-models", "Consistency models"],
      ["eventual-consistency", "Eventual consistency"],
      ["idempotency", "Idempotency"],
      ["failure-retries-timeouts", "Failure, retries & timeouts"],
      ["consensus", "Consensus (basic)"],
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    tagline: "Running and shipping software in the real world.",
    icon: "Cloud",
    topics: [
      ["what-is-cloud", "What the cloud is"],
      ["serverless", "Serverless"],
      ["cloud-networking-iam", "Cloud networking & IAM"],
      ["docker-containers", "Docker & containers"],
      ["docker-compose", "Docker Compose"],
      ["ci-cd", "CI/CD"],
      ["kubernetes", "Kubernetes (basic)"],
      ["observability", "Observability"],
    ],
  },
  {
    id: "engineering-practice",
    title: "Working as an Engineer",
    tagline: "The habits and teamwork around the code.",
    icon: "Users",
    topics: [
      ["agile-scrum-kanban", "Agile / Scrum / Kanban"],
      ["sprints-story-points", "Sprints & story points"],
      ["tech-debt-refactoring", "Technical debt & refactoring"],
      ["documentation", "Documentation"],
      ["soft-skills", "Soft skills"],
      ["domain-knowledge", "Domain knowledge"],
    ],
  },
];

// Each area gets its own identity color, so color becomes a navigation and
// memory aid — related districts share a hue family (databases green, the
// foundations blue/violet, security/auth warm, etc.).
const AREA_COLORS: Record<string, string> = {
  "programming-fundamentals": "#6ea8ff",
  "data-structures": "#a78bfa",
  algorithms: "#f472b6",
  complexity: "#fbbf24",
  "cs-fundamentals": "#22d3ee",
  git: "#fb923c",
  sql: "#34d399",
  "db-internals": "#10b981",
  nosql: "#4ade80",
  "web-networking": "#38bdf8",
  apis: "#2dd4bf",
  architecture: "#facc15",
  "design-clean-code": "#ec4899",
  authentication: "#eab308",
  security: "#f43f5e",
  "testing-debugging": "#a3e635",
  performance: "#fb7185",
  concurrency: "#c084fc",
  "system-design": "#818cf8",
  "distributed-systems": "#8b5cf6",
  "cloud-devops": "#60a5fa",
  "engineering-practice": "#94a3b8",
};

const FALLBACK_COLOR = "#6ea8ff";

/** Build a translucent tint of a color, for backgrounds and glows. */
export function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export const areas: Area[] = DATA.map((a, i) => ({
  id: a.id,
  n: i + 1,
  title: a.title,
  tagline: a.tagline,
  icon: a.icon,
  color: AREA_COLORS[a.id] ?? FALLBACK_COLOR,
}));

const BUILT_SLUGS = new Set(getBuiltTopicSlugs());

export const topics: Topic[] = DATA.flatMap((a) =>
  a.topics.map(
    ([id, title]): Topic => ({
      id,
      title,
      areaId: a.id,
      areaTitle: a.title,
      areaColor: AREA_COLORS[a.id] ?? FALLBACK_COLOR,
      status: BUILT_SLUGS.has(id) ? "built" : "planned",
    }),
  ),
);

export const topicCount = topics.length;
export const builtTopicCount = topics.filter((t) => t.status === "built").length;

export function getArea(id: string): Area | undefined {
  return areas.find((a) => a.id === id);
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

export function getAreaTopics(areaId: string): Topic[] {
  return topics.filter((t) => t.areaId === areaId);
}

export function getAllTopicIds(): string[] {
  return topics.map((t) => t.id);
}

export function getAllAreaIds(): string[] {
  return areas.map((a) => a.id);
}
