-- Store / case manager roles for TMS profiles

alter table public.malcon_tms_profiles
  drop constraint if exists malcon_tms_profiles_role_check;

alter table public.malcon_tms_profiles
  add constraint malcon_tms_profiles_role_check
  check (role in ('admin', 'store_manager', 'case_manager'));

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
  profile_role text;
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

  profile_role := coalesce(nullif(trim(new.raw_user_meta_data ->> 'role'), ''), 'admin');
  if profile_role not in ('admin', 'store_manager', 'case_manager') then
    profile_role := 'admin';
  end if;

  insert into public.malcon_tms_profiles (id, name, email, role, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    lower(new.email),
    profile_role,
    avatar_colors[(profile_count % array_length(avatar_colors, 1)) + 1]
  );

  return new;
end;
$$;
