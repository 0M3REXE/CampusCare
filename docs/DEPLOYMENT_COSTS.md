# CampusCare – Deployment, Scaling, Ops, and Costs

## Environments
- dev, staging, prod with separate Supabase projects. Vercel environments (Preview/Prod).
- Feature flags via simple config table in Postgres.

## CI/CD
- GitHub Actions: lint, typecheck, tests, deploy to Vercel. DB migrations via Prisma/Drizzle to Supabase.

## Infrastructure
- Web/API: Vercel (Next.js API routes + Edge runtime where possible).
- Background: Supabase Edge Functions + cron.
- Data: Supabase Postgres + pgvector, Realtime, Storage.
- Observability: Vercel + Supabase logs; optional free Grafana Cloud later.

## Scaling
- Stateless by design; Vercel scales per request. Use SSE streaming for chat.
- pgvector indexes (ivfflat/hnsw). Batch embeddings to stay under rate limits.
- Realtime channels for presence/typing; avoid bespoke infra.
- Edge Functions for periodic tasks (media ETL, cleanup) to prevent cold path latency.

## SLOs
- Chat p95 latency < 2.0s (text) on free tiers; streaming tokens < 600ms typical.
- Risk alert delivery < 60s p95 via Edge Functions.

## Backups & DR
- Supabase daily backups (Free includes daily snapshots); consider Pro for PITR.

## Cost Estimation (rough, monthly)
- Vercel Hobby: $0 (within limits)
- Supabase Free: $0 (within limits)
- Gemini Free/credits: $0 (light usage)
- Email (Resend free/SMTP): $0
- YouTube API: $0
- Calendar APIs: $0

Upgrade triggers:
- If DB size > free tier or sustained connections high -> Supabase Pro ($25+)
- If traffic > Vercel Hobby -> Vercel Pro ($20+)
- If AI usage spikes -> Gemini paid per 1M tokens

Formulas:
- LLM cost ≈ tokens_per_msg * msgs_per_user * users_per_month * $/1M_tokens
- GPU throughput ≈ tokens/sec/GPU; match to peak concurrent sessions for capacity planning.
