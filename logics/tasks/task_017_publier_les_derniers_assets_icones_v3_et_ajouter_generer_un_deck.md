## task_017_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck - Publier les derniers assets Icones V3 et ajouter Generer un deck
> From version: 1.0.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_027_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck`

# Acceptance criteria
- AC1: The request states the bounded need for publier les derniers assets icones v3 et ajouter generer un deck.
- AC2: Scope boundaries and operator impact are explicit.
- AC3: The request is ready to be promoted into a backlog slice.

# Plan
- [ ] Use `python3 -m logics_manager flow progress task task_017_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck.md --progress <n>%` during multi-wave work.
- [ ] Run `python3 -m logics_manager flow finish task task_017_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck.md` after implementation.

# Validation
- (no validation recorded yet)
- Finish workflow executed on 2026-08-06.
- Linked backlog/request close verification passed.

# Report
- Not started.
- Finished on 2026-08-06.
- Linked backlog item(s): `item_027_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck`
- Related request(s): `req_016_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck`

# AI Context
- Summary: Implement publier les derniers assets icones v3 et ajouter generer un deck.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_016_publier_les_derniers_assets_icones_v3_et_ajouter_generer_un_deck`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: Les assets Kapsule et les icônes PWA sont générés depuis le dernier favicon master.
- request-AC2 -> This task. Evidence needed: « Générer un deck » est visible à côté de « + Importer un deck ».
- request-AC3 -> This task. Evidence needed: Le lien est accessible, comporte le logo Gnosis et conserve l'import existant.
- request-AC1 -> This task. Proof: the latest favicon master was copied to `public/brand/kapsule-favicon.png`, then generated the PWA icons.
- request-AC2 -> This task. Proof: `ImportDeck` renders the `Générer un deck` action next to the import action.
- request-AC3 -> This task. Proof: the action links to `https://gnosis.paulmondou.fr`, has an accessible label, and renders `/brand/gnosis-icon.png`.
