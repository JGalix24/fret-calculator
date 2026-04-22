import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { validateCode } from "@/lib/activation";
import { clearSession, getSession, setSession } from "@/lib/session";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Polls the server periodically (and on tab focus) to keep the session
 * in sync: refreshes `expiresAt` / `remaining` and kicks the user out
 * if the code has been disabled, expired, or exhausted server-side.
 */
export function useSessionRefresh(enabled = true) {
  const navigate = useNavigate();
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      if (inFlight.current) return;
      const session = getSession();
      if (!session) return;
      inFlight.current = true;
      try {
        const r = await validateCode(session.code);
        if (r.ok) {
          setSession({
            ...session,
            type: r.type,
            remaining: r.remaining,
            expiresAt: r.expiresAt,
          });
        } else if (
          r.reason === "expired" ||
          r.reason === "inactive" ||
          r.reason === "invalid" ||
          r.reason === "exhausted"
        ) {
          clearSession();
          navigate({ to: "/activated", search: { expired: 1 } });
        }
      } catch {
        // network error: keep current session, retry next tick
      } finally {
        inFlight.current = false;
      }
    };

    const id = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, navigate]);
}
