import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Argument } from "@/components/landing/Argument";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

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
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Argument />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
