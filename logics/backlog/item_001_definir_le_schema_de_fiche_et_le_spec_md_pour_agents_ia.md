## item_001_definir_le_schema_de_fiche_et_le_spec_md_pour_agents_ia - Definir le schema de fiche et le SPEC.md pour agents IA
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: contrat-contenu
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Sans contrat de contenu ferme, le rendu varie et l'import de fiches generees par IA devient fragile.

# Scope
- In:
  - JSON Schema du format fiche et deck (titre, tags, duree, niveau, sections typees, images, quiz).
  - SPEC.md : consignes pedagogiques et structurelles utilisables comme prompt agent IA.
  - Validateur d'import avec messages d'erreur exploitables.
  - Deck d'exemple valide servant de fixture.
- Out:
  - Versioning avance du schema et migrations de fiches.

# Acceptance criteria
- AC1: Le JSON Schema valide le deck d'exemple et rejette des fiches malformees avec des erreurs claires.
- AC2: SPEC.md permet a un agent IA de produire un deck importable sans retouche.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Le JSON Schema valide le deck d'exemple et rejette des fiches malformees avec des erreurs claires.
- request-AC5 -> This backlog slice. Proof: AC2: SPEC.md permet a un agent IA de produire un deck importable sans retouche.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Primary task(s): `task_001_orchestrer_le_mvp_kapsule`

# AI Context
- Summary: Definir le schema de fiche et le SPEC.md pour agents IA
- Keywords: scaffolded-backlog, definir le schema de fiche et le spec.md pour agents ia, implementation-ready
- Use when: Implementing the scaffolded slice for Definir le schema de fiche et le SPEC.md pour agents IA.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
