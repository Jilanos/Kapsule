## item_028_publier_la_release_patch_v1_0_8_de_kapsule - Publier la release patch v1.0.8 de Kapsule
> From version: 1.0.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
La version `1.0.7` de Kapsule est déployée alors que le point d'entrée de génération de deck Gnosis (`ImportDeck.jsx`) et les assets brand Icones V3 attend une publication.

# Scope
- In:
  - incrément patch `1.0.7` -> `1.0.8` dans `package.json` et la racine de `package-lock.json`
  - commit de préparation, push sur `main`, tag annoté `v1.0.8` et vérification du workflow release
- Out:
  - toute modification fonctionnelle : la release ne livre que le contenu déjà mergé

# Acceptance criteria
- AC1: La version passe de 1.0.7 à 1.0.8 dans toutes les surfaces canoniques du dépôt.
- AC2: Le commit de préparation est poussé sur `main` et le tag annoté `v1.0.8` pointe dessus.
- AC3: Le workflow release déclenché par le tag est vert de bout en bout (validate, publish, deploy, release).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The request states the bounded need for publier la release patch v1.0.8 de kapsule.
- request-AC2 -> This backlog slice. Proof: AC2: Scope boundaries and operator impact are explicit.
- request-AC3 -> This backlog slice. Proof: AC3: The request is ready to be promoted into a backlog slice.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_017_publier_la_release_patch_v1_0_8_de_kapsule`
- Primary task(s): `task_018_publier_la_release_patch_v1_0_8_de_kapsule`

# AI Context
- Summary: Publier la release patch v1.0.8 de Kapsule
- Keywords: backlog-groom, request, publier la release patch v1.0.8 de kapsule, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Publier la release patch v1.0.8 de Kapsule.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Livraison de contenu déjà mergé, sans risque fonctionnel nouveau.

# Notes
- Hybrid rationale: Derived from request `req_017_publier_la_release_patch_v1_0_8_de_kapsule` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_017_publier_la_release_patch_v1_0_8_de_kapsule.md`.
- Generated locally by logics-manager.
- Task `task_018_publier_la_release_patch_v1_0_8_de_kapsule` was finished via `logics-manager flow finish task` on 2026-08-06.

# Tasks
- `task_018_publier_la_release_patch_v1_0_8_de_kapsule`
