create table if not exists public.guest_xp_migrations (
  user_id uuid not null references public.users(id) on delete cascade,
  migration_id text not null,
  xp_awarded integer not null check (xp_awarded >= 0),
  created_at timestamptz not null default now(),
  primary key (user_id, migration_id)
);

alter table public.guest_xp_migrations enable row level security;

create or replace function public.merge_guest_xp_once(
  p_migration_id text,
  p_xp integer
)
returns table(
  first_migration boolean,
  xp_awarded integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_count integer;
  updated_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_migration_id is null or btrim(p_migration_id) = '' then
    raise exception 'Migration ID must not be empty';
  end if;
  if p_xp is null or p_xp < 0 then
    raise exception 'XP must be zero or greater';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(current_user_id::text || ':guest-xp:' || p_migration_id, 0)
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

revoke all on function public.merge_guest_xp_once(text, integer) from public;
grant execute on function public.merge_guest_xp_once(text, integer) to authenticated;
