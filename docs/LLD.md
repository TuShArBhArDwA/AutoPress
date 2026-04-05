# Low-Level Design (LLD) — AutoPress

This document provides a detailed technical breakdown of the AutoPress AI Editorial Engine.

## 1. Editorial Pipeline (`src/lib/pipeline.ts`)

The pipeline follows a sequential processing model to maintain stability under daily token limits (TPD).

### A. Sequential Flow
1. **Fetching**: Calls NewsAPI to retrieve Top Headlines for the `us` market.
2. **Analysis**: Uses the `llama-3.1-8b-instant` model on Groq to evaluate the significance and momentum of each headline.
3. **Background Execution**: Runs completely asynchronously on `forceRefresh()` triggers, storing partial arrays in-memory to prevent frontend blocks.
4. **Resilience**: Implements a `generateWithRetry` wrapper to combat Groq rate limits, automatically pacing 429 errors using exponential backoff.

### B. Discovery Engine
- **Velocity Scoring**: Each article is assigned a `trendVelocity` (`hot`, `rising`, `steady`, or `outlier`).
- **Niche Detection**: Analysis identifies headlines that are unique or structurally different from common wire reports.

## 2. Synthesis Engine (`src/lib/groq.ts`)

The synthesis phase leverages high-parameter models for deep reporting.

### A. Two-Pass Architecture (Llama 3.1 8B)
- **Pass 1 (JSON Metadata)**: Executes a heavily constrained response_format extraction to pull key Questions, Angles, and Timelines without breaking free-tier limits.
- **Pass 2 (Narrative)**: Drops JSON constraints and authors a 700-word paragraph-delimited report. Converts raw `\n` to valid arrays on the frontend.

### B. Input Contextualization
The synthesis prompt is injected with:
- **Angle**: A non-obvious editorial perspective.
- **Context**: Historical/structural background.
- **Stakeholders**: Named entities for verbatim reference.
- **Viral Snapshot**: A 3-point high-impact transcript optimized for social distribution.

### C. Prompt Standards
- **Inverted Pyramid**: The lede must contain Who, What, When, Where.
- **Verbatim Citations**: Quotes are taken directly from the wire coverage to ensure grounding.
- **Prohibited Phrases**: AI-typical filler like "it's important to note" or "furthermore" are strictly banned.

## 3. UI Components

### A. Reading Progress (`src/components/ReadingProgress.tsx`)
A client-side scroll listener that renders a persistent progress bar at the top of long-form reports.

### B. Q&A Panel (`src/components/QAPanel.tsx`)
A client-side chat interface that uses article-specific context to answer reader queries. It uses a refined scroll-management system to ensure page stability during interaction.

### C. SafeImage (`src/components/SafeImage.tsx`)
A Next.js wrapped image component that handles broken wire URLs gracefully, falling back to a clean placeholder UI without triggering Next.js server-component errors.
