## item_023_remplacer_favicon_et_embleme_kapsule_par_icones_v3 - Remplacer favicon et embleme Kapsule par Icones V3
> From version: 1.0.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Branding
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les assets visibles de Kapsule doivent etre alignes sur le corpus Icones V3 sans lire le dossier local en production.

# Scope
- In:
  - Identifier les fichiers favicon, manifest, metadata et composants d'embleme existants.
  - Copier les assets Kapsule pertinents depuis Icones V3 dans l'emplacement public ou source du repo.
  - Mettre a jour les references pour light/dark quand le design system les supporte.
- Out:
  - Changer la palette globale ou la composition de l'interface.
  - Introduire une dependance externe au dossier Icones V3 au runtime.

# Acceptance criteria
- AC1: Le favicon et les metadata d'onglet resolvent l'icone Kapsule Icones V3.
- AC2: L'embleme applicatif visible utilise les fichiers Kapsule Icones V3.
- AC3: Le build ou la verification statique confirme que les assets references existent dans le repo.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Le favicon et les metadata d'onglet resolvent l'icone Kapsule Icones V3.
- request-AC2 -> This backlog slice. Proof: AC2: L'embleme applicatif visible utilise les fichiers Kapsule Icones V3.
- request-AC4 -> This backlog slice. Proof: AC3: Le build ou la verification statique confirme que les assets references existent dans le repo.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_006_identite_kapsule_alignee_sur_icones_v3`
- Architecture decision(s): (none yet)
- Request: `req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule`
- Primary task(s): `task_015_orchestrer_l_integration_icones_v3_dans_kapsule`

# AI Context
- Summary: Remplacer favicon et embleme Kapsule par Icones V3
- Keywords: scaffolded-backlog, remplacer favicon et embleme kapsule par icones v3, implementation-ready
- Use when: Implementing the scaffolded slice for Remplacer favicon et embleme Kapsule par Icones V3.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - visible sur toutes les sessions et prealable a la coherence de marque
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_015_orchestrer_l_integration_icones_v3_dans_kapsule`

# Notes
- Task `task_015_orchestrer_l_integration_icones_v3_dans_kapsule` was finished via `logics-manager flow finish task` on 2026-08-05.
