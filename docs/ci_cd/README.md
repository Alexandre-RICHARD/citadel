# CI/CD et hébergement sur le NAS — Cahier des charges

25 octobre 2026 · v3 : roadmap réordonnée, médias et console avant la bascule, sauvegardes après · aucune question ouverte (§16)

Ce document décrit la cible et le chemin pour y arriver : construction et mise en production du site, stack média, sauvegardes, accès et sécurité, console d'administration. **Il fait foi pour la migration**, comme le cahier des charges du backlog.

Conventions :
- **[Q2]** renvoie à la question 2 de la §16 ; ce qui en dépend reste provisoire.
- Dans la roadmap (§15), **[toi]**, **[moi]** ou **[nous]** dit qui fait l'étape.
- Chaque fichier créé pour l'infra (Dockerfile, compose, scripts, workflow, Caddyfile, conf nginx) est **commenté abondamment** : pourquoi et comment, même si les commentaires dépassent le code.
- Quand tu tranches entre plusieurs options, les autres disparaissent du document.

## Sommaire

1. Objectifs
2. Existant et problèmes relevés
3. Architecture cible
4. Organisation du dépôt
5. Variables d'environnement
6. Images Docker
7. Construction des images (CI)
8. Mise en production (CD)
9. Environnements
10. Projet Docker Compose unique sur le NAS
11. Sauvegardes et restauration
12. Réseau, accès et sécurité
13. Supervision et alertes
14. Console d'administration
15. Roadmap
16. Questions ouvertes
17. Pour plus tard
- Annexe A — Inventaire du NAS
- Annexe B — Références

---

## 1. Objectifs

| | Ta demande | Ce que ça donne |
|---|---|---|
| O1 | Stack média facile à arrêter et démarrer | Un seul projet Compose, services rangés par groupes ; boutons dans la console, commande `citadel` en secours |
| O2 | Protection et accès revus | Une matrice d'exposition, service par service : Internet, Tailscale, LAN (§12.1) |
| O3 | Site avec une CI/CD simple | Tu commites. `pnpm release` valide en local et pousse un tag ; GitHub construit les images ; le NAS déploie après ta confirmation, migrations comprises, et revient seul en arrière en cas d'échec |
| O4 | Connexion sécurisée | HTTPS, secrets hors du dépôt, NAS, box et conteneurs durcis |
| O5 | Sauvegardes vérifiées | Base chaque jour à 5 h, restaurée aussitôt en pré-prod et contrôlée ; configs média et torrents chaque lundi à 3 h ; chiffrées, sur le HDD et le Drive, surveillées |
| O6 | Console d'admin légère et protégée | Services, jobs, sauvegardes, ressources, qBittorrent, accès externes, mises à jour (§14) |
| O7 | Tout dans Docker | Sur l'hôte, seulement le petit script `citadel`, qui lance Docker |
| O8 | Pouvoir te débrouiller seul | Fichiers commentés, aucun service payant indispensable |

---

## 2. Existant et problèmes relevés

### 2.1 Matériel

- TerraMaster F6-424 (`leodinas`, `192.168.1.113`), TOS 6 : Intel N95 4 cœurs, 8 Go de RAM.
- `Volume1` : SSD NVMe 500 Go (configs dans `/Volume1/appdata`, Docker). `Volume2` : HDD 12 To (`data/medias` et `data/torrents` sur le même volume, pour les hardlinks des *arr). Les deux en Btrfs.
- Un disque par volume, sans redondance ni onduleur : d'où les copies sur l'autre disque et hors site (§11).

### 2.2 Stack média

`docker/other/nas2/start.sh` lance trois projets Compose : `core` (Nginx Proxy Manager sur 8001/4443, admin sur 81 ; Tailscale ; Gluetun, ProtonVPN WireGuard avec port forwarding), `streaming` (qBittorrent ; Jellyfin, transcodage Intel) et `stackarr` (Prowlarr, Radarr, Sonarr, Bazarr, cross-seed). qBittorrent et les *arr vivent dans le réseau de Gluetun, qui publie leurs ports.

À conserver : limites CPU/RAM, VPN avec kill-switch (déjà testé), DNS over TLS, `/data` commun, transcodage matériel.

### 2.3 Site web

L'ancienne chaîne (tag → images `reunification-*` → runner du NAS) est cassée depuis le passage au monorepo ; ce qui tourne date d'avant. **Tout le web est refait de zéro**, base comprise : aucune donnée à garder.

### 2.4 Sauvegardes

`backup.sh`, le lundi à 3 h par le planificateur de TOS : archive de `/Volume1/appdata` (environ 800 Mo, surtout les 2 000 fichiers .torrent), envoi sur le Drive, purge au-delà de 15 jours. La base du site n'est pas sauvegardée. Défauts : P9, P10, P16, P17.

### 2.5 Problèmes relevés

| # | Constat | Correction |
|---|---|---|
| P1 | Des commits locaux contenaient des secrets (clé WireGuard, mots de passe de la base, utilisateur TOS), tous sous `docker/other/` : un push les aurait publiés pour toujours | Historique refait (étape 14) : `docker/other/` retiré de tous les commits, gardé sur ton PC hors du dépôt ; scan gitleaks propre |
| P2 | Workflows rangés hors de `.github/workflows/` à la racine : aucune CI ne tourne | Un seul workflow (§7) |
| P3 | Dockerfiles d'avant le monorepo (lockfile et paquets `workspace:*` absents) : le build échoue | `Dockerfile` unique, contexte = racine (§6) |
| P4 | Le Dockerfile du serveur lance `build.server.js`, esbuild produit `build.server.cjs` | Corrigé dans le nouveau `Dockerfile` |
| P5 | Proxys `/igdb` et `/irigo` présents seulement dans le serveur de dev Vite : Backlog et Irigo cassés en prod | Reproduits dans le nginx du front (§6) |
| P6 | `VITE_API_ADRESS` est gravée dans le code au moment du build : une image par environnement, donc la pré-prod ne teste pas l'image de la prod | Le front appelle `/api`, une adresse relative : la même image partout (§5.3) |
| P7 | `validate-all` lance `lint-fix` : une correction faite à la volée manquerait au commit tagué | `pnpm release` s'arrête si un fichier a changé (§8.1) |
| P8 | Tests d'intégration sur une MariaDB installée sous Windows | Bases de dev et de test en conteneurs (§9) |
| P9 | `backup.sh` arrête les services depuis `appdata/docker`, qui n'a plus de `docker-compose.yml` : la commande échoue sans arrêter le script (pas de `set -e`), les bases SQLite des *arr sont archivées en pleine écriture | Job `config-backup` (§11.5) |
| P10 | Après la sauvegarde, tout redémarre, même un service arrêté exprès | Le job remet l'état d'avant |
| P11 | `network_mode: container:gluetun` entre projets : si Gluetun est recréé, les *arr restent sans réseau jusqu'à leur recréation à la main | Projet unique, `service:media-gluetun` (§10.3) |
| P12 | Images en `latest` : mises à jour subies, retour arrière difficile | Versions figées (§10.7) |
| P13 | Logs Docker sans rotation : le SSD peut se remplir | Rotation (§10.4) |
| P14 | `frontend-builder` copie le build dans un volume jamais vidé | Image front autonome (§6) |
| P15 | Règles de NPM (quel domaine vers quel conteneur, certificats) dans sa base SQLite, modifiées à la souris : ni historique, ni relecture, ni retour arrière, et tout à recliquer si le NAS meurt | Caddy, règles dans un fichier du dépôt (§12.3) |
| P16 | `rclone delete --min-age 15d` vise tout le dossier du Drive | Un dossier et une rétention par type (§11.7) |
| P17 | Copie locale supprimée après l'envoi, archives en clair sur le Drive | Copies identiques sur le HDD et le Drive, chiffrées (§11.7) |
| P18 | Au redémarrage du NAS, Docker relance les conteneurs sans ordre : qBittorrent, Radarr, Sonarr et cross-seed, partis avant Gluetun, n'ont pas trouvé son réseau et sont arrêtés depuis 5 semaines (`Exited (128)`, annexe A) | `infra-ops` les relance dès que Gluetun est prêt (§10.6) |
| P19 | La clé Tailscale du NAS a expiré : sans personne pour se reconnecter, le conteneur redémarre en boucle (22 876 fois) et le NAS est hors de ton réseau Tailscale | Reconnexion et expiration désactivée (étape 6) ; la console affiche les redémarrages de chaque conteneur (§14.3) |

Hors périmètre : l'authentification de l'API, ton chantier suivant.

---

## 3. Architecture cible

### 3.1 Vue d'ensemble

La mise en production :

