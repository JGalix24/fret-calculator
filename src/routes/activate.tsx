import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n, WHATSAPP_LINK, WHATSAPP_NUMBER } from "@/lib/i18n";
import { parseCode, setSession } from "@/lib/session";

export const Route = createFileRoute("/activate")({
  head: () => ({
    meta: [
      { title: "Activer mon accès — Freight-Calculator" },
      {
        name: "description",
        content:
          "Entrez votre code d'activation Freight-Calculator pour accéder aux calculateurs de fret maritime et aérien.",
      },
      { property: "og:title", content: "Activer mon accès — Freight-Calculator" },
      {
        property: "og:description",
        content: "Code d'activation requis. Pas de création de compte.",
      },
    ],
  }),
  component: ActivatePage,
});

function ActivatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const parsed = parseCode(code);
    if (!parsed) {
      setError(t("activate.invalid"));
      setCode("");
      return;
    }
    setSession(parsed);
    navigate({ to: "/app" });
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-40 animate-float"
        style={{ background: "var(--gradient-blue)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30 animate-float"
        style={{ background: "var(--gradient-violet)", animationDelay: "1.5s" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elegant)]"
      >
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-[image:var(--gradient-primary)] grid place-items-center shadow-[var(--shadow-glow-blue)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l3-9 6 4 6-7 3 5" />
            </svg>
          </div>
        </div>
        <h1 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-gradient">{t("activate.title")}</span>
        </h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("activate.placeholder")}
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-xl bg-input border border-border px-4 py-3.5 text-center text-lg font-mono tracking-[0.2em] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.02]"
          >
            {t("activate.validate")}
          </button>
          {error && (
            <p className="text-xs text-center text-destructive pt-1">{error}</p>
          )}
          {message && (
            <p className="text-xs text-center text-brand-orange-glow pt-1">{message}</p>
          )}
          <p className="text-[11px] text-center text-muted-foreground/70 pt-1">
            {t("activate.hint")}
          </p>
        </form>

        <div className="my-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t("activate.no_code")}
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.66_0.18_145)] px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.08.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.44c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44z"/>
          </svg>
          {t("activate.whatsapp")} · {WHATSAPP_NUMBER}
        </a>

        <div className="mt-8 rounded-2xl bg-card/40 border border-border p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Tarifs
          </div>
          <div className="mt-2 text-sm font-medium">{t("activate.pricing")}</div>
          <div className="mt-2 text-xs text-muted-foreground">{t("activate.payments")}</div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← {t("activate.back")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
