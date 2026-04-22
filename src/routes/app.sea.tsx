import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Field, inputClass, selectClass } from "@/components/app/Field";
import { ResultCard, Stat } from "@/components/app/ResultCard";
import { CalcButton, ExhaustedNotice } from "@/components/app/CalcButton";
import { useConsume } from "@/hooks/useConsume";
import {
  CURRENCIES,
  COUNTRIES,
  arrivalLabel,
  cbm,
  formatMoney,
  transitLabel,
  estimatedArrivalRange,
  formatDateFR,
  type Currency,
} from "@/lib/freight";

export const Route = createFileRoute("/app/sea")({
  head: () => ({ meta: [{ title: "Calcul fret maritime — Freight-Calculator" }] }),
  component: SeaPage,
});

function SeaPage() {
  const { lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>("FCFA");
  const [countryCode, setCountryCode] = useState("TG");
  const [rate, setRate] = useState("");
  const [L, setL] = useState("");
  const [W, setW] = useState("");
  const [H, setH] = useState("");

  const { status, consume, reset } = useConsume();

  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const volume = useMemo(() => cbm(Number(L) || 0, Number(W) || 0, Number(H) || 0), [L, W, H]);
  const total = volume * (Number(rate) || 0);
  const eta = estimatedArrivalRange("sea");
  const ready = volume > 0 && Number(rate) > 0;
  const showResult = status.state === "ok" && ready;
  const exhausted = status.state === "error" && status.fatal;

  // Reset cached result when inputs change
  const onInputChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (status.state === "ok") reset();
  };

  return (
    <div className="max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold tracking-tight"
      >
        <span className="text-gradient">
          {lang === "fr" ? "Fret maritime (CBM)" : "Sea freight (CBM)"}
        </span>
      </motion.h1>
      <p className="mt-2 text-muted-foreground">
        {lang === "fr"
          ? "Volume = L × l × H ÷ 1 000 000. Coût = volume × tarif au m³."
          : "Volume = L × W × H / 1,000,000. Cost = volume × CBM rate."}
      </p>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={lang === "fr" ? "Devise" : "Currency"}>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className={selectClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={lang === "fr" ? "Destination" : "Destination"}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={selectClass}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={lang === "fr" ? `Tarif au m³ (${currency})` : `Rate per m³ (${currency})`}>
            <input
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(",", "."))}
              placeholder="ex: 250000"
              className={inputClass}
            />
          </Field>

          <div>
            <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {lang === "fr" ? "Dimensions du colis (cm)" : "Parcel dimensions (cm)"}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input value={L} onChange={(e) => setL(e.target.value.replace(",", "."))} placeholder="L" inputMode="decimal" className={inputClass + " text-center"} />
              <input value={W} onChange={(e) => setW(e.target.value.replace(",", "."))} placeholder="l" inputMode="decimal" className={inputClass + " text-center"} />
              <input value={H} onChange={(e) => setH(e.target.value.replace(",", "."))} placeholder="H" inputMode="decimal" className={inputClass + " text-center"} />
            </div>
          </div>
        </div>

        <ResultCard accent="blue">
          {ready ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Stat
                  label={lang === "fr" ? "Volume" : "Volume"}
                  value={`${volume.toFixed(3)} m³`}
                />
                <Stat
                  label={lang === "fr" ? "Coût total" : "Total cost"}
                  value={formatMoney(total, currency)}
                />
              </div>
              <div className="rounded-xl bg-card/40 border border-border p-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {lang === "fr" ? "Délai estimé" : "Estimated transit"}
                </div>
                <div className="mt-1 text-base font-semibold">{transitLabel("sea", lang)}</div>
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
                ? "Renseigne le tarif et les dimensions pour voir le calcul."
                : "Enter rate and dimensions to see the calculation."}
            </div>
          )}
        </ResultCard>
      </div>
    </div>
  );
}
