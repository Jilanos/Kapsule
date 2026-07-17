## task_003_repetition_espacee_sm_2 - Repetition espacee SM-2
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_007_repetition_espacee_sm_2`

# Acceptance criteria
- AC1: Quand une fiche passe a `learned`, une entree de revision SM-2 est creee avec une premiere echeance a J+1.
- AC2: Reviser une fiche recalcule easiness/interval/repetitions/due_date selon SM-2, avec la note derivee du score de quiz (ou 4 par defaut sans quiz) ; une mauvaise note (quiz rate) remet l'intervalle a 1 jour.
- AC3: Une vue "Revisions du jour" liste les fiches dues (due_date <= aujourd'hui) tous decks confondus, triees par anciennete d'echeance, et permet de les reviser en enchainement.
- AC4: Le nombre de fiches dues est visible depuis l'accueil (badge/compteur) et se met a jour apres chaque revision.
- AC5: La planification est persistee cote backend et partagee entre appareils (meme comportement apres rechargement ou changement de navigateur).
- AC6: L'algorithme SM-2 est couvert par des tests unitaires (progression des intervalles, echec, bornes d'easiness).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_003_repetition_espacee_sm_2.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_003_repetition_espacee_sm_2.md` after implementation.

# AC Traceability
- request-AC1 -> This task. Proof: `Store.setProgress` cree une revision via `ensureReview` au passage a `learned` (interval 1 = J+1) ; test API "marquer apprise cree une revision due a J+1".
- request-AC2 -> This task. Proof: `sm2.mjs` (algorithme pur) + `Store.reviewCard` + route `POST /review` ; grade derive du score de quiz (`gradeFromQuiz`), echec -> interval 1 ; tests SM-2 + test API "bon score repousse / echec ramene a J+1".
- request-AC3 -> This task. Proof: `Store.getDueReviews` (jointure titres, tri par echeance) + route `GET /api/reviews/due` + page `ReviewSession.jsx` (enchainement) ; test "liste les dues avec titres".
- request-AC4 -> This task. Proof: banniere compteur de dues dans `DeckList.jsx` (rechargee apres chaque action) alimentee par `GET /api/reviews/due`.
- request-AC5 -> This task. Proof: table `reviews` (SQLite, migration 3) ; persistance cote backend, cloisonnee par utilisateur ; test "revisions cloisonnees par utilisateur".
- request-AC6 -> This task. Proof: `apps/backend/test/sm2.test.mjs` (progression des intervalles, echec, borne d'easiness 1.3, gradeFromQuiz).

# Report
- SM-2 livre : algorithme pur teste (`sm2.mjs`), table `reviews` (migration versionnee 3), creation de revision au passage a `learned` (echeance J+1), reprogrammation par le score de quiz (echec -> J+1), vue "Revisions du jour" multi-decks avec enchainement, banniere compteur sur l'accueil.
- Validation : backend 28 tests OK (8 SM-2 algo + 4 flux revision), frontend build + SSR OK ; smoke live (J+1 -> interval 6 sur succes -> reset a 1 sur echec).

# AI Context
- Summary: Implement repetition espacee sm-2.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_002_repetition_espacee_sm2`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
