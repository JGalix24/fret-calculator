import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center glass-strong"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, oklch(0.58 0.22 264 / 0.4), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
              <span className="text-gradient-primary">{t("final.title")}</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
              {t("final.subtitle")}
            </p>
            <Link
              to="/activate"
              className="animate-pulse-glow group mt-10 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
            >
              {t("final.cta")}
              <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">{t("final.badge")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
