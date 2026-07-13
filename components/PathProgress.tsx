"use client";

import { useEffect, useState } from "react";
import { readProgress } from "@/lib/progress";

export default function PathProgress({
  slugs,
  color,
}: {
  slugs: string[];
  color: string;
}) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const p = readProgress();
    setDone(slugs.filter((s) => p[s]).length);
  }, [slugs]);

  const total = slugs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[11px] text-faint">
        <span>
          {done} / {total} done
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-2">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
