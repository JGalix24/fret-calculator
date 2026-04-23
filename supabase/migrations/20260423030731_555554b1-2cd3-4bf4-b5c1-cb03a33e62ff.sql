
-- 1. Add new columns to demo_grants
ALTER TABLE public.demo_grants
  ADD COLUMN IF NOT EXISTS fingerprint_hash text,
  ADD COLUMN IF NOT EXISTS user_agent_hash text,
  ADD COLUMN IF NOT EXISTS accept_language text,
  ADD COLUMN IF NOT EXISTS short_ref text;

CREATE INDEX IF NOT EXISTS idx_demo_grants_fingerprint ON public.demo_grants(fingerprint_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_grants_ip_created ON public.demo_grants(ip_hash, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_grants_short_ref ON public.demo_grants(short_ref) WHERE short_ref IS NOT NULL;

-- 2. New RPC: create demo code with fingerprint, returns short_ref on block
CREATE OR REPLACE FUNCTION public.system_create_demo_code_v2(
  _ip_hash text,
  _fingerprint_hash text,
  _user_agent_hash text,
  _accept_language text
)
RETURNS TABLE(ok boolean, reason text, code text, short_ref text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  fp_count integer;
  ip_count integer;
  new_code text;
  attempts integer := 0;
  inserted public.activation_codes%rowtype;
  new_short_ref text;
begin
  if _ip_hash is null or length(_ip_hash) < 8 then
    return query select false, 'invalid_ip'::text, null::text, null::text;
    return;
  end if;
  if _fingerprint_hash is null or length(_fingerprint_hash) < 8 then
    return query select false, 'invalid_fp'::text, null::text, null::text;
    return;
  end if;

  -- Build short_ref deterministically from fingerprint (first 8 hex chars, formatted XXXX-XXXX)
  new_short_ref := upper(substring(_fingerprint_hash from 1 for 4)) || '-' || upper(substring(_fingerprint_hash from 5 for 4));

  -- Rule 1: same fingerprint in last 30 days -> blocked
  select count(*) into fp_count
    from public.demo_grants
    where fingerprint_hash = _fingerprint_hash
      and created_at > now() - interval '30 days';

  if fp_count >= 1 then
    return query select false, 'rate_limited'::text, null::text, new_short_ref;
    return;
  end if;

  -- Rule 2: same IP with 3+ distinct codes in last 7 days -> blocked
  select count(*) into ip_count
    from public.demo_grants
    where ip_hash = _ip_hash
      and created_at > now() - interval '7 days';

  if ip_count >= 3 then
    return query select false, 'rate_limited'::text, null::text, new_short_ref;
    return;
  end if;

  loop
    new_code := 'MRG-DEMO-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.activation_codes (code, type, expires_at, max_usage)
      values (new_code, 'DEMO', null, 5)
      returning * into inserted;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then
        raise exception 'could_not_generate_unique_code';
      end if;
    end;
  end loop;

  insert into public.demo_grants (ip_hash, code_id, fingerprint_hash, user_agent_hash, accept_language, short_ref)
  values (_ip_hash, inserted.id, _fingerprint_hash, _user_agent_hash, _accept_language, new_short_ref);

  return query select true, 'ok'::text, inserted.code, new_short_ref;
end;
$function$;

-- 3. Admin lookup by short_ref
CREATE OR REPLACE FUNCTION public.admin_lookup_demo_ref(_password text, _short_ref text)
RETURNS TABLE(
  found boolean,
  short_ref text,
  granted_at timestamptz,
  code text,
  code_type activation_code_type,
  usage_count integer,
  max_usage integer,
  is_active boolean,
  expires_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  normalized text;
begin
  if not public.is_admin_password(_password) then
    raise exception 'unauthorized';
  end if;

  normalized := upper(regexp_replace(coalesce(_short_ref, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(normalized) < 8 then
    return query select false, null::text, null::timestamptz, null::text, null::public.activation_code_type, null::integer, null::integer, null::boolean, null::timestamptz;
    return;
  end if;
  normalized := substring(normalized from 1 for 4) || '-' || substring(normalized from 5 for 4);

  return query
    select
      true,
      g.short_ref,
      g.created_at,
      ac.code,
      ac.type,
      ac.usage_count,
      ac.max_usage,
      ac.is_active,
      ac.expires_at
    from public.demo_grants g
    left join public.activation_codes ac on ac.id = g.code_id
    where g.short_ref = normalized
    order by g.created_at desc
    limit 1;

  if not found then
    return query select false, normalized, null::timestamptz, null::text, null::public.activation_code_type, null::integer, null::integer, null::boolean, null::timestamptz;
  end if;
end;
$function$;
