## task_005_roles_utilisateurs_et_visibilite_des_decks - Roles utilisateurs et visibilite des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: ajout de la traceabilite AC manquante pour l'audit.

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_009_roles_utilisateurs_et_visibilite_des_decks`

# Acceptance criteria
- AC1: Chaque utilisateur a un role 'guest', 'master' ou 'admin' (defaut 'guest' a l'inscription) ; chaque deck a un proprietaire et une visibilite 'private', 'general' ou 'master'.
- AC2: Le listing et la lecture des decks respectent la visibilite : un invite voit les decks generaux et ses decks prives ; un maitre voit en plus les decks maitres ; l'administrateur voit tout.
- AC3: La creation respecte les roles : un invite ne peut creer que des decks prives ; maitres et administrateur peuvent aussi creer des decks generaux et maitres.
- AC4: Seul l'administrateur peut supprimer un deck ou changer sa visibilite ; toute autre tentative est refusee (403) cote API.
- AC5: Les decks existants en production restent visibles par tous apres migration (visibilite 'general', proprietaire administrateur) ; aucune progression ni revision n'est perdue.
- AC6: Le frontend reflete les droits : choix de visibilite a la creation selon le role, badge de visibilite sur les decks, actions supprimer/changer la visibilite visibles uniquement pour l'administrateur.
- AC7: En production, paul.mondou12@gmail.com est administrateur et a.agostini.fr@gmail.com est maitre.

# Validation
- Tests backend verts (`npm test` dans `apps/backend`), y compris les nouveaux tests de la matrice des droits (visibilite, creation, suppression, changement de visibilite, cas 403).
- Build frontend vert (`npm run build` dans `apps/frontend`).
- Smoke live apres deploiement : un invite ne voit pas les decks maitres ni les decks prives d'autrui ; suppression refusee (403) pour non-admin.
- Verification en production : roles de paul.mondou12@gmail.com (admin) et a.agostini.fr@gmail.com (master) ; decks existants en 'general' avec proprietaire admin.
- Run `logics-manager lint --require-status`.
- Use `logics-manager flow progress task task_005_roles_utilisateurs_et_visibilite_des_decks --progress <n>%` during multi-wave work.
- Run `logics-manager flow finish task task_005_roles_utilisateurs_et_visibilite_des_decks` after implementation.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Plan
- Vague 1 (schema + store) : migration 4 dans `apps/backend/src/db.mjs` (users.role, decks.owner_id, decks.visibility, index) ; requetes de listing/lecture filtrees par role et proprietaire dans `apps/backend/src/store.mjs` ; tests de migration et de filtre.
- Vague 2 (enforcement API) : `apps/backend/src/server.mjs` — creation limitee selon role, suppression admin uniquement, route `PATCH /api/decks/:id/visibility` admin uniquement, regles d'edition (proprietaire/maitre/admin) ; role expose dans la reponse auth ; tests 403 sur toute la matrice.
- Vague 3 (frontend) : role dans le contexte auth, choix de visibilite a la creation selon role, badge de visibilite sur les decks, actions admin (supprimer, changer visibilite) masquees sinon.
- Vague 4 (production) : deploiement via `deploy/deploy.sh` (la migration 4 s'applique au demarrage) ; SQL ponctuel d'attribution des roles (AC7) et bascule des decks existants en 'general' proprietaire admin (AC5) ; smoke live.

# Report
- Vague 1 (schema + store) livree : migration 4 (`users.role` guest/master/admin, `decks.owner_id`, `decks.visibility` private/general/master, index `idx_decks_owner`) ; `store.listDecks(viewer)` filtre par role/proprietaire cote SQL ; `getDeckAccess`, `setDeckVisibility` ; `importDeck(deck, {ownerId, visibility})` (owner/visibilite preserves a la mise a jour).
- Vague 2 (enforcement API) : module pur `permissions.mjs` (canView/canEdit/canCreateWithVisibility/canDelete/canChangeVisibility) ; role expose par auth (register/login/getUserById) ; routes decks gardees (list filtree, GET 404 si non visible, POST create selon role + owner=user, edit selon droits, DELETE admin-only 403, nouvelle route `PATCH /api/decks/:id/visibility` admin-only).
- Vague 3 (frontend) : `api.importDeck(deck, visibility)`, `changeDeckVisibility` ; `lib/visibility.js` (libelles + droits UI) ; selecteur de visibilite a l'import selon role ; badge de visibilite (DeckList + DeckReader) ; barre admin (changer visibilite / supprimer) reservee a l'admin ; CSS dedie.
- Validation : backend 35/35 tests verts (dont 7 nouveaux sur la matrice des droits) avec le fixture de deck committe ; build frontend vert.
- Vague 4 (production) livree le 2026-07-18 : sauvegarde pre-migration, deploiement (migration 4 appliquee au demarrage -> user_version 4), SQL d'attribution des roles (paul.mondou12 = admin, a.agostini = master) et rattachement des 6 decks existants en general/owner=admin (AC5/AC7). Smoke live HTTPS OK : nouvel inscrit = guest ne voyant que les 6 decks generaux ; creation general/suppression/changement de visibilite -> 403 ; creation private -> 201. Comptes jetables de smoke nettoyes.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_009_roles_utilisateurs_et_visibilite_des_decks`
- Related request(s): `req_004_roles_utilisateurs_et_visibilite_des_decks`

# AI Context
- Summary: Implement roles utilisateurs et visibilite des decks.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_004_roles_utilisateurs_et_visibilite_des_decks`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# AC Traceability
- AC1 -> This task. Proof: migration 4 ajoute `users.role`, `decks.owner_id` et `decks.visibility`; nouvel inscrit `guest` par defaut; tests backend verts.
- AC2 -> This task. Proof: listing/lecture filtres par `canViewDeck` et par requetes SQL viewer-aware; tests backend guest/master/admin verts.
- AC3 -> This task. Proof: creation gardee par `canCreateWithVisibility`; tests 403/201 selon role et visibilite verts.
- AC4 -> This task. Proof: suppression et changement de visibilite reserves a l'admin; tests negatifs 403 verts.
- AC5 -> This task. Proof: migration production du 2026-07-18, six decks existants rattaches en `general` avec proprietaire admin; smoke live sans perte constatee.
- AC6 -> This task. Proof: frontend avec role auth, selecteur de visibilite selon droits, badges et barre admin conditionnelle; build frontend vert.
- AC7 -> This task. Proof: verification production du 2026-07-18, paul.mondou12@gmail.com admin et a.agostini.fr@gmail.com master.
