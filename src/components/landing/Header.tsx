import { Link } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
import { ThemeToggle } from "@/lib/theme";

export function Header() {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 -z-10 bg-background/60 backdrop-blur-xl border-b border-border" />
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-xl bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow-blue)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l3-9 6 4 6-7 3 5" />
              <path d="M3 21h18" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Freight-Calculator</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Togo · West Africa
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LangSwitcher lang={lang} onChange={setLang} />
          <ThemeToggle />
          <Link
            to="/activate"
            className="hidden sm:inline-flex items-center rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.03]"
          >
            {t("nav.try")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="glass inline-flex items-center rounded-full p-1 text-xs font-medium">
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            lang === l
              ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow-blue)]"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
