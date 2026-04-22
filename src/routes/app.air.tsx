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
  const { status, consume, reset } = useConsume();

  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const total = (Number(weight) || 0) * (Number(rate) || 0);
  const eta = estimatedArrivalRange("air");
  const ready = Number(weight) > 0 && Number(rate) > 0;
  const showResult = status.state === "ok" && ready;
  const exhausted = status.state === "error" && status.fatal;
  const onAnyChange = () => { if (status.state === "ok") reset(); };

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
              onChange={(e) => { setWeight(e.target.value.replace(",", ".")); onAnyChange(); }}
              placeholder="ex: 12.5"
              className={inputClass}
            />
          </Field>

          <CalcButton
            onClick={consume}
            status={status}
            disabled={!ready}
            label={lang === "fr" ? "Calculer mon fret" : "Calculate"}
          />
        </div>

        {exhausted ? (
          <ExhaustedNotice page={lang === "fr" ? "Calculateur Avion" : "Air calculator"} />
        ) : (
          <ResultCard accent="violet">
            {showResult ? (
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
                <div className="flex justify-end pt-1">
                  <ExportPdfButton
                    build={() => ({
                      pageTitle: lang === "fr" ? "Fret aérien (kg)" : "Air freight (kg)",
                      subtitle:
                        lang === "fr"
                          ? "Coût = poids × tarif au kilogramme."
                          : "Cost = weight × rate per kg.",
                      params: [
                        { label: lang === "fr" ? "Devise" : "Currency", value: currency },
                        { label: lang === "fr" ? "Destination" : "Destination", value: country.name },
                        {
                          label: lang === "fr" ? `Tarif au kg (${currency})` : `Rate per kg (${currency})`,
                          value: formatMoney(Number(rate) || 0, currency),
                        },
                        {
                          label: lang === "fr" ? "Poids du colis" : "Parcel weight",
                          value: `${Number(weight)} kg`,
                        },
                      ],
                      results: [
                        { label: lang === "fr" ? "Coût total" : "Total cost", value: formatMoney(total, currency) },
                      ],
                      transit: transitLabel("air", lang),
                      arrival:
                        lang === "fr"
                          ? `Arrivée estimée ${arrivalLabel(country)} entre le ${formatDateFR(eta.from)} et le ${formatDateFR(eta.to)}.`
                          : `Estimated arrival in ${country.name} between ${formatDateFR(eta.from)} and ${formatDateFR(eta.to)}.`,
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? ready ? "Clique sur Calculer pour valider." : "Renseigne le tarif et le poids."
                  : ready ? "Click Calculate to reveal." : "Enter rate and weight."}
              </div>
            )}
          </ResultCard>
        )}
      </div>
    </div>
  );
}
