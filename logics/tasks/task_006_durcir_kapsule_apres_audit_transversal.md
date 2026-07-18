## task_006_durcir_kapsule_apres_audit_transversal - Durcir Kapsule apres audit transversal
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 30%
> Complexity: High
> Theme: Security, reliability and repository hardening
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: lien vers adr_003 (decision assets/cache/sessions).

# Context
- Source fonctionnelle et preuves initiales : `docs/audit-2026-07-18.md`.
- Cette task implemente l'unique backlog
  `item_010_durcir_kapsule_apres_audit_transversal` en vagues ordonnees.
- Les changements de decks deja presents dans le worktree sont hors perimetre et
  ne doivent jamais etre modifies, indexes ou committes par cette task.
- Toute rotation de secret, protection GitHub ou operation de production demande
  une preuve non sensible et une coordination operateur explicite.

# Definition of Done (DoD)
- [ ] Les protections P0 secrets, cache et autorisations sont livrees et verifiees.
- [ ] Les 11 criteres d'acceptation ont une preuve reproductible ou une preuve
  operateur non sensible referencee dans le rapport.
- [ ] Tests, build, lint, audits, controles accessibilite et smokes de deploiement
  passent selon la section Validation.
- [ ] Le brief produit et les ADR affectees sont alignes et settles via la CLI.
- [ ] Chaque vague suit le checkpoint ADR 009 et laisse le depot commit-ready sans
  imposer un commit par micro-etape.

# Backlog
- `item_010_durcir_kapsule_apres_audit_transversal`

# Acceptance criteria
- AC1 - Hygiene des secrets : le contexte et les couches Docker ne contiennent que
  les fichiers necessaires ; scan de secrets, rotation de cle et purge de caches
  disposent de preuves non sensibles.
- AC2 - Autorisations : assets, progression, revisions et dues appliquent la meme
  politique centralisee que la lecture des decks et couvrent toute la matrice de
  permissions par tests negatifs.
- AC3 - Cache et sessions : deux comptes successifs sur un meme navigateur ne
  partagent aucune reponse authentifiee, y compris hors ligne ; cache et tokens
  suivent la decision d'architecture documentee.
- AC4 - Resistance aux abus : login/register sont limites, le hachage est non
  bloquant, les entrees sont bornees et les inscriptions sont fermees par defaut en
  production.
- AC5 - Chaine CI : PR et `main` sont gardees par lint, tests, build, Logics, audit
  de dependances, scan de secrets et analyse de securite ; les fixtures de tests
  sont independantes des decks de demonstration.
- AC6 - Licence et gouvernance : MIT est materialisee par `LICENSE`, les politiques
  de securite/contribution et templates existent, les dependances sont maintenues et
  Vite/esbuild n'ont plus d'alerte connue.
- AC7 - Deploiement : exemple d'environnement, chemin distant, conteneur non-root,
  healthcheck, en-tetes Caddy et images maitrisees sont valides par smoke.
- AC8 - Accessibilite : les vues critiques passent axe sans violation serieuse et
  un parcours clavier WCAG 2.2 AA couvre focus, live regions, progression,
  contrastes et reduction des animations.
- AC9 - Fiabilite produit : les ecritures non synchronisees sont rejouees ou
  clairement recuperables ; les suppressions sont confirmees et la promesse hors
  ligne correspond au comportement mesure.
- AC10 - Performance et operations : budgets frontend/API, reduction des ecritures
  de session, purge, strategie gros decks et preuves de sauvegarde hors site puis
  restauration sont disponibles.
- AC11 - Presentation : README, metadata GitHub et brief produit decrivent l'etat
  reel avec prerequis, architecture, securite, tests, limites, licence et visuel,
  sans donnees personnelles d'exploitation inutiles.

