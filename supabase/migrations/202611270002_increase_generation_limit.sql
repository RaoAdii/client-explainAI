create or replace function public.reserve_generation(p_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id uuid;
begin
  if v_user_id is null then raise exception using errcode = 'P0001', message = 'generation_unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  if not exists (select 1 from public.projects where id = p_project_id and user_id = v_user_id) then
    raise exception using errcode = 'P0001', message = 'generation_project_not_found';
  end if;

  update public.generation_runs
  set status = 'failed', error_message = 'The generation timed out.', completed_at = now()
  where project_id = p_project_id and user_id = v_user_id
    and status in ('pending', 'generating') and created_at < now() - interval '10 minutes';

  if exists (
    select 1 from public.generation_runs where project_id = p_project_id and user_id = v_user_id
    and status in ('pending', 'generating') and created_at >= now() - interval '10 minutes'
  ) then raise exception using errcode = 'P0001', message = 'generation_in_progress'; end if;

  if (select count(*) from public.generation_runs where user_id = v_user_id and created_at >= now() - interval '1 hour') >= 10 then
    raise exception using errcode = 'P0001', message = 'generation_rate_limited';
  end if;

  insert into public.generation_runs (project_id, user_id, status)
  values (p_project_id, v_user_id, 'generating') returning id into v_run_id;
  return v_run_id;
end;
$$;
