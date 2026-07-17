## task_001_orchestrer_le_mvp_kapsule - Orchestrer le MVP Kapsule
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Valider le schema de fiche et SPEC.md (contrat de contenu) avant toute UI.
- [ ] 2. Mettre en place le socle monorepo frontend PWA + backend API + SQLite.
- [ ] 3. Construire le lecteur de fiches et la navigation deck sur le deck d'exemple.
- [ ] 4. Brancher la progression persistee via le backend.
- [ ] 5. Finaliser l'import/validation de decks et le test bout en bout avec un deck genere par IA.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_001_definir_le_schema_de_fiche_et_le_spec_md_pour_agents_ia`
- `item_002_creer_le_socle_monorepo_pwa_frontend_et_backend_api`
- `item_003_construire_le_lecteur_de_fiches_et_la_navigation_en_deck`
- `item_004_suivre_la_progression_et_la_persister_via_le_backend`
- `item_005_importer_et_valider_des_decks_generes_par_ia`

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
- Summary: Orchestrer le MVP Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