```
 TON PC                           GITHUB (dépôt public)                 NAS « leodinas »
 pnpm release
  ├─ validate-all (en local)
  ├─ push de main et du tag ────▶ images.yml : construit les images
  │  v2026.10.25                    └─────────────────────────────────▶ ghcr.io/alexandre-richard/
  │                                                                       citadel-*:v2026.10.25
  ├─ attend la fin de images.yml
  └─ ssh ─────────────────────────────────────────────────────────────▶ citadel deploy v2026.10.25
                                                                          ├─ télécharge les images
                                                                          ├─ montre le plan, attend ton « o »
                                                                          ├─ dump, migrations (répétées en pré-prod)
                                                                          ├─ recrée ce qui a changé
                                                                          └─ vérifie, sinon revient en arrière
```

Le NAS en fonctionnement :

```
 Internet ─(box : 80/443 → 8001/4443)─▶ infra-caddy ─┬─▶ site-prod-client (front, /irigo, /igdb)
                                                     ├─▶ site-prod-server (/api) ──▶ site-prod-db
                                                     └─▶ media-jellyfin
 LAN, Tailscale ──▶ ports du NAS ────────────────────┬─▶ media-gluetun : qBittorrent et *arr, dans le VPN
                                                     ├─▶ site-preprod-client, -server ──▶ site-preprod-db
                                                     └─▶ infra-admin ──▶ infra-socket-proxy ──▶ Docker (filtré)
 infra-ops (tâches) ──▶ dumps et archives ──▶ /Volume2/backups (HDD) + Google Drive (chiffré)
 Ton PC ──SSH──▶ citadel (déploiement) ; DBeaver (tunnel vers 127.0.0.1:3306)
```

### 3.2 Décisions

- **GitHub construit les images, le NAS les télécharge** : le N95 ne compile rien, l'image testée est celle qui tourne, et un retour arrière prend quelques secondes. Gratuit, le dépôt étant public.
- **Une version = un tag git**, `v2026.10.25` (`v2026.10.25.2` pour une deuxième le même jour), créé par `pnpm release`. Toutes nos images portent ce tag ; pré-prod et prod tournent sur les mêmes.
- **Le NAS ne reçoit que des images.** Celle des tâches (`ops`) contient aussi le `compose.yml` et les scripts de sa version : déployer, c'est lancer cette image. Ni git ni Node sur le NAS.
- **La mise en prod part de ton PC**, par SSH : GitHub n'a aucun accès au NAS ni aucun secret de prod, et aucun runner ne tourne sur le NAS.
- **Rien ne change sans ta confirmation** : le NAS affiche ce qui va être recréé et migré, puis attend ton « o ».
- **Un seul projet Compose**, `citadel`, piloté par la console, la commande `citadel` ou `docker compose` (apporté par TOS 7 : TOS 6 n'a que l'ancien `docker-compose` 2.25).

---

## 4. Organisation du dépôt

```
citadel/
├── .github/workflows/images.yml   construit les images à chaque tag v*, et rien d'autre
├── Dockerfile                     toutes les images de Citadel, une étape par image
├── .dockerignore                  ce qui n'entre jamais dans une image (.env*, node_modules…)
├── .env.example                   LE modèle : toutes les variables, commentées
├── .env, .env.test                (ignorés) tes valeurs de dev et de test
├── .gitattributes                 fins de ligne LF pour ce qui tourne sous Linux
├── compose.dev.yml                MariaDB de dev et de test sur ton PC
├── apps/
│   ├── client/nginx.conf.template conf du conteneur front : SPA, /irigo, /igdb
│   └── admin/                     console d'administration (étapes 21 et 22)
├── infra/                         ce qui tourne sur le NAS (remplace docker/)
│   ├── compose.yml                LE projet Compose : tous les services du NAS
│   ├── compose.local.*            la prod sur ton PC, pour la tester avant une release (`pnpm prod:local`)
│   ├── Caddyfile                  quel nom et quel chemin vont vers quel conteneur
│   ├── citadel                    la commande du NAS : deploy, rollback, start, stop, status, run…
│   ├── mariadb-init.sh            crée les comptes de la base à sa première initialisation
│   ├── ops/                       planning (crontab) et scripts des tâches planifiées
│   └── README.md                  remonter le NAS de zéro (court)
└── scripts/release.sh             lancé par `pnpm release`
```

