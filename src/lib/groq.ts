import Groq from 'groq-sdk';

const API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getGroqClient(): Groq {
  const key = API_KEYS[currentKeyIndex];
  return new Groq({ apiKey: key });
}

export function rotateApiKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`[Groq] Rotated to key index ${currentKeyIndex}`);
}

export async function generateWithRetry<T>(
  fn: (client: Groq) => Promise<T>,
  maxRetries: number = API_KEYS.length * 2
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
      
      console.warn(`[Groq] Attempt ${attempt + 1} failed ${isRateLimit ? '(Rate Limit)' : ''}:`, error?.message || error);

      if (isRateLimit || isServerError) {
        rotateApiKey();
        // Exponential backoff + jitter (500ms - 2000ms extra)
        const jitter = Math.random() * 1500 + 500;
        const baseBackoff = Math.min(1000 * Math.pow(2, attempt), 10000);
        const backoff = baseBackoff + jitter;
        
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      // For other errors (auth, bad request), still rotate and try
      if (attempt < maxRetries - 1) {
        rotateApiKey();
        await new Promise((r) => setTimeout(r, 1000 + (Math.random() * 1000)));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('All API key attempts failed');
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1: Story Analysis (fast model — 8B for speed)
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeStory(
  headline: string,
  description: string,
  relatedHeadlines: string[]
): Promise<{
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
}> {
  const prompt = `You are a senior news editor at a prestigious international publication. Analyze this story and return a deep editorial assessment.

HEADLINE: ${headline}
DESCRIPTION: ${description}
RELATED COVERAGE: ${relatedHeadlines.slice(0, 3).join(' | ')}

Return a JSON object with EXACTLY these fields:
{
  "angle": "The single most important, non-obvious editorial angle — what most reporters would miss",
  "context": "2-3 sentences of essential historical or structural context that makes this story intelligible",
  "stakeholders": ["specific named entity 1", "specific named entity 2", "specific named entity 3"],
  "keyQuestions": ["most pressing unanswered question", "second question", "third question"],
  "talkingPoints": ["concrete fact or data point", "concrete fact or data point", "concrete fact or data point"],
  "timeline": [
    {"date": "Month Year or 'Today'", "event": "what happened"},
    {"date": "...", "event": "..."}
  ],
  "impact": "local OR national OR global",
  "editorialPriority": "breaking OR developing OR analysis OR feature",
  "confidenceScore": 0.7
}

Rules:
- stakeholders must be REAL named entities (people, organizations, governments), not generic categories
- timeline must have 2-4 entries establishing chronological context
- confidenceScore is 0.0-1.0 reflecting how much factual grounding is available in the source
- editorialPriority: "breaking" = happening now with major consequence; "developing" = ongoing story; "analysis" = requires context to understand; "feature" = interesting but not urgent`;

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.4,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No analysis response from Groq');

  const parsed = JSON.parse(response);

  return {
    angle: parsed.angle || '',
    context: parsed.context || '',
    stakeholders: Array.isArray(parsed.stakeholders) ? parsed.stakeholders : [],
    keyQuestions: Array.isArray(parsed.keyQuestions) ? parsed.keyQuestions : [],
    talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
    timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
    impact: ['local', 'national', 'global'].includes(parsed.impact) ? parsed.impact : 'national',
    editorialPriority: ['breaking', 'developing', 'analysis', 'feature'].includes(parsed.editorialPriority)
      ? parsed.editorialPriority
      : 'feature',
    trendVelocity: ['steady', 'rising', 'hot', 'outlier'].includes(parsed.trendVelocity)
      ? parsed.trendVelocity
      : 'steady',
    confidenceScore: typeof parsed.confidenceScore === 'number' ? Math.min(1, Math.max(0, parsed.confidenceScore)) : 0.6,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2: Full Article Generation (70B model for prose quality)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateArticle(
  headline: string,
  description: string,
  analysis: {
    angle: string;
    context: string;
    stakeholders: string[];
    keyQuestions: string[];
    talkingPoints: string[];
    timeline: { date: string; event: string }[];
    impact: string;
    editorialPriority: string;
    confidenceScore: number;
  },
  relatedHeadlines: { title: string; source: string }[]
): Promise<{
  headline: string;
  subheadline: string;
  body: string;
  keyPoints: string[];
  readTime: number;
  tags: string[];
  pullQuote: string;
  wordCount: number;
  viralSnapshot: string[];
}> {
  const sourceList = relatedHeadlines.map((h) => `• "${h.title}" — ${h.source}`).join('\n');

  const prompt = `You are a senior staff correspondent at AutoPress, a rigorous international news publication with the editorial standards of Reuters and The Atlantic. Your pieces run 700-900 words and appear under your own name. You have a reputation for clarity, precision, and contextual depth.

Write a complete, publication-ready news report on the following story.

━━━ STORY BRIEF ━━━
Original headline: ${headline}
Original description: ${description}

━━━ EDITORIAL BRIEF FROM EDITOR ━━━
Angle to pursue: ${analysis.angle || 'Standard editorial reporting'}
Essential context: ${analysis.context || 'General background knowledge'}
Key stakeholders: ${(analysis.stakeholders || []).join(', ')}
Questions to address: ${(analysis.keyQuestions || []).join(' | ')}
Facts to work in: ${(analysis.talkingPoints || []).join(' | ')}

━━━ RELATED COVERAGE FROM THE WIRE ━━━
${sourceList}

━━━ WRITING REQUIREMENTS ━━━
1. LEDE (first paragraph, ~60 words): Must answer who, what, when, where in the first two sentences. Use an active, authoritative voice. Most critical fact comes first — inverted pyramid.
2. SYSTEMIC CONTEXT (paragraph 2, ~100 words): Historical background and structural causes. What makes this significant beyond the immediate headline?
3. STAKEHOLDER CONFLICT (paragraphs 3-5, ~400 words total): Develop the story through the lens of tension. Quote or paraphrase specific named stakeholders. Show competing interests or unanswered questions.
4. MACRO IMPLICATIONS (paragraph 6, ~120 words): Global or national ripple effects. Who is watching? What are the long-term stakes?
5. CLOSING (paragraph 7, ~60 words): A sharp, concrete detail that anchors the story's gravity — not a summary.

━━━ ABSOLUTE PROHIBITIONS ━━━
Never write: "in conclusion", "it is important to note", "it is worth noting", "it should be noted", "this article will explore", "as we can see", "shed light on", "in today's world", "at the time of writing", "a beacon of hope", "tapestry of", "paving the way"
Never start a paragraph with "Additionally", "Furthermore", or "Moreover"
Never use passive voice for the lede or key observations
Never editorialize with adjectives; let the reported facts establish the magnitude

━━━ OUTPUT FORMAT ━━━
Return JSON:
{
  "headline": "Publication-quality headline. Verb-driven, specific, under 12 words.",
  "subheadline": "One sentence (20-30 words) capturing the story's key tension or stakes.",
  "body": "Full article body — paragraphs separated by \\n\\n. No section headers. 700-900 words.",
  "keyPoints": ["Specific takeaway with a fact or name", "Second takeaway", "Third takeaway", "Fourth takeaway"],
  "readTime": 5,
  "tags": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "pullQuote": "The single most quotable sentence from the body — something a reader would screenshot. Must be verbatim from the body.",
  "viralSnapshot": ["Short-form hook (~10 words)", "Shocking or critical middle fact (~15 words)", "Calculated closing insight (~10 words)"]
}
  
Rules for viralSnapshot: 
- Professional but high-impact. No hashtags. No emojis. 
- Must sound like a professional anchor speaking a 15-second TikTok script.`;

  // Use 70B for "Global Newsroom" quality (proactive); 8B is fallback for JIT speed
  const WRITE_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  let completion;
  for (const model of WRITE_MODELS) {
    try {
      completion = await getGroqClient().chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature: 0.55,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });
      console.log(`[Groq] Article written with model: ${model}`);
      break;
    } catch (err: any) {
      const isTPD = err?.message?.includes('tokens per day') || err?.message?.includes('TPD');
      if (isTPD && model !== WRITE_MODELS[WRITE_MODELS.length - 1]) {
        console.warn(`[Groq] ${model} TPD exhausted, falling back to next model...`);
        rotateApiKey();
        continue;
      }
      throw err;
    }
  }
  if (!completion) throw new Error('All models failed');

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('No article response from Groq');

  const parsed = JSON.parse(response);
  const body = parsed.body || '';
  const wordCount = body.trim().split(/\s+/).length;

  return {
    headline: parsed.headline || headline,
    subheadline: parsed.subheadline || '',
    body,
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    readTime: typeof parsed.readTime === 'number' ? parsed.readTime : Math.max(4, Math.ceil(wordCount / 200)),
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    pullQuote: parsed.pullQuote || '',
    wordCount,
    viralSnapshot: Array.isArray(parsed.viralSnapshot) ? parsed.viralSnapshot : [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Digest Generation
// ─────────────────────────────────────────────────────────────────────────────
export async function generateDigest(
  headlines: { title: string; source: string; description: string }[]
): Promise<{
  headlines: { headline: string; summary: string; category: string }[];
}> {
  const newsList = headlines
    .slice(0, 10)
    .map((h, i) => `${i + 1}. ${h.title} (${h.source}): ${h.description}`)
    .join('\n');

  const prompt = `You are a senior editor writing the morning briefing for a demanding, intelligent audience. Each item should give a reader everything they need to understand a story in 30 seconds — no hedging, no filler.

TODAY'S STORIES:
${newsList}

Create a 5-7 item morning digest. Each item must have:
- A crisp, verb-driven headline (under 10 words)
- A 2-sentence summary: sentence 1 = the core fact, sentence 2 = the significance or what comes next
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

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.45,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

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
  const prompt = `You are an assistant helping a reader understand a specific news article. Answer the reader's question using ONLY information that is explicitly present in the article below. If the article does not contain enough information to fully answer the question, say so honestly and explain what is known.

ARTICLE: "${articleHeadline}"
---
${articleBody}
---

READER'S QUESTION: ${question}

Answer concisely (2-4 sentences). Do not invent facts. Do not cite sources not in the article. If the question is outside the scope of this article, say: "This article does not cover that directly, but based on what is reported here..."`;

  const completion = await getGroqClient().chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate an answer at this time.';
}
