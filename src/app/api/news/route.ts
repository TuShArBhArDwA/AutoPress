import { NextResponse } from 'next/server';
import { fetchTopHeadlines } from '@/lib/newsapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  try {
    const articles = await fetchTopHeadlines(category, pageSize);
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('News API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
