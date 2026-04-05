export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface GeneratedArticle {
  id: string;
  slug: string;
  headline: string;
  subheadline: string;
  isFullReport: boolean; // true if the 700-word deep report is synthesized
  body?: string;
  keyPoints?: string[];
  readTime?: number;
  tags: string[];
  sourceStories: {
    title: string;
    source: string;
    url: string;
  }[];
  generatedAt: string;
  category: string;
  imageUrl: string | null;
  // Enhanced editorial fields
  editorialPriority: 'breaking' | 'developing' | 'analysis' | 'feature';
  timeline: { date: string; event: string }[];
  impact: 'local' | 'national' | 'global';
  pullQuote?: string;
  confidenceScore: number;
  wordCount?: number;
  // Trend Discovery & Viral Engine
  trendVelocity: 'steady' | 'rising' | 'hot' | 'outlier';
  viralSnapshot?: string[]; // 3-point high-impact transcript
  // Synthesis metadata (stored during discovery for JIT authorship)
  angle?: string;
  context?: string;
  stakeholders?: string[];
  keyQuestions?: string[];
  talkingPoints?: string[];
}

export interface DigestItem {
  id: string;
  headline: string;
  summary: string;
  category: string;
}

export interface PipelineStatus {
  status: 'idle' | 'fetching' | 'analyzing' | 'generating' | 'complete' | 'error';
  message: string;
  progress?: number;
  articlesGenerated?: number;
}
