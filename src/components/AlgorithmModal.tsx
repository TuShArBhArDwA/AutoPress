'use client';
import { useState } from 'react';

export default function AlgorithmModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] text-white rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 sm:p-8 space-y-8">
          
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Editorial Discovery Engine</h2>
              <p className="text-sm text-gray-400 font-mono uppercase tracking-widest">Version 2.4 · Pulse Core</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Logic 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <span className="text-xl">🔥</span>
                </div>
                <h3 className="font-bold text-lg">Velocity Scoring</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                The engine monitors 50+ wire sources per minute. "Hot" stories exhibit a 300% increase in coverage density over a 15-minute window compared to the 24-hour mean.
              </p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[85%]" />
              </div>
            </div>

            {/* Logic 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="font-bold text-lg">Niche Outliers</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our "Discovery Algorithm" specifically looks for significant stories starting in high-authority local sources that haven&apos;t yet hit global wires.
              </p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 w-[60%]" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-tighter text-gray-500">Integrations & Pipeline</h4>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Groq Llama 3.3 70B (Authorship)
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> NewsAPI International Wire
              </span>
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> ViralSnapshot™ Social Engine
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
