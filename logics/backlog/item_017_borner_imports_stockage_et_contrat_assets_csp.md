## item_017_borner_imports_stockage_et_contrat_assets_csp - Borner imports, stockage et contrat assets-CSP
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 95
> Progress: 100%
> Complexity: High
> Theme: reliability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les imports et le stockage guest sont peu bornes et les images externes sont incompatibles avec la CSP infra.

# Scope
- In:
  - Quotas d'import et de taille
  - Limites de decks et nettoyage
  - Contrat image/CSP aligne
  - Tests de depassement
- Out:
  - Nouveau format de carte

# Acceptance criteria
- Un compte guest ne peut pas consommer un stockage non borne.
- Les images autorisees fonctionnent sous la CSP de production.

# AC Traceability
- request-Chaque lot est promu en tache Logics executable. -> This backlog slice. Proof: Un compte guest ne peut pas consommer un stockage non borne.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_securisation_et_fiabilisation_de_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_011_remedier_aux_constats_de_l_audit_technique_2026_07_25`
- Primary task(s): `task_012_orchestrer_la_remediation_de_l_audit_kapsule`

# AI Context
- Summary: Borner imports, stockage et contrat assets-CSP
- Keywords: scaffolded-backlog, borner imports, stockage et contrat assets-csp, implementation-ready
- Use when: Implementing the scaffolded slice for Borner imports, stockage et contrat assets-CSP.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: high
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_012_orchestrer_la_remediation_de_l_audit_kapsule` was finished via `logics-manager flow finish task` on 2026-07-25.
