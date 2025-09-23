# CampusCare – Getting Started (Near-Zero-Cost)

This guide sets up CampusCare on Vercel (Hobby), Supabase (Free), and Google Gemini (free tier/credits).

## Prereqs
- GitHub account
- Vercel account (free)
- Supabase account (free project)
- Google Cloud project with Generative Language (Gemini) API enabled

## 1) Supabase Setup
1. Create a new Supabase project (pick region close to users)
2. In Database > Extensions: enable `pgvector`
3. In Authentication: configure email login (disable phone to avoid costs)
4. In Settings > API: note Project URL and anon/service keys
5. Create the core tables (use SQL Editor) – example snippets:
```sql
-- Enable pgvector
create extension if not exists vector;

-- Minimal tables (add more per DB_SCHEMA.md)
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists users_public (
  id uuid primary key,
  institution_id uuid references institutions(id) on delete restrict,
  role text check (role in ('student','counselor','admin','institution_admin')) default 'student',
  email text,
  language text default 'en',
  created_at timestamptz default now()
);

create table if not exists profiles (
  user_id uuid primary key references users_public(id) on delete cascade,
  display_name text,
  bio text,
  interests jsonb default '[]',
  preferences jsonb default '{}',
  mood text,
  avatar_url text,
  visibility text default 'friends',
  updated_at timestamptz default now()
);

create table if not exists profile_embeddings (
  user_id uuid primary key references users_public(id) on delete cascade,
  embedding vector(768),
  model text,
  updated_at timestamptz default now()
);

-- Idempotency
create table if not exists idempotency_keys (
  key text primary key,
  request_hash text,
  first_seen timestamptz default now(),
  status text,
  response jsonb
);

-- Indexes
create index if not exists idx_profiles_interests_gin on profiles using gin (interests);
create index if not exists idx_profile_embeddings_hnsw on profile_embeddings using hnsw (embedding vector_cosine_ops);
```

6. RLS: enable RLS on all tables and add policies (see DB_SCHEMA.md for examples)

## 2) Google Gemini Setup
1. In Google Cloud Console: enable "Generative Language API"
2. Create an API key (restrict to IP/domain later)
3. Models to use:
   - Chat: `gemini-1.5-flash`
   - Embeddings: `text-embedding-004`

## 3) Vercel Environment Variables
Set the following in Vercel Project Settings > Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- GEMINI_API_KEY (server-only)
- CC_EMAIL_FROM (optional)
- CC_EMAIL_SMTP_URL (optional, if using SMTP)

## 4) Local Dev
Install deps and run the dev server.
```pwsh
# PowerShell
npm install
npm run dev
```
Create a `.env.local` matching your Vercel env vars for local dev.

## 5) Realtime & Presence
Use Supabase Realtime channels for chat presence and invitations. See API_SPEC.md for `/presence` channel shapes.

## 6) Edge Functions (optional but recommended)
Create Supabase Edge Functions for:
- alerts-fanout: watches `alerts` inserts and sends emails
- youtube-etl: nightly ingestion of channels/playlists
- cleanup: retention for private chat sessions

Supabase CLI quick skeleton:
```pwsh
# install
npm i -g supabase
supabase login
supabase functions new alerts-fanout
# deploy
supabase functions deploy alerts-fanout
```
Wire DB triggers to call the function via http invocation using a service role secret.

## 7) Minimal Safety Prompt (Server)
When calling Gemini, prefix with a system prompt that clarifies non-therapeutic support and escalation guidance. Keep prompts versioned in code.

## 8) Go Live
- Push to GitHub, connect to Vercel, and deploy
- Confirm DB migrations applied
- Test chat, matching, and a test alert end-to-end

Troubleshooting tips are in DEPLOYMENT_COSTS.md and SECURITY_PRIVACY.md.
