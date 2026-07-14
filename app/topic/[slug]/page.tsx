import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Lightbulb,
} from "lucide-react";
import {
  getAllTopicIds,
  getArea,
  getAreaTopics,
  getTopic,
  tint,
} from "@/lib/curriculum";
import {
  getTopicContent,
  getTopicGraph,
  type ContentBlock,
  type DemoId,
} from "@/lib/topics";
import { AreaIcon } from "@/components/AreaIcon";
import IndexScanDemo from "@/components/demos/IndexScanDemo";
import CoercionDemo from "@/components/demos/CoercionDemo";
import ReferenceDemo from "@/components/demos/ReferenceDemo";
import ControlFlowDemo from "@/components/demos/ControlFlowDemo";
import CallStackDemo from "@/components/demos/CallStackDemo";
import ClassInstanceDemo from "@/components/demos/ClassInstanceDemo";
import ErrorPropagationDemo from "@/components/demos/ErrorPropagationDemo";
import CollectionsDemo from "@/components/demos/CollectionsDemo";
import FileStreamDemo from "@/components/demos/FileStreamDemo";
import ArrayDemo from "@/components/demos/ArrayDemo";
import LinkedListDemo from "@/components/demos/LinkedListDemo";
import StackQueueDemo from "@/components/demos/StackQueueDemo";
import HashMapDemo from "@/components/demos/HashMapDemo";
import HeapDemo from "@/components/demos/HeapDemo";
import GraphDemo from "@/components/demos/GraphDemo";
import TreeDemo from "@/components/demos/TreeDemo";
import SearchDemo from "@/components/demos/SearchDemo";
import SortDemo from "@/components/demos/SortDemo";
import RecursionDemo from "@/components/demos/RecursionDemo";
import GreedyDemo from "@/components/demos/GreedyDemo";
import DpFibDemo from "@/components/demos/DpFibDemo";
import BigODemo from "@/components/demos/BigODemo";
import ClassBarsDemo from "@/components/demos/ClassBarsDemo";
import TimeSpaceDemo from "@/components/demos/TimeSpaceDemo";
import SqlDemo from "@/components/demos/SqlDemo";
import TxnRaceDemo from "@/components/demos/TxnRaceDemo";
import HttpExchangeDemo from "@/components/demos/HttpExchangeDemo";
import HttpMethodsDemo from "@/components/demos/HttpMethodsDemo";
import StatusCodeDemo from "@/components/demos/StatusCodeDemo";
import CookieDemo from "@/components/demos/CookieDemo";
import DnsResolveDemo from "@/components/demos/DnsResolveDemo";
import TcpUdpDemo from "@/components/demos/TcpUdpDemo";
import TlsHandshakeDemo from "@/components/demos/TlsHandshakeDemo";
import WsPushDemo from "@/components/demos/WsPushDemo";
import MultiplexingDemo from "@/components/demos/MultiplexingDemo";
import TypeInspectorDemo from "@/components/demos/TypeInspectorDemo";
import DomTreeDemo from "@/components/demos/DomTreeDemo";
import BoxModelDemo from "@/components/demos/BoxModelDemo";
import RenderPipelineDemo from "@/components/demos/RenderPipelineDemo";
import EventBubblingDemo from "@/components/demos/EventBubblingDemo";
import UiStateDemo from "@/components/demos/UiStateDemo";
import VdomDiffDemo from "@/components/demos/VdomDiffDemo";
import SpaNavDemo from "@/components/demos/SpaNavDemo";
import StateMgmtDemo from "@/components/demos/StateMgmtDemo";
import A11yDemo from "@/components/demos/A11yDemo";
import BundlerDemo from "@/components/demos/BundlerDemo";
import WebVitalsDemo from "@/components/demos/WebVitalsDemo";
import ArchStylesDemo from "@/components/demos/ArchStylesDemo";
import ApiGatewayDemo from "@/components/demos/ApiGatewayDemo";
import LoadBalanceDemo from "@/components/demos/LoadBalanceDemo";
import ServiceDiscoveryDemo from "@/components/demos/ServiceDiscoveryDemo";
import RefactorDemo from "@/components/demos/RefactorDemo";
import OopPillarsDemo from "@/components/demos/OopPillarsDemo";
import CouplingDemo from "@/components/demos/CouplingDemo";
import SolidDemo from "@/components/demos/SolidDemo";
import DesignPatternsDemo from "@/components/demos/DesignPatternsDemo";
import AuthzDemo from "@/components/demos/AuthzDemo";
import SessionDemo from "@/components/demos/SessionDemo";
import JwtDemo from "@/components/demos/JwtDemo";
import OAuthFlowDemo from "@/components/demos/OAuthFlowDemo";
import PasswordHashDemo from "@/components/demos/PasswordHashDemo";
import OwaspDemo from "@/components/demos/OwaspDemo";
import SqlInjectionDemo from "@/components/demos/SqlInjectionDemo";
import XssDemo from "@/components/demos/XssDemo";
import CsrfDemo from "@/components/demos/CsrfDemo";
import SsrfDemo from "@/components/demos/SsrfDemo";
import BrokenAuthDemo from "@/components/demos/BrokenAuthDemo";
import InputValidationDemo from "@/components/demos/InputValidationDemo";
import EncryptionDemo from "@/components/demos/EncryptionDemo";
import RateLimitDemo from "@/components/demos/RateLimitDemo";
import TopicGraph from "@/components/TopicGraph";

