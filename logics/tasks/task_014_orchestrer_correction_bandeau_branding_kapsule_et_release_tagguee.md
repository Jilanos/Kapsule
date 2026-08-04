## task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee - Orchestrer correction bandeau, branding Kapsule et release tagguee
> From version: 1.0.4
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
- [x] 1. Auditer DeckReader, la top bar applicative, les styles responsive et les surfaces favicon.
- [x] 2. Selectionner les assets Kapsule et Paulmondou les plus adaptes, puis les copier dans le public frontend.
- [x] 3. Corriger le bandeau desktop en preservant le rendu mobile.
- [x] 4. Integrer l'embleme Kapsule a gauche et le lien Paulmondou a droite de la top bar.
- [x] 5. Verifier par tests automatises pertinents et controle visuel desktop/mobile.
- [x] 6. Appliquer la politique de release finale par tag de version: validation locale, commit implementation, preparation SemVer, commit version, push, CI verte, tag annote, verification release.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`
- `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`
- `item_022_verifier_et_livrer_par_tag_de_version`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2 -> `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`. Proof deferred to slice closeout.
- request-AC3, request-AC4, request-AC5 -> `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`. Proof deferred to slice closeout.
- request-AC6 -> `item_022_verifier_et_livrer_par_tag_de_version`. Proof deferred to slice closeout.
- request-AC1 -> This task. Proof: `apps/frontend/src/styles.css` cadre `.card-progress-row` dans la colonne de lecture desktop, remplace le fond blanc par un fond harmonise et conserve la lisibilite.
- request-AC2 -> This task. Proof: le media query `max-width: 640px` preserve le fond mobile `var(--surface)`, les controles compacts et le layout mobile du bandeau.
- request-AC3 -> This task. Proof: les assets Kapsule sont versionnes dans `apps/frontend/public/brand`, `apps/frontend/src/App.jsx` affiche l'embleme en haut a gauche et `apps/frontend/index.html` pointe le favicon vers `/brand/kapsule-favicon.png`.
- request-AC4 -> This task. Proof: `apps/frontend/src/App.jsx` ajoute le lien accessible `https://paulmondou.fr` avec l'embleme Paulmondou dans la zone droite de la top bar.
- request-AC5 -> This task. Proof: les images referencees utilisent des chemins publics `/brand/...` servis par le frontend, sans chemin local absolu au runtime.
- request-AC6 -> This task. Proof: validations locales passees, CI 30912813815 et CodeQL 30912814037 verts sur `b069ab1c2070fe20513286645ccc75187d1be705`, tag annote `v1.0.5` pousse, workflow Release by tag 30913050279 vert avec deploiement et health production OK.

# Validation
- (no validation recorded yet)
- 2026-08-04: npm run format:check, npm test, npm run build, npm run budget, npm audit --omit=dev et logics-manager lint --require-status passes localement; CI 30912813815 et CodeQL 30912814037 verts sur b069ab1c2070fe20513286645ccc75187d1be705; tag annote v1.0.5 pousse; Release by tag 30913050279 verte avec validate, publish, deploy, release; health production https://kapsule.paulmondou.fr/api/health OK.
- Finish workflow executed on 2026-08-04.
- Linked backlog/request close verification passed.

# Report
- Not started.
- Finished on 2026-08-04.
- Linked backlog item(s): `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`, `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`, `item_022_verifier_et_livrer_par_tag_de_version`
- Related request(s): `req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule`

# AI Context
- Summary: Orchestrer correction bandeau, branding Kapsule et release tagguee
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule`
- Product brief(s): `prod_005_identite_visuelle_et_navigation_de_lecture_kapsule`
- Architecture decision(s): (none yet)
