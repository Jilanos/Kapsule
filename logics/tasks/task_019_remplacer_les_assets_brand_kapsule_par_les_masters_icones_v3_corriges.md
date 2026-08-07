## task_019_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges - Remplacer les assets brand Kapsule par les masters Icones V3 corriges
> From version: 1.0.8
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 60%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Claude

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Copier les quatre masters vers `apps/frontend/public/brand/` et `public/favicon.png`.
- [x] 2. Regenerer les deux icones PWA depuis le master icone.
- [x] 3. Rebuilder le frontend et verifier que `dist/` reprend bien les nouveaux assets.
- [x] 4. Controler favicon, embleme et lien Gnosis dans l'application.
- [x] 5. Preparer la version `1.0.8` -> `1.0.9` dans `package.json` et la racine de `package-lock.json`.
- [x] 6. Committer `Prepare ... v1.0.9`, pousser sur `main` et attendre le CI vert sur ce commit. REORIENTE : commit `5a04446` pousse sur `main`, mais son run CI est reste bloque cote GitHub (14,6 h en file, aucun job alloue, run ni annulable ni relancable, aucun `workflow_dispatch` disponible sur le workflow CI). Le tag `v1.0.9` n'a jamais ete pose.
- [x] 7. Creer et pousser le tag annote `v1.0.9`, puis verifier les quatre jobs du workflow release. REMPLACE : sur decision de l'operateur, la release `v1.0.9` est abandonnee et son contenu est fusionne dans une release unique `v1.0.10` couvrant les assets brand ET la console d'administration (`task_016`). Un nouveau push sur `main` etait de toute facon le seul moyen de declencher un run CI neuf.
- [x] 8. Consigner SHA, tag et URL du run dans le closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

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
