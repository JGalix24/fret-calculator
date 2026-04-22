import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/activated")({
  head: () => ({
    meta: [
      { title: "Accès activé — Freight-Calculator" },
      {
        name: "description",
        content:
          "Votre accès Freight-Calculator est activé. Résumé de votre plan et accès aux calculateurs de fret.",
      },
      { property: "og:title", content: "Accès activé — Freight-Calculator" },
      {
        property: "og:description",
        content: "Votre accès est confirmé. Commencez à calculer vos frais de fret.",
      },
    ],
  }),
  component: ActivatedPage,
});

const PLAN_LABEL: Record<string, { fr: string; en: string }> = {
  DEMO: { fr: "Démo (5 calculs offerts)", en: "Demo (5 free calculations)" },
  MENSUEL: { fr: "Mensuel (30 jours)", en: "Monthly (30 days)" },
  TRIMESTRIEL: { fr: "Trimestriel (90 jours)", en: "Quarterly (90 days)" },
};

function formatDate(iso: string | null | undefined, lang: "fr" | "en"): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ActivatedPage() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session) navigate({ to: "/activate" });
  }, [session, navigate]);

  if (!session) return null;

  const planLabel = PLAN_LABEL[session.type]?.[lang] ?? session.type;
  const activatedDate = formatDate(session.activatedAt, lang);
  const expiresDate = formatDate(session.expiresAt, lang);
  const isDemo = session.type === "DEMO";

  const labels = {
    title: lang === "fr" ? "Accès activé !" : "Access activated!",
    subtitle:
      lang === "fr"
        ? "Bienvenue sur Freight-Calculator. Voici le résumé de ton accès."
        : "Welcome to Freight-Calculator. Here is your access summary.",
    plan: lang === "fr" ? "Plan" : "Plan",
    code: lang === "fr" ? "Code" : "Code",
    activated: lang === "fr" ? "Activé le" : "Activated on",
    expires: lang === "fr" ? "Expire le" : "Expires on",
    remaining: lang === "fr" ? "Calculs restants" : "Calculations left",
    cta: lang === "fr" ? "Aller au calculateur" : "Go to calculator",
    back: lang === "fr" ? "← Retour à l'accueil" : "← Back to home",
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-40 animate-float"
        style={{ background: "var(--gradient-green)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30 animate-float"
        style={{ background: "var(--gradient-blue)", animationDelay: "1.5s" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 md:p-10 shadow-[var(--shadow-elegant)]"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
          className="flex justify-center"
        >
          <div
            className="h-16 w-16 rounded-2xl grid place-items-center"
            style={{
              background: "var(--gradient-green)",
              boxShadow: "var(--shadow-glow-green)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </motion.div>

        <h1 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-gradient">{labels.title}</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{labels.subtitle}</p>

        <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card/40">
          <Row label={labels.plan} value={planLabel} highlight />
          <Row label={labels.code} value={<span className="font-mono">{session.code}</span>} />
          {activatedDate && <Row label={labels.activated} value={activatedDate} />}
          {expiresDate && !isDemo && <Row label={labels.expires} value={expiresDate} />}
          {isDemo && session.remaining !== null && session.remaining !== undefined && (
            <Row
              label={labels.remaining}
              value={
                <span className="font-semibold text-foreground">
                  {session.remaining} / 5
                </span>
              }
            />
          )}
        </dl>

        <Link
          to="/app"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.02]"
        >
          {labels.cta}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {labels.back}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm text-right ${
          highlight ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
