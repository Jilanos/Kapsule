## req_003_deploiement_vps_ovh - Deploiement VPS OVH
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: infra
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Rendre Kapsule accessible en ligne (HTTPS, sous-domaine dedie) depuis n'importe quel appareil, notamment pour installer la PWA sur Android.
- Mutualiser l'hebergement : le meme VPS doit pouvoir accueillir les autres projets de l'operateur (cashflow-lab, etc.) en sous-domaines, sans surcout par app.
- Ne pas perdre les donnees : la base SQLite (comptes, progression, revisions) doit etre sauvegardee automatiquement et restaurable.
- Deployer une nouvelle version en une commande, sans manipulation manuelle sur le serveur.

# Context
- Decision d'architecture (ADR 002) : VPS OVH (Debian/Ubuntu) + Docker Compose + Caddy en reverse proxy avec HTTPS automatique (Let's Encrypt), routage par sous-domaine extensible aux autres apps.
- SQLite reste la base (volume Docker persistant) ; sauvegarde quotidienne `sqlite3 .backup` avec rotation, copie hors-machine en follow-up (rclone).
- Durcissement de base : ufw, SSH par cle uniquement, unattended-upgrades.
- Prerequis operateur : commander le VPS OVH et disposer d'un nom de domaine avec acces DNS (sous-domaine type kapsule.<domaine>).
- L'app est aujourd'hui en deux processus dev (API 3001, Vite 5173) : en production, le frontend est buildé statique et servi derriere Caddy, l'API tourne en conteneur Node.
- Hors perimetre (follow-ups) : CI/CD complete (deploiement auto sur push), monitoring/alerting, migration Postgres.

# Acceptance criteria
- AC1: Un `Dockerfile` construit l'image de production (API Node + frontend buildé) et `docker compose up -d` demarre l'ensemble (app + Caddy) sur le VPS.
- AC2: L'app est accessible en HTTPS sur son sous-domaine avec certificat valide auto-renouvele ; la PWA s'installe depuis Android.
- AC3: La configuration Caddy permet d'ajouter une autre app sur un autre sous-domaine sans toucher au conteneur Kapsule.
- AC4: La base SQLite vit sur un volume persistant : `docker compose down && up` ne perd aucune donnee.
- AC5: Une sauvegarde quotidienne automatique de la base existe avec rotation (7 jours minimum) et une procedure de restauration documentee et testee.
- AC6: Un script `deploy.sh` met en production une nouvelle version en une commande depuis le poste de dev ; le README d'exploitation documente provision VPS, DNS, premiere mise en ligne et restauration.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# References
- `apps/backend/src/server.mjs` (point d'entree API)
- `apps/frontend/vite.config.mjs` (build PWA, proxy /api a reproduire dans Caddy)
- Prerequis operateur : VPS OVH commande + domaine avec acces DNS
- Dependance souhaitable : `req_001_authentification_multi_appareils` (ne pas exposer publiquement une instance sans auth)

# AI Context
- Summary: Mise en production de Kapsule sur VPS OVH avec Docker Compose, Caddy HTTPS, sauvegardes SQLite et script de deploiement.
- Keywords: deploiement, vps, ovh, docker, caddy, https, backup sqlite
- Use when: Implementing or reviewing the v0.2 deployment work.
- Skip when: The change concerns application features (auth, SM-2, lecteur).

# Backlog
- none
- `item_008_deploiement_vps_ovh`
