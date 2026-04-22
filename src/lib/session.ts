// Local-only activation session. Will be replaced by Supabase verification later.
const KEY = "fc.activation.code";

export type ActivationStatus = {
  code: string;
  type: "DEMO" | "MENSUEL" | "TRIMESTRIEL";
};

const CODE_RE = /^MRG-(DEMO|30|90)-[A-Z0-9]{4}$/;

export function parseCode(raw: string): ActivationStatus | null {
  const code = raw.trim().toUpperCase();
  if (!CODE_RE.test(code)) return null;
  const seg = code.split("-")[1];
  const type = seg === "DEMO" ? "DEMO" : seg === "30" ? "MENSUEL" : "TRIMESTRIEL";
  return { code, type };
}

export function getSession(): ActivationStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivationStatus) : null;
  } catch {
    return null;
  }
}

export function setSession(s: ActivationStatus) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
