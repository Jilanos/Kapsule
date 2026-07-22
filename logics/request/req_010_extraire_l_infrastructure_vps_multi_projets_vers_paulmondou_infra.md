## req_010_extraire_l_infrastructure_vps_multi_projets_vers_paulmondou_infra - Extraire l'infrastructure VPS multi-projets vers paulmondou-infra
> From version: 0.1.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: infra
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Separer l'infrastructure VPS globale du code applicatif Kapsule.
- Creer un dossier local /home/paul/dev/paulmondou-infra qui deviendra le repo d'exploitation multi-projets.
- Transférer les fichiers de deploiement globaux et sites statiques hors du repo Kapsule.
- Conserver dans Kapsule uniquement ce qui est necessaire a la construction de l'image applicative.
- Creer le repo GitHub associe a paulmondou-infra, puis committer et pousser les deux repos.

# Context
- Le VPS heberge Kapsule mais aussi le portail principal et plusieurs sites statiques.
- Le dossier deploy/ actuel contient le compose global, Caddy, les scripts d'exploitation, les sites statiques et les exemples d'environnement.
- Le Dockerfile racine de Kapsule reste applicatif et doit continuer a construire l'image de production Kapsule.
- La CI Kapsule doit continuer a valider format, tests, build, budget, audit, gitleaks et build/scan Docker.
- Le transfert doit eviter les secrets et laisser des READMEs coherents dans les deux repos.

# Acceptance criteria
- AC1: /home/paul/dev/paulmondou-infra existe, est initialise en repo Git et contient les fichiers d'infrastructure globaux necessaires au VPS multi-projets.
- AC2: Le repo Kapsule ne contient plus les assets d'exploitation globaux dans deploy/ ; il garde le Dockerfile applicatif et une documentation courte pointant vers paulmondou-infra.
- AC3: Les references documentaires de Kapsule vers l'ancien deploy/ sont mises a jour pour expliciter la separation app / infrastructure.
- AC4: Les validations Kapsule pertinentes passent localement apres extraction : format, tests, build, budget, audit production et Logics lint.
- AC5: Le nouveau repo infra contient une documentation d'exploitation minimale et une hygiene Git correcte (.gitignore, absence de secrets evidents, fichiers executables conserves).
- AC6: Les deux repos ont un commit dedie et sont pousses vers leurs remotes GitHub respectives.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_002_brief_infrastructure_vps_multi_projets_paulmondou_infra`
- Architecture decision(s): (none yet)

# References
- deploy/
- Dockerfile
- README.md#Exploiter / deployer
- logics/request/req_003_deploiement_vps_ovh.md
- logics/architecture/adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement.md

# AI Context
- Summary: Extraire l'infrastructure VPS multi-projets vers paulmondou-infra
- Keywords: request-chain-scaffold, extraire l'infrastructure vps multi-projets vers paulmondou-infra, development-ready
- Use when: You need to implement or review the scaffolded workflow for Extraire l'infrastructure VPS multi-projets vers paulmondou-infra.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_015_extraire_le_repo_infra_paulmondou_infra`
