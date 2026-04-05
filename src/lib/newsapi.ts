import { NewsArticle } from '@/types';

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export async function fetchTopHeadlines(category?: string, pageSize: number = 20): Promise<NewsArticle[]> {
  if (!API_KEY) {
    throw new Error('NEWS_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    apiKey: API_KEY,
    pageSize: pageSize.toString(),
    language: 'en',
  });

  if (category) {
    params.set('category', category);
  } else {
    params.set('country', 'us');
  }

  const response = await fetch(`${BASE_URL}/top-headlines?${params.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
}

export async function fetchEverything(query: string, pageSize: number = 20): Promise<NewsArticle[]> {
  if (!API_KEY) {
    throw new Error('NEWS_API_KEY is not configured');
  }

  const params = new URLSearchParams({
    apiKey: API_KEY,
    q: query,
    pageSize: pageSize.toString(),
    language: 'en',
    sortBy: 'relevancy',
  });

  const response = await fetch(`${BASE_URL}/everything?${params.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
}

export function filterSignificantArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.filter((article) => {
    if (!article.title || !article.description) return false;
    if (article.title.includes('[Removed]')) return false;
    if (article.description.includes('[Removed]')) return false;
    if (article.title.toLowerCase().includes('removed')) return false;
    if (article.description.length < 100) return false;
    return true;
  });
}

export function scoreArticleRelevance(article: NewsArticle): number {
  let score = 0;
  
  const title = article.title.toLowerCase();
  const desc = (article.description || '').toLowerCase();
  
  if (title.includes('breaking') || title.includes('urgent')) score += 10;
  if (title.includes('official') || title.includes('government') || title.includes('senate') || title.includes('congress')) score += 5;
  if (title.includes('report') || title.includes('study') || title.includes('research')) score += 5;
  if (desc.length > 200) score += 3;
  if (article.author) score += 2;
  
  return score;
}
