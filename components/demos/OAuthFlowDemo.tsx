"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppWindow,
  ArrowRight,
  Database,
  Globe,
  KeyRound,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
  User,
  type LucideIcon,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";

type ActorId = "user" | "app" | "auth" | "api";

const ACTORS: { id: ActorId; label: string; sub: string; Icon: LucideIcon }[] = [
  { id: "user", label: "User", sub: "browser", Icon: User },
  { id: "app", label: "App", sub: "your service", Icon: AppWindow },
  { id: "auth", label: "Auth Server", sub: "Google", Icon: KeyRound },
  { id: "api", label: "Resource API", sub: "user data", Icon: Database },
];

const NAME: Record<ActorId, string> = {
  user: "User",
  app: "App",
  auth: "Auth Server",
  api: "Resource API",
};

type Payload = "code" | "token";
type Channel = "front" | "back";
type Step = {
  active: ActorId[];
  from: ActorId;
  to: ActorId;
  msg: string;
  payload?: Payload;
  channel: Channel;
  note: string;
};

const steps: Step[] = [
  {
    active: ["user", "app"],
    from: "user",
    to: "app",
    msg: "clicks Log in with Google",
    channel: "front",
    note: "The user starts the flow inside the App. No Google credentials are entered here — the App is only kicking things off.",
  },
  {
    active: ["app", "auth"],
    from: "app",
    to: "auth",
    msg: "redirect to /authorize — client_id + scopes + redirect_uri",
    channel: "front",
    note: "The App redirects the browser to the Authorization Server, passing its public client_id, the scopes it wants, and the redirect_uri to return to.",
  },
  {
    active: ["user", "auth"],
    from: "user",
    to: "auth",
    msg: "signs in and consents",
    channel: "front",
    note: "The user authenticates directly with Google and approves the requested scopes. The App never sees the Google password.",
  },
  {
    active: ["auth", "app"],
    from: "auth",
    to: "app",
    msg: "redirect back to redirect_uri",
    payload: "code",
    channel: "front",
    note: "Google redirects the browser back to the App with a short-lived authorization CODE. It is not a token yet, and it is useless on its own.",
  },
  {
    active: ["app", "auth"],
    from: "app",
    to: "auth",
    msg: "code + client_secret → access token",
    payload: "token",
    channel: "back",
    note: "Server-to-server on the back channel, the App exchanges the code plus its client_secret for an ACCESS TOKEN. The token never travels through the browser.",
  },
  {
    active: ["app", "api"],
    from: "app",
    to: "api",
    msg: "GET /userinfo with Bearer token",
    channel: "back",
    note: "The App calls the Resource API with the access token and receives the scoped user data it was granted.",
  },
];

export default function OAuthFlowDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const cur = steps[Math.min(step, steps.length - 1)];
  const atEnd = step >= steps.length - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const activeSet = new Set(cur.active);

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Log in with Google: the OAuth 2.0 authorization-code flow
      </h3>
      <p className="mt-1 text-sm text-dim">
        Four actors hand off a short-lived code, then a scoped token &mdash; so the
        App gets access to your data without ever seeing your password.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {ACTORS.map(({ id, label, sub, Icon }) => {
            const on = activeSet.has(id);
            return (
              <div
                key={id}
                className="rounded-lg border p-3 text-center transition-colors"
                style={{
                  borderColor: on ? color : "var(--color-line)",
                  background: on ? tint(color, 8) : "transparent",
                }}
              >
                <Icon
                  className="mx-auto h-5 w-5"
                  style={{ color: on ? color : "var(--color-faint)" }}
                  aria-hidden
                />
                <p className="mt-1.5 text-xs font-medium text-text">{label}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                  {sub}
                </p>
                <div className="mt-1 h-4">
                  {on && (
                    <span className="font-mono text-[10px]" style={{ color }}>
                      active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-lg border p-3"
            style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[11px] text-dim">
                {NAME[cur.from]}
              </span>
              <ArrowRight className="h-3.5 w-3.5" style={{ color }} aria-hidden />
              <span className="rounded-md border border-line bg-panel px-2 py-0.5 font-mono text-[11px] text-dim">
                {NAME[cur.to]}
              </span>
            </div>
            <p className="mt-2 text-center font-mono text-[11px] leading-tight text-text sm:text-xs">
              {cur.msg}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {cur.payload && (
                <span
                  className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ background: tint(color, 16), color, border: `1px solid ${tint(color, 45)}` }}
                >
                  {cur.payload === "code" ? "authorization code" : "access token"}
                </span>
              )}
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-faint">
                {cur.channel === "back" ? (
                  <Lock className="h-3 w-3" style={{ color: GOOD }} aria-hidden />
                ) : (
                  <Globe className="h-3 w-3 text-faint" aria-hidden />
                )}
                {cur.channel === "back" ? "back channel · server-to-server" : "front channel · browser"}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 18 : 6,
                background: i <= step ? color : "var(--color-line)",
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cur.note}
      </p>

      {atEnd && (
        <div
          className="mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm"
          style={{ borderColor: tint(GOOD, 45), background: tint(GOOD, 10) }}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOOD }} aria-hidden />
          <span className="leading-relaxed text-dim">
            The App never handled the user&apos;s password &mdash; it holds only a
            scoped, revocable access token, which the user can revoke from their
            Google account at any time.
          </span>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-faint">
        OpenID Connect (OIDC) layers an ID TOKEN (a JWT) for identity on top of
        OAuth&apos;s delegated access &mdash; OAuth answers &ldquo;what can this App
        do?&rdquo;, OIDC answers &ldquo;who is this user?&rdquo;.
      </p>
    </div>
  );
}
