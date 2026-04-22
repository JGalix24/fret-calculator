import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n, buildWhatsappLink } from "@/lib/i18n";
import type { ConsumeUI } from "@/hooks/useConsume";
import { getSession } from "@/lib/session";

export function CalcButton({
  onClick,
  status,
  disabled,
  label,
}: {
  onClick: () => void;
  status: ConsumeUI;
  disabled?: boolean;
  label: string;
}) {
  const { t } = useI18n();
  const loading = status.state === "loading";
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading || disabled}
        className="w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-blue)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? t("app.computing") : label}
      </button>
      {status.state === "ok" && status.remaining !== null && (
        <p className="text-[11px] text-center text-muted-foreground">
          {status.remaining} {t("app.remaining")}
        </p>
      )}
      {status.state === "error" && (
        <p className="text-xs text-center text-destructive">{status.message}</p>
      )}
    </div>
  );
}

export function ExhaustedNotice({
  title,
  body,
  ctaLabel,
  page,
}: {
  title?: string;
  body?: string;
  ctaLabel?: string;
  page?: string;
}) {
  const { lang, t } = useI18n();
  const session = getSession();
  return (
    <div className="glass-strong rounded-2xl p-6 text-center">
      <h3 className="text-lg font-bold">{title ?? t("app.exhausted.title")}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body ?? t("app.exhausted.body")}</p>
      <a
        href={buildWhatsappLink(lang, "exhausted", {
          code: session?.code,
          remaining:
            session?.remaining !== null && session?.remaining !== undefined
              ? session.remaining
              : undefined,
          page,
        })}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.7_0.18_145)] hover:bg-[oklch(0.66_0.18_145)] px-5 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors"
      >
        {ctaLabel ?? t("pricing.cta")}
      </a>
    </div>
  );
}

export function ResultGate({
  status,
  preview,
  result,
  page,
}: {
  status: ConsumeUI;
  preview: ReactNode;
  result: ReactNode;
  page?: string;
}) {
  if (status.state === "ok") return <>{result}</>;
  if (status.state === "error" && status.fatal) {
    return <ExhaustedNotice page={page} />;
  }
  return <>{preview}</>;
}

export function HistoryLink() {
  return (
    <Link
      to="/app"
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      ← Accueil
    </Link>
  );
}
