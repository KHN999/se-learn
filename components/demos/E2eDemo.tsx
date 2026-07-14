"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { tint } from "@/lib/curriculum";

const GOOD = "#34d399";

type Screen = "home" | "login" | "dashboard" | "checkout" | "confirmed";

type Step = {
  line: string;
  screen: Screen;
  url: string;
  email: string;
  password: string;
  query: string;
  showResult: boolean;
  cart: number;
  address: string;
  press: string | null;
  note: string;
  pass: boolean;
};

function build(): Step[] {
  const init: Step = {
    line: "await page.goto('/')",
    screen: "home",
    url: "shop.test/",
    email: "",
    password: "",
    query: "",
    showResult: false,
    cart: 0,
    address: "",
    press: null,
    note: "Open the app at its home page — the same URL a real user would type.",
    pass: false,
  };
  const steps: Step[] = [init];
  const push = (patch: Partial<Step>) =>
    steps.push({ ...steps[steps.length - 1], press: null, pass: false, ...patch });

  push({
    line: "await page.getByRole('link', { name: 'Log in' }).click()",
    screen: "login",
    url: "shop.test/login",
    press: "login-link",
    note: "Click the Log in link. The browser really navigates to the login page.",
  });
  push({
    line: "await page.getByLabel('Email').fill('ada@shop.test')",
    email: "ada@shop.test",
    note: "Type an email into the real input, character by character.",
  });
  push({
    line: "await page.getByLabel('Password').fill('••••••••')",
    password: "••••••••",
    note: "Type the password. The login form is now filled in.",
  });
  push({
    line: "await page.getByRole('button', { name: 'Sign in' }).click()",
    screen: "dashboard",
    url: "shop.test/dashboard",
    press: "signin-btn",
    note: "Submit the form. The app authenticates and lands on the dashboard.",
  });
  push({
    line: "await page.getByPlaceholder('Search').fill('headphones')",
    query: "headphones",
    showResult: true,
    note: "Search for a product. A matching result appears in the real UI.",
  });
  push({
    line: "await page.getByRole('button', { name: 'Add to cart' }).click()",
    cart: 1,
    press: "add-btn",
    note: "Add the product to the cart. Watch the cart badge go from 0 to 1.",
  });
  push({
    line: "await page.getByRole('link', { name: 'Checkout' }).click()",
    screen: "checkout",
    url: "shop.test/checkout",
    press: "checkout-link",
    note: "Head to checkout. The cart carries over across the page change.",
  });
  push({
    line: "await page.getByLabel('Address').fill('1 Test Lane, London')",
    address: "1 Test Lane, London",
    note: "Fill in the shipping address on the checkout form.",
  });
  push({
    line: "await page.getByRole('button', { name: 'Place order' }).click()",
    screen: "confirmed",
    url: "shop.test/order/complete",
    press: "order-btn",
    note: "Place the order. It runs through the whole stack, front to back.",
  });
  push({
    line: "await expect(page.getByText('Order confirmed')).toBeVisible()",
    note: "Assert the confirmation is on screen. It is — the test PASSED.",
    pass: true,
  });
  return steps;
}

const STEPS = build();

function Field({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder: string;
}) {
  return (
    <label className="block text-left">
      <span className="text-[9px] font-medium uppercase tracking-widest text-faint">
        {label}
      </span>
      <div className="mt-0.5 rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-[11px]">
        {value ? (
          <span className="text-text">{value}</span>
        ) : (
          <span className="text-faint">{placeholder}</span>
        )}
      </div>
    </label>
  );
}

