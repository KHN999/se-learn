"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GraphNode = { id: string; title: string; color: string };

export default function TopicGraph({
  center,
  neighbors,
  edges,
}: {
  center: GraphNode;
  neighbors: GraphNode[];
  edges: { a: string; b: string }[];
}) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);

  const n = Math.max(1, neighbors.length);
  const Rx = 185;
  const Ry = 120;

  const pos = new Map<string, { x: number; y: number }>();
  pos.set(center.id, { x: 0, y: 0 });
  neighbors.forEach((nb, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pos.set(nb.id, { x: Math.cos(ang) * Rx, y: Math.sin(ang) * Ry });
  });

  const byId = new Map<string, GraphNode>([
    [center.id, center],
    ...neighbors.map((nb) => [nb.id, nb] as [string, GraphNode]),
  ]);

  function connected(id: string) {
    if (!hover) return true;
    if (id === hover) return true;
    return edges.some(
      (e) => (e.a === hover && e.b === id) || (e.b === hover && e.a === id),
    );
  }

  return (
    <div className="rounded-xl border border-line bg-bg-2/40 p-3">
      <svg
        viewBox="-320 -175 640 350"
        className="w-full"
        style={{ overflow: "visible", maxHeight: 320 }}
      >
        {/* edges */}
        {edges.map((e, i) => {
          const p = pos.get(e.a);
          const q = pos.get(e.b);
          if (!p || !q) return null;
          const hot = hover != null && (e.a === hover || e.b === hover);
          const dim = hover != null && !hot;
          const col = byId.get(e.a)?.color ?? "var(--color-line)";
          return (
            <line
              key={i}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke={hot ? col : "var(--color-line)"}
              strokeWidth={hot ? 2 : 1.2}
              strokeOpacity={hot ? 0.85 : dim ? 0.08 : 0.35}
            />
          );
        })}

        {/* nodes */}
        {[center, ...neighbors].map((nd) => {
          const p = pos.get(nd.id);
          if (!p) return null;
          const isCenter = nd.id === center.id;
          const isHover = hover === nd.id;
          const act = connected(nd.id);
          const left = p.x < -1;
          return (
            <g
              key={nd.id}
              opacity={act ? 1 : 0.28}
              className={isCenter ? "" : "cursor-pointer"}
              onMouseEnter={() => !isCenter && setHover(nd.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                if (!isCenter) router.push(`/topic/${nd.id}`);
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isCenter ? 11 : isHover ? 8 : 6}
                fill={nd.color}
                stroke={isCenter || isHover ? "var(--color-text)" : "transparent"}
                strokeWidth={isCenter ? 2 : 1.5}
              />
              <text
                x={isCenter ? 0 : left ? p.x - 12 : p.x + 12}
                y={isCenter ? -18 : p.y}
                dy={isCenter ? 0 : "0.32em"}
                textAnchor={isCenter ? "middle" : left ? "end" : "start"}
                className="pointer-events-none select-none"
                style={{
                  fill: isCenter ? "var(--color-text)" : "var(--color-dim)",
                  fontSize: isCenter ? 13 : 11,
                  fontWeight: isCenter ? 600 : 400,
                  paintOrder: "stroke",
                  stroke: "var(--color-bg)",
                  strokeWidth: 3,
                }}
              >
                {nd.title}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center font-mono text-[11px] text-faint">
        this topic and what it connects to — hover to trace, click to open
      </p>
    </div>
  );
}
