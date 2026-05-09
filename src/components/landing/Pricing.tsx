import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import { createCheckoutSession, createDemoCode } from "@/utils/payments.functions";
import { getClientFingerprint } from "@/lib/fingerprint";

const DEMO_USED_KEY = "fc.demo.used";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

type PaidPlan = "MENSUEL" | "TRIMESTRIEL";

export function Pricing() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const checkoutFn = useServerFn(createCheckoutSession);
  const demoFn = useServerFn(createDemoCode);

  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | "DEMO" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shortRef, setShortRef] = useState<string | null>(null);

  const handlePay = async (plan: PaidPlan) => {
    setErrorMsg(null);
    setLoadingPlan(plan);
    try {
      const res = await checkoutFn({ data: { plan } });
      if (res.ok && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setErrorMsg(
        ("error" in res && res.error)
          ? res.error
          : "Impossible de démarrer le paiement. Réessayez ou contactez-nous sur WhatsApp.",
      );
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoadingPlan((p) => (p === plan ? null : p));
    }
  };

  const handleDemo = async () => {
    setErrorMsg(null);
    setShortRef(null);
    setLoadingPlan("DEMO");
    try {
      const fp = getClientFingerprint();
      const res = await demoFn({ data: { signal: fp.signal } });
      if (res.ok && res.code) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(DEMO_USED_KEY, "1");
        }
        navigate({ to: "/activate", search: { code: res.code } as never });
        return;
      }
      if (typeof window !== "undefined") window.localStorage.setItem(DEMO_USED_KEY, "1");
      setErrorMsg(res.error ?? "Impossible de générer un code démo. Réessayez dans un instant.");
      if ("shortRef" in res && res.shortRef) setShortRef(res.shortRef as string);
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur réseau. Réessayez.");
    } finally {
      setLoadingPlan((p) => (p === "DEMO" ? null : p));
    }
  };

  return (
    <section id="pricing" className="relative py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto"
        >
          <span className="text-gradient">{t("pricing.title")}</span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <PriceCard
            tone="demo"
            name="Démo gratuit"
            price="0"
            unit="FCFA"
            features={[
              "5 calculs offerts",
              "Tous les modes de calcul",
              "Sans inscription, sans carte",
            ]}
            cta={loadingPlan === "DEMO" ? "Génération du code…" : "Essayer gratuitement"}
            onClick={handleDemo}
            disabled={loadingPlan !== null}
            note="Activation immédiate · 1 clic"
            whatsappHref={buildWhatsappLink(lang, "demo")}
          />
          <PriceCard
            tone="blue"
            name={t("pricing.month.name")}
            price={t("pricing.month.price")}
            unit={t("pricing.month.unit")}
            features={[
              t("pricing.month.feat1"),
              t("pricing.month.feat2"),
              t("pricing.month.feat3"),
            ]}
            cta={loadingPlan === "MENSUEL" ? "Redirection vers paiement…" : "Payer maintenant"}
            onClick={() => handlePay("MENSUEL")}
            disabled={loadingPlan !== null}
            note="Mixx by Yas · Moov Money · Carte"
            whatsappHref={buildWhatsappLink(lang, "mensuel")}
          />
          <PriceCard
            tone="violet"
            badge={t("pricing.quarter.badge")}
            name={t("pricing.quarter.name")}
            price={t("pricing.quarter.price")}
            unit={t("pricing.quarter.unit")}
            extra={t("pricing.quarter.save")}
            features={[
              t("pricing.quarter.feat1"),
              t("pricing.quarter.feat2"),
              t("pricing.quarter.feat3"),
            ]}
            cta={loadingPlan === "TRIMESTRIEL" ? "Redirection vers paiement…" : "Payer maintenant"}
            onClick={() => handlePay("TRIMESTRIEL")}
            disabled={loadingPlan !== null}
            note="Mixx by Yas · Moov Money · Carte"
            whatsappHref={buildWhatsappLink(lang, "trimestriel")}
          />
        </div>

        {errorMsg && (
          <div className="mt-6 mx-auto max-w-md text-center space-y-3">
            <p className="text-sm text-destructive">{errorMsg}</p>
            {shortRef && (
              <div className="glass inline-flex flex-col items-center gap-2 rounded-2xl px-5 py-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Votre référence
                </div>
                <div className="font-mono text-base font-bold text-foreground tracking-widest">
                  {shortRef}
                </div>
                <a
                  href={buildWhatsappLink(lang, "demo", { code: shortRef, page: "Pricing / Démo bloquée" })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.18_145)] px-5 py-2.5 text-xs font-semibold text-[#0F172A] hover:scale-[1.03] transition-transform"
                >
                  Contacter sur WhatsApp avec ma référence
                </a>
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Activation automatique dès la confirmation du paiement · Aucun compte à créer
        </p>
      </div>
    </section>
  );
}

function PriceCard({
  tone,
  badge,
  name,
  price,
  unit,
  extra,
  features,
  cta,
  onClick,
  disabled,
  note,
  whatsappHref,
}: {
  tone: "demo" | "blue" | "violet";
  badge?: string;
  name: string;
  price: string;
  unit: string;
  extra?: string;
  features: string[];
  cta: string;
  onClick: () => void;
  disabled: boolean;
  note: string;
  whatsappHref: string;
}) {
  const highlight = tone === "violet";
  const priceGradient =
    tone === "demo"
      ? "var(--gradient-green)"
      : tone === "violet"
        ? "var(--gradient-violet)"
        : "var(--gradient-blue)";
  const checkBg =
    tone === "demo"
      ? "var(--gradient-green)"
      : tone === "violet"
        ? "var(--gradient-violet)"
        : "var(--gradient-blue)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-3xl p-7 md:p-8 transition-transform hover:-translate-y-1 ${
        highlight ? "glass-strong ring-1 ring-primary/40" : "glass"
      }`}
      style={highlight ? { boxShadow: "var(--shadow-glow-violet)" } : undefined}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground"
            style={{ background: "var(--gradient-violet)", boxShadow: "var(--shadow-glow-violet)" }}
          >
            {badge}
          </span>
        </div>
      )}
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{name}</div>
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="text-5xl md:text-6xl font-extrabold tabular-nums"
          style={{
            background: priceGradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {price}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {extra && (
        <div className="mt-1 inline-flex items-center rounded-full bg-brand-green/15 px-2.5 py-0.5 text-xs font-medium text-[oklch(0.7_0.16_160)]">
          {extra}
        </div>
      )}
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm">
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-primary-foreground"
              style={{ background: checkBg }}
            >
              <Check />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 ${
          tone === "demo" ? "text-[#0F172A]" : "text-primary-foreground"
        }`}
        style={{
          background:
            tone === "demo"
              ? "oklch(0.7 0.18 145)"
              : tone === "violet"
                ? "var(--gradient-primary)"
                : "var(--gradient-blue)",
          boxShadow:
            tone === "violet" ? "var(--shadow-glow-blue)" : undefined,
        }}
      >
        {cta}
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">{note}</p>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4"
      >
        Problème ? Commander via WhatsApp
      </a>
    </motion.div>
  );
}
