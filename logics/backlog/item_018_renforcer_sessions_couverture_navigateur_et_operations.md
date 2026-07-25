## item_018_renforcer_sessions_couverture_navigateur_et_operations - Renforcer sessions, couverture navigateur et operations
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: operations
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les tokens Bearer persistent 90 jours, CORS est large et les parcours E2E et readiness restent incomplets.

# Scope
- In:
  - Expiration et rotation sessions
  - CORS restreint
  - E2E navigateur
  - Lifecycle assets, readiness, bootstrap admin et supply chain
- Out:
  - Refonte de l'authentification sociale

# Acceptance criteria
- La session et CORS respectent le modele de menace defini.
- Les parcours critiques et la readiness production sont testes.

# AC Traceability
- request-Les risques P0 sont planifies avant les ameliorations P1. -> This backlog slice. Proof: La session et CORS respectent le modele de menace defini.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_securisation_et_fiabilisation_de_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_011_remedier_aux_constats_de_l_audit_technique_2026_07_25`
- Primary task(s): `task_012_orchestrer_la_remediation_de_l_audit_kapsule`

# AI Context
- Summary: Renforcer sessions, couverture navigateur et operations
- Keywords: scaffolded-backlog, renforcer sessions, couverture navigateur et operations, implementation-ready
- Use when: Implementing the scaffolded slice for Renforcer sessions, couverture navigateur et operations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_012_orchestrer_la_remediation_de_l_audit_kapsule` was finished via `logics-manager flow finish task` on 2026-07-25.
