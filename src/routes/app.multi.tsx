import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Field, inputClass, selectClass } from "@/components/app/Field";
import { ResultCard, Stat } from "@/components/app/ResultCard";
import { CalcButton, ExhaustedNotice } from "@/components/app/CalcButton";
import { useConsume } from "@/hooks/useConsume";
import { CURRENCIES, cbm, formatMoney, type Currency } from "@/lib/freight";

type Parcel = { id: string; L: string; W: string; H: string; qty: string };

const newParcel = (): Parcel => ({
  id: Math.random().toString(36).slice(2, 9),
  L: "",
  W: "",
  H: "",
  qty: "1",
});

export const Route = createFileRoute("/app/multi")({
  head: () => ({ meta: [{ title: "Multi-colis — Freight-Calculator" }] }),
  component: MultiPage,
});

function MultiPage() {
  const { lang } = useI18n();
  const [currency, setCurrency] = useState<Currency>("FCFA");
  const [rate, setRate] = useState("");
  const [parcels, setParcels] = useState<Parcel[]>([newParcel(), newParcel()]);
  const { status, consume, reset } = useConsume();
  void reset;
  const showResult = status.state === "ok";
  const exhausted = status.state === "error" && status.fatal;

  const update = (id: string, patch: Partial<Parcel>) => {
    setParcels((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const remove = (id: string) => setParcels((ps) => ps.filter((p) => p.id !== id));
  const add = () => setParcels((ps) => [...ps, newParcel()]);

  const lines = useMemo(
    () =>
      parcels.map((p) => {
        const v = cbm(Number(p.L) || 0, Number(p.W) || 0, Number(p.H) || 0);
        const q = Math.max(1, Number(p.qty) || 1);
        return { ...p, volume: v * q, qty: q };
      }),
    [parcels],
  );
  const totalVolume = lines.reduce((s, l) => s + l.volume, 0);
  const total = totalVolume * (Number(rate) || 0);

  return (
    <div className="max-w-5xl">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl md:text-4xl font-bold tracking-tight"
      >
        <span className="text-gradient">
          {lang === "fr" ? "Multi-colis (CBM)" : "Multi-parcel (CBM)"}
        </span>
      </motion.h1>
      <p className="mt-2 text-muted-foreground">
        {lang === "fr"
          ? "Ajoute autant de colis que tu veux et obtiens le volume total et le coût."
          : "Add as many parcels as you need and get total volume and cost."}
      </p>

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
            <Field label={lang === "fr" ? "Devise" : "Currency"}>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={selectClass}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={lang === "fr" ? `Tarif au m³ (${currency})` : `Rate per m³ (${currency})`}>
              <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value.replace(",", "."))} className={inputClass} />
            </Field>
          </div>

          <div className="space-y-3">
            {parcels.map((p, i) => (
              <div key={p.id} className="glass rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {lang === "fr" ? `Colis ${i + 1}` : `Parcel ${i + 1}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={parcels.length === 1}
                    className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    {lang === "fr" ? "Supprimer" : "Remove"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input value={p.L} onChange={(e) => update(p.id, { L: e.target.value.replace(",", ".") })} placeholder="L (cm)" inputMode="decimal" className={inputClass + " text-center"} />
                  <input value={p.W} onChange={(e) => update(p.id, { W: e.target.value.replace(",", ".") })} placeholder="l (cm)" inputMode="decimal" className={inputClass + " text-center"} />
                  <input value={p.H} onChange={(e) => update(p.id, { H: e.target.value.replace(",", ".") })} placeholder="H (cm)" inputMode="decimal" className={inputClass + " text-center"} />
                  <input value={p.qty} onChange={(e) => update(p.id, { qty: e.target.value })} placeholder={lang === "fr" ? "Qté" : "Qty"} inputMode="numeric" className={inputClass + " text-center"} />
                </div>
                <div className="mt-2 text-right text-xs text-muted-foreground">
                  {lines[i].volume.toFixed(3)} m³
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={add}
              className="w-full rounded-2xl border border-dashed border-border hover:border-primary/40 hover:text-foreground text-muted-foreground py-3 text-sm transition-colors"
            >
              + {lang === "fr" ? "Ajouter un colis" : "Add a parcel"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {exhausted ? (
            <ExhaustedNotice page={lang === "fr" ? "Calculateur Multi-colis" : "Multi-parcel calculator"} />
          ) : (
            <ResultCard accent="orange">
              <div className="space-y-5">
                <Stat
                  label={lang === "fr" ? "Volume total" : "Total volume"}
                  value={`${totalVolume.toFixed(3)} m³`}
                  sub={lang === "fr" ? `${parcels.length} colis` : `${parcels.length} parcels`}
                />
                <Stat
                  label={lang === "fr" ? "Coût total" : "Total cost"}
                  value={showResult ? formatMoney(total, currency) : "—"}
                />
              </div>
            </ResultCard>
          )}
          <CalcButton
            onClick={consume}
            status={status}
            disabled={!(totalVolume > 0 && Number(rate) > 0)}
            label={lang === "fr" ? "Calculer le total" : "Calculate total"}
          />
        </div>
      </div>
    </div>
  );
}
