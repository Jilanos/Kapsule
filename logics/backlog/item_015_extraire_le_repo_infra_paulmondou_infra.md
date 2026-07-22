## item_015_extraire_le_repo_infra_paulmondou_infra - Extraire le repo infra paulmondou-infra
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: infra
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Le repo Kapsule porte aujourd'hui des fichiers qui concernent le VPS global et plusieurs sites, ce qui brouille la responsabilite du repo applicatif.

# Scope
- In:
  - Creer /home/paul/dev/paulmondou-infra.
  - Deplacer deploy/Caddyfile, docker-compose.yml, scripts, .env.example et sites statiques vers le nouveau repo.
  - Adapter la documentation Kapsule pour renvoyer vers le repo infra.
  - Ajouter une documentation et une hygiene Git minimale au repo infra.
  - Valider localement, committer et pousser les deux repos.
- Out:
  - Automatiser le deploiement CI/CD.
  - Modifier les DNS, les secrets VPS ou l'etat distant du serveur.
  - Changer les domaines publics ou le routage Caddy fonctionnel hors besoin de chemin.

# Acceptance criteria
- AC1: Les fichiers infra globaux sont presents dans paulmondou-infra avec leur arborescence cible et les scripts restent executables.
- AC2: Kapsule garde un README ou une note d'exploitation courte qui indique que l'orchestration VPS vit dans paulmondou-infra.
- AC3: Les commandes de validation Kapsule passent et le nouveau repo ne contient pas de secret evident.
- AC4: Un commit existe dans Kapsule pour l'extraction documentaire/fichiers, un commit existe dans paulmondou-infra pour l'import initial, et les deux remotes sont poussees.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Les fichiers infra globaux sont presents dans paulmondou-infra avec leur arborescence cible et les scripts restent executables.
- request-AC2 -> This backlog slice. Proof: AC2: Kapsule garde un README ou une note d'exploitation courte qui indique que l'orchestration VPS vit dans paulmondou-infra.
- request-AC3 -> This backlog slice. Proof: AC3: Les commandes de validation Kapsule passent et le nouveau repo ne contient pas de secret evident.
- request-AC4 -> This backlog slice. Proof: AC4: Un commit existe dans Kapsule pour l'extraction documentaire/fichiers, un commit existe dans paulmondou-infra pour l'import initial, et les deux remotes sont poussees.
- request-AC5 -> This backlog slice. Proof: AC4: Un commit existe dans Kapsule pour l'extraction documentaire/fichiers, un commit existe dans paulmondou-infra pour l'import initial, et les deux remotes sont poussees.
- request-AC6 -> This backlog slice. Proof: AC4: Un commit existe dans Kapsule pour l'extraction documentaire/fichiers, un commit existe dans paulmondou-infra pour l'import initial, et les deux remotes sont poussees.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_brief_infrastructure_vps_multi_projets_paulmondou_infra`
- Architecture decision(s): (none yet)
- Request: `req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra`
- Primary task(s): `task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra`

# AI Context
- Summary: Extraire le repo infra paulmondou-infra
- Keywords: scaffolded-backlog, extraire le repo infra paulmondou-infra, implementation-ready
- Use when: Implementing the scaffolded slice for Extraire le repo infra paulmondou-infra.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra`

# Notes
- Task `task_011_orchestrer_l_extraction_de_l_infra_vps_vers_paulmondou_infra` was finished via `logics-manager flow finish task` on 2026-07-22.
