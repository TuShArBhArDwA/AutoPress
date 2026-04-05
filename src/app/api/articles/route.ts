import { NextResponse } from 'next/server';
import { ensureArticles } from '@/lib/pipeline';

export async function GET() {
  try {
    const articles = await ensureArticles();
    
    return NextResponse.json({
      articles,
      generatedAt: new Date().toISOString(),
      count: articles.length,
    });
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
