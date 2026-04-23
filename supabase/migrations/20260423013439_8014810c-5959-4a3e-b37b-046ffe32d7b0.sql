CREATE OR REPLACE FUNCTION public.system_create_demo_code()
RETURNS TABLE(code text, code_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  new_code text;
  attempts integer := 0;
  inserted public.activation_codes%rowtype;
begin
  loop
    new_code := 'MRG-DEMO-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.activation_codes (code, type, expires_at, max_usage)
      values (new_code, 'DEMO', null, 5)
      returning * into inserted;
      return query select inserted.code, inserted.id;
      return;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then
        raise exception 'could_not_generate_unique_code';
      end if;
    end;
  end loop;
end;
$function$;