## req_015_administrer_les_utilisateurs_et_contenus_kapsule - Administrer les utilisateurs et contenus Kapsule
> From version: 1.0.7
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Administration securisee
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Un administrateur Kapsule doit pouvoir consulter et rechercher les comptes sans recourir a SQL en production.
- Un administrateur doit pouvoir promouvoir ou retrograder un compte entre guest, master et admin, avec des regles qui evitent la perte du dernier administrateur.
- Un administrateur doit pouvoir inspecter les contenus et les volumes utilises afin de comprendre les donnees presentes.
- Un administrateur doit pouvoir supprimer proprement un compte ou un contenu inutilise apres visualisation de l'impact et confirmation explicite.

# Context
- Kapsule utilise SQLite sur le volume Docker persistant /data et expose deja des roles guest, master et admin dans la colonne users.role.
- Les permissions existantes imposent les droits cote API; la console doit prolonger ce modele et ne jamais reposer sur un masquage frontend seul.
- La demande remplace les interventions SQL ponctuelles pour l'administration Kapsule; elle ne constitue pas une console SQL generique ni un portail transverse pour les autres applications.
- Les suppressions de comptes peuvent impliquer des decks, cartes, revisions, progression, sessions et assets; leur semantique doit etre explicite, transactionnelle et testee.
- L'acces doit rester reserve au role admin via la session Kapsule existante; aucune nouvelle surface publique ou port de base de donnees ne doit etre ajoute.

# Acceptance criteria
- AC1: Un utilisateur non authentifie est redirige vers la connexion et tout utilisateur guest ou master recoit un 403 pour chaque endpoint d'administration, y compris si l'URL est appelee directement.
- AC2: Un administrateur peut lister, rechercher et consulter les comptes avec email, role, date de creation, derniere activite disponible et compteurs de contenus pertinents, sans exposer de hash de mot de passe, token ou secret.
- AC3: Un administrateur peut modifier le role d'un autre compte parmi guest, master et admin; le backend valide les valeurs et refuse toute operation qui retirerait le dernier compte admin actif.
- AC4: Un administrateur peut consulter les decks et leurs proprietaires, visibilites, volumes ou compteurs utiles, puis appliquer les actions de contenu deja autorisees par les regles metier sans contourner les permissions existantes.
- AC5: Avant une suppression de compte ou de contenu, l'interface affiche les donnees affectees et impose une confirmation explicite; le backend execute une operation atomique, applique une politique documentee pour les dependances et renvoie un resultat exploitable.
- AC6: Chaque changement de role, suppression et action administrative sensible produit une entree d'audit avec acteur, cible, action, ancien et nouvel etat utile et horodatage; les donnees sensibles ne sont pas journalisees.
- AC7: La console presente un apercu du stockage Kapsule (base, uploads et sauvegardes lorsque disponibles) et des compteurs de donnees, sans exposer de chemin absolu, de contenu de fichier prive ou de telechargement arbitraire.
- AC8: Les parcours administration sont accessibles au clavier, proposent des retours de succes et d'erreur explicites, et sont couverts par des tests backend de droits et de mutations ainsi que des tests frontend pertinents.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_007_console_d_administration_kapsule`
- Architecture decision(s): (none yet)

# References
- README.md
- apps/backend/src/db.mjs
- apps/backend/src/store.mjs
- apps/backend/src/server.mjs
- apps/backend/src/permissions.mjs
- apps/frontend/src/App.jsx
- apps/frontend/src/api.js
- logics/request/req_004_roles_utilisateurs_et_visibilite_des_decks.md
- logics/tasks/task_005_roles_utilisateurs_et_visibilite_des_decks.md

# AI Context
- Summary: Administrer les utilisateurs et contenus Kapsule
- Keywords: request-chain-scaffold, administrer les utilisateurs et contenus kapsule, development-ready
- Use when: You need to implement or review the scaffolded workflow for Administrer les utilisateurs et contenus Kapsule.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_025_administrer_les_comptes_et_roles_kapsule`
- `item_026_inspecter_et_administrer_les_contenus_et_stockage_kapsule`
