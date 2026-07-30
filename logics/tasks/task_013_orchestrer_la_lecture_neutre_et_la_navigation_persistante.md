## task_013_orchestrer_la_lecture_neutre_et_la_navigation_persistante - Orchestrer la lecture neutre et la navigation persistante
> From version: 1.0.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 85%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Verifier les invariants actuels de progression et ajouter les tests de non-regression.
- [ ] 2. Implementer la navigation persistante, accessible et sans effet de bord dans le lecteur.
- [ ] 3. Rendre l'API defensive contre les retrogradations implicites et verifier la conservation des revisions.
- [ ] 4. Executer formatage, tests, build, budget et validations Logics.
- [ ] 5. Preparer v1.0.3, committer, pousser, surveiller la CI puis publier la release GitHub apres succes.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_019_navigation_persistante_et_lecture_neutre_des_fiches`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrer la lecture neutre et la navigation persistante
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_012_rendre_la_lecture_des_fiches_navigable_et_neutre_pour_la_progression`
- Product brief(s): `prod_004_lecture_neutre_et_navigation_persistante_des_fiches`
- Architecture decision(s): (none yet)
