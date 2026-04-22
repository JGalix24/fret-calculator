import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { clearSession, getSession } from "@/lib/session";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const session = getSession();
    if (!session) {
      throw redirect({ to: "/activate" });
    }
    // Block access if expired
    if (session.expiresAt) {
      const exp = new Date(session.expiresAt).getTime();
      if (!Number.isNaN(exp) && exp < Date.now()) {
        clearSession();
        throw redirect({ to: "/activated", search: { expired: 1 } });
      }
    }
    // DEMO with no remaining
    if (session.type === "DEMO" && session.remaining !== null && session.remaining !== undefined && session.remaining <= 0) {
      throw redirect({ to: "/activated", search: { expired: 1 } });
    }
  },
  component: AppShell,
});
