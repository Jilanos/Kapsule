## req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule - Integrer les icones Icones V3 et le lien parent Paul Mondou dans Kapsule
> From version: 1.0.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Branding
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Utiliser les assets du corpus externe Icones V3 pour remplacer l'icone d'onglet, l'embleme Kapsule et le lien vers Paul Mondou.
- Rendre l'identite visuelle coherente entre le favicon, la barre applicative et la navigation parent.

# Context
- Le dossier source est le corpus local Icones V3 fourni par l'operateur; les chemins references ici sont internes a ce corpus pour respecter les regles Logics.
- Assets attendus: kapsule/kapsule-icon-light.png, kapsule/kapsule-icon-dark.png, kapsule/kapsule-emblem-light.png, kapsule/kapsule-emblem-dark.png, puis les assets paulmondou pour le lien parent.
- La livraison doit conserver le contrat de release par tag et verifier les surfaces PWA/metadata si elles existent dans le repo.

# Acceptance criteria
- AC1: L'icone d'onglet Kapsule utilise l'asset Icones V3 adapte au format attendu par l'application.
- AC2: L'embleme visible dans l'interface Kapsule est remplace par l'embleme Icones V3, avec variantes light/dark si l'interface les expose.
- AC3: Le lien vers Paul Mondou utilise l'identite Paul Mondou issue du corpus Icones V3 et pointe vers la destination parent existante.
- AC4: Les references d'assets sont servies depuis le repo Kapsule apres copie ou integration, sans dependance runtime au dossier local Icones V3.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_006_identite_kapsule_alignee_sur_icones_v3`
- Architecture decision(s): (none yet)

# References
- Corpus externe Icones V3/kapsule/
- Corpus externe Icones V3/paulmondou/
- logics/product/prod_005_identite_visuelle_et_navigation_de_lecture_kapsule.md
- logics/backlog/item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure.md

# AI Context
- Summary: Integrer les icones Icones V3 et le lien parent Paul Mondou dans Kapsule
- Keywords: request-chain-scaffold, integrer les icones icones v3 et le lien parent paul mondou dans kapsule, development-ready
- Use when: You need to implement or review the scaffolded workflow for Integrer les icones Icones V3 et le lien parent Paul Mondou dans Kapsule.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`
- `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`
