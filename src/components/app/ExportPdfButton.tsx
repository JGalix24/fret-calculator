import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { generateFreightPdf, type FreightPdfPayload } from "@/lib/pdf";
import { getSession } from "@/lib/session";

type Props = {
  /** Function returning the payload at click time, so values are always fresh. */
  build: () => Omit<FreightPdfPayload, "lang" | "code">;
  disabled?: boolean;
};

export function ExportPdfButton({ build, disabled }: Props) {
  const { lang } = useI18n();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const session = getSession();
      const payload = build();
      generateFreightPdf({ ...payload, lang, code: session?.code });
      toast.success(lang === "fr" ? "PDF téléchargé" : "PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error(lang === "fr" ? "Échec de l'export PDF" : "PDF export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="glass inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {busy
        ? lang === "fr" ? "Génération…" : "Generating…"
        : lang === "fr" ? "Exporter en PDF" : "Export as PDF"}
    </button>
  );
}
