-- CampusCare minimal schema for Supabase (Free tier friendly)
-- Enable extensions
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Institutions
create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- Public user profile linked to Supabase auth.users
create table if not exists users_public (
  id uuid primary key,
  institution_id uuid references institutions(id) on delete restrict,
  role text check (role in ('student','counselor','admin','institution_admin')) default 'student',
  email text,
  language text default 'en',
  created_at timestamptz default now()
);

-- Profiles
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

-- Embeddings for matching
create table if not exists profile_embeddings (
  user_id uuid primary key references users_public(id) on delete cascade,
  embedding vector(768),
  model text,
  updated_at timestamptz default now()
);

-- Conversations & messages
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_public(id) on delete cascade,
  counselor_id uuid references users_public(id),
  privacy_mode text check (privacy_mode in ('standard','private')) default 'standard',
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender text check (sender in ('student','bot','counselor')) not null,
  content text,
  language text,
  modality text check (modality in ('text','voice')) default 'text',
  created_at timestamptz default now()
);

create table if not exists message_embeddings (
  message_id uuid primary key references messages(id) on delete cascade,
  embedding vector(768),
  model text
);

-- Risk assessments and alerts
create table if not exists risk_assessments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  score double precision,
  labels jsonb,
  threshold_crossed boolean default false,
  assessed_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_public(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  risk_score double precision,
  level text check (level in ('info','warning','critical')) not null,
  delivered_via jsonb default '[]',
  created_at timestamptz default now()
);

-- Idempotency (no external cache needed)
create table if not exists idempotency_keys (
  key text primary key,
  request_hash text,
  first_seen timestamptz default now(),
  status text,
  response jsonb
);

-- Indexes
create index if not exists idx_profiles_interests_gin on profiles using gin (interests);
create index if not exists idx_messages_convo on messages(conversation_id, created_at);
create index if not exists idx_risk_message on risk_assessments(message_id);
create index if not exists idx_alerts_user on alerts(user_id, created_at);
create index if not exists idx_profile_embeddings_hnsw on profile_embeddings using hnsw (embedding vector_cosine_ops);
create index if not exists idx_message_embeddings_hnsw on message_embeddings using hnsw (embedding vector_cosine_ops);

-- RLS
alter table institutions enable row level security;
alter table users_public enable row level security;
alter table profiles enable row level security;
alter table profile_embeddings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table message_embeddings enable row level security;
alter table risk_assessments enable row level security;
alter table alerts enable row level security;

-- Basic policies (adjust as needed)
create policy if not exists "users can read self" on users_public for select using (id = auth.uid());
create policy if not exists "users can update self" on users_public for update using (id = auth.uid());

create policy if not exists "own profile" on profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists "own profile embedding" on profile_embeddings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists "conversation owner" on conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy if not exists "messages within own conversations" on messages for all using (exists (select 1 from conversations c where c.id = messages.conversation_id and c.user_id = auth.uid()));

create policy if not exists "risk belongs to own messages" on risk_assessments for select using (exists (select 1 from messages m join conversations c on c.id=m.conversation_id where m.id = risk_assessments.message_id and c.user_id = auth.uid()));

create policy if not exists "alerts for own" on alerts for select using (user_id = auth.uid());
