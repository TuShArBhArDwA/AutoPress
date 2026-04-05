<h1 align="center">
  <img src="./src/app/icon.svg" width="80" height="80" alt="AutoPress Logo" />
  <br/>
  AutoPress
</h1>

<p align="center">
  <strong>The Future of Automated Journalism.</strong><br/>
  Monitor wires, discover trends, and synthesize high-fidelity reports using a professional AI-native editorial surface.
</p>

<p align="center">
  <a href="#what-it-does">What It Does</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#editorial-logic">Editorial Logic</a> •
  <a href="https://minianonlink.vercel.app/tusharbhardwaj">Connect</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js"/>
  <img alt="Groq" src="https://img.shields.io/badge/Groq-llama--3.3--70b-orange"/>
  <img alt="NewsAPI" src="https://img.shields.io/badge/NewsAPI-v2-blue?logo=rss"/>
  <img alt="Styling" src="https://img.shields.io/badge/Styling-Vanilla%20CSS-ff69b4"/>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow"/>
</p>

---

## What It Does

**AutoPress** is a fully automated AI-native news surface. It monitors global wire services and performs state-of-the-art synthesis to deliver high-authority reporting without human intervention.

| Output | Description |
|---|---|
| **Trend Discovery** | Real-time monitoring for **HOT**, **RISING**, or **OUTLIER** news |
| **In-Depth Reporting** | 700-word synthesized reports with historical context & stakeholders |
| **Viral Snapshots** | Automated 15-second high-impact social media briefings |
| **Newsroom Intel** | Sidebars explaining the "Why" behind momentum and velocity |
| **Smart Q&A** | Context-aware sidebar for deeper interrogation of AI reports |
| **Daily Digest** | A clean, high-velocity morning briefing for rapid coverage |

---

## Premium UI/UX Features

- **Editorial Light (Ink & Cream)**: A premium "Newsprint" aesthetic with high-contrast typography designed for trust and professional readability.
- **Proactive Background Pipeline**: High-performance architecture that authors deep reports asynchronously in the background. The homepage loads instantly with skeletons, polling the pipeline without blocking.
- **Newsprint Loading Skeletons**: High-fidelity shimmer animations maintain visual interest and visual hierarchy during real-time data discovery.
- **Discovery Intelligence Hub**: Interactive dashboard for monitoring story velocity and impact across various categories.
- **Mobile-Authority Design**: Responsive vanilla CSS that guarantees sharp, high-contrast reading layout on every device.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Editorial AI | [Groq API](https://groq.com) – `llama-3.1-8b-instant` (Two-Pass Generation) |
| News Data | [NewsAPI](https://newsapi.org) – International Wire Service |
| Persistence | File-based cache (.cache/articles.json) |
| Styling | Vanilla CSS (Editorial-Light System) |
| Icons | Lucide / Custom SVG Branding |

---

## Project Structure

```
AutoPress/
├── src/app/                 # Next.js App Router (Pages & Routes)
│   ├── article/[slug]/      # Client-side article viewer (SWR)
│   ├── digest/              # Morning briefing portal
│   └── layout.tsx           # Global branding & SEO metadata
├── src/components/          # Reusable UI (Skeletons, Cards, Modals)
├── src/lib/                 # Core logic (Groq rotation, Newsroom Pipeline)
├── docs/                    # Architecture documentation
│   ├── HLD.md               # High Level Design
│   └── LLD.md               # Low Level Design
├── .cache/                  # Local persistence for articles & highlights
├── .env.local               # Private API keys (Groq, NewsAPI)
├── LICENSE
└── README.md
```

---

## Architecture & Design Docs

| Document | Description |
|---|---|
| [High Level Design (HLD)](./docs/HLD.md) | System architecture, pipeline flow, and AI editorial strategy |
| [Low Level Design (LLD)](./docs/LLD.md) | Pipeline background worker, Two-pass LLM synthesis logic, and SWR data schema |

---

## Getting Started

### Prerequisites
- Node.js 18+
- [NewsAPI Key](https://newsapi.org/)
- [Groq API Key](https://console.groq.com/)

### 1. Clone & Install

```bash
git clone https://github.com/TuShArBhArDwA/AutoPress.git
cd AutoPress
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```bash
NEWS_API_KEY=your_news_api_key_here
GROQ_API_KEY=your_primary_groq_key
```

### 3. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Editorial Logic

1. **Discovery Pass**: Engine monitors wires for Story Density. Articles exceeding the momentum mean are marked as **Rising**.
2. **Authorship Pass**: Two-Pass generation via `llama-3.1-8b-instant` authors 700-word reports. Pass 1 extracts JSON metadata; Pass 2 writes the narrative.
3. **Verification**: Reports are assessed for factual grounding and source cross-referencing.
4. **Synthesis**: Final output includes Social briefings, Timelines, and Impact scores.

---

## Security & Reliability

- **Token Efficiency**: Tiered generation (Highlights vs. Full Reports) saves 90% of token budgets.
- **Isolated Pipeline**: Full architectural separation between data gathering and creative authorship.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Connect with me

If you’d like to connect or provide feedback, feel free to reach out — [Click here](https://minianonlink.vercel.app/tusharbhardwaj)


---

**[Try AutoPress](https://autoopress.vercel.app/)** | **[Submit Feedback](https://github.com/TuShArBhArDwA/AutoPress/issues)**
