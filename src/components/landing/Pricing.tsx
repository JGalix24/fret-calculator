import { motion } from "framer-motion";
import { useI18n, WHATSAPP_LINK, WHATSAPP_NUMBER } from "@/lib/i18n";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export function Pricing() {
  const { t } = useI18n();

  return (
    <section className="relative py-20 md:py-28">
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

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <PriceCard
            highlight={false}
            name={t("pricing.month.name")}
            price={t("pricing.month.price")}
            unit={t("pricing.month.unit")}
            features={[
              t("pricing.month.feat1"),
              t("pricing.month.feat2"),
              t("pricing.month.feat3"),
            ]}
            cta={t("pricing.cta")}
          />
          <PriceCard
            highlight
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
            cta={t("pricing.cta")}
          />
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">{t("pricing.note")}</p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.66_0.18_145)] px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.08.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.44h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44zM12.05 21.6h-.01a9.83 9.83 0 0 1-5-1.37l-.36-.21-3.8 1 1.02-3.7-.24-.38a9.83 9.83 0 0 1-1.5-5.1c0-5.43 4.42-9.84 9.86-9.84 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.85 9.85zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.57-.48-.5-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.07 4.49.71.3 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z"/>
            </svg>
            {WHATSAPP_NUMBER}
          </a>
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  highlight,
  badge,
  name,
  price,
  unit,
  extra,
  features,
  cta,
}: {
  highlight: boolean;
  badge?: string;
  name: string;
  price: string;
  unit: string;
  extra?: string;
  features: string[];
  cta: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-3xl p-7 md:p-8 transition-transform hover:-translate-y-1 ${
        highlight
          ? "glass-strong ring-1 ring-primary/40"
          : "glass"
      }`}
      style={
        highlight
          ? { boxShadow: "var(--shadow-glow-violet)" }
          : undefined
      }
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
          style={
            highlight
              ? {
                  background: "var(--gradient-violet)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }
              : {
                  background: "var(--gradient-blue)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }
          }
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
              style={{ background: highlight ? "var(--gradient-violet)" : "var(--gradient-blue)" }}
            >
              <Check />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${
          highlight
            ? "text-primary-foreground"
            : "glass text-foreground hover:bg-accent"
        }`}
        style={
          highlight
            ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" }
            : undefined
        }
      >
        {cta}
      </a>
    </motion.div>
  );
}
