## req_008_ameliorer_l_exploration_et_l_affichage_des_decks - Ameliorer l'exploration et l'affichage des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 85
> Confidence: 80
> Complexity: Medium
> Theme: interface
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Mieux exploiter les ecrans larges sur la liste des decks, sans elargir les
  contenus de lecture au-dela d'une largeur confortable.
- Ajouter une barre de recherche permettant de retrouver rapidement un deck
  visible a partir de son titre, de sa description ou de ses tags.
- Ajouter un menu d'options d'affichage regroupant au minimum :
  - l'activation du mode ecran large ;
  - l'affichage ou le masquage des courbes de retention.
- Memoriser ces deux preferences pour les prochaines visites sur le meme
  navigateur.
- Permettre a un maitre ou a un administrateur de marquer en une seule action
  toutes les fiches d'un deck comme apprises pour son propre compte.

# Context
- L'ecran `DeckList` est actuellement limite par `.app-main` a 720 px. Sa
  grille sait deja distribuer des cartes avec `auto-fill`, mais ne peut donc
  pas profiter d'un moniteur large.
- Le mode ecran large doit concerner l'exploration des decks. Le lecteur de
  fiches conserve sa largeur actuelle afin de proteger la lisibilite des
  contenus longs.
- Les courbes de retention sont deja rendues sur chaque carte de deck. Leur
  masquage est une preference de presentation : les donnees restent calculees
  et la progression textuelle reste visible.
- La recherche porte uniquement sur les decks que `GET /api/decks` a deja
  autorises pour l'utilisateur. Un filtrage local, insensible a la casse et
  aux accents, est suffisant a ce stade et n'elargit jamais la visibilite.
- Le menu d'options est accessible depuis l'en-tete de la liste des decks. Il
  utilise des controles binaires explicites, reste utilisable au clavier et
  expose l'etat de chaque option aux technologies d'assistance.
- Les preferences d'affichage ne sont pas des donnees metier. Elles sont
  stockees sous une cle versionnee dans `localStorage`, avec repli sur les
  valeurs par defaut si la valeur est absente ou invalide. Proposition : mode
  ecran large desactive par defaut pour preserver le rendu actuel, courbes de
  retention affichees par defaut.
- L'action en masse "Marquer le deck comme appris" est reservee aux roles
  `master` et `admin`, controlee cote API et non uniquement masquee dans l'UI.
  Elle ne modifie que la progression de l'utilisateur connecte, jamais celle
  des autres comptes.
- Cette action doit etre atomique et idempotente : elle marque les fiches non
  apprises comme `learned`, conserve les fiches deja apprises et initialise
  leur cycle de revision selon le comportement existant, sans inventer de
  score de quiz. Une confirmation indique le nombre de fiches concernees avant
  l'ecriture.
- Proposition d'API : `PUT /api/decks/:deckId/progress` avec
  `{ "state": "learned" }`, retourne le resume de progression actualise et le
  nombre de fiches modifiees. La visibilite courante du deck et le role sont
  verifies avant la transaction.
- Hors perimetre : recherche plein texte cote serveur, tri avance, filtres par
  visibilite/progression, synchronisation des preferences entre appareils,
  modification en masse de la progression d'un autre utilisateur et refonte
  du lecteur de fiches.
- Risques connus : surcharge du bandeau d'actions sur mobile, perte de
  lisibilite avec des cartes trop larges, action en masse declenchee par erreur
  et incoherence entre progression et SM-2 si l'operation contourne les
  primitives existantes.

# Acceptance criteria
- AC1: La liste des decks propose un champ de recherche avec libelle accessible
  et effacement rapide ; les resultats sont filtres en temps reel sur le titre,
  la description et les tags, sans distinction de casse ni d'accents, et un
  etat vide distingue "aucun deck" de "aucun resultat".
- AC2: Un menu d'options accessible au clavier contient deux controles
  independants : "Utiliser la largeur de l'ecran" et "Afficher les courbes de
  retention". Leur etat est restaure apres rechargement du navigateur et une
  valeur stockee invalide ne casse pas l'application.
- AC3: Quand le mode ecran large est actif sur un viewport desktop, la liste
  peut s'etendre jusqu'a environ 1280 px et afficher davantage de colonnes avec
  une largeur minimale stable des cartes ; sur mobile, la mise en page reste
  sur une colonne sans debordement horizontal. Le lecteur de fiches conserve
  sa largeur de lecture actuelle.
- AC4: Quand les courbes sont masquees, aucun SVG de retention n'est rendu sur
  les cartes, mais les graduations et la legende textuelle de progression et
  de retention restent disponibles. La preference n'altere aucune donnee de
  retention cote backend.
- AC5: L'action "Marquer le deck comme appris" n'est proposee qu'aux maitres et
  administrateurs. L'API refuse les invites avec un statut 403, refuse un deck
  absent ou non visible sans en divulguer l'existence, et ne modifie que la
  progression du compte authentifie.
- AC6: Apres confirmation, l'action en masse traite toutes les fiches dans une
  transaction, est idempotente, preserve les progressions deja apprises,
  initialise la revision avec les regles existantes sans faux score de quiz,
  puis actualise les compteurs de la liste. En cas d'echec, aucune progression
  partielle n'est conservee et un message actionnable est affiche.
- AC7: Le menu, la recherche, les confirmations et les retours de succes ou
  d'erreur sont utilisables au clavier, correctement annonces, compatibles
  avec les themes clair/sombre et sans decalage de mise en page incoherent aux
  largeurs mobile, tablette et desktop.
- AC8: Des tests frontend couvrent le filtrage, les preferences et les droits
  d'affichage ; des tests backend couvrent les roles, la visibilite,
  l'atomicite, l'idempotence et l'isolation par utilisateur. Les suites
  existantes, le build et le budget frontend restent au vert.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`

# References
- `apps/frontend/src/pages/DeckList.jsx` (recherche, menu d'options, rendu des courbes)
- `apps/frontend/src/App.jsx` et `apps/frontend/src/styles.css` (largeur du contenu et responsive)
- `apps/frontend/src/auth/AuthContext.jsx` (role du compte connecte)
- `apps/frontend/src/api.js` (nouvelle action de progression d'un deck)
- `apps/backend/src/app.mjs` (autorisation et endpoint atomique)
- `apps/backend/src/store.mjs` (progression, revisions et transaction)
- `apps/backend/src/permissions.mjs` (roles `guest`, `master`, `admin`)
- `req_004_roles_utilisateurs_et_visibilite_des_decks`
- `req_007_courbe_de_retention_memorielle_sur_les_decks`

# AI Context
- Summary: Ameliorer l'exploration des decks avec recherche locale, mode ecran large, masquage configurable des courbes et action de progression en masse reservee aux maitres/admin.
- Keywords: decks, recherche, widescreen, responsive, options, retention, progression, master, admin
- Use when: Implementing or reviewing the deck-list exploration options and the role-gated bulk learned action.
- Skip when: The change concerns deck import, content schema, authentication or the retention model itself.

# Backlog
- none
- `item_013_ameliorer_l_exploration_et_l_affichage_des_decks`
