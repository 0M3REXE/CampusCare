# CampusCare – Database Schema (Postgres + pgvector)

Note: Use Supabase for hosting, Auth, RLS, and Storage. All PII tables protected with RLS by tenant (institution) and by user ownership. Use row-level policies and views for anonymization.

## Entities
- institutions(id, name, domain, settings, created_at)
- users(id UUID, auth_provider_id, institution_id FK, role, email, phone?, language, created_at)
- profiles(user_id PK/FK, display_name, bio, interests JSONB, preferences JSONB, mood, avatar_url, visibility, updated_at)
- profile_embeddings(user_id PK/FK, embedding vector(768), model, updated_at)
- conversations(id, user_id, counselor_id?, privacy_mode, started_at, ended_at)
- messages(id, conversation_id FK, sender enum(student|bot|counselor), content, language, modality, created_at)
- message_embeddings(message_id PK/FK, embedding vector(768), model)
- risk_assessments(id, message_id FK, score float, labels jsonb, threshold_crossed bool, assessed_at)
- escalations(id, conversation_id FK, type, status, created_at, resolved_at, notes)
- appointments(id, user_id, counselor_id, provider enum(google|outlook), external_event_id, slot_start, slot_end, status, created_at)
- counselors(id, institution_id FK, name, email, languages, specialties, calendar_provider, calendar_credentials_ref)
- content(id, source enum(youtube|ai), title, description, url, thumbnail_url, language, captions_url?, tags jsonb, created_at)
- content_embeddings(content_id PK/FK, embedding vector(768), model)
- content_feedback(id, user_id, content_id, action enum(view|like|share|complete), dwell_ms, created_at)
- alerts(id, user_id, conversation_id?, risk_score, level enum(info|warning|critical), delivered_via jsonb, created_at)
- analytics_daily(id, institution_id, date, metric, value numeric)
 - idempotency_keys(key text PK, request_hash text, first_seen timestamptz, status text, response jsonb)

## Indexing
- GIN on interests, tags
- pgvector HNSW on profile_embeddings.embedding, content_embeddings.embedding, message_embeddings.embedding
- btree on foreign keys and created_at
 - unique on idempotency_keys.key

## RLS Highlights (pseudo)
- enable RLS on all tables.
- policy "own profile" on profiles: using (user_id = auth.uid()).
- policy "institution isolate" on users: using (institution_id = auth.jwt()->>'inst_id').
- analytics views aggregate at k>=10 users; otherwise suppress.
 - presence and invitations via Supabase Realtime channels bound to institution_id

## Views/Materialized Views
- v_user_anon: hashed user_id per institution for analytics
- mv_content_popular_daily: rollups for recommendations
- mv_risk_trends: daily counts per label and cohort
 - v_matches_topk(user_id): SQL function to produce top-k candidates using pgvector + filters

## Retention
- messages.private privacy_mode = 'private' retention 7 days; redact content after 7d retaining risk score aggregates.
