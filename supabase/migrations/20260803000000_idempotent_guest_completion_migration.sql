create table if not exists public.guest_completion_migrations (
  user_id uuid not null references public.users(id) on delete cascade,
  migration_id text not null,
  completion_key text not null,
  created_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, migration_id, completion_key)
);

alter table public.guest_completion_migrations enable row level security;

create or replace function public.merge_guest_completion_once(
  p_target_user_id uuid,
  p_migration_id text,
  p_completion_key text
)
returns table(completion_migrated boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  completion_dialect text;
  completion_semantic_id text;
  inserted_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_target_user_id is null or current_user_id <> p_target_user_id then
    raise exception 'Authenticated user does not match migration target';
  end if;
  if p_migration_id is null or pg_catalog.btrim(p_migration_id) = '' then
    raise exception 'Migration ID must not be empty';
  end if;
  if p_completion_key is null
    or p_completion_key !~ '^(msa|gulf|egyptian):unit-[1-9][0-9]*:[a-z0-9][a-z0-9_-]*$'
  then
    raise exception 'Completion key must be canonical and scoped';
  end if;

  completion_dialect := pg_catalog.split_part(p_completion_key, ':', 1);
  completion_semantic_id := pg_catalog.split_part(p_completion_key, ':', 3);
  if completion_semantic_id = '' then
    raise exception 'Completion semantic ID must not be empty';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      current_user_id::text || ':guest-progress:' || p_migration_id || ':' || p_completion_key,
      0
    )
  );

  insert into public.guest_completion_migrations (user_id, migration_id, completion_key)
  values (current_user_id, p_migration_id, p_completion_key)
  on conflict (user_id, migration_id, completion_key) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 1 then
    insert into public.scenario_progress (user_id, scenario_id, dialect, completed_count)
    values (current_user_id, p_completion_key, completion_dialect, 1)
    on conflict (user_id, scenario_id, dialect) do nothing;
  end if;

  return query select inserted_count = 1;
end;
$$;

revoke all on function public.merge_guest_completion_once(uuid, text, text) from public;
revoke all on function public.merge_guest_completion_once(uuid, text, text) from anon;
grant execute on function public.merge_guest_completion_once(uuid, text, text) to authenticated;

-- The app is prelaunch. Remove the old callable XP signature rather than retain
-- an endpoint that cannot bind a snapshot to its intended account.
drop function if exists public.merge_guest_xp_once(text, integer);

create or replace function public.merge_guest_xp_once(
  p_target_user_id uuid,
  p_migration_id text,
  p_xp integer
)
returns table(first_migration boolean, xp_awarded integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_count integer;
  updated_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_target_user_id is null or current_user_id <> p_target_user_id then
    raise exception 'Authenticated user does not match migration target';
  end if;
  if p_migration_id is null or pg_catalog.btrim(p_migration_id) = '' then
    raise exception 'Migration ID must not be empty';
  end if;
  if p_xp is null or p_xp < 0 then
    raise exception 'XP must be zero or greater';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text || ':guest-xp:' || p_migration_id, 0)
  );

  insert into public.guest_xp_migrations (user_id, migration_id, xp_awarded)
  values (current_user_id, p_migration_id, p_xp)
  on conflict (user_id, migration_id) do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 1 and p_xp > 0 then
    update public.users
    set xp = coalesce(xp, 0) + p_xp
    where id = current_user_id;
    get diagnostics updated_count = row_count;
    if updated_count <> 1 then
      raise exception 'User XP row not found';
    end if;
  end if;

  return query
  select inserted_count = 1, case when inserted_count = 1 then p_xp else 0 end;
end;
$$;

revoke all on function public.merge_guest_xp_once(uuid, text, integer) from public;
revoke all on function public.merge_guest_xp_once(uuid, text, integer) from anon;
grant execute on function public.merge_guest_xp_once(uuid, text, integer) to authenticated;
