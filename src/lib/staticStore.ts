import type { DigestItem, GeneratedArticle } from '@/types';
import * as fs from 'fs';
import * as path from 'path';

export type ArticleStore = {
  articles: GeneratedArticle[];
  digest: DigestItem[];
  generatedAt: string;
};

const STORE_FILE = path.join(process.cwd(), 'public', 'data', 'store.json');

export function readStaticStore(): ArticleStore | null {
  try {
    if (!fs.existsSync(STORE_FILE)) return null;
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const data = JSON.parse(raw) as ArticleStore;
    if (!data || !Array.isArray(data.articles)) return null;
    return data;
  } catch {
    return null;
  }
}

