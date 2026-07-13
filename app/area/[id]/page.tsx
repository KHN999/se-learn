import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import {
  areas,
  getAllAreaIds,
  getArea,
  getAreaTopics,
  tint,
} from "@/lib/curriculum";
import { AreaIcon } from "@/components/AreaIcon";

export function generateStaticParams() {
  return getAllAreaIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const area = getArea(id);
  if (!area) return { title: "Area not found — SE-Map" };
  return {
    title: `${area.title} — SE-Map`,
    description: area.tagline,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const area = getArea(id);
  if (!area) notFound();

  const areaTopics = getAreaTopics(area.id);
  const areaIdx = areas.findIndex((a) => a.id === area.id);
  const prev = areaIdx > 0 ? areas[areaIdx - 1] : null;
  const next = areaIdx < areas.length - 1 ? areas[areaIdx + 1] : null;

  return (
    <main
      className="mx-auto max-w-4xl px-5 pb-16"
      style={{ ["--area"]: area.color } as React.CSSProperties}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 pt-8 font-mono text-xs text-faint">
        <Link href="/" className="hover:text-dim">
          map
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-dim">{area.title}</span>
      </nav>

      <header className="flex items-start gap-4 pt-6">
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
          style={{ background: tint(area.color, 15), color: area.color }}
        >
          <AreaIcon name={area.icon} className="h-7 w-7" />
        </span>
        <div>
          <p className="font-mono text-xs text-faint">
            AREA {String(area.n).padStart(2, "0")} · {areaTopics.length} topics
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-text">
            {area.title}
          </h1>
          <p className="mt-1 text-dim">{area.tagline}</p>
        </div>
      </header>

      <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
        {areaTopics.map((t, i) => (
          <li key={t.id}>
            <Link
              href={`/topic/${t.id}`}
              className="group flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 transition-colors hover:border-[var(--area)]"
            >
              <span
                className="font-mono text-xs"
                style={{ color: area.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-dim group-hover:text-text">
                {t.title}
              </span>
              <ArrowRight className="h-4 w-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-[var(--area)]" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Prev / next area */}
      <nav className="mt-10 flex items-stretch justify-between gap-3 border-t border-line pt-6">
        {prev ? (
          <Link
            href={`/area/${prev.id}`}
            className="group flex flex-1 items-center gap-2 rounded-lg border border-line px-4 py-3 text-left transition-colors hover:border-accent/50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-faint group-hover:text-accent" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">
                previous area
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
            href={`/area/${next.id}`}
            className="group flex flex-1 items-center justify-end gap-2 rounded-lg border border-line px-4 py-3 text-right transition-colors hover:border-accent/50"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">
                next area
              </span>
              <span className="block truncate text-sm text-dim group-hover:text-text">
                {next.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-faint group-hover:text-accent" />
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </main>
  );
}
