

## Plan : Mode clair + message WhatsApp pré-rempli (personnalisé par offre)

### 1. Mode clair (toggle clair/sombre)

**Tokens CSS** dans `src/styles.css` :
- Garder le sombre actuel sur `:root`
- Ajouter `:root.light { … }` qui surcharge background, foreground, glass, borders, shadows, et `select option` pour fond clair
- Gradients hero adoucis en clair

**Provider thème** : nouveau `src/lib/theme.tsx`
- Lit `localStorage("fc-theme")` (défaut `dark`), applique la classe `light` sur `<html>`
- Hook `useTheme()` exposant `theme` + `toggleTheme`
- Branché dans `src/routes/__root.tsx`
- Script anti-FOUC inline dans `<head>` pour éviter le flash

**Bouton lune/soleil** ajouté dans :
- `src/components/landing/Header.tsx`
- `src/components/app/AppShell.tsx`

### 2. Message WhatsApp pré-rempli et personnalisé par offre

**Centralisation** dans `src/lib/i18n.tsx` :
- Définir un type `WhatsappContext = "demo" | "mensuel" | "trimestriel" | "renew" | "exhausted" | "general"`
- Messages FR (et EN scaffolding) par contexte, par exemple :
  - `demo` → « Bonjour Mr.G, je viens de tester Freight-Calculator (5 calculs offerts). J'aimerais en savoir plus avant de m'abonner. »
  - `mensuel` → « Bonjour Mr.G, je souhaite activer l'offre **Mensuelle (2 000 FCFA / 30 jours)** de Freight-Calculator. Voici mon reçu de paiement : »
  - `trimestriel` → « Bonjour Mr.G, je souhaite activer l'offre **Trimestrielle (5 000 FCFA / 90 jours)** de Freight-Calculator. Voici mon reçu de paiement : »
  - `exhausted` → « Bonjour Mr.G, j'ai épuisé mes 5 calculs gratuits et je veux passer à un plan payant. »
  - `renew` → « Bonjour Mr.G, mon accès Freight-Calculator a expiré, je souhaite le renouveler. »
  - `general` → message neutre par défaut
- Helper `buildWhatsappLink(lang, context)` qui retourne `https://wa.me/22899584808?text=<encodeURIComponent(message)>`
- Garder `WHATSAPP_LINK` comme fallback

**Branchement dans les composants** :
- `Pricing.tsx` → CTA carte Mensuel = `mensuel`, CTA carte Trimestriel = `trimestriel`, lien numéro footer pricing = `general`
- `FinalCTA.tsx` → si lien WA, contexte `general`
- `Footer.tsx` → `general`
- `routes/activate.tsx` :
  - Lien « Pas de code ? » → `general`
  - Erreur `exhausted` → `exhausted`
  - Erreur `expired` → `renew`
- Calculateurs (`app.*.tsx`) message d'erreur `exhausted` → bouton WA contextuel `exhausted`

### 3. Détails techniques

- Aucune migration DB, aucun nouveau package
- `localStorage` pour le thème (persistance entre sessions)
- Tous les composants utilisent déjà les tokens OKLCH → la bascule fonctionne sans toucher au markup
- Messages encodés via `encodeURIComponent` pour gérer accents et retours à la ligne

### 4. Fichiers touchés

Création :
- `src/lib/theme.tsx`

Édition :
- `src/styles.css` (tokens `.light`)
- `src/lib/i18n.tsx` (messages WA par contexte + helper)
- `src/routes/__root.tsx` (ThemeProvider + script anti-FOUC)
- `src/components/landing/Header.tsx` (toggle thème)
- `src/components/app/AppShell.tsx` (toggle thème)
- `src/components/landing/Footer.tsx`
- `src/components/landing/Pricing.tsx` (contextes mensuel/trimestriel)
- `src/components/landing/FinalCTA.tsx`
- `src/routes/activate.tsx` (contextes exhausted/renew/general)
- Calculateurs concernés par l'épuisement (`app.sea.tsx`, `app.air.tsx`, `app.compare.tsx`, `app.multi.tsx`) si bouton WA affiché

