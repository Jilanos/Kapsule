# Kapsule

Visionneuse de **fiches de connaissance courtes** (5–10 min) organisées en
**decks**. Le contenu suit un **format JSON prédéfini** que des agents IA peuvent
produire directement, pour un affichage toujours cohérent et une intégration sans
friction.

- **Contrat de contenu** : voir [`SPEC.md`](SPEC.md) et
  [`packages/schema/deck.schema.json`](packages/schema/deck.schema.json).
- **Deck d'exemple** : [`decks/reseaux-essentiels.json`](decks/reseaux-essentiels.json).

## Structure du monorepo

```
packages/schema   Contrat de contenu : JSON Schema + validateur partagé
apps/backend      API REST (Node + Express + SQLite) : decks, fiches, progression, import
apps/frontend     PWA React + Vite : lecteur de fiches, decks, progression
decks/            Decks d'exemple / seed
SPEC.md           Consignes de format pour humains et agents IA
```

## Démarrer

```bash
npm install
npm test                 # tests du contrat de contenu
npm run dev:backend      # API sur http://localhost:3001
npm run dev:frontend     # PWA sur http://localhost:5173
```

## Valider un deck

```bash
npm run validate-deck -- decks/reseaux-essentiels.json
```

## Déploiement

Kapsule se déploie sur un VPS avec Docker Compose + Caddy (HTTPS auto). Voir
[`deploy/README.md`](deploy/README.md) : provisionnement, première mise en ligne,
`deploy.sh` (déploiement en une commande), sauvegardes et restauration.

## Générer des fiches avec une IA

Donner [`SPEC.md`](SPEC.md) comme consignes à un agent, puis importer le JSON
produit via l'UI ou l'API. Voir la section « Prompt type » de `SPEC.md`.
