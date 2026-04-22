import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getSession()) {
      throw redirect({ to: "/activate" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell />
  );
}

// Re-export Outlet so the layout file matches TanStack expectations.
void Outlet;
