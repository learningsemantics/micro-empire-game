create table if not exists public.cloud_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  save_data jsonb not null,
  schema_version integer not null default 1 check (schema_version > 0),
  client_saved_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.cloud_saves enable row level security;

create policy "Players can read their own cloud save"
on public.cloud_saves for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Players can create their own cloud save"
on public.cloud_saves for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Players can update their own cloud save"
on public.cloud_saves for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.set_cloud_save_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cloud_saves_updated_at on public.cloud_saves;
create trigger cloud_saves_updated_at
before update on public.cloud_saves
for each row execute function public.set_cloud_save_updated_at();

revoke all on public.cloud_saves from anon;
grant select, insert, update on public.cloud_saves to authenticated;
