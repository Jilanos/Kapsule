## task_018_publier_la_release_patch_v1_0_8_de_kapsule - Publier la release patch v1.0.8 de Kapsule
> From version: 1.0.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Claude

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_028_publier_la_release_patch_v1_0_8_de_kapsule`

# Acceptance criteria
- AC1: La version passe de 1.0.7 à 1.0.8 dans toutes les surfaces canoniques du dépôt.
- AC2: Le commit de préparation est poussé sur `main` et le tag annoté `v1.0.8` pointe dessus.
- AC3: Le workflow release déclenché par le tag est vert de bout en bout (validate, publish, deploy, release).

# Plan
- [x] Incrémenter `package.json` et la racine de `package-lock.json` de `1.0.7` vers `1.0.8`.
- [x] Créer le commit `Prepare ... v1.0.8` et le pousser sur `main`.
- [x] Créer et pousser le tag annoté `v1.0.8`.
- [x] Vérifier que les jobs validate, publish, deploy et release sont verts.

# Validation
- GitHub Actions release.yml passed on 2026-08-06: run 31112644849 green on validate, publish, deploy, release.
- Finish workflow executed on 2026-08-06.
- Linked backlog/request close verification passed.

# Report
- Commit de préparation: `b0a6022` sur `main`.
- Tag annoté: `v1.0.8`.
- Run release: https://github.com/Jilanos/Kapsule/actions/runs/31112644849 — succès (validate, publish, deploy, release).
- Contenu livré: le point d'entrée de génération de deck Gnosis (`ImportDeck.jsx`) et les assets brand Icones V3.
- Finished on 2026-08-06.
- Linked backlog item(s): `item_028_publier_la_release_patch_v1_0_8_de_kapsule`
- Related request(s): `req_017_publier_la_release_patch_v1_0_8_de_kapsule`

# AI Context
- Summary: Implement publier la release patch v1.0.8 de kapsule.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_017_publier_la_release_patch_v1_0_8_de_kapsule`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: commit `b0a6022` incrémente toutes les surfaces canoniques vers `1.0.8`.
- request-AC2 -> This task. Proof: `b0a6022` est poussé sur `main` et le tag annoté `v1.0.8` pointe dessus.
- request-AC3 -> This task. Proof: run release https://github.com/Jilanos/Kapsule/actions/runs/31112644849 vert sur validate, publish, deploy et release.
