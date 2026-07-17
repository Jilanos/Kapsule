## req_000_cadrer_et_creer_le_mvp_kapsule - Cadrer et creer le MVP Kapsule
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: mvp
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Consulter des fiches de connaissance courtes (5-10 min) dans un navigateur ou sur Android avec un rendu toujours coherent.
- Integrer facilement de nouvelles fiches produites par des agents IA a partir d'un format JSON predefini et d'un fichier de consignes SPEC.md.
- Regrouper les fiches en decks, suivre les fiches parcourues et apprises, et enchainer naturellement sur les suivantes.
- Disposer tres tot d'un backend pour eviter les frictions (synchronisation de la progression, stockage centralise des decks).

# Context
- Projet neuf dans /home/paulm/dev/Kapsule, aucun code existant.
- Le format de fiche est le contrat central : types de sections fermes (intro, concept, example, takeaways, quiz), valides par JSON Schema a l'import.
- SPEC.md sert a la fois de documentation humaine et de prompt pour generer des fiches via des agents IA.
- Cible : PWA installable sur Android (pas d'appli native au MVP), backend leger des le depart.
- Fiches courtes avec images possibles, quiz optionnel en fin de fiche.

# Acceptance criteria
- AC1: Un schema de fiche (JSON Schema) et un SPEC.md de consignes existent ; une fiche invalide est rejetee a l'import avec une erreur claire.
- AC2: L'app affiche une fiche valide (titre, sections typees, images, quiz) avec un rendu coherent sur mobile et desktop.
- AC3: Les fiches sont regroupees en decks ; chaque fiche a un etat non vue / vue / apprise et l'utilisateur peut enchainer sur la fiche suivante du deck.
- AC4: La progression est persistee via un backend et restaurée apres rechargement ou changement d'appareil.
- AC5: Un deck genere par un agent IA a partir de SPEC.md s'importe dans l'app sans modification manuelle du rendu.
- AC6: L'app est une PWA installable sur Android (manifest + service worker) et fonctionne en lecture hors-ligne sur les decks deja charges.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)

# References
- logics/architecture/adr_001_kapsule_architecture_direction.md

# AI Context
- Summary: Cadrer et creer le MVP Kapsule
- Keywords: request-chain-scaffold, cadrer et creer le mvp kapsule, development-ready
- Use when: You need to implement or review the scaffolded workflow for Cadrer et creer le MVP Kapsule.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_001_definir_le_schema_de_fiche_et_le_spec_md_pour_agents_ia`
- `item_002_creer_le_socle_monorepo_pwa_frontend_et_backend_api`
- `item_003_construire_le_lecteur_de_fiches_et_la_navigation_en_deck`
- `item_004_suivre_la_progression_et_la_persister_via_le_backend`
- `item_005_importer_et_valider_des_decks_generes_par_ia`
