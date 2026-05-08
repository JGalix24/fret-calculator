## Migration FedaPay → MoneyFusion

Remplacement complet de FedaPay par MoneyFusion comme passerelle de paiement unique.

### 1. Secret à ajouter
Une popup te demandera de coller :
- **`MONEYFUSION_API_URL`** = `https://pay.moneyfusion.net/FRET_CALCULATOR/ee69a3f2bf4d0730/pay/`

(les anciens secrets FedaPay seront supprimés ensuite)

### 2. Migration base de données
- Changer le `default` de `payments.provider` : `'paydunya'` → `'moneyfusion'`

### 3. Nouveaux fichiers
- **`src/utils/moneyfusion.server.ts`** — wrapper API MoneyFusion :
  - `createPayment({ plan, paymentId, callbackUrl, webhookUrl })` → POST sur l'URL d'API → retourne `{ token, checkoutUrl }`
  - `checkPaymentStatus(token)` → GET `https://www.pay.moneyfusion.net/paiementNotif/{token}` → normalise `paid` / `pending` / `failed` / `cancelled`

- **`src/routes/api.public.moneyfusion-webhook.ts`** — handler webhook :
  - Parse le payload JSON
  - Extrait `personal_Info[0].payment_id` et `tokenPay`
  - **Re-vérifie systématiquement** le statut via `checkPaymentStatus` (sécurité contre faux webhooks — MoneyFusion ne signe pas ses webhooks)
  - Mappe l'event vers le statut interne et appelle `system_create_paid_code` ou `system_mark_payment_status`
  - Idempotent (skip si déjà `paid`/`cancelled`)

### 4. Fichiers modifiés
- **`src/utils/payments.functions.ts`** :
  - `createCheckoutSession` appelle `moneyfusion.createPayment` au lieu de FedaPay
  - `getPaymentStatus` poll via `moneyfusion.checkPaymentStatus`

### 5. Fichiers supprimés
- `src/utils/fedapay.server.ts`
- `src/routes/api.public.fedapay-webhook.ts`

### 6. Configuration côté MoneyFusion (à faire après le déploiement)
Dans le dashboard MoneyFusion, configure le webhook sur :
```
https://fret-calculator.lovable.app/api/public/moneyfusion-webhook
```

### Sécurité
MoneyFusion **ne signe pas** ses webhooks. Pour empêcher un attaquant d'envoyer un faux paiement validé, le webhook re-vérifie **toujours** le statut via l'API MoneyFusion (`paiementNotif/{token}`) avant de générer un code d'activation. Aucun code n'est créé sur la base du seul payload reçu.

### Test après implémentation
1. Modifier temporairement le prix d'un plan à 100 XOF
2. Faire un vrai paiement (test si l'app MoneyFusion est approuvée, sinon attendre l'approbation)
3. Vérifier que le code d'activation est généré et reçu
4. Restaurer les prix normaux