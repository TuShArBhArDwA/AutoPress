import { NextResponse } from 'next/server';
import { ensureArticles, triggerPipelineBackground, getStoreStatus } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ensureArticles is now non-blocking — returns whatever is in store
    // and fires the pipeline in the background if needed
    const articles = await ensureArticles();

    const status = getStoreStatus();

    return NextResponse.json({
      articles,
      count: articles.length,
      generatedAt: status.generatedAt,
      running: status.running,
    });
  } catch (error) {
    console.error('Articles API error:', error);
    // Ensure pipeline at least starts
    triggerPipelineBackground();
    return NextResponse.json(
      { articles: [], count: 0, error: 'Failed to fetch articles', running: true },
      { status: 200 } // Return 200 so client keeps polling
    );
  }
}
