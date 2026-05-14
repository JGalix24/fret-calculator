import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Argument } from "@/components/landing/Argument";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { OceanHero } from "@/components/landing-editorial/OceanHero";
import { WaterRipplesBackground } from "@/components/landing/WaterRipplesBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Freight-Calculator — Calculez vos frais de fret en 30 secondes" },
      {
        name: "description",
        content:
          "L'outil de calcul de fret maritime et aérien pour les importateurs en Afrique de l'Ouest. CBM, kg, comparaison, multi-colis. Sans inscription.",
      },
      { property: "og:title", content: "Freight-Calculator — Fret maritime & aérien" },
      {
        property: "og:description",
        content:
          "Calculez vos frais de transport et estimez vos délais de livraison vers le Togo en 30 secondes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div
        className="editorial"
        style={{
          // Harmonise OceanHero with classic blue/violet palette
          ["--ed-orange" as string]: "oklch(0.58 0.22 264)",
          ["--ed-orange-deep" as string]: "oklch(0.55 0.26 295)",
        }}
      >
        <OceanHero />
      </div>
      <Header />
      <div className="relative">
        <WaterRipplesBackground />
        <main className="relative z-10">
          <Problem />
          <Solution />
          <Argument />
          <Pricing />
          <Testimonials />
          <FAQ />
          <FinalCTA />
        </main>
      </div>
      <Footer />
    </div>
  );
}
