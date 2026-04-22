import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Field, inputClass, selectClass } from "@/components/app/Field";
import { ResultCard, Stat } from "@/components/app/ResultCard";
import {
  CURRENCIES,
  COUNTRIES,
  arrivalLabel,
  formatMoney,
  transitLabel,
  estimatedArrivalRange,
  formatDateFR,
  type Currency,
} from "@/lib/freight";

export const Route = createFileRoute("/app/air")({
  head: () => ({ meta: [{ title: "Calcul fret aérien — Freight-Calculator" }] }),
  component: AirPage,
});

function AirPage() {
  const { lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>("FCFA");
  const [countryCode, setCountryCode] = useState("TG");
  const [rate, setRate] = useState("");
  const [weight, setWeight] = useState("");

  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const total = (Number(weight) || 0) * (Number(rate) || 0);
  const eta = estimatedArrivalRange("air");
  const ready = Number(weight) > 0 && Number(rate) > 0;

  return (
    <div className="max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold tracking-tight"
      >
        <span className="text-gradient">
          {lang === "fr" ? "Fret aérien (kg)" : "Air freight (kg)"}
        </span>
      </motion.h1>
      <p className="mt-2 text-muted-foreground">
        {lang === "fr" ? "Coût = poids × tarif au kilogramme." : "Cost = weight × rate per kg."}
      </p>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

          <Field label={lang === "fr" ? `Tarif au kg (${currency})` : `Rate per kg (${currency})`}>
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(",", "."))}
              placeholder="ex: 6500"
              className={inputClass}
            />
          </Field>

          <Field label={lang === "fr" ? "Poids du colis (kg)" : "Parcel weight (kg)"}>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(",", "."))}
              placeholder="ex: 12.5"
              className={inputClass}
            />
          </Field>
        </div>

        <ResultCard accent="violet">
          {ready ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Stat label={lang === "fr" ? "Poids" : "Weight"} value={`${Number(weight)} kg`} />
                <Stat label={lang === "fr" ? "Coût total" : "Total cost"} value={formatMoney(total, currency)} />
              </div>
              <div className="rounded-xl bg-card/40 border border-border p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {lang === "fr" ? "Délai estimé" : "Estimated transit"}
                </div>
                <div className="mt-1 text-base font-semibold">{transitLabel("air", lang)}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {lang === "fr"
                    ? `Ta marchandise posera le pied ${arrivalLabel(country)} entre le ${formatDateFR(eta.from)} et le ${formatDateFR(eta.to)}.`
                    : `Your goods should arrive ${country.name} between ${formatDateFR(eta.from)} and ${formatDateFR(eta.to)}.`}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Renseigne le tarif et le poids pour voir le calcul."
                : "Enter rate and weight to see the calculation."}
            </div>
          )}
        </ResultCard>
      </div>
    </div>
  );
}
