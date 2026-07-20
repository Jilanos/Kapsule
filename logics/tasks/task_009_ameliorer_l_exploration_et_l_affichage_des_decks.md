## task_009_ameliorer_l_exploration_et_l_affichage_des_decks - Ameliorer l'exploration et l'affichage des decks
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] La liste des decks integre recherche, options persistantes, mode ecran large
  et masquage des courbes sans regression mobile ni lecteur elargi.
- [x] L'action "Marquer le deck comme appris" est livree avec confirmation UI,
  endpoint backend role-gated, transaction idempotente et isolation par
  utilisateur.
- [x] Les criteres AC1 a AC8 ont des preuves par tests automatises, build, budget
  et verification responsive/accessibilite.
- [x] Les docs Logics liees sont mises a jour pendant les vagues significatives et
  le depot est laisse commit-ready sans commit automatique.

# Backlog
- `item_013_ameliorer_l_exploration_et_l_affichage_des_decks`

# Acceptance criteria
- AC1 - Recherche : champ accessible, effacement rapide, filtrage temps reel sur
  titre/description/tags des decks visibles, insensible a la casse et aux accents,
  avec etats vides distincts.
- AC2 - Options : menu accessible contenant les toggles ecran large et courbes de
  retention, persistes dans `localStorage` avec repli robuste sur defauts.
- AC3 - Responsive : mode ecran large jusqu'a environ 1280 px sur desktop,
  colonnes supplementaires stables, mobile sans debordement, lecteur de fiches
  inchange.
- AC4 - Retention : preference de masquage qui supprime le rendu SVG des cartes
  sans supprimer les informations textuelles ni modifier le backend.
- AC5 - Autorisation : action "deck appris" visible seulement pour `master` et
  `admin`; enforcement API avec 403 role insuffisant, 404 non divulguant si deck
  absent/non visible, progression limitee au compte connecte.
- AC6 - Transaction : bulk learned atomique et idempotent, preserve l'existant,
  initialise la revision via les regles existantes sans faux score de quiz, retourne
  le nombre de fiches modifiees et ne garde rien en cas d'echec.
- AC7 - UX accessible : menu, recherche, confirmation, succes et erreurs sont
  clavier-friendly, annonces aux lecteurs d'ecran, compatibles themes clair/sombre
  et stables aux largeurs mobile/tablette/desktop.
- AC8 - Validation : tests frontend et backend dedies, suites existantes, build et
  budget frontend au vert.

# AC Traceability
- request-AC1 -> This task. Proof: `DeckList.jsx` ajoute le champ de recherche et
  les etats vides ; `deck-list-options.test.mjs` couvre titre, description, tags,
  casse et accents.
- request-AC2 -> This task. Proof: `DeckListOptions` expose les deux toggles et
  `deckListOptions.js` parse/ecrit les preferences versionnees avec defauts
  robustes.
- request-AC3 -> This task. Proof: `App.jsx` applique `app-main-decks` seulement
  sur `/` et `styles.css` limite la liste a 1280 px en mode large tout en
  gardant le lecteur hors de cette classe.
- request-AC4 -> This task. Proof: `DeckList.jsx` conditionne le rendu
  `RetentionTrace` par `options.showRetention` et conserve `deckLegend`.
- request-AC5 -> This task. Proof: `DeckList.jsx` masque l'action hors
  `master`/`admin`; `app.mjs` applique `canViewDeck` puis `canMarkDeckLearned`;
  `deck-progress-bulk.test.mjs` couvre 403, 404 non visible et isolation.
- request-AC6 -> This task. Proof: `store.mjs` implemente `markDeckLearned` dans
  une transaction idempotente, sans score de quiz stocke ; les tests backend
  couvrent changement, second appel a 0 et absence de progression partielle sur
  etat invalide.
- request-AC7 -> This task. Proof: les controles sont de vrais `input`, `button`,
  `details/summary`, les messages succes/erreur utilisent `role=status/alert`,
  et les styles responsive/focus existants couvrent les nouveaux controles.
- request-AC8 -> This task. Proof: `npm test --workspace @kapsule/backend`,
  `npm test --workspace @kapsule/frontend`, `npm run build --workspace
  @kapsule/frontend`, `npm run budget` et `npm run format:check` passent.

# Implementation plan
- [x] Vague 1 - Baseline et contrats : demarrer la task via `flow start`, relire
  `DeckList.jsx`, `api.js`, `App.jsx`, `styles.css`, `AuthContext.jsx`,
  `app.mjs`, `store.mjs` et `permissions.mjs`; confirmer les primitives de
  progression/revision a reutiliser.
- [x] Vague 2 - Recherche et preferences UI : ajouter le champ de recherche, le
  menu d'options, la lecture/ecriture `localStorage` versionnee et les etats vides
  dans `apps/frontend/src/pages/DeckList.jsx` ou composants locaux proches.
- [x] Vague 3 - Layout et courbes : ajouter les classes/styles de liste large dans
  `apps/frontend/src/App.jsx` et `apps/frontend/src/styles.css`, limiter l'effet a
  la liste des decks, conditionner le rendu des SVG de retention et verifier mobile,
  tablette et desktop.
