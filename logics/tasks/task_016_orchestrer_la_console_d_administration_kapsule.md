## task_016_orchestrer_la_console_d_administration_kapsule - Orchestrer la console d'administration Kapsule
> From version: 1.0.7
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
- [x] 1. Vague 1 - Cartographier le schema SQLite, les dependances de suppression et le contrat d'API admin; definir la migration d'audit et les invariants, notamment la protection du dernier admin.
- [x] 2. Vague 2 - Implementer et tester les endpoints comptes, roles et audit, puis l'ecran /admin de gestion des comptes avec les confirmations accessibles.
- [x] 3. Vague 3 - Implementer et tester les vues contenus et stockage ainsi que les actions de contenu strictement bornees.
- [x] 4. Vague 4 - Executer lint, tests backend et frontend, build, controles d'autorisation et smoke local; documenter la procedure operateur et les limites de stockage.
- [x] 5. Vague 5 - Mettre a jour les documents Logics aux checkpoints, puis suivre le workflow de release du depot pour toute livraison fonctionnelle.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_025_administrer_les_comptes_et_roles_kapsule`
- `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC3, request-AC5, request-AC6, request-AC8 -> `item_025_administrer_les_comptes_et_roles_kapsule`. Proof: `apps/backend/test/admin-accounts.test.mjs` (11 tests) couvre 401 sans session et 403 invite/maitre sur les 9 routes admin, la projection allowlistee sans hash ni token, l'enum de role, la protection du dernier administrateur, le refus d'auto-modification, la confirmation portant l'identifiant, la politique de dependances et l'audit append-only.
- request-AC1, request-AC4, request-AC5, request-AC6, request-AC7, request-AC8 -> `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`. Proof: `apps/backend/test/admin-content.test.mjs` (6 tests) couvre bornes et allowlist des listings, metriques de deck avec assets indisponibles annonces, apercu de stockage sans chemin ni nom de fichier, suppression transactionnelle avec impact et audit ; `apps/frontend/test/admin-format.test.mjs` (8) et `apps/frontend/test/admin-dialog.test.mjs` (6) couvrent la mise en forme non trompeuse et le markup accessible de la confirmation.

# Validation
- `npm test` : 105 tests, 0 echec (schema 10, backend 75, frontend 20) ; `SSR smoke: tout est rendu sans erreur`.
- `npm run build` : build de production OK ; `npm run budget` : JS gzip 70.5 KB / 85 KB, CSS gzip 5.2 KB / 15 KB.
- `npm run format:check` : `All matched files use Prettier code style!`.
- `npm audit --omit=dev` : `found 0 vulnerabilities`.
- `logics-manager lint --require-status` : OK. `logics-manager health` : 0 signal.
- Smoke local sur base fichier (migration 6 appliquee) : `/api/admin/storage` renvoie `database.available=true` avec octets reels, `403` pour un invite, changement de role effectif et evenement d'audit consigne.
- npm test: 105 tests, 0 echec (schema 10, backend 75, frontend 20). npm run build OK. npm run budget OK (JS 70.5/85 KB, CSS 5.2/15 KB). npm run format:check OK. npm audit --omit=dev: 0 vulnerabilite. Smoke local sur base fichier: migration 6 appliquee, 403 invite, role mute, audit consigne.
- Finish workflow executed on 2026-08-07.
- Linked backlog/request close verification passed.

# Report
- Livre la console d'administration Kapsule en cinq vagues.
- Migration 6 : table `audit_log` sans cle etrangere vers `users`, pour que le journal survive a la suppression de l'acteur ou de la cible ; l'email de l'acteur est recopie a l'ecriture.
- Backend : `apps/backend/src/audit.mjs` (journal append-only, etats reduits par allowlist), `apps/backend/src/admin.mjs` (vues comptes/contenus/stockage, suppressions transactionnelles), gardes purs `canAdminister` / `checkRoleChange` / `checkUserDeletion` dans `permissions.mjs`, neuf routes `/api/admin/*` gardees par `requireAuth` + `requireAdmin`.
- Decision d'ordre des invariants : le controle « dernier administrateur » passe AVANT le refus d'auto-modification. Teste dans l'autre ordre, l'invariant etait inatteignable (seul un administrateur unique peut le declencher, sur lui-meme) et le refus renvoye etait le moins informatif des deux.
- Politique de suppression d'un compte, documentee et testee : sessions, progression et revisions supprimees ; decks prives supprimes avec leurs fiches et leurs images ; decks partages conserves et rattaches a `owner_id = NULL`, etat deja prevu par le schema. Aucune reference orpheline.
- Correction de portee : `DELETE /api/decks/:id` (lecteur) laissait des lignes orphelines dans `progress` et `reviews`, tables sans cle etrangere. La route delegue desormais a l'adaptateur admin, contrat historique 204 preserve, et s'audite comme la console.
- Strategie compensee pour les fichiers : la transaction SQLite commit d'abord, les dossiers d'assets sont retires ensuite ; un echec remonte dans `assetCleanup.failed` sans annuler la suppression.
- Frontend : page `/admin` a quatre onglets (motif d'onglets accessible, fleches/Origine/Fin), confirmation par `<dialog>` native exigeant la saisie de l'identifiant cible apres affichage de l'impact, tableaux avec `caption` et `scope`, retours en `role="status"` / `role="alert"`.
- Non-divulgation : aucune projection ne renvoie de hash, de token ni de chemin absolu ; le stockage sort en categories et octets. Une categorie non montee est annoncee « indisponible » plutot que ramenee a `0`.
- Documentation operateur : section « Administrer Kapsule » du README (promotion du premier admin, garde-fous, politiques de suppression, limites du stockage, ce que la console n'est pas) et `KAPSULE_BACKUP_DIR` ajoute au tableau de configuration.
- Depot laisse commit-ready sans commit : la livraison fonctionnelle attend le sequencement de la release, `task_019` etant encore en vol sur `v1.0.9` (tag non pose, CI en file sur `5a04446`). Le bump de version et la release de cette console doivent partir apres la cloture de `v1.0.9`, sous controle de l'operateur.
- Finished on 2026-08-07.
- Linked backlog item(s): `item_025_administrer_les_comptes_et_roles_kapsule`, `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`
- Related request(s): `req_015_administrer_les_utilisateurs_et_contenus_kapsule`

# AI Context
- Summary: Orchestrer la console d'administration Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_015_administrer_les_utilisateurs_et_contenus_kapsule`
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)
