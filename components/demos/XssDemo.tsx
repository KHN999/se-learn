"use client";

import { useState } from "react";
import { Code2, ImageOff, MessageSquare, ShieldAlert, ShieldCheck } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type PresetKey = "normal" | "malicious";
type Mode = "html" | "escaped";

const PRESETS: { key: PresetKey; label: string; value: string; malicious: boolean }[] = [
  { key: "normal", label: "Normal comment", value: "Nice post!", malicious: false },
  {
    key: "malicious",
    label: "Malicious comment",
    value:
      "<script>steal(document.cookie)</script><img src=x onerror=alert(1)>",
    malicious: true,
  },
];

// Output-encode a string the way a safe template engine would: turn markup
// characters into HTML entities so the browser shows them as literal text
// instead of parsing them as tags. Pure — nothing is ever injected.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function XssDemo({ color }: { color: string }) {
  const [presetKey, setPresetKey] = useState<PresetKey>("malicious");
  const [mode, setMode] = useState<Mode>("html");

  const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0];
  const raw = preset.value;
  const escaped = escapeHtml(raw);
  const isHtml = mode === "html";
  const attacked = isHtml && preset.malicious;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        XSS: rendering a comment as HTML vs escaping it
      </h3>
      <p className="mt-1 text-sm text-dim">
        A visitor submits a comment. What happens next depends entirely on how
        the site puts that text back onto the page. Nothing here is actually
        executed — every result is shown as inert text.
      </p>

      {/* Preset input */}
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
          <MessageSquare className="h-3 w-3" /> comment submitted by a visitor
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const on = p.key === presetKey;
            return (
              <button
                key={p.key}
                onClick={() => setPresetKey(p.key)}
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
        <pre className="thin-scroll mt-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-dim">
          {raw}
        </pre>
      </div>

      {/* Mode toggle */}
      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
          how the server puts that text back on the page
        </p>
        <div
          className="inline-flex flex-wrap gap-1.5 rounded-xl border bg-bg-2/50 p-1"
          style={{ borderColor: tint(color, 22) }}
        >
          <button
            onClick={() => setMode("html")}
            aria-pressed={isHtml}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={
              isHtml
                ? { background: tint(BAD, 16), color: BAD, boxShadow: `inset 0 0 0 1px ${tint(BAD, 45)}` }
                : { color: "var(--color-dim)" }
            }
          >
            <span
              className="rounded px-1 py-px font-mono text-[10px] font-bold tracking-wide"
              style={{ background: tint(BAD, 22), color: BAD }}
            >
              BAD
            </span>
            Insert as HTML (vulnerable)
          </button>
          <button
            onClick={() => setMode("escaped")}
            aria-pressed={!isHtml}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={
              !isHtml
                ? { background: tint(GOOD, 16), color: GOOD, boxShadow: `inset 0 0 0 1px ${tint(GOOD, 45)}` }
                : { color: "var(--color-dim)" }
            }
          >
            <span
              className="rounded px-1 py-px font-mono text-[10px] font-bold tracking-wide"
              style={{ background: tint(GOOD, 22), color: GOOD }}
            >
              GOOD
            </span>
            Escaped as text (safe)
          </button>
        </div>
      </div>

      {/* Simulated browser render */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line-soft">
        <div className="border-b border-line-soft bg-bg-2/50 px-3 py-2 font-mono text-[11px] text-faint">
          example.com/blog/post-42 — comments
        </div>
        <div className="p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-faint">
            what the page displays
          </p>

          {isHtml ? (
            preset.malicious ? (
              <div>
                <p className="text-sm text-dim">
                  The browser parses the string as markup, so the tags never
                  appear as text. The comment body is empty except a broken
                  image — while the payload runs invisibly.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-xs text-faint">
                  <ImageOff className="h-3.5 w-3.5" /> broken image (src=x)
                </div>
              </div>
            ) : (
              <div>
                <p className="rounded-md bg-bg-2 px-3 py-2 text-sm text-text">
                  {raw}
                </p>
                <p className="mt-2 text-xs text-dim">
                  Looks fine — but only because this comment happened to contain
                  no tags. The page still inserts raw HTML, so it is one
                  malicious comment away from the result on the left.
                </p>
              </div>
            )
          ) : (
            <div>
              <p className="flex items-center gap-1.5 text-xs text-dim">
                <Code2 className="h-3.5 w-3.5" /> output-encoded before it is
                written into the HTML:
              </p>
              <pre className="thin-scroll mt-1.5 overflow-x-auto rounded-md border border-line bg-bg-2 p-3 font-mono text-xs text-faint">
                {escaped}
              </pre>
              <p className="mt-2 text-xs text-dim">
                so the browser shows the exact characters as text, harmless:
              </p>
              <p className="mt-1.5 whitespace-pre-wrap break-words rounded-md bg-bg-2 px-3 py-2 font-mono text-sm text-text">
                {raw}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Outcome callout */}
      {isHtml ? (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: tint(BAD, 40), background: tint(BAD, 8) }}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: BAD }} />
            <p className="text-sm font-semibold text-text">
              {preset.malicious
                ? "⚠ script executed: cookie sent to attacker"
                : "Vulnerable: this page inserts raw HTML"}
            </p>
          </div>
          <p className="mt-2 text-sm text-dim">
            {preset.malicious ? (
              <>
                <span
                  className="rounded px-1 py-0.5 font-mono text-xs"
                  style={{ background: tint(BAD, 14), color: BAD }}
                >
                  steal(document.cookie)
                </span>{" "}
                ran in the victim&apos;s browser with their logged-in session,
                and <span className="font-mono text-xs">onerror</span> fired too.
                The stolen session cookie is posted to the attacker&apos;s
                server, who can now hijack the account — no password needed.
              </>
            ) : (
              <>
                Because the app writes untrusted input straight into the page as
                markup, the very next comment that does contain a{" "}
                <span className="font-mono text-xs">&lt;script&gt;</span> tag
                will execute. Safe by luck is not safe.
              </>
            )}
          </p>
        </div>
      ) : (
        <div
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: tint(GOOD, 40), background: tint(GOOD, 8) }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: GOOD }} />
            <p className="text-sm font-semibold text-text">
              Rendered as inert text — nothing runs
            </p>
          </div>
          <p className="mt-2 text-sm text-dim">
            Encoding turns{" "}
            <span className="font-mono text-xs">&lt;</span> into{" "}
            <span className="font-mono text-xs">&amp;lt;</span> (and{" "}
            <span className="font-mono text-xs">&gt;</span>,{" "}
            <span className="font-mono text-xs">&amp;</span>,{" "}
            <span className="font-mono text-xs">&quot;</span> likewise), so the
            browser treats the whole comment as characters to display, never as
            tags to run. The same payload is now completely harmless.
          </p>
        </div>
      )}

      {/* Status */}
      <p
        className="mt-3 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
        style={{ color: attacked ? BAD : isHtml ? BAD : GOOD }}
      >
        {isHtml
          ? "XSS is untrusted input treated as code in the browser. The fix is context-aware output encoding on every dynamic value, backed by a Content-Security-Policy as defense in depth — and frameworks like React escape interpolated values by default."
          : "Safe: the input was output-encoded, so the browser treats it as text and never as code. Layer a Content-Security-Policy on top for defense in depth — and note that frameworks like React escape interpolated values by default."}
      </p>
    </div>
  );
}
