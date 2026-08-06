## task_016_orchestrer_la_console_d_administration_kapsule - Orchestrer la console d'administration Kapsule
> From version: 1.0.7
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
- [ ] 1. Vague 1 - Cartographier le schema SQLite, les dependances de suppression et le contrat d'API admin; definir la migration d'audit et les invariants, notamment la protection du dernier admin.
- [ ] 2. Vague 2 - Implementer et tester les endpoints comptes, roles et audit, puis l'ecran /admin de gestion des comptes avec les confirmations accessibles.
- [ ] 3. Vague 3 - Implementer et tester les vues contenus et stockage ainsi que les actions de contenu strictement bornees.
- [ ] 4. Vague 4 - Executer lint, tests backend et frontend, build, controles d'autorisation et smoke local; documenter la procedure operateur et les limites de stockage.
- [ ] 5. Vague 5 - Mettre a jour les documents Logics aux checkpoints, puis suivre le workflow de release du depot pour toute livraison fonctionnelle.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_025_administrer_les_comptes_et_roles_kapsule`
- `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC3, request-AC5, request-AC6, request-AC8 -> `item_025_administrer_les_comptes_et_roles_kapsule`. Proof deferred to slice closeout.
- request-AC1, request-AC4, request-AC5, request-AC6, request-AC7, request-AC8 -> `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# AI Context
- Summary: Orchestrer la console d'administration Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_015_administrer_les_utilisateurs_et_contenus_kapsule`
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)
