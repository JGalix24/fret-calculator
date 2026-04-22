import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { clearSession, getSession, setSession } from "@/lib/session";
import { validateCode } from "@/lib/activation";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const session = getSession();
    if (!session) {
      throw redirect({ to: "/activate" });
    }
    // Local fast checks first (instant UX)
    if (session.expiresAt) {
      const exp = new Date(session.expiresAt).getTime();
      if (!Number.isNaN(exp) && exp < Date.now()) {
        clearSession();
        throw redirect({ to: "/activated", search: { expired: 1 } });
      }
    }
    if (
      session.type === "DEMO" &&
      session.remaining !== null &&
      session.remaining !== undefined &&
      session.remaining <= 0
    ) {
      throw redirect({ to: "/activated", search: { expired: 1 } });
    }

    // Server-side revalidation (source of truth)
    try {
      const r = await validateCode(session.code);
      if (!r.ok) {
        if (
          r.reason === "expired" ||
          r.reason === "inactive" ||
          r.reason === "invalid" ||
          r.reason === "exhausted"
        ) {
          clearSession();
          throw redirect({ to: "/activated", search: { expired: 1 } });
        }
        // unknown: keep going on cached session
      } else {
        setSession({
          ...session,
          type: r.type,
          remaining: r.remaining,
          expiresAt: r.expiresAt,
        });
      }
    } catch (e) {
      // Re-throw redirects, swallow network errors
      if (e && typeof e === "object" && "isRedirect" in e) throw e;
    }
  },
  component: AppShell,
});
