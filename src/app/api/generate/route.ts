import { NextResponse } from 'next/server';
import { forceRefresh, getStoreStatus } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST() {
  try {
    const result = await forceRefresh();

    return NextResponse.json({
      status: 'complete',
      articlesGenerated: result.articles.length,
      digestItems: result.digest.length,
      generatedAt: result.generatedAt,
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(getStoreStatus());
}
