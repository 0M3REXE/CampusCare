-- Alignment migration to bring peer messaging schema in line with initial schema patterns
-- Date: 2025-09-25
-- Changes:
-- 1. Add FKs from peer_conversations.user_a/user_b to users_public(id)
-- 2. Add ON DELETE CASCADE to ensure cleanup consistency with existing conversations/messages tables
-- 3. Add (idempotent) drop/create of RLS policies with naming style similar to initial.sql
-- 4. Add peer_message_embeddings table (mirrors message_embeddings) for future semantic features
-- 5. Add optional SQL helper function peer_mark_read (security definer) and policy-safe usage pattern

-- Safety: Only run alters if constraints do not already exist
do $$ begin
  -- Foreign key for user_a
  if not exists (
    select 1 from pg_constraint where conname = 'fk_peer_conversations_user_a'
  ) then
    alter table peer_conversations
      add constraint fk_peer_conversations_user_a
      foreign key (user_a) references users_public(id) on delete cascade;
  end if;
  -- Foreign key for user_b
  if not exists (
    select 1 from pg_constraint where conname = 'fk_peer_conversations_user_b'
  ) then
    alter table peer_conversations
      add constraint fk_peer_conversations_user_b
      foreign key (user_b) references users_public(id) on delete cascade;
  end if;
end $$;

-- Ensure RLS still enabled
alter table peer_conversations enable row level security;
alter table peer_messages enable row level security;

-- Recreate policies with consistent naming (drop if exists first)
drop policy if exists "select own peer conversations" on peer_conversations;
create policy "select own peer conversations" on peer_conversations
  for select using (auth.uid() in (user_a, user_b));

drop policy if exists "insert own peer conversations" on peer_conversations;
create policy "insert own peer conversations" on peer_conversations
  for insert with check (auth.uid() in (user_a, user_b) and user_a <> user_b);

drop policy if exists "update own peer conversations" on peer_conversations;
create policy "update own peer conversations" on peer_conversations
  for update using (auth.uid() in (user_a, user_b))
  with check (auth.uid() in (user_a, user_b));

drop policy if exists "select own peer messages" on peer_messages;
create policy "select own peer messages" on peer_messages
  for select using (
    exists (
      select 1 from peer_conversations c
      where c.id = peer_messages.conversation_id
        and auth.uid() in (c.user_a, c.user_b)
    )
  );

drop policy if exists "insert own peer messages" on peer_messages;
create policy "insert own peer messages" on peer_messages
  for insert with check (
    auth.uid() = sender and exists (
      select 1 from peer_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.user_a, c.user_b)
    )
  );

-- Embeddings table (future-proofing for vector search / semantic features)
create table if not exists peer_message_embeddings (
  message_id uuid primary key references peer_messages(id) on delete cascade,
  embedding vector(768),
  model text
);

create index if not exists idx_peer_message_embeddings_hnsw
  on peer_message_embeddings using hnsw (embedding vector_cosine_ops);

alter table peer_message_embeddings enable row level security;

drop policy if exists "embedding belongs to own peer message" on peer_message_embeddings;
create policy "embedding belongs to own peer message" on peer_message_embeddings
  for select using (
    exists (
      select 1 from peer_messages pm
      join peer_conversations pc on pc.id = pm.conversation_id
      where pm.id = peer_message_embeddings.message_id
        and auth.uid() in (pc.user_a, pc.user_b)
    )
  );
drop policy if exists "insert own peer message embedding" on peer_message_embeddings;
create policy "insert own peer message embedding" on peer_message_embeddings
  for insert with check (
    exists (
      select 1 from peer_messages pm
      join peer_conversations pc on pc.id = pm.conversation_id
      where pm.id = peer_message_embeddings.message_id
        and auth.uid() in (pc.user_a, pc.user_b)
    )
  );

-- Helper function to mark a conversation read for the current user (optional; API can call via rpc)
create or replace function peer_mark_read(p_conversation uuid)
returns void as $$
declare a uuid; b uuid; who uuid;
begin
  select user_a, user_b into a,b from peer_conversations where id = p_conversation;
  if not found then
    return; -- silently no-op
  end if;
  who := auth.uid();
  if who = a then
    update peer_conversations set unread_a = 0 where id = p_conversation;
  elsif who = b then
    update peer_conversations set unread_b = 0 where id = p_conversation;
  end if;
end; $$ language plpgsql security definer;

-- (Optional) You can later expose this via: supabase.rpc('peer_mark_read', { p_conversation: <id> })
