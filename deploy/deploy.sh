#!/usr/bin/env bash
# Deploie Kapsule en production, en une commande, depuis le poste de dev.
# Pousse le code (git), puis reconstruit et relance la stack sur le VPS via SSH.
#
# Prerequis (variables d'environnement) :
#   KAPSULE_SSH         utilisateur@hote du VPS      (ex: deploy@203.0.113.10)
#   KAPSULE_REMOTE_DIR  chemin du repo sur le VPS    (defaut: ~/kapsule)
#
# Usage :  KAPSULE_SSH=deploy@monvps ./deploy.sh
set -euo pipefail

SSH_TARGET="${KAPSULE_SSH:?Definissez KAPSULE_SSH=utilisateur@hote}"
REMOTE_DIR="${KAPSULE_REMOTE_DIR:-~/kapsule}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "→ Push de la branche '$BRANCH'…"
git push origin "$BRANCH"

echo "→ Deploiement sur $SSH_TARGET ($REMOTE_DIR)…"
ssh "$SSH_TARGET" bash -s <<EOF
  set -euo pipefail
  cd "$REMOTE_DIR"
  git fetch --all
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
  cd deploy
  docker compose up -d --build
  docker compose ps
EOF

echo "✓ Deploiement termine."
