# CI/CD et hébergement sur le NAS — Cahier des charges

30 octobre 2026 · v4 : phases 0 à 5 faites, donc retirées ; restauration depuis la console, bandeau du site et ajouts venus du cahier de l'authentification · 25 octobre 2026 · v3 : roadmap réordonnée, médias et console avant la bascule, sauvegardes après · aucune question ouverte (§16)

[Citadel](../../README.md) › [Hébergement et mise en production](README.md) › Cahier des charges

Ce document décrit la cible et le chemin pour y arriver : construction et mise en production du site, stack média, sauvegardes, accès et sécurité, console d'administration. **Il fait foi pour la migration**. Le mode d'emploi de ce qui est en place est dans le [README](README.md). Ce qui est fait (phases 0 à 5) en est retiré : le code, commenté, et l'historique git en gardent le détail. Les sections restantes gardent leur numéro, auquel le code renvoie.

Conventions :
- **[Q2]** renvoie à la question 2 de la §16 ; ce qui en dépend reste provisoire.
- Dans la roadmap (§15), **[toi]**, **[moi]** ou **[nous]** dit qui fait l'étape.
- Chaque fichier créé pour l'infra (Dockerfile, compose, scripts, workflow, Caddyfile, conf nginx) est **commenté abondamment** : pourquoi et comment, même si les commentaires dépassent le code.
- Quand tu tranches entre plusieurs options, les autres disparaissent du document.

## Sommaire

- §2 Existant et problèmes relevés
- §8 Mise en production (CD)
- §9 Environnements
- §10 Projet Docker Compose unique sur le NAS
- §11 Sauvegardes et restauration
- §12 Réseau, accès et sécurité
- §13 Supervision et alertes
- §14 Console d'administration
- §15 Roadmap
- §16 Questions ouvertes
- §17 Pour plus tard
- Annexe B — Références

---

## 2. Existant et problèmes relevés

### 2.1 Matériel

- NAS sous TOS : Intel N95 4 cœurs, 8 Go de RAM.
- `Volume1` : SSD NVMe 500 Go (configs dans `/Volume1/appdata`, Docker). `Volume2` : HDD 12 To (`data/medias` et `data/torrents` sur le même volume, pour les hardlinks des *arr). Les deux en Btrfs.
- Un disque par volume, sans redondance ni onduleur : d'où les copies sur l'autre disque et hors site (§11).

### 2.4 Sauvegardes

`backup.sh`, le lundi à 3 h par le planificateur de TOS : archive de `/Volume1/appdata` (environ 800 Mo, surtout les 2 000 fichiers .torrent), envoi sur le Drive, purge au-delà de 15 jours. La base du site n'est pas sauvegardée. Défauts : P9, P10, P16, P17.

### 2.5 Problèmes relevés

| # | Constat | Correction |
|---|---|---|
| P9 | `backup.sh` arrête les services depuis `appdata/docker`, qui n'a plus de `docker-compose.yml` : la commande échoue sans arrêter le script (pas de `set -e`), les bases SQLite des *arr sont archivées en pleine écriture | Job `config-backup` (§11.5) |
| P10 | Après la sauvegarde, tout redémarre, même un service arrêté exprès | Le job remet l'état d'avant |
| P16 | `rclone delete --min-age 15d` vise tout le dossier du Drive | Un dossier et une rétention par type (§11.7) |
| P17 | Copie locale supprimée après l'envoi, archives en clair sur le Drive | Copies identiques sur le HDD et le Drive, chiffrées (§11.7) |

Hors périmètre : l'authentification de l'API, ton chantier suivant.

---

## 8. Mise en production (CD)

### 8.2 `citadel deploy <version>`, sur le NAS

Reste à ajouter, entre le dump (4) et les migrations en prod (6) :

5. **Répétition en pré-prod**, si la version apporte des migrations : dernier dump restauré dans `site-preprod-db`, migrations, nouveau serveur démarré, `/health`, puis pré-prod arrêtée. En cas d'échec, arrêt : la prod n'a pas été touchée.

---

## 9. Environnements

| | Pré-prod |
|---|---|
| Où | NAS, arrêtée la plupart du temps |
| Base | `site-preprod-db`, restaurée chaque nuit depuis la prod |
| Code | images de la prod |
| Adresse | interne : IP et port du NAS, en LAN ou par Tailscale |
| Variables | `.env.prod`, base `citadel_preprod` |

---

## 10. Projet Docker Compose unique sur le NAS

### 10.2 Groupes, modes et rôle des conteneurs

| Groupe | Conteneurs | Mode |
|---|---|---|
| `site-preprod-` | `client`, `server`, `db`, et `migrations` | à la demande : test de restauration, répétitions de déploiement, ou toi |

### 10.5 Mémoire

| Service | Limite | Remarque |
|---|---|---|
| `site-preprod-*` | 512 + 256 + 64 Mo | quelques minutes par nuit seulement |

