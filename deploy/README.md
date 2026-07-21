# Déploiement de Kapsule

Kapsule se déploie sur un VPS avec **Docker Compose** : un conteneur applicatif
(API Node + PWA buildée, un seul process) derrière **Caddy** qui gère le HTTPS
automatiquement. Caddy sert aussi le portail principal et les vitrines statiques
du domaine. La base SQLite et les uploads vivent dans un **volume persistant**.

```
Internet ──HTTPS──> Caddy ──> paulmondou.fr (portail statique)
                     ├── kapsule.paulmondou.fr ──> app (API + PWA) ──> /data
                     ├── f1.paulmondou.fr ──> vitrine statique
                     └── gnosis.paulmondou.fr ──> vitrine statique
```

## 1. Prérequis

- Un VPS (recommandé : Hetzner CX23 ou OVH VPS, Debian 12 / Ubuntu 24.04).
- Un nom de domaine avec des enregistrements DNS **A** (et **AAAA** si IPv6)
  pointant le domaine racine et les sous-domaines vers l'IP du VPS. Un wildcard
  `*.paulmondou.fr` est le plus simple pour les vitrines.
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
# éditer .env : renseigner SITE_DOMAIN, KAPSULE_DOMAIN
# et KAPSULE_REGISTRATION=open pour créer les comptes

docker compose up -d --build
docker compose ps        # les deux services doivent être "running"
```

Caddy obtient les certificats Let's Encrypt automatiquement dès que le DNS est
correct. Le portail est accessible sur `https://paulmondou.fr`, Kapsule sur
`https://kapsule.paulmondou.fr`, et les vitrines statiques dans
`deploy/sites/<nom>/`.

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
curl -s https://kapsule.paulmondou.fr/api/health   # -> {"ok":true}
curl -I https://paulmondou.fr
curl -I https://f1.paulmondou.fr
curl -I https://gnosis.paulmondou.fr
```

## 8. Persistance des données

La base et les uploads sont dans le volume Docker `kapsule-data`. Un
`docker compose down && docker compose up -d` **ne perd aucune donnée** (le
volume survit ; seul `docker compose down -v` le détruirait — à ne jamais faire
en production).
