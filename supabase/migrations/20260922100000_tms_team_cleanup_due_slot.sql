-- Keep TMS workspace limited to @123.com team; drop legacy Malconexus directory rows (auth users unchanged).

update public.malcon_tms_tasks t
set assignee_id = null
from public.malcon_tms_profiles p
where t.assignee_id = p.id
  and lower(p.email) not like '%@123.com';

delete from public.malcon_tms_profiles
where lower(email) not like '%@123.com';

alter table public.malcon_tms_tasks
  add column if not exists due_slot text check (
    due_slot is null
    or due_slot in ('start_of_day', 'morning', 'afternoon', 'end_of_day')
  );
