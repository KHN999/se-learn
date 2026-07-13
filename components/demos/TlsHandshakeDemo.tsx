"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Globe,
  Lock,
  LockOpen,
  Pause,
  Play,
  RotateCcw,
  Server,
  ShieldCheck,
  StepForward,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";

type Side = "client" | "server" | "both";
type Dir = "right" | "left" | "none";
type Step = {
  from: Side;
  dir: Dir;
  msg: string;
  note: string;
  secured?: boolean;
};

const steps: Step[] = [
  {
    from: "client",
    dir: "right",
    msg: "ClientHello",
    note: "The client opens by proposing how to encrypt: which TLS versions and cipher suites it supports, plus a fresh random value.",
  },
  {
    from: "server",
    dir: "left",
    msg: "ServerHello + Certificate",
    note: "The server picks one cipher suite and replies with its certificate — its public key wrapped in a document signed by a trusted Certificate Authority (CA).",
  },
  {
    from: "client",
    dir: "none",
    msg: "Verify certificate",
    note: "This is the authentication part: the client checks the certificate chains up to a trusted CA and matches the domain. ✓ Proof you're talking to the real server, not an impostor.",
  },
  {
    from: "client",
    dir: "right",
    msg: "Key exchange",
    note: "Both sides use asymmetric crypto (e.g. ephemeral Diffie-Hellman) to agree on a shared secret — without ever sending that secret in the clear.",
  },
  {
    from: "both",
    dir: "none",
    msg: "Derive symmetric session key",
    note: "From the shared secret, client and server independently derive the same fast symmetric key. The key itself was never transmitted.",
  },
  {
    from: "both",
    dir: "none",
    msg: "Encrypted application data (HTTP) flows",
    secured: true,
    note: "Three guarantees delivered — confidentiality, integrity, and authentication — and from here it's fast symmetric encryption in both directions. The handshake costs a round trip or two on top of TCP, which is why TLS 1.3 and HTTP/3 work to cut that setup time.",
  },
];

export default function TlsHandshakeDemo({ color }: { color: string }) {
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

  const secured = cur.secured === true;
  const clientActive = cur.from === "client" || cur.from === "both";
  const serverActive = cur.from === "server" || cur.from === "both";
  const arrowAccent = secured ? GOOD : color;

  const boxStyle = (active: boolean) => ({
    borderColor: active ? arrowAccent : "var(--color-line)",
    background: active ? tint(arrowAccent, 8) : "transparent",
  });

  const arrowIcon =
    cur.from === "both" ? (
      <ArrowLeftRight className="h-4 w-4" style={{ color: arrowAccent }} aria-hidden />
    ) : cur.dir === "right" ? (
      <ArrowRight className="h-4 w-4" style={{ color: arrowAccent }} aria-hidden />
    ) : cur.dir === "left" ? (
      <ArrowLeft className="h-4 w-4" style={{ color: arrowAccent }} aria-hidden />
    ) : (
      <ShieldCheck className="h-4 w-4" style={{ color: arrowAccent }} aria-hidden />
    );

  const flow =
    cur.dir === "right" ? { x: [-4, 4] } : cur.dir === "left" ? { x: [4, -4] } : { x: 0 };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        The TLS handshake: how HTTPS gets a private, verified channel
      </h3>
      <p className="mt-1 text-sm text-dim">
        Before your browser sends a single byte of the page, it negotiates
        encryption and proves the server&apos;s identity. Step through it.
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

      <div
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
        style={{
          borderColor: secured ? tint(GOOD, 45) : "var(--color-line)",
          background: secured ? tint(GOOD, 10) : "transparent",
        }}
      >
        {secured ? (
          <Lock className="h-4 w-4" style={{ color: GOOD }} aria-hidden />
        ) : (
          <LockOpen className="h-4 w-4 text-faint" aria-hidden />
        )}
        <span
          className={secured ? "font-medium" : "text-faint"}
          style={secured ? { color: GOOD } : undefined}
        >
          {secured ? "encrypted & verified" : "not yet encrypted"}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-4">
        <div className="grid grid-cols-[1fr_1.5fr_1fr] items-stretch gap-2 sm:gap-3">
          <div
            className="rounded-lg border p-3 text-center transition-colors"
            style={boxStyle(clientActive)}
          >
            <Globe
              className="mx-auto h-5 w-5"
              style={{ color: clientActive ? arrowAccent : "var(--color-faint)" }}
              aria-hidden
            />
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              client (browser)
            </p>
            <div className="mt-1 h-4">
              {clientActive && (
                <span className="font-mono text-[10px]" style={{ color: arrowAccent }}>
                  active
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex w-full flex-col items-center gap-2"
              >
                <span
                  className="rounded-md border px-2 py-1 text-center font-mono text-[10px] leading-tight text-text sm:text-[11px]"
                  style={{
                    borderColor: tint(arrowAccent, 45),
                    background: tint(arrowAccent, 10),
                  }}
                >
                  {cur.msg}
                </span>
                <div className="relative flex w-full items-center justify-center">
                  <div
                    className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2"
                    style={{ background: "var(--color-line)" }}
                  />
                  <motion.div
                    animate={flow}
                    transition={
                      cur.dir === "none"
                        ? { duration: 0.3 }
                        : { repeat: Infinity, repeatType: "reverse", duration: 0.9 }
                    }
                    className="relative z-10 grid h-7 w-7 place-items-center rounded-full border bg-panel"
                    style={{ borderColor: arrowAccent }}
                  >
                    {arrowIcon}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="rounded-lg border p-3 text-center transition-colors"
            style={boxStyle(serverActive)}
          >
            <Server
              className="mx-auto h-5 w-5"
              style={{ color: serverActive ? arrowAccent : "var(--color-faint)" }}
              aria-hidden
            />
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
              server
            </p>
            <div className="mt-1 h-4">
              {serverActive && (
                <span className="font-mono text-[10px]" style={{ color: arrowAccent }}>
                  active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
          {steps.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 18 : 6,
                background:
                  i <= step
                    ? cur.secured
                      ? GOOD
                      : color
                    : "var(--color-line)",
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {cur.note}
      </p>
    </div>
  );
}
