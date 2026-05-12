create table public.site_settings (
  id boolean primary key default true check (id = true),
  landing_skin text not null default 'classic'
    check (landing_skin in ('classic','editorial')),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (true) on conflict do nothing;

alter table public.site_settings enable row level security;
create policy "site_settings_no_direct_access" on public.site_settings
  for all using (false) with check (false);

create or replace function public.get_landing_skin()
returns text language sql stable security definer set search_path=public
as $$ select landing_skin from public.site_settings where id=true $$;

create or replace function public.admin_set_landing_skin(_password text, _skin text)
returns text language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin_password(_password) then raise exception 'unauthorized'; end if;
  if _skin not in ('classic','editorial') then raise exception 'invalid_skin'; end if;
  update public.site_settings set landing_skin=_skin, updated_at=now() where id=true;
  return _skin;
end; $$;