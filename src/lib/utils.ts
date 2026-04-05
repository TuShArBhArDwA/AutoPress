import { GeneratedArticle } from '@/types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    world: 'bg-blue-950 text-blue-300 border border-blue-800',
    politics: 'bg-red-950 text-red-300 border border-red-800',
    business: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
    tech: 'bg-violet-950 text-violet-300 border border-violet-800',
    science: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
    health: 'bg-green-950 text-green-300 border border-green-800',
    entertainment: 'bg-pink-950 text-pink-300 border border-pink-800',
    sports: 'bg-orange-950 text-orange-300 border border-orange-800',
    general: 'bg-slate-900 text-slate-300 border border-slate-700',
  };
  return colors[category.toLowerCase()] || 'bg-slate-900 text-slate-300 border border-slate-700';
}

export function getPriorityBadge(priority: string): { label: string; className: string } {
  switch (priority) {
    case 'breaking':
      return { label: 'BREAKING', className: 'bg-red-600 text-white animate-pulse' };
    case 'developing':
      return { label: 'DEVELOPING', className: 'bg-amber-600 text-white' };
    case 'analysis':
      return { label: 'ANALYSIS', className: 'bg-violet-700 text-white' };
    case 'feature':
      return { label: 'FEATURE', className: 'bg-slate-700 text-slate-200' };
    default:
      return { label: 'REPORT', className: 'bg-slate-700 text-slate-200' };
  }
}
export function getVelocityBadge(velocity: string): { label: string; className: string; icon: string } {
  switch (velocity) {
    case 'hot':
      return { label: 'HOT', className: 'bg-orange-600/20 text-orange-400 border-orange-500/30', icon: '🔥' };
    case 'rising':
      return { label: 'RISING', className: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30', icon: '📈' };
    case 'outlier':
      return { label: 'OUTLIER', className: 'bg-violet-600/20 text-violet-400 border-violet-500/30', icon: '✨' };
    case 'steady':
    default:
      return { label: 'STEADY', className: 'bg-slate-800/20 text-slate-400 border-slate-700/30', icon: '📊' };
  }
}
export function getImpactLabel(impact: string): string {
  switch (impact) {
    case 'global':
      return '🌐 Global';
    case 'national':
      return '🏛 National';
    case 'local':
      return '📍 Local';
    default:
      return 'Report';
  }
}

export function formatByline(article: GeneratedArticle): string {
  return `By AutoPress AI · ${formatFullDate(article.generatedAt)} · ${article.readTime} min read`;
}

export function getReadTimeText(readTime: number): string {
  return `${readTime} min read`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getBodyParagraphs(body: string): string[] {
  return body.split('\n\n').filter((p) => p.trim().length > 0);
}

export function sortArticlesByDate(articles: GeneratedArticle[]): GeneratedArticle[] {
  return [...articles].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

export function getEditionLabel(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning Edition';
  if (hour < 17) return 'Afternoon Edition';
  return 'Evening Edition';
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}
