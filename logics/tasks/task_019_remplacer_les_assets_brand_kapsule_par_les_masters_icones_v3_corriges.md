## task_019_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges - Remplacer les assets brand Kapsule par les masters Icones V3 corriges
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC3, request-AC4 -> `item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule`. Proof: les quatre masters sont en place dans `apps/frontend/public/brand/` (embleme Kapsule, favicon, embleme Paul Mondou, icone Gnosis) plus `public/favicon.png`, et les icones PWA `pwa-192x192.png` / `pwa-512x512.png` sont regenerees depuis le master par `apps/frontend/scripts/generate-icons.mjs` au `prebuild`. Commit `25ab714`, publie dans `v1.0.10`.
- request-AC5 -> `item_030_publier_la_version_1_0_9_apres_remplacement_des_assets`. Proof: publie sous `v1.0.10` et non `v1.0.9` (voir Report). Tag annote sur `75d96a1`, workflow `Release by tag` run 31160771745 avec ses quatre jobs verts, release GitHub `v1.0.10` publiee, et prod verifiee : `/api/health` renvoie `ok=true, ready=true, schemaVersion=6`.

# Validation
- CI run 31160572749 sur `75d96a1` : `Format, tests, build, audit`, `Scan de secrets (gitleaks)` et `Build et scan de l'image` tous verts ; CodeQL vert sur le meme commit.
- Local avant push : `npm run format:check` OK, `npm test` 105 tests / 0 echec, `npm run build` OK, `npm run budget` OK, `npm audit --omit=dev` 0 vulnerabilite.
- `logics-manager release validate 1.0.10` : passed, six gates au vert et worktree propre.
- Workflow `Release by tag` run 31160771745 : `validate`, `publish`, `deploy`, `release` verts. Deploiement effectif verifie par `/api/health` (`schemaVersion=6`).
- CI run 31160572749 vert sur 75d96a1 (qualite, gitleaks, Trivy) + CodeQL vert. Release by tag run 31160771745 : validate, publish, deploy, release verts. Release GitHub v1.0.10 publiee. Prod /api/health : ok=true, ready=true, schemaVersion=6. logics-manager release validate 1.0.10 : passed.
- Finish workflow executed on 2026-08-07.
- Linked backlog/request close verification passed.

# Report
- Assets brand livres : quatre masters Icones V3 corriges copies dans `apps/frontend/public/brand/`, `public/favicon.png` aligne, icones PWA regenerees (commit `25ab714`).
- Release reorientee sur decision de l'operateur : `v1.0.9` est abandonnee, son contenu est fusionne dans une release unique `v1.0.10` couvrant aussi la console d'administration (`task_016`).
- Cause : le run CI du commit `5a04446` (« Prepare Kapsule v1.0.9 ») est reste bloque cote GitHub. 14,6 h en file d'attente, aucun job alloue, run inconsistant (l'API refusait l'annulation en le declarant `completed` tout en le listant `queued`, et le rejouer renvoyait « already running »), aucun `workflow_dispatch` sur le workflow CI. Aucun run CodeQL n'avait meme ete cree pour ce commit, alors que tous les pushes precedents en creaient un : ce push avait donc echoue partiellement cote GitHub.
- Avant de renoncer a `v1.0.9`, l'arbre de `5a04446` a ete verifie dans un worktree detache : les cinq etapes qualite du CI passent. Le blocage etait cote runners, pas cote code.
- Le tag `v1.0.9` n'a jamais ete pose : le pousser aurait declenche le workflow de release sur le meme pool bloque, avec le risque d'une release calee a mi-parcours. Un nouveau push sur `main` etait de toute facon le seul moyen de declencher un run CI neuf.
- Le push de `v1.0.10` a alloue ses jobs immediatement, CI et CodeQL inclus, confirmant que le pool etait sain et que seul l'ancien run etait zombie.
- `item_030` conserve son intitule historique en `1_0_9` : renommer un document Logics deja indexe casserait ses references de lignage. La version reellement publiee est tracee ici et dans les preuves de release.
- Finished on 2026-08-07.
- Linked backlog item(s): `item_029_remplacer_les_assets_brand_et_les_icones_pwa_kapsule`, `item_030_publier_la_version_1_0_9_apres_remplacement_des_assets`
- Related request(s): `req_018_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges`

# AI Context
- Summary: Remplacer les assets brand Kapsule par les masters Icones V3 corriges
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_018_remplacer_les_assets_brand_kapsule_par_les_masters_icones_v3_corriges`
- Product brief(s): `prod_009_identite_kapsule_alignee_sur_icones_v3_corrige`
- Architecture decision(s): (none yet)
