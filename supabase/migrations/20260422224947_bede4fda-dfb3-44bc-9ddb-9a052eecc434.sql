-- Enum for code types
do $$ begin
  create type public.activation_code_type as enum ('DEMO', 'MENSUEL', 'TRIMESTRIEL');
exception when duplicate_object then null; end $$;

-- Settings table (admin password etc.)
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists "settings_no_direct_access" on public.app_settings;
create policy "settings_no_direct_access" on public.app_settings for all using (false) with check (false);

insert into public.app_settings(key, value) values ('admin_password', 'mrg-admin-2026')
on conflict (key) do nothing;

-- Activation codes table
create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.activation_code_type not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  usage_count integer not null default 0,
  max_usage integer,
  is_active boolean not null default true
);

create index if not exists idx_activation_codes_code on public.activation_codes (code);
create index if not exists idx_activation_codes_is_active on public.activation_codes (is_active);

alter table public.activation_codes enable row level security;
drop policy if exists "no_direct_access" on public.activation_codes;
create policy "no_direct_access" on public.activation_codes for all using (false) with check (false);

-- Admin password check
create or replace function public.is_admin_password(_password text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_settings where key = 'admin_password' and value = _password
  )
$$;

-- Validate
create or replace function public.validate_activation_code(_code text)
returns table (
  ok boolean,
  reason text,
  code_type public.activation_code_type,
  remaining integer,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c public.activation_codes%rowtype;
begin
  select * into c from public.activation_codes where code = _code;
  if not found then
    return query select false, 'invalid'::text, null::public.activation_code_type, null::integer, null::timestamptz;
    return;
  end if;
  if not c.is_active then
    return query select false, 'inactive'::text, c.type, null::integer, c.expires_at;
    return;
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return query select false, 'expired'::text, c.type, null::integer, c.expires_at;
    return;
  end if;
  if c.max_usage is not null and c.usage_count >= c.max_usage then
    return query select false, 'exhausted'::text, c.type, 0, c.expires_at;
    return;
  end if;
  return query select
    true,
    'ok'::text,
    c.type,
    case when c.max_usage is null then null else (c.max_usage - c.usage_count) end,
    c.expires_at;
end;
$$;

-- Consume
create or replace function public.consume_activation_code(_code text)
returns table (
  ok boolean,
  reason text,
  remaining integer
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  c public.activation_codes%rowtype;
begin
  select * into c from public.activation_codes where code = _code for update;
  if not found then
    return query select false, 'invalid'::text, null::integer;
    return;
  end if;
  if not c.is_active then
    return query select false, 'inactive'::text, null::integer;
    return;
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return query select false, 'expired'::text, null::integer;
    return;
  end if;
  if c.max_usage is null then
    return query select true, 'ok'::text, null::integer;
    return;
  end if;
  if c.usage_count >= c.max_usage then
    return query select false, 'exhausted'::text, 0;
    return;
  end if;
  update public.activation_codes
    set usage_count = usage_count + 1
    where id = c.id;
  return query select true, 'ok'::text, (c.max_usage - (c.usage_count + 1));
end;
$$;

-- Admin list
create or replace function public.admin_list_codes(_password text)
returns setof public.activation_codes
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin_password(_password) then
    raise exception 'unauthorized';
  end if;
  return query select * from public.activation_codes order by created_at desc;
end;
$$;

-- Admin create
create or replace function public.admin_create_code(
  _password text,
  _type public.activation_code_type
)
returns public.activation_codes
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  new_code text;
  expires timestamptz;
  max_use integer;
  attempts integer := 0;
  inserted public.activation_codes%rowtype;
  prefix text;
begin
  if not public.is_admin_password(_password) then
    raise exception 'unauthorized';
  end if;

  prefix := case _type
    when 'DEMO' then 'DEMO'
    when 'MENSUEL' then '30'
    when 'TRIMESTRIEL' then '90'
  end;

  if _type = 'DEMO' then
    expires := null;
    max_use := 5;
  elsif _type = 'MENSUEL' then
    expires := now() + interval '30 days';
    max_use := null;
  else
    expires := now() + interval '90 days';
    max_use := null;
  end if;

  loop
    new_code := 'MRG-' || prefix || '-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.activation_codes (code, type, expires_at, max_usage)
      values (new_code, _type, expires, max_use)
      returning * into inserted;
      return inserted;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then
        raise exception 'could_not_generate_unique_code';
      end if;
    end;
  end loop;
end;
$$;

-- Admin set active
create or replace function public.admin_set_active(_password text, _id uuid, _active boolean)
returns public.activation_codes
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  updated public.activation_codes%rowtype;
begin
  if not public.is_admin_password(_password) then
    raise exception 'unauthorized';
  end if;
  update public.activation_codes set is_active = _active where id = _id returning * into updated;
  if not found then
    raise exception 'not_found';
  end if;
  return updated;
end;
$$;

-- Admin delete
create or replace function public.admin_delete_code(_password text, _id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_admin_password(_password) then
    raise exception 'unauthorized';
  end if;
  delete from public.activation_codes where id = _id;
end;
$$;

grant execute on function public.validate_activation_code(text) to anon, authenticated;
grant execute on function public.consume_activation_code(text) to anon, authenticated;
grant execute on function public.admin_list_codes(text) to anon, authenticated;
grant execute on function public.admin_create_code(text, public.activation_code_type) to anon, authenticated;
grant execute on function public.admin_set_active(text, uuid, boolean) to anon, authenticated;
grant execute on function public.admin_delete_code(text, uuid) to anon, authenticated;