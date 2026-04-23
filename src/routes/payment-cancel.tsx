import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";

const SearchSchema = z.object({ ref: z.string().uuid().optional() });

export const Route = createFileRoute("/payment-cancel")({
  validateSearch: SearchSchema,
  head: () => ({ meta: [{ title: "Paiement annulé — Freight Calculator" }] }),
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass-strong rounded-3xl p-8 text-center"
      >
        <h1 className="text-xl font-bold">Paiement annulé</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous n'avez pas été débité. Vous pouvez relancer le paiement quand vous voulez.
        </p>
        <Link
          to="/app"
          className="mt-6 inline-block rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Retour à l'application
        </Link>
      </motion.div>
    </div>
  );
}
