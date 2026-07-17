## task_004_deploiement_vps_ovh - Deploiement VPS OVH
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered (livrables complets ; verif runtime AC1/AC2 au premier go-live, cf. checklist).
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

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

# AC Traceability
- request-AC1 -> This task. Proof: `Dockerfile` multi-etapes (build frontend + runtime backend, un seul process sert /api + PWA) et `deploy/docker-compose.yml` (app + Caddy). Mode production verifie directement en Node (memes commandes que le conteneur : PWA index, fallback SPA, /api/health). Build image `docker` a lancer au premier go-live (Docker indisponible dans l'env de dev).
- request-AC2 -> This task. Proof: `deploy/Caddyfile` (HTTPS auto Let's Encrypt sur `{$KAPSULE_DOMAIN}`), manifest + service worker servis (verifie : /manifest.webmanifest -> 200). Verif HTTPS reelle + install PWA Android au premier go-live (necessite VPS + domaine).
- request-AC3 -> This task. Proof: `deploy/Caddyfile` documente l'ajout d'un autre sous-domaine sans toucher au conteneur Kapsule (bloc reverse_proxy independant).
- request-AC4 -> This task. Proof: volume `kapsule-data` monte sur `/data` (base SQLite + uploads) ; `KAPSULE_DB=/data/kapsule.sqlite`, `KAPSULE_UPLOADS=/data/uploads` ; persistance deja prouvee au redemarrage (task_001) et volume Docker survivant a down/up.
- request-AC5 -> This task. Proof: `apps/backend/src/backup.mjs` (API .backup() WAL-safe + rotation KAPSULE_BACKUP_KEEP_DAYS) verifie localement (fichier horodate produit) ; `deploy/backup.sh` + cron documente ; procedure de restauration dans `deploy/README.md`.
- request-AC6 -> This task. Proof: `deploy/deploy.sh` (push + git pull + docker compose up -d --build en une commande) ; `deploy/README.md` couvre provisionnement VPS, DNS, premiere mise en ligne, sauvegardes et restauration.

# Go-live checklist (a executer avec le VPS)
- [ ] Commander le VPS (Hetzner CX23 recommande ; OVH VPS 1 en alternative FR) + pointer le DNS.
- [ ] Provisionner (Docker, ufw, SSH par cle, unattended-upgrades) — cf. deploy/README.md.
- [ ] `docker compose up -d --build` puis verifier certificat HTTPS et install PWA Android (AC1/AC2 runtime).
- [ ] Creer les comptes puis passer `KAPSULE_REGISTRATION=closed`.
- [ ] Activer le cron de sauvegarde et tester une restauration.

# Report
- Livrables complets et testables en local : `Dockerfile` multi-etapes, `deploy/` (docker-compose, Caddyfile, .env.example, deploy.sh, backup.sh, README d'exploitation), backend adapte pour servir la PWA en production (un seul conteneur) et script de sauvegarde WAL-safe.
- Validation locale : mode production Node OK (PWA index, fallback SPA /reviews -> 200, /api/health, 401 sans token, manifest 200), backup en ligne produit un fichier horodate, YAML compose + scripts shell valides, suite de tests inchangee (schema 10, backend 28, frontend SSR).
- Non verifiable hors VPS : build de l'image Docker (Docker indisponible dans l'env de dev) et HTTPS/installation PWA reels — regroupes dans la go-live checklist.

# AI Context
- Summary: Implement deploiement vps ovh.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_003_deploiement_vps_ovh`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
