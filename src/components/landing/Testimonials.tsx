import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Testimonials() {
  const { t } = useI18n();
  const items = [
    { text: t("testi.1.text"), name: t("testi.1.name"), role: t("testi.1.role"), tone: "blue" },
    { text: t("testi.2.text"), name: t("testi.2.name"), role: t("testi.2.role"), tone: "violet" },
    { text: t("testi.3.text"), name: t("testi.3.name"), role: t("testi.3.role"), tone: "green" },
  ] as const;

  const grad = (t: "blue" | "violet" | "green") =>
    t === "blue" ? "var(--gradient-blue)" : t === "violet" ? "var(--gradient-violet)" : "var(--gradient-green)";

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
          <span className="text-gradient">{t("testi.title")}</span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((it, i) => (
            <motion.figure
              key={it.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 md:p-7 flex flex-col"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-muted-foreground/60" fill="currentColor">
                <path d="M7.17 6C4.32 6 2 8.32 2 11.17v6.66h6.66v-6.66H5.83C5.83 8.59 7.42 7 9 7V6h-.83zm10 0c-2.85 0-5.17 2.32-5.17 5.17v6.66h6.66v-6.66h-2.83C15.83 8.59 17.42 7 19 7V6h-1.83z"/>
              </svg>
              <blockquote className="mt-4 text-base leading-relaxed">
                {it.text}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
                <div
                  className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-primary-foreground"
                  style={{ background: grad(it.tone) }}
                >
                  {it.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
