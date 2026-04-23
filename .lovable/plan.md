

## Plan : Mise à jour tarifs + paywall + paiement automatique

### Tarifs corrigés (partout)

- **Mensuel** : ~~5 000 FCFA~~ → **2 000 FCFA** / 30 jours
- **Trimestriel** : ~~12 000 FCFA~~ → **5 000 FCFA** / 90 jours
- Badge « Économie » sur trimestriel : ~17 % d'économie vs 3 mois mensuels (6 000 → 5 000)

### Fichiers à mettre à jour pour les tarifs

- `src/lib/i18n.tsx` : clés `pricing.month.price`, `pricing.quarter.price`, `pricing.quarter.save` (FR + EN)
- `src/routes/activate.tsx` : ligne `t("activate.pricing")` (clé i18n)
- Tout endroit qui mentionne « 5 000 » ou « 12 000 » FCFA en dur

### Partie 1 — Fix build error (immédiat)

`src/routes/activate.tsx` ligne 70 : ajouter `search: {} as never` au `navigate({ to: "/activated" })`. Vérifier que `activated.tsx` a bien un `validateSearch` qui rend tout optionnel.

### Partie 2 — Modale Paywall bloquante (Phase 1)

**Création** :
- `src/components/app/PaywallModal.tsx` : `Dialog` non fermable, titre « Vos 5 essais gratuits sont terminés », 2 cartes prix (2 000 / 5 000 FCFA), mention « Paiement Mixx by Yas ou Flooz », bouton « J'ai déjà un code » → `/activate`
- `src/lib/paywall.tsx` : context global `PaywallProvider` + hook `usePaywall()` avec `openPaywall()` / `closePaywall()`

**Édition** :
- `src/routes/__root.tsx` : monter `<PaywallProvider>`
- `src/components/app/AppShell.tsx` : monter `<PaywallModal />` une fois pour `/app/*`
- `src/hooks/useConsume.ts` : sur `reason === "exhausted"` → `openPaywall()`

**CTA Phase 1** : les 2 boutons pointent vers WhatsApp avec contexte enrichi (plan choisi + code masqué). Conversion immédiate, zéro setup externe.

### Partie 3 — Paiement automatique (Phase 2, après ouverture compte PayDunya)

**Provider retenu** : **PayDunya** — seule intégration qui couvre **Mixx by Yas** + **Flooz Moov Money** au Togo via une seule API.

**Flux** :
```text
Modale Paywall → Clic plan
  → Server fn createCheckout(plan)
  → API PayDunya: invoice (Mixx by Yas + Flooz)
  → Redirection page hosted PayDunya
  → User paie via USSD
  → Callback webhook /api/public/paydunya-webhook
  → Vérif HMAC → génère code via RPC admin → stocke transaction
  → Redirige /payment-success?ref=XXX → affiche code + bouton activer
```

**Création (Phase 2)** :
- `src/utils/payments.functions.ts` — `createCheckoutSession({ plan })`
- `src/routes/api/public/paydunya-webhook.ts` — webhook + vérif HMAC
- `src/routes/payment-success.tsx` — polling status + affichage code
- `src/routes/payment-cancel.tsx`
- Migration : table `payments` (id, plan, amount, status `pending|paid|failed`, provider_ref, code_id FK, created_at, paid_at)

**Secrets requis (à demander avant Phase 2)** :
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_TOKEN`
- `PAYDUNYA_MODE` (`test` / `live`)

### Plan d'exécution proposé

**Maintenant** : Tarifs corrigés + Fix build + Phase 1 (paywall bloquant + WhatsApp).
**Plus tard** : Phase 2 (PayDunya automatique) quand tu auras créé le compte sur paydunya.com.

### Question avant exécution

1. On valide bien les tarifs **2 000 FCFA mensuel / 5 000 FCFA trimestriel** partout (landing + activate + paywall) ?
2. As-tu déjà ouvert ton compte **PayDunya**, ou on fait **Phase 1 maintenant** et Phase 2 quand tu l'auras ?

