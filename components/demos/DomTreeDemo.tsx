"use client";

import { useState } from "react";
import { tint } from "@/lib/curriculum";

type Node = {
  tag: string;
  attr?: string;
  children?: Node[];
  /** A text node's content, e.g. "Buy now". */
  text?: string;
};

type Preset = {
  key: string;
  label: string;
  html: string;
  tree: Node;
};

const PRESETS: Preset[] = [
  {
    key: "card",
    label: "A card",
    html: '<div class="card">\n  <h1>Welcome</h1>\n  <p>Ready to go?</p>\n  <button>Buy now</button>\n</div>',
    tree: {
      tag: "div",
      attr: 'class="card"',
      children: [
        { tag: "h1", children: [{ tag: "", text: "Welcome" }] },
        { tag: "p", children: [{ tag: "", text: "Ready to go?" }] },
        { tag: "button", children: [{ tag: "", text: "Buy now" }] },
      ],
    },
  },
  {
    key: "list",
    label: "A list",
    html: "<ul>\n  <li>Apples</li>\n  <li>Pears</li>\n</ul>",
    tree: {
      tag: "ul",
      children: [
        { tag: "li", children: [{ tag: "", text: "Apples" }] },
        { tag: "li", children: [{ tag: "", text: "Pears" }] },
      ],
    },
  },
  {
    key: "nested",
    label: "Nested",
    html: '<article>\n  <header>\n    <h2>Post</h2>\n  </header>\n  <a href="/more">Read</a>\n</article>',
    tree: {
      tag: "article",
      children: [
        {
          tag: "header",
          children: [{ tag: "h2", children: [{ tag: "", text: "Post" }] }],
        },
        { tag: "a", attr: 'href="/more"', children: [{ tag: "", text: "Read" }] },
      ],
    },
  },
];

/** Flatten the tree into rows with a depth so we can render an indented list. */
type Rendered = { node: Node; depth: number; id: string };

function flatten(node: Node, depth: number, id: string, out: Rendered[]) {
  out.push({ node, depth, id });
  node.children?.forEach((child, i) => flatten(child, depth + 1, `${id}.${i}`, out));
}

function isText(node: Node) {
  return node.tag === "";
}

function nodeLabel(node: Node) {
  return isText(node)
    ? `"${node.text}" — text node`
    : `<${node.tag}> — element node`;
}

export default function DomTreeDemo({ color }: { color: string }) {
  const [key, setKey] = useState(PRESETS[0].key);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0];
  const rows: Rendered[] = [];
  flatten(preset.tree, 0, "0", rows);

  const selected = rows.find((r) => r.id === selectedId)?.node ?? null;
  const status = selected
    ? nodeLabel(selected)
    : "Hover or select a node in the tree. Notice how nesting in the HTML on the left becomes depth on the right.";

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        HTML text, and the DOM tree it parses into
      </h3>
      <p className="mt-1 text-sm text-dim">
        Left is the raw HTML you write. Right is the tree of nodes the browser
        builds from it — each tag becomes a node, and nesting becomes depth.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const on = p.key === key;
          return (
            <button
              key={p.key}
              onClick={() => {
                setKey(p.key);
                setSelectedId(null);
              }}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {/* LEFT: raw HTML */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            HTML (the text you write)
          </p>
          <pre className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm leading-relaxed text-dim">
            {preset.html}
          </pre>
        </div>

        {/* RIGHT: parsed node tree */}
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            DOM (the parsed tree)
          </p>
          <div className="rounded-xl border border-line-soft bg-bg-2/50 p-3">
            <ul className="flex flex-col gap-1">
              {rows.map((row) => {
                const text = isText(row.node);
                const on = row.id === selectedId;
                return (
                  <li key={row.id} style={{ paddingLeft: row.depth * 18 }}>
                    <button
                      onClick={() => setSelectedId(on ? null : row.id)}
                      onMouseEnter={() => setSelectedId(row.id)}
                      onFocus={() => setSelectedId(row.id)}
                      aria-pressed={on}
                      className="flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left font-mono text-xs transition-colors"
                      style={
                        on
                          ? { background: tint(color, 12), borderColor: tint(color, 45) }
                          : { borderColor: "transparent" }
                      }
                    >
                      <span
                        className="shrink-0 rounded px-1 text-[9px] uppercase tracking-wider"
                        style={{
                          color: text ? "var(--color-faint)" : color,
                          background: text ? "var(--color-line)" : tint(color, 14),
                        }}
                      >
                        {text ? "text" : "element"}
                      </span>
                      <span className="truncate text-text">
                        {text ? `"${row.node.text}"` : `<${row.node.tag}>`}
                        {row.node.attr ? (
                          <span className="text-faint"> {row.node.attr}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </div>
  );
}
