## item_033_remplacer_les_marques_et_icones_visibles_par_les_masters_icones_v3 - Remplacer les marques et icones visibles par les masters Icones V3
> From version: 1.0.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Identité visuelle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les assets brand actuellement servis sont des PNG antérieurs alors qu'un lot de masters SVG Icones V3 mis à jour est disponible.
- Le remplacement doit être exhaustif pour les visuels réellement affichés et ne pas importer des logos étrangers au produit.

# Scope
- In:
  - Inventorier toutes les références d'images, favicon et manifest du frontend avant remplacement.
  - Versionner les masters SVG Kapsule, Paul Mondou et Gnosis correspondants dans les emplacements publics appropriés et mettre à jour leurs références applicatives.
  - Régénérer favicon et icônes PWA depuis le master Kapsule lorsque le pipeline le requiert.
  - Vérifier le rendu bâti, l'absence de références obsolètes et l'absence d'emblèmes non pertinents du lot fourni.
- Out:
  - Modifier les logos de partenaires ou des sites externes hors du dépôt Kapsule.
  - Ajouter des emblèmes Cantracediag, Claimlens ou F1 Datas à Kapsule.

# Acceptance criteria
- AC1: L'inventaire de fin de tâche ne laisse aucune référence applicative aux anciens fichiers brand pour Kapsule, Paul Mondou et Gnosis.
- AC2: Les SVG publics versionnés correspondent aux masters Icones V3 fournis pour les trois marques affichées, et leurs alternatives textuelles/accessibles restent correctes.
- AC3: Le favicon et les icônes PWA ont été régénérés ou vérifiés depuis le master Kapsule ; le build charge correctement les assets finaux.
- AC4: Les fichiers externes utilisés comme source ne sont pas introduits en dehors des copies versionnées nécessaires et le dépôt ne sert aucun logo d'une marque non utilisée.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: inventaire complet des references (`App.jsx`, `ImportDeck.jsx`, `index.html`, `vite.config.mjs`) : plus aucune ne pointe vers `kapsule-emblem.png`, `paulmondou-emblem.png` ni `gnosis-icon.png`, tous supprimes du depot. Les alternatives restent `alt="" aria-hidden="true"` (emblemes decoratifs, le texte adjacent portant le sens). Enonce d'origine — AC1: L'inventaire de fin de tâche ne laisse aucune référence applicative aux anciens fichiers brand pour Kapsule, Paul Mondou et Gnosis.
- request-AC6 -> This backlog slice. Proof: `public/brand/` ne contient que les trois masters SVG Icones V3 copies tels quels depuis le lot fourni ; le favicon est le master Kapsule en SVG avec repli PNG genere, et `pwa-192x192.png` / `pwa-512x512.png` sont regeneres a l'identique (empreintes comparees) depuis `assets/brand/kapsule-icon-master.png`. Aucune source externe temporaire n'est introduite et aucun embleme Cantracediag, Claimlens ou F1 Datas n'entre dans le depot. `npm run build` verifie que `dist/brand/` ne contient que les trois SVG. Enonce d'origine — AC2: Les SVG publics versionnés correspondent aux masters Icones V3 fournis pour les trois marques affichées, et leurs alternatives textuelles/accessibles restent correctes.
- request-AC3 -> This backlog slice. Evidence needed: Un administrateur peut supprimer un deck et éditer son titre, sa description et sa visibilité depuis /admin ; les modifications sont validées côté serveur, atomiques, journalisées, puis visibles après rechargement. L'identifiant, le propriétaire, les cartes et les assets ne sont pas éditables par cette fonction.
- request-AC5 -> This backlog slice. Evidence needed: Les actions restent accessibles au clavier, ont des libellés explicites, annoncent leurs états asynchrones et conservent les confirmations renforcées avant suppression.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_console_d_administration_exploitable_et_identite_icones_v3_complete`
- Architecture decision(s): (none yet)
- Request: `req_019_rendre_la_console_d_administration_pleine_largeur_editable_et_alignee_sur_icones_v3`
- Primary task(s): `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3`

# AI Context
- Summary: Remplacer les marques et icones visibles par les masters Icones V3
- Keywords: scaffolded-backlog, remplacer les marques et icones visibles par les masters icones v3, implementation-ready
- Use when: Implementing the scaffolded slice for Remplacer les marques et icones visibles par les masters Icones V3.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium - l'alignement visuel est demandé et peut avancer en parallèle des corrections d'administration.
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3`

# Notes
- Task `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3` was finished via `logics-manager flow finish task` on 2026-08-08.
