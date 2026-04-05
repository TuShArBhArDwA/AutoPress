import Link from "next/link";
import { GeneratedArticle } from "@/types";
import SafeImage from "@/components/SafeImage";
import {
  formatDate,
  getCategoryColor,
  getPriorityBadge,
  getReadTimeText,
  getBodyParagraphs,
  getVelocityBadge,
} from "@/lib/utils";
import DiscoveryHub from "@/components/DiscoveryHub";

export const revalidate = 600; // 10 minutes

// ─── Velocity Badge ──────────────────────────────────────────────────────────
function VelocityBadge({ velocity }: { velocity: string }) {
  const badge = getVelocityBadge(velocity);
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] font-bold border ${badge.className}`}
      style={{ letterSpacing: '0.05em' }}
    >
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

// ─── Hero Article ─────────────────────────────────────────────────────────────
function HeroCard({ article }: { article: GeneratedArticle }) {
  const paragraphs = getBodyParagraphs(article.body || "");
  const lede = paragraphs[0]?.slice(0, 240) + "..." || article.subheadline;
  const priority = getPriorityBadge(article.editorialPriority);

  return (
    <article className="news-card-featured group relative animate-fade-in-up">
      {article.imageUrl && (
        <div className="relative aspect-[21/9] overflow-hidden">
          <SafeImage
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="hero-overlay absolute inset-0" />
          {/* Overlay badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`cat-pill ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            {article.editorialPriority === "breaking" || article.editorialPriority === "developing" ? (
              <span className={`cat-pill ${priority.className}`}>{priority.label}</span>
            ) : null}
            <VelocityBadge velocity={article.trendVelocity || 'steady'} />
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {!article.imageUrl && (
          <div className="flex items-center gap-2 mb-4">
            <span className={`cat-pill ${getCategoryColor(article.category)}`}>{article.category}</span>
            {(article.editorialPriority === "breaking" || article.editorialPriority === "developing") && (
              <span className={`cat-pill ${priority.className}`}>{priority.label}</span>
            )}
          </div>
        )}

        <Link href={`/article/${article.slug}`} className="block group/title">
          <h2
            className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3 transition-colors"
            style={{ color: "var(--foreground)" }}
          >
            {article.headline}
          </h2>
        </Link>

        <p className="text-lg mb-4 leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {article.subheadline}
        </p>

        <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--foreground-dim)" }}>
          {lede}
        </p>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
            <span>By AutoPress Editorial</span>
            <span>·</span>
            <span>{formatDate(article.generatedAt)}</span>
            <span>·</span>
            <span>{getReadTimeText(article.readTime || 0)}</span>
            {article.wordCount && <span>· {article.wordCount.toLocaleString()} words</span>}
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="text-sm font-medium transition-colors flex items-center gap-1"
            style={{ color: "var(--accent)" }}
          >
            Read full report
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Secondary Card ───────────────────────────────────────────────────────────
function SecondaryCard({ article, delay = 0 }: { article: GeneratedArticle; delay?: number }) {
  const priority = getPriorityBadge(article.editorialPriority);

  return (
    <article
      className={`news-card group p-5 animate-fade-in-up delay-${delay}`}
      style={{ height: "100%" }}
    >
      {article.imageUrl && (
        <div className="aspect-[16/7] overflow-hidden rounded-lg mb-4">
          <SafeImage
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className={`cat-pill ${getCategoryColor(article.category)}`}>{article.category}</span>
        {(article.editorialPriority === "breaking" || article.editorialPriority === "developing") && (
          <span className={`cat-pill ${priority.className}`} style={{ fontSize: "0.6rem" }}>{priority.label}</span>
        )}
        <VelocityBadge velocity={article.trendVelocity || 'steady'} />
        <span className="ml-auto text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
          {formatDate(article.generatedAt)}
        </span>
      </div>

      <Link href={`/article/${article.slug}`} className="block">
        <h3 className="font-serif text-xl font-bold leading-snug mb-2 transition-colors" style={{ color: "var(--foreground)" }}>
          {article.headline}
        </h3>
      </Link>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
        {article.subheadline}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
          {getReadTimeText(article.readTime || 0)}
        </span>
        <Link
          href={`/article/${article.slug}`}
          className="text-xs font-medium transition-colors"
          style={{ color: "var(--accent)" }}
        >
          {article.isFullReport ? "Read full report" : "Synthesize report →"}
        </Link>
      </div>
    </article>
  );
}

// ─── Compact Wire Card ────────────────────────────────────────────────────────
function WireCard({ article, index }: { article: GeneratedArticle; index: number }) {
  return (
    <article
      className="group flex items-start gap-4 py-4"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span
        className="font-serif text-2xl font-bold flex-shrink-0 w-8 text-right leading-none mt-1"
        style={{ color: "var(--foreground-dim)", opacity: 0.4 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`cat-pill ${getCategoryColor(article.category)}`}>{article.category}</span>
          <VelocityBadge velocity={article.trendVelocity || 'steady'} />
          <span className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
            {formatDate(article.generatedAt)}
          </span>
        </div>
        <Link href={`/article/${article.slug}`} className="block">
          <h4
            className="font-serif font-bold leading-snug mb-1 transition-colors group-hover:text-yellow-400"
            style={{ color: "var(--foreground)" }}
          >
            {article.headline}
          </h4>
        </Link>
        <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {article.subheadline}
        </p>
      </div>
      {article.imageUrl && (
        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <SafeImage
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </article>
  );
}

// ─── Pipeline Status Widget ────────────────────────────────────────────────────
function PipelineWidget({ count }: { count: number }) {
  const steps = [
    { label: "MONITORING", desc: "Digital wires" },
    { label: "SELECTION", desc: "Editorial curation" },
    { label: "REPORTING", desc: "Deep research" },
    { label: "DRAFTING", desc: "Authoring" },
    { label: "LIVE", desc: "Published" },
  ];

  return (
    <div className="glass-panel p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-1.5 h-1.5 rounded-full pulse-dot"
          style={{ background: "#4ade80" }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--foreground-muted)", fontFamily: "monospace" }}
        >
          Editorial Status
        </span>
        <span
          className="ml-auto text-xs"
          style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}
        >
          {count} reports live
        </span>
      </div>
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1 flex-1">
            <div className="flex-1">
              <div
                className="h-1 rounded-full"
                style={{ background: i < steps.length ? "var(--accent)" : "var(--border)" }}
              />
              <div className="flex justify-between mt-1">
                <span
                  className="text-xs"
                  style={{ fontFamily: "monospace", fontSize: "0.55rem", color: i < steps.length - 1 ? "var(--accent)" : "#4ade80", letterSpacing: "0.05em" }}
                >
                  {step.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <svg className="w-2.5 h-2.5 flex-shrink-0 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--accent)", opacity: 0.6 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Digest Rail ──────────────────────────────────────────────────────────────
function DigestRail({ articles }: { articles: GeneratedArticle[] }) {
  const digest = articles.slice(0, 5);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
          Today&apos;s Digest
        </h3>
        <Link href="/digest" className="ml-auto text-xs" style={{ color: "var(--accent)" }}>
          Full digest →
        </Link>
      </div>
      <div className="space-y-4">
        {digest.map((article, i) => (
          <div key={article.id} className="flex gap-3" style={{ borderBottom: i < digest.length - 1 ? "1px solid var(--border-subtle)" : "none", paddingBottom: i < digest.length - 1 ? "12px" : "0" }}>
            <span className="font-serif font-bold text-lg flex-shrink-0 w-5" style={{ color: "var(--foreground-dim)", opacity: 0.4 }}>
              {i + 1}
            </span>
            <div>
              <span className={`cat-pill ${getCategoryColor(article.category)} mb-1.5 inline-flex`}>
                {article.category}
              </span>
              <Link href={`/article/${article.slug}`}>
                <p className="text-sm font-semibold leading-snug transition-colors" style={{ color: "var(--foreground)" }}>
                  {article.headline}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Main Page ────────────────────────────────────────────────────────────────
async function getArticles(): Promise<GeneratedArticle[]> {
  try {
    const { ensureArticles } = await import("@/lib/pipeline");
    return await ensureArticles();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();
  const hasBreaking = articles.some((a) => a.editorialPriority === "breaking");

  const [hero, ...rest] = articles;
  const secondary = rest.slice(0, 2);
  const wireStories = rest.slice(2, 7);
  const moreStories = rest.slice(7);

  if (articles.length === 0) return null; // Handled by loading.tsx

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breaking banner */}
      {hasBreaking && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-6"
          style={{ background: "rgba(224, 82, 82, 0.1)", border: "1px solid rgba(224, 82, 82, 0.25)" }}
        >
          <span className="cat-pill bg-red-600 text-white animate-pulse">BREAKING</span>
          <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {articles.find((a) => a.editorialPriority === "breaking")?.headline}
          </span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-0.5 h-6 rounded-full" style={{ background: "var(--accent)" }} />
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Top Stories
            </h1>
            <span className="text-xs ml-auto" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
              {articles.length} reports · Updated {formatDate(articles[0]?.generatedAt || "")}
            </span>
          </div>

          {/* Hero */}
          {hero && <HeroCard article={hero} />}

          {/* Secondary grid */}
          {secondary.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {secondary.map((a, i) => (
                <SecondaryCard key={a.id} article={a} delay={(i + 1) * 100} />
              ))}
            </div>
          )}

          {/* Wire section */}
          {wireStories.length > 0 && (
            <div
              className="glass-panel p-5 animate-fade-in-up delay-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-0.5 h-5 rounded-full" style={{ background: "var(--accent)" }} />
                <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
                  From the Wire
                </h2>
              </div>
              <div>
                {wireStories.map((a, i) => (
                  <WireCard key={a.id} article={a} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PipelineWidget count={articles.length} />
          <DiscoveryHub articles={articles} />
          <DigestRail articles={articles} />

          {/* About box */}
          <div
            className="p-5 rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
              About this publication
            </h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
              AutoPress produces in-depth reporting through a fully automated editorial engine.
              No human editors. Every article is 700+ words with sources cited.
            </p>
            <Link href="/about" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              How it works →
            </Link>
          </div>
        </div>
      </div>

      {/* More stories */}
      {moreStories.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-0.5 h-5" style={{ background: "var(--accent)" }} />
            <h2 className="font-serif text-xl font-bold" style={{ color: "var(--foreground)" }}>More Reports</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moreStories.map((a, i) => (
              <SecondaryCard key={a.id} article={a} delay={i * 100} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
