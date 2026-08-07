## item_025_administrer_les_comptes_et_roles_kapsule - Administrer les comptes et roles Kapsule
> From version: 1.0.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Administration securisee
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Les roles sont attribues en production par SQL ponctuel, operation non decouvrable, non auditée par l'application et risquee.
- L'operateur ne dispose pas d'une vue unique de l'impact d'une suppression de compte.

# Scope
- In:
  - Routes API d'administration protegees par requireAdmin et validations serveur strictes.
  - Liste, recherche et detail de comptes minimisant les donnees exposees.
  - Mutation de role avec protection du dernier administrateur actif.
  - Desactivation ou suppression de compte selon une politique de dependances explicitement choisie et testee.
  - Table d'audit et ecriture transactionnelle pour les mutations sensibles.
  - Ecran frontend /admin utilisable au clavier avec confirmations et retours d'etat.
- Out:
  - Acces SQL libre ou edition de colonnes brutes.
  - Gestion d'identite partagee avec les autres applications.
  - Suppression automatique de comptes fondee sur une heuristique d'inactivite.

# Acceptance criteria
- AC1: Les endpoints comptes et roles exigent une session admin cote serveur et retournent 401 ou 403 selon le contexte; des tests negatifs couvrent guest et master.
- AC2: La recherche par email et le detail de compte retournent uniquement les champs prevus par le contrat admin et les compteurs d'impact necessaires a une decision.
- AC3: La mutation de role est atomique, valide l'enum guest/master/admin et ne peut pas retirer le dernier administrateur actif; chaque refus est comprehensible et teste.
- AC4: La suppression ou desactivation exige une confirmation porteuse de l'identifiant cible, affiche l'impact avant execution et applique la politique de dependances documentee sans laisser de references orphelines.
- AC5: Les mutations de role et de compte produisent des evenements d'audit non modifiables par l'API courante, associes a l'administrateur acteur et sans secret.
- AC6: L'interface admin propose des libelles, etats de chargement, erreurs et succes accessibles; elle ne presente jamais une action non autorisee comme une securite suffisante.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Les endpoints comptes et roles exigent une session admin cote serveur et retournent 401 ou 403 selon le contexte; des tests negatifs couvrent guest et master. Verifie par `apps/backend/test/admin-accounts.test.mjs` : 401 sans session et 403 pour guest et master sur les 9 routes admin, appel direct inclus.
- request-AC2 -> This backlog slice. Proof: AC2: La recherche par email et le detail de compte retournent uniquement les champs prevus par le contrat admin et les compteurs d'impact necessaires a une decision. Verifie par `apps/backend/test/admin-accounts.test.mjs` : jeu de cles exact du listing, absence de `password_hash`/`scrypt:`/`token`, recherche email avec jokers SQL echappes, pagination plafonnee a 100.
- request-AC3 -> This backlog slice. Proof: AC3: La mutation de role est atomique, valide l'enum guest/master/admin et ne peut pas retirer le dernier administrateur actif; chaque refus est comprehensible et teste. Verifie par `apps/backend/test/admin-accounts.test.mjs` : enum refuse en 400, dernier administrateur en 409, auto-modification en 409, mutation et audit dans une seule transaction (`AdminStore.setUserRole`).
- request-AC5 -> This backlog slice. Proof: AC4: La suppression ou desactivation exige une confirmation porteuse de l'identifiant cible, affiche l'impact avant execution et applique la politique de dependances documentee sans laisser de references orphelines. Verifie par `apps/backend/test/admin-accounts.test.mjs` : `confirmId` absent ou faux refuse en 400 ; decks prives supprimes, decks partages detaches (`owner_id = NULL`), progression/revisions/sessions purgees, aucune ligne orpheline.
- request-AC6 -> This backlog slice. Proof: AC5: Les mutations de role et de compte produisent des evenements d'audit non modifiables par l'API courante, associes a l'administrateur acteur et sans secret. Verifie par `apps/backend/test/admin-accounts.test.mjs` : evenement `user.role.update` / `user.delete` avec acteur, cible, avant/apres ; aucune route d'ecriture sur `/api/admin/audit` ; absence de `scrypt:`, `password`, `Bearer`.
- request-AC8 -> This backlog slice. Proof: AC6: L'interface admin propose des libelles, etats de chargement, erreurs et succes accessibles; elle ne presente jamais une action non autorisee comme une securite suffisante. Verifie par `apps/frontend/test/admin-dialog.test.mjs` : impact rendu avant action, libelle associe au champ de confirmation, submit desactive tant que l'identifiant ne correspond pas, erreurs en `role="alert"`, pagination annoncee.
- request-AC7 -> This backlog slice. Evidence needed: La console presente un apercu du stockage Kapsule (base, uploads et sauvegardes lorsque disponibles) et des compteurs de donnees, sans exposer de chemin absolu, de contenu de fichier prive ou de telechargement arbitraire.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)
- Request: `req_015_administrer_les_utilisateurs_et_contenus_kapsule`
- Primary task(s): `task_016_orchestrer_la_console_d_administration_kapsule`

# AI Context
- Summary: Administrer les comptes et roles Kapsule
- Keywords: scaffolded-backlog, administrer les comptes et roles kapsule, implementation-ready
- Use when: Implementing the scaffolded slice for Administrer les comptes et roles Kapsule.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High - elimine les changements SQL manuels de roles et securise les operations quotidiennes sur les comptes.
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_016_orchestrer_la_console_d_administration_kapsule`

# Notes
- Task `task_016_orchestrer_la_console_d_administration_kapsule` was finished via `logics-manager flow finish task` on 2026-08-07.
