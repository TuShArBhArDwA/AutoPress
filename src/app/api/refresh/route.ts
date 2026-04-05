import { NextResponse } from 'next/server';
import { forceRefresh, getStoreStatus } from '@/lib/pipeline';

export const maxDuration = 300; // 5 minutes — Vercel Pro/Hobby allows up to 300s

export async function GET(request: Request) {
  // Optional secret protection — set REFRESH_SECRET in your Vercel env vars
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const expectedSecret = process.env.REFRESH_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[/api/refresh] Triggered — starting pipeline...');
    const result = await forceRefresh();
    return NextResponse.json({
      ok: true,
      count: result.articles.length,
      generatedAt: result.generatedAt,
      message: `Pipeline complete. ${result.articles.length} full reports generated.`,
    });
  } catch (error: any) {
    console.error('[/api/refresh] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Pipeline failed',
        currentStore: getStoreStatus(),
      },
      { status: 500 }
    );
  }
}

// Also expose a status endpoint via HEAD
export async function HEAD() {
  const status = getStoreStatus();
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Article-Count': String(status.count),
      'X-Generated-At': status.generatedAt || 'never',
      'X-Store-Stale': String(status.stale),
    },
  });
}
