

## Phase 2 — Intégration PayDunya (paiement automatique)

### Ce dont j'ai besoin de toi

Pour brancher PayDunya, j'ai besoin de **4 secrets** que tu trouves dans ton dashboard PayDunya → **Intégration → API Keys** :

1. **`PAYDUNYA_MASTER_KEY`** — clé maître du compte
2. **`PAYDUNYA_PUBLIC_KEY`** — clé publique (mode test : commence par `test_public_…`)
3. **`PAYDUNYA_PRIVATE_KEY`** — clé privée (mode test : commence par `test_private_…`)
4. **`PAYDUNYA_TOKEN`** — token de l'API

Plus 1 secret optionnel mais recommandé :
5. **`PAYDUNYA_MODE`** — `test` pour l'instant, `live` plus tard quand tu passes en prod

Je te demanderai ces secrets via l'outil `add_secret` dès que tu valides ce plan. **Ne colle jamais de clés directement dans le chat** — utilise la popup sécurisée qui s'ouvrira.

### Ce que je vais construire

**1. Table `payments` (migration SQL)**
- `id`, `plan` (`MENSUEL`/`TRIMESTRIEL`), `amount`, `status` (`pending`/`paid`/`failed`/`cancelled`)
- `provider` (`paydunya`), `provider_token` (token de la facture), `provider_ref` (transaction id)
- `code_id` (FK → `activation_codes`, rempli après paiement validé)
- `customer_phone`, `customer_name` (optionnels), `created_at`, `paid_at`
- RLS : `no_direct_access` (comme les autres tables) — accès uniquement via RPC/service role

**2. Server function `createCheckoutSession`** (`src/utils/payments.functions.ts`)
- Input : `{ plan: "MENSUEL" | "TRIMESTRIEL" }`
- Crée une ligne `payments` avec `status=pending`
- Appelle l'API PayDunya `/checkout-invoice/create` avec :
  - Montant (2 000 ou 5 000 FCFA)
  - URLs de retour : `/payment-success?ref=...`, `/payment-cancel?ref=...`
  - URL callback webhook : `/api/public/paydunya-webhook`
  - `custom_data` : id de la ligne `payments` pour relier au callback
- Retourne `{ checkout_url, token }`

**3. Webhook `/api/public/paydunya-webhook`** (`src/routes/api/public/paydunya-webhook.ts`)
- Reçoit le POST IPN de PayDunya
- **Vérifie l'authenticité** via le hash `data[hash]` = SHA-512 de `PAYDUNYA_MASTER_KEY` (méthode officielle PayDunya)
- Si `status === "completed"` :
  - Génère un code activation via une nouvelle RPC `system_create_paid_code(_payment_id, _type)` (équivalent admin sans password, appelée avec service role uniquement)
  - Met à jour `payments` : `status=paid`, `code_id=...`, `paid_at=now()`
- Si `cancelled` / `failed` : met à jour le status

**4. Modale Paywall mise à jour**
- Les 2 boutons « Choisir ce plan » appellent `createCheckoutSession` au lieu d'ouvrir WhatsApp
- Pendant le chargement : spinner + texte « Redirection vers paiement… »
- Sur succès : `window.location.href = checkout_url`
- Garde le lien WhatsApp comme **fallback discret** (« Problème ? Nous contacter »)

**5. Pages de retour**
- `src/routes/payment-success.tsx` :
  - Lit `?ref=...`
  - Polling toutes les 2s sur une server fn `getPaymentStatus({ ref })` (max 30s)
  - Quand `status=paid` : affiche le code généré en grand, bouton « Activer maintenant » → `/activate` avec code pré-rempli
  - Si timeout : message « Paiement en cours de validation, vous recevrez le code par WhatsApp »
- `src/routes/payment-cancel.tsx` : message d'annulation + retour au paywall

**6. Page `/activate` améliorée**
- Lit `?code=...` dans l'URL et pré-remplit le champ → permet le flux fluide depuis `payment-success`

### Détails techniques PayDunya

**Endpoints utilisés** (mode test : `https://app.paydunya.com/sandbox-api/v1/`, mode live : `https://app.paydunya.com/api/v1/`) :
- `POST /checkout-invoice/create` — créer la facture
- `GET /checkout-invoice/confirm/{token}` — vérifier le statut (utilisé en backup par la page success si webhook lent)

**Headers requis sur chaque appel** :
```
PAYDUNYA-MASTER-KEY: ...
PAYDUNYA-PRIVATE-KEY: ...
PAYDUNYA-TOKEN: ...
PAYDUNYA-MODE: test
```

**Vérification webhook** : PayDunya envoie un champ `data[hash]` = SHA-512 hex de la `MASTER_KEY`. On compare avec `crypto.createHash('sha512').update(masterKey).digest('hex')` en `timingSafeEqual`.

### Fichiers touchés

**Création** :
- Migration : table `payments` + RPC `system_create_paid_code`
- `src/utils/payments.functions.ts` — `createCheckoutSession`, `getPaymentStatus`
- `src/utils/paydunya.server.ts` — wrapper API + vérif hash
- `src/routes/api/public/paydunya-webhook.ts` — IPN handler
- `src/routes/payment-success.tsx` — polling + affichage code
- `src/routes/payment-cancel.tsx`

**Édition** :
- `src/components/app/PaywallModal.tsx` — boutons branchés sur `createCheckoutSession`
- `src/routes/activate.tsx` — support `?code=...` pré-rempli

### Étapes d'exécution une fois validé

1. Tu valides le plan
2. Je te demande les 4 secrets PayDunya via popup sécurisée
3. Tu colles les valeurs (depuis ton dashboard PayDunya en mode test)
4. Je crée la migration + tout le code
5. Test : lance un paiement test depuis le paywall → PayDunya simulera le paiement → webhook reçu → code généré → page success affiche le code

### Question

Tu confirmes qu'on part sur ce flux ? Je lance la demande des secrets dès que tu dis OK.

