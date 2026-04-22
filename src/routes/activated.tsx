import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useI18n, buildWhatsappLink, type WhatsappContext } from "@/lib/i18n";
import { getSession, clearSession, setSession } from "@/lib/session";
import { validateCode } from "@/lib/activation";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";

export const Route = createFileRoute("/activated")({
  validateSearch: (search: Record<string, unknown>) => ({
    expired: search.expired === 1 || search.expired === "1" ? 1 : undefined,
  }),
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

const PLAN_DURATION_DAYS: Record<string, number> = {
  MENSUEL: 30,
  TRIMESTRIEL: 90,
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
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { expired: expiredFlag } = Route.useSearch();
  const [session, setLocalSession] = useState(() => getSession());
  const [, setTick] = useState(0);
  const [validating, setValidating] = useState(true);
  const [serverExpired, setServerExpired] = useState(false);

  useEffect(() => {
    if (!session && !expiredFlag) navigate({ to: "/activate" });
  }, [session, expiredFlag, navigate]);

  // Server-side revalidation on mount (source of truth)
  useEffect(() => {
    let cancelled = false;
    const s = getSession();
    if (!s) {
      setValidating(false);
      return;
    }
    (async () => {
      try {
        const r = await validateCode(s.code);
        if (cancelled) return;
        if (r.ok) {
          const updated = {
            ...s,
            type: r.type,
            remaining: r.remaining,
            expiresAt: r.expiresAt,
          };
          setSession(updated);
          setLocalSession(updated);
        } else if (
          r.reason === "expired" ||
          r.reason === "inactive" ||
          r.reason === "invalid" ||
          r.reason === "exhausted"
        ) {
          setServerExpired(true);
        }
      } catch {
        // network failure: keep cached session
      } finally {
        if (!cancelled) setValidating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Periodic refresh + on tab focus
  useSessionRefresh(true);

  // Re-render once a minute to keep the countdown fresh
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!session && !expiredFlag) return null;

  // Compute expiration: prefer server value, otherwise derive from activatedAt + plan duration
  const computedExpiresAt =
    session?.expiresAt ??
    (session?.activatedAt && PLAN_DURATION_DAYS[session.type]
      ? new Date(
          new Date(session.activatedAt).getTime() +
            PLAN_DURATION_DAYS[session.type] * 86_400_000,
        ).toISOString()
      : null);

  const expMs = computedExpiresAt ? new Date(computedExpiresAt).getTime() : null;
  const now = Date.now();
  const isExpired =
    Boolean(expiredFlag) || (expMs !== null && !Number.isNaN(expMs) && expMs < now);
  const daysLeft =
    expMs !== null && !Number.isNaN(expMs) && expMs > now
      ? Math.max(0, Math.ceil((expMs - now) / 86_400_000))
      : 0;

  const planLabel = session ? PLAN_LABEL[session.type]?.[lang] ?? session.type : "";
  const activatedDate = formatDate(session?.activatedAt, lang);
  const expiresDate = formatDate(computedExpiresAt, lang);
  const isDemo = session?.type === "DEMO";

  const labels = {
    title: isExpired
      ? lang === "fr"
        ? "Ton accès a expiré"
        : "Your access has expired"
      : lang === "fr"
        ? "Accès activé !"
        : "Access activated!",
    subtitle: isExpired
      ? lang === "fr"
        ? "Renouvelle ton abonnement pour reprendre tes calculs."
        : "Renew your subscription to resume your calculations."
      : lang === "fr"
        ? "Bienvenue sur Freight-Calculator. Voici le résumé de ton accès."
        : "Welcome to Freight-Calculator. Here is your access summary.",
    plan: lang === "fr" ? "Plan" : "Plan",
    code: lang === "fr" ? "Code" : "Code",
    activated: lang === "fr" ? "Activé le" : "Activated on",
    expires: lang === "fr" ? "Expire le" : "Expires on",
    daysLeft: lang === "fr" ? "Jours restants" : "Days left",
    remaining: lang === "fr" ? "Calculs restants" : "Calculations left",
    cta: lang === "fr" ? "Aller au calculateur" : "Go to calculator",
    reactivate:
      lang === "fr" ? "Réactiver mon accès" : "Reactivate my access",
    help: lang === "fr" ? "Besoin d'aide ?" : "Need help?",
    copy: lang === "fr" ? "Copier mon code" : "Copy my code",
    copied: lang === "fr" ? "Code copié !" : "Code copied!",
    copyError:
      lang === "fr"
        ? "Impossible de copier le code"
        : "Could not copy the code",
    back: lang === "fr" ? "← Retour à l'accueil" : "← Back to home",
    days: lang === "fr" ? "jours" : "days",
  };

  const handleCopy = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.code);
      toast.success(labels.copied, { description: session.code });
    } catch {
      toast.error(labels.copyError);
    }
  };

  // Help message: include plan + expiration if available
  const helpMsg =
    lang === "fr"
      ? `Bonjour Mr.G, j'ai besoin d'aide avec Freight-Calculator.\nPlan : ${planLabel}${
          expiresDate ? `\nExpiration : ${expiresDate}` : ""
        }${session ? `\nCode : ${session.code}` : ""}`
      : `Hello Mr.G, I need help with Freight-Calculator.\nPlan: ${planLabel}${
          expiresDate ? `\nExpires: ${expiresDate}` : ""
        }${session ? `\nCode: ${session.code}` : ""}`;
  const helpHref = `https://wa.me/22899584808?text=${encodeURIComponent(helpMsg)}`;

  const renewCtx: WhatsappContext = isExpired ? "renew" : "general";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-40 animate-float"
        style={{ background: isExpired ? "var(--gradient-orange)" : "var(--gradient-green)" }}
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
              background: isExpired ? "var(--gradient-orange)" : "var(--gradient-green)",
              boxShadow: isExpired
                ? "var(--shadow-glow-orange)"
                : "var(--shadow-glow-green)",
            }}
          >
            {isExpired ? (
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
        </motion.div>

        <h1 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight">
          <span className="text-gradient">{labels.title}</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{labels.subtitle}</p>

        {session && (
          <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card/40">
            <Row label={labels.plan} value={planLabel} highlight />
            <Row
              label={labels.code}
              value={<span className="font-mono">{session.code}</span>}
            />
            {activatedDate && <Row label={labels.activated} value={activatedDate} />}
            {expiresDate && !isDemo && (
              <Row label={labels.expires} value={expiresDate} />
            )}
            {!isDemo && !isExpired && expMs !== null && (
              <Row
                label={labels.daysLeft}
                value={
                  <span className="font-semibold text-foreground">
                    {daysLeft} {labels.days}
                  </span>
                }
              />
            )}
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
        )}

        {/* Primary CTA */}
        {isExpired ? (
          <Link
            to="/activate"
            onClick={() => clearSession()}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.02]"
          >
            {labels.reactivate}
          </Link>
        ) : (
          <Link
            to="/app"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.02]"
          >
            {labels.cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Secondary actions */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {session && (
            <button
              type="button"
              onClick={handleCopy}
              className="glass inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {labels.copy}
            </button>
          )}
          <a
            href={isExpired ? buildWhatsappLink(lang, renewCtx) : helpHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.66_0.18_145)] px-4 py-3 text-sm font-semibold text-[#0F172A] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.08.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.44c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44z" />
            </svg>
            {labels.help}
          </a>
        </div>

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
      <dd className={`text-sm text-right ${highlight ? "font-semibold text-foreground" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
