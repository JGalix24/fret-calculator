import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { consumeCode } from "@/lib/activation";
import { clearSession, getSession, updateRemaining } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { usePaywall } from "@/lib/paywall";

export type ConsumeUI =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; remaining: number | null }
  | { state: "error"; message: string; fatal: boolean };

export function useConsume() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { openPaywall } = usePaywall();
  const [status, setStatus] = useState<ConsumeUI>({ state: "idle" });

  const consume = useCallback(async (): Promise<boolean> => {
    const session = getSession();
    if (!session) {
      navigate({ to: "/activate" });
      return false;
    }
    setStatus({ state: "loading" });
    const r = await consumeCode(session.code);
    if (r.ok) {
      updateRemaining(r.remaining);
      setStatus({ state: "ok", remaining: r.remaining });
      return true;
    }
    if (r.reason === "exhausted") {
      openPaywall();
      setStatus({ state: "error", message: t("app.exhausted.body"), fatal: true });
      return false;
    }
    if (r.reason === "expired" || r.reason === "inactive" || r.reason === "invalid") {
      clearSession();
      navigate({ to: "/activate" });
      return false;
    }
    setStatus({ state: "error", message: t("app.error.calc"), fatal: false });
    return false;
  }, [navigate, t, openPaywall]);

  const reset = useCallback(() => setStatus({ state: "idle" }), []);

  return { status, consume, reset };
}
