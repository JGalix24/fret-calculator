import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [{ title: "Mes calculateurs — Freight-Calculator" }],
  }),
  component: AppHome,
});

const cards = [
  {
    to: "/app/sea" as const,
    accent: "blue" as const,
    titleFr: "Bateau",
    titleEn: "Sea",
    descFr: "Calcul au CBM (m³)",
    descEn: "CBM-based pricing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M2 20s2-1 4 0 4 1 6 0 4-1 6 0 4 0 4 0" />
        <path d="M4 18l2-7h12l2 7" />
        <path d="M12 4v7" />
      </svg>
    ),
  },
  {
    to: "/app/air" as const,
    accent: "violet" as const,
    titleFr: "Avion",
    titleEn: "Air",
    descFr: "Calcul au kilogramme",
    descEn: "Per-kg pricing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M22 16l-9-3-2-7-2 1 1 5-5 1-2-2-2 1 3 4 4 1 3 4 1-2-3-3 5-1 1 0z" />
      </svg>
    ),
  },
  {
    to: "/app/compare" as const,
    accent: "green" as const,
    titleFr: "Comparer",
    titleEn: "Compare",
    descFr: "Bateau vs avion",
    descEn: "Sea vs air",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M3 6h12M3 12h12M3 18h7" />
        <path d="M17 16l4 4-4 4M21 20H9" />
      </svg>
    ),
  },
  {
    to: "/app/multi" as const,
    accent: "orange" as const,
    titleFr: "Multi-colis",
    titleEn: "Multi-parcel",
    descFr: "Plusieurs colis en une session",
    descEn: "Several parcels at once",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
];

function AppHome() {
  const { lang } = useI18n();

  const accentClass = (a: "blue" | "violet" | "green" | "orange") => {
    if (a === "blue") return "bg-[image:var(--gradient-blue)]";
    if (a === "violet") return "bg-[image:var(--gradient-violet)]";
    if (a === "green") return "bg-[image:var(--gradient-green)]";
    return "bg-[image:var(--gradient-orange)]";
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-gradient">
            {lang === "fr" ? "Choisis ton calcul" : "Pick a calculator"}
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {lang === "fr"
            ? "30 secondes pour obtenir ton coût et ton délai estimé."
            : "30 seconds to get your cost and ETA."}
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.to}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <Link to={c.to} className="block glass rounded-2xl p-6 hover:border-primary/40 transition-colors group">
              <div className={`grid h-11 w-11 place-items-center rounded-xl text-primary-foreground ${accentClass(c.accent)}`}>
                {c.icon}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{lang === "fr" ? c.titleFr : c.titleEn}</div>
                  <div className="text-sm text-muted-foreground">{lang === "fr" ? c.descFr : c.descEn}</div>
                </div>
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
