import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
// trigger route regeneration
import { z } from "zod";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { getPaymentStatus } from "@/utils/payments.functions";
import { validateCode } from "@/lib/activation";
import { setSession } from "@/lib/session";
import { buildWhatsappLink, useI18n } from "@/lib/i18n";

type PaidPlan = "MENSUEL" | "TRIMESTRIEL" | "DEMO";

const PLAN_LABEL: Record<string, { name: string; days: string }> = {
  MENSUEL: { name: "Mensuel", days: "30 jours" },
  TRIMESTRIEL: { name: "Trimestriel", days: "90 jours" },
  DEMO: { name: "Démo", days: "5 calculs" },
};

const SearchSchema = z.object({ ref: z.string().uuid().optional() });

export const Route = createFileRoute("/payment-success")({
  validateSearch: SearchSchema,
  head: () => ({
    meta: [{ title: "Paiement confirmé — Freight Calculator" }],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const getStatus = useServerFn(getPaymentStatus);
  const [status, setStatus] = useState<"checking" | "paid" | "failed" | "cancelled" | "timeout">(
    "checking",
  );
  const [code, setCode] = useState<string | null>(null);
  const [plan, setPlan] = useState<PaidPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!ref) {
      setStatus("failed");
      return;
    }
    let attempts = 0;
    const maxAttempts = 20; // ~40s
    const tick = async () => {
      if (stoppedRef.current) return;
      attempts++;
      try {
        const res = await getStatus({ data: { ref } });
        if (res.ok && res.status === "paid" && res.code) {
          stoppedRef.current = true;
          setCode(res.code);
          if ("plan" in res && res.plan) setPlan(res.plan as PaidPlan);
          setStatus("paid");
          // Auto-activate the session so the user lands directly in /app
          try {
            const v = await validateCode(res.code);
            if (v.ok) {
              setSession({
                code: res.code,
                type: v.type,
                remaining: v.remaining,
                expiresAt: v.expiresAt,
                activatedAt: new Date().toISOString(),
              });
              setRedirectIn(5);
            }
          } catch (err) {
            console.error("auto-activate failed", err);
          }
          return;
        }
        if (res.ok && (res.status === "failed" || res.status === "cancelled")) {
          stoppedRef.current = true;
          setStatus(res.status);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      if (attempts >= maxAttempts) {
        stoppedRef.current = true;
        setStatus("timeout");
        return;
      }
      setTimeout(tick, 2000);
    };
    tick();
    return () => {
      stoppedRef.current = true;
    };
  }, [ref, getStatus]);

  // Countdown then redirect to /app
  useEffect(() => {
    if (redirectIn === null) return;
    if (redirectIn <= 0) {
      navigate({ to: "/app" });
      return;
    }
    const id = window.setTimeout(() => setRedirectIn((n) => (n === null ? null : n - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [redirectIn, navigate]);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };


  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 text-center"
      >
        {status === "checking" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <h1 className="mt-6 text-xl font-bold">
              <span className="text-gradient">Validation du paiement…</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Cela prend quelques secondes. Ne fermez pas cette page.
            </p>
          </>
        )}

        {status === "paid" && code && (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="mx-auto h-20 w-20 rounded-full grid place-items-center"
              style={{ background: "oklch(0.7 0.18 145)", boxShadow: "0 0 60px oklch(0.7 0.18 145 / 0.5)" }}
            >
              <svg viewBox="0 0 24 24" className="h-11 w-11 text-[#0F172A]" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-3xl font-extrabold tracking-tight"
            >
              🎉 <span className="text-gradient">Félicitations !</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-3 text-sm text-muted-foreground"
            >
              Votre abonnement{" "}
              <span className="font-semibold text-foreground">
                {plan ? PLAN_LABEL[plan]?.name ?? plan : ""}
              </span>{" "}
              est actif pour{" "}
              <span className="font-semibold text-foreground">
                {plan ? PLAN_LABEL[plan]?.days ?? "" : ""}
              </span>
              .
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Votre code d'activation
              </p>
              <button
                onClick={onCopy}
                className="mt-3 w-full rounded-xl bg-input border-2 border-dashed border-primary/40 px-4 py-5 font-mono text-xl tracking-[0.2em] hover:border-primary transition-colors"
              >
                {code}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                {copied ? "Copié ✓" : "Cliquez pour copier"}
              </p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              onClick={() => navigate({ to: "/app" })}
              className="mt-6 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] hover:scale-[1.02] transition-transform"
            >
              {redirectIn !== null && redirectIn > 0
                ? `Accéder au calculateur (${redirectIn})`
                : "Accéder au calculateur →"}
            </motion.button>
            {redirectIn !== null && (
              <p className="mt-2 text-xs text-muted-foreground">
                Redirection automatique vers le calculateur…
              </p>
            )}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Un problème ? Contactez Mr G
              </p>
              <a
                href={buildWhatsappLink(lang, "general", { code })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                  <path d="M20.52 3.48A11.93 11.93 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84c0 2.08.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.64 1.44c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.44z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </>
        )}

        {status === "cancelled" && (
          <>
            <h1 className="text-xl font-bold text-destructive">Paiement annulé</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous pouvez réessayer quand vous voulez.
            </p>
            <Link to="/app" className="mt-6 inline-block text-xs underline underline-offset-4">
              Retour à l'application
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="text-xl font-bold text-destructive">Paiement échoué</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Aucun débit n'a été effectué. Contactez-nous si le problème persiste.
            </p>
            <Link to="/app" className="mt-6 inline-block text-xs underline underline-offset-4">
              Retour à l'application
            </Link>
          </>
        )}

        {status === "timeout" && (
          <>
            <h1 className="text-xl font-bold">Paiement en cours de validation</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Votre paiement est en cours de traitement par PayDunya. Dès qu'il sera confirmé, vous
              recevrez votre code par WhatsApp. Vous pouvez aussi rafraîchir cette page dans une minute.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Rafraîchir
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
