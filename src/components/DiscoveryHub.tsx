'use client';
import { useState } from 'react';
import Link from 'next/link';
import { GeneratedArticle } from '@/types';
import AlgorithmModal from './AlgorithmModal';

export default function DiscoveryHub({ articles }: { articles: GeneratedArticle[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hotCount = articles.filter(a => a.trendVelocity === 'hot').length;
  const risingCount = articles.filter(a => a.trendVelocity === 'rising').length;
  const outlier = articles.find(a => a.trendVelocity === 'outlier');

  return (
    <>
      <div className="glass-panel p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--accent)" }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
            Newsroom Intelligence
          </h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-auto p-1.5 hover:bg-black/5 rounded-full transition-colors group"
            title="Algorithm Disclosure"
          >
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 shadow-sm">
            <div className="text-[0.6rem] font-bold text-orange-600 mb-1 uppercase tracking-tighter">Velocity: Hot</div>
            <div className="text-xl font-serif font-bold text-orange-950">{hotCount}</div>
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
            <div className="text-[0.6rem] font-bold text-emerald-600 mb-1 uppercase tracking-tighter">Velocity: Rising</div>
            <div className="text-xl font-serif font-bold text-emerald-950">{risingCount}</div>
          </div>
        </div>

        {outlier && (
          <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="text-xl">✨</span>
            </div>
            <div className="text-[0.6rem] font-bold text-violet-600 mb-1 uppercase tracking-tighter">Niche Outlier Found</div>
            <Link href={`/article/${outlier.slug}`}>
              <p className="text-xs font-bold leading-tight line-clamp-2 hover:underline text-violet-950 transition-colors">
                {outlier.headline}
              </p>
            </Link>
          </div>
        )}
      </div>

      <AlgorithmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
