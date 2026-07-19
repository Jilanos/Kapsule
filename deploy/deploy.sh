#!/usr/bin/env bash
# Deploie Kapsule en production, en une commande, depuis le poste de dev.
# Pousse le code (git), puis reconstruit et relance la stack sur le VPS via SSH.
#
# Prerequis (variables d'environnement) :
#   KAPSULE_SSH          utilisateur@hote du VPS      (ex: deploy@203.0.113.10)
#   KAPSULE_REMOTE_DIR   chemin du repo sur le VPS    (defaut: kapsule, relatif
#                                                      au home de connexion SSH)
#
# Authentification SSH (valeurs par defaut, surchargables) :
#   KAPSULE_SSH_KEY      clef privee              (defaut: <repo>/cle_hetzner)
#   KAPSULE_KNOWN_HOSTS  fichier known_hosts      (defaut: <repo>/.deploy_known_hosts)
# Par defaut on utilise la clef et le known_hosts versionnes a la racine du repo
# afin que le deploiement fonctionne sans configuration ~/.ssh prealable. Mettre
# KAPSULE_SSH_KEY="" pour s'en remettre entierement a l'agent SSH / ~/.ssh/config.
#
# Usage :  KAPSULE_SSH=deploy@monvps ./deploy.sh
set -euo pipefail

SSH_TARGET="${KAPSULE_SSH:?Definissez KAPSULE_SSH=utilisateur@hote}"
# Pas de tilde ici : `~` entre guillemets ne s'expanse pas et casserait le `cd`
# distant. Un chemin relatif est resolu depuis le home de connexion SSH.
REMOTE_DIR="${KAPSULE_REMOTE_DIR:-kapsule}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Clef et known_hosts : par defaut ceux du repo (s'ils existent), sinon on
# laisse ssh utiliser sa configuration habituelle.
SSH_KEY="${KAPSULE_SSH_KEY-$REPO_ROOT/cle_hetzner}"
KNOWN_HOSTS="${KAPSULE_KNOWN_HOSTS-$REPO_ROOT/.deploy_known_hosts}"

SSH_OPTS=()
if [ -n "$SSH_KEY" ]; then
  if [ ! -f "$SSH_KEY" ]; then
    echo "✗ Clef SSH introuvable : $SSH_KEY" >&2
    echo "  Definissez KAPSULE_SSH_KEY=/chemin/vers/clef (ou =\"\" pour votre config ~/.ssh)." >&2
    exit 1
  fi
  # IdentitiesOnly=yes : n'essaie QUE cette clef (evite « Too many auth failures »
  # si un agent charge d'autres clefs).
  SSH_OPTS+=(-i "$SSH_KEY" -o IdentitiesOnly=yes)
fi
if [ -n "$KNOWN_HOSTS" ] && [ -f "$KNOWN_HOSTS" ]; then
  # Verification stricte de la clef d'hote contre le known_hosts versionne :
  # protege contre un MITM sans dependre du known_hosts personnel de l'operateur.
  SSH_OPTS+=(-o "UserKnownHostsFile=$KNOWN_HOSTS" -o StrictHostKeyChecking=yes)
fi

echo "→ Push de la branche '$BRANCH'…"
git push origin "$BRANCH"

echo "→ Deploiement sur $SSH_TARGET ($REMOTE_DIR)…"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" bash -s <<EOF
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
