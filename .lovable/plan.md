

## Plan : Sécurité, contrôle temps réel & UX session

### 1. Validation côté serveur sur `/activated` et `/app`

Aujourd'hui on fait confiance au `sessionStorage`. On ajoute une **revalidation serveur** :

- `src/routes/activated.tsx` :
  - Au montage, appeler `validateCode(session.code)` (Supabase RPC déjà existant)
  - Si la BDD répond `expired`, `inactive`, `invalid` ou `exhausted` → mettre à jour la session (ou la nettoyer) et basculer en mode « expiré »
  - Si OK → réécrire `expiresAt` et `remaining` avec les valeurs serveur (source de vérité)
  - État de chargement pendant la vérification (skeleton léger sur la carte)

- `src/routes/app.tsx` :
  - `beforeLoad` devient `async` et appelle aussi `validateCode` côté client pour bloquer l'accès si la BDD désactive le code
  - Si KO → `clearSession()` + redirect vers `/activated?expired=1`

### 2. Refresh automatique de la session (polling)

Dans `src/routes/activated.tsx` ET dans `src/components/app/AppShell.tsx` :

- Hook custom `useSessionRefresh()` créé dans `src/hooks/useSessionRefresh.ts` :
  - Polling toutes les **5 minutes** via `setInterval`
  - Appelle `validateCode(code)` 
  - Met à jour `expiresAt` + `remaining` dans `sessionStorage`
  - Si `expired` / `inactive` → `clearSession()` + redirect vers `/activated?expired=1`
  - Aussi déclenché sur `visibilitychange` (retour sur l'onglet) pour réagir vite
  - Cleanup propre sur unmount

### 3. Bouton « Changer de code » (reset session)

Dans `src/routes/activated.tsx` :

- Nouveau bouton secondaire « **Changer de code** » / « **Use another code** »
- Action : `clearSession()` + `navigate({ to: "/activate" })`
- Confirmation visuelle via toast court (« Session terminée »)
- Placé dans la grille d'actions secondaires à côté de « Copier mon code »

### 4. WhatsApp enrichi avec contexte détaillé

Mise à jour du helper dans `src/lib/i18n.tsx` :

- `buildWhatsappLink(lang, context, details?)` accepte un objet optionnel `details` :
  ```ts
  {
    plan?: string;
    code?: string;        // 4 derniers caractères seulement, pour confidentialité
    expiresAt?: string;   // formaté
    daysLeft?: number;
    remaining?: number;   // calculs restants (DEMO)
    page?: string;        // ex: "Calculateur Mer"
  }
  ```
- Le message inclut automatiquement : plan, code court (`****-XXXX`), expiration ou calculs restants, page d'origine
- Format propre avec retours à la ligne, encodé via `encodeURIComponent`

Branchement dans :
- `src/routes/activated.tsx` (bouton « Besoin d'aide ? » → tous les détails)
- `src/components/app/CalcButton.tsx` (erreur exhausted → contexte + page)
- Les calculateurs (`app.sea.tsx`, `app.air.tsx`, `app.compare.tsx`, `app.multi.tsx`) passent leur nom de page au bouton WA

### 5. Détails techniques

- Aucune migration DB (les RPC `validate_activation_code` / `consume_activation_code` existent déjà)
- Aucun nouveau package
- Polling : intervalle de 5 min, pas de retry agressif (économie réseau)
- Code WhatsApp : seulement les **4 derniers caractères** affichés pour limiter le risque de partage involontaire
- Toasts via `sonner` déjà installé

### 6. Fichiers touchés

**Création** :
- `src/hooks/useSessionRefresh.ts`

**Édition** :
- `src/routes/activated.tsx` (validation serveur au mount + bouton « Changer de code » + WA enrichi + polling)
- `src/routes/app.tsx` (validation serveur dans `beforeLoad`)
- `src/components/app/AppShell.tsx` (polling)
- `src/lib/i18n.tsx` (signature étendue de `buildWhatsappLink` avec `details`)
- `src/components/app/CalcButton.tsx` (passage des détails au lien WA)
- `src/routes/app.sea.tsx`, `src/routes/app.air.tsx`, `src/routes/app.compare.tsx`, `src/routes/app.multi.tsx` (props page name)

