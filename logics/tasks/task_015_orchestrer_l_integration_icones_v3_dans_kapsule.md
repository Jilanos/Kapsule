## task_015_orchestrer_l_integration_icones_v3_dans_kapsule - Orchestrer l'integration Icones V3 dans Kapsule
> From version: 1.0.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Faire l'inventaire des surfaces favicon, manifest, header et lien parent dans Kapsule.
- [ ] 2. Copier les assets Icones V3 necessaires dans le repo et mettre a jour les imports ou chemins publics.
- [ ] 3. Verifier les variantes light/dark, l'accessibilite du lien parent et l'absence de reference runtime au dossier local.
- [ ] 4. Executer la validation locale pertinente puis preparer la livraison selon le reflexe release du repo.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`
- `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC4 -> `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`. Proof deferred to slice closeout.
- request-AC3, request-AC4 -> `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# AI Context
- Summary: Orchestrer l'integration Icones V3 dans Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule`
- Product brief(s): `prod_006_identite_kapsule_alignee_sur_icones_v3`
- Architecture decision(s): (none yet)
