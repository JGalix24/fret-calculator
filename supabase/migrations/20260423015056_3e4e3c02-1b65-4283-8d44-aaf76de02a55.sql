CREATE OR REPLACE FUNCTION public.system_create_demo_code_for_ip(_ip_hash text)
RETURNS TABLE(ok boolean, reason text, code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  recent_count integer;
  new_code text;
  attempts integer := 0;
  inserted public.activation_codes%rowtype;
begin
  if _ip_hash is null or length(_ip_hash) < 8 then
    return query select false, 'invalid_ip'::text, null::text;
    return;
  end if;

  -- Une seule démo par IP, à vie (pas de renouvellement)
  select count(*) into recent_count
    from public.demo_grants
    where ip_hash = _ip_hash;

  if recent_count >= 1 then
    return query select false, 'rate_limited'::text, null::text;
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

  insert into public.demo_grants (ip_hash, code_id) values (_ip_hash, inserted.id);

  return query select true, 'ok'::text, inserted.code;
end;
$function$;