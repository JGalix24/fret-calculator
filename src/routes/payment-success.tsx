import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { getPaymentStatus } from "@/utils/payments.functions";

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
  const getStatus = useServerFn(getPaymentStatus);
  const [status, setStatus] = useState<"checking" | "paid" | "failed" | "cancelled" | "timeout">(
    "checking",
  );
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
          setStatus("paid");
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

  const onActivate = () => {
    if (!code) return;
    navigate({ to: "/activate", search: { code } as never });
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
            <div
              className="mx-auto h-14 w-14 rounded-2xl grid place-items-center"
              style={{ background: "var(--gradient-orange)", boxShadow: "var(--shadow-glow-orange)" }}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold">
              <span className="text-gradient">Paiement confirmé</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Voici votre code d'activation :</p>
            <button
              onClick={onCopy}
              className="mt-5 w-full rounded-xl bg-input border border-border px-4 py-4 font-mono text-lg tracking-[0.2em] hover:border-primary transition-colors"
            >
              {code}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              {copied ? "Copié ✓" : "Cliquez pour copier"}
            </p>
            <button
              onClick={onActivate}
              className="mt-5 w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] hover:scale-[1.02] transition-transform"
            >
              Activer maintenant →
            </button>
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
