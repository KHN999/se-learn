import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import CommandPalette from "@/components/CommandPalette";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SE-Map — see how software fits together",
  description:
    "An interactive map of software engineering. Follow one real request across the whole system, and understand why each piece exists and what it costs.",
  keywords: [
    "software engineering",
    "system design",
    "how the web works",
    "learn backend",
    "interactive",
    "visualization",
  ],
  authors: [{ name: "Nine" }],
  openGraph: {
    title: "SE-Map — see how software fits together",
    description:
      "Follow one real request across the whole system. Understand where every concept fits, why it exists, and what it trades off.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jbMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('se-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();",
          }}
        />
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-panel font-mono text-sm font-bold text-accent">
                {"{"}
              </span>
              <span className="font-mono text-sm font-semibold tracking-tight text-text">
                SE<span className="text-accent">-</span>Map
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <CommandPalette />
              <ThemeSwitcher />
            </div>
          </div>
        </header>
        {children}
        <footer className="mx-auto max-w-6xl px-5 py-10 text-xs text-faint">
          <p>
            SE-Map · a work in progress. Start from one request and follow it
            everywhere.
          </p>
        </footer>
      </body>
    </html>
  );
}
