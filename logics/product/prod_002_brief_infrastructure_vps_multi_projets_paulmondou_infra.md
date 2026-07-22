## prod_002_brief_infrastructure_vps_multi_projets_paulmondou_infra - Brief - Infrastructure VPS multi-projets paulmondou-infra
> Date: 2026-07-22
> Status: Proposed
> Related request: `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`
> Related backlog: `item_015_extraire_le_repo_infra_paulmondou_infra`
> Related task: `task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Isoler l'orchestration VPS commune dans un repo infra reutilisable par plusieurs projets.

# Goals
- Clarifier la frontiere entre l'application Kapsule et l'infrastructure de production.
- Permettre au VPS d'heberger plusieurs projets sans faire de Kapsule le repo d'autorite de l'infra.
- Rendre les deploiements et sauvegardes comprehensibles depuis un repo dedie.

# Non-goals
- Mettre en place un deploiement automatique depuis GitHub Actions.
- Changer l'architecture runtime Docker/Caddy existante.
- Migrer la base de donnees ou le stockage de Kapsule.

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`
- Task back-reference: `task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra`
