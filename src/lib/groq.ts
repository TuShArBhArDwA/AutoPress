import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

function getGroqClient(): Groq {
  return new Groq({ apiKey });
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry with exponential backoff (single key)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateWithRetry<T>(
  fn: (client: Groq) => Promise<T>,
  maxRetries: number = 4
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn(getGroqClient());
    } catch (error: any) {
      lastError = error;
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.toLowerCase().includes('too many requests');
      const isServerError = error?.status >= 500;

      console.warn(
        `[Groq] Attempt ${attempt + 1} failed${isRateLimit ? ' (Rate Limit)' : ''}:`,
        error?.message || error
      );

      if (isRateLimit || isServerError) {
        let waitTime = 0;
        const timeMatch = error?.message?.match(/try again in (?:(\d+)m)?(\d+(?:\.\d+)?)s/);
        if (timeMatch) {
          const minutes = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
          const seconds = parseFloat(timeMatch[2]);
          waitTime = Math.ceil((minutes * 60 + seconds) * 1000) + 2000; // Add 2 second buffer
        } else if (error?.headers?.['retry-after']) {
          waitTime = parseInt(error.headers['retry-after']) * 1000 + 2000;
        } else {
          const jitter = Math.random() * 2000 + 1000;
          const baseBackoff = Math.min(6000 * Math.pow(2, attempt), 30000);
          waitTime = baseBackoff + jitter;
        }
        
        console.warn(`[Groq] Sleeping for ${waitTime / 1000}s before retry...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('All Groq API attempts failed');
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED: Single-call story synthesis (analysis + full article in one shot)
// Uses llama-3.1-8b-instant for speed and free-tier headroom.
// ─────────────────────────────────────────────────────────────────────────────
export interface SynthesisResult {
  // Editorial metadata
  angle: string;
  context: string;
  stakeholders: string[];
  keyQuestions: string[];
  talkingPoints: string[];
  timeline: { date: string; event: string }[];
  impact: 'local' | 'national' | 'global';
  editorialPriority: 'breaking' | 'developing' | 'analysis' | 'feature';
  trendVelocity: 'steady' | 'rising' | 'hot' | 'outlier';
  confidenceScore: number;
  // Full article
  headline: string;
  subheadline: string;
  body: string;
  keyPoints: string[];
  readTime: number;
  tags: string[];
  pullQuote: string;
  wordCount: number;
  viralSnapshot: string[];
}

export async function synthesizeStory(
  rawHeadline: string,
  rawDescription: string,
  relatedHeadlines: { title: string; source: string }[]
): Promise<SynthesisResult> {
  const sourceList = relatedHeadlines
    .slice(0, 4)
    .map((h) => `• "${h.title}" — ${h.source}`)
    .join('\n');

  // PASS 1: EDITORIAL METADATA (Strict JSON)
  const metaPrompt = `You are the Executive Editor at AutoPress.
Given this news wire, return a strict JSON object with editorial metadata.

━━━ WIRE ENTRY ━━━
Headline: ${rawHeadline}
Description: ${rawDescription}

━━━ REQUIRED JSON FIELDS ━━━
- "angle": The single most important, non-obvious editorial angle (1 sentence)
- "context": 2-3 sentences of essential historical or structural context
- "stakeholders": Array of exactly 3 specific named entities
- "keyQuestions": Array of 3 pressing unanswered questions
- "talkingPoints": Array of 3 concrete facts
- "timeline": Array of 2-4 objects with "date" and "event" keys
- "impact": one of "local" | "national" | "global"
- "editorialPriority": one of "breaking" | "developing" | "analysis" | "feature"
- "trendVelocity": one of "steady" | "rising" | "hot" | "outlier"
- "confidenceScore": 0.0-1.0
- "headline": Verb-driven publication headline, under 12 words
- "subheadline": One sentence (20-30 words) capturing key tension
- "keyPoints": Array of 4 specific takeaways
- "tags": Array of 4 keyword strings
- "viralSnapshot": Array of 3 strings for a 15-second high-impact briefing
- "readTime": Integer minutes (typically 4 or 5)
`;

  const metaCompletion = await generateWithRetry((client) => client.chat.completions.create({
    messages: [{ role: 'user', content: metaPrompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.2,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  }));

  const rawMeta = metaCompletion.choices[0]?.message?.content;
  if (!rawMeta) throw new Error('No metadata response from Groq');
  const p = JSON.parse(rawMeta);

  // PASS 2: FULL REPORT BODY (Raw Markdown)
  const bodyPrompt = `You are a senior staff correspondent at AutoPress — an AI-native international publication with the editorial standard of Reuters and The Economist. 
Write a complete, publication-ready news report (700-900 words) based on the wire data. 

━━━ WIRE ENTRY ━━━
Headline: ${rawHeadline}
Description: ${rawDescription}
Related: ${sourceList}

━━━ EDITORIAL ANGLE ━━━
${p.angle}

━━━ OUTPUT REQUIREMENTS ━━━
Write exactly 6-7 substantial paragraphs. Separate each paragraph with two newlines (\\n\\n).
DO NOT use markdown formatting (no bold, no headers). DO NOT output JSON. Just plain text.
- Para 1 (LEDE): Who/what/when/where in first 2 sentences. Inverted pyramid.
- Para 2 (CONTEXT): Historical background based on "${p.context}".
- Paras 3-5 (CONFLICT): Story through tension. Mention stakeholders: ${Array.isArray(p.stakeholders) ? p.stakeholders.join(', ') : 'key parties'}.
- Para 6 (IMPLICATIONS): Global/national ripple effects.
- Para 7 (CLOSE): Sharp concrete detail anchoring the story's gravity.

ABSOLUTE PROHIBITIONS:
- Never write: "in conclusion", "it is important to note", "tapestry of", "paving the way"
- Never start paragraphs with "Additionally", "Furthermore", "Moreover"
- Strip all conversational filler ("Here is the article:", etc.)`;

  const bodyCompletion = await generateWithRetry((client) => client.chat.completions.create({
    messages: [{ role: 'user', content: bodyPrompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.6,
    max_tokens: 2500,
  }));

  let rawBody = bodyCompletion.choices[0]?.message?.content || '';
  // Cleanup conversational filler sometimes generated by chat models
  rawBody = rawBody.replace(/^(Here is the article.*?:|Here's the news report.*?:)\s*/i, '').trim();
  
  const paragraphs = rawBody.split('\n\n').filter(Boolean);
  const pullQuoteCandidate = paragraphs.length > 2 ? paragraphs[2].split('. ')[0] + '.' : '';
  const wordCount = rawBody.trim().split(/\s+/).length;

  return {
    angle: p.angle || '',
    context: p.context || '',
    stakeholders: Array.isArray(p.stakeholders) ? p.stakeholders : [],
    keyQuestions: Array.isArray(p.keyQuestions) ? p.keyQuestions : [],
    talkingPoints: Array.isArray(p.talkingPoints) ? p.talkingPoints : [],
    timeline: Array.isArray(p.timeline) ? p.timeline : [],
    impact: ['local', 'national', 'global'].includes(p.impact) ? p.impact : 'national',
    editorialPriority: ['breaking', 'developing', 'analysis', 'feature'].includes(p.editorialPriority)
      ? p.editorialPriority
      : 'feature',
    trendVelocity: ['steady', 'rising', 'hot', 'outlier'].includes(p.trendVelocity)
      ? p.trendVelocity
      : 'steady',
    confidenceScore: typeof p.confidenceScore === 'number' ? Math.min(1, Math.max(0, p.confidenceScore)) : 0.7,
    headline: p.headline || rawHeadline,
    subheadline: p.subheadline || rawDescription,
    body: rawBody,
    keyPoints: Array.isArray(p.keyPoints) ? p.keyPoints : [],
    readTime: typeof p.readTime === 'number' ? p.readTime : Math.max(4, Math.ceil(wordCount / 200)),
    tags: Array.isArray(p.tags) ? p.tags : [],
    pullQuote: p.pullQuote || pullQuoteCandidate,
    wordCount,
    viralSnapshot: Array.isArray(p.viralSnapshot) ? p.viralSnapshot : [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Digest Generation (kept for /digest page)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateDigest(
  headlines: { title: string; source: string; description: string }[]
): Promise<{
  headlines: { headline: string; summary: string; category: string }[];
}> {
  const newsList = headlines
    .slice(0, 8)
    .map((h, i) => `${i + 1}. ${h.title} (${h.source}): ${h.description}`)
    .join('\n');

  const prompt = `You are a senior editor writing the morning briefing for a demanding, intelligent audience. Each item gives a reader everything they need in 30 seconds — no hedging, no filler.

TODAY'S STORIES:
${newsList}

Create a 5-7 item morning digest. Each item must have:
- A crisp, verb-driven headline (under 10 words)
- A 2-sentence summary: sentence 1 = core fact, sentence 2 = significance or what comes next
- A category label

Return JSON:
{
  "headlines": [
    {
      "headline": "Sharp headline here",
      "summary": "Core fact sentence. Significance sentence.",
      "category": "World|Business|Tech|Science|Politics|Health"
    }
  ]
}`;

  const completion = await generateWithRetry((client) => client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.45,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  }));

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No digest response from Groq');

  const parsed = JSON.parse(response);
  return {
    headlines: Array.isArray(parsed.headlines) ? parsed.headlines : [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Q&A — Grounded in article content
// ─────────────────────────────────────────────────────────────────────────────
export async function answerQuestion(
  question: string,
  articleBody: string,
  articleHeadline: string
): Promise<string> {
  const prompt = `You are an assistant helping a reader understand a specific news article. Answer using ONLY information explicitly present in the article. If the article lacks enough information, say so honestly.

ARTICLE: "${articleHeadline}"
---
${articleBody.slice(0, 3000)}
---

READER'S QUESTION: ${question}

Answer concisely (2-4 sentences). Do not invent facts. Do not cite sources not in the article.`;

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 400,
  });

  return (
    completion.choices[0]?.message?.content ||
    'Unable to generate an answer at this time.'
  );
}
