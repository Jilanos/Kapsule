## task_001_orchestrer_le_mvp_kapsule - Orchestrer le MVP Kapsule
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Valider le schema de fiche et SPEC.md (contrat de contenu) avant toute UI.
- [x] 2. Mettre en place le socle monorepo frontend PWA + backend API + SQLite.
- [x] 3. Construire le lecteur de fiches et la navigation deck sur le deck d'exemple.
- [x] 4. Brancher la progression persistee via le backend.
- [x] 5. Finaliser l'import/validation de decks et le test bout en bout avec un deck genere par IA.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_001_definir_le_schema_de_fiche_et_le_spec_md_pour_agents_ia`
- `item_002_creer_le_socle_monorepo_pwa_frontend_et_backend_api`
- `item_003_construire_le_lecteur_de_fiches_et_la_navigation_en_deck`
- `item_004_suivre_la_progression_et_la_persister_via_le_backend`
- `item_005_importer_et_valider_des_decks_generes_par_ia`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `packages/schema/deck.schema.json` + `SPEC.md` ; validateur `packages/schema/src/index.mjs`, 10 tests, rejet avec rapport d'erreurs lisible.
- request-AC2 -> This task. Proof: lecteur `apps/frontend/src/components/CardView.jsx`/`Section.jsx`/`Quiz.jsx`, styles responsive ; SSR smoke test rend intro/concept/example/takeaways/quiz sans erreur.
- request-AC3 -> This task. Proof: `apps/frontend/src/pages/DeckReader.jsx` gere les etats non vue/vue/apprise et l'enchainement vers la fiche suivante ; agregation par deck cote backend.
- request-AC4 -> This task. Proof: `apps/backend/src/store.mjs` + endpoints progression ; persistance verifiee au redemarrage du serveur (fichier SQLite) et via `apps/backend/test/api.test.mjs`.
- request-AC5 -> This task. Proof: import UI/API (`apps/frontend/src/components/ImportDeck.jsx`, `POST /api/decks`) ; test e2e `apps/backend/test/e2e-import.test.mjs` importe un deck genere par IA sans retouche.
- request-AC6 -> This task. Proof: `apps/frontend/vite.config.mjs` (VitePWA : manifest + service worker + runtime caching des decks pour la lecture hors-ligne) ; build genere `sw.js` et `manifest.webmanifest`.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- MVP livre en 5 slices (commits 91e9d3a, fee4280, e82bb78, 32a547c, 1d92599).
- Slice 1 : `packages/schema` (JSON Schema + validateur ajv, 10 tests), `SPEC.md`, deck d'exemple `decks/reseaux-essentiels.json`.
- Slice 2 : monorepo npm workspaces ; backend Express + better-sqlite3 (adaptateur de stockage, seed, 6 tests) ; frontend React+Vite PWA (manifest + service worker).
- Slice 3 : lecteur de fiches (sections typees, markdown leger, quiz interactif), navigation deck, SSR smoke test couvrant tous les types de sections.
- Slice 4 : progression persistee cote backend (etats unseen/seen/learned), mise a jour optimiste UI ; persistance verifiee au redemarrage du serveur.
- Slice 5 : import de deck par UI et API avec rapport de validation, route assets images protegee, test e2e d'un deck genere par IA suivant SPEC.md.
- Validation : `npm test` = 10 (schema) + 8 (backend) + SSR smoke (frontend) OK ; `logics lint`/`audit` OK.

# AI Context
- Summary: Orchestrer le MVP Kapsule
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_001_kapsule_architecture_direction`
