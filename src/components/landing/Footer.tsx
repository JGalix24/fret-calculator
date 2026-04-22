import { useI18n, WHATSAPP_LINK, WHATSAPP_NUMBER, type Lang } from "@/lib/i18n";

export function Footer() {
  const { lang, setLang, t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border mt-10">
      <div className="container mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l3-9 6 4 6-7 3 5" />
            </svg>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Freight-Calculator</div>
            <div className="text-xs text-muted-foreground">{t("footer.by")} · © {year}</div>
          </div>
        </div>

        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[oklch(0.7_0.18_145)]">
            <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.08.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.44c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44z"/>
          </svg>
          {WHATSAPP_NUMBER}
        </a>

        <div className="glass inline-flex items-center rounded-full p-1 text-xs font-medium">
          {(["fr", "en"] as const).map((l: Lang) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                lang === l
                  ? "bg-[image:var(--gradient-primary)] text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
