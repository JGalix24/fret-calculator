# Refonte landing "Editorial Cargo"

## Direction artistique (inspirée du Reel)

- **Fond blanc cassé** (#FAFAF7) + **orange vif signature** (#FF4A1C) + noir profond. Aucun gradient bleu/violet, aucun glassmorphism.
- **Typo** : serif éditoriale géante pour les titres (Fraunces ou Instrument Serif) + sans-serif moderne pour le corps + mono pour les labels techniques.
- **Hero** : titre serif géant en 2 lignes ("Calcul. / Précision."), un **conteneur cargo orange suspendu à un câble** qui descend (animation Framer Motion au mount + léger swing), avec **annotations techniques type blueprint** pointant vers le conteneur (Cotation instantanée, CBM exact, Délai estimé, Multi-colis).
- **Bandeau orange plein écran** avec phrase manifeste type "We bring logistics with flair…".
- **Photos réelles** générées (port, docker avec colis) — pas d'illustrations vectorielles génériques.
- **Cards numérotées 01 / 02 / 03 / 04** pour Bateau / Avion / Comparer / Multi-colis.
- **Tableau "Tarifs"** style éditorial minimaliste.
- **Animations** : reveal au scroll, swing du conteneur, marquee douce de codes ports/IATA, hover qui révèle un trait orange sous chaque card.

## Toggle admin (basculer ancien ↔ nouveau)

Skin global stocké côté DB pour tous les visiteurs.

- Nouvelle table `site_settings` (singleton) avec colonne `landing_skin` (`'classic' | 'editorial'`), lecture publique, écriture admin via RPC mot de passe.
- Au chargement de `/`, server function lit la valeur et on rend `<LandingClassic />` ou `<LandingEditorial />`.
- Page `/admin` : nouveau bloc "Apparence du site public" avec deux boutons (Classique / Éditorial).
- L'ancienne landing reste **intacte** dans `src/components/landing/*`, simplement non rendue quand skin = editorial.

## Migration DB

```sql
create table public.site_settings (
  id boolean primary key default true check (id = true),
  landing_skin text not null default 'classic'
    check (landing_skin in ('classic','editorial')),
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (true) on conflict do nothing;
alter table public.site_settings enable row level security;
create policy "site_settings_no_direct_access" on public.site_settings
  for all using (false) with check (false);

-- RPC publique en lecture
create or replace function public.get_landing_skin()
returns text language sql stable security definer set search_path=public
as $$ select landing_skin from public.site_settings where id=true $$;

-- RPC écriture protégée par mot de passe admin (même pattern que admin_create_code)
create or replace function public.admin_set_landing_skin(_password text, _skin text)
returns text language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin_password(_password) then raise exception 'unauthorized'; end if;
  if _skin not in ('classic','editorial') then raise exception 'invalid_skin'; end if;
  update public.site_settings set landing_skin=_skin, updated_at=now() where id=true;
  return _skin;
end; $$;
```

## Fichiers

**Nouveaux**
- `src/lib/site-settings.functions.ts` — `getLandingSkin`, `setLandingSkin` (server functions).
- `src/components/landing-editorial/Header.tsx`
- `src/components/landing-editorial/Hero.tsx` (conteneur SVG suspendu + annotations)
- `src/components/landing-editorial/Manifesto.tsx` (bandeau orange plein)
- `src/components/landing-editorial/Calculators.tsx` (cards 01/02/03/04)
- `src/components/landing-editorial/Proof.tsx` (photo + chiffres)
- `src/components/landing-editorial/Pricing.tsx` (tableau éditorial)
- `src/components/landing-editorial/Testimonials.tsx`
- `src/components/landing-editorial/FAQ.tsx`
- `src/components/landing-editorial/FinalCTA.tsx`
- `src/components/landing-editorial/Footer.tsx`
- `src/components/landing-editorial/index.tsx` (assemble le tout)
- `src/assets/cargo-container.png` (image générée — conteneur orange transparent)
- `src/assets/dock-worker.jpg` (image générée — docker/port style photo réelle)

**Modifiés**
- `src/styles.css` : tokens `--editorial-bg`, `--editorial-orange`, `--editorial-ink` + import Google Fonts (Fraunces + Geist + JetBrains Mono).
- `src/routes/index.tsx` : loader appelle `getLandingSkin`, switch entre les deux landings.
- `src/routes/admin.tsx` : section "Apparence du site public" avec toggle.

## Ordre d'exécution

1. Migration DB `site_settings` + RPCs.
2. Server functions `site-settings.functions.ts`.
3. Tokens CSS + fonts.
4. Génération des 2 images (conteneur + dock).
5. Composants `landing-editorial/*` (Hero d'abord).
6. Switch dans `routes/index.tsx`.
7. Bloc toggle dans `routes/admin.tsx`.
8. QA visuel + responsive (test des 2 skins).

## Hors scope

- Aucun changement aux pages `/app/*` (calculateurs internes), au paywall, à l'auth, aux prix, aux textes existants.
- Aucun changement aux flux paiement / activation.
