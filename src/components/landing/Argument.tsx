import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function Argument() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const target = 500;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl glass-strong p-10 md:p-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 0.35), transparent 60%), radial-gradient(ellipse at bottom right, oklch(0.55 0.26 295 / 0.3), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
              <span className="text-gradient-primary">{t("argument.title")}</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-muted-foreground text-base md:text-lg">
              {t("argument.subtitle")}
            </p>

            <div className="mt-12 inline-flex flex-col items-center gap-2">
              <div
                className="text-6xl md:text-8xl font-extrabold tabular-nums"
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {count}
              </div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                {t("argument.counter")}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
