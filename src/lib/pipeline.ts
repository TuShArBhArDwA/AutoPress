import { GeneratedArticle, DigestItem, PipelineStatus } from '@/types';
import { fetchTopHeadlines, filterSignificantArticles, scoreArticleRelevance } from './newsapi';
import { analyzeStory, generateArticle, generateDigest, generateWithRetry } from './groq';
import * as fs from 'fs';
import * as path from 'path';

// ─── File-based cache (survives HMR in dev, essential for demo) ───────────────
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'articles.json');
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache(): { articles: GeneratedArticle[]; digest: DigestItem[]; timestamp: string } | null {
  try {
    ensureCacheDir();
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw);
    const age = Date.now() - new Date(data.timestamp).getTime();
    if (age > CACHE_TTL_MS) {
      console.log('[Pipeline] Cache expired, will regenerate');
      return null;
    }
    console.log(`[Pipeline] Using cached articles (${data.articles.length} articles, ${Math.round(age / 60000)}m old)`);
    return data;
  } catch {
    return null;
  }
}

function writeCache(articles: GeneratedArticle[], digest: DigestItem[]) {
  try {
    ensureCacheDir();
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ articles, digest, timestamp: new Date().toISOString() }, null, 2)
    );
    console.log(`[Pipeline] Cache written: ${articles.length} articles`);
  } catch (e) {
    console.warn('[Pipeline] Failed to write cache:', e);
  }
}

// ─── In-memory status (for current request) ──────────────────────────────────
let pipelineStatus: PipelineStatus = { status: 'idle', message: '' };

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function h(t: string, s: string) { return { title: t, source: s }; }

function detectCategory(article: { title: string; description: string | null; source: { name: string } }): string {
  const text = `${article.title} ${article.description || ''} ${article.source.name}`.toLowerCase();

  if (/(election|congress|senate|parliament|president|democrat|republican|government|policy|legislation|vote|minister|supreme court)/.test(text)) return 'politics';
  if (/(ai|artificial intelligence|tech|software|apple|google|microsoft|meta|openai|startup|chip|semiconductor|cyber|hack)/.test(text)) return 'tech';
  if (/(market|stock|economy|gdp|inflation|fed|interest rate|bank|invest|trade|recession|earnings|revenue|financial)/.test(text)) return 'business';
  if (/(climate|space|nasa|research|study|discovery|vaccine|dna|genome|physics|energy|environment)/.test(text)) return 'science';
  if (/(health|hospital|disease|cancer|drug|fda|mental health|medicine|outbreak|epidemic)/.test(text)) return 'health';
  if (/(sport|nba|nfl|soccer|football|cricket|tennis|olympic|athlete|game|tournament|championship)/.test(text)) return 'sports';

  return 'world';
}

