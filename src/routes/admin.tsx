import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminCreate,
  adminDelete,
  adminList,
  adminLookupDemoRef,
  adminSetActive,
  type ActivationType,
  type CodeRow,
  type DemoLookup,
} from "@/lib/activation";
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Freight-Calculator" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ActivationType>("DEMO");
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [lookupRef, setLookupRef] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<DemoLookup | null>(null);
  const [lookupErr, setLookupErr] = useState<string | null>(null);


  const refresh = async (pw: string) => {
    setLoading(true);
    try {
      const list = await adminList(pw);
      setCodes(list);
      setError(null);
    } catch {
      setError("Mot de passe invalide ou erreur serveur.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) void refresh(password);
  }, [authed, password]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await adminList(password);
      setAuthed(true);
    } catch {
      setError("Mot de passe invalide.");
    }
  };

  const onCreate = async () => {
    try {
      const created = await adminCreate(password, type);
      setJustCreated(created.code);
      void refresh(password);
    } catch {
      setError("Erreur lors de la création.");
    }
  };

  const onToggle = async (row: CodeRow) => {
    await adminSetActive(password, row.id, !row.is_active);
    void refresh(password);
  };

  const onDelete = async (row: CodeRow) => {
    if (!confirm(`Supprimer définitivement ${row.code} ?`)) return;
    await adminDelete(password, row.id);
    void refresh(password);
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
  };

  const onLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLookupErr(null);
    setLookupResult(null);
    if (!lookupRef.trim()) return;
    setLookupLoading(true);
    try {
      const res = await adminLookupDemoRef(password, lookupRef.trim());
      setLookupResult(res);
    } catch {
      setLookupErr("Erreur de recherche.");
    } finally {
      setLookupLoading(false);
    }
  };

  const onCreateDemoForCustomer = async () => {
    try {
      const created = await adminCreate(password, "DEMO");
      setJustCreated(created.code);
      void refresh(password);
    } catch {
      setLookupErr("Impossible de créer le code.");
    }
  };

  const stats = {
    active: codes.filter((c) => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length,
    demo: codes.filter((c) => c.type === "DEMO" && c.is_active && (c.max_usage === null || c.usage_count < (c.max_usage ?? 0))).length,
    monthly: codes.filter((c) => c.type === "MENSUEL" && c.is_active).length,
    quarterly: codes.filter((c) => c.type === "TRIMESTRIEL" && c.is_active).length,
    annual: codes.filter((c) => c.type === "ANNUEL" && c.is_active).length,
    expired: codes.filter((c) => (c.expires_at && new Date(c.expires_at) < new Date()) || (c.max_usage !== null && c.usage_count >= (c.max_usage ?? 0))).length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-hero)" }}>
        <form onSubmit={onLogin} className="glass-strong rounded-3xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-center">
            <span className="text-gradient">Admin Freight-Calculator</span>
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe admin"
            className="w-full rounded-xl bg-input border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Entrer
          </button>
          {error && <p className="text-xs text-center text-destructive">{error}</p>}
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Retour à l'accueil
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border/60 backdrop-blur-md bg-background/40">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="font-semibold">Admin · Freight-Calculator</div>
          <button
            onClick={() => { setAuthed(false); setPassword(""); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Codes actifs", value: stats.active },
            { label: "DEMO en cours", value: stats.demo },
            { label: "MENSUEL actifs", value: stats.monthly },
            { label: "TRIMESTRIEL actifs", value: stats.quarterly },
            { label: "ANNUEL actifs", value: stats.annual },
            { label: "Expirés / épuisés", value: stats.expired },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Créer un nouveau code</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivationType)}
              className="rounded-xl bg-input border border-border px-3 py-2.5 text-sm"
            >
              <option value="DEMO">DEMO (5 calculs)</option>
              <option value="MENSUEL">MENSUEL (30 jours)</option>
              <option value="TRIMESTRIEL">TRIMESTRIEL (90 jours)</option>
              <option value="ANNUEL">ANNUEL (365 jours)</option>
            </select>
            <button
              onClick={onCreate}
              className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Générer
            </button>
            {justCreated && (
              <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border px-3 py-2 font-mono text-sm">
                {justCreated}
                <button onClick={() => copy(justCreated)} className="text-xs text-muted-foreground hover:text-foreground">Copier</button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Vérifier un visiteur (référence WhatsApp)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Le visiteur t'envoie sa référence (ex : <code className="font-mono">A3F2-9K1B</code>). Colle-la ici pour vérifier s'il a déjà reçu un code démo.
          </p>
          <form onSubmit={onLookup} className="mt-4 flex flex-wrap items-end gap-3">
            <input
              type="text"
              value={lookupRef}
              onChange={(e) => setLookupRef(e.target.value)}
              placeholder="A3F2-9K1B"
              className="flex-1 min-w-[200px] rounded-xl bg-input border border-border px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={lookupLoading || !lookupRef.trim()}
              className="rounded-xl bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {lookupLoading ? "Recherche…" : "Vérifier"}
            </button>
          </form>

          {lookupErr && <p className="mt-3 text-xs text-destructive">{lookupErr}</p>}

          {lookupResult && (
            <div className="mt-4 rounded-xl border border-border bg-card/40 p-4 text-sm">
              {lookupResult.found ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                      Déjà servi
                    </span>
                    <span className="text-xs text-muted-foreground">Référence : <code className="font-mono">{lookupResult.short_ref}</code></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Code donné :</span> <code className="font-mono">{lookupResult.code ?? "—"}</code></div>
                    <div><span className="text-muted-foreground">Type :</span> {lookupResult.code_type ?? "—"}</div>
                    <div><span className="text-muted-foreground">Reçu le :</span> {lookupResult.granted_at ? new Date(lookupResult.granted_at).toLocaleString("fr-FR") : "—"}</div>
                    <div><span className="text-muted-foreground">Utilisation :</span> {lookupResult.usage_count ?? 0}/{lookupResult.max_usage ?? "∞"}</div>
                    <div><span className="text-muted-foreground">Actif :</span> {lookupResult.is_active ? "Oui" : "Non"}</div>
                  </div>
                  <p className="pt-2 text-xs text-muted-foreground">
                    ⚠️ Cette personne a déjà reçu un code. Elle ment probablement. Propose-lui un plan payant.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-brand-green/15 px-2 py-0.5 text-xs font-semibold text-[oklch(0.7_0.16_160)]">
                      Jamais servi
                    </span>
                    <span className="text-xs text-muted-foreground">Aucun code démo trouvé pour cette référence.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cas légitime probable. Tu peux générer un code démo manuellement à lui envoyer :
                  </p>
                  <button
                    onClick={onCreateDemoForCustomer}
                    className="rounded-xl bg-[oklch(0.7_0.18_145)] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:scale-[1.02] transition-transform"
                  >
                    Créer un code DEMO manuel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Créé</th>
                <th className="text-left px-4 py-3">Expire</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Chargement…</td></tr>}
              {!loading && codes.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Aucun code pour le moment.</td></tr>}
              {codes.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date();
                const exhausted = c.max_usage !== null && c.usage_count >= (c.max_usage ?? 0);
                const status = !c.is_active ? "Désactivé" : expired ? "Expiré" : exhausted ? "Épuisé" : `Actif${c.max_usage ? ` (${c.usage_count}/${c.max_usage})` : ""}`;
                return (
                  <tr key={c.id} className="border-t border-border/60">
                    <td className="px-4 py-3 font-mono text-xs">
                      <button onClick={() => copy(c.code)} className="hover:text-primary">{c.code}</button>
                    </td>
                    <td className="px-4 py-3 text-xs">{c.type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className="px-4 py-3 text-xs">{status}</td>
                    <td className="px-4 py-3 text-right text-xs space-x-3">
                      <button onClick={() => onToggle(c)} className="text-muted-foreground hover:text-foreground">
                        {c.is_active ? "Désactiver" : "Réactiver"}
                      </button>
                      <button onClick={() => onDelete(c)} className="text-destructive hover:underline">Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Mot de passe par défaut : <code>mrg-admin-2026</code>. Modifiable en base via la table <code>app_settings</code>.
        </p>
      </main>
    </div>
  );
}
