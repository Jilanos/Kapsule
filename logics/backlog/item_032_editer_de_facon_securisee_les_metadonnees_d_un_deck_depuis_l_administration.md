## item_032_editer_de_facon_securisee_les_metadonnees_d_un_deck_depuis_l_administration - Editer de facon securisee les metadonnees d'un deck depuis l'administration
> From version: 1.0.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Mutation de contenu admin
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- La console ne permet aujourd'hui que de changer la visibilité ou supprimer un deck ; le titre et la description sont immuables depuis l'interface.
- Une édition administrative doit rester étroitement bornée et laisser une trace exploitable.

# Scope
- In:
  - Endpoint admin PATCH dédié à title, description et visibility, avec allowlist stricte, validation et réponse de deck limitée.
  - Mise à jour transactionnelle de la date de modification et événement d'audit avant/après sans secret ni contenu de cartes.
  - Formulaire ou dialogue d'édition accessible dans la liste des contenus, avec annulation, erreurs et rechargement du listing.
  - Tests d'autorisation, de validation, d'atomicité, d'audit et de parcours UI.
- Out:
  - Edition de l'identifiant, du propriétaire, des cartes, du JSON source, des assets ou des historiques de progression/révision.
  - Suppression sans confirmation identifiante ou modification des règles de suppression existantes.

# Acceptance criteria
- AC1: Seul un admin authentifié peut appeler la mutation ; guest et master reçoivent 403 et les entrées inconnues ou non autorisées sont rejetées en 400.
- AC2: Le serveur n'accepte et ne persiste que title, description et visibility selon des contraintes explicites ; l'identifiant, le propriétaire, les cartes et les assets restent inchangés.
- AC3: Une édition valide met à jour le deck de manière atomique, actualise updatedAt et écrit un événement d'audit avec acteur, cible et état avant/après borné.
- AC4: Depuis /admin, l'administrateur peut ouvrir l'édition, modifier les trois champs autorisés, enregistrer ou annuler et reçoit un retour accessible ; la liste reflète l'état serveur après succès.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: `PATCH /api/admin/decks/:deckId` passe par `requireAuth` + `requireAdmin` (401 sans session, 403 pour guest et master) et `parseDeckMetadataPatch` rejette en 400 toute cle hors title/description/visibility, y compris `id`, `ownerId` et `cards`. Teste par `apps/backend/test/admin-deck-edit.test.mjs` (AC1). Enonce d'origine — AC1: Seul un admin authentifié peut appeler la mutation ; guest et master reçoivent 403 et les entrées inconnues ou non autorisées sont rejetées en 400.
- request-AC5 -> This backlog slice. Proof: la mutation ecrit colonne, `decks.data` et `updated_at` dans une seule transaction avec l'audit `deck.metadata.update` ; identifiant, proprietaire, date de creation et fiches sont verifies inchanges, et la reponse est une projection bornee. Le dialogue `EditDeckDialog.jsx` expose trois champs etiquetes, une annulation et une alerte d'erreur, et recharge le listing apres succes. Teste par `apps/backend/test/admin-deck-edit.test.mjs` (AC2/AC3) et `apps/frontend/test/admin-dialog.test.mjs`. Enonce d'origine — AC2: Le serveur n'accepte et ne persiste que title, description et visibility selon des contraintes explicites ; l'identifiant, le propriétaire, les cartes et les assets restent inchangés.
- request-AC4 -> This backlog slice. Evidence needed: Les trois assets visuels actuellement affichés (Kapsule, Paul Mondou, Gnosis), le favicon et les icônes PWA dérivées sont remplacés depuis les masters Icones V3 correspondants ; aucun asset d'une autre marque du lot n'est affiché par Kapsule.
- request-AC6 -> This backlog slice. Evidence needed: La livraison couvre tests frontend/backend, build et contrôles Logics ; toute source temporaire d'assets externe est retirée ou ignorée avant commit afin que seuls les assets versionnés nécessaires restent dans le dépôt.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_console_d_administration_exploitable_et_identite_icones_v3_complete`
- Architecture decision(s): (none yet)
- Request: `req_019_rendre_la_console_d_administration_pleine_largeur_editable_et_alignee_sur_icones_v3`
- Primary task(s): `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3`

# AI Context
- Summary: Editer de facon securisee les metadonnees d'un deck depuis l'administration
- Keywords: scaffolded-backlog, editer de facon securisee les metadonnees d'un deck depuis l'administration, implementation-ready
- Use when: Implementing the scaffolded slice for Editer de facon securisee les metadonnees d'un deck depuis l'administration.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - l'administrateur doit pouvoir corriger un deck sans intervention SQL ni manipulation de contenu brut.
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3`

# Notes
- Task `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3` was finished via `logics-manager flow finish task` on 2026-08-08.
