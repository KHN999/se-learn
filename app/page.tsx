import Link from "next/link";
import { ArrowRight, Compass, Map as MapIcon, Route } from "lucide-react";
import { flows, plannedFlows } from "@/lib/flows";
import { areas, getAreaTopics, tint, topicCount } from "@/lib/curriculum";
import { paths } from "@/lib/paths";
import { AreaIcon } from "@/components/AreaIcon";
import { PathIcon } from "@/components/PathIcon";
import OpenSearchButton from "@/components/OpenSearchButton";

const featured = flows[0];
const FLOW_COLOR = "#43e0c8";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="pt-16 pb-12 sm:pt-24">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-dim">
          <Compass className="h-3.5 w-3.5 text-accent-2" />
          an interactive map of software engineering
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-6xl">
          See how the whole system{" "}
          <span className="bg-gradient-to-r from-accent via-accent-2 to-accent bg-clip-text text-transparent">
            fits together
          </span>
          <span className="text-dim"> — not one topic at a time.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-dim">
          Every topic has a place on the map, and its own color. Follow a real
          request across the whole system, or jump straight to any concept and
          see where it fits, why it exists, and what it trades off.
        </p>

        {/* Colorful area-legend strip */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <Link
              key={a.id}
              href={`/area/${a.id}`}
              title={a.title}
              aria-label={a.title}
              className="h-2.5 w-8 rounded-full transition-transform hover:scale-y-150"
              style={{ background: a.color }}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <OpenSearchButton />
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/flow/${featured.slug}`}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              Follow a request end to end
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="font-mono text-sm text-faint">
              {areas.length} areas · {topicCount} topics · nothing to install
            </span>
          </div>
        </div>
      </section>

      {/* Learning paths */}
      <section className="border-t border-line py-12">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-accent-2" />
          <h2 className="text-lg font-semibold text-text">Learning paths</h2>
        </div>
        <p className="mt-2 max-w-2xl text-dim">
          Not sure where to start? Follow a guided route through the map for your
          goal — the topics and flows in the order they build on each other.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => (
            <Link
              key={p.id}
              href={`/paths/${p.id}`}
              style={{ ["--area"]: p.color } as React.CSSProperties}
              className="group rounded-2xl border border-line bg-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--area)] hover:shadow-[0_18px_50px_-24px_var(--area)]"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: tint(p.color, 15), color: p.color }}
              >
                <PathIcon name={p.icon} className="h-5 w-5" />
              </span>
              <p
                className="mt-3 font-mono text-[11px] uppercase tracking-widest"
                style={{ color: p.color }}
              >
                {p.audience}
              </p>
              <h3 className="mt-1 font-semibold text-text">{p.title}</h3>
              <p className="mt-1 text-sm text-dim">{p.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Flows */}
      <section className="border-t border-line py-12">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-accent-2" />
          <h2 className="text-lg font-semibold text-text">
            Follow a story, end to end
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-dim">
          The fastest way to see how the pieces connect: pick one real thing that
          happens and follow it stop by stop.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {flows.map((f) => (
            <Link
              key={f.slug}
              href={`/flow/${f.slug}`}
              style={{ ["--area"]: FLOW_COLOR } as React.CSSProperties}
              className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--area)] hover:shadow-[0_18px_50px_-24px_var(--area)]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                style={{ background: FLOW_COLOR }}
              />
              <div className="relative flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest"
                  style={{ background: tint(FLOW_COLOR, 14), color: FLOW_COLOR }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: FLOW_COLOR }}
                  />
                  ready
                </span>
                <ArrowRight className="h-4 w-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-[var(--area)]" />
              </div>
              <p className="relative mt-3 text-lg font-semibold text-text">
                {f.question}
              </p>
              <p className="relative mt-1 text-sm text-dim">{f.title}</p>
            </Link>
          ))}
          {plannedFlows.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-dashed border-line bg-bg-2/40 p-5"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-faint">
                planned
              </span>
              <p className="mt-3 text-lg font-medium text-dim">{f.title}</p>
              <p className="mt-1 text-sm text-faint">{f.question}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Area directory */}
      <section className="border-t border-line py-12">
        <div className="flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Browse the map</h2>
        </div>
        <p className="mt-2 max-w-2xl text-dim">
          {areas.length} areas, {topicCount} topics — each district has its own
          color. Click a topic to see where it fits, or press{" "}
          <kbd className="rounded border border-line bg-bg-2 px-1.5 py-0.5 font-mono text-[11px] text-dim">
            ⌘K
          </kbd>{" "}
          to jump straight there.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {areas.map((area) => {
            const areaTopics = getAreaTopics(area.id);
            return (
              <div
                key={area.id}
                style={{ ["--area"]: area.color } as React.CSSProperties}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--area)] hover:shadow-[0_18px_50px_-24px_var(--area)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                  style={{ background: area.color }}
                />
                <div className="relative flex items-start gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
                    style={{ background: tint(area.color, 15), color: area.color }}
                  >
                    <AreaIcon name={area.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: area.color }}
                      >
                        {String(area.n).padStart(2, "0")}
                      </span>
                      <Link
                        href={`/area/${area.id}`}
                        className="font-semibold text-text transition-colors hover:text-[var(--area)]"
                      >
                        {area.title}
                      </Link>
                    </div>
                    <p className="mt-0.5 text-sm text-dim">{area.tagline}</p>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap gap-1.5">
                  {areaTopics.map((t) => {
                    const built = t.status === "built";
                    return (
                      <Link
                        key={t.id}
                        href={`/topic/${t.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line-soft bg-bg-2 px-2.5 py-1 text-xs text-dim transition-colors hover:border-[var(--area)] hover:text-[var(--area)]"
                        style={
                          built
                            ? {
                                color: area.color,
                                borderColor: tint(area.color, 45),
                                background: tint(area.color, 8),
                              }
                            : undefined
                        }
                      >
                        {built && (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: area.color }}
                          />
                        )}
                        {t.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
