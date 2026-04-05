import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { GeneratedArticle } from "@/types";
import SafeImage from "@/components/SafeImage";
import {
  formatFullDate,
  getCategoryColor,
  getPriorityBadge,
  getReadTimeText,
  getBodyParagraphs,
  getImpactLabel,
  formatDate,
  getVelocityBadge,
} from "@/lib/utils";
import ReadingProgress from "@/components/ReadingProgress";
import QAPanel from "@/components/QAPanel";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<GeneratedArticle | null> {
  try {
    const { ensureFullReport } = await import("@/lib/pipeline");
    return (await ensureFullReport(slug)) || null;
  } catch {
    return null;
  }
}

async function getRelated(currentSlug: string, category: string): Promise<GeneratedArticle[]> {
  try {
    const { ensureArticles } = await import("@/lib/pipeline");
    const all = await ensureArticles();
    return all
      .filter((a) => a.slug !== currentSlug && a.category === category)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.headline} | AutoPress`,
    description: article.subheadline,
    openGraph: {
      title: article.headline,
      description: article.subheadline,
      type: "article",
      publishedTime: article.generatedAt,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const paragraphs = getBodyParagraphs(article.body || "");
  const related = await getRelated(slug, article.category);
  const priority = getPriorityBadge(article.editorialPriority);

  return (
    <>
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* ─── Main Article Column ─────────────────────────────────── */}
          <article className="lg:col-span-2">

            {/* Back nav */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
              style={{ color: "var(--foreground-dim)" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              AutoPress
            </Link>

            {/* Category + priority badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`cat-pill ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              {(article.editorialPriority === "breaking" || article.editorialPriority === "developing") && (
                <span className={`cat-pill ${priority.className}`}>{priority.label}</span>
              )}
              <span className="text-xs ml-1" style={{ color: "var(--foreground-dim)" }}>
                {getImpactLabel(article.impact)}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-serif font-bold leading-tight mb-4 text-balance"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--foreground)" }}
            >
              {article.headline}
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: "var(--foreground-muted)", borderLeft: "3px solid var(--accent)", paddingLeft: "1rem" }}
            >
              {article.subheadline}
            </p>

            {/* Byline */}
            <div
              className="flex items-center justify-between py-4 mb-6 flex-wrap gap-3"
              style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--accent)" }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>AutoPress Editorial</p>
                  <p className="text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                    Automated Synthesis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                <span>{formatFullDate(article.generatedAt)}</span>
                <span>·</span>
                <span>{getReadTimeText(article.readTime || 0)}</span>
                {article.wordCount && <span>· {article.wordCount.toLocaleString()} words</span>}
              </div>
            </div>

            {/* Hero image */}
            {article.imageUrl && (
              <figure className="mb-8 -mx-4 sm:-mx-0">
                <SafeImage
                  src={article.imageUrl}
                  alt=""
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: "480px" }}
                />
              </figure>
            )}

            {/* Article body */}
            <div className="prose mb-10">
              {paragraphs.map((paragraph, index) => (
                <>
                  <p key={index}>{paragraph}</p>
                  {/* Insert pull-quote after paragraph 2 */}
                  {index === 1 && article.pullQuote && (
                    <blockquote key="pq" className="pull-quote">
                      &ldquo;{article.pullQuote}&rdquo;
                    </blockquote>
                  )}
                </>
              ))}
            </div>

            {/* Key Points */}
            {article.keyPoints && article.keyPoints.length > 0 && (
              <aside
                className="mb-10 p-6 rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  {article.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ color: "var(--foreground-muted)", lineHeight: 1.6 }}>{point}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Q&A Panel */}
            <div className="mb-10">
              <QAPanel articleId={article.id} articleSlug={article.slug} />
            </div>

            {/* Source Coverage */}
            {article.sourceStories.filter((s) => s.url).length > 0 && (
              <aside className="mb-10">
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--foreground-dim)" }}
                >
                  Source Coverage
                </h3>
                <ul className="space-y-2">
                  {article.sourceStories.filter((s) => s.url).map((story, index) => (
                    <li key={index}>
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm flex items-start gap-2 transition-colors group"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ color: "var(--accent)" }}
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                        <span>
                          <span className="group-hover:underline">{story.title}</span>
                          <span className="ml-2 text-xs" style={{ color: "var(--foreground-dim)" }}>
                            — {story.source}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-6 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground-dim)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Editorial Disclosure */}
            <div
              className="p-5 rounded-xl mt-12"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start gap-4">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <div className="text-xs leading-relaxed space-y-1" style={{ color: "var(--foreground-dim)" }}>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground-muted)" }}>Transparency & Standards</p>
                  <p>
                    This report was synthesized from multiple primary news sources by the AutoPress Editorial Engine.
                    Our system uses state-of-the-art context windowing to ensure that every fact stated is grounded in the source coverage linked above.
                  </p>
                  <p className="mt-2">
                    <strong style={{ color: "var(--accent)" }}>Verification:</strong> This report has been assessed for high factual grounding and cross-referenced with wire data.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* ─── Sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            
            {/* Trend & Social Intel */}
            <ViralSnapshot snapshot={article.viralSnapshot} />
            <DiscoveryIntel velocity={article.trendVelocity || 'steady'} />

            {/* Timeline */}
            {article.timeline && article.timeline.length > 0 && (
              <div
                className="p-5 rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--foreground-dim)" }}
                >
                  Timeline
                </h3>
                <div className="space-y-4">
                  {article.timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ background: i === 0 ? "var(--accent)" : "var(--border)" }}
                        />
                        {i < article.timeline.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ background: "var(--border)", minHeight: "20px" }} />
                        )}
                      </div>
                      <div className="pb-1">
                        <p
                          className="text-xs font-semibold mb-0.5"
                          style={{ color: "var(--accent)", fontFamily: "monospace" }}
                        >
                          {item.date}
                        </p>
                        <p className="text-sm leading-snug" style={{ color: "var(--foreground-muted)" }}>
                          {item.event}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Facts */}
            <div
              className="p-5 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "var(--foreground-dim)" }}
              >
                Editorial Index
              </h3>
              <div className="space-y-3 text-xs" style={{ fontFamily: "monospace" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--foreground-dim)" }}>Department</span>
                  <span className={`cat-pill ${getCategoryColor(article.category)}`}>{article.category}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--foreground-dim)" }}>Editorial Priority</span>
                  <span style={{ color: "var(--foreground-muted)" }}>{article.editorialPriority.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--foreground-dim)" }}>Report Length</span>
                  <span style={{ color: "var(--foreground-muted)" }}>{(article.wordCount || 0).toLocaleString()} words</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: "var(--foreground-dim)" }}>Verification</span>
                  <div className="flex items-center gap-2">
                    <div className="confidence-bar w-16">
                      <div
                        className="confidence-fill"
                        style={{ width: `${Math.round((article.confidenceScore || 0.7) * 100)}%` }}
                      />
                    </div>
                    <span style={{ color: "var(--accent)" }}>
                      {Math.round((article.confidenceScore || 0.7) * 100) > 85 ? "HIGH" : "ASSESSED"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--foreground-dim)" }}>Edition</span>
                  <span style={{ color: "var(--foreground-muted)" }}>{formatDate(article.generatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div
                className="p-5 rounded-xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h3
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "var(--foreground-dim)" }}
                >
                  Related Reports
                </h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <div key={r.id} style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
                      <span className={`cat-pill ${getCategoryColor(r.category)} mb-1.5 inline-flex`}>
                        {r.category}
                      </span>
                      <Link href={`/article/${r.slug}`}>
                        <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                          {r.headline}
                        </p>
                      </Link>
                      <p className="text-xs mt-1" style={{ color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                        {getReadTimeText(r.readTime || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

// ─── Viral Snapshot ─────────────────────────────────────────────────────────
function ViralSnapshot({ snapshot }: { snapshot?: string[] }) {
  if (!snapshot || snapshot.length === 0) return null;
  return (
    <div className="p-5 rounded-xl border border-violet-500/20 bg-violet-500/5 mb-6 shadow-sm">
      <h3 className="text-[0.65rem] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-violet-700">
        <span className="text-sm">✨</span> Viral Snapshot
      </h3>
      <div className="space-y-3">
        {snapshot.map((point, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-xs font-bold text-violet-800/40 mt-0.5">0{i + 1}</span>
            <p className="text-xs leading-relaxed italic" style={{ color: "var(--foreground-muted)" }}>
              &ldquo;{point}&rdquo;
            </p>
          </div>
        ))}
      </div>
      <p className="text-[0.55rem] uppercase tracking-tighter mt-4 text-violet-800/60 font-mono">
        Optimized for 15s High-Impact Briefing
      </p>
    </div>
  );
}

// ─── Discovery Intel ─────────────────────────────────────────────────────────
function DiscoveryIntel({ velocity }: { velocity: string }) {
  const badge = getVelocityBadge(velocity);
  return (
    <div className="p-5 rounded-xl border border-border bg-surface mb-6 shadow-sm">
      <h3 className="text-[0.65rem] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-foreground-dim font-mono">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        Discovery Intelligence
      </h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground-muted">Momentum Status</span>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] font-bold border ${badge.className}`}>
          {badge.icon} {badge.label}
        </span>
      </div>
      <div className="h-1 w-full bg-border rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${velocity === 'hot' ? 'bg-orange-500 w-full' : velocity === 'rising' ? 'bg-emerald-500 w-3/4' : 'bg-blue-500 w-1/4'}`} 
        />
      </div>
    </div>
  );
}

