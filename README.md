# Bluum
### Private market intelligence for everyone — not just the top 1% of firms

---

## The Problem

Private market research has always been gated behind billion-dollar institutions. Bloomberg terminals cost $24,000 per year. Investment banks charge six-figure retainers. Proprietary deal networks are built on relationships that take decades to form.

The result: retail traders, independent advisors, boutique M&A firms, and small family offices make high-stakes decisions with a fraction of the information available to the institutions they compete against. Talent is universal. Access isn't.

**Bluum changes that.**

---

## Track

**Track 3: Economic Empowerment & Education**

Bluum directly addresses the information asymmetry in private markets — one of the most consequential and least discussed forms of economic gatekeeping. By giving small firms and retail traders access to institutional-grade M&A intelligence, we empower informed decision-making where it has historically been impossible.

---

## What Bluum Does

Bluum is an AI-powered private market research platform that generates deep, structured intelligence on any private company or sector. It operates in two modes — one for live research, one for deep personal intelligence — powered by a multi-agent AI system, a proprietary corpus of SEC filings, and the user's own deal history.

---

## Mode 1 — Research

*"Research any private company or sector in seconds"*

The user types a company name, sector, or deal thesis. A multi-agent AI system fires in parallel, each agent focused on one dimension of the research:

| Agent | Output |
|---|---|
| **Overview Agent** | Company summary, sector positioning, founding story, key people |
| **M&A Activity Agent** | Announced deals, PE-backed exits, rumoured transactions, deal rationale |
| **Target Scanner Agent** | Ranked list of private acquisition targets with scoring and rationale |
| **Risk & Tailwinds Agent** | Macro risks, regulatory headwinds, growth drivers, sector dynamics |
| **Buyer Landscape Agent** | Active PE firms and strategic acquirers in the space |

Each agent uses live web search to pull current, real-world data. Results render progressively — the tearsheet fills in section by section as each agent completes, so users see value immediately.

Every tearsheet is saved to the user's personal corpus and explained in plain English with inline jargon definitions — so a first-time independent advisor gets the same clarity as a seasoned analyst.

---

## Mode 2 — Intelligence

*"Your personal private market brain"*

Intelligence mode is where Bluum becomes truly personal. It is a queryable layer over everything the user has researched, uploaded, and collected — plus a proprietary corpus of real M&A transaction data from SEC EDGAR DEF14A merger proxy filings.

### What powers it

| Data source | What it contains |
|---|---|
| **Research memory** | Every tearsheet the user has generated in Mode 1 |
| **DEF14A filings corpus** | 3,000+ real M&A transactions — deal rationale, target descriptions, merger consideration, acquirer identity |
| **User uploads** | CIMs, teasers, management presentations, deal memos |

### What users can do

- *"What EBITDA multiples have been paid for B2B SaaS businesses under $100m?"* → real numbers from precedent transactions
- *"Find private companies similar to this CIM I just uploaded"* → semantic search over the corpus
- *"Which PE firms have been most active in healthcare IT acquisitions since 2018?"* → pattern mining over filings
- *"What deal rationale keeps appearing in Nordic fintech exits?"* → synthesis across hundreds of transactions
- *"Show me everything I've researched in the industrials sector"* → personal memory search

Intelligence mode doesn't generate — it retrieves, compares, and surfaces hard numbers from real transactions. It is the difference between an AI making things up and an AI that knows what actually happened in the market.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite), TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Auth + DB | Supabase (auth, user profiles, research history) |
| Multi-agent LLM | Anthropic API (Claude) with web search tool |
| Embedding model | bge-base-en fine-tuned on DEF14A contrastive pairs |
| Vector store | ChromaDB |
| RAG inference | Mistral 7B (4-bit quantized, local) |
| Data source | SEC EDGAR DEF14A merger proxy filings |

---

## Data Schema

```
users           — id, email, full_name, organisation, role, created_at
researches      — id, user_id, query, enriched_query, status, created_at
sections        — id, research_id, section_name, content (jsonb), created_at
tearsheets      — id, research_id, user_id, title, saved_at
```

---

## Ethical Commitments

Bluum is built for people who have historically been locked out of private market intelligence. We take that responsibility seriously.

| Risk | How Bluum addresses it |
|---|---|
| **Tech exclusion** | Mobile-first, low-bandwidth friendly, no unnecessary complexity |
| **Bad advice impact** | Every output shows its source — Bluum surfaces information, never makes decisions for the user |
| **Jargon barriers** | Plain English mode toggles all output from analyst language to accessible explanations |
| **Cultural assumptions** | Users define their own investment criteria — the tool does not impose a single definition of success |
| **Language barriers** | Multilingual tearsheet output — research in English, read in your language |
| **Data transparency** | Confidence indicators on every data point so users know what to trust and what to verify |

---

## The Vision

The institutions that dominate private markets didn't get there because they were smarter. They got there because they had more information, earlier, and better organised. Bluum gives that same advantage to anyone with an internet connection and a deal to find.

> *Institutional-grade private market intelligence. For the rest of us.*
