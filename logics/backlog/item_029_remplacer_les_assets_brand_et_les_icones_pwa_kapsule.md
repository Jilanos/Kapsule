## item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule - Remplacer les assets brand et les icones PWA Kapsule
> From version: 1.0.8
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Brand asset integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les assets brand servis proviennent d'un lot errone.

# Scope
- In:
  - `public/brand/kapsule-emblem.png` depuis `kapsule/kapsule-emblem.png`
  - `public/brand/kapsule-favicon.png` et `public/favicon.png` depuis `kapsule/kapsule-icon.png`
  - `public/brand/gnosis-icon.png` depuis `gnosis/gnosis.png`
  - `public/brand/paulmondou-emblem.png` depuis `paulmondou/paulmondou-emblem.png`
  - Regeneration de `pwa-192x192.png` et `pwa-512x512.png` par redimensionnement de `kapsule-icon.png`
- Out:
  - Editer `apps/frontend/dist/`: sortie de build regeneree par la CI.
  - Modifier les captures de `docs/screenshots/`.
  - Ajouter un fond, une plaque de couleur ou un cartouche derriere un asset transparent.

# Acceptance criteria
- AC1: Les quatre assets de `public/brand/` correspondent aux masters attendus.
- AC2: Les deux icones PWA sont des reductions propres du master icone.
- AC3: Le favicon et l'embleme s'affichent correctement dans l'application buildee.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Les quatre assets de `public/brand/` correspondent aux masters attendus.
- request-AC2 -> This backlog slice. Proof: AC2: Les deux icones PWA sont des reductions propres du master icone.
- request-AC3 -> This backlog slice. Proof: AC3: Le favicon et l'embleme s'affichent correctement dans l'application buildee.
- request-AC4 -> This backlog slice. Proof: AC3: Le favicon et l'embleme s'affichent correctement dans l'application buildee.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_identite_kapsule_alignee_sur_icones_v3_corrige`
- Architecture decision(s): (none yet)
- Request: `req_018_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges`
- Primary task(s): `task_019_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges`

# AI Context
- Summary: Remplacer les assets brand et les icones PWA Kapsule
- Keywords: scaffolded-backlog, remplacer les assets brand et les icones pwa kapsule, implementation-ready
- Use when: Implementing the scaffolded slice for Remplacer les assets brand et les icones PWA Kapsule.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