# AC Traceability
- request-AC1 -> This task. Proof: diff Docker cible, scan de secrets CI et preuve operateur rotation/purge.
- request-AC2 -> This task. Proof: tests API negatifs private/general/master et guest/master/admin.
- request-AC3 -> This task. Proof: ADR cache/session et test navigateur inter-comptes en ligne/hors ligne.
- request-AC4 -> This task. Proof: tests rate limit, bornes d'entree et mesure de non-blocage de l'API.
- request-AC5 -> This task. Proof: workflow CI vert, ruleset `main` et fixtures autonomes.
- request-AC6 -> This task. Proof: fichiers de gouvernance, mise a jour lockfile et audits sans alerte elevee.
- request-AC7 -> This task. Proof: `docker compose config`, scan d'image, healthcheck et smoke HTTPS.
- request-AC8 -> This task. Proof: rapport axe automatise et checklist clavier WCAG 2.2 AA.
- request-AC9 -> This task. Proof: tests offline/retry et test UI de confirmation de suppression.
- request-AC10 -> This task. Proof: budgets mesures et preuve datee de sauvegarde/restauration hors site.
- request-AC11 -> This task. Proof: README/metadata/brief relus et GitHub Community Profile ameliore.

# Plan
- [ ] Vague 0 - Baseline et decisions : demarrer la task via `flow start`, figer les
  preuves initiales, cadrer les ADR cache/session/CSP et coordonner la rotation sans
  exposer de secret.
- [~] Vague 1 - P0 : reduire le contexte Docker, purger/faire tourner la cle,
  centraliser les autorisations, proteger les assets et dues, desactiver ou isoler
  le cache authentifie, puis ajouter les tests de non-regression.
  Livre (code) : contexte Docker cible + `.dockerignore` durci ; garde `canViewDeck`
  sur progression et revision ; refiltrage de visibilite des revisions dues ;
  cache runtime `/api` passe en `NetworkOnly` (isolation inter-comptes) ;
  protection des assets prives par URL signee HMAC (ADR 003) ; tests de
  non-regression P0 verts. En attente : rotation/purge de la cle = action
  operateur (seul reliquat code du P0 est clos).
- [ ] Vague 2 - P1 application : hachage asynchrone, limites de debit et d'entree,
  sessions bornees/purgees, inscription fermee par defaut et migration explicite.
- [ ] Vague 3 - P1 depot/deploiement : fixtures autonomes, CI et scans obligatoires,
  protection `main`, licence/gouvernance, mise a jour Vite, environnement versionne,
  conteneur non-root, healthcheck et en-tetes Caddy.
- [ ] Vague 4 - P2 experience/operations : accessibilite, retry/offline,
  confirmation destructive, budgets de performance, sauvegarde hors site,
  restauration, README, GitHub et brief produit.
- [ ] Vague 5 - Closeout : executer toutes les validations, joindre les preuves,
  mettre a jour le rapport Logics et terminer avec `flow closeout`/`flow finish`.

# Validation
- `npm test` et `npm run build` passent sur des fixtures autonomes.
- `npm audit --omit=dev` ne remonte aucune vulnerabilite ; l'audit complet ne
  contient aucune alerte elevee non acceptee par une decision documentee.
- Les tests d'autorisation, cache inter-comptes, rate limit, offline/retry et
  accessibilite couvrent explicitement les criteres associes.
- `docker compose config`, build/scan d'image, healthcheck et smoke HTTPS passent ;
  le contexte et les couches inspectees ne contiennent aucun secret.
- Une preuve non sensible confirme rotation/purge, protection de branche,
  sauvegarde hors site et restauration.
- `logics-manager lint --require-status` et
  `logics-manager audit --group-by-doc` passent.
- Utiliser `logics-manager flow progress task task_006_durcir_kapsule_apres_audit_transversal --progress <n>%`
  a chaque vague significative, puis `flow closeout` et `flow finish` uniquement
  apres livraison de toutes les preuves.

# Report
- Etat initial : implementation non demarree ; task prete a etre prise en charge.
- Baseline : voir `docs/audit-2026-07-18.md` et `req_005`.
- Consigner ici les fichiers modifies, tests, mesures, decisions et preuves
  operateur a chaque vague sans inclure de secret ni de donnee personnelle.

## Vague 1 - P0 (partie code) - 2026-07-18
Fichiers modifies :
- `.dockerignore` : exclusion explicite des secrets/artefacts de deploiement
  (`cle_hetzner`, `cle_hetzner.pub`, `.deploy_known_hosts`, `*.pem`, `*.key`,
  `id_rsa*`, `id_ed25519*`) et des dossiers non runtime (`deploy`, `docs`).
