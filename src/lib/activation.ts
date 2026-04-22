import { supabase } from "@/integrations/supabase/client";

export type ActivationType = "DEMO" | "MENSUEL" | "TRIMESTRIEL";

export type ValidateResult =
  | { ok: true; type: ActivationType; remaining: number | null; expiresAt: string | null }
  | { ok: false; reason: "invalid" | "inactive" | "expired" | "exhausted" | "unknown" };

export type ConsumeResult =
  | { ok: true; remaining: number | null }
  | { ok: false; reason: "invalid" | "inactive" | "expired" | "exhausted" | "unknown" };

type FailReason = "invalid" | "inactive" | "expired" | "exhausted" | "unknown";

export async function validateCode(code: string): Promise<ValidateResult> {
  const { data, error } = await supabase.rpc("validate_activation_code", { _code: code });
  if (error || !data || data.length === 0) {
    return { ok: false, reason: "unknown" };
  }
  const row = data[0];
  if (!row.ok) {
    return { ok: false, reason: ((row.reason ?? "unknown") as FailReason) };
  }
  return {
    ok: true,
    type: row.code_type as ActivationType,
    remaining: row.remaining,
    expiresAt: row.expires_at,
  };
}

export async function consumeCode(code: string): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc("consume_activation_code", { _code: code });
  if (error || !data || data.length === 0) {
    return { ok: false, reason: "unknown" };
  }
  const row = data[0];
  if (!row.ok) {
    return { ok: false, reason: ((row.reason ?? "unknown") as FailReason) };
  }
  return { ok: true, remaining: row.remaining };
}

export type CodeRow = {
  id: string;
  code: string;
  type: ActivationType;
  created_at: string;
  expires_at: string | null;
  usage_count: number;
  max_usage: number | null;
  is_active: boolean;
};

export async function adminList(password: string): Promise<CodeRow[]> {
  const { data, error } = await supabase.rpc("admin_list_codes", { _password: password });
  if (error) throw error;
  return (data ?? []) as CodeRow[];
}

export async function adminCreate(password: string, type: ActivationType): Promise<CodeRow> {
  const { data, error } = await supabase.rpc("admin_create_code", {
    _password: password,
    _type: type,
  });
  if (error) throw error;
  return data as CodeRow;
}

export async function adminSetActive(
  password: string,
  id: string,
  active: boolean,
): Promise<CodeRow> {
  const { data, error } = await supabase.rpc("admin_set_active", {
    _password: password,
    _id: id,
    _active: active,
  });
  if (error) throw error;
  return data as CodeRow;
}

export async function adminDelete(password: string, id: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_code", {
    _password: password,
    _id: id,
  });
  if (error) throw error;
}
