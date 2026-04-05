import { NextResponse } from 'next/server';
import { runPipeline, getPipelineStatus } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await runPipeline();
    
    return NextResponse.json({
      status: 'complete',
      articlesGenerated: result.articles.length,
      digestItems: result.digest.length,
      articles: result.articles,
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Generation failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(getPipelineStatus());
}
