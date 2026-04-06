import { GeneratedArticle, DigestItem } from '@/types';
import { fetchTopHeadlines, filterSignificantArticles, scoreArticleRelevance } from './newsapi';
import { synthesizeStory, generateDigest } from './groq';
import * as fs from 'fs';
import * as path from 'path';

// ─── File Cache (survives warm restarts within same Vercel pod) ───────────────
const CACHE_DIR = process.env.VERCEL
  ? path.join('/tmp', '.autopress-cache')
  : path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'articles.json');
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const SEED_CACHE_FILE = path.join(process.cwd(), '.cache', 'articles.json');

// ─── In-Memory Store (fastest — zero I/O for warm instances) ─────────────────
interface ArticleStore {
  articles: GeneratedArticle[];
  digest: DigestItem[];
  generatedAt: string;
}

let memStore: ArticleStore | null = null;
let pipelineRunning = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function detectCategory(article: {
  title: string;
  description: string | null;
  source: { name: string };
}): string {
  const text = `${article.title} ${article.description || ''} ${article.source.name}`.toLowerCase();
  if (/(election|congress|senate|parliament|president|democrat|republican|government|policy|legislation|vote|minister|supreme court)/.test(text)) return 'politics';
  if (/(ai|artificial intelligence|tech|software|apple|google|microsoft|meta|openai|startup|chip|semiconductor|cyber|hack)/.test(text)) return 'tech';
  if (/(market|stock|economy|gdp|inflation|fed|interest rate|bank|invest|trade|recession|earnings|revenue|financial)/.test(text)) return 'business';
  if (/(climate|space|nasa|research|study|discovery|vaccine|dna|genome|physics|energy|environment)/.test(text)) return 'science';
  if (/(health|hospital|disease|cancer|drug|fda|mental health|medicine|outbreak|epidemic)/.test(text)) return 'health';
  if (/(sport|nba|nfl|soccer|football|cricket|tennis|olympic|athlete|game|tournament|championship)/.test(text)) return 'sports';
  return 'world';
}

