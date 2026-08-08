## item_031_etendre_et_rendre_lisible_la_console_d_administration - Etendre et rendre lisible la console d'administration
> From version: 1.0.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Ergonomie administration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- La console ne tire pas suffisamment parti du desktop et la règle de coupure de l'email rend les comptes difficiles à identifier.
- Les mutations de compte déjà disponibles doivent être vérifiées et rendues clairement opérables, sans contourner leurs invariants serveur.

# Scope
- In:
  - Adapter la largeur du conteneur /admin et la stratégie de défilement des tableaux selon desktop et mobile.
  - Définir des largeurs minimales de colonnes et une présentation non destructive de l'email avec consultation accessible de la valeur complète.
  - Conserver et tester le flux de modification de rôle et de suppression de compte, incluant les retours de succès, erreurs et états occupés.
  - Tests de rendu à largeur desktop, navigation clavier et tests négatifs d'autorisation existants.
- Out:
  - Modifier les règles de rôle, la politique de suppression de compte ou l'historique d'audit déjà validés.
  - Rendre la table entièrement responsive en supprimant son défilement horizontal sur petits écrans.

# Acceptance criteria
- AC1: La console et les tableaux utilisent la largeur disponible sur desktop, tandis que le défilement horizontal reste local au tableau si nécessaire sur viewport étroit.
- AC2: La colonne Email ne casse pas une adresse par caractère ; elle possède une largeur minimale et le texte complet est accessible au clavier et à la souris.
- AC3: Changer le rôle d'un autre compte et supprimer un autre compte fonctionnent depuis l'UI ; les refus métier et réseau restent visibles, et aucune action ne permet l'auto-modification ou la suppression du dernier administrateur.
- AC4: Les contrôles, messages et confirmations restent utilisables au clavier et annoncés aux technologies d'assistance.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `mainWidthClass('/admin')` renvoie `app-main-admin` et `.app-main-admin { max-width: none }` libere la largeur du contenu ; `overflow-x: auto` reste porte par `.admin-table-scroll` et non par `.app-main`. Asserte par `apps/frontend/test/admin-layout.test.mjs` (AC1). Enonce d'origine — AC1: La console et les tableaux utilisent la largeur disponible sur desktop, tandis que le défilement horizontal reste local au tableau si nécessaire sur viewport étroit.
- request-AC2 -> This backlog slice. Proof: `.admin-cell-email` passe de `max-width: 18rem; word-break: break-word` a `min-width: 20rem; white-space: nowrap` : l'adresse est affichee entiere, jamais tronquee, donc lisible a la souris comme au clavier ; `.admin-cell-deck` garde un repli aux limites de mots. Asserte par `apps/frontend/test/admin-layout.test.mjs` (AC2). Enonce d'origine — AC2: La colonne Email ne casse pas une adresse par caractère ; elle possède une largeur minimale et le texte complet est accessible au clavier et à la souris.
- request-AC5 -> This backlog slice. Proof: les flux de changement de role et de suppression de compte sont inchanges — aucune regle d'autorisation n'a ete touchee — et restent couverts par `apps/backend/test/admin-accounts.test.mjs` (dernier admin, auto-modification, 401/403) et `apps/frontend/test/admin-dialog.test.mjs` (confirmation, etats occupes, alertes). Enonce d'origine — AC3: Changer le rôle d'un autre compte et supprimer un autre compte fonctionnent depuis l'UI ; les refus métier et réseau restent visibles, et aucune action ne permet l'auto-modification ou la suppression du dernier administrateur.
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
- Summary: Etendre et rendre lisible la console d'administration
- Keywords: scaffolded-backlog, etendre et rendre lisible la console d'administration, implementation-ready
- Use when: Implementing the scaffolded slice for Etendre et rendre lisible la console d'administration.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - les actions existantes paraissent indisponibles et les emails sont illisibles, ce qui bloque l'exploitation quotidienne.
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3`

# Notes
- Task `task_020_orchestrer_la_console_d_administration_large_editable_et_icones_v3` was finished via `logics-manager flow finish task` on 2026-08-08.