Tes questions sur ces fichiers :
- **`.dockerignore`** : pour construire une image, Docker envoie d'abord tout le dossier au moteur de build. Ce fichier exclut d'office tes `.env` (un `COPY` les glisserait sinon dans une image publique), `node_modules` (plus d'1 Go), `build/`, `.git`, `docs/`. Indispensable tant qu'on construit sur ton PC.
- **`.node-version`** : abandonné. La CI n'installe plus Node, et la version de Node est écrite une seule fois, dans le `Dockerfile`.
- **`Caddyfile`** : les règles de Caddy, le remplaçant de NPM (§12.3).
- **`infra/citadel`** remplace `start.sh`, `stop.sh` et le runner ; **`infra/ops/`** remplace `backup.sh` (§10.2).
- Disparaissent : les Dockerfiles, `.dockerignore`, `.env` et dossiers `.github` des apps et de `docker/`. `docker/other/` reste sur ton PC, hors du dépôt (ignoré par git), en référence jusqu'à l'étape 35.

---

## 5. Variables d'environnement

### 5.1 Un modèle, un fichier par environnement

| Fichier | Où | Pour |
|---|---|---|
| `.env.example` | dépôt (versionné, donc public) | **le modèle** : chaque variable une fois, commentée, sans valeur secrète |
| `.env` | ton PC | dev |
| `.env.test` | ton PC | tests d'intégration |
| `.env.prod` | NAS, `/Volume1/citadel/` (droits 600) | prod et pré-prod, stack média, infra |

- **Mêmes noms partout** : `DB_USER_PASSWORD` est le mot de passe de l'application dans chaque fichier.
- **Pas de `.env.preprod`** : la pré-prod réutilise les secrets de la prod, mais sa base s'appelle `citadel_preprod` et chaque compte n'a de droits que sur sa propre base. Un job de pré-prod qui viserait la prod par erreur échoue donc à la connexion au lieu de l'écraser.
- `.env.prod` ne garde que les secrets et ce qui dépend de la machine (`PUID`, `PGID`…) ; limites, ports et chemins vont dans `compose.yml`, versionnés.
- Seule exception : `rclone.conf`, à côté de `.env.prod`, car rclone y réécrit lui-même son jeton Google.
- Chaque conteneur ne reçoit que ses variables : le front ne voit pas le mot de passe de la base, Jellyfin ne voit pas la clé du VPN.

### 5.2 Ta question : `vite.config.ts` peut-il lire le `.env` de la racine ?

Oui, avec `envDir` et `loadEnv` et un chemin absolu, pnpm lançant Vite depuis `apps/client` : voir `apps/client/vite.config.ts`. En dev, Vite y relaie aussi `/api` vers le serveur local, préfixe retiré, comme Caddy en prod.

- Les variables `VITE_*` arrivent dans le code du navigateur, donc deviennent publiques : jamais de secret en `VITE_`.
- Le serveur lit le même `.env` en dev (`node --env-file-if-exists=../../.env`) ; en conteneur, Compose fournit les variables.
- Les tests d'intégration lisent `.env.test` à la racine.

### 5.3 Renommages et suppressions

| Actuel | Devient | Pourquoi |
|---|---|---|
| `LOCAL_PORT` | `SERVER_PORT` | « local » est trompeur en prod |
| `VITE_LOCAL_PORT` et `--port 3001` en dur | `CLIENT_DEV_PORT` | une seule source |
| `VITE_API_ADRESS` | supprimée : le front appelle `/api` | adresse relative, la même partout (P6) ; Vite en dev, Caddy en prod la transmettent au serveur |
| `CORS_ORIGIN` et le middleware `cors` | supprimés | même origine partout : plus de CORS ni de requêtes « preflight » |
| `MYSQL_ROOT_PASSWORD`, `DB_ROOT_PASSWORD` | `DB_ROOT_PASSWORD` | un seul nom |
| `INTERNET_GAME_DATA_BASE_*` | inchangées | le relais IGDB sera refait plus tard, côté serveur |
| `PROTON_VPN_OPENVPN_*` | supprimées | inutiles : Gluetun se connecte déjà à Proton en WireGuard (`VPN_TYPE=wireguard`) |
| `PROTON_VPN_WIREGUARD_PRIVATE_KEY` | `WIREGUARD_PRIVATE_KEY` | le nom que Gluetun attend |
| `DB_DRIVER`, `DOTENV_CONFIG_QUIET` | supprimées | le pilote `mariadb` est fixé dans le code ; `dotenv` laisse la place à l'option `--env-file` de Node |

Le modèle : `.env.example`. Les autres variables du NAS (console, healthchecks.io) s'y ajoutent avec leurs étapes.

---

## 6. Images Docker

- **Un seul `Dockerfile`, à la racine**, avec une étape (« target ») par image : `client`, `server`, `migrations`, `ops`, `caddy`, puis `admin` (étape 21). La version de Node n'y est écrite qu'une fois ; l'installation des dépendances est partagée.
- Contexte de build : la racine, filtrée par `.dockerignore` ; `pnpm install --frozen-lockfile --filter <app>...`.
- Les fichiers de config (`compose.yml`, `Caddyfile`, conf nginx, scripts) sont copiés **dans** les images : le NAS ne récupère que des images.
- `linux/amd64`, utilisateur non-root, labels OCI (ils relient l'image au dépôt). Le tag est gravé dans l'image : `/health` et `version.json` disent quelle version tourne.
- Noms : `ghcr.io/alexandre-richard/citadel-<image>:<version>`. Chaque package GHCR est passé en public une fois (étape 15), pour que le NAS télécharge sans identifiant.

| Image | Contenu |
|---|---|
| `server` | Node et le bundle esbuild, qui embarque déjà ses dépendances (à vérifier dans un conteneur vierge) : pas de `pnpm install`. `CMD ["node", "--enable-source-maps", "build/build.server.cjs"]` |
| `client` | Le build Vite et `version.json`, servis par `nginx-unprivileged` : retour sur `index.html` pour les routes de la SPA, cache d'un an pour les fichiers hashés, aucun pour `index.html` ; proxys `/irigo` et `/igdb` |
| `migrations` | `flyway/flyway:12` et les fichiers de `apps/server/src/sql/migrations` : les migrations suivent la version du serveur. Remplace le volume partagé de l'ancienne stack |
| `ops` | Alpine avec bash, curl, jq, Docker CLI et Compose, client MariaDB, rclone, zstd, regctl, supercronic (un cron fait pour les conteneurs) ; plus `compose.yml`, `citadel`, `mariadb-init.sh` et `infra/ops/`. Elle déploie (§8.2) et exécute les tâches (§11) |
| `caddy` | L'image officielle avec notre `Caddyfile` : une règle modifiée part en prod avec une version. Avec le module Cloudflare, pour obtenir les certificats par son API DNS (§12.3) |

À ajouter au serveur : `GET /health` → `{ status, version, db }` (200 si la base répond, 503 sinon), et un arrêt propre sur `SIGTERM`, pour qu'un redémarrage ne coupe pas une requête en cours.

Les proxys du front reproduisent ceux du serveur de dev Vite :
- `/irigo/` → `https://ara-api.enroute.mobi` : aucun secret, il contourne seulement l'absence de CORS chez Irigo ;
- `/igdb/` → `https://api.igdb.com/v4/`, avec `Client-ID` et `Authorization` tirés de `.env.prod`, **tel quel**. Quand le token expire, la recherche IGDB échoue jusqu'à ce que tu mettes le nouveau dans `.env.prod` et redémarres `site-prod-client`. Tout visiteur peut se servir de ce proxy : accepté pour un POC.

Satisfactory appelle `http://localhost:8080`, le mod qui tourne chez le visiteur : c'est normal. Depuis sa version 142, Chrome demande alors l'autorisation d'accéder au réseau local : à accepter une fois.

Versions de base : Node 24 (maintenance jusqu'en avril 2028), MariaDB 11.8 LTS (jusqu'en 2028), Flyway 12. Node 26, MariaDB 12.3 et Flyway 13 plus tard, testés en pré-prod.

---

## 7. Construction des images (CI)

Un seul workflow, `.github/workflows/images.yml` : il construit et publie les images **quand un tag `v*` est poussé**, et ne fait rien d'autre. Rien sur un simple commit, puisque tu travailles sur `main` ; pas de `validate-all`, que tu lances avant chaque push et que `pnpm release` relance avant le tag.

Il refuse un tag posé hors de `main`, et chaque action y est épinglée par le SHA d'un commit. Aucun secret à créer chez GitHub. Durée : 3 à 6 minutes, images en parallèle.

---

## 8. Mise en production (CD)

La **release** se passe sur ton PC (valider, taguer, attendre les images), le **déploiement** sur le NAS (télécharger, migrer, redémarrer). Tu ne tapes que `pnpm release`, qui enchaîne les deux ; `citadel deploy` se lance aussi seule sur le NAS. (Le script ne s'appelle pas `deploy` : `pnpm deploy` est une commande intégrée de pnpm.)

### 8.1 `pnpm release`, sur ton PC

1. **Vérifications** : branche `main`, rien de non commité.
2. **`pnpm validate-all`**, base de test démarrée automatiquement. Si un fichier a changé pendant la validation, arrêt : commite d'abord (P7).
3. **Résumé** : version en prod (demandée au NAS), commits qui partent, nouvelles migrations, nom du tag.
4. **Push** de `main` et du tag, qui lance `images.yml`.
5. **Attente** des images, en suivant le workflow par l'API publique de GitHub. En cas d'échec : lien vers le run, arrêt, rien n'a bougé sur le NAS.
6. **`ssh -t nas /Volume1/citadel/citadel deploy <version>`** : la sortie s'affiche en direct, et le NAS te demande confirmation.

`nas` est un alias de ton `~/.ssh/config` vers le nom Tailscale du NAS, avec ta clé SSH (étape 6) : la même commande marche chez toi et ailleurs.

### 8.2 `citadel deploy <version>`, sur le NAS

`citadel` lance un conteneur jetable de l'image `ops` de la version demandée, qui contient le `compose.yml` et la logique de déploiement de cette version. Le NAS n'a besoin que de Docker.

0. **Verrou**, partagé avec les jobs : jamais de déploiement pendant une sauvegarde.
1. **Contrôle** : `docker compose config` (fichier valide, variables présentes dans `.env.prod`).
2. **Téléchargement** des images.
3. **Plan, puis confirmation `[o/N]`** : services recréés et pourquoi (nouvelle image, nouvelle version d'une image tierce, réglage modifié), migrations à appliquer. Jusqu'ici, rien n'a bougé.
4. **Dump** de la base de prod (`/Volume2/backups/db/pre-deploy/`).
5. **Répétition en pré-prod**, si la version apporte des migrations : dernier dump restauré dans `site-preprod-db`, migrations, nouveau serveur démarré, `/health`, puis pré-prod arrêtée. En cas d'échec, arrêt : la prod n'a pas été touchée.
6. **Migrations en prod.** En cas d'échec, arrêt : l'ancienne version tourne toujours (§8.4).
7. **Application** : `up -d --wait` pour les services « toujours allumés » et ceux déjà démarrés ; `create` pour les services « à la demande » arrêtés, mis à jour sans démarrer.
8. **Vérifications** : `/api/health` répond avec la nouvelle version, la page d'accueil répond 200.
9. **Échec en 7 ou 8** : retour automatique à la version précédente.
10. **Enregistrement** : version en service, historique ; les images des 5 dernières versions sont gardées.

Durée : 1 à 3 minutes, dont 5 à 15 secondes de coupure du site.

### 8.3 Règles pour les migrations Flyway

- Une migration passée en prod ne se modifie plus : Flyway vérifie les sommes de contrôle.
- MariaDB n'annule pas un `ALTER TABLE` : une migration qui échoue au milieu laisse ses premières instructions appliquées. D'où le dump et la répétition en pré-prod.
- **Migrations rétrocompatibles** : le code N-1 doit fonctionner sur le schéma N. Pour renommer une colonne : ajouter la nouvelle et copier les données (release 1), supprimer l'ancienne (release 2). Revenir à l'ancien code n'oblige alors jamais à restaurer la base.

### 8.4 Retour arrière

- **Code** : `citadel rollback` redéploie la version précédente, dont les images sont encore là : quelques secondes. Les migrations passées restent, elles sont rétrocompatibles.
- **Base** (migration ratée) : `citadel restore-db pre-deploy`, avec confirmation renforcée, puis `citadel rollback`. Les écritures faites depuis le déploiement sont perdues.

---

## 9. Environnements

| | Dev | Tests | Pré-prod | Prod |
|---|---|---|---|---|
| Où | ton PC | ton PC | NAS, arrêtée la plupart du temps | NAS |
| Base | `mariadb-dev`, persistante | `mariadb-test`, en mémoire, neuve à chaque lancement | `site-preprod-db`, restaurée chaque nuit depuis la prod | `site-prod-db` |
| Code | sources (`pnpm dev-all`) | sources (Vitest) | images de la prod | images de la version |
| Adresse | `localhost:3001` | — | interne : IP et port du NAS, en LAN ou par Tailscale | `alexandre-richard.fr` |
| Variables | `.env` | `.env.test` | `.env.prod`, base `citadel_preprod` | `.env.prod` |

- Les deux bases locales tournent dans Docker Desktop (`compose.dev.yml`) : `pnpm db:up`, `db:down`, `db:reset`, `db:migrate`, `test:integration`. Ports 3307 (dev) et 3308 (tests) : ta MariaDB Windows garde 3306 jusqu'à sa désinstallation (étape 10).
- Les tests d'intégration recréent et migrent eux-mêmes la base de test à chaque lancement : plus de `resetDatabase`.
- `pnpm prod:local` fait tourner les images de prod sur ton PC (`https://citadel.localhost:8443`), avec le vrai `compose.yml`, stack média comprise : volumes jetables, faux Gluetun sans VPN, pas de Tailscale. À lancer avant une release qui touche au `Dockerfile`, à nginx, au `Caddyfile` ou à `compose.yml`.

---

## 10. Projet Docker Compose unique sur le NAS

### 10.1 Arborescence sur le NAS

```
/Volume1/citadel/               (SSD) le déploiement
├── citadel                     la commande du NAS (§10.6)
├── .env.prod                   secrets et réglages (600)
├── rclone.conf                 accès au Drive et clés du chiffrement (600)
├── mariadb-init.sh             copié par citadel deploy : crée les comptes à la création de la base
└── state/                      version en service, historiques, demandes de la console, logs, verrou
/Volume1/appdata/<service>/     données des services : chemins inchangés, plus site-prod-db/, site-preprod-db/
                                (les certificats de Caddy : volume Docker citadel_caddy-data)
/Volume2/data/                  médias et torrents (inchangé)
/Volume2/backups/               db/, configs/ : les sauvegardes, sur l'autre disque
```

- `citadel` s'installe dans `/Volume1/citadel/`, qui survit aux mises à jour de TOS, et s'ajoute au PATH de ton compte (`infra/README.md`). `pnpm release` l'appelle par son chemin complet : une commande lancée par SSH n'a pas ce PATH.
- Ta remarque est juste : l'infra ne se sauvegarde pas (§11.1), et le minimum pour tout remonter tient dans `infra/README.md` (§11.8).

### 10.2 Groupes, modes et rôle des conteneurs

| Groupe | Conteneurs | Mode |
|---|---|---|
| `infra-` | `caddy`, `tailscale`, `socket-proxy`, `ops`, `admin` | toujours allumés ; pas arrêtables depuis la console |
| `site-prod-` | `client`, `server`, `db`, et `migrations` (ponctuel) | toujours allumés |
| `site-preprod-` | `client`, `server`, `db`, et `migrations` | à la demande : test de restauration, répétitions de déploiement, ou toi |
| `media-` | `gluetun` | toujours allumé : qBittorrent et les *arr vivent dans son réseau |
| `media-` | `qbittorrent`, `jellyfin`, `prowlarr`, `radarr`, `sonarr`, `bazarr`, `cross-seed` | à la demande |

`media-gluetun` reste dans `media` : il ne sert qu'aux téléchargements, et partirait avec eux. Le groupe dit à quoi sert un conteneur, le mode s'il reste allumé.

| Conteneur | Rôle | Remplace |
|---|---|---|
| `infra-caddy` | La porte d'entrée web : reçoit tout le trafic HTTP(S), gère seul les certificats, envoie chaque requête au bon conteneur selon le nom et le chemin (§12.3) | Nginx Proxy Manager |
| `infra-tailscale` | Met le NAS sur ton réseau privé Tailscale : tes appareils le joignent de partout, sans port ouvert sur la box | le conteneur actuel |
| `infra-socket-proxy` | Filtre entre la console et Docker : un accès direct à Docker donne tous les droits sur le NAS ; à travers ce filtre, la console peut seulement lire l'état des conteneurs, et les démarrer, arrêter ou redémarrer | — |
| `infra-ops` | Exécute les tâches planifiées (sauvegardes, test de restauration, relevés) et celles que tu lances depuis la console. Seul à avoir l'accès au Drive et le compte de sauvegarde de la base. Il a tous les droits sur Docker, mais n'écoute sur aucun port et n'exécute que ses propres scripts | `backup.sh` et la tâche planifiée de TOS |
| `infra-admin` | La console d'administration (§14) | — |

### 10.3 Exemple de service

```yaml
  media-radarr:
    <<: *defaults                         # règles communes (§10.4)
    image: lscr.io/linuxserver/radarr:<version figée>
    network_mode: service:media-gluetun   # tout son trafic passe par le VPN (P11)
    depends_on:
      media-gluetun:
        condition: service_healthy        # attend que le VPN soit monté
    volumes:
      - /Volume1/appdata/radarr:/config
      - /Volume2/data:/data
    labels:                               # lus par la console et par citadel
      citadel.name: "Radarr"
      citadel.description: "Films : recherche et import"
      citadel.group: "media"
      citadel.mode: "on-demand"           # always | on-demand | job
      citadel.controllable: "true"        # la console peut le démarrer et l'arrêter
```

### 10.4 Règles communes

Écrites une fois (bloc `x-defaults`) et reprises par chaque service :
- `restart: unless-stopped` : après un redémarrage du NAS, chaque conteneur revient dans l'état où il était (sauf P18, rattrapé par `infra-ops`).
- Logs limités à 3 fichiers de 10 Mo.
- `no-new-privileges` ; nos images : non-root, lecture seule, sans capacités ; images tierces : seulement les capacités exigées (Gluetun : `NET_ADMIN`).
- Une limite mémoire sur chaque service (§10.5), limites CPU et priorités comme aujourd'hui.
- Healthchecks, et `depends_on` qui attend Gluetun sain avant qBittorrent et les *arr.
- Réseaux séparés : `edge` (Caddy et ce qu'il sert), `site` et `preprod` (internes), `docker-api` (socket-proxy et console).
- MariaDB n'écoute que sur `127.0.0.1` du NAS (§12.5).

### 10.5 Mémoire

| Service | Limite | Remarque |
|---|---|---|
| `site-prod-db` | 512 Mo | `innodb_buffer_pool_size` réduit : la base est petite |
| `site-prod-server` | 256 Mo | |
| `site-prod-client` | 64 Mo | |
| `infra-caddy` | 128 Mo | NPM est limité à 500 Mo aujourd'hui |
| `infra-ops` | 256 Mo | pics pendant les sauvegardes |
| `infra-admin` | 128 Mo | |
| `infra-socket-proxy` | 32 Mo | |
| `site-preprod-*` | 512 + 256 + 64 Mo | quelques minutes par nuit seulement |

Les limites de la stack média restent celles d'aujourd'hui, ajustées ensuite avec les mesures de la console. Tes gels du NAS viennent peut-être d'un manque de RAM : avec une limite par conteneur, celui qui déborde est tué seul, puis redémarre, au lieu de geler le NAS. L'inventaire (annexe A) le montre déjà : depuis le dernier redémarrage, la limite de Jellyfin (5 Go) a tué 13 fois en un mois un `ffprobe` monté à 4,6 Go, sans geler le NAS. Les traces des gels précédents ont disparu au redémarrage.

### 10.6 Démarrer, arrêter, dépanner

- **La console** est le chemin normal : un bouton par service et par groupe (§14).
- **`citadel`** pour le dépannage : `status`, `start|stop|restart <service|groupe>`, `logs <service>`, `run <job>`, `deploy`, `rollback`, `restore-db`, `admin-password`, et **`up`**, la commande de secours, qui relance tout ce qui doit tourner.
- **NAS figé** : après le redémarrage, Docker relance seul ce qui tournait ; les services du réseau de Gluetun partis avant lui, `infra-ops` les relance dès qu'il est prêt (P18). Si la console ne répond pas : `ssh nas`, puis `citadel up`, ou `citadel stop media` pour libérer de la RAM.
- **Après une mise à jour de TOS** : vérifications du §12.8. Un conteneur qui ne démarre plus (`Operation not permitted`) se répare en le recréant (`--force-recreate`) : la conversion des droits de TOS 7 avait abîmé celui de NPM.

### 10.7 Mises à jour des images tierces

- Version exacte dans `compose.yml`, jamais `latest` ; pour les images linuxserver, le tag de build complet (par exemple `5.14.0.9383-ls280`), qui désigne toujours la même image. Au départ : exactement celles qui tournaient sur le NAS (étape 16), pour que la bascule ne change rien d'autre ; les mises à jour viennent après, une par une (les *arr et Jellyfin migrent leur base vers l'avant, jamais vers l'arrière). Seule exception, Gluetun : sa version de développement est remplacée par la version publiée suivante.
- Chaque nuit, `update-check` compare avec les versions publiées ; la console liste les mises à jour disponibles, avec leurs notes de version.
- Toutes les versions d'un coup d'œil : la page « Versions » de la console (§14.3) liste chaque outil, nos images comme les images tierces, avec sa version en service et la dernière publiée.
- Mettre à jour : changer la version dans `compose.yml`, commiter, `pnpm release`. Revenir en arrière : `citadel rollback`.

---

## 11. Sauvegardes et restauration

### 11.1 Ce qu'on sauvegarde

| Donnée | Méthode | Quand |
|---|---|---|
| Base du site (quelques Mo) | `mariadb-dump`, sans arrêt | chaque jour à 5 h, et avant chaque déploiement |
| `/Volume1/appdata` : exclusions actuelles, `BT_backup` (les .torrent) toujours compris, sans les dossiers des bases | archive `tar` + `zstd`, services média arrêtés (environ 800 Mo) | chaque lundi à 3 h |
| `.env.prod`, `rclone.conf` | Bitwarden (la référence), et dans l'archive du lundi | à chaque changement |
| Images, compose, scripts | rien : dans git et sur GHCR | — |
| Médias | rien, choix assumé : les *arr savent les retrouver | — |

### 11.2 Planning

Dans `infra/ops/crontab`, versionné ; la tâche planifiée de TOS disparaît.

| Quand | Job | Impact |
|---|---|---|
| Chaque jour, 05:00 | `db-backup`, puis `db-restore-test` (1 à 3 min) | la base de pré-prod démarre, puis s'arrête |
| Lundi, 03:00 | `config-backup`, puis `config-verify` (5 à 20 min) | services média arrêtés pendant l'archivage, puis remis comme avant |
| Chaque nuit, 04:00 | `update-check` | aucun : liste les mises à jour d'images |
| Toutes les heures | `qbittorrent-stats` | aucun : compteurs pour les historiques de la console |
| Toutes les 5 min | `site-check` | aucun : vérifie que le site répond depuis Internet (§13) |
| Toutes les minutes | `vpn-watch` | aucun : relance les services du réseau de Gluetun qui n'ont pas pu démarrer ou ont perdu son réseau (P18) |

### 11.3 `db-backup`

1. Prend le verrou ; écrit un manifeste : nombre de lignes de chaque table, dernière migration, version déployée.
2. `mariadb-dump --single-transaction --quick --routines --triggers --events --hex-blob citadel`, avec le compte `citadel_backup` (lecture seule), compressé, avec son `.sha256`. Sans `--databases`, le dump se restaure dans n'importe quelle base, `citadel_preprod` comprise.
3. Contrôle : archive valide, dernière ligne `-- Dump completed`.
4. Copie dans `/Volume2/backups/db/` et sur le Drive, puis `rclone cryptcheck`.
5. Rétention, statut, signal à healthchecks.io.

### 11.4 `db-restore-test` : la pré-prod qui prouve la sauvegarde

1. **Télécharge depuis le Drive** le dump de la nuit, plutôt que la copie locale : on prouve aussi que la copie hors site se télécharge et se déchiffre. Vérifie le `sha256`.
2. **Démarre `site-preprod-db`**, recrée la base `citadel_preprod`, importe le dump.
3. **Contrôles**, qui doivent tous passer :
   - a. l'import se termine sans erreur ;
   - b. la liste des tables est celle du manifeste ;
   - c. le nombre de lignes de chaque table est celui du manifeste ;
   - d. Flyway, avec les migrations de la version en prod, trouve un schéma à jour et un historique conforme, sans rien appliquer.
4. **Arrête** `site-preprod-db`. Ses données restent jusqu'à la nuit suivante : tu peux la redémarrer pour regarder (DBeaver, port 3307).
5. **Rapporte** : détail des contrôles dans `state/`, signal de succès ou d'échec à healthchecks.io.

### 11.5 `config-backup`, qui remplace `backup.sh`

Les chemins ne changent pas, donc le contenu de l'archive non plus : les exclusions de `backup.sh` sont reprises telles quelles. Le script, lui, change : il arrête vraiment les services (P9), les remet comme avant (P10), garde une copie locale et chiffre celle du Drive (P17), et signale son résultat.

1. Prend le verrou, note les services média allumés, les arrête (sauf Gluetun ; ni le site, ni Caddy, ni Tailscale).
2. Archive vers `/Volume2/backups/configs/` (contenu : §11.1).
3. Redémarre exactement les services qui tournaient ; un `trap` le garantit même en cas d'erreur.
4. Envoi sur le Drive, `rclone cryptcheck`, rétention, statut, signal.

### 11.6 `config-verify`

Juste après, sans coupure : extrait l'archive dans un dossier temporaire du HDD, lance `PRAGMA integrity_check` sur chaque base SQLite (Radarr, Sonarr, Prowlarr, Bazarr, Jellyfin), vérifie la présence des fichiers clés (`config.xml`, `qBittorrent.conf`, `config.js` de cross-seed…), puis supprime le dossier.

### 11.7 Stockage, chiffrement, rétention

- **Mêmes fichiers et même rétention sur le HDD et sur le Drive**, un dossier par type de sauvegarde.
- Le Drive ne reçoit que du chiffré : rclone `crypt` chiffre noms et contenus avant l'envoi.
- **Le mot de passe et le sel du chiffrement vont dans Bitwarden avant le premier envoi.** Sans eux, les sauvegardes sont illisibles, y compris pour toi si le NAS meurt.
- rclone utilise son client OAuth Google partagé (annexe A) : jeton qui ne périme pas tant qu'il sert, débit limité mais suffisant pour quelques Go par semaine.
- Changer de fournisseur (1 To ailleurs) : rclone en gère plusieurs dizaines, seul le « remote » change.

| | Rétention, sur le HDD et sur le Drive |
|---|---|
| Base, chaque jour | les 14 derniers jours + les 8 derniers dimanches + les 12 derniers premiers du mois |
| Base, avant déploiement | les 10 derniers |
| Configs, chaque lundi | les 4 dernières semaines + les 3 derniers premiers lundis du mois |

Environ 6 Go de configs et quelques centaines de Mo de base sur chaque support.

### 11.8 Remonter le NAS de zéro

Version courte, qui deviendra `infra/README.md` (étape 26) :
- À garder dans Bitwarden : `.env.prod`, `rclone.conf`, mot de passe et sel du chiffrement, accès Google, GitHub, Tailscale, Proton, Cloudflare, O2Switch et TOS.
- Étapes : installer TOS et Docker, puis `citadel` ; déposer `.env.prod` et `rclone.conf` dans `/Volume1/citadel` ; restaurer la dernière archive dans `/Volume1/appdata` ; `citadel deploy <dernière version>` ; `citadel restore-db latest`.

---

## 12. Réseau, accès et sécurité

### 12.1 Matrice d'accès

Depuis tes appareils. « `:port` » : `192.168.1.113` en LAN, `leodinas` par Tailscale, même port des deux côtés. Internet n'atteint que ce que la box redirige : 80 et 443, vers Caddy.

| Service | Adresse | Internet | LAN, Tailscale | Connexion |
|---|---|---|---|---|
| Site (`www` redirigé) | `https://alexandre-richard.fr`, par Cloudflare | ✅ | ✅ par le domaine | aucune |
| API | `https://alexandre-richard.fr/api` | ✅ lectures et écritures, comme aujourd'hui | ✅ | aucune (plus bas) |
| Jellyfin | `https://jellyfin.alexandre-richard.fr` ; `:8096` en direct | ✅ par le domaine | ✅ les deux | comptes Jellyfin (§12.6) |
| qBittorrent, Prowlarr, Radarr, Sonarr, Bazarr, cross-seed | `:8080`, `:9696`, `:7878`, `:8989`, `:6767`, `:2468` | ❌ | ✅ | la leur, inchangée : leurs réglages suivent leurs dossiers |
| Console | `http://…:8100` | ❌ | ✅ | son mot de passe (§14.4) |
| Pré-prod (phase 6) | `http://…:8002`, servie par Caddy | ❌ | ✅ | aucune |
| Interface de TOS | ses ports habituels | ❌ jamais | ✅ | compte TOS |
| SSH | `:9222` | ❌ jamais | ✅ | clé seulement (étape 7) |
| MariaDB, prod et pré-prod | `127.0.0.1:3306` et `3307` du NAS | ❌ | tunnel SSH | comptes du §12.5 |
| API Docker | socket du NAS | ❌ | ❌ | `infra-ops` ; la console à travers `infra-socket-proxy` |

- API : sans authentification, rien ne distingue ton front d'un script ; n'importe qui peut appeler les routes d'écriture. Accepté jusqu'à ton chantier d'authentification.
- Console en HTTP, sans certificat à installer sur chaque appareil : par Tailscale, WireGuard chiffre tout ; en LAN, le mot de passe ne traverse que ton réseau domestique. Accepté.

Entre conteneurs, pour la console (étapes 21 et 22) : chaque identifiant est dans `.env.prod`, et rien de tout ça n'est publié sur un port.

| De | Vers | Pour | Identifiant |
|---|---|---|---|
| `infra-admin` | `infra-socket-proxy` | état, statistiques, logs ; démarrer, arrêter, redémarrer | aucun : le filtre (§14.2) |
| `infra-admin` | qBittorrent, `media-gluetun:8080` | vitesses, totaux, ratio | `QBITTORRENT_USER`, `QBITTORRENT_PASSWORD` : ton compte qBittorrent |
| `infra-admin` | serveur de contrôle de Gluetun, `:8000` | IP publique, pays, port redirigé | `GLUETUN_API_KEY`, neuve |
| `infra-admin` | `media-jellyfin:8096` | lectures en cours | `JELLYFIN_API_KEY`, créée dans Jellyfin |
| `infra-admin` | logs de Caddy, `/proc` de l'hôte | accès externes, système | aucun : montés en lecture seule |
| `infra-ops` | Docker, dont `infra-tailscale` | tâches ; appareils Tailscale connectés (`tailscale status`), déposés dans `state/` pour la console | aucun |

### 12.2 Box et ports

- La Bbox envoie déjà 80 → 8001 et 443 → 4443 (TOS occupe les ports 80 et 443 du NAS) : Caddy reprend ces deux ports à NPM, rien ne change sur la box.
- Aucune autre redirection vers le NAS, pas de DMZ, **UPnP et NAT-PMP désactivés** (étape 5) : avec eux, n'importe quel appareil ou logiciel du réseau, TOS compris, peut ouvrir un port vers Internet sans rien demander. Tailscale s'en servait ; il s'en passe (étape 6).
- Docker publie ses ports en contournant le pare-feu de TOS : la vraie barrière, c'est la box.

### 12.3 Caddy à la place de Nginx Proxy Manager

Caddy fait le même métier que NPM : la porte d'entrée web, qui envoie chaque requête au bon conteneur. Pourquoi changer :
- **Les règles tiennent dans un fichier du dépôt** d'une trentaine de lignes : historique git, relecture, retour arrière, mise en prod avec le reste (P15).
- **HTTPS automatique** : certificats obtenus et renouvelés seuls.
- **Plus léger, et rien de plus à protéger** : environ 30 Mo de RAM, et pas d'interface d'admin (celle de NPM écoute sur le port 81).
- **NAS reconstruit = rien à recliquer.**

Les règles, dans `infra/Caddyfile` : `alexandre-richard.fr` envoie `/api/…` au serveur (préfixe retiré : ses routes ne changent pas) et le reste au front ; `www.` redirige vers le domaine nu ; `jellyfin.` va à `media-jellyfin`.

- Le site passe par le proxy de Cloudflare (nuage orange), Jellyfin non. Caddy obtient donc ses certificats par l'API DNS de Cloudflare, la méthode la plus fiable derrière ce proxy, avec un jeton limité au DNS de ton domaine ; et il fait confiance aux IP de Cloudflare pour voir l'IP réelle des visiteurs.
- S'y ajoutent les en-têtes de sécurité (HSTS…) et des logs d'accès en JSON, pour la vue « accès externes » de la console. `api.alexandre-richard.fr` disparaît, son enregistrement DNS aussi (étape 35).

### 12.4 Tailscale

- Expiration de clé désactivée pour le NAS : sinon il sort du tailnet sans prévenir, tous les 180 jours (P19).
- ACL : tes appareils vers le NAS. MagicDNS activé.
- Seuls le site, `/api` et Jellyfin ont un nom de domaine ; le reste s'ouvre par IP et port, comme aujourd'hui (§12.1).

### 12.5 La base de prod depuis DBeaver

- MariaDB écoute sur `127.0.0.1:3306` du NAS (pré-prod : `3307`) : invisible depuis le réseau, joignable seulement depuis le NAS lui-même, donc par un tunnel SSH.
- DBeaver, onglet SSH : hôte `leodinas` (son nom Tailscale), port `9222`, ton utilisateur, ta clé. Onglet principal : hôte `127.0.0.1`, port `3306`, base `citadel`, compte `citadel_migrator`.
- Le SSH de TOS autorise les tunnels : `AllowTcpForwarding` garde sa valeur par défaut (annexe A).

| Compte | Pour | Droits |
|---|---|---|
| `citadel_app` | le serveur | lire et écrire les données |
| `citadel_migrator` | Flyway, et toi dans DBeaver | structure et données de `citadel`, rien d'autre |
| `citadel_backup` | les dumps | lecture seule |
| `root` | dépannage | seulement depuis l'intérieur du conteneur |

Mêmes comptes en pré-prod, avec des droits sur `citadel_preprod` seulement.

### 12.6 Durcissement

- **GitHub** : anciens dépôts supprimés, protections activées sur `citadel` (fait) ; double authentification ; aucun runner auto-hébergé.
- **TOS** : passage en TOS 7 (TOS 6 embarque Docker 27.2.1, en fin de vie) ; SSH par clé ; désactiver ce qui ne sert pas (TNAS.online, FTP, SMB1, NFS…) ; e-mails SMART et espace disque. Interfaces jamais exposées sur Internet : les failles des NAS grand public sont régulièrement exploitées à distance.
- **Jellyfin**, seul service exposé avec le site : mots de passe forts ; accès distant retiré à ton compte administrateur, et un compte sans droits d'admin pour regarder depuis l'extérieur.
- **VPN des torrents** : kill-switch déjà testé ; la console affiche l'IP de sortie de Gluetun.

### 12.7 Secrets

- Jamais dans le dépôt : `.gitignore` sur `.env*` sauf `.env.example`, push protection de GitHub, et un scan gitleaks de tout l'historique avant le premier push (étape 14).
- **Bitwarden est la référence** (ton espace infra) : chaque secret y entre au moment où il est créé.
- Secrets neufs pour la nouvelle prod. Les anciens mots de passe de la base, dont certains sont déjà dans l'historique public (commit `c3f8651`), disparaissent avec l'ancienne base et ne resservent jamais.

### 12.8 Réglages hors du dépôt, et leurs vérifications

Aucun fichier du dépôt ne les contient : à refaire à la main si le NAS, la box ou le PC change, et à revérifier après un redémarrage ou une mise à jour de TOS, qui peut remettre ses réglages d'origine.

| Où | Réglage |
|---|---|
| Bbox | Vers le NAS, seulement TCP 80 → 8001 et 443 → 4443 ; UPnP désactivé ; bail DHCP statique `192.168.1.113` pour sa MAC (même IP fixée dans TOS) |
| Tailscale | Expiration de clé désactivée pour `leodinas` |
| TOS, `/etc/ssh/sshd_config` | `PermitRootLogin prohibit-password`, `PasswordAuthentication no`, `KbdInteractiveAuthentication no` ; l'original est dans `sshd_config.avant-etape7` |
| TOS, dossier personnel | Droits `755` : TOS 7 l'avait ouvert en `777`, et SSH refuse alors la clé |
| PC | Clé `~/.ssh/nas`, avec phrase de passe ; alias `nas` dans `~/.ssh/config` : `leodinas`, port 9222, `IdentitiesOnly yes` |
| PC, dépôt | `.env` et `.env.test` à la racine, remplis depuis `.env.example` ; Docker Desktop lancé pour les bases et les tests |

```sh
# ----- Sur le NAS, dans le terminal web de TOS : il marche même si SSH est cassé -----
/usr/sbin/sshd -T | grep -iE '^(passwordauthentication|kbdinteractiveauthentication|permitrootlogin) '
#   attendu : permitrootlogin without-password, passwordauthentication no, kbdinteractiveauthentication no
ls -ld ~                                        # attendu : drwxr-xr-x ; sinon chmod go-w ~
docker exec tailscale tailscale ping <téléphone>  # téléphone en 4G ; attendu : « via <IP>:<port> » (direct), pas « via DERP »

# ----- Sur le PC, dans Git Bash -----
ssh nas echo ok                                 # attendu : phrase de passe de la clé, puis ok
ssh -o PubkeyAuthentication=no nas echo ok      # attendu : Permission denied (publickey), sans demande de mot de passe
pnpm db:up                                      # attendu : base de dev saine, migrations à jour
pnpm test:integration                           # attendu : tous les tests passent, sur une base de test neuve
pnpm prod:local                                 # attendu : 13 conteneurs « Healthy » ; https://citadel.localhost:8443 et https://jellyfin.citadel.localhost:8443 répondent ; puis pnpm prod:local:down
pnpm release --dry-run                          # attendu (tout commité) : validation, résumé, arrêt avant le tag
```

---

## 13. Supervision et alertes

| Quoi | Outil | Alerte |
|---|---|---|
| Le site répond depuis Internet, donc le NAS vit | healthchecks.io : job `site-check`, toutes les 5 min | e-mail et Discord |
| Les jobs : sauvegardes, test de restauration | healthchecks.io : chaque job lui signale sa réussite ou son échec | e-mail et Discord, si un job échoue **ou ne s'est pas exécuté à l'heure** |
| Certificats, disques, conteneurs, mises à jour | console d'administration | affichage ; TOS garde ses e-mails SMART et espace disque |

- Tout passe par healthchecks.io, qui alerte aussi quand un signal attendu ne vient pas : NAS éteint, `infra-ops` arrêté, job qui n'a pas tourné. Son offre Hobbyist est gratuite sans limite de durée (20 contrôles, il en faut 5). UptimeRobot peut ensuite être désactivé (étape 31).
- `site-check` part du NAS, mais comme le site passe par Cloudflare, sa requête fait le tour par Internet (Cloudflare, puis la box) : elle suit le chemin des visiteurs. Limite : si `infra-ops` s'arrête, l'alerte annonce un site injoignable alors que c'est la surveillance qui est tombée.
- Rien à configurer côté e-mail : healthchecks.io envoie les e-mails lui-même, et poste dans un salon de ton serveur Discord (pas en message privé).
- Caddy renouvelle ses certificats 30 jours avant l'échéance, et réessaie seul : la console suffit pour les surveiller.

---

## 14. Console d'administration

### 14.1 Contraintes

- Joignable depuis le LAN et par Tailscale, jamais depuis Internet.
- Moins de 80 Mo de RAM au repos, CPU nul quand personne ne la regarde ; aucune base de données, des fichiers JSON suffisent.

### 14.2 Architecture

- `apps/admin` : un serveur Express et un front React, avec `@citadel/design-system` et `@citadel/common`, dans un seul conteneur, `infra-admin`.
- **Docker, à travers `infra-socket-proxy`** (`wollomatic/socket-proxy`), qui filtre chaque requête par méthode et par chemin : lire l'état, les statistiques et les logs des conteneurs ; les démarrer, arrêter, redémarrer. Tout le reste est refusé (créer un conteneur, exécuter une commande dedans, toucher aux images ou aux volumes). En plus, la console n'agit que sur les conteneurs étiquetés `citadel.controllable`.
- **Jobs et déploiements** : la console dépose une demande dans `state/queue/`, qu'`infra-ops` vérifie (liste fermée d'actions et de versions) puis exécute. Une faille dans la console ne donne donc ni les pleins droits sur Docker, ni l'accès au Drive.
- **Sources** : API Docker ; `state/` (jobs, déploiements, mises à jour) ; API de qBittorrent, de Jellyfin et de Gluetun ; logs de Caddy ; relevés d'`infra-ops` (Drive, disques) ; `/proc` de l'hôte, en lecture seule.

### 14.3 Fonctionnalités, toutes validées

Étapes 21 et 22 : 1, 3 à 10, sans ce qui dépend des jobs. Étape 30 : le reste.

1. **Services** par groupe : état, santé, depuis quand, redémarrages, CPU, RAM et limite ; démarrer, arrêter, redémarrer un service ou un groupe, avec confirmation pour les services « toujours allumés ».
2. **Jobs** : dernier résultat et détail des contrôles, prochain passage, « Lancer maintenant », log.
3. **Site** : version en prod, historique des déploiements.
4. **qBittorrent** : vitesses, totaux de la session et depuis toujours, ratio, historique par jour et par semaine.
5. **Système** : CPU et RAM du NAS, espace libre et santé des disques, températures si lisibles.
6. **Accès externes** : dernières requêtes sur le site, IP les plus actives, scans suspects (`/wp-login.php`, `/.env`…), lectures Jellyfin en cours, appareils Tailscale connectés.
7. **VPN** : IP publique de Gluetun, pays, port redirigé.
8. **Échéances** : certificats, token IGDB, quota du Drive.
9. **Logs** d'un conteneur (200 dernières lignes).
10. **Versions** : chaque outil, sa version en service et la dernière publiée (§10.7).
11. **Arrêt automatique** : par exemple, les *arr arrêtés 3 h après leur démarrage manuel ; refus d'arrêter Jellyfin pendant une lecture.
12. **Déployer** une version déjà construite, ou revenir à la précédente, en un clic, après le même plan que `citadel deploy`.
13. **Mode maintenance** du site.

### 14.4 Sécurité

- **Mot de passe propre à la console**, choisi par toi. Ta question sur le front sans serveur : la console en a un, son serveur Express. C'est lui qui compare le mot de passe au hachage `ADMIN_PASSWORD_HASH` de `.env.prod`, puis pose un cookie de session (`HttpOnly`, `SameSite=Strict`, `Secure` en HTTPS) que chaque appel à son API exige. Le front n'affiche que le formulaire : le contourner ne donne rien.
- Utile même derrière Tailscale : un appareil compromis de ton réseau, ou un invité sur ton Wi-Fi, ne peut pas piloter tes conteneurs.
- Protection CSRF, tentatives de connexion limitées, journal des actions ; conteneur non-root, en lecture seule, sans capacités.

---

## 15. Roadmap

Chaque étape se termine par une vérification. Jusqu'à l'étape 14, on ne fait que commiter : **aucun push**.

**Phase 0 — Préparer le NAS et les comptes (aucun code)**
1. [toi] Inventaire de l'annexe A.1 ; tu me renvoies la sortie, relue.
2. [toi] Sauvegarde complète avant de toucher à TOS : `backup.sh --complete`, plus une copie de `appdata/docker`, des `.env` actuels et de `rclone.conf` sur ton PC (`~/bin/rclone config file` donne son chemin).
3. [toi] Arrêter proprement les conteneurs (`docker stop`), passer en TOS 7, vérifier que la stack média redémarre (`docker start`, Gluetun d'abord, P18), relancer l'inventaire (A.1).
4. [toi] TOS : redémarrage automatique après une coupure de courant, si TOS le propose.
5. [toi] Bbox : seules les redirections 80 → 8001 et 443 → 4443 vers le NAS ; UPnP et NAT-PMP désactivés.
6. [toi] Reconnecter le NAS à Tailscale et désactiver l'expiration de sa clé (P19) ; vérifier que la liaison est directe (`tailscale ping` du NAS vers ton téléphone en 4G), sinon port UDP fixe pour Tailscale, redirigé sur la box. Puis clé SSH de ton PC vers le NAS, alias `nas` dans `~/.ssh/config` (nom Tailscale du NAS, port 9222).
7. [toi] SSH du NAS, une fois la clé en place : `PasswordAuthentication no`, `KbdInteractiveAuthentication no` (l'autre voie par laquelle le mot de passe est demandé) et `PermitRootLogin prohibit-password`. Pas `no` : ton compte TOS a l'UID 0, il serait refusé lui aussi. Vérifier après un redémarrage que TOS n'a pas remis l'ancien réglage, ni les droits de ton dossier personnel : TOS 7 l'ouvre en écriture à tous (`777`), et SSH refuse alors la clé (`chmod 755 ~`).

**Phase 1 — Le dépôt, en local (commits, aucun push)**

8. [moi] `docker/` → `infra/` ; `.env.example` unique, `.env` et `.env.test` à la racine ; renommages (§5.3) ; front sur `/api`.
9. [moi] Bases de dev et de test en conteneurs, tests d'intégration branchés dessus.
10. [toi] Désinstaller MariaDB de ton PC.
11. [moi] Serveur : `/health`, arrêt propre.
12. [moi] `Dockerfile` et `.dockerignore`. Fini quand le site tourne dans Docker Desktop avec les images construites en local, proxys compris.
13. [moi] `compose.yml` (site et infra), `Caddyfile`, `citadel`, `scripts/release.sh`, `images.yml`, testés en local autant que possible.

**Phase 2 — Premier push**

14. [nous] Refaire l'historique local sans aucun secret, scanner tout l'historique avec gitleaks, puis pousser.
15. [toi] Premier tag : les images arrivent sur GHCR ; passer chaque package en public. Rien ne bouge sur le NAS : c'est le test de `images.yml`.

**Phase 3 — La stack média dans le dépôt, testée sur ton PC**

16. [toi] Relever les versions des images média qui tournent sur le NAS (commande fournie), pour les figer telles quelles.
17. [moi] Services média, `infra-tailscale` et un `infra-ops` réduit au job `vpn-watch` (P18) dans `compose.yml` : versions figées, labels, modes, limites ; Caddy sert `media-jellyfin` directement, sans `proxy-net`.
18. [moi] `pnpm prod:local` lance aussi la stack média : volumes Docker jetables à la place des dossiers du NAS, un faux Gluetun (ni VPN ni clé sur ton PC), pas de transcodage matériel ; `pnpm prod:local:down` efface tout.
19. [toi] Tester en local : chaque service démarre, les *arr répondent sur leurs ports, Jellyfin sur `https://jellyfin.citadel.localhost:8443`. En local, rien ne passe par un VPN : aucun torrent.

**Phase 4 — Console d'administration, sans les sauvegardes**

20. [nous] Matrice d'accès détaillée (§12.1).
21. [moi] `apps/admin`, image `admin`, `infra-socket-proxy`, connexion par mot de passe ; fonctionnalités 1, 3, 4, 5, 7, 9, 10 (§14.3). Testée dans `pnpm prod:local`.
22. [moi] Fonctionnalités 6 et 8.

**Phase 5 — Bascule du NAS, en une fois**

23. [nous] `/Volume1/citadel` et `.env.prod`, avec des secrets neufs rangés dans Bitwarden au fur et à mesure ; installation de `citadel` ; [toi] jeton API Cloudflare limité au DNS de ton domaine (§12.3).
24. [nous] Bascule à un moment calme : archive de `/Volume1/appdata` sur le HDD ; tâche planifiée de `backup.sh` désactivée (elle relancerait l'ancien projet) ; arrêt de NPM, de l'ancien site et des trois projets média ; premier `pnpm release`, puis `citadel start media` (les services « à la demande » sont créés arrêtés). Retour arrière : arrêter `citadel`, relancer les anciens conteneurs, arrêtés mais pas supprimés ; les *arr et cross-seed, dont les conteneurs n'existent déjà plus, se recréent avec l'ancien `docker-compose -f docker-compose.stackarr.yml up -d` (leurs images sont encore sur le NAS).
25. [toi] Vérifier : site, `/api`, Irigo, Backlog ; Jellyfin depuis l'extérieur et transcodage ; VPN et port forwarding, qBittorrent, *arr ; console en LAN et par Tailscale ; DBeaver par SSH ; mode SSL « Full (strict) » chez Cloudflare.
26. [moi] `infra/README.md` : remonter le NAS de zéro.

Jusqu'à la phase 6, seules sauvegardes : le dump avant chaque déploiement et l'archive de l'étape 24. Accepté.

**Phase 6 — Sauvegardes, pré-prod, alertes, par-dessus le reste**

27. [toi] Compte healthchecks.io, branché sur ton e-mail et un salon Discord ; remote rclone chiffré, mot de passe et sel dans Bitwarden **avant** le premier envoi.
28. [moi] `infra-ops` complet ; `db-backup`, `db-restore-test`, `site-check`, pré-prod ; répétition des migrations dans `citadel deploy`.
29. [moi] `config-backup`, `config-verify`, `update-check`, `qbittorrent-stats`.
30. [moi] Console : fonctionnalités 2, 11, 12, 13, et ce qui dépend des jobs dans 4, 8, 10 (historique de qBittorrent, quota du Drive, dernières versions publiées).
31. [toi] Une semaine d'observation et un échec simulé. Fini quand : 7 matins de suite avec restauration vérifiée, et une alerte reçue. Puis désactiver UptimeRobot.

**Phase 7 — Réseau, sécurité, ménage**

32. [nous] Réglages Tailscale (§12.4).
33. [toi] Depuis l'extérieur (4G) : seuls 80 et 443 répondent.
34. [toi] Changer les secrets restants (clé WireGuard Proton…).
35. [nous] Ménage : `docker/other` sur ton PC, packages GHCR `reunification-*`, enregistrement DNS `api.` chez Cloudflare.
36. [nous] Ménage du NAS, sans rien perdre : ce qui tourne en permanence pour rien (applis TOS, services) ; `appdata/#recycle`, `appdata/reunification`, `appdata/nginx-proxy-manager`, `appdata/docker`, `/Volume1/backup`, raccourcis de `@collect` ; `joal`, `compare_movies.py`, `Flow.jpg`, `~/bin/rclone` ; ancien dossier `NAS_BACKUP` du Drive, après un mois de nouvelles sauvegardes.

---

## 16. Questions ouvertes

Aucune pour l'instant.

---

## 17. Pour plus tard

- Procédures de restauration écrites et testées : la config d'un service, toute la stack média, la base de prod.
- Instantanés Btrfs (tes deux volumes sont en Btrfs) : retour en arrière après une suppression accidentelle, et coupure plus courte de `config-backup`.
- Onduleur : sans lui, une coupure de courant peut abîmer la base ou les bases SQLite des *arr.
- Déploiement sans coupure (blue/green derrière Caddy) ; déploiement sans GitHub (images construites sur ton PC, envoyées par SSH).
- `.env.prod` chiffré et versionné (SOPS + age).
- Nettoyage automatique des vieilles images sur GHCR.
- Limitation de débit sur l'API ; CrowdSec devant le site et Jellyfin.
- Double authentification sur TOS, pas trouvée dans TOS 7 : risque limité, son interface n'est jamais exposée sur Internet.
- IPv6 ; géolocalisation des IP dans la console (base GeoLite2) ; passkeys pour la console.
- Relais IGDB par le serveur, avec renouvellement du token, en même temps que l'authentification du site.
- Node 26, MariaDB 12.3 et Flyway 13, testés en pré-prod.
- Jellyfin 12, sortie en octobre 2026 : sa base migre sans retour possible, donc après une copie de `/Volume1/appdata/jellyfin`.

---

## Annexe A — Inventaire du NAS

### A.1 Inventaire

À lancer en SSH, préfixé de `sudo` si nécessaire, puis à me renvoyer. Ces commandes ne modifient rien. Relis la sortie avant de la partager : elle ne doit contenir aucun secret, et elle ne va jamais dans le dépôt.

```sh
echo "== Système"; uname -a; cat /etc/os-release 2>/dev/null | head -3; id
echo "== Outils"; for c in bash curl tar git jq flock rclone; do printf '%s : ' "$c"; command -v "$c" || echo absent; done
echo "== Docker"; docker version --format 'moteur {{.Server.Version}}'; docker compose version; docker-compose version 2>/dev/null
docker info --format 'root={{.DockerRootDir}} stockage={{.Driver}} logs={{.LoggingDriver}} cgroup={{.CgroupVersion}}'
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
docker inspect --format '{{.Name}} : sortie {{.State.ExitCode}}, redémarrages {{.RestartCount}}, erreur « {{.State.Error}} »' $(docker ps -aq)
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'
echo "== Versions exactes des images (pour les figer)"
docker ps -a --format '{{.Image}}' | sort -u | while read -r image; do docker image inspect --format "$image {{index .Config.Labels \"org.opencontainers.image.version\"}} {{index .Config.Labels \"build_version\"}} {{range .RepoDigests}}{{.}}{{end}}" "$image"; done
docker exec tailscale tailscale version 2>/dev/null | head -1
echo "== Disques"; df -hT /Volume1 /Volume2
echo "== Mémoire"; free -m
echo "== Traces de manque de mémoire (gels)"; dmesg 2>/dev/null | grep -iE 'out of memory|oom|killed process' | tail -n 20
echo "== Ports en écoute (80 et 443 sont-ils pris par TOS ?)"; (ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -i listen
echo "== SSH (tunnels autorisés ?)"; grep -iE '^\s*(AllowTcpForwarding|PasswordAuthentication|PubkeyAuthentication|PermitRootLogin)' /etc/ssh/sshd_config
echo "== Tâches planifiées"; crontab -l 2>/dev/null; cat /etc/crontab 2>/dev/null; ls /etc/cron.d 2>/dev/null
echo "== Tailles"; du -sh /Volume1/appdata/* 2>/dev/null
echo "== rclone (remotes, et présence d'un client OAuth à toi)"; R=~/bin/rclone; "$R" listremotes --long; "$R" config show 2>/dev/null | grep -E '^\[|^type|^client_id' | sed 's/^client_id.*/client_id = (présent)/'
echo "== Domaines déclarés dans NPM"; grep -hE '^\s*(server_name|set \$server|set \$port)' /Volume1/appdata/nginx-proxy-manager/config/nginx/proxy_host/*.conf 2>/dev/null
echo "== IP des clients vues par NPM (réelles ou 172.x ?)"; tail -n 5 /Volume1/appdata/nginx-proxy-manager/config/logs/proxy-host-*_access.log 2>/dev/null
```

À relever aussi dans l'interface de TOS : la version exacte, la commande de la tâche planifiée de sauvegarde, et l'option de redémarrage après coupure de courant. Sur la Bbox : la liste des redirections et l'état de l'UPnP.

---

## Annexe B — Références

- Tarifs GitHub Actions 2026 (dépôts publics gratuits) : <https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/>
- Vite, `envDir` et `loadEnv` : <https://vite.dev/config/shared-options#envdir>
- socket-proxy (wollomatic), listes blanches par méthode et par chemin : <https://github.com/wollomatic/socket-proxy>
- Image Docker de Flyway : <https://hub.docker.com/r/flyway/flyway>
- MariaDB 11.8 LTS : <https://mariadb.org/11-8-is-lts/>
- Calendrier de Node.js : <https://endoflife.date/nodejs>
- Docker sur TOS 6 (forum TerraMaster) : <https://forum.terra-master.com/en/viewtopic.php?p=56339>
- Caddy, certificats par challenge DNS : <https://caddyserver.com/docs/automatic-https#dns-challenge>
- rclone crypt : <https://rclone.org/crypt/>
- healthchecks.io : <https://healthchecks.io/docs/>
- Chrome, autorisation d'accès au réseau local (Chrome 142) : <https://blog.openreplay.com/chrome-local-network-access-lna-permission/>
