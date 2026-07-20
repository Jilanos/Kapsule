## item_013_ameliorer_l_exploration_et_l_affichage_des_decks - Ameliorer l'exploration et l'affichage des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
La liste des decks est actuellement lisible mais trop contrainte pour un usage
sur ecran de PC : le conteneur principal reste proche d'une largeur de lecture,
ce qui limite le nombre de cartes visibles et ralentit l'exploration d'une
collection qui grandit. Les utilisateurs doivent aussi pouvoir reduire le bruit
visuel des courbes de retention et retrouver rapidement un deck par recherche.

Ce backlog livre une amelioration coherente de l'exploration des decks : options
d'affichage persistantes, recherche locale et action de progression en masse
reservee aux roles de confiance. L'action "deck appris" reste strictement
personnelle au compte connecte et doit etre controlee cote API.

# Scope
- In:
  - Liste des decks plus large sur desktop quand l'utilisateur active le mode
    ecran large, sans changer la largeur du lecteur de fiches.
  - Barre de recherche locale sur les decks deja visibles par `GET /api/decks`,
    insensible a la casse et aux accents, avec etat vide clair.
  - Menu d'options d'affichage accessible regroupant le mode ecran large et le
    masquage/affichage des courbes de retention.
  - Persistance locale versionnee des preferences d'affichage avec repli robuste
    si la valeur stockee est invalide.
  - Masquage purement frontend des SVG de retention, sans changer les donnees ni
    les compteurs textuels.
  - Action "Marquer le deck comme appris" visible seulement pour `master` et
    `admin`, avec confirmation, endpoint backend role-gated, transaction
    atomique et mise a jour de la progression du seul utilisateur connecte.
  - Tests frontend et backend couvrant recherche, preferences, responsive,
    roles, visibilite, idempotence et isolation utilisateur.
- Out:
  - Recherche plein texte cote serveur, indexation avancee ou tri/filtres
    supplementaires.
  - Synchronisation des preferences entre appareils ou comptes.
  - Modification de la progression d'un autre utilisateur.
  - Refonte du lecteur de fiches, du modele SM-2 ou du calcul de retention.
  - Changement de visibilite des decks, import de contenu ou edition des decks.

# Acceptance criteria
- AC1 - Recherche : la liste des decks propose un champ de recherche avec libelle
  accessible et effacement rapide ; les resultats sont filtres en temps reel sur
  titre, description et tags, sans distinction de casse ni d'accents. L'etat vide
  distingue "aucun deck disponible" de "aucun resultat pour cette recherche".
- AC2 - Options persistantes : un menu d'options clavier/souris contient deux
  controles independants, "Utiliser la largeur de l'ecran" et "Afficher les
  courbes de retention". Les valeurs sont restaurees au rechargement et une
  valeur `localStorage` invalide revient aux defauts sans casser l'application.
- AC3 - Ecran large : quand le mode ecran large est actif sur desktop, la liste
  peut s'etendre jusqu'a environ 1280 px et afficher davantage de colonnes avec
  une largeur minimale stable des cartes. Sur mobile, la liste reste sur une
  colonne sans debordement horizontal. Le lecteur de fiches conserve sa largeur
  actuelle.
- AC4 - Courbes optionnelles : quand les courbes sont masquees, aucun SVG de
  retention n'est rendu dans les cartes de deck, mais les informations textuelles
  de progression et retention restent visibles. Aucune donnee backend n'est
  modifiee.
- AC5 - Droit de marquer appris : l'action "Marquer le deck comme appris" n'est
  proposee qu'aux `master` et `admin`. L'API refuse un invite ou role insuffisant
  par 403, refuse un deck absent ou non visible sans divulgation, et ne modifie
  que la progression du compte authentifie.
- AC6 - Semantique de progression : apres confirmation, l'action en masse marque
  toutes les fiches non apprises comme `learned` dans une transaction, preserve
  les fiches deja apprises, initialise la revision selon les primitives
  existantes sans faux score de quiz, et retourne le nombre de fiches modifiees.
  L'appel est idempotent et ne laisse aucune progression partielle en cas
  d'echec.
- AC7 - Experience responsive et accessible : recherche, menu, confirmation,
  succes et erreurs sont utilisables au clavier, annonces correctement, compatibles
  clair/sombre et sans chevauchement ni saut de mise en page incoherent sur
  mobile, tablette et desktop.
- AC8 - Validation : les tests frontend couvrent filtrage, preferences, rendu des
  courbes et droits d'affichage ; les tests backend couvrent roles, visibilite,
  atomicite, idempotence et isolation par utilisateur. Les suites existantes, le
  build frontend et le budget restent au vert.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: recherche locale accessible sur titre, description et tags des decks visibles.
- request-AC2 -> This backlog slice. Proof: menu d'options avec deux toggles persistants et repli sur defauts.
- request-AC3 -> This backlog slice. Proof: mode ecran large limite a la liste des decks, responsive et lecteur inchange.
- request-AC4 -> This backlog slice. Proof: masquage du SVG de retention sans alteration des donnees ni du texte.
- request-AC5 -> This backlog slice. Proof: UI reservee `master`/`admin` et enforcement API 403/404 non divulguant.
- request-AC6 -> This backlog slice. Proof: transaction idempotente de progression personnelle, sans faux score de quiz.
- request-AC7 -> This backlog slice. Proof: clavier, annonces, themes et responsive couverts par implementation et tests.
- request-AC8 -> This backlog slice. Proof: tests frontend/backend plus build et budget obligatoires.

# Decision framing
- Product framing: Not needed
- Product signals: amelioration ergonomique locale de l'exploration des decks,
  sans changement de promesse produit.
- Product follow-up: aucun brief produit dedie requis ; rattachement au brief
  existant `prod_001_kapsule_product_brief`.
- Architecture framing: Not needed
- Architecture signals: nouvel endpoint borne par les permissions et les
  primitives de progression existantes, sans nouveau stockage structurel.
- Architecture follow-up: aucune ADR dediee attendue si l'implementation reutilise
  `permissions.mjs`, `store.mjs` et les transactions existantes.

# Links
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
- Request: `req_008_ameliorer_l_exploration_et_l_affichage_des_decks`
- Primary task(s): `task_009_ameliorer_l_exploration_et_l_affichage_des_decks`

# AI Context
- Summary: Livrer une meilleure exploration de la liste des decks avec recherche,
  options d'affichage persistantes, mode desktop large et action personnelle de
  progression en masse reservee aux maitres/admin.
- Keywords: decks, recherche, widescreen, options, retention, progression,
  learned, master, admin, localStorage, responsive
- Use when: Implementing or reviewing the deck-list exploration improvements and
  the role-gated deck learned action.
- Skip when: The work concerns deck import, deck visibility rules, authentication
  changes or the retention algorithm itself.

# Priority
- Priority: Medium
- Rationale: Amelioration importante de productivite pour les utilisateurs actifs,
  mais moins urgente que les travaux de durcissement deja ouverts.

# Notes
- Livraison conseillee en deux vagues : UI/preferences/recherche, puis endpoint de
- Task `task_009_ameliorer_l_exploration_et_l_affichage_des_decks` was finished via `logics-manager flow finish task` on 2026-07-20.
  progression en masse et tests backend. La task conserve un seul flux pour
  garantir l'integration UX/API.
- Ne pas modifier les fichiers de decks deja sales dans le worktree pendant cette
  livraison.
- Source file: `logics/request/req_008_ameliorer_l_exploration_et_l_affichage_des_decks.md`.
- Generated locally by logics-manager.

# Tasks
- `task_009_ameliorer_l_exploration_et_l_affichage_des_decks`
