import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Field, inputClass, selectClass } from "@/components/app/Field";
import { ResultCard, Stat } from "@/components/app/ResultCard";
import { CalcButton, ExhaustedNotice } from "@/components/app/CalcButton";
import { ExportPdfButton } from "@/components/app/ExportPdfButton";
import { useConsume } from "@/hooks/useConsume";
import {
  CURRENCIES,
  COUNTRIES,
  cbm,
  formatMoney,
  transitLabel,
  type Currency,
} from "@/lib/freight";

export const Route = createFileRoute("/app/compare")({
  head: () => ({ meta: [{ title: "Comparer bateau vs avion — Freight-Calculator" }] }),
  component: ComparePage,
});

function ComparePage() {
  const { lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>("FCFA");
  const [countryCode, setCountryCode] = useState("TG");
  const [seaRate, setSeaRate] = useState("");
  const [airRate, setAirRate] = useState("");
  const [L, setL] = useState("");
  const [W, setW] = useState("");
  const [H, setH] = useState("");
  const [weight, setWeight] = useState("");
  const { status, consume, reset } = useConsume();

  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const volume = cbm(Number(L) || 0, Number(W) || 0, Number(H) || 0);
  const seaTotal = volume * (Number(seaRate) || 0);
  const airTotal = (Number(weight) || 0) * (Number(airRate) || 0);
  const ready = volume > 0 && Number(weight) > 0 && Number(seaRate) > 0 && Number(airRate) > 0;
  const showResult = status.state === "ok" && ready;
  const exhausted = status.state === "error" && status.fatal;
  void reset;

  const cheaper = showResult ? (seaTotal <= airTotal ? "sea" : "air") : null;

  return (
    <div className="max-w-5xl">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold tracking-tight"
      >
        <span className="text-gradient">
          {lang === "fr" ? "Bateau vs Avion" : "Sea vs Air"}
        </span>
      </motion.h1>
      <p className="mt-2 text-muted-foreground">
        {lang === "fr"
          ? "Compare le coût et le délai pour choisir le mode le plus rentable."
          : "Compare cost and transit to pick the most profitable option."}
      </p>

      <div className="mt-8 glass rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={lang === "fr" ? "Devise" : "Currency"}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={selectClass}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label={lang === "fr" ? "Destination" : "Destination"}>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={selectClass}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={lang === "fr" ? `Tarif bateau / m³ (${currency})` : `Sea rate / m³ (${currency})`}>
            <input inputMode="decimal" value={seaRate} onChange={(e) => setSeaRate(e.target.value.replace(",", "."))} className={inputClass} />
          </Field>
          <Field label={lang === "fr" ? `Tarif avion / kg (${currency})` : `Air rate / kg (${currency})`}>
            <input inputMode="decimal" value={airRate} onChange={(e) => setAirRate(e.target.value.replace(",", "."))} className={inputClass} />
          </Field>
        </div>

        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {lang === "fr" ? "Dimensions (cm) et poids (kg)" : "Dimensions (cm) and weight (kg)"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input value={L} onChange={(e) => setL(e.target.value.replace(",", "."))} placeholder="L" inputMode="decimal" className={inputClass + " text-center"} />
            <input value={W} onChange={(e) => setW(e.target.value.replace(",", "."))} placeholder="l" inputMode="decimal" className={inputClass + " text-center"} />
            <input value={H} onChange={(e) => setH(e.target.value.replace(",", "."))} placeholder="H" inputMode="decimal" className={inputClass + " text-center"} />
            <input value={weight} onChange={(e) => setWeight(e.target.value.replace(",", "."))} placeholder="kg" inputMode="decimal" className={inputClass + " text-center"} />
          </div>
        </div>

        <CalcButton
          onClick={consume}
          status={status}
          disabled={!ready}
          label={lang === "fr" ? "Comparer" : "Compare"}
        />
      </div>

      {exhausted && (
        <div className="mt-6">
          <ExhaustedNotice page={lang === "fr" ? "Comparateur Mer/Avion" : "Sea/Air compare"} />
        </div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-5">
        <ResultCard accent="blue">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{lang === "fr" ? "Bateau" : "Sea"}</div>
            {cheaper === "sea" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-brand-green/20 text-brand-green-glow border border-brand-green/30">
                {lang === "fr" ? "Le moins cher" : "Cheapest"}
              </span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Stat label={lang === "fr" ? "Volume" : "Volume"} value={`${volume.toFixed(3)} m³`} />
            <Stat label={lang === "fr" ? "Coût" : "Cost"} value={showResult ? formatMoney(seaTotal, currency) : "—"} />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {lang === "fr" ? "Délai " : "Transit "} {transitLabel("sea", lang)}
          </div>
        </ResultCard>

        <ResultCard accent="violet">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{lang === "fr" ? "Avion" : "Air"}</div>
            {cheaper === "air" && (
              <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-brand-green/20 text-brand-green-glow border border-brand-green/30">
                {lang === "fr" ? "Le moins cher" : "Cheapest"}
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-brand-orange/20 text-brand-orange-glow border border-brand-orange/30">
              {lang === "fr" ? "Le plus rapide" : "Fastest"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Stat label={lang === "fr" ? "Poids" : "Weight"} value={`${Number(weight) || 0} kg`} />
            <Stat label={lang === "fr" ? "Coût" : "Cost"} value={showResult ? formatMoney(airTotal, currency) : "—"} />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {lang === "fr" ? "Délai " : "Transit "} {transitLabel("air", lang)}
          </div>
        </ResultCard>
      </div>

      {showResult && (
        <div className="mt-4 flex justify-end">
          <ExportPdfButton
            build={() => {
              const cheap = seaTotal <= airTotal ? (lang === "fr" ? "Bateau" : "Sea") : (lang === "fr" ? "Avion" : "Air");
              return {
                pageTitle: lang === "fr" ? "Comparaison Bateau vs Avion" : "Sea vs Air comparison",
                subtitle:
                  lang === "fr"
                    ? "Comparaison du coût et du délai entre fret maritime et fret aérien."
                    : "Cost and transit comparison between sea and air freight.",
                params: [
                  { label: lang === "fr" ? "Devise" : "Currency", value: currency },
                  { label: lang === "fr" ? "Destination" : "Destination", value: country.name },
                  { label: lang === "fr" ? `Tarif bateau / m³` : `Sea rate / m³`, value: formatMoney(Number(seaRate) || 0, currency) },
                  { label: lang === "fr" ? `Tarif avion / kg` : `Air rate / kg`, value: formatMoney(Number(airRate) || 0, currency) },
                  { label: lang === "fr" ? "Dimensions (L × l × H)" : "Dimensions (L × W × H)", value: `${L} × ${W} × ${H} cm` },
                  { label: lang === "fr" ? "Poids" : "Weight", value: `${Number(weight) || 0} kg` },
                ],
                results: [
                  { label: lang === "fr" ? "Volume" : "Volume", value: `${volume.toFixed(3)} m³` },
                  { label: lang === "fr" ? `Coût bateau (${transitLabel("sea", lang)})` : `Sea cost (${transitLabel("sea", lang)})`, value: formatMoney(seaTotal, currency) },
                  { label: lang === "fr" ? `Coût avion (${transitLabel("air", lang)})` : `Air cost (${transitLabel("air", lang)})`, value: formatMoney(airTotal, currency) },
                  { label: lang === "fr" ? "Le moins cher" : "Cheapest", value: cheap },
                ],
              };
            }}
          />
        </div>
      )}
    </div>
  );
}
