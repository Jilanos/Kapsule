# Image de production Kapsule : API Node + frontend PWA buildé, un seul conteneur.
# Le meme process sert /api/* et la PWA statique (fallback SPA).

# --- Etape 1 : build (deps completes + build frontend) --------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Outils natifs pour better-sqlite3 si aucun prebuild n'est disponible.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Manifests d'abord (cache des couches d'install).
COPY package.json package-lock.json ./
COPY packages/schema/package.json packages/schema/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
RUN npm ci

# Code source + build du frontend. COPY cible (pas de `COPY . .`) : seuls les
# dossiers necessaires entrent dans le contexte de build, jamais les secrets de
# deploiement du depot (cf. audit 2026-07-18, P0 hygiene des secrets).
COPY packages ./packages
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend
COPY decks ./decks
RUN npm run build --workspace @kapsule/frontend
# Retire les dependances de dev pour l'image finale.
RUN npm prune --omit=dev

# --- Etape 2 : runtime (leger) --------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV KAPSULE_DB=/data/kapsule.sqlite
ENV KAPSULE_UPLOADS=/data/uploads

# Dependances de production + code + frontend buildé.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/backend ./apps/backend
COPY --from=build /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=build /app/decks ./decks

# Volume des donnees persistantes (base + uploads).
VOLUME ["/data"]
EXPOSE 3001

CMD ["node", "apps/backend/src/server.mjs"]