- [x] Vague 4 - Action bulk learned : ajouter le helper API frontend dans
  `apps/frontend/src/api.js`, le bouton/confirmation reserve `master`/`admin` dans
  la carte deck, puis l'endpoint `PUT /api/decks/:deckId/progress` cote backend
  avec garde de role, visibilite et transaction personnelle.
- [x] Vague 5 - Tests et closeout : couvrir frontend et backend, executer les
  validations, mettre a jour le rapport de task avec preuves, puis terminer via
  `logics-manager flow closeout`/`finish` quand tout est livre.

# Validation
- `npm test --workspace @kapsule/frontend` ou suite frontend equivalente :
- npm test --workspace @kapsule/backend OK (57/57); npm test --workspace @kapsule/frontend OK (4/4); npm run build --workspace @kapsule/frontend OK; npm run budget OK (JS 78.9 KB / 85 KB, CSS 4.0 KB / 15 KB); npm run format:check OK; dev server health OK on backend 3001 and frontend 5173; browser automation unavailable locally.
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.
  recherche, preferences, rendu conditionnel des courbes et affichage role-gated.
- `npm test --workspace @kapsule/backend` : roles `guest`/`master`/`admin`,
  visibilite private/general/master, deck absent/non visible, idempotence,
  atomicite et isolation entre deux utilisateurs.
- `npm run build --workspace @kapsule/frontend` et `npm run budget` si disponible.
- Verification responsive avec le viewer/dev server : mobile, tablette, desktop
  normal et desktop large ; aucun debordement horizontal ni chevauchement.
- `logics-manager lint --require-status` et
  `logics-manager audit --group-by-doc`.
- Utiliser `logics-manager flow progress task logics/tasks/task_009_ameliorer_l_exploration_et_l_affichage_des_decks.md --progress <n>%`
  pendant les vagues significatives, puis `logics-manager flow finish task ...`
  seulement apres validation.

# Report
- Etat initial : task prete, implementation non demarree.
- Points d'attention :
  - ne pas elargir le lecteur de fiches ;
  - ne pas exposer l'action bulk learned aux invites ;
  - ne pas modifier la progression d'autres utilisateurs ;
  - ne pas inventer de score de quiz pour initialiser les revisions ;
  - ne pas toucher aux changements de decks deja presents dans le worktree.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_013_ameliorer_l_exploration_et_l_affichage_des_decks`
- Related request(s): `req_008_ameliorer_l_exploration_et_l_affichage_des_decks`

## Livraison - 2026-07-20
- Frontend :
  - `apps/frontend/src/pages/DeckList.jsx` ajoute la recherche locale, le menu
    d'options, les preferences persistantes, le masquage conditionnel des traces
    SVG de retention, les etats vides et le bouton `master`/`admin` "Marquer
    appris" avec confirmation.
  - `apps/frontend/src/lib/deckListOptions.js` centralise normalisation de
    recherche, filtrage et parsing/ecriture des options `localStorage`.
  - `apps/frontend/src/App.jsx` et `apps/frontend/src/styles.css` limitent le
    mode large a la liste des decks, conservent le lecteur a 720 px et stabilisent
    recherche/options/actions sur les largeurs courantes.
  - `apps/frontend/src/api.js` expose `markDeckLearned(deckId)`.
- Backend :
  - `apps/backend/src/permissions.mjs` ajoute `canMarkDeckLearned`.
  - `apps/backend/src/app.mjs` expose `PUT /api/decks/:deckId/progress` avec
    verification visibilite 404 non divulguante, role `master`/`admin` et etat
    unique `learned`.
  - `apps/backend/src/store.mjs` ajoute `markDeckLearned`, operation atomique et
    idempotente par utilisateur, et initialise les revisions manuelles sans
    stocker de score de quiz.
- Tests :
  - `apps/frontend/test/deck-list-options.test.mjs` couvre recherche
    case/accent-insensitive et options persistantes robustes.
  - `apps/backend/test/deck-progress-bulk.test.mjs` couvre role-gating,
    visibilite, idempotence, absence de progression partielle sur etat invalide et
    isolation utilisateur.
- Validation executee :
  - `npm test --workspace @kapsule/backend` : 57/57 tests OK.
  - `npm test --workspace @kapsule/frontend` : 4/4 tests OK.
  - `npm run build --workspace @kapsule/frontend` : OK.
  - `npm run budget` : OK, JS gzip 78.9 KB / 85 KB, CSS gzip 4.0 KB / 15 KB.
  - `npm run format:check` : OK.
  - Verification dev server : backend `http://localhost:3001/api/health` OK,
    frontend `http://127.0.0.1:5173/` OK et proxy `/api/health` OK.
  - Verification navigateur automatisee non executee : aucun Chromium, Playwright
    ou Puppeteer disponible localement.

# AI Context
- Summary: Implementer la recherche de decks, les options d'affichage persistantes,
  le mode liste large, le masquage des courbes et l'action bulk learned reservee
  `master`/`admin`.
- Keywords: DeckList, recherche, localStorage, widescreen, retention SVG,
  ProgressBar, mark learned, master, admin, permissions, transaction
- Use when: Implementing or reviewing `item_013` or the `req_008` delivery.
- Skip when: The change concerns deck import, authentication, release hardening or
  the retention algorithm.

# Links
- Request: `req_008_ameliorer_l_exploration_et_l_affichage_des_decks`
- Product brief(s): `prod_001_kapsule_product_brief`
- Architecture decision(s): `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
