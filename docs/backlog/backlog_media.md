# Backlog des médias

[Citadel](../../README.md) › Backlog des médias

Cahier des charges du suivi des films et des séries, à construire : rien n'existe encore dans le code. Il ne décrit que ce qui est nouveau ; tout ce qui reprend le [backlog des jeux](backlog_game.md) est seulement cité (§10). Les questions encore ouvertes sont au §11, et les tâches dans le [todo](../todo/todo.md#6-backlog).

## Sommaire

1. [Principes](#1-principes)
2. [Mode classique et mode connecté](#2-mode-classique-et-mode-connecté)
3. [Sécurité et exposition](#3-sécurité-et-exposition)
4. [Notions et lignes](#4-notions-et-lignes)
5. [Colonnes](#5-colonnes)
6. [Où vivent les données](#6-où-vivent-les-données)
7. [Ajout et import](#7-ajout-et-import)
8. [Le job hebdomadaire](#8-le-job-hebdomadaire)
9. [Script d'essai](#9-script-dessai)
10. [Repris du backlog des jeux](#10-repris-du-backlog-des-jeux)
11. [Questions ouvertes](#11-questions-ouvertes)

## 1. Principes

- **Personnel, comme les jeux** : chaque compte a son backlog de films et de séries, sur la même route que les jeux.
- **Tout s'ajoute à la main**, par une recherche TMDB (§7). Rien n'entre automatiquement depuis Radarr, Sonarr, Jellyfin ou qBittorrent ; le job hebdomadaire signale seulement ce qui y est présent sans être dans le backlog (§8). Seule exception, un import de liste, qui est une fonction de l'interface (§7.2).
- **Deux familles de colonnes**, sans mélange :
  - **renseignées par vous** (visionnage, à regarder bientôt, en cours, commentaire, saga…) ou **tirées de TMDB** (titres, langue, dates, durée, images) : stockées dans la base du site, visibles partout ;
  - **relevées sur le NAS** (stockage, collection Jellyfin, partage) ou **cochées par vous mais gardées sur le NAS** (vérifié) : jamais stockées dans la base du site, visibles seulement en mode connecté (§2).
- **Le visionnage n'est jamais tiré de Jellyfin**, ni automatiquement ni par un bouton : il doit couvrir tout ce que vous avez vu dans votre vie, pas seulement sur votre serveur.
- **« Vérifié » n'est jamais deviné** : vous seul le cochez. Le job ne fait que le retirer quand le fichier a été remplacé (§5).
- **Rien de ce qui touche au téléchargement n'est nommé dans le dépôt** : les trackers, leurs adresses et tout ce qui pourrait servir de preuve vivent dans les variables d'environnement du NAS et dans `media-state` (§6), jamais dans le code ni dans la doc.

## 2. Mode classique et mode connecté

- **Mode classique** : tout compte, depuis n'importe où. Les colonnes du NAS n'existent pas : ni affichées, ni dans les filtres, ni dans le choix des colonnes.
- **Mode connecté** : le même site, ouvert par son adresse locale, en LAN et par Tailscale seulement : `http://<IP du NAS>:8003` chez vous, `http://<nom Tailscale du NAS>:8003` par Tailscale, comme la pré-prod (8002) et la console. Jamais par le domaine public, et aucun lien du site public n'y mène : un marque-page sur chaque appareil. Le mode s'y déverrouille par le mot de passe des médias (§3). Son serveur lit la base du site et `media-state`, fusionne les deux par identifiant TMDB, puis trie, filtre, compte et découpe en pages comme pour les jeux, colonnes du NAS comprises. Le site public, lui, ne sait rien du NAS.
- **Fraîcheur** : l'état du NAS est celui du dernier passage du job (§8), dont la date s'affiche en haut du tableau. Seul « Partage en cours » est lu en direct. La console relance le job à la demande (§8).
- **Comportement par colonne** :

| Colonne | Mode classique | Mode connecté |
| --- | --- | --- |
| Titres, langue, sortie, durée, miniature | TMDB, en lecture | Pareil |
| Saga et numéro | Choisis par vous | Pareil, avec la collection Jellyfin à côté |
| Visionnage, à regarder bientôt, en cours, commentaire | Saisis par vous | Pareil |
| Stockage, collection Jellyfin, partage, qualité, poids par heure, doublon | Absents | Relevés sur le NAS, en lecture |
| Vérifié | Absent | Case à cocher, enregistrée sur le NAS |

## 3. Sécurité et exposition

- **Ce qui est sur Internet** : la liste de vos films et séries, vos statuts de visionnage, vos commentaires, comme sur un site du type Letterboxd. Aucune de ces données ne dit d'où viennent vos fichiers.
- **Ce qui n'y est jamais** : stockage, téléchargements, partage, trackers, chemins de fichiers, « vérifié », collections Jellyfin. Ces données restent dans `/Volume1/appdata/media-state` (§6) et ne sont lues que par l'instance locale.
- **Le NAS n'échange rien avec le site public** : le job n'écrit que dans `media-state`, ne lit pas la base du site, et le serveur public ne lit pas `media-state`.
- **L'instance locale** : un second conteneur de la même image que le serveur du site (`site-local-server`), comme la pré-prod en est un, mais branché sur la base de prod.
  - **Joignable seulement en LAN et par Tailscale**, servie par Caddy sur un port que la box ne redirige pas (8003), en HTTP comme la console et la pré-prod : par Tailscale, WireGuard chiffre tout ; en LAN, les mots de passe ne traversent que votre réseau domestique.
  - **Le seul conteneur du site à monter `media-state`** (en lecture, sauf les cases « vérifié ») et à pouvoir lire qBittorrent en direct.
  - **En veille, réveillée à la visite** (`citadel.mode: on-demand`) : arrêtée, elle ne prend ni CPU ni RAM.
    - **Réveil** : quand elle est arrêtée, Caddy, au lieu de l'erreur 502, passe la visite à la console, qui dépose une demande « démarrer `site-local-server` » dans `state/queue/`, comme son bouton « Démarrer ». `infra-ops` lit cette file toutes les 2 secondes et démarre le conteneur. La page affiche « Démarrage… » et se recharge seule : quelques secondes d'attente.
    - **Pourquoi ce détour** : Caddy, exposé à Internet, n'a jamais accès à Docker. La console ne gagne qu'une action, sans mot de passe mais fixe (démarrer ce seul conteneur) et limitée en fréquence, joignable seulement par le port 8003. Un invité sur votre wifi peut au pire la démarrer, et tombe sur la page de connexion.
    - **Arrêt** : après **environ 10 minutes sans aucune requête**, par l'arrêt automatique commun aux services à la demande ([todo, §4.1](../todo/todo.md#41-nas-et-matériel)) : Caddy note la dernière visite, `infra-ops` vérifie chaque minute.
    - **Le front ne relit rien tout seul** (pas de rafraîchissement périodique) : sinon, un onglet oublié la tiendrait éveillée. « Partage en cours » se lit au chargement et à chaque action.
    - **Le job hebdomadaire n'en a pas besoin** : il parle directement à qBittorrent, Radarr, Sonarr, Jellyfin et au disque, et n'écrit que dans `media-state`.
- **Organisation du code** : une seule image, un seul code.
  - Le module des médias du NAS est dans le serveur (`apps/server/src/projects/backlog/`), comme le reste du backlog. Ses routes ne sont **montées** que si `MEDIA_STATE_DIR` est posée au démarrage. Le serveur public n'a pas cette variable, et ces routes n'existent donc pas chez lui : 404, comme une adresse inconnue.
  - **Deux barrières de plus côté prod** : le conteneur public ne monte pas `media-state` (même activées par erreur, ces routes n'auraient rien à lire), et Caddy répond 404 à ces chemins sur le domaine public, comme il le fait déjà pour `/api/internal`.
  - **Le front est le même partout** : au chargement du backlog, il demande au serveur si le mode connecté est disponible. Le serveur public répond non, et le front reste en mode classique.
  - **Tests** : les tests d'intégration et `pnpm prod:local` utilisent un `media-state` fictif, versionné avec les tests, sans aucun vrai nom de fichier, de torrent ni de tracker. `prod:local` démarre aussi l'instance locale, pour tester le mode connecté sur votre PC. La pré-prod n'en a pas : elle ne sert qu'à répéter les migrations.
  - **Pourquoi pas le serveur public lui-même** : il ne peut pas savoir si une requête vient de chez vous. Tout passe par Cloudflare, qui donne l'IP de votre box en LAN (la même pour vos invités) et celle de votre opérateur mobile par Tailscale. Et une faille du serveur public, exposé à tout Internet, livrerait alors `media-state`. Séparé, le serveur public n'a simplement pas les données.
  - **Le code est public, l'accès non** : le dépôt montre qu'un mode connecté existe et comment il lit `media-state`, comme l'infra montre déjà qBittorrent et cross-seed. Il ne montre ni données, ni trackers, ni chemins réels, ni adresse : rien de tout cela n'est atteignable depuis Internet.
- **Connexion** : votre compte du site (une session propre à l'adresse locale, sans le préfixe `__Host-`, réservé au HTTPS), puis le **mot de passe des médias**, comme celui de la console : hash argon2id dans `MEDIA_PASSWORD_HASH`, cinq essais par adresse sur un quart d'heure, déverrouillage valable 12 heures. Il est gardé dans un cookie signé, qui survit aux mises en veille (sinon, il faudrait retaper le mot de passe à chaque réveil), et changer le mot de passe l'annule. **Seul votre compte** peut déverrouiller (`MEDIA_OWNER_USER_ID`) : qui apprendrait le mot de passe des médias devrait aussi avoir votre compte, avec sa double authentification. Un invité sur votre wifi qui trouve l'adresse ne voit qu'une page de connexion.
- **Jamais le mot de passe de la console** : un seul mot de passe pour les deux ouvrirait les déploiements et les restaurations à qui connaît celui des médias.
- **Aucune action destructrice** par l'instance locale : supprimer un torrent ou des fichiers ne se fait que dans la console.

## 4. Notions et lignes

- **Film** : une ligne. Les sous-lignes ne concernent que les séries.
- **Série** : une ligne, qui se déplie en une sous-ligne par saison, chacune se dépliant en une sous-ligne par épisode. Les colonnes du NAS s'agrègent vers le haut, comme celles des versions jouées : « Présent 18 / 26 » sur une saison, et le meilleur état de partage.
- **Dépliage** : une seule série et une seule saison dépliées à la fois ; en déplier une autre replie la précédente. Déplier une série d'une seule saison déplie aussi cette saison.
- **Saga** : le nouveau nom de la « série » des jeux, renommée aussi de leur côté. Elle peut mêler films et séries (*Star Wars*).
  - **Toutes les sagas sont à vous**, avec le nom de votre choix, celui de votre collection Jellyfin. Les collections de TMDB n'en sont que la proposition : vos groupes ne leur correspondent pas un à un (*Alien* ou *DCU* en réunissent plusieurs, 39 films sont groupés sans collection TMDB, 44 sont dans une collection TMDB sans groupe).
  - **Une saga se relie à une ou plusieurs collections TMDB**, ce qui sert de nom technique : ajouter un film d'une collection reliée propose cette saga ; un film d'une collection reliée à aucune propose une nouvelle saga au nom de la collection.
  - **Numéro** : ni TMDB ni IMDB (qui n'a pas d'API publique) ne donnent d'ordre. Il est pré-rempli dans l'ordre des dates de sortie, puis se règle comme pour les jeux. Saga et numéro restent toujours modifiables.
- **Identifiants** : celui de TMDB (film ou série) relie tout : le site, le NAS (Radarr, Sonarr et Jellyfin le connaissent) et l'import. Celui d'IMDB est gardé pour référence.

## 5. Colonnes

| Colonne | Source | Détail |
| --- | --- | --- |
| Miniature | TMDB | Affiche du film, de la série ou de la saison ; image de l'épisode, si TMDB en a une. Choisie parmi les images TMDB, comme pour les jeux |
| Titre, titre original | TMDB | Comme les jeux : le titre français dessus, un peu plus clair et plus épais, le titre original dessous quand il diffère |
| Langue originale | TMDB | |
| Saga et numéro | Vous, saga proposée par TMDB | En mode connecté, la collection Jellyfin s'affiche à côté et se signale quand son nom diffère de celui de la saga (§4) |
| Sortie | TMDB | Film : date de sortie ; série : première diffusion ; épisode : date de diffusion |
| Durée | TMDB | Film et épisode ; somme pour une saison et une série |
| Visionnage | Vous | Film et épisode : vu ou pas vu, rien d'autre (ni abandonné, ni date). Saison et série : vues quand tous leurs épisodes le sont, sinon « 12 / 26 ». Règles ci-dessous |
| À regarder bientôt, en cours, commentaire | Vous | |
| Stockage | NAS | Non présent (rien ne correspond) ; En téléchargement (dans qBittorrent, pas fini) ; Présent (fini, pas dans Jellyfin) ; Dans Jellyfin, avec un lien vers l'élément |
| Vérifié | Vous, enregistré sur le NAS | Vous avez lancé le fichier : bon contenu, bon format, bonne langue. **Retiré par le job quand le fichier est remplacé** (autre inode ou autre taille), par exemple quand Radarr en télécharge une meilleure version ; un simple renommage ne le retire pas |
| Collection Jellyfin | NAS | En lecture ; celle que vous avez créée dans Jellyfin |
| Partage | NAS | Partage en cours (envoie en ce moment, lu en direct) ; En seed (tracker OK) ; Tracker injoignable (inactif, revu au passage suivant) ; En erreur (torrent mort) ; Non présent (aucun torrent sur ce fichier) |
| Torrents | NAS | Nom du ou des torrents liés au fichier, cross-seed compris, avec leur tracker |
| Qualité | NAS | Quatre valeurs, d'après la hauteur de l'image : 4K (2160p), FHD (1080p), HD (720p), SD (en dessous) |
| Taille, poids par heure | NAS | Taille du fichier, et taille divisée par sa durée réelle, en Go/h : deux films d'1 h 30, l'un de 2 Go et l'autre de 6 Go, s'y distinguent |
| Doublon | NAS | Plusieurs fichiers distincts (inodes différents) pour ce film ou cet épisode. Plusieurs torrents sur un même fichier (cross-seed) n'en sont pas |

**Filtres** : un par colonne, avec les outils des jeux (ET / OU, réinitialisation, récapitulatif en haut du tableau). Ceux des colonnes du NAS n'existent qu'en mode connecté.

**Visionnage d'une série** : chaque épisode a sa case. Toute action qui touche plus d'un épisode passe par un dialogue de confirmation, comme ceux qui existent déjà :

- cocher une série ou une saison coche tous ses épisodes (et toutes ses saisons) ; la décocher les décoche tous ;
- cocher un épisode dont des précédents ne sont pas vus propose de les cocher aussi ;
- décocher un épisode dont des suivants sont vus propose de les décocher aussi.

Un nouvel épisode ajouté par TMDB (§7.3) n'est pas vu : une série vue en entier repasse à « 26 / 27 ».

- **Épisodes pas encore diffusés** (date future ou inconnue) : affichés, mais hors de la progression : ils ne comptent pas dans « 12 / 26 », et cocher une série ou une saison ne les coche pas.
- **Épisodes spéciaux** (bonus, téléfilms, épisodes de Noël) : tous ceux que TMDB connaît, rangés dans une saison « Épisodes spéciaux » à part, hors des saisons principales, des cascades et de la progression de la série.

**Médias oubliés** : en mode connecté, une liste au-dessus du tableau donne ce qui est sur le disque, dans Radarr, Sonarr, Jellyfin ou qBittorrent sans être dans votre backlog, avec un bouton qui ouvre sa fiche TMDB pour l'ajouter. Ceux qu'aucun outil ne relie à TMDB sont listés par leur chemin.

## 6. Où vivent les données

**Base du site**, avec le même partage que les jeux (§10) :

- **communes** : films, séries, saisons, épisodes et collections de TMDB, avec leurs identifiants et ceux de leurs images. Un média ajouté par un compte est proposé aux autres, sans rien de personnel ;
- **par compte** : le média dans le backlog (miniature choisie, saga et numéro, à regarder bientôt, en cours, commentaire), le visionnage (vu de chaque film et de chaque épisode) et les sagas, avec les collections TMDB qui leur sont reliées (§4). Contrairement aux jeux, aucune saga n'est commune.

**NAS** (`/Volume1/appdata/media-state`, écrit par `infra-ops` et, pour « vérifié », par l'instance locale) : sauvegardé chaque lundi avec le reste d'`appdata`, sur le HDD et chiffré sur le Drive ([infra, §7.1](../infra/infra.md#71-ce-qui-est-sauvegardé)). Il contient :

- le dernier relevé du job, par identifiant TMDB et par épisode : stockage, chemin, empreinte du fichier (inode et taille), qualité et durée, élément et collection Jellyfin, torrents liés et leur état ;
- les cases « vérifié », chacune avec l'empreinte du fichier au moment de la vérification ;
- le relevé de la semaine précédente, pour la comparaison, et rien de plus ancien.

**Médias sur le HDD** (`/Volume2/data`) :

| Dossier | Contenu | Pour le job |
| --- | --- | --- |
| `medias/movies`, `medias/series` | Les films et les séries, lus par Jellyfin | Les bibliothèques |
| `medias/movies_archives` | Les anciens films, pas encore transférés dans `movies` | Comme `movies`, rapprochés de TMDB par le nom du dossier (« Titre (année) ») |
| `torrents/movies`, `torrents/series` | Les fichiers des torrents | Reliés aux bibliothèques par liens physiques |
| `torrents/cross-seed` | Les fichiers des torrents trouvés par cross-seed | Pareil |
| `torrents/other` | Torrents qui ne sont pas des médias (logiciels, jeux) | Comptés dans le rapport des torrents, ignorés partout ailleurs |

Le fichier de `medias/` et celui de `torrents/` sont deux noms d'un même fichier, qui partagent le même **inode** (le numéro du fichier sur le disque) et n'occupent la place qu'une fois. C'est par lui que le job relie un média à ses torrents.

**Variables d'environnement du NAS** (`.env.prod`), en plus de celles qui existent (`QBITTORRENT_USER`, `QBITTORRENT_PASSWORD`, `JELLYFIN_API_KEY`) :

- `RADARR_API_KEY`, `SONARR_API_KEY` ;
- `MEDIA_TRACKERS` : chaque tracker, son nom affiché dans le rapport, son adresse principale et ses adresses de secours (§8) ;
- `MEDIA_PASSWORD_HASH`, `MEDIA_OWNER_USER_ID` et `MEDIA_STATE_DIR`, sur l'instance locale seulement (§3).

**TMDB** : la clé d'API (`TMDB_API_KEY`) reste sur le serveur du site. Les images se chargent depuis `image.tmdb.org`, directement par le navigateur, comme celles d'IGDB.

## 7. Ajout et import

### 7.1 Ajout

Comme pour les jeux : recherche TMDB (films et séries ensemble) dans la barre du haut, fiche en lecture seule, puis ajout au backlog avec miniature, saga et numéro. Une série entre avec toutes ses saisons et tous ses épisodes connus de TMDB, sans choix possible (contrairement aux DLC des jeux) : la fiche les affiche, pour confirmer que c'est la bonne série.

### 7.2 Import de liste

- **Une fonction de l'interface**, pour tout compte : un fichier CSV dont une colonne donne l'identifiant TMDB (et le type, film ou série). Les autres colonnes sont facultatives : saga, numéro, vu (pour une série, le dernier épisode vu, qui coche aussi tous les précédents), à regarder bientôt, commentaire.
- **Aperçu avant tout enregistrement** : une ligne par média reconnu, et la liste de ceux qui ne le sont pas, avec la raison. Rien n'est écrit avant « Valider ».
- **Premier usage, votre liste** `NAS Multimédia.xlsx` :
  - 1 808 films, tous avec leurs identifiants TMDB et IMDB, le groupe (la future saga) et l'identifiant de collection TMDB ;
  - 44 séries (feuille « Séries TEMP ») sans identifiant : un rapprochement TMDB par titre et année, à valider ligne par ligne dans l'aperçu ;
  - sa colonne « État » ne passe pas par l'import : « vérifié » vit sur le NAS. Une reprise unique, par un script que vous lancez après le premier passage du job, coche « vérifié » pour « Fini » ; tout le reste est non vérifié.

### 7.3 Nouveaux épisodes

- **Chaque semaine**, le serveur du site relit sur TMDB les séries qu'il marque « en cours », sans lien avec le NAS, et ajoute leurs nouveaux épisodes et saisons. Le serveur ne lance rien à heure fixe : c'est un job d'`infra-ops`, `media-tmdb`, qui l'y invite par une route `/api/internal/…`, comme la console pour les emails. Il tourne le mercredi à 3 h, en même temps que `media-sync` (§8), dont il est indépendant (`media-sync` ne touche jamais au site), et il est suivi par healthchecks.io.
- **À la demande**, un bouton en haut du backlog, « Récupérer les nouveautés des séries », relit vos séries en cours et affiche un récapitulatif des séries qui ont du nouveau (saisons et épisodes ajoutés), enregistré sur « Valider ».

## 8. Le job hebdomadaire

`media-sync`, un job d'`infra-ops`, chaque **mercredi à 3 h** (`0 3 * * 3`), suivi par healthchecks.io comme les autres ([infra, §9](../infra/infra.md#9-alertes-healthchecksio)). La console le relance à la demande ; il dure quelques minutes (la lecture des trackers de 2 937 torrents prend environ une minute, le reste des appels quelques secondes).

1. **Démarrer Radarr et Sonarr** s'ils sont arrêtés (ce qui démarre aussi Prowlarr, dont ils dépendent), et **cross-seed**, puis lui faire lancer une recherche complète, sauf s'il en a déjà une en cours. Le job ne les arrête pas lui-même : cross-seed reste allumé tant que sa recherche dure, puis l'arrêt automatique éteint tout le monde, cross-seed d'abord, ceux dont il dépend ensuite ([todo, §4.1](../todo/todo.md#41-nas-et-matériel)).
2. **Torrents** :
   - lire la liste et le statut de chaque tracker ;
   - tester que chaque tracker répond, avant de conclure : un torrent dont le tracker ne répond pas est **inactif**, revu au passage suivant, pas mort ;
   - classer les autres en valides et morts (le tracker répond mais ne connaît plus le torrent) ;
   - poser l'étiquette `tracker-invalide` sur les morts, et la retirer de ceux qui sont revenus ;
   - ajouter les adresses de secours qui manquent, d'après `MEDIA_TRACKERS` (§6) : aucun tracker n'est nommé dans le code.
3. **Médias** : relier chaque film et chaque épisode présent sur le disque ou connu des outils, dans votre backlog ou non, à son fichier (Radarr, Sonarr), au disque (existence, inode, taille), à Jellyfin (élément et collection) et à ses torrents (par le lien physique entre le fichier de la bibliothèque et celui du torrent, ce qui couvre aussi les torrents de cross-seed). Relever aussi la qualité et la durée réelle du fichier (Radarr et Sonarr les lisent dans le fichier), et retirer « vérifié » des fichiers remplacés.
4. **Écarts** : les médias sur le disque sans aucun torrent, et les doublons (§5). Les médias oubliés, eux, se calculent dans l'instance locale, la seule à voir à la fois le NAS et le backlog (§5).
5. **Rapport dans la console**, un résumé comparé à la semaine précédente :
   - nombre de torrents, valides par tracker ;
   - morts, en deux groupes : terminés (tracker joint, torrent inconnu) et non terminés, avec pour ces derniers un bouton « Supprimer entièrement » (torrent et fichiers, après confirmation) ;
   - inactifs ;
   - nombre de médias sans torrent et en doublon ;
   - ce que cross-seed a ajouté dans la semaine (les torrents de l'étiquette `cross-seed` ajoutés depuis le passage précédent).

   Le détail par média (torrents, taille, qualité, poids par heure, partage, Jellyfin, doublon) n'est pas dans la console : il est dans le backlog en mode connecté, avec ses filtres (§5). La console ne garde que ce qui n'est pas un média du backlog : les torrents et leurs trackers.

## 9. Script d'essai

Avant toute interface, des scripts que je fournis (`scripts/mediaTrial/`, supprimés quand le job existe) et que vous lancez depuis votre PC, avec vos clés (lues dans votre `.env`) et votre courte liste. Ils appellent Radarr, Sonarr, Jellyfin et qBittorrent par le LAN, et lisent le disque dans une liste des fichiers (chemin, inode, taille) produite par une seule commande `find` sur le NAS, en lecture seule. Ils produisent un fichier Excel, une feuille par vérification, à écrire hors du dépôt. Vous le validez avant que le job et le tableau soient construits. Ils vérifient :

1. **TMDB** : sur une courte liste d'identifiants que vous choisissez (films, séries en cours et finies, sagas, épisodes spéciaux), tout ce que le cahier des charges en attend : titres français et original, langue, dates, durées, images, collections, saisons et épisodes, et la détection des séries « en cours » (§7.3).
2. **Le rapprochement de vos 44 séries** par titre et année, avec les cas douteux.
3. **Les étapes 3 et 4 du job** sur toute votre liste : une ligne par film et par épisode, avec ce qu'il a trouvé (Radarr ou Sonarr, fichier, inode, qualité, durée, Jellyfin, collection, torrents et leur état) et ce qu'il n'a pas su relier.
4. **Les médias oubliés et les doublons** : ce qui est sur le disque, dans les outils ou dans qBittorrent sans être dans votre liste.
5. **Les temps** : combien dure chaque étape, pour situer la durée du job.

## 10. Repris du backlog des jeux

À réutiliser tel quel, voir le [backlog des jeux](backlog_game.md) : tableau (lecture seule et mode édition, tri, filtres, URL, colonnes, pages, clavier), sous-lignes et agrégats, sagas et numéros (familles, trous, « Réorganiser »), recherche puis fiche puis ajout, partage entre base commune et base du compte, export et suppression des données d'un compte. Avec 1 808 films et des centaines d'épisodes, la virtualisation des lignes (ne construire dans la page que les lignes visibles à l'écran, pour que le défilement reste fluide), prévue « pour plus tard » côté jeux, devient nécessaire.

## 11. Questions ouvertes

Aucune pour l'instant.
