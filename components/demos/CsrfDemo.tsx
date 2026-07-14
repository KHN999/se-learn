"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Cookie,
  KeyRound,
  Landmark,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Skull,
  StepForward,
  User,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const BAD = "#f87171";

type Mode = "unprotected" | "protected";
type Actor = "victim" | "evil" | "bank";
type CookieState = "held" | "attached" | "blocked";
type TokenState = "notchecked" | "missing";

type Step = {
  active: Actor;
  showRequest: boolean;
  cookie: CookieState;
  token: TokenState;
  outcome?: "transferred" | "rejected";
  verdict?: "bad" | "good";
  note: string;
};

function build(mode: Mode): Step[] {
  if (mode === "unprotected") {
    return [
      {
        active: "victim",
        showRequest: false,
        cookie: "held",
        token: "notchecked",
        note: "You are logged into bank.com in one tab. The browser is holding a valid bank.com session cookie for you.",
      },
      {
        active: "evil",
        showRequest: false,
        cookie: "held",
        token: "notchecked",
        note: "In another tab you open evil.com — an ordinary-looking page that quietly runs hidden code the moment it loads.",
      },
      {
        active: "evil",
        showRequest: true,
        cookie: "held",
        token: "notchecked",
        note: "evil.com auto-submits a hidden form: POST bank.com/transfer?to=attacker. You never clicked anything.",
      },
      {
        active: "bank",
        showRequest: true,
        cookie: "attached",
        token: "notchecked",
        note: "Because the request goes to bank.com, the browser AUTOMATICALLY attaches your bank.com session cookie — that is just how cookies work, and it is the root cause.",
      },
      {
        active: "bank",
        showRequest: true,
        cookie: "attached",
        token: "notchecked",
        outcome: "transferred",
        verdict: "bad",
        note: "bank.com sees a valid session cookie and checks nothing else, so the request looks authenticated. It transfers your money to the attacker.",
      },
    ];
  }

  return [
    {
      active: "victim",
      showRequest: false,
      cookie: "held",
      token: "missing",
      note: "Same setup: you are logged into bank.com. Now the session cookie is set SameSite, and every real bank.com form carries a secret anti-CSRF token.",
    },
    {
      active: "evil",
      showRequest: false,
      cookie: "held",
      token: "missing",
      note: "You open evil.com again. The same hidden auto-submitting form is waiting to fire.",
    },
    {
      active: "evil",
      showRequest: true,
      cookie: "held",
      token: "missing",
      note: "evil.com fires the same forged request: POST bank.com/transfer?to=attacker. It cannot read anything from bank.com, so it has no valid token.",
    },
    {
      active: "bank",
      showRequest: true,
      cookie: "blocked",
      token: "missing",
      note: "The cookie is SameSite, so on this cross-site POST the browser refuses to attach it. The request is also missing the secret anti-CSRF token.",
    },
    {
      active: "bank",
      showRequest: true,
      cookie: "blocked",
      token: "missing",
      outcome: "rejected",
      verdict: "good",
      note: "bank.com sees no valid session cookie and no matching token, so the request is not authenticated. It rejects the transfer.",
    },
  ];
}

