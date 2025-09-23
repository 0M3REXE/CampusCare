# CampusCare – System Architecture

## Overview
CampusCare is a privacy-first, AI-driven mental health platform for higher-ed students. It provides 24/7 conversational support, peer networking, a wellness media hub, early risk detection, and anonymized institutional insights.

This document describes the production-ready architecture, data flows, integrations, and non-functional characteristics (security, reliability, scalability, observability).

This edition is optimized for “almost free” operation:
- Hosting: Vercel Hobby for web and API routes (Edge/Node runtime)
- Backend platform: Supabase Free tier for Postgres + pgvector, Auth, Realtime, Storage, and Edge Functions (cron + webhooks)
- AI: Google Gemini API (Gemini 1.5 Flash for chat, Text Embeddings 004 for embeddings) via free tier/credits
- Voice: Browser Web Speech API for STT/TTS; optional Vapi as a paid upgrade

## High-level architecture (Mermaid)
```mermaid
flowchart LR
  subgraph Client
    W[Web App (Next.js on Vercel)]
    M[Mobile App (React Native - optional)]
    Vapi[Vapi Voice (optional upgrade)]
    WebSpeech[Browser Web Speech API]
  end

  subgraph Edge
    VEdge[Vercel Edge/Node Runtime]
  end

  subgraph Core (Serverless)
    BFF[Next.js API Routes (BFF)]
    Chat[Chat/LLM Orchestrator]
    Embed[Embeddings & Matching]
    Risk[Risk Classifier (Gemini + Rules)]
    Media[Media Hub]
    Sched[Scheduling Adapter]
    Analytics[Insights/Reports]
  end

  subgraph Supabase (Free Tier)
    PG[(Postgres + pgvector)]
    Auth[Auth]
    RT[Realtime (WS/Presence)]
    Storage[Storage]
    EdgeFx[Edge Functions + Cron]
  end

  subgraph External APIs
    Gemini[Google Gemini API]
    YT[YouTube Data API]
    Cal[Google/Outlook Calendar]
    Email[Transactional Email (Resend/SMTP)]
  end

  W -->|HTTPS| VEdge --> BFF
  WebSpeech -.voice STT/TTS.-> W
  Vapi -->|Webhook/WS| BFF
  W -->|WS| RT

  BFF --> Chat
  BFF --> Media
  BFF --> Sched
  BFF --> Analytics
  BFF --> Auth
  Chat <--> Embed
  Chat --> Risk

  Chat --> PG
  Embed --> PG
  Risk --> PG
  Media --> PG
  Sched --> PG
  Analytics --> PG

  Chat --> Gemini
  Embed --> Gemini
  Media --> YT
  Sched --> Cal
  EdgeFx --> Email
  EdgeFx <--> PG
  EdgeFx <--> RT
```

## Key components
- Next.js web app: SSR/ISR for marketing/admin; SPA areas for chat/matchmaking. Realtime via Supabase Realtime channels.
- BFF on Vercel: Next.js API routes handle REST and streaming (SSE) for chat.
- Chat/LLM Orchestrator: Uses Gemini 1.5 Flash for low-cost chat; multilingual via prompts; private mode supported.
- Embeddings & Matching: Text Embeddings 004 (Gemini) stored in pgvector; cosine similarity queries in Postgres; optional simple clustering.
- Risk Engine: Prompt-based risk classification (Gemini) + lightweight rules; thresholds and human-in-the-loop. No separate GPU servers.
- Media Hub: YouTube ingestion (free quotas), subtitles; optional AI-generated content deferred to paid phase.
- Scheduling: Google/Outlook Calendar APIs via OAuth. Email confirmations via Resend/SMTP free tiers.
- Analytics & Insights: anonymized aggregation views in Postgres; served to admin pages.
- Supabase Edge Functions: background jobs (nightly recs, alert fanout, cleanup); scheduled via Supabase cron.
- Supabase stack: Auth, Realtime (presence, invites), Storage for assets, Postgres + pgvector with RLS.
- Observability: Vercel logs + Supabase logs; optional free Grafana Cloud (basic) later.

## Data flows (selected)
1) Student chat (text/voice):
- Client -> BFF (AuthZ) -> Chat Orchestrator -> Gemini. Messages stored in `messages`; embeddings via Gemini and saved to `message_embeddings`. Risk check runs sync (prompt) and async (Edge Function). High-risk inserts `alerts` row; Edge Function emails counselor inbox.

2) Peer match:
- Profile update -> BFF calls Gemini embeddings -> store in `profile_embeddings`. Matching query uses `pgvector` (ivfflat/hnsw) with filters (cohort/lang). Presence and invites via Supabase Realtime.

3) Media recs:
- Daily ETL from YouTube via Edge Function; embeddings for titles/descriptions via Gemini. Personalized recs via hybrid: implicit feedback + content similarity. All in Postgres.

4) Escalation & booking:
- Edge Function watches `alerts` table; for critical, email counselor group and generate booking link (Calendar API). Student confirms; Edge Function creates event and sends email reminders (no SMS by default to avoid cost).

## Non-functional
- Privacy-first: private chat (no logging beyond metadata), RLS isolation, consent-driven data collection, encryption at rest/transit.
- Scalability: serverless scale on Vercel + Supabase; pgvector indexes; background processing via Edge Functions + cron.
- Reliability: idempotent handlers, simple retry in Edge Functions; circuit breakers around Gemini; health checks via status route.
- Compliance: FERPA/GDPR-aligned. Free-tier vendors may not offer BAA; avoid PHI.
