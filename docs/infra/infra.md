# Infra

[Citadel](../../README.md) › Infra

Le site, son API, la stack média (Jellyfin, qBittorrent, *arr derrière un VPN) et la console d'administration tournent sur le NAS, dans un seul projet Docker Compose (`infra/compose.yml`). Caddy reçoit le trafic web et gère les certificats. Une mise en prod part de votre PC : GitHub construit les images, le NAS les télécharge et les déploie après votre confirmation. Le détail des choix est commenté dans les fichiers d'`infra/` ; les mails sont dans [mails](../emails/emails.md). Ce qui reste à faire est dans le [todo](../todo/todo.md#4-hébergement-et-console).

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Contraintes](#2-contraintes)
3. [Prérequis](#3-prérequis)
4. [Commandes](#4-commandes)
5. [Accès](#5-accès)
6. [La base depuis DBeaver](#6-la-base-depuis-dbeaver)
7. [Sauvegardes et jobs](#7-sauvegardes-et-jobs)
8. [Accès au Drive (rclone)](#8-accès-au-drive-rclone)
9. [Alertes (healthchecks.io)](#9-alertes-healthchecksio)
10. [Réglages hors du dépôt](#10-réglages-hors-du-dépôt)
11. [Remonter le NAS de zéro](#11-remonter-le-nas-de-zéro)

## 1. Fonctionnement

- **Le NAS** : TOS, Intel N95 4 cœurs, 8 Go de RAM. `Volume1` : SSD NVMe 500 Go (configs dans `/Volume1/appdata`, Docker). `Volume2` : HDD 12 To (médias et torrents sur le même volume, pour les hardlinks des *arr). Les deux en Btrfs, un disque par volume, sans redondance ni onduleur : d'où les copies sur l'autre disque et hors site (§7).
- **Un seul projet Compose**, services groupés par préfixe : `infra-` (Caddy, `infra-ops` qui lance les jobs, la console…), `site-prod-` (front, serveur, base, migrations), `site-preprod-` (la même chose, à la demande), `media-`.
- **Pré-prod** : sur le NAS, arrêtée la plupart du temps. Mêmes images que la prod, `.env.prod` avec la base `citadel_preprod`, restaurée chaque nuit depuis la prod (§7). Elle sert au test de restauration et à la répétition de chaque déploiement qui apporte des migrations.
- **`citadel deploy <version>`** : plan, confirmation, dump de la base, répétition en pré-prod si la version a des migrations (dernier dump importé, migrations, serveur démarré : un échec arrête tout, la prod n'est pas touchée), migrations en prod, nouveaux conteneurs, vérifications, retour arrière automatique en cas d'échec.
- **La console** (`apps/admin`, port 8100) dépose ses demandes (jobs, déploiements, restaurations) dans `state/queue/`, qu'`infra-ops` vérifie (liste fermée d'actions et de versions) puis exécute : une faille dans la console ne donne ni les pleins droits sur Docker, ni l'accès au Drive.
- **Bandeau du site** : `infra-ops` écrit le message dans un fichier JSON (identifiant, texte, date de fin) que Caddy sert tel quel (`/banner.json`) : ni base ni API en jeu, il s'affiche même si l'API est en panne. Après une restauration, un message automatique reste 3 mois. Il ne disparaît que par sa croix, retenue avec l'identifiant du message : un nouveau message le réaffiche.

## 2. Contraintes

- Le NAS ne reçoit que des images, ni git ni Node. Une version est un tag git (`v2026.10.25.01`), porté par toutes les images.
- Une migration passée en prod ne se modifie plus, et le code N-1 doit tourner sur le schéma N : un retour arrière ne touche jamais à la base.
- Aucun secret dans le dépôt, dans une image ou dans une variable `VITE_*`. Bitwarden est la référence ; `.env.prod` vit sur le NAS, dans `/Volume1/citadel/`.
- Seuls le site, `/api` et Jellyfin sont joignables depuis Internet. Le reste (console sur le port 8100, *arr, SSH sur un port à part, MariaDB par tunnel SSH) passe par le LAN ou Tailscale.

## 3. Prérequis

- Sur votre PC : Docker Desktop, Git Bash (le `bash` de PowerShell serait celui de WSL, sans vos clés SSH), et l'alias `nas` de `~/.ssh/config`.
- Sur le NAS : Docker, la commande `citadel` et `.env.prod`, rempli depuis `.env.prod.example`. `prod:local` lit `infra/compose.local.env`.

## 4. Commandes

Sur votre PC :

| Commande | Effet |
| --- | --- |
| `pnpm prod:local` | les images de prod sur votre PC, stack média comprise : https://citadel.localhost:8443, la console sur http://localhost:8100 |
| `pnpm prod:local:down` | arrête tout et efface les volumes jetables |
| `pnpm tools release` | demande « réelle » ou « simulation » ; la réelle valide, tague, pousse, attend les images, puis lance le déploiement sur le NAS, qui montre son plan et attend votre « o » |
| `pnpm tools release --dry-run` | la simulation directe : s'arrête juste avant le tag, rien ne part |
| `pnpm tools` | menu des outils de `scripts/` : `hashAdminPassword` (pour `ADMIN_PASSWORD_HASH`), `generateAuthSecrets`, `checkEnvFiles`, `clean`… ; `pnpm tools <nom>` lance l'un d'eux directement |

Sur le NAS (`ssh nas`), en secours de la console :

| Commande | Effet |
| --- | --- |
| `citadel status` | état des services, version en service |
| `citadel start\|stop\|restart <cible>` | un service (`site-prod-server`) ou un groupe (`media`) |
| `citadel logs <service>` | 200 dernières lignes, puis la suite en direct |
| `citadel up` | relance tout ce qui doit toujours tourner |
| `citadel deploy <version>` | déploie une version (§1) |
| `citadel rollback` | revient à la version précédente |
| `citadel restore-db pre-deploy\|latest` | remet la base d'avant le dernier déploiement (puis `citadel rollback`), ou la dernière sauvegarde ; puis rejoue le journal de restauration du serveur et vide les sessions ([authentification, §8.3](../auth/auth.md#83-sauvegardes-et-restauration)) |
| `citadel maintenance on\|off` | page de maintenance (503) à la place du site, ou plus |
| `citadel banner "<message>"\|off` | le bandeau du site, ou plus de bandeau |
| `citadel admin-password` | hachage du mot de passe de la console, depuis l'image |
| `citadel <job>` | lance un job tout de suite (§7) |

Mettre à jour une image tierce : changer sa version dans `compose.yml`, commiter, `pnpm tools release` ; revenir en arrière : `citadel rollback`. Chaque nuit, `update-check` liste dans la console les mises à jour des images tierces, avec leurs notes de version.

Après une mise à jour de TOS, un conteneur qui ne démarre plus (`Operation not permitted`) se répare en le recréant (`--force-recreate`).

## 5. Accès

Depuis vos appareils. « `:port` » : l'IP du NAS en LAN, son nom (`NAS_HOSTNAME`) par Tailscale, même port des deux côtés. Internet n'atteint que ce que la box redirige : 80 et 443, vers Caddy.

| Service | Adresse | Internet | LAN, Tailscale | Connexion |
|---|---|---|---|---|
| Site (`www` redirigé) | `https://alexandre-richard.fr`, par Cloudflare | ✅ | ✅ par le domaine | comptes du site pour les projets privés |
| API | `https://alexandre-richard.fr/api` | ✅ sauf `/api/internal` | ✅ | session pour les endpoints `protected` |
| Jellyfin | `https://jellyfin.alexandre-richard.fr` ; `:8096` en direct | ✅ par le domaine | ✅ les deux | comptes Jellyfin |
| qBittorrent, Prowlarr, Radarr, Sonarr, Bazarr, cross-seed | `:8080`, `:9696`, `:7878`, `:8989`, `:6767`, `:2468` | ❌ | ✅ | la leur : leurs réglages suivent leurs dossiers |
| Console | `http://…:8100` | ❌ | ✅ | son mot de passe |
| Pré-prod | `http://…:8002`, servie par Caddy | ❌ | ✅ | comptes de la pré-prod |
| Interface de TOS | ses ports habituels | ❌ jamais | ✅ | compte TOS |
| SSH | son port, dans votre `~/.ssh/config` | ❌ jamais | ✅ | clé seulement |
| MariaDB, prod et pré-prod | `127.0.0.1:3306` et `3307` du NAS | ❌ | tunnel SSH | comptes plus bas |
| API Docker | socket du NAS | ❌ | ❌ | `infra-ops` ; la console à travers `infra-socket-proxy` |

- API : les projets privés (Game Death Counter, Backlog) exigent une session ([authentification](../auth/auth.md#411-protection-des-endpoints-et-des-projets)) ; le contact, l'état des mails et les parcours de l'authentification restent ouverts, limités par IP. `/api/internal` est bloqué par Caddy et réservé à la console, par le réseau Docker.
- Console en HTTP, sans certificat à installer sur chaque appareil : par Tailscale, WireGuard chiffre tout ; en LAN, le mot de passe ne traverse que votre réseau domestique. Accepté.

## 6. La base depuis DBeaver

- MariaDB écoute sur `127.0.0.1:3306` du NAS (pré-prod : `3307`) : invisible depuis le réseau, joignable seulement depuis le NAS lui-même, donc par un tunnel SSH.
- DBeaver, onglet SSH : hôte : son nom Tailscale, port : celui de SSH, votre utilisateur, votre clé. Onglet principal : hôte `127.0.0.1`, port `3306`, base `citadel`, compte `citadel_migrator`.
- Le SSH de TOS autorise les tunnels : `AllowTcpForwarding` garde sa valeur par défaut.

| Compte | Pour | Droits |
|---|---|---|
| `citadel_app` | le serveur | lire et écrire les données |
| `citadel_migrator` | Flyway, et vous dans DBeaver | structure et données de `citadel`, rien d'autre |
| `citadel_backup` | les dumps | lecture seule |
| `root` | dépannage | seulement depuis l'intérieur du conteneur |

Mêmes comptes en pré-prod, avec des droits sur `citadel_preprod` seulement.

## 7. Sauvegardes et jobs

### 7.1 Ce qui est sauvegardé

| Donnée | Méthode | Quand |
|---|---|---|
| Base du site | `mariadb-dump` sans arrêt, compressé, avec son `.sha256` et un manifeste (lignes par table, dernière migration, version) | chaque jour à 5 h, et avant chaque déploiement ou restauration |
| `/Volume1/appdata` (sans les dossiers des bases ni le journal de restauration) | archive `tar` + `zstd`, services média arrêtés puis remis comme avant | chaque lundi à 3 h |
| `.env.prod`, `rclone.conf` | Bitwarden (la référence), et dans l'archive du lundi | à chaque changement |
| Images, compose, scripts | rien : dans git et sur GHCR | — |
| Médias | rien, choix assumé : les *arr savent les retrouver | — |

- **Mêmes fichiers et même rétention sur le HDD** (`/Volume2/backups/`) **et sur le Drive**, chiffrés par rclone (§8), un dossier par type de sauvegarde.
- **Rétention** : base, chaque jour : les 14 derniers jours + les 4 derniers dimanches + les 2 derniers premiers dimanches du mois ; base, avant déploiement : les 2 derniers, 30 jours au plus ; configs : les 4 dernières semaines + les 2 derniers premiers lundis du mois. La plus vieille sauvegarde de la base a moins de 10 semaines : une donnée effacée en disparaît en moins de 3 mois ([authentification, §8.1](../auth/auth.md#81-la-règle-des-3-mois)).
- **`db-restore-test`** prouve la sauvegarde : il télécharge depuis le Drive le dump de la nuit (et prouve ainsi que la copie hors site se lit et se déchiffre), l'importe en pré-prod, compare tables et nombres de lignes au manifeste, vérifie avec Flyway un schéma à jour, puis arrête la pré-prod. Ses données restent jusqu'à la nuit suivante, pour regarder.
- **`config-verify`** extrait l'archive du lundi, contrôle chaque base SQLite (`PRAGMA integrity_check`) et la présence des fichiers clés des services.

### 7.2 Planning

Dans `infra/ops/crontab`. `citadel <job>` en lance un tout de suite, comme le bouton ▶ de la console.

| Quand | Job | Rôle |
|---|---|---|
| Chaque minute | `vpn-watch`, `tailscale-status` | relance les services du réseau de Gluetun qui l'ont perdu ; état de Tailscale pour la console |
| Toutes les 5 min | `site-check` | le site répond depuis Internet (par Cloudflare, comme un visiteur) |
| Toutes les 5 min | `auto-stop` | arrête les services démarrés à la main après leur délai (les *arr, par exemple), jamais Jellyfin pendant une lecture |
| Toutes les heures | `qbittorrent-stats`, `storage-stats` | historiques de la console |
| Chaque nuit, 3 h 30 | `log-retention` | vide le log d'un conteneur dont la plus vieille ligne a plus de 90 jours |
| Chaque nuit, 4 h | `update-check` | mises à jour des images tierces |
| Chaque nuit, 4 h 30 | `vpn-leak-test` | IP de sortie et DNS des téléchargements, par le VPN |
| Chaque nuit, 5 h | `db-backup`, puis `db-restore-test` | §7.1 |
| Lundi, 3 h | `config-backup`, puis `config-verify` | §7.1 |
| Chaque soir, 23 h 50 | `contact-retry` | relance des messages de contact en attente ([mails, §6](../emails/emails.md#6-côté-serveur)) |

## 8. Accès au Drive (rclone)

Les sauvegardes partent sur votre Google Drive, chiffrées par rclone. Deux « remotes » dans `rclone.conf` : `gdrive` (le dossier `citadel` de votre Drive) et `citadel-backups` (le même dossier, chiffré : contenus illisibles sans le mot de passe et le sel). **Le mot de passe et le sel vont dans Bitwarden avant le premier envoi** : sans eux, les sauvegardes sont illisibles, y compris pour vous si le NAS meurt. Changer de fournisseur ne change que le « remote ».

Pourquoi ça tient : votre propre client OAuth, publié **en production**. En mode « test », Google coupe le jeton au bout de 7 jours (la cause probable des pannes d'avant). La portée `drive.file` ne donne accès qu'aux fichiers créés par rclone : pas de vérification Google à demander, et rien d'autre de votre Drive n'est lisible. Le jeton ne meurt ensuite que si vous le révoquez, ou après 6 mois sans servir.

Accès limité au seul dossier `citadel`, en deux couches : Google (`drive.file`) cache à rclone tout ce qu'il n'a pas créé ; rclone (`root_folder_id`) prend `citadel` pour racine, et aucune commande ne peut en sortir.

### 8.1 Client OAuth

Sur <https://console.cloud.google.com>, connecté au compte Google du Drive. Tout ce qui s'affiche une seule fois va dans Bitwarden **avant** de passer à la suite.

1. Sélecteur de projet → Nouveau projet → `citadel-rclone` → Créer, puis le sélectionner.
2. API et services → Bibliothèque → « Google Drive API » → Activer.
3. Google Auth Platform → Commencer : nom `citadel-rclone`, votre email ; audience **Externe** ; votre email en contact ; accepter → Créer.
4. Accès aux données → Ajouter ou supprimer des champs d'application → filtrer `drive.file` → cocher `.../auth/drive.file` → Mettre à jour → Enregistrer.
5. Branding : votre email en assistance, l'adresse du site en page d'accueil **et** en règles de confidentialité (Google ne vérifie pas ces pages avec `drive.file`), pas de logo (il déclencherait une vérification) → Enregistrer.
6. Audience → **Publier l'application** → Confirmer. Le statut doit être « En production ».
7. Clients → Créer un client → type **Application de bureau**, nom `rclone` → Créer. Copier l'ID client et le code secret dans Bitwarden (le secret n'est plus réaffiché).

### 8.2 Remotes

Sur votre PC. Installer rclone (`winget install Rclone.Rclone`), ouvrir un nouveau terminal, puis `rclone config` :

1. `n` (nouveau remote), nom `gdrive`, type `drive`, `client_id` et `client_secret` collés, `scope` : `drive.file`, `service_account_file` vide, configuration avancée `n`, navigateur `y`. Choisir le compte ; si Google affiche « Google n'a pas validé cette application » : Paramètres avancés → Accéder à citadel-rclone → Continuer. « Success » s'affiche. Shared Drive `n`, garder `y`, puis `q`.
2. Enfermer `gdrive` dans le dossier `citadel`, dans Git Bash :
   ```sh
   rclone mkdir gdrive:citadel
   ID=$(rclone lsjson gdrive: --dirs-only | jq -r '.[] | select(.Name == "citadel") | .ID')
   echo "$ID"                                   # attendu : une suite de lettres et de chiffres
   rclone config update gdrive root_folder_id "$ID"
   rclone lsd gdrive:                           # attendu : rien (on est dans citadel, vide)
   ```
   (`jq` absent : `winget install jqlang.jq`.) Puis relancer `rclone config`, pour créer le remote chiffré :
3. `n`, nom `citadel-backups`, type `crypt`, `remote` : `gdrive:`, `filename_encryption` et `directory_name_encryption` par défaut (Entrée) : changés au 5.
4. `password` : `g` (générer), 256 bits, `y`. **Copier le mot de passe dans Bitwarden tout de suite.** `password2` (le sel) : pareil. Configuration avancée `n`, garder `y`, puis `q`.
5. Des noms lisibles sur le Drive, seul le contenu est chiffré (et pas de `.bin` ajouté) : `rclone config update citadel-backups filename_encryption off directory_name_encryption false suffix none`.
6. Le fichier entier (`rclone config file` donne son chemin) va aussi dans Bitwarden.

### 8.3 Vérifier

Dans Git Bash : créer un fichier lisible, l'envoyer chiffré, le relire sans aide (juste les secrets) :

```sh
# 1. Créer un fichier avec du texte que vous reconnaîtrez
echo "test de la citadel" > verification.txt

# 2. L'envoyer sur le Drive (via rclone, il sera chiffré)
rclone copy verification.txt citadel-backups:verify/

# 3. ⚠️  Allez observer sur votre Drive (https://drive.google.com)
#    Le fichier garde son nom, mais son contenu est illisible : c'est le chiffrement.

# 4. Relire le fichier en clair via rclone (en utilisant la config citadel-backups)
echo "--- Via citadel-backups (normal) ---"
rclone cat citadel-backups:verify/verification.txt

# 5. Relire le MÊME fichier JUSTE avec vos secrets Bitwarden
#    (pas de config rclone, pas de NAS : juste les deux codes de Bitwarden)
#    Cela prouve que vous pouvez récupérer vos données en cas de catastrophe.
echo "--- Avec JUSTE les secrets (mode urgence) ---"
read -rsp "Mot de passe (depuis Bitwarden) : " PW; echo
read -rsp "Sel (depuis Bitwarden) : " SALT; echo
rclone cat ":crypt,remote='gdrive:',password='$(rclone obscure "$PW")',password2='$(rclone obscure "$SALT")',filename_encryption=off,directory_name_encryption=false,suffix=none:verify/verification.txt"
unset PW SALT

# 6. Nettoyer
rclone purge citadel-backups:verify/
rm verification.txt
echo "Vérification terminée ✓"
```

### 8.4 Sur le NAS

Depuis Git Bash sur votre PC (pas PowerShell : `<` et `$APPDATA` n'y marchent pas). Cela copie le fichier de config depuis votre PC vers le NAS, avec des permissions très restrictives (seul le propriétaire peut le lire) :

```sh
# 1. Copier le fichier de votre PC vers le NAS, via SSH
ssh nas 'umask 077 && cat > /Volume1/citadel/rclone.conf' < "$APPDATA/rclone/rclone.conf"
```

Ça se décompose ainsi :
- `ssh nas` : se connecter au NAS en SSH
- `umask 077` : les permissions par défaut vont être `rw-------` (seul le propriétaire lit/écrit)
- `cat > /Volume1/citadel/rclone.conf` : écrire ce qui arrive sur l'entrée standard dans ce fichier
- `< "$APPDATA/rclone/rclone.conf"` : lire depuis votre fichier rclone local (Windows)

```sh
# 2. Vérifier que le fichier est bien là, avec les bonnes permissions
ssh nas ls -l /Volume1/citadel/rclone.conf
```

Attendu : `-rw-------` (seul le propriétaire lit/écrit, personne d'autre n'y voit rien, même les autres utilisateurs du NAS).

`infra-ops` (le conteneur des jobs) relit ce fichier, et le réécrit quand le jeton OAuth de Google doit être renouvelé (normal, aucune action de votre part).

**Si un jour le Drive refuse** (`invalid_grant`, jeton expiré ou révoqué) : sur votre PC, `rclone config reconnect gdrive:`, puis refaire l'étape 1. Le chiffrement ne change pas : rien n'est perdu.

### 8.5 Déchiffrer un fichier téléchargé du Drive

Sans NAS ni `rclone.conf` : juste rclone, le mot de passe et le sel de Bitwarden. Sur drive.google.com, dans `citadel`, télécharger le fichier voulu (`db/daily/citadel-…sql.zst`, par exemple) **sans le renommer**. Puis, dans Git Bash :

```sh
cd ~/Downloads
mkdir -p chiffre clair
mv citadel-<…téléchargé> chiffre/               # un ou plusieurs fichiers
read -rsp "Mot de passe (Bitwarden) : " PW; echo
read -rsp "Sel (Bitwarden) : " SALT; echo
rclone copy ":crypt,remote='chiffre',password='$(rclone obscure "$PW")',password2='$(rclone obscure "$SALT")',filename_encryption=off,directory_name_encryption=false,suffix=none:" clair
unset PW SALT
ls clair                                        # attendu : le même nom, contenu lisible
```

Ensuite : un dump (`.sql.zst`) se décompresse avec `zstd -d <fichier>` (`winget install Meta.Zstandard`), et la console sait le restaurer tel quel (« Restaurer la base » → « Un dump envoyé depuis ce PC »). Une archive des configs (`.tar.zst`) s'ouvre avec `tar --zstd -xf <fichier>`. Sans rien télécharger, rclone lit aussi le Drive directement : `rclone ls ":crypt,remote='gdrive:',password=…,password2=…,filename_encryption=off,…:"` liste tout, et `rclone copy` du même remote suivi de `:db/daily/<nom en clair>` récupère un fichier (même syntaxe qu'en §8.3).

## 9. Alertes (healthchecks.io)

Les jobs suivis (`site-check`, `db-backup`, `db-restore-test`, `config-backup`, `config-verify`, `vpn-leak-test`) signalent leur début, leur réussite ou leur échec à healthchecks.io (offre gratuite), qui alerte par e-mail et sur Discord si un job échoue **ou ne passe pas à l'heure** : NAS éteint, `infra-ops` arrêté, job qui n'a pas tourné. Limite : si `infra-ops` s'arrête, l'alerte de `site-check` annonce un site injoignable alors que c'est la surveillance qui est tombée. Certificats, disques, conteneurs et mises à jour se surveillent dans la console ; TOS garde ses e-mails SMART et d'espace disque.

Chaque contrôle (une ligne dans la liste de votre projet healthchecks.io) se crée seul, au premier signal du job, sous son nom.

1. healthchecks.io → votre projet → Settings → API Access → « Ping key » : la générer, la ranger dans Bitwarden, puis l'écrire dans `.env.prod` (`HEALTHCHECKS_PING_KEY`), avant le déploiement.
2. Après le déploiement, faire passer chaque job une fois, pour que son contrôle apparaisse : dans la console (`http://…:8100`), section « Jobs », le bouton ▶ de chaque ligne ; ou depuis votre PC, `ssh nas /Volume1/citadel/citadel db-backup` (puis les autres noms).
3. healthchecks.io ne sait pas encore **quand** attendre chaque job : par défaut, une fois par jour. Pour `site-check`, une panne ne serait donc signalée qu'au bout d'un jour. Sur chaque contrôle : cliquer dessus → « Change Schedule » → onglet « Cron » → coller l'expression du tableau, fuseau `Europe/Paris`, le délai de grâce (le retard toléré avant l'alerte) → Save. Ces expressions sont celles de `infra/ops/crontab` : à reporter ici si elles y changent.

| Contrôle | Cron | Délai de grâce |
|---|---|---|
| `site-check` | `*/5 * * * *` | 10 min |
| `db-backup` | `0 5 * * *` | 30 min |
| `db-restore-test` | `0 5 * * *` | 1 h |
| `config-backup` | `0 3 * * 1` | 1 h |
| `config-verify` | `0 3 * * 1` | 2 h |
| `vpn-leak-test` | `30 4 * * *` | 1 h |

## 10. Réglages hors du dépôt

Aucun fichier ne les contient : à refaire si le NAS, la box ou le PC change, et à revérifier après une mise à jour de TOS.

| Où | Réglage |
| --- | --- |
| Box | vers le NAS, seulement TCP 80 → 8001 et 443 → 4443 ; UPnP désactivé ; bail DHCP statique pour le NAS |
| Tailscale | expiration de clé désactivée pour le NAS |
| TOS, `/etc/ssh/sshd_config` | `PermitRootLogin prohibit-password`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no` |
| TOS, dossier personnel | droits `755` (en `777`, SSH refuse la clé) |
| PC | clé `~/.ssh/nas` avec phrase de passe ; alias `nas` : nom Tailscale du NAS, port de SSH, `IdentitiesOnly yes` |

```sh
# ----- Sur le NAS, dans le terminal web de TOS : il marche même si SSH est cassé -----
/usr/sbin/sshd -T | grep -iE '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin) '
#   attendu : permitrootlogin without-password, passwordauthentication no, kbdinteractiveauthentication no
ls -ld ~                                        # attendu : drwxr-xr-x ; sinon chmod go-w ~
docker exec tailscale tailscale ping <téléphone>  # téléphone en 4G ; attendu : « via <IP>:<port> » (direct), pas « via DERP »

# ----- Sur le PC, dans Git Bash -----
ssh nas echo ok                                 # attendu : phrase de passe de la clé, puis ok
ssh -o PubkeyAuthentication=no nas echo ok      # attendu : Permission denied (publickey), sans demande de mot de passe
pnpm prod:local                                 # attendu : tous les conteneurs « Healthy » ; puis pnpm prod:local:down
pnpm tools release --dry-run                    # attendu (tout commité) : validation, résumé, arrêt avant le tag
```

## 11. Remonter le NAS de zéro

Garder dans Bitwarden `.env.prod`, `rclone.conf`, le mot de passe et le sel du chiffrement des sauvegardes, et les accès Google, GitHub, Tailscale, Proton, Cloudflare, O2Switch et TOS. Puis : installer TOS et Docker, puis `citadel` dans `/Volume1/citadel` ; y déposer `.env.prod` et `rclone.conf` ; restaurer la dernière archive dans `/Volume1/appdata` ; `citadel deploy <dernière version>` ; `citadel restore-db latest`.
