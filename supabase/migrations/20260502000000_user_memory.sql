-- user_memory: persistent per-user memory for the chat tutor (Yusuf).
-- One row per user, upserted at end of each chat session.

create table user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  personal_facts jsonb default '[]',
  weak_words jsonb default '[]',
  strong_words jsonb default '[]',
  last_session_summary text default '',
  total_sessions integer default 0,
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table user_memory enable row level security;

create policy "users can read own memory"
  on user_memory for select using (auth.uid() = user_id);

create policy "users can upsert own memory"
  on user_memory for insert with check (auth.uid() = user_id);

create policy "users can update own memory"
  on user_memory for update using (auth.uid() = user_id);
