# CampusCare – Tech Stack per Feature

## Summary (near-zero-cost)
- Runtime: Node.js 20 LTS (TypeScript) on Vercel. No persistent servers.
- Frontend: Next.js 14 (App Router), TailwindCSS, Shadcn/UI, Zustand, Supabase Realtime client.
- Mobile (optional): React Native + Expo using Supabase JS client.
- Auth & Data: Supabase (Postgres 15 + pgvector, Auth, Storage, Realtime, Edge Functions).
- Jobs/Background: Supabase Edge Functions + cron; Postgres triggers + NOTIFY.
- Observability: Vercel logs + Supabase logs; basic OTel optional.

## 1) AI-Driven Mental Health Support
- LLM: Google Gemini 1.5 Flash (chat, tools), Text Embeddings 004 (embeddings).
- Orchestration: simple router in Next.js API; optional LangChainJS for tool calls.
- Voice: Browser Web Speech API for STT/TTS; Vapi optional (paid) for phone.
- Multilingual: handled by Gemini prompts; optional translation with Google Translate free tier.
- Privacy: Private mode toggles DB persistence off for message content.
- Escalation: Insert into `alerts`; Supabase Edge Function emails counselor.

## 2) Peer Socialization & Networking
- Embeddings: Gemini Text Embeddings 004; stored in pgvector.
- Matching: cosine similarity with ivfflat/hnsw indexes; filters in SQL.
- Real-time: Supabase Realtime channels for presence, invites, chat.
- Profiles: Supabase Auth + RLS; avatars in Supabase Storage.

## 3) Wellness Media Hub
- Ingestion: YouTube Data API v3 (free quota); store metadata in Postgres, files in Supabase Storage if needed.
- AI-generated: defer to paid phase; optionally captions via YouTube.
- Recs: hybrid CF + content similarity using pgvector and SQL.
- Accessibility: subtitles and auto-translate with free tools where possible.

## 4) Early Risk Detection
- Models: Gemini prompt-based classification for risk levels; optional lightweight client-side sentiment for hints.
- Pipeline: On message, compute risk via Gemini; store score; Edge Function triggers alerts for high risk.
- Automation: Supabase Edge Functions + Database triggers; no external workflow engine.
- Booking: Google Calendar/Outlook via minimal OAuth scopes; prefer email-based confirmations to avoid SMS costs.

## 5) Institutional Insights Dashboard
- Stack: Next.js admin pages; SQL views for aggregates; optional free Metabase on Render/Fly later.
- Metrics: stress index, engagement, referral acceptance, languages.
- Privacy: k-anonymity thresholds; DP noise optional in SQL views.
