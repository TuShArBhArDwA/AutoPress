'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface QAProps {
  articleId: string;
  articleSlug: string;
}

export default function QAPanel({ articleId, articleSlug }: QAProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, slug: articleSlug }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.answer || 'No answer available.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Unable to answer right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTED = [
    'What are the key implications of this story?',
    'Who are the main stakeholders involved?',
    'What happens next?',
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors"
        style={{ background: open ? 'var(--surface-hover)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Query this report
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              Editorial context search · Verification grounded
            </p>
          </div>
        </div>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--foreground-dim)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="p-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Suggested questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-1">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Message history */}
          {messages.length > 0 && (
            <div 
              ref={scrollContainerRef}
              className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'chat-bubble-user self-end' : 'chat-bubble-ai self-start'}>
                  {m.role === 'ai' && (
                    <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--accent)' }}>AutoPress Editorial</p>
                  )}
                  <p style={{ color: m.role === 'user' ? 'var(--foreground)' : 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {m.content}
                  </p>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble-ai self-start">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: 'var(--accent)',
                          animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleAsk} className="flex gap-2 mt-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query report context..."
              className="flex-1 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1"
              style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--background)' }}
            >
              Query
            </button>
          </form>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>
            Queries are answered by our automated editorial system using strictly grounded context from the report above. 
            Verification levels are assessed in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
