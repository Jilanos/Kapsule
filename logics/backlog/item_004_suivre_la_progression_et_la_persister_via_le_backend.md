## item_004_suivre_la_progression_et_la_persister_via_le_backend - Suivre la progression et la persister via le backend
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: progression
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Sans persistance backend, la progression est perdue entre appareils et sessions, ce qui cree des frictions.

# Scope
- In:
  - Etats de fiche non vue / vue / apprise, marquage manuel 'apprise'.
  - Persistance de la progression cote backend et restauration au chargement.
  - Indicateurs de progression par deck (x/y apprises).
- Out:
  - Repetition espacee (SM-2) et rappels programmes.
  - Statistiques d'apprentissage detaillees.

# Acceptance criteria
- AC1: La progression survit a un rechargement complet et a un changement de navigateur.
- AC2: Chaque deck affiche son avancement agrege.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: La progression survit a un rechargement complet et a un changement de navigateur.
- request-AC4 -> This backlog slice. Proof: AC2: Chaque deck affiche son avancement agrege.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Primary task(s): `task_001_orchestrer_le_mvp_kapsule`

# AI Context
- Summary: Suivre la progression et la persister via le backend
- Keywords: scaffolded-backlog, suivre la progression et la persister via le backend, implementation-ready
- Use when: Implementing the scaffolded slice for Suivre la progression et la persister via le backend.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