// ─── Main pipeline ────────────────────────────────────────────────────────────
export async function runPipeline(): Promise<{
  articles: GeneratedArticle[];
  digest: DigestItem[];
}> {
  // Check file cache first
  const cached = readCache();
  if (cached && cached.articles.length > 0) {
    pipelineStatus = {
      status: 'complete',
      message: `Reviewing ${cached.articles.length} current reports`,
      progress: 100,
      articlesGenerated: cached.articles.length,
    };
    return { articles: cached.articles, digest: cached.digest };
  }

  pipelineStatus = { status: 'fetching', message: 'Monitoring international wire services...', progress: 5 };

  try {
    // Fetch from multiple categories in parallel
    const [worldHeadlines, techHeadlines, businessHeadlines, scienceHeadlines] = await Promise.all([
      fetchTopHeadlines('general', 25),
      fetchTopHeadlines('technology', 15),
      fetchTopHeadlines('business', 15),
      fetchTopHeadlines('science', 15),
    ]);

    pipelineStatus = { status: 'analyzing', message: 'Selecting headlines for editorial depth...', progress: 20 };

    const allArticles = [...worldHeadlines, ...techHeadlines, ...businessHeadlines, ...scienceHeadlines];
    const filtered = filterSignificantArticles(allArticles);

    const scored = filtered
      .map((a) => ({ article: a, score: scoreArticleRelevance(a) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Increase count for discovery hub (highlights are cheap)

    console.log(`[Pipeline] ${allArticles.length} raw → ${filtered.length} filtered → ${scored.length} selected`);

    pipelineStatus = {
      status: 'generating',
      message: `In-depth research on ${scored.length} major stories...`,
      progress: 30,
    };

    const generatedArticles: GeneratedArticle[] = [];
    let tpdExhausted = false;

    for (let i = 0; i < scored.length; i++) {
      const item = scored[i];
      pipelineStatus = {
        status: 'analyzing',
        message: `Analyzing trend ${i + 1} of ${scored.length}...`,
        progress: 30 + Math.round((i / scored.length) * 60),
      };

      try {
        console.log(`[Pipeline] Discovery Pass: ${item.article.title.slice(0, 60)}...`);
        const otherHeadlines = scored
          .filter((s) => s.article.title !== item.article.title)
          .slice(0, 3)
          .map((s) => h(s.article.title, s.article.source.name));

        const analysis = await generateWithRetry((client) =>
          analyzeStory(
            item.article.title,
            item.article.description || '',
            otherHeadlines.map(h => h.title)
          )
        );

        const article: GeneratedArticle = {
          id: generateId(),
          slug: generateSlug(item.article.title),
          headline: item.article.title,
          subheadline: item.article.description || '',
          isFullReport: false,
          tags: (analysis as any).tags || [],
          sourceStories: [
            { title: item.article.title, source: item.article.source.name, url: item.article.url },
            ...otherHeadlines.map((h) => ({ ...h, url: '' })),
          ],
          generatedAt: new Date().toISOString(),
          category: detectCategory(item.article),
          imageUrl: item.article.urlToImage,
          editorialPriority: analysis.editorialPriority,
          timeline: analysis.timeline,
          impact: analysis.impact,
          confidenceScore: analysis.confidenceScore,
          trendVelocity: analysis.trendVelocity,
          // Persist synthesis metadata
          angle: analysis.angle,
          context: analysis.context,
          stakeholders: analysis.stakeholders,
          keyQuestions: analysis.keyQuestions,
          talkingPoints: analysis.talkingPoints,
        };

        generatedArticles.push(article);
      } catch (error) {
        console.error(`[Pipeline] Discovery Failed: ${item.article.title.slice(0, 50)}`, error);
      }
    }

    pipelineStatus = { status: 'generating', message: 'Preparing morning briefing...', progress: 92 };

    let digestItems: DigestItem[] = [];
    try {
      const digestResult = await generateWithRetry((client) =>
        generateDigest(
          scored.map((s) => ({
            title: s.article.title,
            source: s.article.source.name,
            description: s.article.description || '',
          }))
        )
      );

      digestItems = digestResult.headlines.map((h) => ({
        id: generateId(),
        headline: h.headline,
        summary: h.summary,
        category: h.category.toLowerCase(),
      }));
    } catch (e) {
      console.warn('[Pipeline] Digest generation failed:', e);
    }

    // Sort: breaking first, then by generation time
    const sortedArticles = generatedArticles.sort((a, b) => {
      const priorityOrder = { breaking: 0, developing: 1, analysis: 2, feature: 3 };
      const pa = priorityOrder[a.editorialPriority] ?? 3;
      const pb = priorityOrder[b.editorialPriority] ?? 3;
      if (pa !== pb) return pa - pb;
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });

    writeCache(sortedArticles, digestItems);

    pipelineStatus = {
      status: 'complete',
      message: `Successfully published ${sortedArticles.length} reports`,
      progress: 100,
      articlesGenerated: sortedArticles.length,
    };

    return { articles: sortedArticles, digest: digestItems };
  } catch (error) {
    pipelineStatus = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Pipeline failed',
    };
    throw error;
  }
}

export function getPipelineStatus(): PipelineStatus {
  return pipelineStatus;
}

export function getArticleBySlug(slug: string): GeneratedArticle | undefined {
  const cached = readCache();
  return cached?.articles.find((a) => a.slug === slug);
}

export function getDigest(): DigestItem[] {
  return readCache()?.digest || [];
}

export async function ensureArticles(): Promise<GeneratedArticle[]> {
  const cached = readCache();
  if (cached && cached.articles.length > 0) return cached.articles;
  const { articles } = await runPipeline();
  return articles;
}

/**
 * On-demand report synthesis.
 * If the article is just a discovery highlight, it triggers the full 700-word authoring pass.
 */
export async function ensureFullReport(slug: string): Promise<GeneratedArticle | undefined> {
  const cached = readCache();
  if (!cached) return undefined;

  const index = cached.articles.findIndex((a) => a.slug === slug);
  if (index === -1) return undefined;

  const article = cached.articles[index];
  
  // If already synthesized, return it
  if (article.isFullReport) return article;

  console.log(`[Pipeline] JIT Synthesis: Authorship Pass for "${article.headline}"...`);

  try {
    const analysis = {
      editorialPriority: article.editorialPriority,
      timeline: article.timeline,
      impact: article.impact,
      confidenceScore: article.confidenceScore,
      trendVelocity: article.trendVelocity,
      // Metadata preserved from discovery
      angle: article.angle || '',
      context: article.context || '',
      stakeholders: article.stakeholders || [],
      keyQuestions: article.keyQuestions || [],
      talkingPoints: article.talkingPoints || [],
    };

    const mainStory = article.sourceStories[0];
    const otherHeadlines = article.sourceStories.slice(1);

    const generated = await generateWithRetry(() =>
      generateArticle(
        mainStory.title,
        article.subheadline || '',
        analysis as any,
        otherHeadlines as any
      )
    );

    // Update the article object in cache
    const fullArticle: GeneratedArticle = {
      ...article,
      isFullReport: true,
      headline: generated.headline, // Use model-refined headline
      body: generated.body,
      keyPoints: generated.keyPoints,
      readTime: generated.readTime,
      pullQuote: generated.pullQuote,
      wordCount: generated.wordCount,
      viralSnapshot: generated.viralSnapshot,
      tags: Array.from(new Set([...article.tags, ...(generated.tags || [])])),
    };

    cached.articles[index] = fullArticle;
    writeCache(cached.articles, cached.digest);

    return fullArticle;
  } catch (error) {
    console.error(`[Pipeline] JIT Authorship Failed: "${article.headline}"`, error);
    return article; // Return the highlight if full synthesis fails
  }
}