function ActorNode({
  icon: Icon,
  name,
  sub,
  active,
  accent,
}: {
  icon: LucideIcon;
  name: string;
  sub: string;
  active: boolean;
  accent: string;
}) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors"
      style={{
        borderColor: active ? accent : "var(--color-line)",
        background: active ? tint(accent, 8) : "transparent",
      }}
    >
      <Icon
        className="h-5 w-5"
        style={{ color: active ? accent : "var(--color-faint)" }}
        aria-hidden
      />
      <span className="font-mono text-xs font-semibold text-text">{name}</span>
      <span className="font-mono text-[10px] text-faint">{sub}</span>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: string | null;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[11px]"
      style={
        tone
          ? { borderColor: tint(tone, 45), background: tint(tone, 12), color: tone }
          : { borderColor: "var(--color-line)", color: "var(--color-faint)" }
      }
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export default function CsrfDemo({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>("unprotected");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = build(mode);
  const frame = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  // Reset when the mode changes (adjust state during render).
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStep(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step, steps.length]);

  const verdict = atEnd ? frame.verdict : undefined;

  const cookieChip =
    frame.cookie === "attached"
      ? { tone: BAD, label: "session cookie auto-attached" }
      : frame.cookie === "blocked"
        ? { tone: GOOD, label: "session cookie blocked by SameSite" }
        : { tone: null as string | null, label: "session cookie not attached yet" };

  const tokenChip =
    frame.token === "missing"
      ? { tone: BAD, label: "anti-CSRF token missing" }
      : { tone: null as string | null, label: "anti-CSRF token not checked here" };

  const bankAccent =
    frame.outcome === "transferred"
      ? BAD
      : frame.outcome === "rejected"
        ? GOOD
        : color;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        CSRF: a forged request riding your cookie
      </h3>
      <p className="mt-1 text-sm text-dim">
        The same forged transfer, fired twice: first against a bank with no CSRF
        defenses, then against one using SameSite cookies plus anti-CSRF tokens.
        Step through and watch the outcome flip.
      </p>

      {/* Mode toggle */}
      <div
        className="mt-4 inline-flex flex-wrap gap-1.5 rounded-xl border bg-bg-2/50 p-1"
        style={{ borderColor: tint(color, 22) }}
      >
        <button
          onClick={() => setMode("unprotected")}
          aria-pressed={mode === "unprotected"}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={
            mode === "unprotected"
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
          Unprotected
        </button>
        <button
          onClick={() => setMode("protected")}
          aria-pressed={mode === "protected"}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          style={
            mode === "protected"
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
          Protected (SameSite + CSRF token)
        </button>
      </div>

      {/* Transport controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: color }}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
          disabled={atEnd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-dim transition-colors hover:text-text disabled:opacity-40"
        >
          <StepForward className="h-3.5 w-3.5" /> step
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-faint transition-colors hover:text-dim"
        >
          <RotateCcw className="h-3.5 w-3.5" /> reset
        </button>
      </div>

      {/* Scene */}
      <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
        <ActorNode
          icon={User}
          name="You"
          sub="logged into bank.com"
          active={frame.active === "victim"}
          accent={color}
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
        <ActorNode
          icon={Skull}
          name="evil.com"
          sub="attacker page"
          active={frame.active === "evil"}
          accent={color}
        />
        <ArrowRight className="h-4 w-4 shrink-0 text-faint" aria-hidden />
        <ActorNode
          icon={Landmark}
          name="bank.com"
          sub="your bank"
          active={frame.active === "bank"}
          accent={bankAccent}
        />
      </div>

      {/* Forged request packet */}
      <AnimatePresence initial={false}>
        {frame.showRequest && (
          <motion.div
            key="req"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-xl border border-line-soft bg-bg-2/50 p-3"
          >
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-faint">
              forged request from evil.com
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
              <Send className="h-3.5 w-3.5 text-faint" aria-hidden />
              <span className="text-text">POST</span>
              <span className="text-dim">bank.com/transfer?to=attacker</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Chip icon={Cookie} label={cookieChip.label} tone={cookieChip.tone} />
              <Chip icon={KeyRound} label={tokenChip.label} tone={tokenChip.tone} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verdict */}
      <AnimatePresence initial={false}>
        {verdict && (
          <motion.div
            key={verdict}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium"
            style={{
              borderColor: verdict === "bad" ? BAD : GOOD,
              background: tint(verdict === "bad" ? BAD : GOOD, 10),
              color: verdict === "bad" ? BAD : GOOD,
            }}
          >
            {verdict === "bad" ? (
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {verdict === "bad"
              ? "Forged request accepted — bank.com transferred money to the attacker."
              : "Forged request rejected — no SameSite cookie sent and no anti-CSRF token."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Root cause and fix */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="text-sm leading-relaxed text-dim">
          <span className="font-medium text-text">Root cause: </span>
          the browser auto-sends your bank.com session cookie on every request to
          bank.com — even one fired by evil.com — so a forged request looks
          authenticated.
          <span className="font-medium text-text"> Fix: </span>
          mark the cookie SameSite so it is not sent on cross-site requests, and
          require a secret anti-CSRF token that only a real bank.com page can
          include.
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {frame.note}
      </p>
    </div>
  );
}
