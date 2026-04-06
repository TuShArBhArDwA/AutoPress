import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AutoPress | AI-Native Editorial Platform",
  description: "Next-generation automated journalism. Real-time wire monitoring, trend discovery, and high-fidelity reporting synthesized by the AutoPress Editorial Engine.",
  keywords: ["automated journalism", "AI news", "real-time reporting", "editorial synthesis"],
  authors: [{ name: "AutoPress Editorial" }],
  openGraph: {
    title: "AutoPress | AI-Native Editorial Platform",
    description: "Real-time automated reports synthesized from global wire data.",
    url: "https://autopress.ai",
    siteName: "AutoPress",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoPress | AI-Native Editorial Platform",
    description: "Automated report synthesis from global wire data.",
  },
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/digest", label: "Digest" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const now = new Date();
  const edition = now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b shadow-sm" style={{ borderColor: "var(--border)", background: "rgba(255,252,249,0.92)", backdropFilter: "blur(20px)" }}>
          {/* Top bar */}
          <div className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-8 text-xs" style={{ color: "var(--foreground-dim)" }}>
                <span style={{ fontFamily: "monospace", letterSpacing: "0.04em" }}>
                  {dateStr}
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                    <span style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                      LIVE · EDITORIAL ENGINE ACTIVE
                    </span>
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                    {edition.toUpperCase()} EDITION
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Masthead */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-3 group">
                {/* Logo mark */}
                <div className="relative w-8 h-8 flex items-center justify-center rounded shadow-sm" style={{ background: "var(--accent)", flexShrink: 0 }}>
                  <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{ color: "var(--background)" }}>
                    <rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor" />
                    <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
                    <rect x="3" y="14" width="8" height="2" rx="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <span
                    className="font-serif text-xl font-bold tracking-tight block leading-none"
                    style={{ color: "var(--foreground)" }}
                  >
                    AutoPress
                  </span>
                  <span style={{ fontSize: "0.55rem", letterSpacing: "0.18em", color: "var(--foreground-dim)", textTransform: "uppercase", display: "block" }}>
                    Editorial Engine
                  </span>
                </div>
              </Link>

              <nav className="flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {link.label}
                  </Link>
                ))}
                <span
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "#4ade80" }} />
                  Automated Synthesis
                </span>
              </nav>
            </div>
          </div>
        </header>

        <main>{children}</main>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="mt-24 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm" style={{ background: "var(--accent)" }}>
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" style={{ color: "var(--background)" }}>
                      <rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor" />
                      <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
                      <rect x="3" y="14" width="8" height="2" rx="1" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="font-serif text-lg font-bold" style={{ color: "var(--foreground)" }}>AutoPress</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
                  Future journalism. Every article is written by our automated editorial engine from verified data.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-dim)" }}>
                  Navigate
                </h4>
                <ul className="space-y-2">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--foreground-dim)" }}>
                  Editorial Standards
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-dim)" }}>
                  AutoPress sources from NewsAPI. All articles are AI-synthesized from real headlines.
                  We cite our sources. We do not invent facts.
                  AI transparency disclosures appear on every article.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                © {new Date().getFullYear()} AutoPress.
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>
                Editorial Standards: Verified Synthesis · Multi-source Grounding
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
