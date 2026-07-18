# Contribuer a Kapsule

Merci de votre interet ! Ce guide resume le strict necessaire pour contribuer.

## Prerequis

- Node.js >= 20 et npm.
- Monorepo npm workspaces (`packages/*`, `apps/*`).

## Installation

```bash
npm ci
```

## Developpement

```bash
npm run dev:backend    # API sur http://localhost:3001
npm run dev:frontend   # PWA (proxy /api vers le backend)
```

## Avant d'ouvrir une PR

Toutes ces commandes doivent passer (elles sont aussi executees en CI) :

```bash
npm test                 # tests de tous les workspaces
npm run build            # build de production
npm audit --omit=dev     # aucune vulnerabilite de production
npm run validate-deck -- <fichier.json>   # si vous touchez un deck
```

Regles :

- Ne committez jamais de secret (cle, token, mot de passe) ni de donnee
  personnelle. Le depot est scanne automatiquement.
- Les tests doivent utiliser leurs propres fixtures
  (`apps/backend/test/fixtures/`), pas les decks de demonstration mutables.
- Respectez le style du code environnant (memes conventions de nommage, de
  commentaires et d'idiomes).
- Une PR = une intention claire ; decrivez le pourquoi, pas seulement le quoi.

## Licence

En contribuant, vous acceptez que votre contribution soit publiee sous licence
MIT (voir `LICENSE`).
