import { supabase } from "@/integrations/supabase/client";

export type LandingSkin = "classic" | "editorial";

export function getLocalSkinOverride(): LandingSkin | null {
  try {
    const v = localStorage.getItem("landing_skin_override");
    return v === "editorial" || v === "classic" ? v : null;
  } catch { return null; }
}

export async function getLandingSkin(): Promise<LandingSkin> {
  const override = getLocalSkinOverride();
  if (override) return override;
  const { data, error } = await supabase.rpc("get_landing_skin");
  if (error || !data) return "classic";
  return data === "editorial" ? "editorial" : "classic";
}

export async function adminSetLandingSkin(
  password: string,
  skin: LandingSkin,
): Promise<LandingSkin> {
  const { data, error } = await supabase.rpc("admin_set_landing_skin", {
    _password: password,
    _skin: skin,
  });
  if (error) throw error;
  return (data as LandingSkin) ?? skin;
}
