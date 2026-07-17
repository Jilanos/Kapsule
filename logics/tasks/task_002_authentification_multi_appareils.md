## task_002_authentification_multi_appareils - Authentification multi-appareils
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_006_authentification_multi_appareils`

# Acceptance criteria
- AC1: Un utilisateur peut creer un compte (email + mot de passe), se connecter et se deconnecter ; le mot de passe est hache (scrypt), jamais stocke en clair.
- AC2: Chaque appareil obtient son propre token de session revocable ; la deconnexion d'un appareil n'affecte pas les autres.
- AC3: Toutes les routes de progression/revisions exigent une session valide et ne renvoient que les donnees de l'utilisateur authentifie.
- AC4: La progression existante de l'utilisateur `default` est migree vers le premier compte cree, sans perte.
- AC5: `KAPSULE_REGISTRATION=closed` ferme l'inscription avec un message clair, sans bloquer les connexions existantes.
- AC6: Le frontend gere le cycle complet : ecran connexion/inscription, expiration de session (retour au login sans crash), affichage de l'utilisateur connecte.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_002_authentification_multi_appareils.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_002_authentification_multi_appareils.md` after implementation.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/backend/src/auth.mjs` (scrypt hash/verify, register/login/logout) + routes `/api/auth/*` ; tests auth (hachage, inscription/connexion/deconnexion, email duplique, mdp court).
- request-AC2 -> This task. Proof: sessions par token opaque en base (`sessions`), `createSession` par appareil, `deleteSession` ; test "deux appareils, deconnexion de l'un n'affecte pas l'autre".
- request-AC3 -> This task. Proof: middleware `requireAuth` (Bearer) sur toutes les routes decks/progression ; progression cloisonnee par `req.user.id` ; test "sans token -> 401" + cloisonnement A/B.
- request-AC4 -> This task. Proof: migration de la progression `default` vers le premier compte cree dans `AuthStore.register` ; test dedie AC4.
- request-AC5 -> This task. Proof: `registrationOpen()` + garde sur `/api/auth/register` ; test `KAPSULE_REGISTRATION=closed` (403 a l'inscription, 200 a la connexion).
- request-AC6 -> This task. Proof: `apps/frontend/src/auth/` (AuthContext restauration/expiration, AuthScreen login/register), garde dans `App.jsx`, header utilisateur + deconnexion ; build frontend vert.

# Report
- Auth livree : schema DB migre (migrations versionnees via PRAGMA user_version ; tables users/sessions), hachage scrypt natif, sessions par appareil revocables, cloisonnement de la progression par utilisateur, migration `default` -> premier compte, inscription fermable.
- Frontend : contexte d'auth (restauration de session, gestion 401 -> retour login), ecran connexion/inscription, header avec email + deconnexion.
- Validation : backend 16 tests OK (dont 7 auth), schema 10, frontend SSR OK ; smoke live (401 sans token, register, decks avec token).

# AI Context
- Summary: Implement authentification multi-appareils.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_001_authentification_multi_appareils`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
