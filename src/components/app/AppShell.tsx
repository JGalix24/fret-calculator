import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
import { clearSession, getSession } from "@/lib/session";
import { useNavigate } from "@tanstack/react-router";

type Tab = { to: "/app" | "/app/sea" | "/app/air" | "/app/compare" | "/app/multi"; label: { fr: string; en: string }; exact?: boolean };
const tabs: Tab[] = [
  { to: "/app", label: { fr: "Accueil", en: "Home" }, exact: true },
  { to: "/app/sea", label: { fr: "Bateau", en: "Sea" } },
  { to: "/app/air", label: { fr: "Avion", en: "Air" } },
  { to: "/app/compare", label: { fr: "Comparer", en: "Compare" } },
  { to: "/app/multi", label: { fr: "Multi-colis", en: "Multi" } },
];

export function AppShell() {
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const loc = useLocation();
  const session = getSession();

  const onLogout = () => {
    clearSession();
    navigate({ to: "/activate" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <header className="relative border-b border-border/60 backdrop-blur-md bg-background/40">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/app" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l3-9 6 4 6-7 3 5" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight">Freight-Calculator</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {tabs.map((t) => {
              const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    active
                      ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label[lang]}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {session && (
              <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-card/50 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {session.type}
              </span>
            )}
            <div className="glass inline-flex items-center rounded-full p-0.5 text-xs font-medium">
              {(["fr", "en"] as const).map((l: Lang) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    lang === l
                      ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              title={lang === "fr" ? "Quitter la session" : "Sign out"}
            >
              {lang === "fr" ? "Quitter" : "Exit"}
            </button>
          </div>
        </div>

        <div className="md:hidden border-t border-border/60 overflow-x-auto">
          <div className="container mx-auto px-2 flex gap-1 py-2 text-xs">
            {tabs.map((t) => {
              const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label[lang]}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 md:px-6 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
