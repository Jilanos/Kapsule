## task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3 - Orchestrer la console d'administration large, editable et Icones V3
> From version: 1.0.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Claude
> Indicators reviewed: 2026-08-08

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Auditer les contraintes de largeur et reproduire les parcours de mutation compte/deck avec un compte admin de test.
- [x] 2. Livrer et tester la tranche ergonomie comptes sans modifier les invariants d'autorisation existants.
- [x] 3. Concevoir puis livrer le contrat PATCH de métadonnées de deck, son audit et son dialogue d'édition borné.
- [x] 4. Inventorier les références visuelles, remplacer exclusivement les trois marques utilisées par leurs masters Icones V3 et régénérer les dérivés nécessaires.
- [x] 5. Exécuter format, tests frontend/backend, build, budget et validations Logics ; documenter les preuves et laisser le dépôt prêt à committer.
- [x] 6. ADR 009 checkpoint: mettre à jour les documents Logics touchés à chaque vague significative et laisser le dépôt commit-ready sans créer de commit automatiquement.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_031_etendre_et_rendre_lisible_la_console_d_administration`
- `item_032_editer_de_facon_securisee_les_metadonnees_d_un_deck_depuis_l_administration`
- `item_033_remplacer_les_marques_et_icones_visibles_par_les_masters_icones_v3`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1, request-AC2, request-AC5 -> `item_031_etendre_et_rendre_lisible_la_console_d_administration`. Proof: `/admin` passe en pleine largeur via `mainWidthClass` (`apps/frontend/src/lib/layout.js`) et `.app-main-admin { max-width: none }` ; la colonne Email perd `max-width: 18rem` / `word-break: break-word` au profit de `min-width: 20rem` + `white-space: nowrap`, le defilement restant local a `.admin-table-scroll`. Les mutations de role et de suppression de compte sont inchangees (invariants serveur intacts) et restent couvertes par `apps/backend/test/admin-accounts.test.mjs`. Nouveau test `apps/frontend/test/admin-layout.test.mjs`.
- request-AC3, request-AC5 -> `item_032_editer_de_facon_securisee_les_metadonnees_d_un_deck_depuis_l_administration`. Proof: `PATCH /api/admin/decks/:deckId` avec allowlist stricte `parseDeckMetadataPatch` (title/description/visibility), mutation transactionnelle colonne + `decks.data` + `updated_at` + audit `deck.metadata.update`, projection de reponse bornee ; dialogue `EditDeckDialog.jsx` accessible avec annulation, erreurs et rechargement du listing. Tests `apps/backend/test/admin-deck-edit.test.mjs` (4) et `apps/frontend/test/admin-dialog.test.mjs` (4 nouveaux).
- request-AC4, request-AC6 -> `item_033_remplacer_les_marques_et_icones_visibles_par_les_masters_icones_v3`. Proof: les trois marques affichees sont servies depuis les masters SVG Icones V3 (`public/brand/kapsule-emblem.svg`, `paulmondou-emblem.svg`, `gnosis.svg`) ; les quatre PNG brand precedents sont retires, le favicon passe en SVG avec repli PNG genere, et `pwa-192x192.png` / `pwa-512x512.png` / `favicon.png` sont regeneres a l'identique depuis le master raster Kapsule. Aucune marque du lot hors Kapsule / Paul Mondou / Gnosis n'entre dans le depot.

# Validation
- `logics-manager release validate 1.0.11` : passed, six gates au vert et worktree propre.
- `npm run format:check` : All matched files use Prettier code style.
- `npm test` : 117 tests, 0 echec (10 schema, 79 backend, 28 frontend) — contre 105 avant la tache.
- `npm run build` : build Vite OK, `dist/brand/` ne contient que les trois SVG Icones V3, precache PWA 8 entrees.
- `npm run budget` : JS gzip 71,3 Ko / 85 Ko, CSS gzip 5,3 Ko / 15 Ko.
- `npm audit --omit=dev` : 0 vulnerabilite.
- Regeneration des icones PWA verifiee par empreinte : `pwa-192x192.png`, `pwa-512x512.png` et `favicon.png` identiques avant/apres, depuis `assets/brand/kapsule-icon-master.png`.
- npm run format:check OK ; npm test 117 tests / 0 echec ; npm run build OK (dist/brand limite aux trois SVG Icones V3) ; npm run budget OK ; npm audit --omit=dev 0 vulnerabilite ; icones PWA regenerees a l'identique par empreinte.
- Finish workflow executed on 2026-08-08.
- Linked backlog/request close verification passed.

# Report
- Les trois tranches sont livrees dans une seule vague ; le depot est laisse commit-ready sans commit automatique, conformement au controle operateur.
- Ergonomie (item_031) : la largeur est desormais une decision de route, extraite dans `src/lib/layout.js` pour etre testable sans rendu. L'email n'est plus tronque ni coupe : la ligne complete est toujours lisible et c'est le tableau qui defile, ce qui evite la troncature avec `title` (inaccessible au clavier).
- Edition de deck (item_032) : `decks.data` porte le JSON complet servi au lecteur et y duplique titre et description. La colonne et le JSON sont donc ecrits dans la meme transaction que l'audit — un titre corrige dans la console mais pas dans le lecteur aurait ete pire que pas de correction. `description` est ajoutee a l'allowlist d'audit ; `describeAuditTransition` ne resume plus que les champs reellement modifies, sinon une edition de titre aurait affiche « general → general ».
- Une route `GET /api/admin/decks/:deckId` est ajoutee : le formulaire part de l'etat serveur et non du dernier listing, dont la projection bornee n'expose pas la description. Ce choix evite d'alourdir le listing d'un champ de 500 caracteres par ligne jamais affiche dans le tableau.
- Assets (item_033) : le master raster Kapsule quitte `public/` pour `apps/frontend/assets/brand/kapsule-icon-master.png`. Il n'est jamais servi — c'est une source de build, le pipeline d'icones n'ayant aucun moteur de rendu SVG — et 83 Ko de poids mort sortent ainsi de `dist/`.
- Publication demandee par l'operateur apres la cloture de la tache : le contenu est livre en `v1.0.11` (commits `fd8e66b` travail et `b219c36` preparation de version). Le plan de la tache ne portait pas d'etape de publication, elle est donc tracee ici et dans les gates de release.
- Chaine de release : CI run 31250475455 et CodeQL run 31250475442 verts sur `b219c36` *avant* la pose du tag, conformement a la lecon de `task_019` (ne jamais tagger sur un CI non valide). Tag annote `v1.0.11`, workflow `Release by tag` run 31250574026 avec ses quatre jobs verts (validate, publish, deploy, release).
- Prod verifiee apres deploiement : `/api/health` renvoie `ok=true, ready=true, schemaVersion=6`, et les trois masters Icones V3 sont servis en `image/svg+xml`. L'ancien `/brand/kapsule-emblem.png` ne renvoie plus que le repli SPA : le fichier est bien absent du build deploye.
- Finished on 2026-08-08.
- Linked backlog item(s): `item_031_etendre_et_rendre_lisible_la_console_d_administration`, `item_032_editer_de_facon_securisee_les_metadonnees_d_un_deck_depuis_l_administration`, `item_033_remplacer_les_marques_et_icones_visibles_par_les_masters_icones_v3`
- Related request(s): `req_019_rendre_la_console_d_administration_pleine_largeur_editable_et_alignee_sur_icones_v3`

# AI Context
- Summary: Orchestrer la console d'administration large, editable et Icones V3
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_019_rendre_la_console_d_administration_pleine_largeur_editable_et_alignee_sur_icones_v3`
- Product brief(s): `prod_010_console_d_administration_exploitable_et_identite_icones_v3_complete`
- Architecture decision(s): (none yet)
