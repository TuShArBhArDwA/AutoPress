import type { DigestItem, GeneratedArticle } from '@/types';

export type ArticleStore = {
  articles: GeneratedArticle[];
  digest: DigestItem[];
  generatedAt: string;
};

const STORE_KEY = 'autopress:store:v1';

function hasKvEnv() {
  // @vercel/kv uses KV_* env vars (mapped from Upstash integration)
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function loadRemoteStore(): Promise<ArticleStore | null> {
  if (!process.env.VERCEL) return null;
  if (!hasKvEnv()) return null;

  try {
    const { kv } = await import('@vercel/kv');
    const data = (await kv.get(STORE_KEY)) as ArticleStore | null;
    if (!data || !Array.isArray(data.articles) || data.articles.length === 0) return null;
    return data;
  } catch (e) {
    console.warn('[RemoteStore] load failed:', e);
    return null;
  }
}

export async function saveRemoteStore(store: ArticleStore): Promise<void> {
  if (!process.env.VERCEL) return;
  if (!hasKvEnv()) return;

  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(STORE_KEY, store);
  } catch (e) {
    console.warn('[RemoteStore] save failed:', e);
  }
}

