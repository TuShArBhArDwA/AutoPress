import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/groq';
import { getArticleBySlug } from '@/lib/pipeline';
import { readStaticStore } from '@/lib/staticStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, slug } = await request.json();

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Article slug is required' }, { status: 400 });
    }

    // Prefer the static daily snapshot store if present (GitHub Actions -> Vercel).
    const staticStore = readStaticStore();
    const article =
      staticStore?.articles?.find((a) => a.slug === slug) ??
      getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found. It may have expired from the cache.' },
        { status: 404 }
      );
    }

    const answer = await answerQuestion(
      question.trim(),
      article.body || article.subheadline || 'No further report content available.',
      article.headline
    );

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('[QA API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate answer', answer: 'Unable to answer at this time. Please try again.' },
      { status: 500 }
    );
  }
}
