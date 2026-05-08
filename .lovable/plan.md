# Migration FedaPay → MoneyFusion

Remplacement complet de FedaPay par MoneyFusion. Une seule passerelle, plus simple à maintenir.

## Ce que MoneyFusion change vs FedaPay

| Aspect | FedaPay | MoneyFusion |
|---|---|---|
| Auth | Bearer token (secret key) | URL d'API unique = secret |
| Création tx | 2 étapes (transaction + token) | 1 seul POST |
| Webhook | Signature HMAC vérifiée | **Aucune signature** → on re-vérifie via API |
| Sandbox | Oui | Non documenté |
| Wallets | Mobile money Afrique Ouest | Orange, MTN, Moov, Wave |

## Étapes utilisateur (avant qu'on code)

1. Créer un compte sur https://moneyfusion.net
2. Dashboard → "API de paiement" → créer une application
3. Renseigner l'URL du site : `https://fret-calculator.lovable.app`
4. Renseigner le webhook : `https://fret-calculator.lovable.app/api/public/moneyfusion-webhook`
5. Récupérer **l'URL d'API** générée (c'est le secret)

## Plan technique

### 1. Secrets
- **Ajouter** : `MONEYFUSION_API_URL` (l'URL d'API complète)
- **Supprimer** : `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET`, `FEDAPAY_MODE`

### 2. Fichiers à créer
- `src/utils/moneyfusion.server.ts` — wrapper API :
  - `createPayment({ plan, paymentId, callbackUrl, webhookUrl })` → POST sur `MONEYFUSION_API_URL`, retourne `{ token, checkoutUrl }`
  - `checkPaymentStatus(token)` → GET `https://www.pay.moneyfusion.net/paiementNotif/{token}`, normalise statut
- `src/routes/api.public.moneyfusion-webhook.ts` — handler webhook :
  - Parse JSON (pas de signature à vérifier)
  - Extrait `personal_Info[0].payment_id` + `tokenPay`
  - **Toujours re-confirmer** via `checkPaymentStatus(tokenPay)` (sécurité contre faux webhooks)
  - Mappe `event` → statut interne :
    - `payin.session.completed` + statut API `paid` → `completed` → `system_create_paid_code`
    - `payin.session.cancelled` → `cancelled` → `system_mark_payment_status`
    - `payin.session.pending` → ignoré
  - Idempotence : skip si payment déjà `paid`/`cancelled` en DB

### 3. Fichiers à modifier
- `src/utils/payments.functions.ts` :
  - `createCheckoutSession` appelle `moneyfusion.createPayment` au lieu de FedaPay
  - `getPaymentStatus` poll via `moneyfusion.checkPaymentStatus`
- DB : `payments.provider` default → `'moneyfusion'` (migration légère)

### 4. Fichiers à supprimer
- `src/utils/fedapay.server.ts`
- `src/routes/api.public.fedapay-webhook.ts`

### 5. UX checkout
Pour minimiser les changements UI : on enverra `nomclient: "Client FreightCalc"` et `numeroSend: "00000000"` par défaut. MoneyFusion demande au client de saisir son vrai numéro sur leur page de paiement, donc ces valeurs servent juste de placeholder. Pas de formulaire ajouté.

## Points de vigilance sécurité

1. **Pas de signature webhook** → la vérification serveur via `paiementNotif/{token}` est **obligatoire**, jamais générer de code d'activation sur la base du seul payload webhook.
2. **Webhooks dupliqués** : MoneyFusion peut envoyer plusieurs fois le même event → check idempotent en DB avant `system_create_paid_code`.
3. **Endpoint webhook public** : un attaquant peut le pinger avec un faux `payment_id`, mais le check via `paiementNotif/{token}` empêche toute fraude.

## Ce que tu dois faire après "Implement plan"

1. Créer ton app MoneyFusion et récupérer l'URL d'API
2. Coller l'URL dans le secret `MONEYFUSION_API_URL` (on te demandera)
3. Configurer le webhook dans le dashboard MoneyFusion
4. Tester avec un petit montant (ex: 100 XOF en modifiant temporairement les prix)
