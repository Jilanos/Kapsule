## item_021_integrer_les_emblemes_kapsule_et_paulmondou_dans_la_barre_superieure - Integrer les emblemes Kapsule et Paulmondou dans la barre superieure
> From version: 1.0.4
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Branding et navigation parent
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- L'application n'utilise pas encore les assets d'identite Kapsule demandes et ne propose pas de lien visuel vers paulmondou.fr.

# Scope
- In:
  - Copier les assets selectionnes dans un dossier public du frontend.
  - Mettre a jour le favicon de l'onglet avec l'icone Kapsule.
  - Afficher l'embleme Kapsule en haut a gauche.
  - Ajouter un lien accessible vers https://paulmondou.fr avec l'embleme Paulmondou pres de la deconnexion.
- Out:
  - Creer de nouveaux logos.
  - Dependre de chemins locaux absolus au runtime.
  - Modifier l'identite des autres projets.

# Acceptance criteria
- AC1: Les assets Kapsule et Paulmondou sont servis depuis apps/frontend/public ou une surface equivalente versionnee.
- AC2: Le favicon charge une ressource Kapsule dans apps/frontend/index.html.
- AC3: La top bar affiche l'embleme Kapsule a gauche et l'embleme Paulmondou a droite avec un lien vers https://paulmondou.fr.
- AC4: Les images ont des textes alternatifs ou libelles accessibles adaptes.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Les assets Kapsule et Paulmondou sont servis depuis apps/frontend/public ou une surface equivalente versionnee.
- request-AC4 -> This backlog slice. Proof: AC3: La top bar affiche l'embleme Kapsule a gauche et l'embleme Paulmondou a droite avec un lien vers https://paulmondou.fr.
- request-AC5 -> This backlog slice. Proof: AC1: Les assets Kapsule et Paulmondou sont servis depuis apps/frontend/public ou une surface equivalente versionnee, sans chemin local runtime.
- request-AC2 -> This backlog slice. Evidence needed: Sur mobile, le comportement et le rendu satisfaisants du bandeau sont preserves.
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
- Summary: Integrer les emblemes Kapsule et Paulmondou dans la barre superieure
- Keywords: scaffolded-backlog, integrer les emblemes kapsule et paulmondou dans la barre superieure, implementation-ready
- Use when: Implementing the scaffolded slice for Integrer les emblemes Kapsule et Paulmondou dans la barre superieure.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee`

# Notes
- Task `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee` was finished via `logics-manager flow finish task` on 2026-08-04.
