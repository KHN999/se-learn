import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAllPathIds, getPath, resolvePath } from "@/lib/paths";
import { tint } from "@/lib/curriculum";
import { PathIcon } from "@/components/PathIcon";
import PathRunner from "@/components/PathRunner";

export function generateStaticParams() {
  return getAllPathIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getPath(id);
  if (!p) return { title: "Path not found — SE-Map" };
  return { title: `${p.title} — SE-Map`, description: p.tagline };
}

export default async function PathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPath(id);
  if (!p) notFound();

  const { phases, slugs } = resolvePath(p);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16">
      <nav className="flex items-center gap-1.5 pt-8 font-mono text-xs text-faint">
        <Link href="/" className="hover:text-dim">
          map
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/paths" className="hover:text-dim">
          paths
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-dim">{p.title}</span>
      </nav>

      <header className="flex items-start gap-4 pt-6 pb-2">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
          style={{ background: tint(p.color, 15), color: p.color }}
        >
          <PathIcon name={p.icon} className="h-7 w-7" />
        </span>
        <div>
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: p.color }}
          >
            {p.audience} · {slugs.length} steps
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            {p.title}
          </h1>
          <p className="mt-1 text-dim">{p.tagline}</p>
        </div>
      </header>

      <div className="pt-4">
        <PathRunner phases={phases} color={p.color} />
      </div>
    </main>
  );
}
