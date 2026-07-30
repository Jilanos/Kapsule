## req_012_rendre_la_lecture_des_fiches_navigable_et_neutre_pour_la_progression - Rendre la lecture des fiches navigable et neutre pour la progression
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Experience de lecture et progression
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Naviguer entre les fiches precedentes et suivantes depuis une barre toujours accessible.
- Consulter une fiche sans modifier son statut ni desprogrammer une fiche apprise.
- Ne modifier la progression que par une action explicite de l'utilisateur.

# Context
- CardView envoie actuellement onSeen a chaque ouverture.
- Une ecriture de progression vers seen peut remplacer learned cote serveur.
- La barre actuelle affiche seulement le retour au deck et le compteur de fiche.

# Acceptance criteria
- AC1: La barre de lecture reste visible en haut pendant le defilement et offre les actions fiche precedente et fiche suivante.
- AC2: Les actions de navigation sont correctement desactivees sur la premiere et la derniere fiche et ramènent la nouvelle fiche en haut.
- AC3: Ouvrir ou parcourir une fiche ne declenche aucune ecriture de progression.
- AC4: Une fiche apprise reste apprise apres consultation et sa planification de revision est preservee.
- AC5: Les changements de statut restent declenches explicitement et sont testes cote frontend et backend.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_004_lecture_neutre_et_navigation_persistante_des_fiches`
- Architecture decision(s): (none yet)

# References
- apps/frontend/src/pages/DeckReader.jsx
- apps/frontend/src/components/CardView.jsx
- apps/backend/src/store.mjs
- apps/backend/src/app.mjs

# AI Context
- Summary: Rendre la lecture des fiches navigable et neutre pour la progression
- Keywords: request-chain-scaffold, rendre la lecture des fiches navigable et neutre pour la progression, development-ready
- Use when: You need to implement or review the scaffolded workflow for Rendre la lecture des fiches navigable et neutre pour la progression.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_019_navigation_persistante_et_lecture_neutre_des_fiches`
