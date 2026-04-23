import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import { createDemoCode } from "@/utils/payments.functions";
import { getClientFingerprint } from "@/lib/fingerprint";

const DEMO_USED_KEY = "fc.demo.used";

export function Hero() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const demoFn = useServerFn(createDemoCode);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shortRef, setShortRef] = useState<string | null>(null);

  const startDemo = async () => {
    setErr(null);
    setShortRef(null);
    setLoading(true);
    try {
      const fp = getClientFingerprint();
      const res = await demoFn({ data: { signal: fp.signal } });
      if (res.ok && res.code) {
        if (typeof window !== "undefined") window.localStorage.setItem(DEMO_USED_KEY, "1");
        navigate({ to: "/activate", search: { code: res.code } as never });
        return;
      }
      if (typeof window !== "undefined") window.localStorage.setItem(DEMO_USED_KEY, "1");
      setErr(res.error ?? "Impossible de générer un code. Réessayez.");
      if ("shortRef" in res && res.shortRef) setShortRef(res.shortRef as string);
      const el = document.getElementById("pricing");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setErr("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToPricing = () => {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 -z-10 grid-bg opacity-60" />

      {/* Floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-40 animate-float"
        style={{ background: "var(--gradient-blue)" }} />
      <div className="pointer-events-none absolute top-20 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30 animate-float"
        style={{ background: "var(--gradient-violet)", animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
            </span>
            En ligne · Togo · Afrique de l'Ouest
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            <span className="text-gradient">{t("hero.title")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={startDemo}
                disabled={loading}
                className="animate-pulse-glow group relative inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.04] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? "Génération du code…" : t("hero.cta")}
                <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollToPricing}
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Voir les tarifs
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t("hero.badge")}</p>
            {err && (
              <div className="mt-2 max-w-md text-center space-y-2">
                <p className="text-xs text-destructive">{err}</p>
                {shortRef && (
                  <div className="glass inline-flex flex-col items-center gap-2 rounded-2xl px-4 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Votre référence
                    </div>
                    <div className="font-mono text-sm font-bold text-foreground tracking-widest">
                      {shortRef}
                    </div>
                    <a
                      href={buildWhatsappLink(lang, "demo", { code: shortRef, page: "Hero / Démo bloquée" })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.18_145)] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:scale-[1.03] transition-transform"
                    >
                      Contacter sur WhatsApp avec ma référence
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Hero preview cards — Bateau + Avion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 md:mt-20"
          >
            <div className="relative mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
              <PreviewCard
                mode="Fret maritime · CBM"
                volumeLabel="Volume"
                volumeValue="0,84 m³"
                cost="20 000 FCFA"
                eta="30 jours"
                route="Chine · Lomé"
                progressDelay={0.8}
              />
              <PreviewCard
                mode="Fret aérien · kg"
                volumeLabel="Poids"
                volumeValue="12 kg"
                cost="42 000 FCFA"
                eta="1 semaine"
                route="Chine · Lomé"
                progressDelay={1.1}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  mode,
  volumeLabel,
  volumeValue,
  cost,
  eta,
  route,
  progressDelay,
}: {
  mode: string;
  volumeLabel: string;
  volumeValue: string;
  cost: string;
  eta: string;
  route: string;
  progressDelay: number;
}) {
  return (
    <div className="glass-strong rounded-3xl p-2 shadow-[var(--shadow-elegant)]">
      <div className="rounded-2xl bg-background/40 p-6 md:p-7">
        <div className="grid grid-cols-3 gap-3">
          <PreviewStat label={volumeLabel} value={volumeValue} tone="blue" />
          <PreviewStat label="Coût total" value={cost} tone="violet" />
          <PreviewStat label="Arrivée estimée" value={eta} tone="green" />
        </div>
        <div className="relative mt-6 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "72%", "30%", "85%", "55%"] }}
            transition={{
              duration: 6,
              delay: progressDelay,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ left: "-20%" }}
            animate={{ left: "110%" }}
            transition={{
              duration: 1.8,
              delay: progressDelay,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{route}</span>
          <span>{mode}</span>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "violet" | "green";
}) {
  const gradient =
    tone === "blue"
      ? "var(--gradient-blue)"
      : tone === "violet"
        ? "var(--gradient-violet)"
        : "var(--gradient-green)";
  return (
    <div className="glass rounded-2xl p-4 text-left">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-1 text-lg md:text-xl font-bold"
        style={{
          background: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </div>
    </div>
  );
}

