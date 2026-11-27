create table public.explanation_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index explanation_requests_user_created_idx on public.explanation_requests (user_id, created_at desc);

alter table public.explanation_requests enable row level security;
revoke all on public.explanation_requests from public, anon, authenticated;

create or replace function public.reserve_explanation(p_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_id uuid;
begin
  if v_user_id is null then raise exception using errcode = 'P0001', message = 'explanation_unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  if not exists (select 1 from public.projects where id = p_project_id and user_id = v_user_id) then
    raise exception using errcode = 'P0001', message = 'explanation_project_not_found';
  end if;

  if (select count(*) from public.explanation_requests where user_id = v_user_id and created_at >= now() - interval '1 hour') >= 10 then
    raise exception using errcode = 'P0001', message = 'explanation_rate_limited';
  end if;

  insert into public.explanation_requests (project_id, user_id)
  values (p_project_id, v_user_id) returning id into v_request_id;
  return v_request_id;
end;
$$;

revoke all on function public.reserve_explanation(uuid) from public, anon;
grant execute on function public.reserve_explanation(uuid) to authenticated;
