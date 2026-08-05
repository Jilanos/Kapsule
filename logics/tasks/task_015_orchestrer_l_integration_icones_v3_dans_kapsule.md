## task_015_orchestrer_l_integration_icones_v3_dans_kapsule - Orchestrer l'integration Icones V3 dans Kapsule
> From version: 1.0.6
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
- [x] 1. Faire l'inventaire des surfaces favicon, manifest, header et lien parent dans Kapsule.
- [x] 2. Copier les assets Icones V3 necessaires dans le repo et mettre a jour les imports ou chemins publics.
- [x] 3. Verifier les variantes light/dark, l'accessibilite du lien parent et l'absence de reference runtime au dossier local.
- [x] 4. Executer la validation locale pertinente puis preparer la livraison selon le reflexe release du repo.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`
- `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC4 -> `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`. Proof deferred to slice closeout.
- request-AC3, request-AC4 -> `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`. Proof deferred to slice closeout.
- request-AC1 -> This task. Proof: `apps/frontend/public/brand/kapsule-favicon.png` was replaced from `Icones V3/kapsule/kapsule-icon-light.png`; `npm run build --workspace @kapsule/frontend` regenerated browser/PWA metadata assets successfully.
- request-AC2 -> This task. Proof: `apps/frontend/public/brand/kapsule-emblem.png` was replaced from `Icones V3/kapsule/kapsule-emblem-light.png`; the header keeps using `/brand/kapsule-emblem.png`.
- request-AC3 -> This task. Proof: `apps/frontend/public/brand/paulmondou-emblem.png` was replaced from `Icones V3/paulmondou/paulmondou-emblem-light.png`; the existing `https://paulmondou.fr` link target stayed unchanged.
- request-AC4 -> This task. Proof: all runtime references resolve from `apps/frontend/public/brand/*` in the Kapsule repo, with no runtime path to the local Icones V3 corpus.

# Validation
- 2026-08-05: `npm test` passed locally on Kapsule 1.0.7.
- 2026-08-05: `npm run build --workspace @kapsule/frontend` passed locally after asset replacement.
- 2026-08-05: `npm run budget`, `npm run format:check`, `npm audit --omit=dev`, and `logics-manager flow validate req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3 item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3 task_015_orchestrer_l_integration_icones_v3_dans_kapsule --format json` passed locally.
- 2026-08-05: GitHub CI run `31018752821` and CodeQL run `31018751518` passed on `a86784bd4665f61723aad39863ad401f3f160def`.
- 2026-08-05: Release by tag run `31018956173` passed validate, publish, deploy, and GitHub release jobs for `v1.0.7`.
- Kapsule v1.0.7 deployed: local validation passed; GitHub CI 31018752821 and CodeQL 31018751518 passed on a86784bd4665f61723aad39863ad401f3f160def; release run 31018956173 passed validate, publish, deploy and GitHub release.
- Finish workflow executed on 2026-08-05.
- Linked backlog/request close verification passed.

# Report
- Not started.
- Finished on 2026-08-05.
- Linked backlog item(s): `item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3`, `item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3`
- Related request(s): `req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule`

# AI Context
- Summary: Orchestrer l'integration Icones V3 dans Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule`
- Product brief(s): `prod_006_identite_kapsule_alignee_sur_icones_v3`
- Architecture decision(s): (none yet)
