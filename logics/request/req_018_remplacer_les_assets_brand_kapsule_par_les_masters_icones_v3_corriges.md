## req_018_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges - Remplacer les assets brand Kapsule par les masters Icones V3 corriges
> From version: 1.0.8
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Brand asset integration
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Remplacer les assets de `apps/frontend/public/brand/`, le favicon et les icones PWA par les masters corriges.

# Context
- Les masters approuves sont dans `WORK/perso/Icones V3`, tous en PNG RGBA 1024x1024.
- Le suffixe de variante designe le contour: `-dark` porte un lisere pale et se pose sur fond sombre, `-light` porte un contour navy et se pose sur fond clair.
- Le lot Icones V3 precedemment integre reposait sur de mauvaises images: ce corpus corrige la source, pas la demarche.
- Certaines marques n'ont qu'un ou deux masters (Gnosis, Paul Mondou, Kapsule, F1 Datas). Consigne operateur: reutiliser ce master unique pour l'embleme comme pour l'icone.
- Les quatorze masters sont a fond transparent: coins a alpha=0 et 28% a 87% de pixels transparents selon l'asset. Consigne operateur: ne rien ajouter derriere, ni en favicon ni en embleme.
- Kapsule dispose de deux masters (`kapsule-emblem.png`, `kapsule-icon.png`) sans declinaison dark/light.
- `apps/frontend/dist/` est une sortie de build: elle se regenere et ne doit pas etre editee a la main.
- Les icones PWA 192 et 512 sont des derives a re-generer depuis `kapsule-icon.png`.

# Acceptance criteria
- AC1: Chaque fichier d'icone livre est octet pour octet le master correspondant de Icones V3.
- AC2: Aucune reference d'asset n'est cassee apres remplacement, extensions et types MIME inclus.
- AC3: Le rendu est verifie visuellement sur le theme reellement servi par l'application.
- AC4: La transparence des masters est preservee: aucun fond, plaque ou cartouche n'est ajoute derriere l'asset, favicon et embleme compris.
- AC5: La livraison se termine par un commit de version X.Y.Z+1, un push, puis un tag annote vX.Y.Z+1 dont le workflow release est vert.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_009_identite_kapsule_alignee_sur_icones_v3_corrige`
- Architecture decision(s): (none yet)

# References
- WORK/perso/Icones V3/

# AI Context
- Summary: Remplacer les assets brand Kapsule par les masters Icones V3 corriges
- Keywords: request-chain-scaffold, remplacer les assets brand kapsule par les masters icones v3 corriges, development-ready
- Use when: You need to implement or review the scaffolded workflow for Remplacer les assets brand Kapsule par les masters Icones V3 corriges.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule`
- `item_030_publier_la_version_1_0_9_apres_remplacement_des_assets`
