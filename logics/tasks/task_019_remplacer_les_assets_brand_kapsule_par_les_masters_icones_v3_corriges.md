## task_019_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges - Remplacer les assets brand Kapsule par les masters Icones V3 corriges
> From version: 1.0.8
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
- [ ] 1. Copier les quatre masters vers `apps/frontend/public/brand/` et `public/favicon.png`.
- [ ] 2. Regenerer les deux icones PWA depuis le master icone.
- [ ] 3. Rebuilder le frontend et verifier que `dist/` reprend bien les nouveaux assets.
- [ ] 4. Controler favicon, embleme et lien Gnosis dans l'application.
- [ ] 5. Preparer la version `1.0.8` -> `1.0.9` dans `package.json` et la racine de `package-lock.json`.
- [ ] 6. Committer `Prepare ... v1.0.9`, pousser sur `main` et attendre le CI vert sur ce commit.
- [ ] 7. Creer et pousser le tag annote `v1.0.9`, puis verifier les quatre jobs du workflow release.
- [ ] 8. Consigner SHA, tag et URL du run dans le closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule`
- `item_030_publier_la_version_1_0_9_apres_remplacement_des_assets`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC3, request-AC4 -> `item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule`. Proof deferred to slice closeout.
- request-AC5 -> `item_030_publier_la_version_1_0_9_apres_remplacement_des_assets`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# AI Context
- Summary: Remplacer les assets brand Kapsule par les masters Icones V3 corriges
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_018_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges`
- Product brief(s): `prod_009_identite_kapsule_alignee_sur_icones_v3_corrige`
- Architecture decision(s): (none yet)
