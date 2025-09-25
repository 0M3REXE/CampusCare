-- Peer Messaging Schema Migration (2025-09-25)
-- Creates tables: peer_conversations, peer_messages
-- Adds indexes, RLS policies, and trigger to maintain unread counts + previews.

-- 1. Tables
create table if not exists peer_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null,
  user_b uuid not null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_message_preview text,
  unread_a int not null default 0,
  unread_b int not null default 0,
  constraint user_pair_distinct check (user_a <> user_b)
);

create unique index if not exists ux_peer_conversations_pair
  on peer_conversations (least(user_a, user_b), greatest(user_a, user_b));

create index if not exists idx_peer_conversations_user_a on peer_conversations(user_a);
create index if not exists idx_peer_conversations_user_b on peer_conversations(user_b);
create index if not exists idx_peer_conversations_last_message on peer_conversations(last_message_at desc);

create table if not exists peer_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references peer_conversations(id) on delete cascade,
  sender uuid not null,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_peer_messages_conversation_created
  on peer_messages(conversation_id, created_at desc);

-- 2. RLS Enable
alter table peer_conversations enable row level security;
alter table peer_messages enable row level security;

-- 3. Policies
create policy select_own_peer_conversations on peer_conversations
  for select using (auth.uid() in (user_a, user_b));

create policy insert_own_peer_conversations on peer_conversations
  for insert with check (
    auth.uid() in (user_a, user_b) and user_a <> user_b
  );

create policy update_own_peer_conversations on peer_conversations
  for update using (auth.uid() in (user_a, user_b))
  with check (auth.uid() in (user_a, user_b));

create policy select_own_peer_messages on peer_messages
  for select using (
    exists (
      select 1 from peer_conversations c
      where c.id = peer_messages.conversation_id
        and auth.uid() in (c.user_a, c.user_b)
    )
  );

create policy insert_own_peer_messages on peer_messages
  for insert with check (
    auth.uid() = sender and exists (
      select 1 from peer_conversations c
      where c.id = conversation_id
        and auth.uid() in (c.user_a, c.user_b)
    )
  );

-- 4. Trigger for unread counts + preview
create or replace function trg_peer_message_insert()
returns trigger as $$
declare a uuid; b uuid; msg_sender uuid; other uuid; snippet text;
begin
  select user_a, user_b into a, b from peer_conversations where id = new.conversation_id;
  msg_sender := new.sender;
  snippet := left(new.body, 120);
  if msg_sender = a then
    update peer_conversations
      set last_message_at = new.created_at,
          last_message_preview = snippet,
          unread_b = unread_b + 1
      where id = new.conversation_id;
  elsif msg_sender = b then
    update peer_conversations
      set last_message_at = new.created_at,
          last_message_preview = snippet,
          unread_a = unread_a + 1
      where id = new.conversation_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists peer_message_insert on peer_messages;
create trigger peer_message_insert
  after insert on peer_messages
  for each row execute procedure trg_peer_message_insert();

-- 5. Mark read helper (optional future): could add a SQL function to safely zero unread for a participant.
-- Example (not yet used by RLS safe API):
-- create or replace function peer_mark_read(p_conversation uuid)
-- returns void as $$
-- declare a uuid; b uuid; who uuid;
-- begin
--   select user_a, user_b into a,b from peer_conversations where id = p_conversation;
--   who := auth.uid();
--   if who = a then
--     update peer_conversations set unread_a = 0 where id = p_conversation;
--   elsif who = b then
--     update peer_conversations set unread_b = 0 where id = p_conversation;
--   end if;
-- end; $$ language plpgsql security definer;