export default function E2eDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const len = STEPS.length;
  const clampedStep = Math.min(step, len - 1);
  const frame = STEPS[clampedStep];
  const atEnd = step >= len - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [isPlaying, step]);

  const press = (id: string): { boxShadow?: string } =>
    frame.press === id ? { boxShadow: `0 0 0 2px ${color}` } : {};

  const showCart = frame.screen !== "home" && frame.screen !== "login";

  const renderScreen = () => {
    switch (frame.screen) {
      case "home":
        return (
          <div className="py-6 text-center">
            <div className="text-lg font-semibold text-text">MyShop</div>
            <p className="mt-1 text-xs text-dim">Everything for your desk.</p>
            <div className="mt-4 flex justify-center">
              <span
                style={press("login-link")}
                className="rounded-md border border-line px-3 py-1 text-[11px] font-medium text-text transition-shadow"
              >
                Log in
              </span>
            </div>
          </div>
        );
      case "login":
        return (
          <div className="mx-auto max-w-[220px] py-2">
            <div className="text-sm font-semibold text-text">Sign in</div>
            <div className="mt-3 space-y-2">
              <Field label="Email" value={frame.email} placeholder="you@example.com" />
              <Field label="Password" value={frame.password} placeholder="password" />
              <span
                style={{ background: color, ...press("signin-btn") }}
                className="inline-block rounded-md px-3 py-1 text-[11px] font-medium text-bg transition-shadow"
              >
                Sign in
              </span>
            </div>
          </div>
        );
      case "dashboard":
        return (
          <div className="py-1">
            <div className="text-sm font-semibold text-text">Welcome back, Ada</div>
            <div className="mt-2">
              <Field label="Search" value={frame.query} placeholder="Search products" />
            </div>
            {frame.showResult ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-bg-2 px-3 py-2">
                <div className="text-left">
                  <div className="text-xs font-medium text-text">Wireless headphones</div>
                  <div className="text-[11px] text-dim">$59</div>
                </div>
                <span
                  style={{ background: color, ...press("add-btn") }}
                  className="rounded-md px-2.5 py-1 text-[11px] font-medium text-bg transition-shadow"
                >
                  Add to cart
                </span>
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-faint">Type a query to find products.</p>
            )}
          </div>
        );
      case "checkout":
        return (
          <div className="py-1">
            <div className="text-sm font-semibold text-text">Checkout</div>
            <div className="mt-2 flex items-center justify-between rounded-lg border border-line bg-bg-2 px-3 py-1.5 text-[11px]">
              <span className="text-dim">Wireless headphones × 1</span>
              <span className="font-mono text-text">$59</span>
            </div>
            <div className="mt-3">
              <Field label="Address" value={frame.address} placeholder="Street, city" />
            </div>
            <div className="mt-3">
              <span
                style={{ background: color, ...press("order-btn") }}
                className="inline-block rounded-md px-3 py-1 text-[11px] font-medium text-bg transition-shadow"
              >
                Place order
              </span>
            </div>
          </div>
        );
      case "confirmed":
        return (
          <div className="py-6 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto grid h-12 w-12 place-items-center rounded-full text-xl font-bold text-bg"
              style={{ background: GOOD }}
            >
              ✓
            </motion.div>
            <div className="mt-2 text-sm font-semibold" style={{ color: GOOD }}>
              Order confirmed
            </div>
            <p className="mt-1 text-[11px] text-dim">Your order is on its way.</p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <h3 className="font-semibold text-text">
        An end-to-end test drives the whole app like a user
      </h3>
      <p className="mt-1 text-sm text-dim">
        Watch a scripted test click through the real UI, page by page, and check
        that the whole flow actually works.
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
          onClick={() => setStep((s) => Math.min(s + 1, len - 1))}
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

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] text-faint">checkout.e2e.ts</span>
            {atEnd ? (
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: tint(GOOD, 16), color: GOOD }}
              >
                PASSED ✓
              </span>
            ) : (
              <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] text-faint">
                step {clampedStep + 1}/{len}
              </span>
            )}
          </div>
          <div className="thin-scroll overflow-x-auto rounded-xl border border-line bg-bg-2 p-3">
            <ol className="space-y-0.5">
              {STEPS.map((s, i) => {
                const active = i === clampedStep;
                const done = i < clampedStep;
                const passed = active && atEnd && s.pass;
                return (
                  <li
                    key={i}
                    className="flex w-max min-w-full items-start gap-2 whitespace-pre rounded-md px-2 py-1 font-mono text-[11px] leading-relaxed"
                    style={active ? { background: tint(color, 12) } : undefined}
                  >
                    <span className="w-4 shrink-0 text-right">
                      {done || passed ? (
                        <span style={{ color: GOOD }}>✓</span>
                      ) : active ? (
                        <span style={{ color }}>▸</span>
                      ) : (
                        <span className="text-faint">{i + 1}</span>
                      )}
                    </span>
                    <code
                      className={
                        active ? "text-text" : done ? "text-dim" : "text-faint"
                      }
                    >
                      {s.line}
                    </code>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-widest text-faint">
            app under test
          </div>
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="flex items-center gap-2 border-b border-line bg-bg-2 px-3 py-2">
              <span className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
              </span>
              <span className="flex-1 truncate rounded bg-panel px-2 py-0.5 font-mono text-[10px] text-faint">
                {frame.url}
              </span>
              {showCart ? (
                <span className="flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[10px] text-dim">
                  Cart
                  <motion.span
                    key={frame.cart}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid h-4 min-w-4 place-items-center rounded-full px-1 font-mono text-[10px] text-bg"
                    style={{ background: frame.cart > 0 ? color : "var(--color-faint)" }}
                  >
                    {frame.cart}
                  </motion.span>
                </span>
              ) : null}
            </div>
            <div className="min-h-[220px] bg-panel p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={frame.screen}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <p
        className="mt-4 text-sm leading-relaxed text-dim"
        role="status"
        aria-live="polite"
      >
        {frame.note}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-faint">
        End-to-end tests give the most confidence — they exercise the real stack
        and the real UI — but they are the slowest to run and the most brittle, so
        keep them few and save them for the flows that matter most.
      </p>
    </div>
  );
}
