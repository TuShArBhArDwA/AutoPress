# High-Level Design (HLD) — AutoPress

AutoPress is an AI-native news surface designed for zero-human-intervention reporting. This document outlines the architectural strategy for scaling automated journalism without sacrificing editorial depth.

## 1. System Overview

AutoPress operates on a **Pull-Based Editorial Model**. The system actively monitors global wire services, and runs a proactive background pipeline to synthesize 700+ word reports, storing them in memory so the frontend surface is entirely disconnected from inference latency.

## 2. Core Components

### A. The Editorial Pipeline
- **Wire Ingestion**: Integration with the NewsAPI stream to monitor 50+ global headlines every 30 minutes.
- **Trend Discovery & Velocity Engine**: A custom analytical layer that mimics professional trend-tracking tools (like Virlo). It identifies:
    - **Hot**: High-volume, immediate breaking news.
    - **Rising**: Rapidly gaining coverage across multiple sources.
    - **Outliers**: Niche significance stories that other outlets might miss.
- **Significance Scoring**: 8B-parameter Groq models filter the wire for institutional weight and factual density.

### B. The Synthesis Engine
- **Report Authoring**: Utilizes a Two-Pass architecture with Llama 3.1 8B (`llama-3.1-8b-instant`). Pass 1 extracts heavily structured JSON metadata; Pass 2 authors a fluid 700-word markdown report using the **Inverted Pyramid** journalistic standard.
- **Viral Snapshot (Social Briefing)**: Every report is automatically synthesized into a 3-point high-impact "Social Briefing" optimized for short-form video (TikTok/Reels).

### C. The Frontend Surface
- **Aesthetic**: A premium "near-black" high-contrast design using a serif-heavy typography system (Playfair Display) to instill trust and authority.
- **Reading Experience**: Includes interactive "Query This Report" (Q&A) panels grounded strictly in the article's source context.

## 3. Data Flow
1. **Fetch**: Raw wire data is ingested.
2. **Analyze**: Momentum and Significance are calculated.
3. **Select**: Top indices are sent to the Synthesis Engine.
4. **Draft**: 700-word reports + social briefs are authored.
5. **Publish**: Articles are written to an in-memory datastore and file-based `.cache` for instant client-side retrieval via SWR (Stale-While-Revalidate).

## 4. Key Integrations
- **AI Engine**: Groq SDK (`llama-3.1-8b-instant`).
- **Data Source**: NewsAPI (Live Wire).
- **Frontend**: Next.js 14 (App Router) + Vanilla CSS.
