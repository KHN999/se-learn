"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  KeyRound,
  Lock,
  LockOpen,
  ShieldCheck,
} from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";
const WARN = "#fbbf24";

const PLAINTEXT = "Hi Bob";

type KeyInfo = { role: string; use: string };

type Mode = {
  key: "sym" | "asym";
  label: string;
  algo: string;
  cipher: string;
  keys: KeyInfo[];
  encKey: string;
  decKey: string;
  good: { label: string; text: string };
  warn: { label: string; text: string };
  status: string;
};

const MODES: Mode[] = [
  {
    key: "sym",
    label: "Symmetric (AES)",
    algo: "AES",
    // Fixed illustrative ciphertext — not real encryption.
    cipher: "9c1f a4e7 22bd 6f80 3a5e",
    keys: [{ role: "Shared secret key", use: "encrypts AND decrypts" }],
    encKey: "shared secret",
    decKey: "shared secret",
    good: {
      label: "Fast",
      text: "Cheap math, so it handles bulk data and large payloads quickly.",
    },
    warn: {
      label: "Key distribution",
      text: "Both sides must already hold the same secret — but how do they exchange it safely in the first place?",
    },
    status:
      "Symmetric (AES): one shared secret key both encrypts and decrypts. Fast and ideal for bulk data, but both parties must first share that key securely — the key-distribution problem.",
  },
  {
    key: "asym",
    label: "Asymmetric (RSA/ECC)",
    algo: "RSA/ECC",
    // Fixed illustrative ciphertext — longer to hint it is heavier.
    cipher: "b83a 91f0 4d2c e7a6 55b1 0c9d 7e34 8f21 a6bd 03e9",
    keys: [
      { role: "Public key", use: "encrypts (share it openly)" },
      { role: "Private key", use: "decrypts (keep it secret)" },
    ],
    encKey: "public key",
    decKey: "private key",
    good: {
      label: "Solves key distribution",
      text: "Publish the public key for anyone to use; only the matching private key can decrypt. It also enables digital signatures.",
    },
    warn: {
      label: "Slow",
      text: "Expensive math, so it is used only for small data or to exchange a symmetric key.",
    },
    status:
      "Asymmetric (RSA/ECC): a key pair. Anyone encrypts with the recipient public key; only the private key can decrypt. This solves key distribution and enables signatures, but it is slow, so it is reserved for small data or key exchange.",
  },
];

export default function EncryptionDemo({ color }: { color: string }) {
  const [key, setKey] = useState<Mode["key"]>("sym");
  const mode = MODES.find((m) => m.key === key) ?? MODES[0];
  const oneKey = mode.keys.length === 1;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        Symmetric vs asymmetric encryption
      </h3>
      <p className="mt-1 text-sm text-dim">
        Both scramble a message into ciphertext and back. The difference is the
        keys: one shared secret, or a public/private pair.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {MODES.map((m) => {
          const on = m.key === key;
          return (
            <button
              key={m.key}
              onClick={() => setKey(m.key)}
              aria-pressed={on}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={
                on
                  ? { background: tint(color, 16), color, borderColor: tint(color, 45) }
                  : { color: "var(--color-dim)", borderColor: "var(--color-line)" }
              }
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Key structure: one key vs a two-key pair */}
      <div className="mt-4 rounded-xl border border-line-soft bg-bg-2/50 p-3">
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          {oneKey ? "one key" : "key pair — two keys"}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {mode.keys.map((k) => (
            <div
              key={k.role}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
                oneKey ? "sm:col-span-2" : ""
              }`}
              style={{ borderColor: tint(color, 40), background: tint(color, 8) }}
            >
              <KeyRound className="h-4 w-4 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-text">{k.role}</div>
                <div className="text-xs text-dim">{k.use}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow: plaintext -> encrypt -> ciphertext -> decrypt -> plaintext */}
      <div className="thin-scroll mt-3 overflow-x-auto">
        <div className="flex min-w-max items-stretch gap-2">
          <Plain />
          <Op
            action="encrypt"
            keyName={mode.encKey}
            color={color}
            icon={<Lock className="h-3.5 w-3.5" />}
          />
          <div className="flex min-w-[9rem] flex-1 flex-col justify-center rounded-lg border border-line bg-bg-2 px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
              ciphertext ({mode.algo})
            </div>
            <div className="mt-0.5 break-all font-mono text-xs text-dim">
              {mode.cipher}
            </div>
          </div>
          <Op
            action="decrypt"
            keyName={mode.decKey}
            color={color}
            icon={<LockOpen className="h-3.5 w-3.5" />}
          />
          <Plain />
        </div>
      </div>

      {/* Tradeoffs */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          className="rounded-lg border px-3 py-2.5"
          style={{ borderColor: tint(GOOD, 40), background: tint(GOOD, 8) }}
        >
          <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: GOOD }}>
            <ShieldCheck className="h-4 w-4" /> {mode.good.label}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-dim">{mode.good.text}</p>
        </div>
        <div
          className="rounded-lg border px-3 py-2.5"
          style={{ borderColor: tint(WARN, 40), background: tint(WARN, 8) }}
        >
          <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: WARN }}>
            <AlertTriangle className="h-4 w-4" /> {mode.warn.label}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-dim">{mode.warn.text}</p>
        </div>
      </div>

      {/* How real systems combine both */}
      <p className="mt-3 rounded-lg border border-line-soft bg-bg-2/40 px-3 py-2.5 text-xs leading-relaxed text-dim">
        <span className="font-medium text-text">TLS / HTTPS uses both.</span> It
        starts with asymmetric to safely exchange a symmetric session key, then
        switches to fast symmetric encryption for the actual traffic — the best
        of each.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-dim" role="status" aria-live="polite">
        {mode.status}
      </p>
    </div>
  );
}

function Plain() {
  return (
    <div className="flex min-w-[6.5rem] flex-col justify-center rounded-lg border border-line bg-bg-2 px-3 py-2">
      <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-faint">
        <FileText className="h-3 w-3" /> plaintext
      </div>
      <div className="mt-0.5 font-mono text-sm text-text">{PLAINTEXT}</div>
    </div>
  );
}

function Op({
  action,
  keyName,
  color,
  icon,
}: {
  action: string;
  keyName: string;
  color: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-1">
      <div
        className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium"
        style={{ color, borderColor: tint(color, 40), background: tint(color, 8) }}
      >
        {icon}
        {action}
      </div>
      <ArrowRight className="h-4 w-4 text-faint" />
      <div className="flex items-center gap-1 text-[10px] text-dim">
        <KeyRound className="h-3 w-3" style={{ color }} />
        {keyName}
      </div>
    </div>
  );
}
