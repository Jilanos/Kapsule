## item_020_corriger_le_bandeau_de_lecture_desktop_sans_regression_mobile - Corriger le bandeau de lecture desktop sans regression mobile
> From version: 1.0.4
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Experience de lecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Le bandeau DeckReader est bien adapte au mobile mais son rendu desktop cree un fond blanc et un cadrage visuellement incoherents.

# Scope
- In:
  - Ajuster structure et styles du bandeau de lecture pour desktop.
  - Conserver les controles retour, precedente, compteur et suivante.
  - Verifier les breakpoints desktop et mobile.
- Out:
  - Changer la logique de navigation entre fiches.
  - Modifier le schema des decks ou les API backend.

# Acceptance criteria
- AC1: Le bandeau desktop est cadre dans la largeur de lecture et ne presente plus de bande blanche incoherente.
- AC2: Le rendu mobile reste conforme au comportement actuellement valide par l'utilisateur.
- AC3: Les controles restent accessibles au clavier et conservent leurs etats desactives aux bornes du deck.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Le bandeau desktop est cadre dans la largeur de lecture et ne presente plus de bande blanche incoherente.
- request-AC2 -> This backlog slice. Proof: AC2: Le rendu mobile reste conforme au comportement actuellement valide par l'utilisateur.
- request-AC3 -> This backlog slice. Evidence needed: Les assets Kapsule sont copies dans le public frontend, l'embleme apparait en haut a gauche et le favicon de l'onglet utilise l'icone Kapsule appropriee.
- request-AC4 -> This backlog slice. Evidence needed: Un embleme Paulmondou apparait dans la barre superieure a droite de la deconnexion et ouvre https://paulmondou.fr via un lien accessible.
- request-AC5 -> This backlog slice. Evidence needed: Les images references sont servies par le frontend sans chemin local absolu ni dependance au dossier personnel d'icones.
- request-AC6 -> This backlog slice. Evidence needed: Le changement est verifie en local sur desktop et mobile, puis livre selon la sequence release: validation, commit implementation, preparation SemVer, commit version, push, CI verte, tag annote vX.Y.Z, verification release tagguee.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_005_identite_visuelle_et_navigation_de_lecture_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule`
- Primary task(s): `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee`

# AI Context
- Summary: Corriger le bandeau de lecture desktop sans regression mobile
- Keywords: scaffolded-backlog, corriger le bandeau de lecture desktop sans regression mobile, implementation-ready
- Use when: Implementing the scaffolded slice for Corriger le bandeau de lecture desktop sans regression mobile.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee`

# Notes
- Task `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee` was finished via `logics-manager flow finish task` on 2026-08-04.
