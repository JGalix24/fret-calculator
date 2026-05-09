import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import { usePaywall } from "@/lib/paywall";
import { getSession } from "@/lib/session";
import { createCheckoutSession } from "@/utils/payments.functions";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);


export function PaywallModal() {
  const { lang } = useI18n();
  const { isOpen, page, closePaywall } = usePaywall();
  const session = getSession();
  const checkout = useServerFn(createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState<"MENSUEL" | "TRIMESTRIEL" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFr = lang === "fr";
  const t = {
    title: isFr ? "Vos 5 essais gratuits sont terminés" : "Your 5 free trials are over",
    sub: isFr
      ? "Choisissez une formule pour continuer à calculer sans limite."
      : "Choose a plan to keep calculating without limits.",
    monthName: isFr ? "Mensuel" : "Monthly",
    quarterName: isFr ? "Trimestriel" : "Quarterly",
    monthUnit: isFr ? "FCFA / mois" : "FCFA / month",
    quarterUnit: isFr ? "FCFA / 3 mois" : "FCFA / 3 months",
    badge: isFr ? "Économie 997 FCFA" : "Save 997 FCFA",
    feat1m: isFr ? "Accès illimité 30 jours" : "Unlimited access 30 days",
    feat1q: isFr ? "Accès illimité 90 jours" : "Unlimited access 90 days",
    feat2: isFr ? "Tous les modes de calcul" : "All calculation modes",
    feat3: isFr ? "Export PDF" : "PDF export",
    cta: isFr ? "Payer ce plan" : "Pay this plan",
    loading: isFr ? "Redirection vers paiement…" : "Redirecting to payment…",
    pay: isFr ? "Mixx by Yas ou Moov Money" : "Mixx by Yas or Moov Money",
    have: isFr ? "J'ai déjà un code" : "I already have a code",
    note: isFr
      ? "Code activation envoyé immédiatement après confirmation du paiement."
      : "Activation code delivered instantly after payment confirmation.",
    fallback: isFr ? "Problème ? Nous contacter" : "Issue? Contact us",
    err: isFr ? "Erreur de paiement, réessayez ou contactez-nous." : "Payment error, retry or contact us.",
  };

  const onChoose = async (plan: "MENSUEL" | "TRIMESTRIEL") => {
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await checkout({ data: { plan } });
      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setError(t.err);
    } catch (e) {
      console.error(e);
      setError(t.err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const fallbackHref = buildWhatsappLink(lang, "general", {
    code: session?.code,
    page,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Block closing — paywall is non-dismissible
        if (!open) return;
      }}
    >
      <DialogContent
        className="max-w-2xl border-border bg-background p-0 overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div
          className="px-6 pt-7 pb-5 text-center"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="mx-auto h-12 w-12 rounded-2xl grid place-items-center"
            style={{ background: "var(--gradient-orange)", boxShadow: "var(--shadow-glow-orange)" }}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <DialogTitle className="mt-4 text-xl md:text-2xl font-bold tracking-tight">
            <span className="text-gradient">{t.title}</span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {t.sub}
          </DialogDescription>
        </div>

        <div className="px-6 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlanCard
            name={t.monthName}
            price="1 499"
            unit={t.monthUnit}
            features={[t.feat1m, t.feat2, t.feat3]}
            cta={loadingPlan === "MENSUEL" ? t.loading : t.cta}
            onClick={() => onChoose("MENSUEL")}
            disabled={loadingPlan !== null}
            loading={loadingPlan === "MENSUEL"}
            pay={t.pay}
            highlight={false}
          />
          <PlanCard
            name={t.quarterName}
            price="3 500"
            unit={t.quarterUnit}
            features={[t.feat1q, t.feat2, t.feat3]}
            cta={loadingPlan === "TRIMESTRIEL" ? t.loading : t.cta}
            onClick={() => onChoose("TRIMESTRIEL")}
            disabled={loadingPlan !== null}
            loading={loadingPlan === "TRIMESTRIEL"}
            pay={t.pay}
            highlight
            badge={t.badge}
          />
        </div>

        {error && (
          <p className="px-6 text-center text-xs text-destructive">{error}</p>
        )}

        <div className="px-6 pb-6 pt-3 text-center">
          <p className="text-[11px] text-muted-foreground">{t.note}</p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <Link
              to="/activate"
              onClick={() => closePaywall()}
              className="text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {t.have}
            </Link>
            <span className="text-border">·</span>
            <a
              href={fallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              {t.fallback}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({
  name,
  price,
  unit,
  features,
  cta,
  onClick,
  disabled,
  loading,
  pay,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  unit: string;
  features: string[];
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  pay: string;
  highlight: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl p-5 ${highlight ? "glass-strong ring-1 ring-primary/40" : "glass"}`}
      style={highlight ? { boxShadow: "var(--shadow-glow-violet)" } : undefined}
    >
      {badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
            style={{ background: "var(--gradient-violet)" }}
          >
            {badge}
          </span>
        </div>
      )}
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{name}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className="text-3xl md:text-4xl font-extrabold tabular-nums"
          style={{
            background: highlight ? "var(--gradient-violet)" : "var(--gradient-blue)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {price}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs">
            <span
              className="grid h-4 w-4 place-items-center rounded-full text-primary-foreground shrink-0"
              style={{ background: highlight ? "var(--gradient-violet)" : "var(--gradient-blue)" }}
            >
              <Check />
            </span>
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] hover:scale-[1.02] transition-transform px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
        ) : null}
        {cta}
      </button>
      <p className="mt-2 text-center text-[10px] text-muted-foreground">{pay}</p>
    </div>
  );
}
