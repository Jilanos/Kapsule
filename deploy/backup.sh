#!/usr/bin/env bash
# Sauvegarde quotidienne de la base Kapsule (a lancer via cron sur le VPS).
# Declenche la sauvegarde en ligne dans le conteneur ; rotation geree par le
# script Node (KAPSULE_BACKUP_KEEP_DAYS, defaut 7 jours). Les sauvegardes
# vivent dans le volume kapsule-data sous /data/backups.
#
# Exemple de cron (tous les jours a 3h) :
#   0 3 * * * cd /home/deploy/kapsule/deploy && ./backup.sh >> /var/log/kapsule-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")"
docker compose exec -T app node apps/backend/src/backup.mjs
echo "[$(date -Is)] sauvegarde locale OK"

# --- Copie hors site (audit 2026-07-18, AC10) -----------------------------
# Les sauvegardes locales vivent sur le meme VPS : une perte de la machine les
# emporte. Configurez une copie hors site (ex: rclone vers un stockage objet)
# en definissant KAPSULE_OFFSITE_REMOTE (ex: "b2:kapsule-backups").
# Le volume kapsule-data est monte pour lecture des sauvegardes.
if [ -n "${KAPSULE_OFFSITE_REMOTE:-}" ]; then
  docker run --rm \
    -v kapsule-data:/data:ro \
    -v "${RCLONE_CONFIG_DIR:-$HOME/.config/rclone}:/config/rclone:ro" \
    rclone/rclone:latest \
    copy /data/backups "${KAPSULE_OFFSITE_REMOTE}" --max-age 25h
  echo "[$(date -Is)] copie hors site vers ${KAPSULE_OFFSITE_REMOTE} OK"
else
  echo "[$(date -Is)] copie hors site ignoree (KAPSULE_OFFSITE_REMOTE non defini)"
fi
