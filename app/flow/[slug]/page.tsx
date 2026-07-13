import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllFlowSlugs, getFlow } from "@/lib/flows";
import FlowExplorer from "@/components/FlowExplorer";

export function generateStaticParams() {
  return getAllFlowSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const flow = getFlow(slug);
  if (!flow) return { title: "Flow not found — SE-Map" };
  return {
    title: `${flow.question} — SE-Map`,
    description: flow.summary,
  };
}

export default async function FlowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const flow = getFlow(slug);
  if (!flow) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16">
      <div className="pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-dim"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back to the map
        </Link>
      </div>

      <header className="pt-6 pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-2">
          {flow.title}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-text sm:text-4xl">
          {flow.question}
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-dim">{flow.summary}</p>
      </header>

      <FlowExplorer flow={flow} />
    </main>
  );
}