// ─── File Cache I/O ───────────────────────────────────────────────────────────
function readFileCache(): ArticleStore | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw) as ArticleStore;
    const age = Date.now() - new Date(data.generatedAt).getTime();
    // Hard limit: discard cache older than 24h
    if (age > 24 * 60 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function readSeedCache(): ArticleStore | null {
  try {
    if (!fs.existsSync(SEED_CACHE_FILE)) return null;
    const raw = fs.readFileSync(SEED_CACHE_FILE, 'utf-8');
    const data = JSON.parse(raw) as ArticleStore;
    if (!data || !Array.isArray(data.articles)) return null;
    if (data.articles.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

function writeFileCache(store: ArticleStore): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(store, null, 2));
    console.log(`[Pipeline] Cache written: ${store.articles.length} articles`);
  } catch (e) {
    console.warn('[Pipeline] Failed to write cache:', e);
  }
}

// ─── Warm in-memory store from file cache on module load ─────────────────────
// This runs once when the module is first imported. On warm Vercel instances,
// this is instant and means ensureArticles() returns immediately.
(function warmFromCache() {
  if (memStore) return;
  const cached = readFileCache();
  if (cached && cached.articles.length > 0) {
    memStore = cached;
    console.log(`[Pipeline] Warmed from disk: ${cached.articles.length} articles`);
    return;
  }

  // On Vercel, cold starts + background work are unreliable. If we shipped a seed
  // cache with the deployment, use it so the homepage is never empty.
  const seeded = readSeedCache();
  if (seeded && seeded.articles.length > 0) {
    memStore = seeded;
    console.log(`[Pipeline] Warmed from seed cache: ${seeded.articles.length} articles`);
  }
})();

function isCacheStale(): boolean {
  if (!memStore) return true;
  return Date.now() - new Date(memStore.generatedAt).getTime() > CACHE_TTL_MS;
}

// ─── Main Pipeline ─────────────────────────────────────────────────────────────
export async function runPipeline(): Promise<ArticleStore> {
  console.log('[Pipeline] Starting full synthesis pipeline...');

  const [worldHeadlines, techHeadlines, businessHeadlines] = await Promise.all([
    fetchTopHeadlines('general', 20),
    fetchTopHeadlines('technology', 15),
    fetchTopHeadlines('business', 15),
  ]);

  const allArticles = [...worldHeadlines, ...techHeadlines, ...businessHeadlines];
  const filtered = filterSignificantArticles(allArticles);
  const scored = filtered
    .map((a) => ({ article: a, score: scoreArticleRelevance(a) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  console.log(`[Pipeline] ${allArticles.length} raw → ${filtered.length} filtered → ${scored.length} selected`);

  const generatedArticles: GeneratedArticle[] = [];

  for (let i = 0; i < scored.length; i++) {
    const item = scored[i];
    console.log(`[Pipeline] Synthesizing [${i + 1}/${scored.length}]: "${item.article.title.slice(0, 55)}..."`);

    try {
      const relatedHeadlines = scored
        .filter((_, j) => j !== i)
        .slice(0, 3)
        .map((s) => ({ title: s.article.title, source: s.article.source.name }));

      const synthesis = await synthesizeStory(
        item.article.title,
        item.article.description || '',
        relatedHeadlines
      );

      generatedArticles.push({
        id: generateId(),
        slug: generateSlug(synthesis.headline || item.article.title),
        headline: synthesis.headline,
        subheadline: synthesis.subheadline,
        body: synthesis.body,
        keyPoints: synthesis.keyPoints,
        readTime: synthesis.readTime,
        tags: synthesis.tags,
        pullQuote: synthesis.pullQuote,
        wordCount: synthesis.wordCount,
        viralSnapshot: synthesis.viralSnapshot,
        isFullReport: true,
        sourceStories: [
          { title: item.article.title, source: item.article.source.name, url: item.article.url },
          ...relatedHeadlines.map((h) => ({ ...h, url: '' })),
        ],
        generatedAt: new Date().toISOString(),
        category: detectCategory(item.article),
        imageUrl: item.article.urlToImage,
        editorialPriority: synthesis.editorialPriority,
        timeline: synthesis.timeline,
        impact: synthesis.impact,
        confidenceScore: synthesis.confidenceScore,
        trendVelocity: synthesis.trendVelocity,
        angle: synthesis.angle,
        context: synthesis.context,
        stakeholders: synthesis.stakeholders,
        keyQuestions: synthesis.keyQuestions,
        talkingPoints: synthesis.talkingPoints,
      } as GeneratedArticle);

      // Write to cache after EACH article so partial results survive crashes
      memStore = {
        articles: sortArticles(generatedArticles),
        digest: memStore?.digest || [],
        generatedAt: new Date().toISOString(),
      };
      writeFileCache(memStore);
    } catch (err) {
      console.error(`[Pipeline] Failed story ${i + 1}:`, err);
    }

    if (i < scored.length - 1) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  // Generate digest
  let digestItems: DigestItem[] = [];
  try {
    const digestResult = await generateDigest(
      generatedArticles.map((a) => ({
        title: a.headline,
        source: 'AutoPress',
        description: a.subheadline || '',
      }))
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

  const finalStore: ArticleStore = {
    articles: sortArticles(generatedArticles),
    digest: digestItems,
    generatedAt: new Date().toISOString(),
  };

  memStore = finalStore;
  writeFileCache(finalStore);
  console.log(`[Pipeline] Complete. ${finalStore.articles.length} full reports ready.`);
  return finalStore;
}

function sortArticles(articles: GeneratedArticle[]): GeneratedArticle[] {
  const order = { breaking: 0, developing: 1, analysis: 2, feature: 3 };
  return [...articles].sort((a, b) => {
    const pa = order[a.editorialPriority as keyof typeof order] ?? 3;
    const pb = order[b.editorialPriority as keyof typeof order] ?? 3;
    if (pa !== pb) return pa - pb;
    return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns articles RIGHT NOW from memory — never blocks.
 * Returns empty array if pipeline hasn't run yet.
 */
export function getArticlesNow(): GeneratedArticle[] {
  return memStore?.articles || [];
}

/**
 * Starts pipeline in the background. Never awaited by callers.
 * Safe to call from anywhere — will not double-run.
 */
export function triggerPipelineBackground(): void {
  if (pipelineRunning) {
    console.log('[Pipeline] Already running, skipping background trigger.');
    return;
  }
  pipelineRunning = true;
  runPipeline()
    .catch((e) => console.error('[Pipeline] Background run failed:', e))
    .finally(() => { pipelineRunning = false; });
}

/**
 * Returns articles — instant if store is warm, triggers background pipeline
 * if store is empty or stale. NEVER blocks the request.
 */
export async function ensureArticles(): Promise<GeneratedArticle[]> {
  // Warm and fresh
  if (memStore && memStore.articles.length > 0 && !isCacheStale()) {
    return memStore.articles;
  }
  // Warm but stale — return immediately and refresh in background
  if (memStore && memStore.articles.length > 0 && isCacheStale()) {
    console.log('[Pipeline] Stale store — returning cached, refreshing in background...');
    // Avoid attempting background work on Vercel — serverless may freeze after response.
    if (!process.env.VERCEL) triggerPipelineBackground();
    return memStore.articles;
  }

  // Cold — first try a bundled seed cache so we always return something in
  // serverless environments.
  const seeded = readSeedCache();
  if (seeded && seeded.articles.length > 0) {
    memStore = seeded;
    return memStore.articles;
  }

  // Cold with no seed — locally we can spin up the background pipeline; on
  // Vercel, callers should use /api/refresh (long-running) to populate storage.
  console.log('[Pipeline] Cold store — no cache available.');
  if (!process.env.VERCEL) {
    console.log('[Pipeline] Triggering background pipeline (non-Vercel).');
    triggerPipelineBackground();
  }
  return memStore?.articles || [];
}

/**
 * Force a full pipeline run — used by /api/refresh.
 * Blocks until complete; intended for non-user-facing calls.
 */
export async function forceRefresh(): Promise<ArticleStore> {
  if (pipelineRunning) throw new Error('Pipeline already running');
  pipelineRunning = true;
  try {
    return await runPipeline();
  } finally {
    pipelineRunning = false;
  }
}

/**
 * Instant slug lookup from memory.
 */
export function getArticleBySlug(slug: string): GeneratedArticle | undefined {
  return memStore?.articles.find((a) => a.slug === slug);
}

/**
 * For article page — returns article if in store, or waits up to 90s
 * for pipeline to finish (only blocks if store is cold AND article was just requested).
 */
export async function ensureFullReport(slug: string): Promise<GeneratedArticle | undefined> {
  // Fast path — article already in store
  const nowArticle = getArticleBySlug(slug);
  if (nowArticle) return nowArticle;

  // Store is cold — trigger pipeline and wait for it
  triggerPipelineBackground();

  // Wait up to 90 seconds for pipeline to populate the store
  const timeout = 90_000;
  const interval = 2_000;
  let waited = 0;
  while (waited < timeout) {
    await new Promise((r) => setTimeout(r, interval));
    waited += interval;
    const article = getArticleBySlug(slug);
    if (article) return article;
    // Even if specific slug not found, return first available article after pipeline runs
    if (!pipelineRunning && memStore && memStore.articles.length > 0) break;
  }

  return getArticleBySlug(slug);
}

export function getDigest(): DigestItem[] {
  return memStore?.digest || [];
}

export function getStoreStatus(): {
  count: number;
  generatedAt: string | null;
  stale: boolean;
  running: boolean;
} {
  return {
    count: memStore?.articles.length || 0,
    generatedAt: memStore?.generatedAt || null,
    stale: isCacheStale(),
    running: pipelineRunning,
  };
}

// Legacy compat
export function getPipelineStatus() {
  return getStoreStatus();
}
