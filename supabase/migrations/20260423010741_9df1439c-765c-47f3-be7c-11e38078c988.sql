-- Enum for payment status
do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  plan public.activation_code_type not null,
  amount integer not null,
  currency text not null default 'XOF',
  status public.payment_status not null default 'pending',
  provider text not null default 'paydunya',
  provider_token text,
  provider_ref text,
  customer_phone text,
  customer_name text,
  customer_email text,
  code_id uuid references public.activation_codes(id) on delete set null,
  generated_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists payments_provider_token_idx on public.payments(provider_token);
create index if not exists payments_status_idx on public.payments(status);

alter table public.payments enable row level security;

drop policy if exists payments_no_direct_access on public.payments;
create policy payments_no_direct_access on public.payments for all using (false) with check (false);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- System function: create a paid activation code (called by webhook with service role)
create or replace function public.system_create_paid_code(_payment_id uuid)
returns table(code text, code_id uuid)
language plpgsql
security definer
set search_path = public
as $function$
declare
  p public.payments%rowtype;
  new_code text;
  expires timestamptz;
  attempts integer := 0;
  inserted public.activation_codes%rowtype;
  prefix text;
begin
  select * into p from public.payments where id = _payment_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  if p.code_id is not null then
    select ac.code, ac.id into new_code, inserted.id from public.activation_codes ac where ac.id = p.code_id;
    return query select new_code, inserted.id;
    return;
  end if;

  prefix := case p.plan when 'MENSUEL' then '30' when 'TRIMESTRIEL' then '90' else 'DEMO' end;
  expires := case p.plan when 'MENSUEL' then now() + interval '30 days' when 'TRIMESTRIEL' then now() + interval '90 days' else null end;

  loop
    new_code := 'MRG-' || prefix || '-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.activation_codes (code, type, expires_at, max_usage)
      values (new_code, p.plan, expires, null)
      returning * into inserted;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then raise exception 'could_not_generate_unique_code'; end if;
    end;
  end loop;

  update public.payments
    set code_id = inserted.id, generated_code = new_code, status = 'paid', paid_at = coalesce(paid_at, now())
    where id = _payment_id;

  return query select inserted.code, inserted.id;
end;
$function$;

-- System function: insert a pending payment row (called by createCheckoutSession with service role)
create or replace function public.system_create_pending_payment(
  _plan public.activation_code_type,
  _amount integer,
  _customer_phone text default null,
  _customer_name text default null,
  _customer_email text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare new_id uuid;
begin
  insert into public.payments (plan, amount, customer_phone, customer_name, customer_email)
  values (_plan, _amount, _customer_phone, _customer_name, _customer_email)
  returning id into new_id;
  return new_id;
end;
$function$;

-- System function: attach provider token to payment
create or replace function public.system_attach_provider_token(_payment_id uuid, _token text)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  update public.payments set provider_token = _token where id = _payment_id;
end;
$function$;

-- System function: mark payment as failed/cancelled
create or replace function public.system_mark_payment_status(_payment_id uuid, _status public.payment_status, _provider_ref text default null)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  update public.payments
    set status = _status,
        provider_ref = coalesce(_provider_ref, provider_ref)
    where id = _payment_id;
end;
$function$;

-- System function: get payment by id (for polling page)
create or replace function public.system_get_payment(_payment_id uuid)
returns table(id uuid, status public.payment_status, plan public.activation_code_type, generated_code text, amount integer)
language sql
security definer
set search_path = public
as $function$
  select id, status, plan, generated_code, amount from public.payments where id = _payment_id;
$function$;