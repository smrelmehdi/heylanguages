create or replace function public.delete_account_data(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is null then raise exception 'User ID is required'; end if;

  delete from public.messages
  where conversation_id in (select id from public.conversations where user_id = p_user_id);
  delete from public.conversations where user_id = p_user_id;
  delete from public.icebreaker_progress where user_id = p_user_id;
  delete from public.learned_words where user_id = p_user_id;
  delete from public.user_memory where user_id = p_user_id;
  delete from public.speech_rate_limits where user_id = p_user_id;
  delete from public.guest_completion_migrations where user_id = p_user_id;
  delete from public.guest_xp_migrations where user_id = p_user_id;
  delete from public.scenario_progress where user_id = p_user_id;
  delete from public.subscriptions where user_id = p_user_id;
  delete from public.user_progress where user_id = p_user_id;
  delete from public.user_streaks where user_id = p_user_id;
  delete from public.users where id = p_user_id;
end;
$$;

revoke all on function public.delete_account_data(uuid) from public, anon, authenticated;
grant execute on function public.delete_account_data(uuid) to service_role;
