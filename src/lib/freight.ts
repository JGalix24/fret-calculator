// Shared utilities for the calculators.

export type Currency = "FCFA" | "EUR" | "USD";

export const CURRENCIES: Currency[] = ["FCFA", "EUR", "USD"];

// Indicative cross-rates (1 unit = X FCFA). Used only for display conversion.
const TO_FCFA: Record<Currency, number> = {
  FCFA: 1,
  EUR: 655.957,
  USD: 600,
};

export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const inFcfa = amount * TO_FCFA[from];
  return inFcfa / TO_FCFA[to];
}

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = currency === "FCFA" ? Math.round(amount) : Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: currency === "FCFA" ? 0 : 2,
    maximumFractionDigits: currency === "FCFA" ? 0 : 2,
  }).format(rounded);
  return `${formatted} ${currency}`;
}

// Volume in CBM (m3) from cm dimensions.
export function cbm(L: number, l: number, H: number): number {
  return (L * l * H) / 1_000_000;
}

export type Mode = "sea" | "air";

export const TRANSIT: Record<Mode, { minDays: number; maxDays: number }> = {
  sea: { minDays: 45, maxDays: 60 },
  air: { minDays: 7, maxDays: 14 },
};

export function transitLabel(mode: Mode, lang: "fr" | "en" = "fr"): string {
  const { minDays, maxDays } = TRANSIT[mode];
  return lang === "fr" ? `${minDays} à ${maxDays} jours` : `${minDays}–${maxDays} days`;
}

// Compact country list — extend later. Preposition usage in French varies.
export type Country = { code: string; name: string; prep: "au" | "en" | "aux" | "à" };

export const COUNTRIES: Country[] = [
  { code: "TG", name: "Togo", prep: "au" },
  { code: "BJ", name: "Bénin", prep: "au" },
  { code: "BF", name: "Burkina Faso", prep: "au" },
  { code: "CI", name: "Côte d'Ivoire", prep: "en" },
  { code: "GH", name: "Ghana", prep: "au" },
  { code: "SN", name: "Sénégal", prep: "au" },
  { code: "ML", name: "Mali", prep: "au" },
  { code: "NG", name: "Nigéria", prep: "au" },
  { code: "CM", name: "Cameroun", prep: "au" },
  { code: "GA", name: "Gabon", prep: "au" },
  { code: "FR", name: "France", prep: "en" },
  { code: "US", name: "États-Unis", prep: "aux" },
  { code: "CN", name: "Chine", prep: "en" },
];

export function arrivalLabel(country: Country): string {
  return `${country.prep} ${country.name}`;
}

export function estimatedArrivalRange(mode: Mode): { from: Date; to: Date } {
  const now = new Date();
  const { minDays, maxDays } = TRANSIT[mode];
  const from = new Date(now);
  from.setDate(now.getDate() + minDays);
  const to = new Date(now);
  to.setDate(now.getDate() + maxDays);
  return { from, to };
}

export function formatDateFR(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    d,
  );
}
