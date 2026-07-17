## task_004_deploiement_vps_ovh - Deploiement VPS OVH
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_008_deploiement_vps_ovh`

# Acceptance criteria
- AC1: Un `Dockerfile` construit l'image de production (API Node + frontend buildé) et `docker compose up -d` demarre l'ensemble (app + Caddy) sur le VPS.
- AC2: L'app est accessible en HTTPS sur son sous-domaine avec certificat valide auto-renouvele ; la PWA s'installe depuis Android.
- AC3: La configuration Caddy permet d'ajouter une autre app sur un autre sous-domaine sans toucher au conteneur Kapsule.
- AC4: La base SQLite vit sur un volume persistant : `docker compose down && up` ne perd aucune donnee.
- AC5: Une sauvegarde quotidienne automatique de la base existe avec rotation (7 jours minimum) et une procedure de restauration documentee et testee.
- AC6: Un script `deploy.sh` met en production une nouvelle version en une commande depuis le poste de dev ; le README d'exploitation documente provision VPS, DNS, premiere mise en ligne et restauration.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_004_deploiement_vps_ovh.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_004_deploiement_vps_ovh.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement deploiement vps ovh.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_003_deploiement_vps_ovh`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
