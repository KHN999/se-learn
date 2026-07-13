import { getTopic } from "@/lib/curriculum";
import { getFlow } from "@/lib/flows";

// Learning paths are curated, ordered routes through the SAME map — not separate
// courses. Each step points at an existing topic or flow; the value is the
// sequence and the grouping into phases that build on each other.

export type PathStepRef = { type: "topic" | "flow"; slug: string };
export type PathPhase = { title: string; steps: PathStepRef[] };
export type LearningPath = {
  id: string;
  title: string;
  audience: string;
  tagline: string;
  icon: string; // see components/PathIcon
  color: string;
  phases: PathPhase[];
};

const t = (slug: string): PathStepRef => ({ type: "topic", slug });
const f = (slug: string): PathStepRef => ({ type: "flow", slug });

export const FLOW_COLOR = "#43e0c8";

export const paths: LearningPath[] = [
  {
    id: "fundamentals",
    title: "Start with the fundamentals",
    audience: "New to software engineering",
    tagline: "The core ideas, in the order they build on each other.",
    icon: "Compass",
    color: "#6ea8ff",
    phases: [
      {
        title: "Write your first programs",
        steps: [
          t("variables-types"),
          t("control-flow"),
          t("functions"),
          t("classes-objects"),
          t("error-handling"),
          t("collections"),
        ],
      },
      {
        title: "Data & efficiency",
        steps: [t("array"), t("hash-map"), t("tree"), t("big-o-notation")],
      },
      {
        title: "Work like a developer",
        steps: [t("git-model"), t("branching-merging"), t("pull-requests-review")],
      },
      {
        title: "How a web app works",
        steps: [f("request"), t("http-methods"), t("status-codes"), t("dns")],
      },
      {
        title: "Store & fetch data",
        steps: [t("tables-schema"), t("select-where"), t("joins"), t("indexes")],
      },
      {
        title: "Ship it & keep it working",
        steps: [
          t("why-testing"),
          t("unit-tests"),
          t("logs-stack-traces"),
          f("deploy"),
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend engineer",
    audience: "Build the server side",
    tagline: "From a single request to a system that scales.",
    icon: "Server",
    color: "#34d399",
    phases: [
      {
        title: "Foundations",
        steps: [
          t("functions"),
          t("error-handling"),
          t("big-o-notation"),
          t("git-model"),
        ],
      },
      {
        title: "The web layer",
        steps: [
          f("request"),
          t("http-methods"),
          t("status-codes"),
          t("headers-cookies"),
          t("rest"),
          t("api-auth"),
        ],
      },
      {
        title: "Data",
        steps: [
          t("tables-schema"),
          t("joins"),
          t("indexes"),
          t("transactions-acid"),
          t("isolation-levels"),
          t("query-planning"),
          f("save-conflict"),
        ],
      },
      {
        title: "Identity & security",
        steps: [
          t("auth-vs-authz"),
          t("sessions-cookies"),
          t("jwt"),
          t("password-hashing"),
          f("login"),
          t("sql-injection"),
          t("input-validation"),
        ],
      },
      {
        title: "Speed & scale",
        steps: [
          t("caching-perf"),
          t("redis"),
          t("n-plus-1"),
          t("message-queues"),
          t("replication"),
          t("load-balancing"),
          f("scale"),
        ],
      },
      {
        title: "Concurrency & distributed",
        steps: [
          t("sync-vs-async"),
          t("race-conditions"),
          t("locks"),
          t("deadlock"),
          t("idempotency"),
          t("eventual-consistency"),
        ],
      },
    ],
  },
  {
    id: "frontend",
    title: "Frontend engineer",
    audience: "Build what users see",
    tagline: "The browser, the network, and making it fast and safe.",
    icon: "MonitorPlay",
    color: "#38bdf8",
    phases: [
      {
        title: "Foundations",
        steps: [
          t("variables-types"),
          t("functions"),
          t("classes-objects"),
          t("collections"),
          t("git-model"),
        ],
      },
      {
        title: "Browser and server",
        steps: [
          f("request"),
          t("http-request-response"),
          t("http-methods"),
          t("status-codes"),
          t("headers-cookies"),
          t("dns"),
          t("tls-https"),
        ],
      },
      {
        title: "APIs & data",
        steps: [t("rest"), t("graphql"), t("api-auth"), t("caching-perf")],
      },
      {
        title: "Real-time & search",
        steps: [t("websockets"), f("chat"), f("search")],
      },
      {
        title: "Performance",
        steps: [
          t("latency-vs-throughput"),
          t("compression"),
          t("caching-cdn"),
          t("big-o-notation"),
        ],
      },
      {
        title: "Security you must know",
        steps: [t("xss"), t("csrf"), t("input-validation"), t("sessions-cookies")],
      },
    ],
  },
  {
    id: "devops",
    title: "DevOps & infrastructure",
    audience: "Run and ship software",
    tagline: "Get code shipped, running, and reliable in production.",
    icon: "Rocket",
    color: "#fb923c",
    phases: [
      {
        title: "Version control",
        steps: [
          t("git-model"),
          t("git-everyday"),
          t("branching-merging"),
          t("rebase"),
          t("pull-requests-review"),
        ],
      },
      {
        title: "Package & ship",
        steps: [
          t("docker-containers"),
          t("docker-compose"),
          t("ci-cd"),
          f("deploy"),
        ],
      },
      {
        title: "Run at scale",
        steps: [
          t("load-balancing"),
          t("load-balancer-proxy"),
          t("scalability"),
          t("high-availability"),
          t("replication"),
          t("caching-cdn"),
          f("scale"),
        ],
      },
      {
        title: "Orchestrate & observe",
        steps: [
          t("what-is-cloud"),
          t("cloud-networking-iam"),
          t("serverless"),
          t("kubernetes"),
          t("observability"),
        ],
      },
      {
        title: "Reliability",
        steps: [
          t("fault-tolerance"),
          t("failure-retries-timeouts"),
          t("idempotency"),
          t("rate-limiting"),
        ],
      },
    ],
  },
  {
    id: "system-design",
    title: "System design & interviews",
    audience: "Prep for design interviews",
    tagline: "The building blocks of large systems, and how they fit together.",
    icon: "Blocks",
    color: "#a78bfa",
    phases: [
      {
        title: "CS foundations",
        steps: [
          t("big-o-notation"),
          t("complexity-classes"),
          t("array"),
          t("hash-map"),
          t("tree"),
          t("graph"),
        ],
      },
      {
        title: "Data & storage",
        steps: [
          t("tables-schema"),
          t("indexes"),
          t("transactions-acid"),
          t("isolation-levels"),
          t("sql-vs-nosql"),
          t("normalization"),
        ],
      },
      {
        title: "Building blocks",
        steps: [
          t("caching-cdn"),
          t("message-queues"),
          t("load-balancing"),
          t("replication"),
          t("sharding"),
          t("rate-limiting"),
        ],
      },
      {
        title: "Distributed systems",
        steps: [
          t("cap-theorem"),
          t("consistency-models"),
          t("eventual-consistency"),
          t("idempotency"),
          t("failure-retries-timeouts"),
          t("consensus"),
        ],
      },
      {
        title: "Put it together",
        steps: [
          f("scale"),
          f("chat"),
          f("search"),
          t("scalability"),
          t("high-availability"),
          t("fault-tolerance"),
        ],
      },
    ],
  },
];

export function getPath(id: string): LearningPath | undefined {
  return paths.find((p) => p.id === id);
}

export function getAllPathIds(): string[] {
  return paths.map((p) => p.id);
}

export type ResolvedStep = {
  type: "topic" | "flow";
  slug: string;
  title: string;
  color: string;
  href: string;
};
export type ResolvedPhase = { title: string; steps: ResolvedStep[] };

// Resolve a path's slug references into display data (title, color, href),
// dropping any that don't resolve.
export function resolvePath(p: LearningPath): {
  phases: ResolvedPhase[];
  slugs: string[];
} {
  const phases: ResolvedPhase[] = p.phases.map((ph) => ({
    title: ph.title,
    steps: ph.steps
      .map((s): ResolvedStep | null => {
        if (s.type === "flow") {
          const fl = getFlow(s.slug);
          return fl
            ? {
                type: "flow",
                slug: s.slug,
                title: fl.title,
                color: FLOW_COLOR,
                href: `/flow/${s.slug}`,
              }
            : null;
        }
        const tp = getTopic(s.slug);
        return tp
          ? {
              type: "topic",
              slug: s.slug,
              title: tp.title,
              color: tp.areaColor,
              href: `/topic/${s.slug}`,
            }
          : null;
      })
      .filter((x): x is ResolvedStep => x !== null),
  }));
  const slugs = phases.flatMap((ph) => ph.steps.map((s) => s.slug));
  return { phases, slugs };
}
