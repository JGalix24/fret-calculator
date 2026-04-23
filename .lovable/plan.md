

## Tu as raison — voici comment je gère le mensonge

### Le scénario que tu décris

Quelqu'un a **déjà eu** un code démo (donc il connaît déjà l'outil, il a déjà testé ses 5 calculs gratuits). Plus tard, il te contacte sur WhatsApp en disant *« Salut, je suis nouveau, le système m'a bloqué à tort, donne-moi un code »*. **Il ment.** Si tu lui donnes un code, tu te fais avoir.

Donc on a besoin que **toi tu puisses vérifier en 2 secondes** si la personne ment ou pas, sans avoir à fouiller manuellement dans la base.

### La solution : un mini-tableau de bord WhatsApp côté admin

Dans `/admin` (que tu utilises déjà avec ton mot de passe), j'ajoute un nouvel onglet **« Vérifier un visiteur »** :

**Comment ça marche concrètement** :

1. La personne te contacte sur WhatsApp et dit *« je suis bloqué »*
2. Tu lui demandes : *« Envoie-moi le code d'erreur affiché à l'écran »*
3. Quand quelqu'un est bloqué, on affiche maintenant un **petit code d'identification** sous le message d'erreur, genre : `Réf: A3F2-9K1B` (8 caractères, c'est l'empreinte de son appareil raccourcie + horodatée)
4. Tu colles ce code dans ton admin → tu vois immédiatement :
   - ✅ **« Aucun code démo trouvé pour cette empreinte »** → la personne dit vrai, tu peux lui créer un code manuellement (bouton « Créer code DEMO » direct dans l'admin)
   - ❌ **« Cette empreinte a reçu un code démo le 12/03/2025 à 14h32 (code MRG-DEMO-A3F2, utilisé 5/5 fois) »** → la personne ment, tu as la preuve, tu peux refuser ou proposer un plan payant

### Ce qui change concrètement

**Pour le visiteur bloqué** (sur la landing) :
> *« Cet appareil a déjà reçu un code démo récemment.*  
> *Si c'est une erreur, contactez-nous sur WhatsApp avec cette référence : **A3F2-9K1B***  
> *[Bouton WhatsApp pré-rempli avec la référence]* »*

Le bouton WhatsApp pré-remplit le message : *« Bonjour, je suis bloqué sur la démo, ma référence est A3F2-9K1B »*. Comme ça la personne **doit** te donner sa référence — elle peut pas mentir avant même de te parler.

**Pour toi dans `/admin`** :
- Nouvel onglet « Vérifier visiteur »
- Champ texte pour coller la référence
- Affiche : statut (jamais vu / déjà servi), date, code donné, nombre d'utilisations
- Bouton « Créer code DEMO manuel » (si tu décides d'aider quand même)

### Et pour les vrais cas légitimes ?

Avec la règle des 3 signaux combinés (IP + appareil + langue) que j'ai proposée avant, **les vrais faux positifs vont devenir rares**. Donc en pratique :
- 90% des cas légitimes passeront automatiquement (pas besoin de WhatsApp)
- Les 10% restants te contactent → tu vérifies en 2 secondes avec leur référence → tu décides

### Résumé des changements

**Base de données** :
- Nouvelle fonction admin `admin_lookup_fingerprint(_password, _reference)` qui cherche dans `demo_grants` par préfixe d'empreinte
- Stocker un `short_ref` (8 caractères dérivés de l'empreinte) dans `demo_grants` pour la recherche rapide

**Code** :
- `payments.functions.ts` : génère et renvoie aussi le `short_ref` quand quelqu'un est bloqué
- `Hero.tsx` + `Pricing.tsx` : affichent la référence + bouton WhatsApp pré-rempli
- `admin.tsx` : nouvel onglet « Vérifier visiteur » avec champ de recherche + résultat

**Bénéfice** : tu ne te fais plus avoir, et tu peux quand même aider les vrais cas en 1 clic.

**Tu valides cette approche ? Ou tu veux qu'on simplifie encore (par exemple : juste un bouton dans l'admin qui liste les 50 derniers demo_grants avec date + IP, sans système de référence) ?**

