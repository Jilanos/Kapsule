## task_003_repetition_espacee_sm_2 - Repetition espacee SM-2
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

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

# Report
- Implementation complete.

# AI Context
- Summary: Implement repetition espacee sm-2.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_002_repetition_espacee_sm2`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
