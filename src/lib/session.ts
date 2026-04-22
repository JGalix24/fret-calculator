// Activation session stored in sessionStorage. Server-side validation lives in src/lib/activation.ts.
import type { ActivationType } from "./activation";

const KEY = "fc.activation.code";

export type ActivationStatus = {
  code: string;
  type: ActivationType;
  remaining: number | null;
};

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

export function updateRemaining(remaining: number | null) {
  const s = getSession();
  if (!s) return;
  setSession({ ...s, remaining });
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