### 10.7 Mises à jour des images tierces

- Chaque nuit, `update-check` compare avec les versions publiées ; la console liste les mises à jour disponibles des images tierces (pas les nôtres, qui suivent les versions de Citadel), avec leurs notes de version.

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
| Chaque nuit, 03:30 | `log-retention` | aucun : vide le log d'un conteneur dont la plus vieille ligne a plus de 90 jours (§12.7) |
| Chaque nuit, 04:00 | `update-check` | aucun : liste les mises à jour d'images |
| Chaque nuit, 04:30 | `vpn-leak-test` | aucun : IP de sortie et DNS des téléchargements, par le VPN |
| Toutes les heures | `qbittorrent-stats` | aucun : compteurs pour les historiques de la console |
| Toutes les heures | `storage-stats` | aucun : place prise par Docker, les configs, les sauvegardes et la base |
| Toutes les 5 min | `site-check` | aucun : vérifie que le site répond depuis Internet (§13) |
| Toutes les minutes | `vpn-watch` | aucun : relance les services du réseau de Gluetun qui n'ont pas pu démarrer ou ont perdu son réseau |

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
- rclone utilise ton propre client OAuth Google, publié en production, avec la portée `drive.file` : procédure dans le [README](README.md#accès-au-drive-rclone).
- Changer de fournisseur (1 To ailleurs) : rclone en gère plusieurs dizaines, seul le « remote » change.

| | Rétention, sur le HDD et sur le Drive |
|---|---|
| Base, chaque jour | les 14 derniers jours + les 4 derniers dimanches + les 2 derniers premiers dimanches du mois |
| Base, avant déploiement | les 2 derniers, 30 jours au plus |
| Configs, chaque lundi | les 4 dernières semaines + les 2 derniers premiers lundis du mois |

Environ 5 Go de configs et quelques centaines de Mo de base sur chaque support. La plus vieille sauvegarde de la base a moins de 10 semaines : une donnée effacée disparaît des sauvegardes en moins de 3 mois, la limite fixée par le [cahier de l'authentification](../auth/cahier_des_charges.md) (§10) et annoncée sur la page « Données personnelles ».

### 11.8 Restauration depuis la console, bandeau du site

- **Zone de danger** de la console : restaurer la base du site à partir d'une sauvegarde du NAS (quotidienne ou avant déploiement), ou, en secours, d'un dump envoyé depuis ton PC. Confirmation en tapant « RESTAURER ».
- La console dépose la demande (§14.2). `infra-ops` contrôle un dump envoyé comme ceux de `db-backup` (archive valide, dernière ligne `-- Dump completed`), dumpe d'abord la base actuelle (`/Volume2/backups/db/pre-restore/`, même rétention que les dumps avant déploiement), puis lance `citadel restore-db`.
- **Bandeau du site** : entre le header et le contenu, sur tous les projets, orange, emoji 🚧 ou ⚠️, animation soignée. Il affiche n'importe quel message :
  - après une restauration, automatiquement, pendant 3 mois : « Le site a été restauré le JJ/MM à partir d'une sauvegarde du JJ/MM. Ce qui a été fait entre ces deux dates est perdu. » ;
  - écrit depuis la console, avec une date de fin facultative, et retirable : « Site en maintenance », « Les inscriptions sont fermées : tu peux encore te connecter si tu as un compte »…
- `infra-ops` écrit le message dans un fichier JSON (identifiant, texte, date de fin) que Caddy sert tel quel (`/banner.json`) : ni base ni API en jeu, le bandeau s'affiche même si l'API est en panne.
- Le bandeau ne disparaît que par sa croix. Le choix est retenu dans le `localStorage` avec l'identifiant du message : un nouveau message, dont une nouvelle restauration, le réaffiche.
- Le cahier de l'authentification y ajoutera la commande « après restauration » du serveur et une phrase au message (son §10.5).

---

## 12. Réseau, accès et sécurité

### 12.1 Matrice d'accès

Pré-prod (phase 6) : `http://…:8002`, servie par Caddy ; LAN et Tailscale seulement, sans connexion. Le reste de la matrice est en place : voir le [README](README.md#accès).

### 12.4 Tailscale

- ACL : tes appareils vers le NAS. MagicDNS activé.

### 12.5 La base de prod depuis DBeaver

Mêmes comptes en pré-prod, avec des droits sur `citadel_preprod` seulement.

### 12.7 Avant l'authentification

Venus du [cahier de l'authentification](../auth/cahier_des_charges.md), qui commence après cette phase :
- **Logs à 90 jours au plus**, pour la règle des 3 mois (cahier de l'authentification, §10.1) : le pilote de logs de Docker ne limite que la taille (3 fichiers de 10 Mo). Un job nocturne d'`infra-ops` vide le log d'un conteneur dont la plus vieille ligne a plus de 90 jours, logs d'accès de Caddy compris (écrits sur sa sortie standard). La page « Données personnelles » l'annonce.
- **Content-Security-Policy** : en-tête envoyé par Caddy, qui dit au navigateur d'où la page a le droit de charger scripts, styles, images et connexions. Un script injecté (faille XSS) venant d'ailleurs est refusé : c'est la seconde barrière qui protégera les sessions. Testée en `prod:local` : une CSP mal réglée casse le front sans bruit.
- **Veille des dépendances** : `pnpm audit` dans `validate-all`, alertes Dependabot sur le dépôt GitHub.
- **`contact@`** : Cloudflare Email Routing transfère `contact@` vers ta boîte personnelle : rien à héberger (aucune boîte n'existe encore sur le domaine). L'adresse de contact des pages légales devient `contact@`.

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

### 14.2 Architecture

- **Jobs et déploiements** : la console dépose une demande dans `state/queue/`, qu'`infra-ops` vérifie (liste fermée d'actions et de versions) puis exécute. Une faille dans la console ne donne donc ni les pleins droits sur Docker, ni l'accès au Drive.

### 14.3 Fonctionnalités, toutes validées

- **Jobs** : dernier résultat et détail des contrôles, prochain passage, « Lancer maintenant », log.
- **Arrêt automatique** : par exemple, les *arr arrêtés 3 h après leur démarrage manuel ; refus d'arrêter Jellyfin pendant une lecture.
- **Déployer** une version déjà construite, ou revenir à la précédente, en un clic, après le même plan que `citadel deploy`.
- **Mode maintenance** du site.
- **Restaurer la base** du site, depuis le NAS ou le Drive, écrire ou retirer le message du bandeau (§11.8).
- **Sauvegardes de la base** : celles du NAS et du Drive, suppression à la main.
- **Stockage** : place prise par Docker et les services, taille de la base ; nettoyage des images inutiles, jamais celles des retours arrière.
- **Test de fuite du VPN** à la demande ; **limites RAM et CPU** d'un conteneur changées à chaud, jusqu'à sa recréation.
- Ce qui dépend des jobs : historique de qBittorrent par jour et par semaine, quota du Drive dans les échéances (relevé après chaque opération sur le Drive), dernière version publiée dans « Versions ».

---

## 15. Roadmap

Chaque étape se termine par une vérification.

Jusqu'à la phase 6, seules sauvegardes : le dump avant chaque déploiement et l'archive faite à la bascule. Accepté.

**Phase 6 — Sauvegardes, pré-prod, alertes, par-dessus le reste**

27. [toi] Compte healthchecks.io, branché sur ton e-mail et un salon Discord ; remote rclone chiffré, mot de passe et sel dans Bitwarden **avant** le premier envoi.
28. [moi] `infra-ops` complet ; `db-backup`, `db-restore-test`, `site-check`, pré-prod ; répétition des migrations dans `citadel deploy`.
29. [moi] `config-backup`, `config-verify`, `update-check`, `qbittorrent-stats`.
30. [moi] Console : fonctionnalités restantes (§14.3), dont la restauration et le bandeau du site (§11.8).
31. [toi] Un échec simulé, puis observation. Fini quand : une alerte reçue, puis les premiers matins avec restauration vérifiée. Puis désactiver UptimeRobot.

**Phase 7 — Réseau, sécurité, ménage**

32. [nous] Réglages Tailscale (§12.4).
33. [toi] Depuis l'extérieur (4G) : seuls 80 et 443 répondent.
34. [toi] Changer les secrets restants (clé WireGuard Proton…).
35. [nous] Ménage : `docker/other` sur ton PC, packages GHCR `reunification-*`, enregistrement DNS `api.` chez Cloudflare.
36. [nous] Ménage du NAS, sans rien perdre : ce qui tourne en permanence pour rien (applis TOS, services) ; `appdata/#recycle`, `appdata/reunification`, `appdata/nginx-proxy-manager`, `appdata/docker`, `/Volume1/backup`, raccourcis de `@collect` ; `joal`, `compare_movies.py`, `Flow.jpg`, `~/bin/rclone` ; ancien dossier `NAS_BACKUP` du Drive, après un mois de nouvelles sauvegardes.
37. [moi] Avant l'authentification (§12.7) : logs à 90 jours, CSP, `pnpm audit` et Dependabot ; page « Données personnelles » à jour.
38. [toi] `contact@` dans Cloudflare Email Routing ; [moi] adresse des pages légales.

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
- Node 26, MariaDB 12.3 et Flyway 13, testés en pré-prod.
- Jellyfin 12, sortie en octobre 2026 : sa base migre sans retour possible, donc après une copie de `/Volume1/appdata/jellyfin`.

---

## Annexe B — Références

- rclone crypt : <https://rclone.org/crypt/>
- healthchecks.io : <https://healthchecks.io/docs/>
