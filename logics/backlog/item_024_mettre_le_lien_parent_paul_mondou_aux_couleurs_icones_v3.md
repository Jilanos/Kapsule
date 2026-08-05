## item_024_mettre_le_lien_parent_paul_mondou_aux_couleurs_icones_v3 - Mettre le lien parent Paul Mondou aux couleurs Icones V3
> From version: 1.0.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: Low
> Theme: Navigation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Le lien vers Paul Mondou doit etre identifiable comme un lien parent commun et utiliser l'identite Icones V3.

# Scope
- In:
  - Localiser le lien parent actuel vers Paul Mondou.
  - Remplacer son icone, embleme ou avatar par l'asset Paul Mondou du corpus Icones V3.
  - Conserver la cible d'URL deja definie par le repo ou la configuration de deploiement.
- Out:
  - Changer la structure de navigation au-dela du lien parent.
  - Ajouter des liens vers les autres sites enfants depuis Kapsule.

# Acceptance criteria
- AC1: Le lien parent reste accessible au clavier et conserve son libelle accessible.
- AC2: Le visuel du lien parent provient du corpus Paul Mondou Icones V3 copie dans le repo.
- AC3: La cible du lien parent n'est pas regresse par le remplacement visuel.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Le lien parent reste accessible au clavier et conserve son libelle accessible.
- request-AC4 -> This backlog slice. Proof: AC2: Le visuel du lien parent provient du corpus Paul Mondou Icones V3 copie dans le repo.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_006_identite_kapsule_alignee_sur_icones_v3`
- Architecture decision(s): (none yet)
- Request: `req_014_integrer_les_icones_icones_v3_et_le_lien_parent_paul_mondou_dans_kapsule`
- Primary task(s): `task_015_orchestrer_l_integration_icones_v3_dans_kapsule`

# AI Context
- Summary: Mettre le lien parent Paul Mondou aux couleurs Icones V3
- Keywords: scaffolded-backlog, mettre le lien parent paul mondou aux couleurs icones v3, implementation-ready
- Use when: Implementing the scaffolded slice for Mettre le lien parent Paul Mondou aux couleurs Icones V3.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - la navigation parent est une exigence transversale entre sites
- Rationale: Set by scaffold input or defaulted for grooming.
