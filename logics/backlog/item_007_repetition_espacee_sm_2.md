## item_007_repetition_espacee_sm_2 - Repetition espacee SM-2
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Ancrer durablement les connaissances : une fiche apprise doit revenir en revision au bon moment (J+1, J+3, J+7... selon la performance) au lieu d'etre oubliee.
Voir en un coup d'oeil ce qu'il y a a reviser aujourd'hui, tous decks confondus, et derouler la session de revision en quelques minutes.
Zero friction : la notation de la revision doit deriver automatiquement du score au quiz de la fiche, sans geste supplementaire.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Quand une fiche passe a `learned`, une entree de revision SM-2 est creee avec une premiere echeance a J+1.
- AC2: Reviser une fiche recalcule easiness/interval/repetitions/due_date selon SM-2, avec la note derivee du score de quiz (ou 4 par defaut sans quiz) ; une mauvaise note (quiz rate) remet l'intervalle a 1 jour.
- AC3: Une vue "Revisions du jour" liste les fiches dues (due_date <= aujourd'hui) tous decks confondus, triees par anciennete d'echeance, et permet de les reviser en enchainement.
- AC4: Le nombre de fiches dues est visible depuis l'accueil (badge/compteur) et se met a jour apres chaque revision.
- AC5: La planification est persistee cote backend et partagee entre appareils (meme comportement apres rechargement ou changement de navigateur).
- AC6: L'algorithme SM-2 est couvert par des tests unitaires (progression des intervalles, echec, bornes d'easiness).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Quand une fiche passe a `learned`, une entree de revision SM-2 est creee avec une premiere echeance a J+1.
- request-AC2 -> This backlog slice. Proof: AC2: Reviser une fiche recalcule easiness/interval/repetitions/due_date selon SM-2, avec la note derivee du score de quiz (ou 4 par defaut sans quiz) ; une mauvaise note (quiz rate) remet l'intervalle a 1 jour.
- request-AC3 -> This backlog slice. Proof: AC3: Une vue "Revisions du jour" liste les fiches dues (due_date <= aujourd'hui) tous decks confondus, triees par anciennete d'echeance, et permet de les reviser en enchainement.
- request-AC4 -> This backlog slice. Proof: AC4: Le nombre de fiches dues est visible depuis l'accueil (badge/compteur) et se met a jour apres chaque revision.
- request-AC5 -> This backlog slice. Proof: AC5: La planification est persistee cote backend et partagee entre appareils (meme comportement apres rechargement ou changement de navigateur).
- request-AC6 -> This backlog slice. Proof: AC6: L'algorithme SM-2 est couvert par des tests unitaires (progression des intervalles, echec, bornes d'easiness).

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_002_repetition_espacee_sm2.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Repetition espacee SM-2
- Keywords: backlog-groom, request, repetition espacee sm-2, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Repetition espacee SM-2.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_002_repetition_espacee_sm2` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_002_repetition_espacee_sm2.md`.
- Generated locally by logics-manager.

# Tasks
- `task_003_repetition_espacee_sm_2`