export function generateStaticParams() {
  return getAllTopicIds().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Topic not found — SE-Map" };
  const content = getTopicContent(slug);
  return {
    title: `${topic.title} — SE-Map`,
    description:
      content?.tagline ??
      `${topic.title}, in ${topic.areaTitle}. Where it fits on the map of software engineering.`,
  };
}

const PROMISE = [
  "Where it fits in the bigger picture",
  "What actually happens here",
  "Why it exists — the problem that forced it",
  "How it works, in just enough detail",
  "What goes in, and what comes out",
  "What it costs — the tradeoff",
  "What connects to it, before and next",
];

function SectionTitle({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <h2
      className="font-mono text-xs uppercase tracking-widest"
      style={{ color }}
    >
      {children}
    </h2>
  );
}

function Block({ block, color }: { block: ContentBlock; color: string }) {
  if (block.type === "para") {
    return <p className="leading-relaxed text-dim">{block.text}</p>;
  }
  if (block.type === "points") {
    return (
      <ul className="space-y-2">
        {block.items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-dim">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "code") {
    return (
      <figure className="overflow-hidden rounded-xl border border-line bg-bg-2">
        <pre className="thin-scroll overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-dim">{block.code}</code>
        </pre>
        {block.caption && (
          <figcaption className="border-t border-line px-4 py-2 text-xs text-faint">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.type === "demo") {
    return <div className="my-2">{renderDemo(block.demo, color)}</div>;
  }
  if (block.type === "aside") {
    return (
      <details className="group rounded-xl border border-line bg-bg-2/40 p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-text">
          <ChevronRight className="h-4 w-4 text-faint transition-transform group-open:rotate-90" />
          {block.title}
        </summary>
        <div className="mt-3 space-y-3">
          {block.blocks.map((b, i) => (
            <Block key={i} block={b} color={color} />
          ))}
        </div>
      </details>
    );
  }
  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{ borderColor: tint(color, 30), background: tint(color, 7) }}
    >
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      <p className="text-sm leading-relaxed text-dim">{block.text}</p>
    </div>
  );
}

// Typed registry: every DemoId must have an entry (checked by `satisfies`), and
// content can only reference a valid DemoId — so a missing/misspelled demo is a
// compile error rather than a silently blank slot.
const DEMOS = {
  "index-scan": (c: string) => <IndexScanDemo color={c} />,
  coercion: (c: string) => <CoercionDemo color={c} />,
  references: (c: string) => <ReferenceDemo color={c} />,
  "control-flow-tracer": (c: string) => <ControlFlowDemo color={c} />,
  "call-stack": (c: string) => <CallStackDemo color={c} />,
  "class-instances": (c: string) => <ClassInstanceDemo color={c} />,
  "error-propagation": (c: string) => <ErrorPropagationDemo color={c} />,
  "collections-compare": (c: string) => <CollectionsDemo color={c} />,
  "file-stream": (c: string) => <FileStreamDemo color={c} />,
  "array-ops": (c: string) => <ArrayDemo color={c} />,
  "linked-list-ops": (c: string) => <LinkedListDemo color={c} />,
  stack: (c: string) => <StackQueueDemo color={c} mode="stack" />,
  queue: (c: string) => <StackQueueDemo color={c} mode="queue" />,
  "hashmap-buckets": (c: string) => <HashMapDemo color={c} />,
  "heap-tree": (c: string) => <HeapDemo color={c} />,
  "graph-traversal": (c: string) => <GraphDemo color={c} />,
  bst: (c: string) => <TreeDemo color={c} />,
  "search-compare": (c: string) => <SearchDemo color={c} />,
  "sort-bars": (c: string) => <SortDemo color={c} />,
  "recursion-factorial": (c: string) => <RecursionDemo color={c} />,
  "greedy-coins": (c: string) => <GreedyDemo color={c} />,
  "dp-fib": (c: string) => <DpFibDemo color={c} />,
  "growth-curves": (c: string) => <BigODemo color={c} />,
  "class-bars": (c: string) => <ClassBarsDemo color={c} />,
  "time-space": (c: string) => <TimeSpaceDemo color={c} />,
  "sql-select": (c: string) => <SqlDemo color={c} focus="filter" />,
  "sql-join": (c: string) => <SqlDemo color={c} focus="join" />,
  "sql-group": (c: string) => <SqlDemo color={c} focus="group" />,
  "txn-race": (c: string) => <TxnRaceDemo color={c} />,
  "http-exchange": (c: string) => <HttpExchangeDemo color={c} />,
  "http-verbs": (c: string) => <HttpMethodsDemo color={c} />,
  "status-codes": (c: string) => <StatusCodeDemo color={c} />,
  "cookies": (c: string) => <CookieDemo color={c} />,
  "dns-resolve": (c: string) => <DnsResolveDemo color={c} />,
  "tcp-udp": (c: string) => <TcpUdpDemo color={c} />,
  "tls-handshake": (c: string) => <TlsHandshakeDemo color={c} />,
  "ws-push": (c: string) => <WsPushDemo color={c} />,
  "multiplexing": (c: string) => <MultiplexingDemo color={c} />,
  "type-inspector": (c: string) => <TypeInspectorDemo color={c} />,
  "dom-tree": (c: string) => <DomTreeDemo color={c} />,
  "box-model": (c: string) => <BoxModelDemo color={c} />,
  "render-pipeline": (c: string) => <RenderPipelineDemo color={c} />,
  "event-bubbling": (c: string) => <EventBubblingDemo color={c} />,
  "ui-state": (c: string) => <UiStateDemo color={c} />,
  "vdom-diff": (c: string) => <VdomDiffDemo color={c} />,
  "spa-nav": (c: string) => <SpaNavDemo color={c} />,
  "prop-drilling": (c: string) => <StateMgmtDemo color={c} />,
  "a11y-tree": (c: string) => <A11yDemo color={c} />,
  "bundler": (c: string) => <BundlerDemo color={c} />,
  "web-vitals": (c: string) => <WebVitalsDemo color={c} />,
  "arch-styles": (c: string) => <ArchStylesDemo color={c} />,
  "api-gateway": (c: string) => <ApiGatewayDemo color={c} />,
  "load-balance": (c: string) => <LoadBalanceDemo color={c} />,
  "service-discovery": (c: string) => <ServiceDiscoveryDemo color={c} />,
  "oop-pillars": (c: string) => <OopPillarsDemo color={c} />,
  "refactor-naming": (c: string) => <RefactorDemo color={c} focus="naming" />,
  "refactor-functions": (c: string) => <RefactorDemo color={c} focus="functions" />,
  "refactor-dry": (c: string) => <RefactorDemo color={c} focus="dry" />,
  "coupling": (c: string) => <CouplingDemo color={c} />,
  "solid": (c: string) => <SolidDemo color={c} />,
  "design-patterns": (c: string) => <DesignPatternsDemo color={c} />,
  "authn-authz": (c: string) => <AuthzDemo color={c} />,
  "session-store": (c: string) => <SessionDemo color={c} />,
  "jwt-decode": (c: string) => <JwtDemo color={c} />,
  "oauth-flow": (c: string) => <OAuthFlowDemo color={c} />,
  "password-hash": (c: string) => <PasswordHashDemo color={c} />,
  "owasp": (c: string) => <OwaspDemo color={c} />,
  "sql-injection": (c: string) => <SqlInjectionDemo color={c} />,
  "xss-escape": (c: string) => <XssDemo color={c} />,
  "csrf-attack": (c: string) => <CsrfDemo color={c} />,
  "ssrf-block": (c: string) => <SsrfDemo color={c} />,
  "login-attack": (c: string) => <BrokenAuthDemo color={c} />,
  "allowlist": (c: string) => <InputValidationDemo color={c} />,
  "sym-asym": (c: string) => <EncryptionDemo color={c} />,
  "token-bucket": (c: string) => <RateLimitDemo color={c} />,
} satisfies Record<DemoId, (color: string) => React.ReactNode>;

function renderDemo(id: DemoId, color: string) {
  return DEMOS[id](color);
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const area = getArea(topic.areaId);
  const content = getTopicContent(topic.id);
  const c = topic.areaColor;
  const siblings = getAreaTopics(topic.areaId);
  const idx = siblings.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const graph = content
    ? getTopicGraph(topic.id)
    : { neighbors: [], edges: [] };
  const centerNode = { id: topic.id, title: topic.title, color: c };
  const neighborNodes = graph.neighbors
    .map((s) => {
      const nt = getTopic(s);
      return nt ? { id: nt.id, title: nt.title, color: nt.areaColor } : null;
    })
    .filter(
      (x): x is { id: string; title: string; color: string } => x !== null,
    );

  return (
    <main
      className="mx-auto max-w-4xl px-5 pb-16"
      style={{ ["--area"]: c } as React.CSSProperties}
    >
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 pt-8 font-mono text-xs text-faint">
        <Link href="/" className="hover:text-dim">
          map
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/area/${topic.areaId}`} className="hover:text-dim">
          {topic.areaTitle}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-dim">{topic.title}</span>
      </nav>

      <header className="pt-6">
        <div className="flex items-center gap-3">
          {area && (
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{ background: tint(c, 15), color: c }}
            >
              <AreaIcon name={area.icon} className="h-5 w-5" />
            </span>
          )}
          <div>
            <p
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: c }}
            >
              {topic.areaTitle}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-text">
              {topic.title}
            </h1>
          </div>
        </div>
        {content && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">
            {content.tagline}
          </p>
        )}
      </header>

      {content ? (
        <>
          <section className="mt-8 space-y-3">
            <SectionTitle color={c}>The problem</SectionTitle>
            <p className="text-lg leading-relaxed text-text">
              {content.problem}
            </p>
          </section>

          {content.demo && (
            <div className="mt-8">{renderDemo(content.demo, c)}</div>
          )}

          <section className="mt-10 space-y-4">
            <SectionTitle color={c}>How it works</SectionTitle>
            {content.how.map((b, i) => (
              <Block key={i} block={b} color={c} />
            ))}
          </section>

          <section className="mt-10">
            <SectionTitle color={c}>Tradeoffs</SectionTitle>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line-soft bg-bg-2/40 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-good">
                  <Check className="h-4 w-4" />
                  {content.tradeoffLabels?.good ?? "Worth it for"}
                </p>
                <ul className="mt-3 space-y-2">
                  {content.tradeoffs.good.map((g, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-dim">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                      <span className="text-sm leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-line-soft bg-bg-2/40 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-warn">
                  <AlertTriangle className="h-4 w-4" />
                  {content.tradeoffLabels?.costs ?? "What it costs"}
                </p>
                <ul className="mt-3 space-y-2">
                  {content.tradeoffs.costs.map((g, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-dim">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
                      <span className="text-sm leading-relaxed">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {content.realWorld && (
            <section className="mt-10 space-y-3">
              <SectionTitle color={c}>In the real world</SectionTitle>
              <p className="leading-relaxed text-dim">{content.realWorld}</p>
            </section>
          )}

          <section className="mt-10">
            <SectionTitle color={c}>Connects to</SectionTitle>
            {neighborNodes.length > 0 && (
              <div className="mt-3">
                <TopicGraph
                  center={centerNode}
                  neighbors={neighborNodes}
                  edges={graph.edges}
                />
              </div>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {content.related.map((r) => {
                const rt = getTopic(r.slug);
                if (!rt) return null;
                return (
                  <Link
                    key={r.slug}
                    href={`/topic/${rt.id}`}
                    style={{ ["--rc"]: rt.areaColor } as React.CSSProperties}
                    className="group rounded-lg border border-line-soft bg-panel/40 px-3 py-2.5 transition-colors hover:border-[var(--rc)]"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: rt.areaColor }}
                      />
                      <span className="text-sm font-medium text-text">
                        {rt.title}
                      </span>
                      {rt.status === "built" && (
                        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-good">
                          ready
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-dim">
                      {r.note}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="mt-8 rounded-2xl border border-line bg-panel/50 p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-warn/30 bg-warn/5 px-3 py-1 font-mono text-xs text-warn">
              <Clock className="h-3.5 w-3.5" />
              deep-dive planned
            </p>
            <p className="mt-4 leading-relaxed text-dim">
              This page isn&apos;t written yet — but here&apos;s where{" "}
              <span className="text-text">{topic.title}</span> sits on the map.
              When it&apos;s done, it will answer the same seven questions every
              topic does:
            </p>
            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
              {PROMISE.map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2"
                >
                  <span className="mt-0.5 font-mono text-xs" style={{ color: c }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-dim">{q}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">
                More in {topic.areaTitle}
              </h2>
              <Link
                href={`/area/${topic.areaId}`}
                className="font-mono text-xs text-faint hover:text-dim"
              >
                view area →
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {siblings
                .filter((t) => t.id !== topic.id)
                .map((t) => (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    className="rounded-md border border-line-soft bg-bg-2 px-2.5 py-1 text-xs text-dim transition-colors hover:border-[var(--area)] hover:text-[var(--area)]"
                  >
                    {t.title}
                  </Link>
                ))}
            </div>
          </section>
        </>
      )}

      {/* Prev / next within the area */}
      <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link
            href={`/topic/${prev.id}`}
            className="group flex flex-1 items-center gap-2 rounded-lg border border-line px-4 py-3 text-left transition-colors hover:border-[var(--area)]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-faint group-hover:text-[var(--area)]" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">
                previous
              </span>
              <span className="block truncate text-sm text-dim group-hover:text-text">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/topic/${next.id}`}
            className="group flex flex-1 items-center justify-end gap-2 rounded-lg border border-line px-4 py-3 text-right transition-colors hover:border-[var(--area)]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">
                next
              </span>
              <span className="block truncate text-sm text-dim group-hover:text-text">
                {next.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint group-hover:text-[var(--area)]" />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </main>
  );
}
