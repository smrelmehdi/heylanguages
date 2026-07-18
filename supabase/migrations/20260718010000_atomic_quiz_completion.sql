create or replace function public.complete_quiz_once(
  p_scenario text,
  p_dialect text,
  p_score integer,
  p_xp integer,
  p_completion_candidates text[]
)
returns table(
  first_completion boolean,
  xp_awarded integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  was_completed boolean;
  completion_candidates text[];
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_scenario is null or btrim(p_scenario) = '' then
    raise exception 'Scenario must not be empty';
  end if;

  if p_dialect is null or btrim(p_dialect) = '' then
    raise exception 'Dialect must not be empty';
  end if;

  if p_score is null or p_score < 0 then
    raise exception 'Score must be zero or greater';
  end if;

  if p_xp is null or p_xp < 0 then
    raise exception 'XP must be zero or greater';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      current_user_id::text || ':' || p_dialect || ':' || p_scenario,
      0
    )
  );

  select array_agg(distinct candidate)
  into completion_candidates
  from unnest(
    coalesce(p_completion_candidates, array[]::text[]) || array[p_scenario]
  ) as candidate
  where candidate is not null
    and btrim(candidate) <> '';

  select exists (
    select 1
    from public.scenario_progress as progress
    where progress.user_id = current_user_id
      and progress.dialect = p_dialect
      and progress.scenario_id = any(completion_candidates)
      and coalesce(progress.completed_count, 0) > 0
  )
  into was_completed;

  insert into public.scenario_progress as progress (
    user_id,
    scenario_id,
    dialect,
    completed_count,
    best_score,
    last_completed
  )
  values (
    current_user_id,
    p_scenario,
    p_dialect,
    1,
    p_score,
    now()
  )
  on conflict (user_id, scenario_id, dialect)
  do update set
    completed_count = coalesce(progress.completed_count, 0) + 1,
    best_score = greatest(coalesce(progress.best_score, 0), excluded.best_score),
    last_completed = excluded.last_completed;

  if not was_completed and p_xp > 0 then
    update public.users
    set xp = coalesce(xp, 0) + p_xp
    where id = auth.uid();
  end if;

  return query
  select
    not was_completed,
    case when was_completed then 0 else p_xp end;
end;
$$;

revoke all on function public.complete_quiz_once(text, text, integer, integer, text[]) from public;
grant execute on function public.complete_quiz_once(text, text, integer, integer, text[]) to authenticated;
