import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

type Tone = "blue" | "violet" | "green" | "orange";

const toneStyles: Record<
  Tone,
  { gradient: string; glow: string; ring: string }
> = {
  blue: {
    gradient: "var(--gradient-blue)",
    glow: "var(--shadow-glow-blue)",
    ring: "ring-[oklch(0.58_0.22_264/0.4)]",
  },
  violet: {
    gradient: "var(--gradient-violet)",
    glow: "var(--shadow-glow-violet)",
    ring: "ring-[oklch(0.55_0.26_295/0.4)]",
  },
  green: {
    gradient: "var(--gradient-green)",
    glow: "var(--shadow-glow-green)",
    ring: "ring-[oklch(0.58_0.15_160/0.4)]",
  },
  orange: {
    gradient: "var(--gradient-orange)",
    glow: "var(--shadow-glow-orange)",
    ring: "ring-[oklch(0.65_0.21_38/0.4)]",
  },
};

const BoatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M2 20a5 5 0 0 0 5 0 5 5 0 0 0 5 0 5 5 0 0 0 5 0 5 5 0 0 0 5 0" />
    <path d="M3 16l1.5-4.5h15L21 16" />
    <path d="M12 11V4l5 4" />
    <path d="M12 11H7" />
  </svg>
);
const PlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
  </svg>
);
const CompareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M3 6h13" /><path d="M3 12h9" /><path d="M3 18h13" />
    <path d="M16 3l5 3-5 3" /><path d="M16 15l5 3-5 3" />
  </svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

export function Solution() {
  const { t } = useI18n();

  const cards: Array<{
    tone: Tone;
    title: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    { tone: "blue", title: t("solution.boat.title"), desc: t("solution.boat.desc"), icon: <BoatIcon /> },
    { tone: "violet", title: t("solution.plane.title"), desc: t("solution.plane.desc"), icon: <PlaneIcon /> },
    { tone: "green", title: t("solution.compare.title"), desc: t("solution.compare.desc"), icon: <CompareIcon /> },
    { tone: "orange", title: t("solution.multi.title"), desc: t("solution.multi.desc"), icon: <BoxIcon /> },
  ];

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
          <span className="text-gradient">{t("solution.title")}</span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => {
            const s = toneStyles[c.tone];
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass group relative overflow-hidden rounded-2xl p-6 hover:ring-1 transition-all ${s.ring}`}
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl text-primary-foreground"
                  style={{ background: s.gradient, boxShadow: s.glow }}
                >
                  {c.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
                <div
                  className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
                  style={{ background: s.gradient }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
