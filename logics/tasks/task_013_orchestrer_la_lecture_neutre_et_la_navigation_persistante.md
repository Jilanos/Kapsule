## task_013_orchestrer_la_lecture_neutre_et_la_navigation_persistante - Orchestrer la lecture neutre et la navigation persistante
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Verifier les invariants actuels de progression et ajouter les tests de non-regression.
- [x] 2. Implementer la navigation persistante, accessible et sans effet de bord dans le lecteur.
- [x] 3. Rendre l'API defensive contre les retrogradations implicites et verifier la conservation des revisions.
- [x] 4. Executer formatage, tests, build, budget et validations Logics.
- [x] 5. Preparer v1.0.3, committer, pousser, surveiller la CI puis publier la release GitHub apres succes.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_019_navigation_persistante_et_lecture_neutre_des_fiches`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `apps/frontend/src/pages/DeckReader.jsx` bounds the previous/next controls and scrolls to the top; `apps/frontend/test/deck-reader.test.mjs` verifies neutral navigation.
- request-AC3 -> This task. Proof: `apps/frontend/src/pages/DeckReader.jsx` keeps navigation separate from `updateProgress`; `apps/frontend/test/deck-reader.test.mjs` verifies that navigation does not mark a card as seen.
- request-AC5 -> This task. Proof: `apps/frontend/src/pages/DeckReader.jsx` writes progress only through explicit actions, and `apps/backend/test/api.test.mjs` verifies that a learned card cannot be downgraded to seen.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Finish workflow executed on 2026-07-30.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-30.
- Linked backlog item(s): `item_019_navigation_persistante_et_lecture_neutre_des_fiches`
- Related request(s): `req_012_rendre_la_lecture_des_fiches_navigable_et_neutre_pour_la_progression`

# AI Context
- Summary: Orchestrer la lecture neutre et la navigation persistante
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_012_rendre_la_lecture_des_fiches_navigable_et_neutre_pour_la_progression`
- Product brief(s): `prod_004_lecture_neutre_et_navigation_persistante_des_fiches`
- Architecture decision(s): (none yet)
