## adr_003_kapsule_durcissement_assets_prives_cache_pwa_et_sessions - Kapsule durcissement : assets prives, cache PWA et sessions
> Date: 2026-07-18
> Status: Accepted
> Drivers: isolation inter-comptes (assets prives, cache PWA), reduction de la surface d'attaque des sessions, compatibilite PWA hors-ligne
> Related request: `req_005_durcir_kapsule_apres_audit_transversal`
> Related backlog: `item_010_durcir_kapsule_apres_audit_transversal`
> Related task: `task_006_durcir_kapsule_apres_audit_transversal`
> Reminder: Update status, linked refs, decision rationale, consequences, and follow-up work when you edit this doc.

# Overview
Cet ADR fixe trois choix d'architecture necessaires au durcissement P0/P1 de
Kapsule (audit 2026-07-18) qui ne peuvent pas etre tranches dans le code sans
decision explicite : (1) comment proteger les assets d'images des decks prives
tout en les servant via `<img>`, (2) quelle politique de cache PWA pour eviter
toute fuite inter-comptes, (3) comment durcir le stockage et le cycle de vie des
tokens de session herites de l'ADR 002 (90 jours, `localStorage`, SQLite clair).

# Context
- L'ADR 002 a pose une auth par token opaque en `Authorization: Bearer`, stocke
  en clair en base (`sessions`) et cote client dans `localStorage`, session
  glissante de 90 jours, prolongee par une ecriture SQLite a chaque requete.
- Les images de fiches sont resolues cote frontend en URL simple
  (`apps/frontend/src/lib/assets.js` -> `/api/decks/:deckId/assets/*`) et
  rendues via `<img src>`. Une balise `<img>` **n'envoie pas** l'en-tete
  `Authorization`, donc la garde `canViewDeck` (appliquee en P0 aux ecritures de
  progression/revision) ne peut pas etre transposee telle quelle a cette route
  sans casser l'affichage legitime. La route assets est aujourd'hui publique
  (`apps/backend/src/app.mjs`), donc une image de deck prive est accessible avec
  un chemin connu.
- En P0, le cache runtime du service worker sur `/api/decks` (`NetworkFirst`,
  cle = URL seule) melangeait les comptes hors ligne. Mesure interim deja
  livree : `/api` force en `NetworkOnly` (`apps/frontend/vite.config.mjs`).
- La cible reste une PWA : le token doit survivre au hors-ligne, et une lecture
  hors ligne segmentee par utilisateur reste souhaitable a terme.

# Decision
## 1. Assets prives — URL signee a duree de vie courte (retenu)
- La reponse de lecture d'un deck (`GET /api/decks/:deckId`, deja gardee par
  `canViewDeck`) enrichit chaque `image.src` relatif d'un jeton signe :
  `?sig=<HMAC>&exp=<epoch>`. Le HMAC (cle serveur dediee `KAPSULE_ASSET_SECRET`)
  couvre `deckId + chemin normalise + exp`.
- La route `GET /api/decks/:deckId/assets/*` verifie la signature et l'expiration
  avant de servir le fichier ; en cas d'echec -> 403. `canViewDeck` est donc
  applique **au moment de la signature** (lecture du deck), pas sur la balise
  `<img>`.
- Duree de vie courte (p. ex. 10 min), suffisante pour le rendu d'une session de
  lecture ; l'URL signee n'est reutilisable ni partageable durablement.
- Alternatives ecartees :
  - Cookie de session `httpOnly` envoye par `<img>` : reintroduit une surface
    CSRF et impose un couplage cookie/Bearer ; rejete.
  - Proxy JS (fetch + `blob:`) : complexifie le rendu, casse le lazy-loading
    natif et gonfle la memoire pour les gros decks ; rejete.

## 2. Cache PWA — `NetworkOnly` sur `/api` maintenu, offline segmente en follow-up
- Toute reponse authentifiee (`/api/*`) reste en `NetworkOnly` : aucune reponse
  utilisateur ne transite par le cache partage du navigateur. C'est l'etat P0
  livre et il devient la position par defaut.
