import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ResultCard({
  accent = "blue",
  children,
}: {
  accent?: "blue" | "violet" | "green" | "orange";
  children: ReactNode;
}) {
  const glow =
    accent === "blue"
      ? "var(--shadow-glow-blue)"
      : accent === "violet"
        ? "var(--shadow-glow-violet)"
        : accent === "green"
          ? "var(--shadow-glow-green)"
          : "var(--shadow-glow-orange)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-strong rounded-2xl p-6 md:p-7"
      style={{ boxShadow: glow }}
    >
      {children}
    </motion.div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
