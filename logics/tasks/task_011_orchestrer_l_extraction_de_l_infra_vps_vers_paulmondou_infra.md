## task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra - Orchestrer l'extraction de l'infra VPS vers paulmondou-infra
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 55%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Creer la chaine Logics et demarrer la task d'extraction.
- [ ] 2. Inventorier deploy/ et separer ce qui appartient a l'infra globale de ce qui reste applicatif.
- [ ] 3. Creer /home/paul/dev/paulmondou-infra, initialiser Git et transferer les fichiers globaux.
- [ ] 4. Mettre a jour les READMEs et references Kapsule pour pointer vers le repo infra.
- [ ] 5. Executer les validations locales Kapsule et les controles basiques infra.
- [ ] 6. Creer le repo GitHub paulmondou-infra, puis committer et pousser Kapsule et paulmondou-infra.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_015_extraire_le_repo_infra_paulmondou_infra`

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
- Summary: Orchestrer l'extraction de l'infra VPS vers paulmondou-infra
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`
- Product brief(s): `prod_002_brief_infrastructure_vps_multi_projets_paulmondou_infra`
- Architecture decision(s): (none yet)
