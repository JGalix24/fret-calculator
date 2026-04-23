

## Plan global — Améliorer le flux paiement + DEMO + Landing

### 1. 🎁 DEMO auto-généré (zéro friction)

**Nouveau bouton sur la landing** : « Essayer gratuitement (5 calculs) »
- Présent dans Hero + Pricing (3ème carte « Démo gratuit »)
- Au clic → server function `createDemoCode()` génère un code `MRG-DEMO-XXXX` instantanément
- Redirection auto vers `/activate?code=MRG-DEMO-XXXX` → activation 1 clic
- **Anti-abus** : `localStorage` stocke `demo_used=true` → si déjà utilisé, message « Vous avez déjà profité de votre essai gratuit, passez à un plan payant » + scroll vers Pricing

**Nouveau RPC** : `system_create_demo_code()` (security definer, accessible publiquement via server fn — pas de password admin)

**Nouvelle server fn** : `createDemoCode` dans `src/utils/payments.functions.ts`

### 2. 💳 Boutons « Payer maintenant » sur la landing Pricing

**Refonte de `src/components/landing/Pricing.tsx`** :
- 3 cartes au lieu de 2 :
  - **Démo gratuit** (gratuit, 5 calculs) → bouton « Essayer gratuitement »
  - **Mensuel** (2 000 FCFA / 30 j) → bouton principal « Payer maintenant » + lien WhatsApp discret
  - **Trimestriel** (5 000 FCFA / 90 j, badge « Économisez ») → bouton principal « Payer maintenant » + lien WhatsApp discret
- Boutons « Payer maintenant » appellent `createCheckoutSession({ plan })` → redirection PayDunya
- État `loadingPlan` avec spinner « Redirection vers paiement… »
- Mention sous les boutons : « Mixx by Yas · Moov Money · Carte »
- WhatsApp = lien texte secondaire « Problème ? Commander via WhatsApp »

### 3. ✨ Page `/payment-success` festive

**Refonte complète** :
```
        ✓  (gros check vert animé, confetti subtil)
   
   🎉 Félicitations !
   
   Votre abonnement [Mensuel / Trimestriel] est actif
   pour [30 / 90] jours
   
   Voici votre code d'activation :
   ┌─────────────────────────┐
   │   MRG-30-X7K2          │  (cliquable = copier)
   └─────────────────────────┘
   ✓ Copié
   
   [  Activer maintenant →  ]   (gros bouton gradient)
   
   ─────────────────────────────
   Un problème ? Contacter Mr G
   [ 📱 WhatsApp ]   (petit lien discret)
```
- Affiche le nom du plan (Mensuel/Trimestriel) et la durée (30/90 jours)
- Animation d'entrée festive (scale + fade)
- WhatsApp en filet de sécurité, pas en action principale
- `getPaymentStatus` retourne aussi le `plan` pour afficher la bonne durée

### 4. 🔧 Améliorations système (audit A à Z)

**a. Robustesse webhook PayDunya**
- Vérifier que la table `payments` enregistre bien le `provider_ref` (transaction id PayDunya) pour traçabilité
- Logging amélioré dans le webhook (qui a payé, quel montant, quel plan)

**b. Polling page success — doublé d'une vérif directe PayDunya**
- Si après 10s le webhook n'est toujours pas arrivé, `getPaymentStatus` appelle `confirmInvoice(token)` côté PayDunya en backup → génère le code si paiement confirmé côté PayDunya même sans webhook
- Évite les cas où le client attend pour rien

**c. Page `/activate` — code pré-rempli déjà en place** (juste vérif que ça marche bien depuis success)

**d. Hero CTA**
- Le bouton « Essayer gratuitement » du Hero pointe sur le nouveau flux DEMO auto (pas WhatsApp)
- Le bouton secondaire « Voir les tarifs » scroll vers `#pricing`

### Fichiers touchés

**Création** :
- Migration SQL : `system_create_demo_code()` RPC

**Édition** :
- `src/utils/payments.functions.ts` — ajout `createDemoCode`, amélioration `getPaymentStatus` (retourne plan + backup confirm PayDunya)
- `src/utils/paydunya.server.ts` — utilisation `confirmInvoice` en backup
- `src/components/landing/Pricing.tsx` — 3 cartes + boutons paiement + DEMO
- `src/components/landing/Hero.tsx` — CTA DEMO auto
- `src/routes/payment-success.tsx` — refonte festive avec plan + durée
- `src/routes/api.public.paydunya-webhook.ts` — logs améliorés

### Flux complet après implémentation

**Visiteur curieux** :
Landing → « Essayer gratuitement » → code DEMO généré → /activate → 5 calculs → paywall → choix plan → PayDunya → page success festive → code → activation → accès débloqué

**Visiteur convaincu** :
Landing → section Pricing → « Payer maintenant » → PayDunya → page success festive → code → activation → accès débloqué

**Tout est automatique, zéro intervention manuelle de ta part. WhatsApp = filet de sécurité discret.**

