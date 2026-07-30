## item_019_navigation_persistante_et_lecture_neutre_des_fiches - Navigation persistante et lecture neutre des fiches
> From version: 1.0.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 85%
> Complexity: Medium
> Theme: Experience de lecture et progression
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- La barre de lecture disparait lors du defilement et ne permet pas de parcourir le deck.
- La simple ouverture d'une fiche peut ecraser son statut apprise par vue.

# Scope
- In:
  - Barre de navigation fixe, responsive et accessible dans le lecteur de deck.
  - Actions precedente et suivante sans ecriture de progression.
  - Suppression du marquage automatique a l'ouverture.
  - Garde backend contre une retrogradation implicite de learned vers seen.
  - Tests de non-regression de progression et de navigation.
- Out:
  - Nouvel algorithme de repetition espacee.
  - Modification des donnees de decks existantes.
  - Refonte globale de la page de lecture.

# Acceptance criteria
- AC1: La barre fixe contient le retour au deck, le compteur et les controles precedent/suivant.
- AC2: Le lecteur ne persiste aucun statut pendant l'ouverture ou la navigation.
- AC3: L'API ne retrograde pas une fiche learned en seen par une mise a jour implicite.
- AC4: Le bouton de fin marque explicitement la fiche apprise et conserve le passage a la fiche suivante.
- AC5: Les tests couvrent une fiche apprise relue puis parcourue sans perte de son statut ni de sa revision.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: La barre fixe contient le retour au deck, le compteur et les controles precedent/suivant.
- request-AC2 -> This backlog slice. Proof: AC2: Le lecteur ne persiste aucun statut pendant l'ouverture ou la navigation.
- request-AC3 -> This backlog slice. Proof: AC3: L'API ne retrograde pas une fiche learned en seen par une mise a jour implicite.
- request-AC4 -> This backlog slice. Proof: AC4: Le bouton de fin marque explicitement la fiche apprise et conserve le passage a la fiche suivante.
- request-AC5 -> This backlog slice. Proof: AC5: Les tests couvrent une fiche apprise relue puis parcourue sans perte de son statut ni de sa revision.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_004_lecture_neutre_et_navigation_persistante_des_fiches`
- Architecture decision(s): (none yet)
- Request: `req_012_rendre_la_lecture_des_fiches_navigable_et_neutre_pour_la_progression`
- Primary task(s): `task_013_orchestrer_la_lecture_neutre_et_la_navigation_persistante`

# AI Context
- Summary: Navigation persistante et lecture neutre des fiches
- Keywords: scaffolded-backlog, navigation persistante et lecture neutre des fiches, implementation-ready
- Use when: Implementing the scaffolded slice for Navigation persistante et lecture neutre des fiches.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
