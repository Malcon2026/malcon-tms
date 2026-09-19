-- Malcon TMS — shared workspace schema (Supabase project: malcon-backend)

create table if not exists public.malcon_tms_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.malcon_tms_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null check (status in ('todo', 'inprogress', 'review', 'done')),
  priority text not null check (priority in ('urgent', 'high', 'medium', 'low')),
  tags text[] not null default '{}',
  due date,
  assignee_id uuid references public.malcon_tms_profiles (id) on delete set null,
  created_by uuid not null references public.malcon_tms_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.malcon_tms_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.malcon_tms_profiles (id) on delete cascade,
  action text not null,
  detail text not null,
  task_id uuid references public.malcon_tms_tasks (id) on delete set null,
  at timestamptz not null default now()
);

create index if not exists malcon_tms_tasks_status_idx on public.malcon_tms_tasks (status);
create index if not exists malcon_tms_tasks_assignee_idx on public.malcon_tms_tasks (assignee_id);
create index if not exists malcon_tms_activity_at_idx on public.malcon_tms_activity (at desc);

alter table public.malcon_tms_profiles enable row level security;
alter table public.malcon_tms_tasks enable row level security;
alter table public.malcon_tms_activity enable row level security;

create policy "tms_profiles_select"
  on public.malcon_tms_profiles for select
  to authenticated
  using (true);

create policy "tms_tasks_select"
  on public.malcon_tms_tasks for select
  to authenticated
  using (true);

create policy "tms_tasks_insert"
  on public.malcon_tms_tasks for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "tms_tasks_update"
  on public.malcon_tms_tasks for update
  to authenticated
  using (true)
  with check (true);

create policy "tms_tasks_delete"
  on public.malcon_tms_tasks for delete
  to authenticated
  using (created_by = auth.uid());

create policy "tms_activity_select"
  on public.malcon_tms_activity for select
  to authenticated
  using (true);

create policy "tms_activity_insert"
  on public.malcon_tms_activity for insert
  to authenticated
  with check (user_id = auth.uid());

create or replace function public.malcon_tms_workspace_empty()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (select 1 from public.malcon_tms_profiles limit 1);
$$;

grant execute on function public.malcon_tms_workspace_empty() to anon, authenticated;

create or replace function public.malcon_tms_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_count int;
  avatar_colors text[] := array[
    '#0071e3', '#bf5af2', '#ff375f', '#ff9500', '#34c759', '#5e5ce6', '#00a8c5', '#8e8e93'
  ];
  from_admin boolean;
  is_tms boolean;
begin
  is_tms := coalesce(new.raw_user_meta_data ->> 'app', '') = 'malcon_tms';
  if not is_tms then
    return new;
  end if;

  from_admin := coalesce((new.raw_user_meta_data ->> 'created_by_admin')::boolean, false);
  select count(*) into profile_count from public.malcon_tms_profiles;

  if profile_count > 0 and not from_admin then
    raise exception 'Signups are disabled. Ask a workspace admin for an account.';
  end if;

  insert into public.malcon_tms_profiles (id, name, email, role, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(new.email),
    'admin',
    avatar_colors[(profile_count % array_length(avatar_colors, 1)) + 1]
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_malcon_tms on auth.users;
create trigger on_auth_user_created_malcon_tms
  after insert on auth.users
  for each row
  execute function public.malcon_tms_handle_new_user();

alter publication supabase_realtime add table public.malcon_tms_profiles;
alter publication supabase_realtime add table public.malcon_tms_tasks;
alter publication supabase_realtime add table public.malcon_tms_activity;
