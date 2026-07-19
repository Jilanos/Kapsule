# Kapsule

Visionneuse de **fiches de connaissance courtes** (5–10 min) organisées en
**decks**. Le contenu suit un **format JSON prédéfini** que des agents IA peuvent
produire directement, pour un affichage toujours cohérent et une intégration sans
friction.

Kapsule est une **PWA** installable : lecture, progression et révision espacée
fonctionnent sur mobile comme sur ordinateur, avec un thème clair/sombre
automatique.

> _Ajouter ici une capture d'écran ou un GIF du parcours (liste de decks →
> lecture d'une fiche → quiz → révision)._ `docs/screenshot.png`

## Fonctionnalités

- **Decks & fiches** : import par JSON validé contre un contrat strict
  (jusqu'à 200 fiches/deck), lecture structurée (intro, concepts, exemples,
  points clés, quiz).
- **Comptes multi-appareils** : inscription / connexion par email + mot de passe,
  sessions par appareil révocables (voir Sécurité).
- **Rôles & visibilité** : `guest` / `master` / `admin` ; decks `private`,
  `general`, `master`. Toute route liée à un deck applique la même décision
  d'autorisation.
- **Progression** cloisonnée par utilisateur.
- **Répétition espacée (SM-2)** : la note dérive du score de quiz ; vue
  « Révisions du jour » multi-decks.
- **Hors ligne** : le shell de l'app est pré-caché. Les **réponses d'API
  authentifiées ne sont pas mises en cache** (isolation inter-comptes) ; la
  lecture hors ligne segmentée par utilisateur est un chantier suivi
  (voir [ADR 003](logics/architecture/adr_003_kapsule_durcissement_assets_prives_cache_pwa_et_sessions.md)).

## Structure du monorepo

```
packages/schema   Contrat de contenu : JSON Schema + validateur partagé
apps/backend      API REST (Node + Express + SQLite) : auth, decks, fiches, progression, SM-2, import
apps/frontend     PWA React + Vite : lecteur, decks, progression, révision
decks/            Decks d'exemple / seed
deploy/           Docker Compose + Caddy + scripts de déploiement et sauvegarde
SPEC.md           Consignes de format pour humains et agents IA
```

## Prérequis

- **Node.js ≥ 20** et **npm** (monorepo npm workspaces).

## Démarrer

```bash
npm ci
npm run dev:backend      # API sur http://localhost:3001
npm run dev:frontend     # PWA sur http://localhost:5173 (proxy /api -> backend)
```

## Vérifier (comme la CI)

```bash
npm test                 # tests de tous les workspaces (schéma, backend, smoke frontend)
npm run build            # build de production
npm run format:check     # style Prettier
npm run budget           # budget de performance du bundle (après build)
npm audit --omit=dev     # aucune vulnérabilité de production
npm run validate-deck -- decks/reseaux-essentiels.json
```

## Configuration (variables d'environnement)

| Variable               | Rôle                                                                 | Défaut               |
| ---------------------- | -------------------------------------------------------------------- | -------------------- |
| `PORT`                 | Port d'écoute de l'API                                               | `3001`               |
| `KAPSULE_DB`           | Chemin du fichier SQLite                                             | local `apps/backend` |
| `KAPSULE_UPLOADS`      | Dossier des assets d'images de decks                                 | local `apps/backend` |
| `KAPSULE_REGISTRATION` | `open` / `closed` — **fermée par défaut** si `NODE_ENV=production`   | selon environnement  |
| `KAPSULE_ASSET_SECRET` | Secret HMAC de signature des URLs d'assets (**obligatoire** en prod) | —                    |

Voir [`deploy/.env.example`](deploy/.env.example).

## Architecture (résumé)

- **Backend** : Express + SQLite (`better-sqlite3`), migrations versionnées.
  Couches séparées — schéma (`packages/schema`), stockage (`store.mjs`),
  autorisations pures (`permissions.mjs`), auth/sessions (`auth.mjs`), routes
  (`app.mjs`). Un seul conteneur sert l'API et la PWA buildée en production.
- **Frontend** : React + React Router + Vite (PWA via `vite-plugin-pwa`).
- **Décisions d'architecture** : voir `logics/architecture/` (ADR 001–003).

## Sécurité

- Mots de passe hachés (`scrypt`, sel par utilisateur), hachage asynchrone.
- Sessions par token opaque en `Authorization: Bearer`, purge des sessions
  expirées, écritures de session throttlées.
- Rate limiting sur `login`/`register`, bornage des entrées.
- Assets d'images de decks servis par **URL signée** à durée de vie courte.
- En production : conteneur non-root, en-têtes CSP/HSTS via Caddy, inscription
  fermée par défaut.
- CI : tests, build, audit des dépendances, scan de secrets (gitleaks), CodeQL,
  scan d'image (Trivy).

Signalement de vulnérabilités : voir [`SECURITY.md`](SECURITY.md).

## Déploiement

VPS avec Docker Compose + Caddy (HTTPS automatique). Voir
[`deploy/README.md`](deploy/README.md) : provisionnement, première mise en ligne,
`deploy.sh`, sauvegardes locales et hors site, restauration.

## Générer des fiches avec une IA

Donner [`SPEC.md`](SPEC.md) comme consignes à un agent, puis importer le JSON
produit via l'UI ou l'API. Voir la section « Prompt type » de `SPEC.md`.

## Limites connues

- Lecture hors ligne des decks désactivée tant que le cache segmenté par
  utilisateur n'est pas livré (choix d'isolation, ADR 003).
- Pas de recherche / tri / pagination pour de très grandes bibliothèques.
- Administration des rôles par accès direct à la base (pas d'UI dédiée).
- Stockage SQLite mono-instance (pas de montée en charge multi-nœuds).

## Licence

[MIT](LICENSE).
