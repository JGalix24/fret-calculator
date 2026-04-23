// Lightweight client-side fingerprint helpers (non-PII).
// Produces a stable id per browser+device based on UA-CH-like signals.

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function getClientFingerprint(): { ua: string; lang: string; signal: string } {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { ua: "", lang: "", signal: "" };
  }
  const ua = navigator.userAgent || "";
  const lang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
  const platform = (navigator as Navigator & { platform?: string }).platform || "";
  const screenInfo = `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}x${window.screen?.colorDepth ?? 0}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const signal = `${ua}|${lang}|${platform}|${screenInfo}|${tz}|${(navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 0}`;
  // Repeat hash a few times mixed for more entropy in 32 chars
  const h1 = fnv1a(signal);
  const h2 = fnv1a(signal + h1);
  const h3 = fnv1a(h2 + signal + h1);
  const h4 = fnv1a(h3 + h2 + h1);
  return { ua, lang, signal: h1 + h2 + h3 + h4 };
}
