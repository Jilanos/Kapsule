## req_002_repetition_espacee_sm2 - Repetition espacee SM-2
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: apprentissage
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Ancrer durablement les connaissances : une fiche apprise doit revenir en revision au bon moment (J+1, J+3, J+7... selon la performance) au lieu d'etre oubliee.
- Voir en un coup d'oeil ce qu'il y a a reviser aujourd'hui, tous decks confondus, et derouler la session de revision en quelques minutes.
- Zero friction : la notation de la revision doit deriver automatiquement du score au quiz de la fiche, sans geste supplementaire.

# Context
- Le MVP marque les fiches `learned` et stocke deja le score de quiz (`progress.quiz_score`) : la matiere premiere de SM-2 existe.
- Decision d'architecture (ADR 002) : SM-2 classique par (utilisateur, fiche) avec `easiness`, `interval`, `repetitions`, `due_date` en table `reviews` ; note 0-5 derivee du ratio de bonnes reponses au quiz (1.0 -> 5, 0 -> 1) ; fiches sans quiz : relecture complete = note 4.
- Une fiche entre dans le cycle de revision quand elle passe a `learned`.
- Depend du cloisonnement par utilisateur (req_001) pour etre correct en multi-utilisateurs ; peut etre developpe sur `default` et branche ensuite.
- Hors perimetre (follow-ups) : notifications push, statistiques de retention, reglages fins de l'algorithme.

# Acceptance criteria
- AC1: Quand une fiche passe a `learned`, une entree de revision SM-2 est creee avec une premiere echeance a J+1.
- AC2: Reviser une fiche recalcule easiness/interval/repetitions/due_date selon SM-2, avec la note derivee du score de quiz (ou 4 par defaut sans quiz) ; une mauvaise note (quiz rate) remet l'intervalle a 1 jour.
- AC3: Une vue "Revisions du jour" liste les fiches dues (due_date <= aujourd'hui) tous decks confondus, triees par anciennete d'echeance, et permet de les reviser en enchainement.
- AC4: Le nombre de fiches dues est visible depuis l'accueil (badge/compteur) et se met a jour apres chaque revision.
- AC5: La planification est persistee cote backend et partagee entre appareils (meme comportement apres rechargement ou changement de navigateur).
- AC6: L'algorithme SM-2 est couvert par des tests unitaires (progression des intervalles, echec, bornes d'easiness).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# References
- `apps/backend/src/store.mjs` (progress + quiz_score existants)
- `apps/frontend/src/pages/DeckReader.jsx` (passage a learned, point d'accrochage)
- Dependance : `req_001_authentification_multi_appareils` (cloisonnement par utilisateur)

# AI Context
- Summary: Repetition espacee SM-2 pilotee par les scores de quiz, avec vue "Revisions du jour" multi-decks.
- Keywords: sm-2, spaced repetition, revisions, quiz score, due date
- Use when: Implementing or reviewing the v0.2 spaced-repetition work.
- Skip when: The change concerns authentication or deployment infrastructure.

# Backlog
- none
- `item_007_repetition_espacee_sm_2`
