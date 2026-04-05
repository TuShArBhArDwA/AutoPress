import { Metadata } from "next";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { GeneratedArticle } from "@/types";
import { getCategoryColor, getReadTimeText, getEditionLabel, formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Daily Digest | AutoPress",
  description: "Morning briefing: the day's critical stories synthesized by the AutoPress Editorial Engine and verified for accuracy.",
};

async function getArticles(): Promise<GeneratedArticle[]> {
  try {
    const { ensureArticles } = await import("@/lib/pipeline");
    return await ensureArticles();
  } catch {
    return [];
  }
}

function DigestItem({
  article,
  index,
}: {
  article: GeneratedArticle;
  index: number;
}) {
  return (
    <div
      className="group grid sm:grid-cols-[auto_1fr_auto] gap-4 sm:gap-6 items-start py-5 animate-fade-in-up"
      style={{
        borderBottom: "1px solid var(--border)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Number */}
      <span
        className="font-serif text-4xl font-bold leading-none hidden sm:block"
        style={{ color: "var(--foreground-dim)", opacity: 0.25, width: "2.5rem", textAlign: "right" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`cat-pill ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <span className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
            {getReadTimeText(article.readTime || 0)}
          </span>
          {article.impact === "global" && (
            <span className="text-xs" style={{ color: "var(--foreground-dim)" }}>🌐 Global</span>
          )}
        </div>
        <Link href={`/article/${article.slug}`}>
          <h3
            className="font-serif text-xl font-bold leading-snug mb-2 transition-colors group-hover:text-yellow-400"
            style={{ color: "var(--foreground)" }}
          >
            {article.headline}
          </h3>
        </Link>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {article.subheadline}
        </p>
      </div>

      {/* Thumbnail */}
      {article.imageUrl && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <SafeImage
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
    </div>
  );
}

export default async function DigestPage() {
  const articles = await getArticles();
  const edition = getEditionLabel();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Group by category for the sidebar
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-3 gap-12">

        {/* ─── Main ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Header */}
          <header className="mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full pulse-dot"
                style={{ background: "var(--accent)" }}
              />
              {edition.toUpperCase()}
            </div>
            <h1
              className="font-serif font-bold mb-2"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--foreground)", lineHeight: 1.1 }}
            >
              Today&apos;s Digest
            </h1>
            <p className="text-sm" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
              {today} · {articles.length} reports
            </p>
          </header>

          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="mb-4" style={{ color: "var(--foreground-muted)" }}>
                The editorial engine is finalizing today&apos;s reports...
              </p>
              <Link href="/" className="text-sm" style={{ color: "var(--accent)" }}>
                ← Back to homepage
              </Link>
            </div>
          ) : (
            <div>
              {articles.slice(0, 10).map((article, index) => (
                <DigestItem key={article.id} article={article} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Sidebar ──────────────────────────────────────────────── */}
        <aside className="space-y-6 mt-0 lg:mt-[7rem]">

          {/* Section index */}
          {categories.length > 0 && (
            <div
              className="p-5 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--foreground-dim)" }}
              >
                In This Edition
              </h3>
              <ul className="space-y-2">
                {categories.map((cat) => {
                  const count = articles.filter((a) => a.category === cat).length;
                  return (
                    <li key={cat} className="flex items-center justify-between">
                      <span className={`cat-pill ${getCategoryColor(cat)}`}>{cat}</span>
                      <span className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                        {count} report{count !== 1 ? "s" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pipeline info */}
          <div
            className="p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--foreground-dim)" }}
            >
              About This Digest
            </h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
              This briefing is synthesized by the AutoPress Editorial Engine from the world&apos;s digital wires.
              Each story is analyzed, scored for significance, and written as a 700+ word report.
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
              Last updated: {articles.length > 0 ? formatDate(articles[0]?.generatedAt) : "pending"}
            </p>
            <Link href="/about" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              The Reporting Methodology →
            </Link>
          </div>

          {/* Back to full coverage */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
            Full Coverage
          </Link>
        </aside>
      </div>
    </div>
  );
}
