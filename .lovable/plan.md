## Baisse des tarifs : 2000F / 5000F → 1500F / 4000F

### Calcul de l'économie trimestrielle
- Nouveau mensuel sur 3 mois : 1500 × 3 = **4500 FCFA**
- Nouveau trimestriel : **4000 FCFA**
- Économie réelle : **500 FCFA** (au lieu de 1000 actuellement)

### Fichiers à modifier

**1. `src/utils/moneyfusion.server.ts`** (montants envoyés à MoneyFusion)
```
PLAN_AMOUNTS: { MENSUEL: 1500, TRIMESTRIEL: 4000 }
```

**2. `src/lib/i18n.tsx`** (textes affichés)
- `pricing.month.price` → `"1 500"`
- `pricing.quarter.price` → `"4 000"`
- `pricing.quarter.save` → `"Économie de 500 FCFA"`
- `activate.pricing` → `"1 500 FCFA / mois · 4 000 FCFA / 3 mois"`
- 2 templates WhatsApp (mensuel/trimestriel) → mettre à jour les montants

**3. `src/components/app/PaywallModal.tsx`** (modal paywall)
- `price="2 000"` → `"1 500"`
- `price="5 000"` → `"4 000"`
- Badge `"Économie 1 000 FCFA"` (FR + EN) → `"Économie 500 FCFA"` / `"Save 500 FCFA"`

### Hors scope (à ne pas toucher)
- `src/routes/activated.tsx` : durées en jours (30/90), pas un prix
- `src/routes/admin.tsx` : labels MENSUEL/TRIMESTRIEL, pas un prix
- `src/components/landing/Hero.tsx` : "20 000 FCFA / 42 000 FCFA" sont des **exemples de coûts de fret** illustratifs, pas les prix de l'abonnement → on ne touche pas

### Pas besoin de migration BDD
La table `payments` stocke le `amount` au moment de l'achat ; les anciens paiements gardent leur montant historique. Les nouveaux paiements utiliseront 1500/4000 automatiquement.