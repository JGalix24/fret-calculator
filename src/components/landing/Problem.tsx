import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Problem() {
  const { t } = useI18n();
  const items = [t("problem.1"), t("problem.2"), t("problem.3")];

  return (
    <section className="relative py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl md:text-5xl font-bold tracking-tight"
        >
          <span className="text-gradient">{t("problem.title")}</span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {items.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass rounded-2xl p-6 md:p-7 hover:border-primary/40 transition-colors"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/15 text-destructive">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="mt-5 text-base md:text-lg font-medium leading-snug">
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
