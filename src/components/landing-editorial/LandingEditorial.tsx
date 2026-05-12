import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import dockImg from "@/assets/dock-worker-real.jpg";
import portImg from "@/assets/port-lome.jpg";
import airCargoImg from "@/assets/air-cargo-hold.jpg";
import { OceanHero } from "./OceanHero";

const DEMO_USED_KEY = "fc.demo.used";

/* ---------------- Marquee strip (kept under hero) ---------------- */
function EdMarquee() {
  return (
    <div className="border-y ed-line py-4 overflow-hidden bg-[color:var(--ed-paper)]">
      <div className="flex ed-marquee whitespace-nowrap ed-mono text-xs uppercase tracking-widest font-bold ed-soft">
        {Array.from({ length: 2 }).map((_, k) => (
          <div key={k} className="flex gap-8 pr-8 shrink-0">
            {["SHA → LFW", "GUANGZHOU", "FCL · LCL", "CBM exact", "AIR CARGO", "PORT AUTONOME DE LOMÉ", "TOGO IMPORT", "MULTI-COLIS", "EXPORT CHINE"].map((s) => (
              <span key={k + s} className="flex items-center gap-8">
                {s}
                <span className="ed-orange-text">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Manifesto (orange band) ---------------- */
function EdManifesto() {
  const { t } = useI18n();
  return (
    <section className="ed-orange-bg">
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-2 ed-mono text-[10px] uppercase tracking-widest font-bold opacity-80">№ 01<br/>Manifeste</div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-10 ed-serif font-medium leading-[0.95] text-[clamp(2.4rem,6vw,5rem)] tracking-[-0.02em]"
          >
            Le calcul de fret n'a pas à être une <em>devinette</em>. Chaque mètre cube, chaque kilogramme, chaque jour de transit — <span className="underline decoration-2 underline-offset-8">connu d'avance</span>.
          </motion.h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 ed-mono text-xs uppercase tracking-widest">
          <div className="border-t-2 border-white/60 pt-3">{t("problem.1")}</div>
          <div className="border-t-2 border-white/60 pt-3">{t("problem.2")}</div>
          <div className="border-t-2 border-white/60 pt-3">{t("problem.3")}</div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Calculators (numbered cards) ---------------- */
function EdCalculators() {
  const { t } = useI18n();
  const items = [
    { n: "01", title: t("solution.boat.title"),    desc: t("solution.boat.desc"),    to: "/app/sea" as const },
    { n: "02", title: t("solution.plane.title"),   desc: t("solution.plane.desc"),   to: "/app/air" as const },
    { n: "03", title: t("solution.compare.title"), desc: t("solution.compare.desc"), to: "/app/compare" as const },
    { n: "04", title: t("solution.multi.title"),   desc: t("solution.multi.desc"),   to: "/app/multi" as const },
  ];
  return (
    <section id="calculators" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="ed-mono text-[10px] uppercase tracking-widest font-bold ed-soft">№ 02 · Outils</div>
            <h2 className="mt-3 ed-serif font-medium text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] max-w-2xl">
              Quatre calculs, <em className="ed-orange-text">une seule</em> précision.
            </h2>
          </div>
          <Link to="/app" className="ed-mono uppercase text-[11px] tracking-widest font-bold ed-underline-grow">
            Tous les outils →
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--ed-line)] border ed-line">
          {items.map((it, i) => (
            <motion.div
              key={it.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[color:var(--ed-paper)]/40 ed-glass"
            >
              <Link to={it.to} className="group block p-8 md:p-10 hover:bg-[color:var(--ed-paper)] transition-colors h-full">
                <div className="flex items-start justify-between">
                  <div className="ed-serif italic text-5xl md:text-6xl font-light ed-orange-text">{it.n}</div>
                  <svg viewBox="0 0 24 24" className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </div>
                <h3 className="mt-10 ed-serif text-3xl md:text-4xl font-medium leading-tight">{it.title}</h3>
                <p className="mt-3 ed-soft max-w-md">{it.desc}</p>
                <div className="mt-8 h-[2px] w-0 bg-[color:var(--ed-orange)] transition-all duration-500 group-hover:w-24" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Air + Sea showcase (real photos) ---------------- */
function EdAirCargo() {
  return (
    <section className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Sea — Port of Lomé */}
        <div className="relative h-[420px] md:h-[560px] overflow-hidden group">
          <img
            src={portImg}
            alt="Terminal à conteneurs au coucher du soleil"
            loading="lazy"
            width={1600}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
            <div className="ed-mono text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ed-orange)]" />
              Fret maritime · FCL/LCL
            </div>
            <h3 className="mt-3 ed-serif text-4xl md:text-5xl font-medium leading-[0.95]">
              L'<em>océan</em>,<br/>au mètre cube près.
            </h3>
            <p className="mt-4 max-w-md text-white/85 text-sm md:text-base">
              Conteneurs 20' / 40', groupage LCL ou complet FCL. Calcul exact au CBM, délais et coûts en clair.
            </p>
            <Link
              to="/app/sea"
              className="mt-6 inline-flex items-center gap-2 ed-mono uppercase text-[11px] tracking-widest font-bold ed-orange-bg px-5 py-3 w-fit hover:bg-[color:var(--ed-orange-deep)] transition-colors"
            >
              Calcul maritime →
            </Link>
          </div>
        </div>

        {/* Air — Cargo hold */}
        <div className="relative h-[420px] md:h-[560px] overflow-hidden group">
          <img
            src={airCargoImg}
            alt="Soute d'avion-cargo avec palettes"
            loading="lazy"
            width={1600}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
            <div className="ed-mono text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ed-orange)]" />
              Aérien · Express
            </div>
            <h3 className="mt-3 ed-serif text-4xl md:text-5xl font-medium leading-[0.95]">
              Quand le délai<br/><em>compte vraiment.</em>
            </h3>
            <p className="mt-4 max-w-md text-white/85 text-sm md:text-base">
              Tarification au poids volumétrique, livraison en 5–7 jours. Idéal pour les marchandises à forte valeur.
            </p>
            <Link
              to="/app/air"
              className="mt-6 inline-flex items-center gap-2 ed-mono uppercase text-[11px] tracking-widest font-bold bg-white text-black px-5 py-3 w-fit hover:bg-white/90 transition-colors"
            >
              Calcul aérien →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Proof (photo + figures) ---------------- */
function EdProof() {
  const { t } = useI18n();
  const stats = [
    { v: "30s", k: "pour un calcul" },
    { v: "0", k: "carte bancaire" },
    { v: "100%", k: "transparence" },
  ];
  return (
    <section className="py-20 md:py-28 bg-[color:var(--ed-paper)]">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 relative"
        >
          <img src={dockImg} alt="Opérateur de fret avec tablette" loading="lazy" width={1280} height={896} className="w-full h-auto grayscale-[0.15]" />
          <div className="absolute bottom-4 left-4 ed-orange-bg ed-mono text-[10px] uppercase tracking-widest font-bold px-3 py-2">
            Fret maritime &amp; aérien
          </div>
        </motion.div>
        <div className="lg:col-span-5">
          <div className="ed-mono text-[10px] uppercase tracking-widest font-bold ed-soft">№ 03 · Sur le terrain</div>
          <h2 className="mt-3 ed-serif font-medium text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.95] tracking-[-0.02em]">
            Pensé pour ceux qui <em className="ed-orange-text">importent réellement</em>.
          </h2>
          <p className="mt-6 ed-soft leading-relaxed max-w-md">{t("argument.subtitle")}</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.k} className="border-t-2 border-[color:var(--ed-orange)] pt-3">
                <div className="ed-serif text-3xl md:text-4xl font-medium">{s.v}</div>
                <div className="mt-1 ed-mono text-[9px] uppercase tracking-widest ed-soft">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing (editorial table) ---------------- */
function EdPricing() {
  const { t } = useI18n();
  const rows = [
    { name: t("pricing.month.name"),   price: t("pricing.month.price"),   unit: t("pricing.month.unit"),   feat: t("pricing.month.feat1"),   note: "" },
    { name: t("pricing.quarter.name"), price: t("pricing.quarter.price"), unit: t("pricing.quarter.unit"), feat: t("pricing.quarter.feat1"), note: t("pricing.quarter.save"), highlight: true },
    { name: t("pricing.year.name"),    price: t("pricing.year.price"),    unit: t("pricing.year.unit"),    feat: t("pricing.year.feat1"),    note: t("pricing.year.save") },
  ];
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="ed-mono text-[10px] uppercase tracking-widest font-bold ed-soft">№ 04 · Tarifs</div>
        <h2 className="mt-3 ed-serif font-medium text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] max-w-3xl">
          {t("pricing.title")}
        </h2>

        <div className="mt-12 border-t-2 border-[color:var(--ed-orange)]">
          {rows.map((r) => (
            <Link
              key={r.name}
              to="/activate"
              className={`group grid grid-cols-12 gap-4 items-center border-b ed-line py-6 md:py-8 px-2 md:px-4 transition-colors ${r.highlight ? "bg-[color:var(--ed-paper)]" : "hover:bg-[color:var(--ed-paper)]"}`}
            >
              <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                <span className="ed-serif text-2xl md:text-3xl font-medium">{r.name}</span>
                {r.highlight && <span className="ed-mono text-[9px] uppercase tracking-widest font-bold ed-orange-bg px-2 py-1">Populaire</span>}
              </div>
              <div className="col-span-6 md:col-span-3 ed-serif">
                <span className="text-3xl md:text-4xl font-medium">{r.price}</span>
                <span className="ed-mono text-[10px] uppercase tracking-widest ml-2 ed-soft">{r.unit}</span>
              </div>
              <div className="col-span-6 md:col-span-4 ed-mono text-xs uppercase tracking-widest ed-soft">{r.feat}</div>
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-3 ed-mono text-[10px] uppercase tracking-widest font-bold">
                {r.note && <span className="ed-orange-text">{r.note}</span>}
                <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-6 ed-mono text-[10px] uppercase tracking-widest ed-soft">{t("pricing.note")}</p>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function EdTestimonials() {
  const { t } = useI18n();
  const items = [
    { text: t("testi.1.text"), name: t("testi.1.name"), role: t("testi.1.role") },
    { text: t("testi.2.text"), name: t("testi.2.name"), role: t("testi.2.role") },
    { text: t("testi.3.text"), name: t("testi.3.name"), role: t("testi.3.role") },
  ];
  return (
    <section className="py-20 md:py-28 bg-[color:var(--ed-paper)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="ed-mono text-[10px] uppercase tracking-widest font-bold ed-soft">№ 05 · Témoignages</div>
        <h2 className="mt-3 ed-serif font-medium text-[clamp(2rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] max-w-3xl">
          {t("testi.title")}
        </h2>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--ed-line)] border ed-line">
          {items.map((it, i) => (
            <motion.figure
              key={it.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="ed-glass p-8 md:p-10"
            >
              <div className="ed-serif text-6xl ed-orange-text leading-none">"</div>
              <blockquote className="mt-2 ed-serif text-xl md:text-2xl leading-snug">{it.text}</blockquote>
              <figcaption className="mt-8 pt-5 border-t ed-line">
                <div className="ed-serif text-base font-semibold">{it.name}</div>
                <div className="ed-mono text-[10px] uppercase tracking-widest ed-soft mt-1">{it.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function EdFAQ() {
  const { t } = useI18n();
  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="ed-mono text-[10px] uppercase tracking-widest font-bold ed-soft">№ 06 · FAQ</div>
          <h2 className="mt-3 ed-serif font-medium text-[clamp(1.8rem,4vw,3rem)] leading-[0.95] tracking-[-0.02em]">
            {t("faq.title")}
          </h2>
        </div>
        <div className="lg:col-span-8 border-t-2 border-[color:var(--ed-orange)]">
          {items.map((it) => (
            <details key={it.q} className="group border-b ed-line py-6">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-6">
                <span className="ed-serif text-lg md:text-xl font-medium pr-4">{it.q}</span>
                <span className="shrink-0 ed-mono text-2xl ed-orange-text transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 ed-soft leading-relaxed max-w-2xl">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function EdFinalCTA() {
  const { t } = useI18n();
  return (
    <section className="ed-orange-bg">
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
        <h2 className="ed-serif font-medium text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] tracking-[-0.02em] max-w-4xl mx-auto">
          {t("final.title")}
        </h2>
        <p className="mt-6 max-w-xl mx-auto ed-mono text-xs uppercase tracking-widest opacity-90">{t("final.subtitle")}</p>
        <Link
          to="/activate"
          className="mt-10 inline-flex items-center gap-3 bg-black text-white px-8 py-4 ed-mono uppercase text-xs tracking-widest font-bold hover:bg-[color:var(--ed-bg-deep)] transition-colors ed-glow-orange"
        >
          {t("final.cta")}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="mt-4 ed-mono text-[10px] uppercase tracking-widest opacity-80">{t("final.badge")}</p>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function EdFooter() {
  return (
    <footer className="bg-[color:var(--ed-bg-deep)] text-white border-t ed-line">
      <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 ed-mono text-[10px] uppercase tracking-widest">
        <div>
          <div className="opacity-50">Édition</div>
          <div className="mt-2 font-bold">Cargo Manifesto · {new Date().getFullYear()}</div>
        </div>
        <div>
          <div className="opacity-50">Ligne</div>
          <div className="mt-2 font-bold">CN · SHA → TG · LFW</div>
        </div>
        <div>
          <div className="opacity-50">Support</div>
          <Link to="/admin" className="mt-2 font-bold opacity-90 hover:opacity-100 block">Admin</Link>
        </div>
        <div className="text-right">
          <div className="opacity-50">© Freight-Calculator</div>
          <div className="mt-2 font-bold">Lomé · Togo</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Root ---------------- */
export function LandingEditorial() {
  return (
    <div className="editorial min-h-screen antialiased">
      <OceanHero />
      <EdMarquee />
      <main>
        <EdManifesto />
        <EdCalculators />
        <EdAirCargo />
        <EdProof />
        <EdPricing />
        <EdTestimonials />
        <EdFAQ />
        <EdFinalCTA />
      </main>
      <EdFooter />
    </div>
  );
}
