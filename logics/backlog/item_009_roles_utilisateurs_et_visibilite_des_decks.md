## item_009_roles_utilisateurs_et_visibilite_des_decks - Roles utilisateurs et visibilite des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 75%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Distinguer trois statuts de compte : invite (defaut a l'inscription), maitre et administrateur.
Un invite qui importe un deck ne le partage avec personne : son deck n'est visible que par lui (et l'administrateur).
Des decks generaux visibles par tous les utilisateurs, mais que seuls les maitres et l'administrateur peuvent creer.
Des decks maitres visibles uniquement par les maitres et l'administrateur.
L'administrateur voit tous les decks (y compris les decks prives des invites), est le seul a pouvoir supprimer un deck et le seul a pouvoir changer la visibilite d'un deck.
Attribuer les roles en production : paul.mondou12@gmail.com administrateur, a.agostini.fr@gmail.com maitre.

# Scope
- In:
  - Migration 4 dans `apps/backend/src/db.mjs` : `users.role` ('guest'|'master'|'admin', defaut 'guest'), `decks.owner_id`, `decks.visibility` ('private'|'general'|'master', defaut 'general'), index `idx_decks_owner`.
  - Enforcement API dans les routes decks : listing/lecture filtres par role et proprietaire, creation limitee selon role, suppression et changement de visibilite reserves a l'administrateur (403 sinon), route admin `PATCH` de visibilite.
  - Regles d'edition : proprietaire pour les decks prives, maitres/admin pour les decks generaux et maitres, admin partout.
  - Frontend PWA : role expose par l'API auth, choix de visibilite a la creation selon role, badge de visibilite, actions admin (supprimer, changer visibilite).
  - Migration des decks existants en `general` avec l'administrateur comme proprietaire ; attribution des roles en production (SQL ponctuel apres deploiement).
  - Tests backend couvrant la matrice des droits (visibilite, creation, suppression, changement de visibilite).
- Out:
  - UI d'administration des roles utilisateurs (attribution en SQL pour l'instant).
  - Transfert de propriete d'un deck, partage cible entre invites.
  - Verification d'email, reset de mot de passe (follow-ups auth deja connus).

# Acceptance criteria
- AC1: Chaque utilisateur a un role 'guest', 'master' ou 'admin' (defaut 'guest' a l'inscription) ; chaque deck a un proprietaire et une visibilite 'private', 'general' ou 'master'.
- AC2: Le listing et la lecture des decks respectent la visibilite : un invite voit les decks generaux et ses decks prives ; un maitre voit en plus les decks maitres ; l'administrateur voit tout.
- AC3: La creation respecte les roles : un invite ne peut creer que des decks prives ; maitres et administrateur peuvent aussi creer des decks generaux et maitres.
- AC4: Seul l'administrateur peut supprimer un deck ou changer sa visibilite ; toute autre tentative est refusee (403) cote API.
- AC5: Les decks existants en production restent visibles par tous apres migration (visibilite 'general', proprietaire administrateur) ; aucune progression ni revision n'est perdue.
- AC6: Le frontend reflete les droits : choix de visibilite a la creation selon le role, badge de visibilite sur les decks, actions supprimer/changer la visibilite visibles uniquement pour l'administrateur.
- AC7: En production, paul.mondou12@gmail.com est administrateur et a.agostini.fr@gmail.com est maitre.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Chaque utilisateur a un role 'guest', 'master' ou 'admin' (defaut 'guest' a l'inscription) ; chaque deck a un proprietaire et une visibilite 'private', 'general' ou 'master'.
- request-AC2 -> This backlog slice. Proof: AC2: Le listing et la lecture des decks respectent la visibilite : un invite voit les decks generaux et ses decks prives ; un maitre voit en plus les decks maitres ; l'administrateur voit tout.
- request-AC3 -> This backlog slice. Proof: AC3: La creation respecte les roles : un invite ne peut creer que des decks prives ; maitres et administrateur peuvent aussi creer des decks generaux et maitres.
- request-AC4 -> This backlog slice. Proof: AC4: Seul l'administrateur peut supprimer un deck ou changer sa visibilite ; toute autre tentative est refusee (403) cote API.
- request-AC5 -> This backlog slice. Proof: AC5: Les decks existants en production restent visibles par tous apres migration (visibilite 'general', proprietaire administrateur) ; aucune progression ni revision n'est perdue.
- request-AC6 -> This backlog slice. Proof: AC6: Le frontend reflete les droits : choix de visibilite a la creation selon le role, badge de visibilite sur les decks, actions supprimer/changer la visibilite visibles uniquement pour l'administrateur.
- request-AC7 -> This backlog slice. Proof: AC7: En production, paul.mondou12@gmail.com est administrateur et a.agostini.fr@gmail.com est maitre.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
- Request: `logics/request/req_004_roles_utilisateurs_et_visibilite_des_decks.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Roles utilisateurs et visibilite des decks
- Keywords: backlog-groom, request, roles utilisateurs et visibilite des decks, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Roles utilisateurs et visibilite des decks.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: Les inscriptions sont ouvertes en production avec un domaine public : sans visibilite ni roles, tout inscrit voit et modifie tous les decks. Ce cloisonnement conditionne l'ouverture de l'instance a d'autres utilisateurs.

# Notes
- Hybrid rationale: Derived from request `req_004_roles_utilisateurs_et_visibilite_des_decks` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_004_roles_utilisateurs_et_visibilite_des_decks.md`.
- Generated locally by logics-manager.

# Tasks
- `task_005_roles_utilisateurs_et_visibilite_des_decks`