- `Dockerfile` : remplacement de `COPY . .` par des `COPY` cibles
  (`packages`, `apps/backend`, `apps/frontend`, `decks`) ; les secrets locaux ne
  peuvent plus entrer dans le contexte/cache de build. [AC1, partie code]
- `apps/backend/src/app.mjs` : garde `canViewDeck` (404 non divulguant) sur
  `PUT .../progress` et `POST .../review` ; `/api/reviews/due` recoit desormais
  `req.user` complet. [AC2]
- `apps/backend/src/store.mjs` : `getDueReviews(viewer)` refiltre la visibilite
  courante des decks (general/private-owner/master selon le role). [AC2]
- `apps/frontend/vite.config.mjs` : cache runtime `/api` force en `NetworkOnly`
  (l'ancien `NetworkFirst` sur `/api/decks` melangeait les comptes hors ligne).
  Verifie dans `dist/sw.js` : plus de `NetworkFirst`/`kapsule-decks`. [AC3, interim]
- `apps/backend/test/authorization-hardening.test.mjs` : 3 tests de
  non-regression P0 (progression refusee 404, revision refusee 404, refiltrage
  des dues au changement de visibilite) — tous verts.

Validation :
- `npm test --workspace @kapsule/backend` : 37/38 verts. Le seul echec (`AC2 :
  reviser avec un bon score...` dans `reviews.test.mjs`) est la defaillance
  pre-existante deja documentee par l'audit (`quizScore: 2` couple au nombre de
  questions du deck exemple, modifie hors perimetre). Correction rattachee a
  l'AC5 (fixtures autonomes, Vague 3) ; le deck ne doit pas etre modifie ici.
- `npm run build --workspace @kapsule/frontend` : succes, bundle 181,43 kB
  (58,86 kB gzip), SW regenere.

En attente (hors code) :
- AC1 : rotation de la cle `cle_hetzner` et purge des caches de build = action
  operateur ; joindre une preuve non sensible.
- AC3 : reactivation d'un cache hors ligne segmente par utilisateur = follow-up
  P2 (ADR 003, decision 2), apres la mesure interim ci-dessus.

## Vague 1 - P0 : signature des assets prives (AC2 assets) - 2026-07-18
Decision : ADR 003 (assets prives via URL signee HMAC a TTL court). Implemente :
- `apps/backend/src/asset-signing.mjs` (nouveau) : signature HMAC-SHA256 sur
  `deckId + chemin canonique + exp` (secret `KAPSULE_ASSET_SECRET`, TTL 600 s),
  verification a temps constant, helpers `signDeckAssets`/`signCardAssets`.
- `apps/backend/src/app.mjs` : `GET /api/decks/:id` et `.../cards/:id` renvoient
  des `image.src` signes ; la route assets verifie la signature (403 sinon)
  avant tout acces disque. `canViewDeck` est donc applique au moment de la
  signature (lecture du deck), pas sur la balise `<img>`.
- `apps/frontend/src/lib/assets.js` : consomme l'URL signee absolue telle quelle.
- `apps/backend/test/e2e-import.test.mjs` : URL signee -> 200 ; non signee -> 403 ;
  fichier absent -> 404 ; signature expiree -> 403 ; traversee jamais servie.
Nouvelle variable d'env `KAPSULE_ASSET_SECRET` a versionner (sans valeur) dans
`.env.example` en Vague 3 (AC7).
Validation : backend 37/38 (seul echec = defaillance pre-existante #29,
`reviews.test.mjs`, hors perimetre) ; `npm run build` frontend OK.
Reliquat P0 code : neant. Reliquat P0 : rotation de cle (operateur).

# AI Context
- Summary: Executer le durcissement Kapsule issu de l'audit en vagues P0/P1/P2 avec
  preuves de securite, qualite, accessibilite et exploitation.
- Keywords: task, hardening, Docker secrets, authorization, PWA cache, auth, CI,
  accessibility, performance, operations
- Use when: Implementing `item_010` or enregistrant une preuve de vague.
- Skip when: The work concerne des fonctionnalites pedagogiques ou des decks hors
  perimetre.

# Links
- Request: `req_005_durcir_kapsule_apres_audit_transversal`
- Product brief(s): (none yet)
- Architecture decision(s): `adr_003_kapsule_durcissement_assets_prives_cache_pwa_et_sessions`
