create extension if not exists pgcrypto;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 120),
  jurisdiction text not null check (char_length(jurisdiction) between 2 and 160),
  legal_area text not null check (char_length(legal_area) between 2 and 120),
  language text not null default 'English' check (language = 'English'),
  target_audience text not null check (char_length(target_audience) between 2 and 160),
  complexity text not null default 'Unspecified' check (char_length(complexity) between 1 and 120),
  workflow_status text not null default 'draft' check (workflow_status in ('draft', 'active', 'archived')),
  description text not null check (char_length(description) between 20 and 4000),
  image_path text,
  image_alt_text text,
  image_input_fingerprint text,
  image_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'generating', 'succeeded', 'failed')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 2),
  quality_issues jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index projects_user_updated_idx on public.projects (user_id, updated_at desc);
create index projects_user_status_idx on public.projects (user_id, workflow_status);
create index generation_runs_user_created_idx on public.generation_runs (user_id, created_at desc);
create index generation_runs_project_status_idx on public.generation_runs (project_id, status);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.generation_runs enable row level security;

create policy "Users read own projects" on public.projects for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own projects" on public.projects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own projects" on public.projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users read own generation runs" on public.generation_runs for select to authenticated using ((select auth.uid()) = user_id);

revoke insert, update on public.projects from authenticated;
grant insert (user_id, name, jurisdiction, legal_area, language, target_audience, complexity, workflow_status, description) on public.projects to authenticated;
grant update (name, jurisdiction, legal_area, language, target_audience, complexity, workflow_status, description) on public.projects to authenticated;
revoke insert, update, delete on public.generation_runs from authenticated;

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

  if (select count(*) from public.generation_runs where user_id = v_user_id and created_at >= now() - interval '1 hour') >= 5 then
    raise exception using errcode = 'P0001', message = 'generation_rate_limited';
  end if;

  insert into public.generation_runs (project_id, user_id, status)
  values (p_project_id, v_user_id, 'generating') returning id into v_run_id;
  return v_run_id;
end;
$$;

create or replace function public.complete_generation(
  p_run_id uuid, p_image_path text, p_alt_text text, p_fingerprint text, p_attempt_count integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_project_id uuid; v_user_id uuid;
begin
  select project_id, user_id into v_project_id, v_user_id
  from public.generation_runs where id = p_run_id and status = 'generating' for update;
  if v_project_id is null then raise exception 'generation_run_not_active'; end if;
  if p_image_path <> v_user_id::text || '/' || v_project_id::text || '/' || p_run_id::text || '.png' then
    raise exception 'generation_image_path_invalid';
  end if;
  update public.projects set image_path = p_image_path, image_alt_text = p_alt_text,
    image_input_fingerprint = p_fingerprint, image_generated_at = now()
  where id = v_project_id and user_id = v_user_id;
  if not found then raise exception 'generation_project_not_found'; end if;
  update public.generation_runs set status = 'succeeded', attempt_count = p_attempt_count,
    quality_issues = '[]'::jsonb, completed_at = now() where id = p_run_id;
end;
$$;

create or replace function public.fail_generation(
  p_run_id uuid, p_error_message text, p_quality_issues jsonb, p_attempt_count integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.generation_runs set status = 'failed', error_message = left(p_error_message, 500),
    quality_issues = coalesce(p_quality_issues, '[]'::jsonb), attempt_count = least(greatest(p_attempt_count, 0), 2), completed_at = now()
  where id = p_run_id and status in ('pending', 'generating');
  if not found then raise exception 'generation_run_not_active'; end if;
end;
$$;

revoke all on function public.reserve_generation(uuid) from public, anon;
grant execute on function public.reserve_generation(uuid) to authenticated;
revoke all on function public.complete_generation(uuid, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.complete_generation(uuid, text, text, text, integer) to service_role;
revoke all on function public.fail_generation(uuid, text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.fail_generation(uuid, text, jsonb, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('legal-visuals', 'legal-visuals', false, 10485760, array['image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/png'];

create policy "Users read own legal visuals" on storage.objects for select to authenticated
using (bucket_id = 'legal-visuals' and (storage.foldername(name))[1] = (select auth.uid())::text);
