## Objectif

Ajouter un effet visuel d'arrière-plan animé "gouttes d'eau qui tombent dans l'eau" (ondulations concentriques) derrière les sections situées **après le hero** (Problem → FinalCTA), pour prolonger l'ambiance océan du hero et harmoniser tout le bloc landing.

## Approche visuelle

Effet inspiré de la vidéo fournie : ondes concentriques qui apparaissent de façon aléatoire, s'agrandissent et s'estompent, sur un fond bleu profond très subtil. Pas de vidéo lourde — un canvas léger et performant.

- **Implémentation** : composant React `WaterRipplesBackground` à base de `<canvas>` avec `requestAnimationFrame`.
- Génération aléatoire de "drops" toutes les 800–2000 ms à des positions aléatoires.
- Chaque drop = 2-3 anneaux concentriques qui grandissent (rayon 0 → ~180px) en se fondant (opacité 0.5 → 0).
- Couleurs basées sur les tokens du site (bleu/violet du mode classique) pour rester harmonieux.
- Léger gradient bleu nuit en fond pour donner la sensation d'eau profonde.

## Performance & accessibilité

- Canvas avec `devicePixelRatio` géré, pause auto si l'onglet n'est pas visible (`document.hidden`).
- Limite max ~12 ondes simultanées.
- Respect de `prefers-reduced-motion` : si activé, on affiche uniquement le gradient statique sans animation.
- `pointer-events-none` pour ne jamais bloquer l'interaction.

## Intégration

Dans `src/routes/index.tsx`, envelopper le `<main>` (sections après le Header) dans un conteneur `relative` qui contient :
- `<WaterRipplesBackground />` en `absolute inset-0 -z-10`
- Les sections actuelles inchangées par-dessus

Aucune modification du hero ni du contenu des sections. Les sections gardent leur fond actuel — on rendra leurs backgrounds légèrement transparents (ou on retire les backgrounds opaques) pour que l'effet soit visible derrière.

## Fichiers à créer / modifier

```text
src/components/landing/WaterRipplesBackground.tsx   (nouveau, ~80 lignes)
src/routes/index.tsx                                (wrap <main>)
src/styles.css                                      (ajout token --ripple-bg si besoin)
```

Optionnellement, vérifier `Problem.tsx`, `Solution.tsx` etc. pour ajuster la transparence des fonds de section si l'effet n'est pas visible.

## Question rapide avant implémentation

Préfères-tu :
1. **Effet sur TOUT le reste du site** (de Problem jusqu'à FinalCTA) en background continu
2. **Effet uniquement sur 1-2 sections clés** (ex : Problem + FinalCTA) pour rester sobre

Je pars sur l'option 1 par défaut si tu valides le plan tel quel.