- La lecture hors ligne des decks n'est PAS retablie via le cache HTTP. Si elle
  redevient un objectif produit, elle passera par un store applicatif
  (IndexedDB) **cle par `user_id`**, alimente cote app apres authentification et
  **purge explicitement au logout et au changement de compte**. Ce chantier est
  un follow-up P2 (fiabilite/offline, AC9), hors P0.

## 3. Sessions et token — durcissement du cycle de vie
- On conserve les tokens opaques Bearer (revocation simple, pas de JWT), mais :
  - Ecritures de session reduites : `last_used_at` n'est rafraichi qu'au-dela
    d'un seuil (p. ex. 1x/24h) au lieu d'a chaque requete, pour ne pas
    transformer chaque lecture en ecriture (perf, AC10).
  - Purge active des sessions expirees (tache au demarrage + a la connexion),
    plutot qu'a la seule reutilisation d'un ancien jeton.
  - Bornage des entrees d'auth (longueur max mot de passe avant hachage,
    tailles de corps) et hachage non bloquant + rate limit (AC4, Vague 2).
- Stockage client : le token reste en `localStorage` (contrainte PWA hors
  ligne). Le risque XSS est mitige par une politique CSP/HSTS/referrer stricte
  et l'absence d'injection HTML non echappee (AC7). Le passage a un cookie
  `httpOnly` est explicitement ecarte ici car la decision 1 supprime le seul
  besoin qui l'aurait justifie (auth des `<img>`), et il ajouterait du CSRF.

# Consequences
- Le contrat de lecture de deck change : `image.src` renvoye par l'API devient
  une URL signee et non plus le chemin brut ; le frontend cesse de reconstruire
  l'URL d'asset lui-meme (`assets.js`) et consomme la valeur fournie.
- Nouvelle variable d'environnement secrete `KAPSULE_ASSET_SECRET` (a versionner
  dans `.env.example` sans valeur, AC7) ; sa rotation invalide les URLs signees
  en cours (acceptable, TTL court).
- L'offline reste degrade tant que le store IndexedDB par utilisateur n'est pas
  livre : c'est un choix assume (isolation > hors-ligne) et la promesse offline
  du README doit etre alignee (AC9/AC11).
- La reduction des ecritures de session modifie legerement la semantique de
  `last_used_at` (granularite ~24h) : sans impact fonctionnel, a documenter.

# Risks
- URL signee : une fuite d'`KAPSULE_ASSET_SECRET` permettrait de forger des URLs
  d'assets — meme classe de risque que la cle de session ; TTL court et rotation
  limitent la fenetre.
- Horloge : `exp` repose sur l'heure serveur ; un decalage important pourrait
  rejeter des URLs valides. Marge de tolerance minime a prevoir.
- `localStorage` + XSS : risque residuel assume, reporte sur la qualite de la CSP
  et l'absence de rendu HTML non fiable.

# Follow-up
- Vague 1/2 : implementer la signature d'assets + verification, la purge et la
  reduction d'ecritures de session, le bornage d'entree et le rate limit.
- Vague 3 : `.env.example` avec `KAPSULE_ASSET_SECRET`, en-tetes CSP/HSTS Caddy.
- Vague 4 (P2) : decider si l'offline segmente par utilisateur (IndexedDB) est
  livre ou si la promesse offline est retiree du produit.

# References
- ADR precedent : `adr_002_kapsule_evolution_v0_2_auth_sm2_deploiement`
- Related request: `req_005_durcir_kapsule_apres_audit_transversal`
- Related backlog: `item_010_durcir_kapsule_apres_audit_transversal`
- Related task: `task_006_durcir_kapsule_apres_audit_transversal`
- Preuves : `docs/audit-2026-07-18.md` (sections Securite P1 isolation, P1/P2 HTTP)
