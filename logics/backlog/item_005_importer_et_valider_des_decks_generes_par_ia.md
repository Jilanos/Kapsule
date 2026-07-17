## item_005_importer_et_valider_des_decks_generes_par_ia - Importer et valider des decks generes par IA
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: import
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- L'interet du produit repose sur l'integration sans friction de decks produits hors app par des agents IA.

# Scope
- In:
  - Import d'un deck JSON via l'UI (upload) et via l'API backend.
  - Validation JSON Schema a l'import avec rapport d'erreurs lisible.
  - Gestion des images referencees par les fiches.
  - Test de bout en bout : un deck genere via SPEC.md s'importe et se lit.
- Out:
  - Marketplace ou partage de decks entre utilisateurs.

# Acceptance criteria
- AC1: Un deck valide s'importe par UI et par API et apparait dans la liste des decks.
- AC2: Un deck invalide est rejete avec les erreurs de validation affichees.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Un deck valide s'importe par UI et par API et apparait dans la liste des decks.
- request-AC5 -> This backlog slice. Proof: AC2: Un deck invalide est rejete avec les erreurs de validation affichees.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Primary task(s): `task_001_orchestrer_le_mvp_kapsule`

# AI Context
- Summary: Importer et valider des decks generes par IA
- Keywords: scaffolded-backlog, importer et valider des decks generes par ia, implementation-ready
- Use when: Implementing the scaffolded slice for Importer et valider des decks generes par IA.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
