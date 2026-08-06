## req_016_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck - Publier les derniers assets Icones V3 et ajouter Generer un deck
> From version: 1.0.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: UI
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Mettre à jour les assets Kapsule et proposer, à côté de l'import, l'accès au générateur Gnosis.

# Context
- Les masters Kapsule `icon-light` et `emblem-light` alimentent le favicon et la marque applicative.
- L'action « Générer un deck » mène vers `https://gnosis.paulmondou.fr` et affiche le logo Gnosis fourni par le corpus Icones V3.

# Acceptance criteria
- AC1: Les assets Kapsule et les icônes PWA sont générés depuis le dernier favicon master.
- AC2: « Générer un deck » est visible à côté de « + Importer un deck ».
- AC3: Le lien est accessible, comporte le logo Gnosis et conserve l'import existant.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Draft a bounded request for publier les derniers assets icones v3 et ajouter generer un deck.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- none
- `item_027_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck`
