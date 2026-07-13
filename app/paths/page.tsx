import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";
import { paths, resolvePath } from "@/lib/paths";
import { tint } from "@/lib/curriculum";
import { PathIcon } from "@/components/PathIcon";
import PathProgress from "@/components/PathProgress";

export const metadata: Metadata = {
  title: "Learning paths — SE-Map",
  description:
    "Guided routes through the map for a specific goal — the topics and flows in the order they build on each other.",
};

export default function PathsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-16">
      <div className="pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-dim"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          back to home
        </Link>
      </div>

      <header className="pt-6 pb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-dim">
          <Route className="h-3.5 w-3.5 text-accent-2" />
          guided routes through the map
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Learning paths
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-dim">
          Not sure where to start? Pick a goal and follow the topics and flows in
          the order they build on each other. Your progress is saved in this
          browser as you go.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {paths.map((p) => {
          const { slugs } = resolvePath(p);
          return (
            <Link
              key={p.id}
              href={`/paths/${p.id}`}
              style={{ ["--area"]: p.color } as React.CSSProperties}
              className="group rounded-2xl border border-line bg-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--area)] hover:shadow-[0_18px_50px_-24px_var(--area)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: tint(p.color, 15), color: p.color }}
                >
                  <PathIcon name={p.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p
                    className="font-mono text-[11px] uppercase tracking-widest"
                    style={{ color: p.color }}
                  >
                    {p.audience}
                  </p>
                  <h2 className="text-lg font-semibold text-text">{p.title}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm text-dim">{p.tagline}</p>
              <div className="mt-4">
                <PathProgress slugs={slugs} color={p.color} />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
