import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import { createDemoCode } from "@/utils/payments.functions";
import { getClientFingerprint } from "@/lib/fingerprint";
import { useTimeOfDayAmbiance } from "@/hooks/useTimeOfDayAmbiance";
import heroVideoAsset from "@/assets/hero-ocean.mp4.asset.json";

const DEMO_USED_KEY = "fc.demo.used";

/* Random but stable star positions */
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 97) % 100,
  y: ((i * 53) % 50),
  s: ((i * 7) % 3) + 1,
  d: ((i * 11) % 30) / 10,
}));

function Sun({ color, glow, x, y }: { color: string; glow: string; x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none transition-all duration-[2000ms] ease-in-out"
      style={{
        top: `${y}%`,
        left: `${x}%`,
        width: 90,
        height: 90,
        transform: "translate(-50%, -50%)",
        background: color,
        borderRadius: "50%",
        boxShadow: glow,
        opacity: 0.95,
      }}
      aria-hidden
    />
  );
}

function Stars() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            opacity: 0.7,
            animationDelay: `${s.d}s`,
            animationDuration: `${2 + s.d}s`,
          }}
        />
      ))}
    </div>
  );
}

function Seagull({ delay, top, scale = 1 }: { delay: number; top: string; scale?: number }) {
  return (
    <svg
      viewBox="0 0 60 20"
      className="absolute pointer-events-none seagull-fly"
      style={{
        top,
        left: "-10%",
        width: 60 * scale,
        height: 20 * scale,
        animationDelay: `${delay}s`,
      }}
      aria-hidden
    >
      <path
        d="M2 12 Q 12 2, 22 12 Q 32 2, 42 12 Q 50 8, 58 12"
        stroke="rgba(20,20,30,0.85)"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CargoPlane() {
  return (
    <svg
      viewBox="0 0 120 40"
      className="absolute pointer-events-none plane-fly"
      style={{ top: "14%", left: "-15%", width: 120, height: 40 }}
      aria-hidden
    >
      {/* Plane silhouette */}
      <g fill="rgba(30,30,40,0.85)">
        <ellipse cx="60" cy="20" rx="42" ry="3.5" />
        <path d="M30 17 L78 17 L72 11 L36 11 Z" />
        <path d="M52 18 L68 18 L62 5 L58 5 Z" />
        <path d="M14 20 L24 20 L20 24 L16 24 Z" />
      </g>
      {/* Contrail */}
      <line x1="0" y1="20" x2="20" y2="20" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeDasharray="2 3" />
    </svg>
  );
}

export function OceanHero() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const demoFn = useServerFn(createDemoCode);
  const ambiance = useTimeOfDayAmbiance();
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

  return (
    <section className="relative w-full h-[100svh] min-h-[640px] overflow-hidden bg-[#0a1828]">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-[2000ms] ease-in-out"
        style={{ filter: ambiance.videoFilter }}
        src={heroVideoAsset.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />

      {/* Color ambiance overlay */}
      <div
        className="absolute inset-0 transition-[background] duration-[2000ms] ease-in-out"
        style={{ background: ambiance.gradient }}
        aria-hidden
      />

      {/* Sun / moon */}
      <Sun color={ambiance.sunColor} glow={ambiance.sunGlow} x={ambiance.sunX} y={ambiance.sunY} />

      {/* Stars at night */}
      {ambiance.stars && <Stars />}

      {/* Seagulls */}
      <Seagull delay={0} top="22%" scale={1} />
      <Seagull delay={6} top="32%" scale={0.7} />
      <Seagull delay={11} top="18%" scale={0.5} />

      {/* Cargo plane */}
      <CargoPlane />

      {/* Subtle vignette for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.35) 100%)",
        }}
        aria-hidden
      />

      {/* Header overlay (transparent) */}
      <div className="relative z-10">
        <header className="absolute top-0 inset-x-0">
          <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group text-white">
              <div className="grid h-9 w-9 place-items-center bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="square">
                  <path d="M3 18 L9 6 L11 14 L15 6 L21 18" />
                </svg>
              </div>
              <div className="leading-none">
                <div className="ed-serif text-xl md:text-2xl font-semibold tracking-tight">Freight-Calculator</div>
                <div className="ed-mono mt-1 text-[9px] uppercase tracking-[0.2em] opacity-75">Lomé · West Africa</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-3 text-white/90 ed-mono text-[10px] uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ed-orange)] animate-pulse" />
              {ambiance.label} · Lomé
            </div>
            <Link
              to="/activate"
              className="ed-mono uppercase tracking-widest text-[11px] font-bold ed-orange-bg px-4 py-2.5 hover:bg-[color:var(--ed-orange-deep)] transition-colors"
            >
              Essayer
            </Link>
          </div>
        </header>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 z-10 flex items-end md:items-center">
        <div className="container mx-auto px-4 md:px-6 pb-16 md:pb-0">
          <div className="max-w-3xl text-white" style={{ textShadow: ambiance.textShadow }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="ed-mono text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ed-orange)]" />
              SHANGHAI <span className="opacity-50">→</span> LOMÉ · LIVE
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="ed-serif font-semibold leading-[0.86] tracking-[-0.02em] text-[clamp(3rem,8vw,7.5rem)]"
            >
              L'océan,
              <br />
              <span className="italic" style={{ color: "var(--ed-orange)" }}>calculé.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/90"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
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
              <a
                href="#calculators"
                className="ed-mono uppercase text-xs tracking-widest font-bold border border-white/40 text-white px-5 py-4 hover:bg-white/10 backdrop-blur-md transition-colors"
              >
                Voir les calculs
              </a>
            </motion.div>

            {err && (
              <div className="mt-5 max-w-md space-y-2">
                <p className="ed-mono text-[11px] text-white bg-black/40 backdrop-blur-md inline-block px-3 py-1.5">{err}</p>
                {shortRef && (
                  <div className="border border-white/30 bg-black/30 backdrop-blur-md p-3">
                    <div className="ed-mono text-[9px] uppercase tracking-widest opacity-70">Votre référence</div>
                    <div className="ed-mono text-sm font-bold tracking-widest mt-1 text-white">{shortRef}</div>
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
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 ed-mono text-[10px] uppercase tracking-widest flex flex-col items-center gap-2">
        <span>Scroll</span>
        <span className="block h-8 w-[1px] bg-white/40 scroll-pulse" />
      </div>
    </section>
  );
}
