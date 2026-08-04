## task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee - Orchestrer correction bandeau, branding Kapsule et release tagguee
> From version: 1.0.4
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Auditer DeckReader, la top bar applicative, les styles responsive et les surfaces favicon.
- [ ] 2. Selectionner les assets Kapsule et Paulmondou les plus adaptes, puis les copier dans le public frontend.
- [ ] 3. Corriger le bandeau desktop en preservant le rendu mobile.
- [ ] 4. Integrer l'embleme Kapsule a gauche et le lien Paulmondou a droite de la top bar.
- [ ] 5. Verifier par tests automatises pertinents et controle visuel desktop/mobile.
- [ ] 6. Appliquer la politique de release finale par tag de version: validation locale, commit implementation, preparation SemVer, commit version, push, CI verte, tag annote, verification release.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`
- `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`
- `item_022_verifier_et_livrer_par_tag_de_version`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2 -> `item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile`. Proof deferred to slice closeout.
- request-AC3, request-AC4, request-AC5 -> `item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure`. Proof deferred to slice closeout.
- request-AC6 -> `item_022_verifier_et_livrer_par_tag_de_version`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# AI Context
- Summary: Orchestrer correction bandeau, branding Kapsule et release tagguee
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule`
- Product brief(s): `prod_005_identite_visuelle_et_navigation_de_lecture_kapsule`
- Architecture decision(s): (none yet)
