import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import { createDemoCode } from "@/utils/payments.functions";
import { getClientFingerprint } from "@/lib/fingerprint";
import cargoImg from "@/assets/cargo-container.png";
import dockImg from "@/assets/dock-worker.jpg";

const DEMO_USED_KEY = "fc.demo.used";

/* ---------------- Header ---------------- */
function EdHeader() {
  const { lang, setLang } = useI18n();
  return (
    <header className="border-b ed-line bg-[color:var(--ed-paper)]">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-9 w-9 place-items-center bg-[color:var(--ed-ink)] text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="square">
              <path d="M3 18 L9 6 L11 14 L15 6 L21 18" />
            </svg>
          </div>
          <div className="leading-none">
            <div className="ed-serif text-xl md:text-2xl font-semibold tracking-tight">Freight-Calculator</div>
            <div className="ed-mono mt-1 text-[9px] uppercase tracking-[0.2em] ed-soft">Lomé · West Africa</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 ed-mono text-[11px] uppercase tracking-widest font-semibold">
          <a href="#calculators" className="ed-underline-grow">Calculs</a>
          <a href="#pricing" className="ed-underline-grow">Tarifs</a>
          <a href="#faq" className="ed-underline-grow">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex border ed-line ed-mono text-[10px] font-bold">
            <button onClick={() => setLang("fr")} className={`px-2.5 py-1 ${lang === "fr" ? "ed-orange-bg" : ""}`}>FR</button>
            <button onClick={() => setLang("en")} className={`px-2.5 py-1 ${lang === "en" ? "ed-orange-bg" : ""}`}>EN</button>
          </div>
          <Link
            to="/activate"
            className="ed-mono uppercase tracking-widest text-[11px] font-bold ed-orange-bg px-4 py-2.5 hover:bg-[color:var(--ed-orange-deep)] transition-colors"
          >
            Essayer
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function EdHero() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const demoFn = useServerFn(createDemoCode);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [shortRef, setShortRef] = useState<string | null>(null);

  const startDemo = async () => {
    setErr(null); setShortRef(null); setLoading(true);
    try {
      const fp = getClientFingerprint();
      const res = await demoFn({ data: { signal: fp.signal } });
      if (res.ok && res.code) {
        if (typeof window !== "undefined") window.localStorage.setItem(DEMO_USED_KEY, "1");
        navigate({ to: "/activate", search: { code: res.code } as never });
        return;
      }
      if (typeof window !== "undefined") window.localStorage.setItem(DEMO_USED_KEY, "1");
      setErr(res.error ?? "Impossible de générer un code.");
      if ("shortRef" in res && res.shortRef) setShortRef(res.shortRef as string);
    } catch (e) {
      console.error(e);
      setErr("Erreur réseau. Réessayez.");
    } finally { setLoading(false); }
  };

  const annotations: Array<{ label: string; pos: string; line: string }> = [
    { label: "Cotation instantanée", pos: "top-[8%] left-[2%]", line: "right" },
    { label: "CBM exact (m³)", pos: "top-[36%] left-[0%]", line: "right" },
    { label: "Délai estimé", pos: "top-[8%] right-[2%]", line: "left" },
    { label: "Multi-colis · PDF", pos: "top-[44%] right-[0%]", line: "left" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-10 md:pb-16">
        {/* Top meta */}
        <div className="flex items-center justify-between ed-mono text-[10px] uppercase tracking-widest ed-soft">
          <div className="flex items-center gap-3">
            <span className="inline-block h-[2px] w-8 bg-[color:var(--ed-ink)]" />
            <span>Édition №{new Date().getFullYear()} · Cargo Manifesto</span>
          </div>
          <div className="hidden md:block">CN · SHA → TG · LFW</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 mt-8 lg:mt-12 items-center">
          {/* Headline */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="ed-serif font-semibold leading-[0.86] tracking-[-0.02em] text-[clamp(3.5rem,9vw,8rem)]"
            >
              Calcul.
              <br />
              <span className="italic ed-orange-text">Précision.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 max-w-md text-base md:text-lg leading-relaxed ed-soft border-l-2 border-[color:var(--ed-orange)] pl-5"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button
                type="button"
                onClick={startDemo}
                disabled={loading}
                className="group inline-flex items-center gap-3 ed-orange-bg px-7 py-4 ed-mono uppercase text-xs tracking-widest font-bold hover:bg-[color:var(--ed-orange-deep)] transition-colors disabled:opacity-70"
              >
                {loading ? "Génération…" : t("hero.cta")}
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
              <a href="#pricing" className="ed-mono uppercase text-xs tracking-widest font-bold border ed-line px-5 py-4 hover:border-[color:var(--ed-ink)] transition-colors">
                Voir les tarifs
              </a>
            </motion.div>
            <p className="mt-5 ed-mono text-[10px] uppercase tracking-widest ed-soft">{t("hero.badge")}</p>

            {err && (
              <div className="mt-5 max-w-md space-y-2">
                <p className="ed-mono text-[11px] text-[color:var(--ed-orange-deep)]">{err}</p>
                {shortRef && (
                  <div className="border ed-line p-3 ed-paper">
                    <div className="ed-mono text-[9px] uppercase tracking-widest ed-soft">Votre référence</div>
                    <div className="ed-mono text-sm font-bold tracking-widest mt-1">{shortRef}</div>
                    <a
                      href={buildWhatsappLink(lang, "demo", { code: shortRef, page: "Hero / Démo bloquée" })}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-2 inline-block ed-mono text-[10px] uppercase tracking-widest font-bold ed-orange-bg px-3 py-2"
                    >
                      Contacter sur WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Container art */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative mx-auto max-w-[560px] aspect-square">
              {/* Cable shadow */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-[14%] bg-[color:var(--ed-ink)]" />
              {/* Container */}
              <motion.img
                src={cargoImg}
                alt="Conteneur cargo"
                width={1024}
                height={1024}
                className="ed-swing relative z-10 w-full h-auto select-none"
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                draggable={false}
              />
              {/* Annotations */}
              {annotations.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.15 }}
                  className={`absolute ${a.pos} z-20`}
                >
                  <div className={`flex items-center gap-2 ${a.line === "left" ? "flex-row-reverse" : ""}`}>
                    <div className="ed-mono text-[10px] uppercase tracking-widest font-bold whitespace-nowrap bg-[color:var(--ed-paper)] border ed-line px-2 py-1">
                      {a.label}
                    </div>
                    <div className="h-[1px] w-10 bg-[color:var(--ed-ink)]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--ed-orange)]" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="border-y ed-line py-4 overflow-hidden">
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
    </section>
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
          <div className="border-t-2 border-white/40 pt-3">{t("problem.1")}</div>
          <div className="border-t-2 border-white/40 pt-3">{t("problem.2")}</div>
          <div className="border-t-2 border-white/40 pt-3">{t("problem.3")}</div>
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
              className="bg-[color:var(--ed-bg)]"
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
          <img src={dockImg} alt="Docker au Port de Lomé" loading="lazy" width={1280} height={896} className="w-full h-auto grayscale-[0.15]" />
          <div className="absolute bottom-4 left-4 ed-orange-bg ed-mono text-[10px] uppercase tracking-widest font-bold px-3 py-2">
            Port Autonome de Lomé · Togo
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
              <div key={s.k} className="border-t-2 border-[color:var(--ed-ink)] pt-3">
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

        <div className="mt-12 border-t-2 border-[color:var(--ed-ink)]">
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
              className="bg-[color:var(--ed-bg)] p-8 md:p-10"
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
        <div className="lg:col-span-8 border-t-2 border-[color:var(--ed-ink)]">
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
          className="mt-10 inline-flex items-center gap-3 bg-[color:var(--ed-ink)] text-white px-8 py-4 ed-mono uppercase text-xs tracking-widest font-bold hover:bg-black transition-colors"
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
    <footer className="bg-[color:var(--ed-ink)] text-white">
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
      <EdHeader />
      <main>
        <EdHero />
        <EdManifesto />
        <EdCalculators />
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
