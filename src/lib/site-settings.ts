import { supabase } from "@/integrations/supabase/client";

export type LandingSkin = "classic" | "editorial";

export async function getLandingSkin(): Promise<LandingSkin> {
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
