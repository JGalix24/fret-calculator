-- Update system_create_paid_code to handle ANNUEL
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

  prefix := case p.plan
    when 'MENSUEL' then '30'
    when 'TRIMESTRIEL' then '90'
    when 'ANNUEL' then '365'
    else 'DEMO'
  end;
  expires := case p.plan
    when 'MENSUEL' then now() + interval '30 days'
    when 'TRIMESTRIEL' then now() + interval '90 days'
    when 'ANNUEL' then now() + interval '365 days'
    else null
  end;

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

-- Update admin_create_code to handle ANNUEL
create or replace function public.admin_create_code(_password text, _type public.activation_code_type)
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
    when 'ANNUEL' then '365'
  end;

  if _type = 'DEMO' then
    expires := null;
    max_use := 5;
  elsif _type = 'MENSUEL' then
    expires := now() + interval '30 days';
    max_use := null;
  elsif _type = 'TRIMESTRIEL' then
    expires := now() + interval '90 days';
    max_use := null;
  else
    expires := now() + interval '365 days';
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
