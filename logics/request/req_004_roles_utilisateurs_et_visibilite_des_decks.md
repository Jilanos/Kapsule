## req_004_roles_utilisateurs_et_visibilite_des_decks - Roles utilisateurs et visibilite des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: auth
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Distinguer trois statuts de compte : invite (defaut a l'inscription), maitre et administrateur.
- Un invite qui importe un deck ne le partage avec personne : son deck n'est visible que par lui (et l'administrateur).
- Des decks generaux visibles par tous les utilisateurs, mais que seuls les maitres et l'administrateur peuvent creer.
- Des decks maitres visibles uniquement par les maitres et l'administrateur.
- L'administrateur voit tous les decks (y compris les decks prives des invites), est le seul a pouvoir supprimer un deck et le seul a pouvoir changer la visibilite d'un deck.
- Attribuer les roles en production : paul.mondou12@gmail.com administrateur, a.agostini.fr@gmail.com maitre.

# Context
- La table `decks` n'a aujourd'hui ni proprietaire ni visibilite : tous les decks sont globaux et visibles par tous.
- Modele retenu : colonne `role` sur `users` ('guest' | 'master' | 'admin', defaut 'guest') ; colonnes `owner_id` et `visibility` ('private' | 'general' | 'master', defaut 'general') sur `decks`. Le "type de deck" est une propriete du deck, pas du role du createur : un maitre peut aussi creer un deck prive.
- Edition (defaut propose) : le proprietaire edite ses decks prives ; maitres et administrateur editent les decks generaux et maitres ; l'administrateur edite tout.
- Decks existants en production : bascules en `general` avec l'administrateur comme proprietaire (ils etaient de facto visibles par tous).
- Avec ce modele, `KAPSULE_REGISTRATION=open` devient soutenable : un nouvel inscrit est invite et ne voit que le general plus ses propres decks.
- La migration s'ajoute comme migration 4 dans `apps/backend/src/db.mjs` (versionnee via PRAGMA user_version) ; ne jamais appliquer les ALTER a la main en production avant le deploiement du code.
- L'enforcement se fait dans les routes Express (list/get/create/delete + nouvelle route admin de changement de visibilite), pas seulement dans le schema.
- Hors perimetre (follow-ups) : gestion des roles via une UI d'administration (l'attribution se fait en SQL pour l'instant), transfert de propriete d'un deck, partage cible entre invites.

# Acceptance criteria
- AC1: Chaque utilisateur a un role 'guest', 'master' ou 'admin' (defaut 'guest' a l'inscription) ; chaque deck a un proprietaire et une visibilite 'private', 'general' ou 'master'.
- AC2: Le listing et la lecture des decks respectent la visibilite : un invite voit les decks generaux et ses decks prives ; un maitre voit en plus les decks maitres ; l'administrateur voit tout.
- AC3: La creation respecte les roles : un invite ne peut creer que des decks prives ; maitres et administrateur peuvent aussi creer des decks generaux et maitres.
- AC4: Seul l'administrateur peut supprimer un deck ou changer sa visibilite ; toute autre tentative est refusee (403) cote API.
- AC5: Les decks existants en production restent visibles par tous apres migration (visibilite 'general', proprietaire administrateur) ; aucune progression ni revision n'est perdue.
- AC6: Le frontend reflete les droits : choix de visibilite a la creation selon le role, badge de visibilite sur les decks, actions supprimer/changer la visibilite visibles uniquement pour l'administrateur.
- AC7: En production, paul.mondou12@gmail.com est administrateur et a.agostini.fr@gmail.com est maitre.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# References
- `apps/backend/src/db.mjs` (migration 4 : users.role, decks.owner_id, decks.visibility)
- `apps/backend/src/store.mjs` (requetes de listing a filtrer par role/proprietaire)
- `apps/backend/src/server.mjs` (enforcement des droits dans les routes decks)
- `apps/frontend/src/api.js` (client API : role utilisateur, visibilite des decks)

# AI Context
- Summary: Roles invite/maitre/admin et visibilite des decks (private/general/master) avec enforcement API et UI.
- Keywords: roles, permissions, visibilite, decks, admin, invite, maitre
- Use when: Implementing or reviewing the roles and deck visibility work.
- Skip when: The change concerns SM-2 scheduling, auth sessions, or deployment infrastructure.

# Backlog
- none
- `item_009_roles_utilisateurs_et_visibilite_des_decks`
