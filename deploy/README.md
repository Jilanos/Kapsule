# Déploiement de Kapsule

Kapsule se déploie sur un VPS avec **Docker Compose** : un conteneur applicatif
(API Node + PWA buildée, un seul process) derrière **Caddy** qui gère le HTTPS
automatiquement. La base SQLite et les uploads vivent dans un **volume persistant**.

```
Internet ──HTTPS──> Caddy ──> app (API + PWA) ──> /data (SQLite + uploads)
                     │
                     └── extensible à d'autres apps en sous-domaines
```

## 1. Prérequis

- Un VPS (recommandé : Hetzner CX23 ou OVH VPS, Debian 12 / Ubuntu 24.04).
- Un nom de domaine avec un enregistrement DNS **A** (et **AAAA** si IPv6)
  pointant `kapsule.mondomaine.fr` vers l'IP du VPS.
- Une clé SSH pour se connecter au VPS.

## 2. Provisionnement du VPS (une fois)

```bash
# Sur le VPS, en root ou via sudo :
apt update && apt upgrade -y

# Docker + plugin compose
curl -fsSL https://get.docker.com | sh

# Durcissement de base
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
# (SSH par clé uniquement : désactiver PasswordAuthentication dans /etc/ssh/sshd_config)

# Mises à jour de sécurité automatiques
apt install -y unattended-upgrades && dpkg-reconfigure -plow unattended-upgrades

# Un utilisateur de déploiement non-root, membre du groupe docker
adduser --disabled-password deploy && usermod -aG docker deploy
```

## 3. Première mise en ligne

```bash
# En tant qu'utilisateur 'deploy' sur le VPS :
git clone https://github.com/Jilanos/Kapsule.git ~/kapsule
cd ~/kapsule/deploy
cp .env.example .env
# éditer .env : renseigner KAPSULE_DOMAIN (et KAPSULE_REGISTRATION=open pour créer les comptes)

docker compose up -d --build
docker compose ps        # les deux services doivent être "running"
```

Caddy obtient le certificat Let's Encrypt automatiquement dès que le DNS est
correct. L'app est alors accessible sur `https://kapsule.mondomaine.fr` et la
PWA s'installe depuis Chrome Android (menu → « Installer l'application »).

Une fois vos comptes créés, fermez les inscriptions :

```bash
# dans .env
KAPSULE_REGISTRATION=closed
docker compose up -d      # recharge l'app
```

## 4. Déploiements suivants (depuis le poste de dev)

```bash
KAPSULE_SSH=deploy@monvps ./deploy.sh
```

Le script pousse la branche courante, puis sur le VPS : `git pull` + `docker
compose up -d --build`. Une seule commande.

## 5. Sauvegardes

La sauvegarde utilise l'API `.backup()` de SQLite (cohérente même en mode WAL)
et conserve les 7 derniers jours (`KAPSULE_BACKUP_KEEP_DAYS`). Les fichiers sont
dans le volume `kapsule-data`, sous `/data/backups`.

Déclenchement manuel :

```bash
cd ~/kapsule/deploy && ./backup.sh
```

Cron quotidien (à 3 h), à ajouter avec `crontab -e` :

```cron
0 3 * * * cd /home/deploy/kapsule/deploy && ./backup.sh >> /var/log/kapsule-backup.log 2>&1
```

> **Recommandé (suivi ultérieur)** : copier les sauvegardes hors du VPS
> (ex. `rclone` vers un stockage objet) — un VPS unique concentre les pannes.

## 6. Restauration (procédure testée)

```bash
cd ~/kapsule/deploy

# 1. Lister les sauvegardes disponibles
docker compose exec app ls -1 /data/backups

# 2. Arrêter l'app (Caddy peut rester actif)
docker compose stop app

# 3. Remplacer la base par la sauvegarde choisie
docker compose run --rm --entrypoint sh app -c \
  "cp /data/backups/kapsule-<HORODATAGE>.sqlite /data/kapsule.sqlite && \
   rm -f /data/kapsule.sqlite-wal /data/kapsule.sqlite-shm"

# 4. Redémarrer
docker compose up -d app
```

## 7. Vérifier / dépanner

```bash
docker compose logs -f app      # logs applicatifs
docker compose logs -f caddy    # obtention du certificat, erreurs HTTPS
curl -s https://kapsule.mondomaine.fr/api/health   # -> {"ok":true}
```

## 8. Persistance des données

La base et les uploads sont dans le volume Docker `kapsule-data`. Un
`docker compose down && docker compose up -d` **ne perd aucune donnée** (le
volume survit ; seul `docker compose down -v` le détruirait — à ne jamais faire
en production).
