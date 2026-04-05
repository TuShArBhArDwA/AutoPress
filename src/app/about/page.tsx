import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Methodology | AutoPress",
  description:
    "AutoPress is an AI-native news surface: real-time wire monitoring, rigorous significance scoring, and authoritative reported synthesis. No human bias.",
};

const PILLARS = [
  {
    number: "01",
    label: "Continuous Monitoring",
    title: "Real-time wire integration",
    description:
      "Our system monitors global wire services every 30 minutes, ingesting thousands of data points across politics, technology, and science. We prioritize source diversity to ensure a comprehensive view of breaking events.",
    tech: "Wire Data Ingestion · Global News Stream",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
    ),
  },
  {
    number: "02",
    label: "Trend Discovery",
    title: "Velocity & Analytics Engine",
    description:
      "Our system analyzes story momentum in real-time, identifying rising trends and 'niche outliers' across the wire. This mimics professional social-listening tools, ensuring AutoPress reports are always ahead of the cycle.",
    tech: "Momentum Analytics · Outlier Detection",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    number: "03",
    label: "Significance Scoring",
    title: "Editorial curation without bias",
    description:
      "Every headline is assessed for editorial weight. Our system prioritizes stories with high institutional impact, named sourcing, and verified factual grounding.",
    tech: "Heuristic Weighting · Significance Matrix",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    number: "04",
    label: "Deep Research",
    title: "Context windowing & synthesis",
    description:
      "A dedicated research pass analyzes chronological context and stakeholders. For social-native reporting, our engine also generates high-impact briefings (Viral Snapshots) for immediate distribution.",
    tech: "Context Synthesis · Viral Synthesis",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M11 8v3M11 14h.01" />
      </svg>
    ),
  },
  {
    number: "05",
    label: "Report Authoring",
    title: "The Editorial Engine",
    description:
      "Reports are generated using high-parameter synthesis models trained for journalistic neutrality. We enforce strict standards: the inverted pyramid and zero-filler prose.",
    tech: "70B Parameter Synthesis",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    number: "06",
    label: "Live Verification",
    title: "State & Transparency",
    description:
      "Final reports are published to our live index with verification scores. Every fact is cross-referenced against wire data to maintain the highest standard of accuracy.",
    tech: "Verification Grading · Live Indexing",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <header className="mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)", fontFamily: "monospace", letterSpacing: "0.06em" }}>
          EDITORIAL STANDARDS
        </div>
        <h1 className="font-serif font-bold mb-6 text-balance" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--foreground)", lineHeight: 1.1 }}>
          The Future of Automated News
        </h1>
        <p className="text-xl leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          AutoPress is not an AI experiment. It is a world-class editorial system designed to provide the depth and care of a legacy newsroom with the speed and scale of a global wire service.
        </p>
      </header>

      <section className="mb-20">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-10 pb-2" style={{ color: "var(--foreground-dim)", borderBottom: "1px solid var(--border)" }}>
          The Editorial Methodology
        </h2>

        <div className="space-y-12">
          {PILLARS.map((pillar, i) => (
            <div key={pillar.number} className="grid sm:grid-cols-[auto_1fr] gap-8 py-4">
              <div className="flex sm:flex-col items-start gap-4 sm:w-32">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
                  {pillar.icon}
                </div>
                <span className="block text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "var(--accent)", fontFamily: "monospace" }}>
                  {pillar.number} · {pillar.label}
                </span>
              </div>
              <div className="max-w-2xl">
                <h3 className="font-serif text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>
                  {pillar.title}
                </h3>
                <p className="leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
                  {pillar.description}
                </p>
                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground-dim)", fontFamily: "monospace" }}>
                  STANDARD: {pillar.tech.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-12 mb-20">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-6" style={{ color: "var(--foreground)" }}>
            Our Editorial Standards
          </h3>
          <ul className="space-y-6">
            {[
              { l: "Factual Grounding", d: "Reports are strictly derived from source wire data. Hallucination is actively mitigated through grounding loops." },
              { l: "Byline Accountability", d: "Every article carries a verification status and linked citations to original reportage." },
              { l: "Zero Bias", d: "Our algorithms are designed for neutral synthesis, removing the stylistic leanings often found in legacy media." }
            ].map(s => (
              <li key={s.l}>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{s.l}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{s.d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-8 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--accent-border)" }}>
          <h3 className="font-serif text-xl font-bold mb-4" style={{ color: "var(--accent)" }}>
            A Note on Machine Authorship
          </h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground-muted)" }}>
            While AutoPress uses state-of-the-art Large Language Models for synthesis, our primary objective is the preservation of journalistic integrity. 
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-dim)" }}>
            Machines do not have bias, but they can be imprecise. We provide verification bars on every report to ensure the reader is always informed of the grounding level of the text.
          </p>
        </div>
      </section>

      <div className="flex items-center gap-6 pt-10" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-transform hover:scale-[1.02]" style={{ background: "var(--accent)", color: "var(--background)" }}>
          Enter Newsroom
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link href="/digest" className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
          View Today&apos;s Briefing →
        </Link>
      </div>
    </div>
  );
}
