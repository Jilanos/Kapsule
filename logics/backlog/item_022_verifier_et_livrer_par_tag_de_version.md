## item_022_verifier_et_livrer_par_tag_de_version - Verifier et livrer par tag de version
> From version: 1.0.4
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Release
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Le changement doit respecter la politique canonique de livraison finale par tag de version plutot qu'une simple modification locale.

# Scope
- In:
  - Executer les validations frontend pertinentes.
  - Verifier visuellement les rendus desktop et mobile.
  - Preparer la prochaine version SemVer dans les surfaces canoniques.
  - Suivre la sequence release definie dans logics/instructions.md.
  - Consigner SHA, CI, tag et resultat release dans le closeout Logics.
- Out:
  - Forcer un tag avant CI verte.
  - Retagger une version existante.
  - Faire un force-push de release.

# Acceptance criteria
- AC1: Les validations locales passent avant commit.
- AC2: La version SemVer choisie est coherente avec le changement et preparee dans les surfaces canoniques.
- AC3: Le tag annote vX.Y.Z est cree seulement apres push et CI verte sur le commit de preparation de version.
- AC4: Le workflow declenche par tag est verifie et documente dans la tache Logics.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Les validations locales passent avant commit.
- request-AC2 -> This backlog slice. Evidence needed: Sur mobile, le comportement et le rendu satisfaisants du bandeau sont preserves.
- request-AC3 -> This backlog slice. Evidence needed: Les assets Kapsule sont copies dans le public frontend, l'embleme apparait en haut a gauche et le favicon de l'onglet utilise l'icone Kapsule appropriee.
- request-AC4 -> This backlog slice. Evidence needed: Un embleme Paulmondou apparait dans la barre superieure a droite de la deconnexion et ouvre https://paulmondou.fr via un lien accessible.
- request-AC5 -> This backlog slice. Evidence needed: Les images references sont servies par le frontend sans chemin local absolu ni dependance au dossier personnel d'icones.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_005_identite_visuelle_et_navigation_de_lecture_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_013_corriger_le_bandeau_de_lecture_desktop_et_aligner_l_identite_visuelle_kapsule`
- Primary task(s): `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee`

# AI Context
- Summary: Verifier et livrer par tag de version
- Keywords: scaffolded-backlog, verifier et livrer par tag de version, implementation-ready
- Use when: Implementing the scaffolded slice for Verifier et livrer par tag de version.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee`

# Notes
- Task `task_014_orchestrer_correction_bandeau_branding_kapsule_et_release_tagguee` was finished via `logics-manager flow finish task` on 2026-08-04.
