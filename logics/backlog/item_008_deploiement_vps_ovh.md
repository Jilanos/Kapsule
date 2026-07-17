## item_008_deploiement_vps_ovh - Deploiement VPS OVH
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Rendre Kapsule accessible en ligne (HTTPS, sous-domaine dedie) depuis n'importe quel appareil, notamment pour installer la PWA sur Android.
Mutualiser l'hebergement : le meme VPS doit pouvoir accueillir les autres projets de l'operateur (cashflow-lab, etc.) en sous-domaines, sans surcout par app.
Ne pas perdre les donnees : la base SQLite (comptes, progression, revisions) doit etre sauvegardee automatiquement et restaurable.
Deployer une nouvelle version en une commande, sans manipulation manuelle sur le serveur.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Un `Dockerfile` construit l'image de production (API Node + frontend buildé) et `docker compose up -d` demarre l'ensemble (app + Caddy) sur le VPS.
- AC2: L'app est accessible en HTTPS sur son sous-domaine avec certificat valide auto-renouvele ; la PWA s'installe depuis Android.
- AC3: La configuration Caddy permet d'ajouter une autre app sur un autre sous-domaine sans toucher au conteneur Kapsule.
- AC4: La base SQLite vit sur un volume persistant : `docker compose down && up` ne perd aucune donnee.
- AC5: Une sauvegarde quotidienne automatique de la base existe avec rotation (7 jours minimum) et une procedure de restauration documentee et testee.
- AC6: Un script `deploy.sh` met en production une nouvelle version en une commande depuis le poste de dev ; le README d'exploitation documente provision VPS, DNS, premiere mise en ligne et restauration.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Un `Dockerfile` construit l'image de production (API Node + frontend buildé) et `docker compose up -d` demarre l'ensemble (app + Caddy) sur le VPS.
- request-AC2 -> This backlog slice. Proof: AC2: L'app est accessible en HTTPS sur son sous-domaine avec certificat valide auto-renouvele ; la PWA s'installe depuis Android.
- request-AC3 -> This backlog slice. Proof: AC3: La configuration Caddy permet d'ajouter une autre app sur un autre sous-domaine sans toucher au conteneur Kapsule.
- request-AC4 -> This backlog slice. Proof: AC4: La base SQLite vit sur un volume persistant : `docker compose down && up` ne perd aucune donnee.
- request-AC5 -> This backlog slice. Proof: AC5: Une sauvegarde quotidienne automatique de la base existe avec rotation (7 jours minimum) et une procedure de restauration documentee et testee.
- request-AC6 -> This backlog slice. Proof: AC6: Un script `deploy.sh` met en production une nouvelle version en une commande depuis le poste de dev ; le README d'exploitation documente provision VPS, DNS, premiere mise en ligne et restauration.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_003_deploiement_vps_ovh.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Deploiement VPS OVH
- Keywords: backlog-groom, request, deploiement vps ovh, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Deploiement VPS OVH.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_003_deploiement_vps_ovh` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_003_deploiement_vps_ovh.md`.
- Generated locally by logics-manager.

# Tasks
- `task_004_deploiement_vps_ovh`
