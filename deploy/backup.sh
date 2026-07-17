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
echo "[$(date -Is)] sauvegarde OK"
