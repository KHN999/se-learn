"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import {
  readProgress,
  toggleProgress,
  useProgress,
  writeProgress,
} from "@/lib/progress";

type Step = {
  type: "topic" | "flow";
  slug: string;
  title: string;
  color: string;
  href: string;
};
type Phase = { title: string; steps: Step[] };

export default function PathRunner({
  phases,
  color,
}: {
  phases: Phase[];
  color: string;
}) {
  const allSteps = useMemo(() => phases.flatMap((p) => p.steps), [phases]);
  const done = useProgress();

  function toggle(slug: string) {
    toggleProgress(slug);
  }

  function resetPath() {
    const p = readProgress();
    for (const s of allSteps) delete p[s.slug];
    writeProgress(p);
  }

  const total = allSteps.length;
  const completed = allSteps.filter((s) => done[s.slug]).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const nextStep = allSteps.find((s) => !done[s.slug]) ?? allSteps[0];
  const ctaLabel =
    completed === 0 ? "Start" : completed >= total ? "Review" : "Continue";

  // Step number offset per phase (avoids a mutable render counter).
  const phaseOffsets = phases.map((_, i) =>
    phases.slice(0, i).reduce((sum, ph) => sum + ph.steps.length, 0),
  );

  return (
    <div style={{ ["--area"]: color } as React.CSSProperties}>
      {/* Progress header */}
      <div className="sticky top-16 z-10 mb-6 rounded-2xl border border-line bg-panel/90 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-dim">
            <span className="text-text">{completed}</span> / {total} complete
          </span>
          <span style={{ color }}>{pct}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bg-2">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          {nextStep && (
            <Link
              href={nextStep.href}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              style={{ background: color }}
            >
              {ctaLabel}: {nextStep.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {completed > 0 && (
            <button
              onClick={resetPath}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-dim"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              reset
            </button>
          )}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-8">
        {phases.map((phase, pIdx) => (
          <section key={phase.title}>
            <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color }}>
              {phase.title}
            </h2>
            <ol className="mt-3 space-y-2">
              {phase.steps.map((s, i) => {
                const num = phaseOffsets[pIdx] + i + 1;
                const isDone = !!done[s.slug];
                return (
                  <li key={s.slug} className="flex items-center gap-3">
                    <button
                      onClick={() => toggle(s.slug)}
                      aria-label={isDone ? "Mark not done" : "Mark done"}
                      aria-pressed={!!isDone}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors"
                      style={
                        isDone
                          ? { background: color, borderColor: color }
                          : { borderColor: "var(--color-line)" }
                      }
                    >
                      {isDone && <Check className="h-3.5 w-3.5 text-bg" />}
                    </button>
                    <Link
                      href={s.href}
                      className="group flex flex-1 items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3 transition-colors hover:border-[var(--area)]"
                    >
                      <span className="font-mono text-[11px] text-faint">
                        {String(num).padStart(2, "0")}
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span
                        className={`flex-1 text-sm ${
                          isDone
                            ? "text-faint line-through"
                            : "text-dim group-hover:text-text"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
                        {s.type}
                      </span>
                      <ArrowRight className="h-4 w-4 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-[var(--area)]" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
