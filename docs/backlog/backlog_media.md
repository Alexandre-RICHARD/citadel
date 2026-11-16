# Backlog des médias

[Citadel](../../README.md) › Backlog des médias

Cahier des charges du suivi des films et des séries, à construire : rien n'existe encore dans le code. Il ne décrit que ce qui est nouveau ; tout ce qui reprend le [backlog des jeux](backlog_game.md) est seulement cité (§10). Les questions encore ouvertes sont au §11, et les tâches dans le [todo](../todo/todo.md#6-backlog).

**Maquettes** : des captures de la maquette Figma, gardées hors du dépôt car elles montrent des données réelles (`docs/backlog/maquettes/`, ignoré par git), montrent le tableau en mode connecté, les médias oubliés et le rapport de la console. Ce n'est qu'une aide visuelle, figée au 15 novembre 2026 : les décisions prises depuis ne s'y reportent plus, et ce document fait foi. Tout ce que le backlog des médias partage avec celui des jeux (barre du haut, tableau, cases, menus, filtres) reprend le style et le comportement de ce dernier, pas ceux de la maquette.

## Sommaire

1. [Principes](#1-principes)
2. [Mode classique et mode connecté](#2-mode-classique-et-mode-connecté)
3. [Sécurité et exposition](#3-sécurité-et-exposition)
4. [Notions et lignes](#4-notions-et-lignes)
5. [Colonnes](#5-colonnes)
6. [Où vivent les données](#6-où-vivent-les-données)
7. [Ajout et import](#7-ajout-et-import)
8. [Le job quotidien](#8-le-job-quotidien)
9. [Script d'essai](#9-script-dessai)
10. [Repris du backlog des jeux](#10-repris-du-backlog-des-jeux)
11. [Questions ouvertes](#11-questions-ouvertes)

## 1. Principes

- **Personnel, comme les jeux** : chaque compte a son backlog de films et de séries, sous la même route que les jeux (§2).
- **Tout s'ajoute à la main**, par une recherche TMDB (§7). Rien n'entre automatiquement depuis Radarr, Sonarr, Jellyfin ou qBittorrent ; le job quotidien signale seulement ce qui y est présent sans être dans le backlog (§8). Seule exception, un import de liste, qui est une fonction de l'interface (§7.2).
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
- **Routes** : chaque backlog a sa sous-route, `/backlog/games` pour les jeux et `/backlog/media` pour les films et séries, pour que leurs tris et leurs filtres ne se mélangent pas dans l'URL. `/backlog` mène aux jeux, en gardant ses paramètres, pour que les anciens liens marchent encore.
- **Barre du haut** : celle du backlog des jeux, avec un bouton pour passer des jeux aux films et séries ; en mode connecté, la date du relevé et un lien vers le rapport du job dans la console (§8). Ce lien reprend le nom d'hôte par lequel vous êtes venu (IP du NAS en LAN, nom Tailscale sinon), au port de la console : il marche dans les deux cas.
- **Comportement par colonne** :

| Colonne | Mode classique | Mode connecté |
| --- | --- | --- |
| Titres, langue, sortie, durée, miniature | TMDB, en lecture | Pareil |
| Saga et numéro | Choisis par vous | Pareil, avec la collection Jellyfin à côté |
| Visionnage, à regarder bientôt, en cours, commentaire | Saisis par vous | Pareil |
| Stockage, collection Jellyfin, partage, qualité, langues, taille, poids par heure, écarts | Absents | Relevés sur le NAS, en lecture |
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
    - **Arrêt** : après **environ 10 minutes sans aucune requête** : Caddy note la dernière visite, `infra-ops` vérifie chaque minute. Construit d'abord pour l'instance locale seule, avant elle, et prévu pour s'étendre aux autres services à la demande ([todo, §4.1](../todo/todo.md#41-nas-et-matériel)).
    - **Le front ne relit rien tout seul** (pas de rafraîchissement périodique) : sinon, un onglet oublié la tiendrait éveillée. « Partage en cours » se lit au chargement et à chaque action.
    - **Le job quotidien n'en a pas besoin** : il parle directement à qBittorrent, Radarr, Sonarr, Jellyfin et au disque, et n'écrit que dans `media-state`.
- **Organisation du code** : une seule image, un seul code.
  - Le module des médias du NAS est dans le serveur (`apps/server/src/projects/backlog/`), comme le reste du backlog. Ses routes ne sont **montées** que si `MEDIA_STATE_DIR` est posée au démarrage. Le serveur public n'a pas cette variable, et ces routes n'existent donc pas chez lui : 404, comme une adresse inconnue.
  - **Deux barrières de plus côté prod** : le conteneur public ne monte pas `media-state` (même activées par erreur, ces routes n'auraient rien à lire), et Caddy répond 404 à ces chemins sur le domaine public, comme il le fait déjà pour `/api/internal`.
  - **Le front est le même partout** : au chargement du backlog, il demande au serveur si le mode connecté est disponible. Le serveur public répond non, et le front reste en mode classique.
  - **Tests** : les tests d'intégration et `pnpm prod:local` utilisent un `media-state` fictif, versionné avec les tests, sans aucun vrai nom de fichier, de torrent ni de tracker. `prod:local` démarre aussi l'instance locale, pour tester le mode connecté sur votre PC. La pré-prod n'en a pas : elle ne sert qu'à répéter les migrations.
  - **Pourquoi pas le serveur public lui-même** : il ne peut pas savoir si une requête vient de chez vous. Tout passe par Cloudflare, qui donne l'IP de votre box en LAN (la même pour vos invités) et celle de votre opérateur mobile par Tailscale. Et une faille du serveur public, exposé à tout Internet, livrerait alors `media-state`. Séparé, le serveur public n'a simplement pas les données.
  - **Le code est public, l'accès non** : le dépôt montre qu'un mode connecté existe et comment il lit `media-state`, comme l'infra montre déjà qBittorrent et cross-seed. Il ne montre ni données, ni trackers, ni chemins réels, ni adresse : rien de tout cela n'est atteignable depuis Internet.
- **Connexion** : votre compte du site (une session propre à l'adresse locale, sans le préfixe `__Host-`, réservé au HTTPS), puis le **mot de passe des médias**, comme celui de la console : hash argon2id dans `MEDIA_PASSWORD_HASH`, cinq essais par adresse sur un quart d'heure, déverrouillage valable 12 heures. Il est gardé dans un cookie signé, qui survit aux mises en veille (sinon, il faudrait retaper le mot de passe à chaque réveil), et changer le mot de passe l'annule. **Seul votre compte** peut déverrouiller (`MEDIA_OWNER_USER_ID`) : qui apprendrait le mot de passe des médias devrait aussi avoir votre compte, avec sa double authentification. Un invité sur votre wifi qui trouve l'adresse ne voit qu'une page de connexion.
- **Jamais le mot de passe de la console** : un seul mot de passe pour les deux ouvrirait les déploiements et les restaurations à qui connaît celui des médias.
- **Le backlog ne fait que lire le NAS** : depuis le tableau, aucune action ne touche à Radarr, Sonarr, Jellyfin, qBittorrent ni aux fichiers (rien n'y est ajouté, modifié ni supprimé). Sa seule écriture côté NAS est la case « vérifié », dans `media-state`. Rien, pour l'instant, ne supprime un torrent ni un fichier : ni le backlog, ni la console, ni le job. Les liens « Ouvrir dans Jellyfin » et vers le rapport ne font qu'ouvrir une page.

## 4. Notions et lignes

- **Film** : une ligne. Les sous-lignes ne concernent que les séries.
- **Série** : une ligne, qui se déplie en une sous-ligne par saison, chacune se dépliant en une sous-ligne par épisode. Les colonnes du NAS s'agrègent vers le haut, comme celles des versions jouées : « Présent 18 / 26 » sur une saison, et le meilleur état de partage.
- **Dépliage** : une seule série et une seule saison dépliées à la fois ; en déplier une autre replie la précédente. Déplier une série d'une seule saison déplie aussi cette saison.
- **Saga** : le nouveau nom de la « série » des jeux, renommée aussi de leur côté. Elle peut mêler films et séries (*Star Wars*).
  - **Toutes les sagas sont à vous**, avec le nom de votre choix, celui de votre collection Jellyfin. Les collections de TMDB n'en sont que la proposition : vos groupes ne leur correspondent pas un à un (un groupe en réunit parfois plusieurs, des films sont groupés sans collection TMDB, d'autres sont dans une collection TMDB sans groupe).
  - **Une saga se relie à une ou plusieurs collections TMDB**, ce qui sert de nom technique : ajouter un film d'une collection reliée propose cette saga ; un film d'une collection reliée à aucune propose une nouvelle saga au nom de la collection.
  - **Numéro** : ni TMDB ni IMDB (qui n'a pas d'API publique) ne donnent d'ordre. Il est pré-rempli dans l'ordre des dates de sortie, puis se règle comme pour les jeux. Saga et numéro restent toujours modifiables.
- **Identifiants** : celui de TMDB (film ou série) relie tout : le site, le NAS et l'import. Celui d'IMDB est gardé pour référence.
  - **Sur le NAS, le fichier fait foi** : le job relie un média à son fichier par Radarr et Sonarr, puis ce fichier à Jellyfin et aux torrents par son chemin et son inode. Un fichier qu'aucun des deux ne suit (dans `movies_archives`, ou ajouté à la main) se relie par le nom de son dossier « Titre (année) ».
  - **Les identifiants que donnent les outils ne servent qu'à signaler un écart** : à l'essai, Jellyfin en donnait un faux, ou aucun, pour quelques dizaines de films, et Radarr un faux pour une dizaine de films de `movies_archives` (§5, écarts).

## 5. Colonnes

| Colonne | Source | Détail |
| --- | --- | --- |
| Miniature | TMDB | Affiche du film, de la série ou de la saison ; image de l'épisode, si TMDB en a une. Choisie parmi les images TMDB, comme pour les jeux |
| Titre, titre original | TMDB | Comme les jeux : le titre français dessus, un peu plus clair et plus épais, le titre original dessous quand il diffère |
| Type | TMDB | Film ou série, en icône ; son filtre permet de ne travailler que sur les films, ou que sur les séries |
| Langue originale | TMDB | |
| Saga | Vous, proposée par TMDB | En mode connecté, la collection Jellyfin s'affiche dessous et se signale quand son nom diffère de celui de la saga (§4) |
| Numéro | Vous | Dans sa propre colonne, comme pour les jeux, pour trier et filtrer dessus |
| Sortie | TMDB | Film : date de sortie ; série : première diffusion ; épisode : date de diffusion |
| Durée | TMDB, et le fichier en mode connecté | Film et épisode ; somme pour une saison et une série. En mode connecté, quand un fichier existe, sa durée réelle est dessus, en évidence, et celle de TMDB dessous, plus discrète ; la durée du fichier passe en alerte quand elle s'écarte de plus de 7 min 30 (version longue, autre montage). L'alerte s'efface quand le fichier est vérifié, les deux durées restent |
| En cours, commentaire | Vous | |
| Vu, À voir bientôt | Vous | Les deux dernières colonnes de la partie commune aux deux modes, des cases à en-tête en icône (libellé en infobulle). « À voir bientôt » reprend la colonne « À jouer bientôt » des jeux, case et mise en valeur bleue de la ligne comprises. Vu : film et épisode, vu ou pas vu, rien d'autre (ni abandonné, ni date) ; saison et série vues quand tous leurs épisodes le sont, sinon « 12 / 26 ». Règles ci-dessous |
| Vérifié | Vous, enregistré sur le NAS | La première colonne du NAS, juste après « Vu » et « À voir bientôt » : une case à en-tête en icône, comme elles. Vous avez lancé le fichier : bon contenu, bon format, bonne langue. **Retiré par le job quand le fichier est remplacé** (autre inode ou autre taille), par exemple quand Radarr en télécharge une meilleure version ; un simple renommage ne le retire pas. Il dit « ce fichier est bien celui que je voulais ici » : il efface les alertes qui viennent du fichier (durée), jamais les écarts des outils ni le partage, qui restent tant qu'ils sont vrais. Série : une case par épisode, cochée en cascade par saison ou par série, avec les dialogues du visionnage. Décochée et grisée tant que le média a plusieurs fichiers (écart « Doublon ») |
| Stockage | NAS | Non suivi (ni fichier, ni dans Radarr ou Sonarr) ; Attendu (dans Radarr ou Sonarr, sans fichier) ; En téléchargement (dans qBittorrent, pas fini) ; Présent (fini, pas dans Jellyfin) ; Dans Jellyfin, avec un lien vers l'élément. Il dit où est le fichier, pas qui le suit : un fichier dans Jellyfin que ni Radarr ni Sonarr ne suit est « Dans Jellyfin », avec l'écart « Hors Radarr ou Sonarr » |
| Collection Jellyfin | NAS | En lecture ; celle que vous avez créée dans Jellyfin |
| Partage | NAS | Partage en cours (envoie en ce moment, lu en direct) ; En seed (tracker OK) ; Tracker injoignable (inactif, revu au passage suivant) ; En erreur (torrent mort) ; Non présent (aucun torrent sur ce fichier) |
| Torrents | NAS | Nom du ou des torrents liés au fichier, cross-seed compris, avec leur tracker |
| Qualité | NAS | Quatre valeurs, d'après la meilleure des deux mesures de l'image, largeur ou hauteur : 4K (3840 ou 2160), FHD (1920 ou 1080), HD (1280 ou 720), SD (en dessous). Une seule mesure se trompe : un film en 1920×800 (bandes noires coupées) est FHD, un épisode en 1440×1080 (4:3) aussi |
| Langues | NAS | Quatre étiquettes au plus : VF (une piste audio en français), VO (une piste audio dans la langue originale du média, celle de TMDB), STFR (des sous-titres français), STVO (des sous-titres dans la langue originale). Quand la langue originale est le français, VO et STVO ne s'affichent pas : VF et STFR disent déjà tout. Quand aucune piste audio n'a de langue connue (pistes non étiquetées, « und »), la cellule affiche « Inconnue », aussi valeur du filtre, pour ne pas la confondre avec un fichier sans VF (quelques films à l'essai). Pistes audio et sous-titres intégrés lus par Radarr et Sonarr, sous-titres à côté du fichier (Bazarr) lus par Jellyfin. Saison et série : chaque étiquette avec le nombre d'épisodes qui l'ont (« VF 18 / 26 »), sans nombre quand tous l'ont. **Filtre** : une valeur par étiquette, plusieurs à la fois en ET ou en OU, comme les autres filtres ; on filtre ainsi sur l'audio, sur les sous-titres ou sur les deux (« VO ET STFR ») |
| Taille | NAS | Taille du fichier ; somme pour une saison et une série |
| Go/h | NAS | Taille divisée par la durée réelle du fichier : deux films d'1 h 30, l'un de 2 Go et l'autre de 6 Go, s'y distinguent. Colonne étroite, juste après « Taille », triable et filtrable à part, comme les temps relevé, estimé et total des jeux |
| Écarts | NAS | Ce que le job a trouvé de faux au dernier passage, un filtre par écart, plusieurs par ligne s'il le faut (la ligne s'allonge d'autant) : doublon (plusieurs fichiers distincts, d'inodes différents, pour ce film ou cet épisode ; plusieurs torrents sur un même fichier, par cross-seed, n'en sont pas) ; fiche Radarr ou Sonarr différente (l'outil relie le fichier à un autre identifiant TMDB que le vôtre) ; fiche Jellyfin différente ou absente ; hors Radarr ou Sonarr (le fichier existe, aucun outil ne le suit) ; identifiant TMDB disparu. Un identifiant cité dans un écart est un lien vers sa fiche TMDB. Chacun reste affiché tant qu'il est vrai, fichier vérifié ou non |
| Identifiant TMDB | TMDB | Celui que vous avez enregistré, en lien vers la fiche TMDB. Masqué par défaut, il s'affiche par « Colonnes » |
| Actions | | Comme pour les jeux : trois points en fin de ligne, ou clic droit sur la ligne. Ouvrir sur TMDB, Ouvrir dans Jellyfin (mode connecté, quand le média y est), Personnaliser, Retirer du backlog |

**Ordre** : les colonnes communes aux deux modes finissent par « Vu » et « À voir bientôt » ; les colonnes du NAS commencent par « Vérifié ». En mode classique, le tableau s'arrête donc à « À voir bientôt » (« Actions » restant en fin de ligne).

**Ouvrir dans Jellyfin** : la page de l'élément dans l'interface web de Jellyfin, d'où « Lire » démarre la lecture. Jellyfin n'a pas d'adresse qui lance directement la lecture. L'adresse reprend le nom d'hôte par lequel vous êtes venu (IP du NAS en LAN, nom Tailscale sinon), au port de Jellyfin.

**Filtres** : un par colonne, avec les outils des jeux (ET / OU, réinitialisation, récapitulatif en haut du tableau). Ceux des colonnes du NAS n'existent qu'en mode connecté.

**Visionnage d'une série** : chaque épisode a sa case. Toute action qui touche plus d'un épisode passe par un dialogue de confirmation, comme ceux qui existent déjà :

- cocher une série ou une saison coche tous ses épisodes (et toutes ses saisons) ; la décocher les décoche tous ;
- cocher un épisode dont des précédents ne sont pas vus propose de les cocher aussi ;
- décocher un épisode dont des suivants sont vus propose de les décocher aussi.

Un nouvel épisode ajouté par TMDB (§7.3) n'est pas vu : une série vue en entier repasse à « 26 / 27 ».

- **Épisodes pas encore diffusés** (date future ou inconnue) : affichés, mais hors de la progression : ils ne comptent pas dans « 12 / 26 », et cocher une série ou une saison ne les coche pas.
- **Épisodes spéciaux** (bonus, téléfilms, épisodes de Noël) : tous ceux que TMDB connaît, rangés dans une saison « Épisodes spéciaux » à part, hors des saisons principales, des cascades et de la progression de la série. Leurs colonnes du NAS restent vides, seule la partie commune aux deux modes est remplie : Sonarr les numérote comme TVDB, autrement que TMDB (à l'essai, presque tous les épisodes non retrouvés étaient des spéciaux).

**Médias oubliés** : en mode connecté, une liste au-dessus du tableau donne ce qui est sur le disque, dans Radarr, Sonarr, Jellyfin ou qBittorrent sans être dans votre backlog, avec un bouton qui ouvre sa fiche TMDB pour l'ajouter. Ceux qu'aucun outil ne relie à TMDB sont listés par leur chemin.

- **Une ligne par média**, avec les endroits où il est : « Une série : Sonarr · disque 24 fichiers, 30 Go · Jellyfin · 4 torrents ». À l'essai, plusieurs centaines de lignes par outil se réduisaient ainsi à une vingtaine de médias.
- **Un fichier relié à une ligne du backlog n'est jamais oublié**, même quand un outil lui donne un autre identifiant : c'est un écart de ce média (§5), pas un oubli.
- Les torrents dont les fichiers ne sont que dans `torrents/` n'en sont pas : ils vont au rapport de la console (§8).

## 6. Où vivent les données

**Base du site**, avec le même partage que les jeux (§10) :

- **communes** : films, séries, saisons, épisodes et collections de TMDB, avec leurs identifiants et ceux de leurs images. Un média ajouté par un compte est proposé aux autres, sans rien de personnel ;
- **par compte** : le média dans le backlog (miniature choisie, saga et numéro, à regarder bientôt, en cours, commentaire), le visionnage (vu de chaque film et de chaque épisode) et les sagas, avec les collections TMDB qui leur sont reliées (§4). Contrairement aux jeux, aucune saga n'est commune.

**NAS** (`/Volume1/appdata/media-state`, écrit par `infra-ops` et, pour « vérifié », par l'instance locale) : sauvegardé chaque lundi avec le reste d'`appdata`, sur le HDD et chiffré sur le Drive ([infra, §7.1](../infra/infra.md#71-ce-qui-est-sauvegardé)). Il contient :

- le dernier relevé du job, par identifiant TMDB et par épisode : stockage, chemin, empreinte du fichier (inode et taille), qualité, durée et langues, élément et collection Jellyfin, torrents liés et leur état, écarts ;
- les cases « vérifié », chacune avec l'empreinte du fichier au moment de la vérification ;
- le relevé du passage précédent, pour la comparaison, et rien de plus ancien.

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
- `MEDIA_TRACKERS` : chaque tracker, son nom affiché dans le rapport et ses adresses d'annonce, telles que dans qBittorrent (deux pour un tracker qui a une adresse de secours), pour regrouper les adresses d'un même tracker (§8). Un JSON sur une ligne : `[{"name":"…","urls":["…","…"]}]`. Le job n'en compare que le nom d'hôte : la clé personnelle que contient l'adresse n'est jamais écrite ailleurs ;
- `MEDIA_PASSWORD_HASH`, `MEDIA_OWNER_USER_ID` et `MEDIA_STATE_DIR`, sur l'instance locale seulement (§3).

**TMDB** : la clé d'API (`TMDB_API_KEY`) reste sur le serveur du site. Les images se chargent depuis `image.tmdb.org`, directement par le navigateur, comme celles d'IGDB.

## 7. Ajout et import

### 7.1 Ajout

Comme pour les jeux : recherche TMDB (films et séries ensemble) dans la barre du haut, fiche en lecture seule, puis ajout au backlog avec miniature, saga et numéro. Une série entre avec toutes ses saisons et tous ses épisodes connus de TMDB, sans choix possible (contrairement aux DLC des jeux) : la fiche les affiche, pour confirmer que c'est la bonne série.

### 7.2 Import de liste

- **Une fonction de l'interface**, pour tout compte : un fichier CSV de deux colonnes, l'identifiant TMDB et le type (film ou série), rien d'autre. Chaque média entre avec les valeurs par défaut : la première image de TMDB comme miniature, sans saga, rien de vu, ni à regarder bientôt, ni en cours, ni commentaire. Tout se règle ensuite à la main.
- **Aperçu avant tout enregistrement** : une ligne par média reconnu, et la liste de ceux qui ne le sont pas, avec la raison. Rien n'est écrit avant « Valider ».
- **Rythme des appels TMDB** : un import de plusieurs milliers de films demande autant de fiches. Le serveur les lit à un rythme limité, nettement sous la limite de TMDB (de l'ordre de 50 requêtes par seconde), attend quand TMDB répond 429, et ne relit pas une fiche déjà en base. Les films partagés entre comptes (§6) ne sont donc lus qu'une fois.
- **Premier usage, votre liste** : les identifiants TMDB de vos films et de vos séries, sans rien d'autre. Sagas, visionnage et « vérifié » se reprennent ensuite à la main : aucune reprise automatique.

### 7.3 Nouveaux épisodes

- **Chaque nuit**, le serveur du site relit sur TMDB les séries qu'il marque « en cours », sans lien avec le NAS, et ajoute leurs nouveaux épisodes et saisons. Le serveur ne lance rien à heure fixe : c'est un job d'`infra-ops`, `media-tmdb`, qui l'y invite par une route `/api/internal/…`, comme la console pour les emails. Il tourne chaque nuit à 3 h, en même temps que `media-sync` (§8), dont il est indépendant (`media-sync` ne touche jamais au site), et il est suivi par healthchecks.io.
- **À la demande**, un bouton en haut du backlog, « Récupérer les nouveautés des séries », relit vos séries en cours et affiche un récapitulatif des séries qui ont du nouveau (saisons et épisodes ajoutés), enregistré sur « Valider ».

## 8. Le job quotidien

`media-sync`, un job d'`infra-ops`, chaque **nuit à 3 h** (`0 3 * * *`) : il ne fait presque aucun appel à TMDB, rien n'empêche de le lancer tous les jours, suivi par healthchecks.io comme les autres ([infra, §9](../infra/infra.md#9-alertes-healthchecksio)). La console le relance à la demande. Le relevé lui-même dure moins d'une minute (à l'essai, pour une collection de plusieurs milliers de films et de torrents) ; c'est l'attente de cross-seed (étape 1) qui fait la durée du job, et le délai de healthchecks.io doit la couvrir.

**Où il tourne** : `infra-ops`, qui n'a que bash, fait l'étape 1 (démarrer les services). Les étapes suivantes sont un second point d'entrée de l'image du serveur, comme la commande d'après restauration, lancé en conteneur ponctuel : `/Volume2/data` en lecture seule, `media-state` en écriture, aucun accès à la base. Le relevé va dans `media-state`, le rapport dans `state/`, que la console lit déjà : la console ne monte pas `media-state`. Les formats de ces deux fichiers sont dans les specs, partagés par le job, l'instance locale et la console.

1. **Démarrer Radarr, Sonarr et Bazarr** s'ils sont arrêtés (ce qui démarre aussi Prowlarr, dont ils dépendent), et **cross-seed**, puis lui faire lancer une recherche complète, sauf s'il en a déjà une en cours. Cette recherche reste hebdomadaire (la nuit du mardi au mercredi) : chaque nuit, elle solliciterait trop les trackers ; les autres nuits, le job passe directement à l'étape 2. **Le job attend la fin de cette recherche** avant l'étape 2, pour que le relevé compte les torrents qu'elle vient d'ajouter ; comment savoir qu'elle est finie (API de cross-seed, sinon ses journaux) est à établir en construisant le job. Le job n'arrête aucun service lui-même : l'arrêt automatique éteint tout le monde, cross-seed d'abord, ceux dont il dépend ensuite ([todo, §4.1](../todo/todo.md#41-nas-et-matériel)).
2. **Torrents** :
   - lire la liste et le statut de chaque tracker ;
   - tester que chaque tracker répond, avant de conclure : un torrent dont le tracker ne répond pas est **inactif**, revu au passage suivant, pas mort. Un tracker répond quand au moins une de ses adresses fonctionne sur au moins un torrent, d'après le statut que donne qBittorrent : le job n'appelle jamais un tracker lui-même ;
   - classer les autres en valides et morts (le tracker répond mais ne connaît plus le torrent) ; l'état d'un torrent est le meilleur de ses adresses : qu'une adresse refuse (« Forbidden ») quand une autre accepte n'est pas une erreur, c'est le tracker qui refuse une annonce en double ;
   - poser l'étiquette `tracker-invalide` sur les morts, et la retirer de ceux qui sont revenus : c'est la seule écriture du job dans qBittorrent. Aucun tracker n'est nommé dans le code.
3. **Médias** : relier chaque film et chaque épisode présent sur le disque ou connu des outils, dans votre backlog ou non, à son fichier (Radarr, Sonarr), au disque (existence, inode, taille), à Jellyfin (élément et collection) et à ses torrents (par le lien physique entre le fichier de la bibliothèque et celui du torrent, ce qui couvre aussi les torrents de cross-seed). Relever aussi la qualité, la durée réelle et les langues du fichier (Radarr et Sonarr les lisent dans le fichier), et retirer « vérifié » des fichiers remplacés.
4. **Écarts** : les médias sur le disque sans aucun torrent, les doublons et les écarts des outils (§5) ; les torrents sans média (fichiers seulement dans `torrents/`, de la place perdue) et les torrents jamais téléchargés (à 0 %). Les médias oubliés, eux, se calculent dans l'instance locale, la seule à voir à la fois le NAS et le backlog (§5).
5. **Rapport dans la console**, sur une page à part : la page principale de la console n'en montre que les chiffres, avec un lien vers le rapport, et le rapport a un lien de retour. Un résumé comparé au passage précédent :
   - nombre de torrents, valides par tracker ;
   - morts, en deux groupes : terminés (tracker joint, torrent inconnu) et non terminés ;
   - trackers entièrement injoignables (aucune de leurs adresses ne répond) et leurs torrents inactifs : c'est la seule erreur de tracker signalée ;
   - torrents sans média, avec leur taille, et torrents jamais téléchargés ;
   - doublons, chacun avec ses fichiers (chemin, qualité, taille) ;
   - nombre de médias sans torrent ;
   - ce que cross-seed a ajouté (les torrents de l'étiquette `cross-seed` ajoutés depuis le passage précédent).

   Le rapport ne fait qu'informer : aucun bouton n'y supprime de torrent ni de fichier, cela se fait dans qBittorrent ou sur le disque.

   Le détail par média (torrents, taille, qualité, poids par heure, partage, Jellyfin, écarts) n'est pas dans la console : il est dans le backlog en mode connecté, avec ses filtres (§5). La console ne garde que ce qui n'est pas un média du backlog : les torrents et leurs trackers.

## 9. Script d'essai

Avant toute interface, des scripts que je fournis (`scripts/mediaTrial/`, supprimés quand le job existe) et que vous lancez depuis votre PC, avec vos clés (lues dans votre `.env`) et votre courte liste. Ils appellent Radarr, Sonarr, Jellyfin et qBittorrent par le LAN, et lisent le disque dans une liste des fichiers (chemin, inode, taille) produite par une seule commande `find` sur le NAS, en lecture seule. Ils produisent un fichier Excel, une feuille par vérification, à écrire hors du dépôt. Vous le validez avant que le job et le tableau soient construits. Ils vérifient :

1. **TMDB** : sur une courte liste d'identifiants que vous choisissez (films, séries en cours et finies, sagas, épisodes spéciaux), tout ce que le cahier des charges en attend : titres français et original, langue, dates, durées, images, collections, saisons et épisodes, et la détection des séries « en cours » (§7.3).
2. **Le rapprochement de vos séries** par titre et année, avec les cas douteux.
3. **Les étapes 3 et 4 du job** sur toute votre liste : une ligne par film et par épisode, avec ce qu'il a trouvé (Radarr ou Sonarr, stockage, fichier, inode, qualité, durée, langues audio, Jellyfin, collection, torrents et leur état, écarts), ce qu'il n'a pas su relier, et les paliers des trackers de chaque torrent.
4. **Les médias oubliés, une ligne par média, les torrents sans média et les doublons** : ce qui est sur le disque, dans les outils ou dans qBittorrent sans être dans votre liste.
5. **Les temps** : combien dure chaque étape, pour situer la durée du job.

**Lancement** : `pnpm tools mediaTrial --short <liste.txt> --list <export.xlsx> --files <fichiers.tsv>` ; l'en-tête de `scripts/mediaTrial.sh` détaille les options.

- **Entrées** : la liste courte (une ligne `film 603` ou `série 1396`, modèle dans `scripts/mediaTrial/shortList.example.txt`), votre liste exportée en `.xlsx`, et la liste des fichiers, écrite directement sur le PC par `ssh nas "find /Volume2/data -type f -printf '%i\t%s\t%n\t%p\n'" > <dossier>/media-files.tsv`. Sans `--files`, seules les vérifications 1 et 2 tournent.
- **Clés** : `TMDB_API_KEY`, `RADARR_API_KEY`, `SONARR_API_KEY`, `JELLYFIN_API_KEY`, `QBITTORRENT_USER` et `QBITTORRENT_PASSWORD`, dans le `.env` du PC. Radarr et Sonarr se démarrent depuis la console avant le lancement.
- **Colonnes de l'export** : reconnues par leur titre (« TMDB », « IMDB », « Groupe », « Collection », « État », « Titre », « Année ») ; la feuille « 0 Colonnes lues » du rapport dit lesquelles ont été prises.
- **Rapport** : par défaut `Téléchargements/media-trial-<date>.xlsx`, refusé dans le dépôt. Des trackers, il ne garde que le nom d'hôte, jamais l'adresse complète, qui contient la clé personnelle.
- **Lecture seule partout** : aucune étiquette ni aucun tracker n'est posé dans qBittorrent, rien n'est modifié dans les outils.

## 10. Repris du backlog des jeux

À réutiliser tel quel, voir le [backlog des jeux](backlog_game.md) : tableau (lecture seule et mode édition, tri, filtres, URL, colonnes, pages, clavier), sous-lignes et agrégats, sagas et numéros (familles, trous, « Réorganiser »), recherche puis fiche puis ajout, partage entre base commune et base du compte, export et suppression des données d'un compte. Avec plusieurs milliers de films et des centaines d'épisodes, la virtualisation des lignes (ne construire dans la page que les lignes visibles à l'écran, pour que le défilement reste fluide) reste pour plus tard, comme côté jeux ([todo, §6.4](../todo/todo.md#64-pour-plus-tard)).

## 11. Questions ouvertes

Aucune pour l'instant.
