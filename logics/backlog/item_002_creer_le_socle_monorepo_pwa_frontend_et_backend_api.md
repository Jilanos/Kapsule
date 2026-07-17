## item_002_creer_le_socle_monorepo_pwa_frontend_et_backend_api - Creer le socle monorepo : PWA frontend et backend API
> From version: 1.0.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: socle
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Aucun code n'existe ; il faut un socle frontend PWA et backend API pour porter toutes les slices suivantes.

# Scope
- In:
  - Monorepo avec frontend React+Vite (PWA : manifest, service worker) et backend Node leger.
  - Base de donnees SQLite derriere une frontiere d'adaptateur de stockage.
  - API REST minimale : decks, fiches, progression.
  - Tests et lint de base, scripts de dev.
- Out:
  - Deploiement production et CI/CD complets.
  - Authentification multi-utilisateurs avancee (un utilisateur simple suffit au MVP).

# Acceptance criteria
- AC1: Le frontend et le backend demarrent en local avec une seule commande chacun.
- AC2: L'app est installable en PWA et sert les decks depuis l'API.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Le frontend et le backend demarrent en local avec une seule commande chacun.
- request-AC6 -> This backlog slice. Proof: AC2: L'app est installable en PWA et sert les decks depuis l'API.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_000_cadrer_et_creer_le_mvp_kapsule`
- Primary task(s): `task_001_orchestrer_le_mvp_kapsule`

# AI Context
- Summary: Creer le socle monorepo : PWA frontend et backend API
- Keywords: scaffolded-backlog, creer le socle monorepo : pwa frontend et backend api, implementation-ready
- Use when: Implementing the scaffolded slice for Creer le socle monorepo : PWA frontend et backend API.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
