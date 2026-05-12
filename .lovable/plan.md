## Vision

Remplacer le hero actuel par une **scène océanique vivante et réaliste** : un porte-conteneurs qui avance vraiment sur la mer, sillage d'écume, autres cargos à l'horizon, mouettes qui passent, port de Lomé qui se dessine au loin, un avion-cargo qui traverse le ciel. L'ambiance lumineuse change automatiquement selon l'heure réelle du visiteur (matin doré, midi océan profond, coucher orange, nuit bleutée).

## Recommandation technique

**Approche hybride : 1 vidéo cinéma générée en boucle + calques animés + variantes d'ambiance.**

Pourquoi pas "tout vidéo" : une vidéo unique fige la lumière. Pour faire varier matin/midi/soir/nuit on aurait besoin de 4 vidéos lourdes (~40-60 Mo) → page lente.

Pourquoi pas "tout image animée" : on perd le mouvement réel du bateau qui avance, des vagues, du sillage — exactement ce qui te fait dire "wow".

**Le combo gagnant :**
- **1 seule vidéo de base** (cargo qui avance, mer, ~6s en boucle, encodée en WebM + MP4, ~3-5 Mo) — toujours en mouvement réel
- **Overlay couleur dynamique** par-dessus la vidéo (gradient + filtres CSS `hue-rotate` / `brightness` / `sepia`) qui change selon l'heure → 1 seule vidéo, 4 ambiances différentes
- **Calques SVG animés au-dessus** : mouettes qui traversent, avion-cargo qui glisse de droite à gauche, étoiles la nuit, halo du soleil/lune

## Ambiance dynamique (heure locale du visiteur)

| Heure | Ambiance | Filtre overlay |
|-------|----------|----------------|
| 5h–8h | **Aube brumeuse** — bleu-gris diffus, soleil bas | gradient bleu pâle + brightness 0.85 |
| 8h–16h | **Plein jour océan** — bleu profond, écume éclatante | gradient azur + saturate 1.15 |
| 16h–20h | **Golden hour** — orange/rose, reflets dorés (colle à ton orange de marque) | gradient orange→rose + warmth |
| 20h–5h | **Nuit étoilée** — bleu nuit, lune, lumières du port | gradient indigo + brightness 0.55 + étoiles SVG |

Transition douce de 2s entre deux plages quand l'utilisateur reste longtemps.

## Structure de la nouvelle landing

```text
┌─────────────────────────────────────────────┐
│  HERO PLEIN ÉCRAN (100vh)                   │
│  ┌─ Vidéo cargo en boucle (background) ─┐  │
│  │  + overlay couleur ambiance           │  │
│  │  + SVG mouettes (3, parallax)         │  │
│  │  + SVG avion-cargo (traverse en 25s)  │  │
│  │  + halo soleil/lune selon heure       │  │
│  │  + silhouette port Lomé au loin       │  │
│  └───────────────────────────────────────┘  │
│  Texte hero : titre énorme + CTA calculer   │
└─────────────────────────────────────────────┘
   ↓ scroll
┌─────────────────────────────────────────────┐
│  Sections existantes (calculateur, etc.)    │
│  Photos réelles : conteneurs, dockers,      │
│  soute avion-cargo (générées photo-réaliste)│
└─────────────────────────────────────────────┘
```

## Détails techniques

**Génération de la vidéo hero :**
- Outil : `videogen--generate_video` (1080p, 16:9, 10s)
- Prompt : *"Cinematic aerial shot, large container ship sailing across calm ocean, white foamy wake trailing behind, two smaller cargo ships in the distance on the horizon, port of Lomé silhouette barely visible far away, neutral midday light (will be color-graded later), photorealistic, slow steady drone movement, National Geographic style, 4K"*
- Sauvegarde : `src/assets/hero-ocean.mp4`
- Lecture : `<video autoplay muted loop playsinline>` + `poster` JPG fallback

**Overlay ambiance (CSS) :**
```tsx
const ambiance = useTimeOfDayAmbiance(); // hook custom
<div className="hero-overlay" style={{
  background: ambiance.gradient,
  filter: ambiance.filter,
  transition: 'all 2s ease-in-out'
}} />
```

**SVG animés :**
- Mouettes : 3 silhouettes SVG, animation `translateX` + `translateY` ondulée (keyframes CSS), 15-25s de cycle, décalées
- Avion-cargo : silhouette SVG qui traverse l'écran de droite à gauche en 25s, légère trainée
- Étoiles (nuit) : 30 points blancs avec `animate-pulse` aléatoire
- Soleil/lune : cercle avec halo, position selon heure

**Photos réelles dans les sections (générées photo-réaliste) :**
- Port de Lomé avec grues + conteneurs colorés (golden hour)
- Soute d'avion-cargo Boeing 747 avec palettes
- Docker africain qui scanne un conteneur
- Carte stylisée Chine→Togo avec route maritime

**Palette couleurs (cohérente avec l'orange existant) :**
- Orange chaud `#FF6B1A` (existant, garde)
- Bleu océan profond `#0A2540`
- Bleu nuit `#0D1B2A`
- Crème `#FAF7F2`
- Or doux `#D4A574` (accents)

## Étapes d'exécution

1. Générer la vidéo hero (`videogen--generate_video`, ~2 min)
2. Générer 4 photos réalistes pour les sections (`imagegen--generate_image` premium)
3. Créer le hook `useTimeOfDayAmbiance()` (retourne gradient + filtre selon `new Date().getHours()`)
4. Créer le composant `<OceanHero />` : vidéo + overlay + SVG mouettes/avion/soleil
5. Refondre `LandingEditorial.tsx` autour de ce nouveau hero + sections avec vraies photos
6. Ajuster les tokens CSS (palette océan/golden) dans `src/styles.css`
7. Garder le toggle Classic/Editorial déjà en place pour comparer

## Hors scope

- Pas de vidéos multiples (une seule, color-gradée par overlay)
- Pas de WebGL/Three.js (overkill, perfs mobiles)
- Pas de modifs au calculateur ou à l'admin
- Pas de modifs DB

## Questions ouvertes

Aucune — je peux lancer dès que tu valides.
