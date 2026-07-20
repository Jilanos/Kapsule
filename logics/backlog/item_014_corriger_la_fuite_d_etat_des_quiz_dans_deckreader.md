## item_014_corriger_la_fuite_d_etat_des_quiz_dans_deckreader - Corriger la fuite d'etat des quiz dans DeckReader
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
En lecture de deck, le passage d'une fiche a la suivante peut reutiliser l'etat
local d'un quiz deja rempli. L'utilisateur arrive alors sur une nouvelle fiche
avec des questions affichees comme deja repondues et non modifiables, ce qui
rend le quiz faux et bloque l'interaction attendue.

Le correctif principal consiste a donner une identite React stable a la fiche
active dans `DeckReader` : `CardView` doit etre rendu avec `key={card.id}` pour
que React demonte l'ancienne fiche et remonte une instance neuve a chaque
changement de fiche.

# Scope
- In:
  - Ajout de `key={card.id}` sur le composant `CardView` rendu par
    `DeckReader` en mode lecture de fiche.
  - Verification que le remount remet a zero les etats locaux descendants,
    notamment `Quiz.answers` et le score local porte par `CardView`.
  - Couverture de regression sur un parcours sequentiel avec deux fiches dont
    les quiz occupent la meme position de section.
  - Verification que le verrouillage apres reponse reste actif sur la fiche
    courante.
- Out:
  - Refonte du modele de quiz ou changement des regles de correction.
  - Remplacement global de toutes les cles `key={i}` dans le rendu des sections,
    sauf si necessaire pour stabiliser le test du correctif principal.
  - Reset automatique interne de `Quiz.answers` sur changement de fiche comme
    mecanisme principal.
  - Changement du parcours `ReviewSession`, de la repetition espacee, du
    backend ou de la persistance de progression.

# Acceptance criteria
- AC1 - Identite de fiche : `DeckReader` rend `CardView` avec une cle stable
  derivee de `card.id` dans le bloc de lecture d'une fiche.
- AC2 - Regression quiz : apres avoir repondu a un quiz sur la fiche N puis
  clique sur "fiche suivante", les quiz de la fiche N+1 s'affichent sans reponse
  preselectionnee et avec des choix non `disabled`.
- AC3 - Verrouillage local preserve : sur une meme fiche, une question deja
  repondue reste verrouillee comme avant et le score transmis a
  `onLearnAndNext` continue de refleter les reponses de cette fiche.
- AC4 - Navigation preservee : retour au deck, compteur de fiche, marquage
  `seen`, marquage `learned`, derniere fiche et libelles existants restent
  fonctionnels.
- AC5 - Non-regression review : le parcours de revision ne regresse pas, meme si
  le bug cible concerne prioritairement `DeckReader`.
- AC6 - Validation : les tests frontend pertinents passent, et la suite de
  validation choisie pour ce changement est documentee dans la task.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 impose `key={card.id}` sur
  `CardView` dans `DeckReader`.
- request-AC2 -> This backlog slice. Proof: AC2 couvre explicitement le passage
  fiche N vers fiche N+1 avec quiz a la meme position.
- request-AC3 -> This backlog slice. Proof: AC3 preserve le verrouillage local
  voulu dans `Quiz`.
- request-AC4 -> This backlog slice. Proof: AC4 et AC5 couvrent navigation,
  progression et review.
- request-AC5 -> This backlog slice. Proof: AC6 exige une validation frontend
  reproductible.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_009_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
- Primary task(s): `task_010_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`

# AI Context
- Summary: Livrer le bugfix React qui force le remount de `CardView` par
  `key={card.id}` pour empecher les reponses de quiz de fuir entre fiches.
- Keywords: DeckReader, CardView, Quiz, React key, remount, answers, disabled,
  fiche suivante
- Use when: Implementing or reviewing the deck-reader quiz state leak fix.
- Skip when: The change concerns quiz authoring, backend progress, review
  scheduling or deck-list exploration.

# Priority
- Priority: High
- Rationale: Bug utilisateur bloquant sur la lecture de deck, avec correctif
  principal court et faible risque.

# Notes
- Le reset automatique de `Quiz.answers` a l'arrivee sur une fiche est une
- Task `task_010_corriger_la_fuite_d_etat_des_quiz_dans_deckreader` was finished via `logics-manager flow finish task` on 2026-07-20.
  defense possible, mais ne doit pas remplacer le correctif principal
  `key={card.id}` sur `CardView`.
- Source file: `logics/request/req_009_corriger_la_fuite_d_etat_des_quiz_dans_deckreader.md`.
- Generated locally by logics-manager.

# Tasks
- `task_010_corriger_la_fuite_d_etat_des_quiz_dans_deckreader`
