# Backlog

[Citadel](../../README.md) › Backlog

Suivi de mes jeux vidéo, sur la route `/backlog`, réservé aux comptes connectés. On cherche un jeu sur IGDB, on l'enregistre avec les versions et DLC voulus, puis on l'ajoute au backlog sur une plateforme : statut, temps, note, DLC faits… se suivent dans un tableau triable et filtrable. Il remplace un Google Sheet devenu difficile à tenir à jour. Ce qui reste à faire est dans le [todo](../todo/todo.md#6-backlog), les demandes en cours dans les [problèmes connus](../problems/problems.md).

## Sommaire

1. [Notions](#1-notions)
2. [Types de fin et statuts](#2-types-de-fin-et-statuts)
3. [Le tableau](#3-le-tableau)
4. [Ajouter et gérer les jeux](#4-ajouter-et-gérer-les-jeux)
5. [Séries et numéros](#5-séries-et-numéros)
6. [Données IGDB](#6-données-igdb)
7. [Plateformes et icônes](#7-plateformes-et-icônes)
8. [Base, endpoints et code](#8-base-endpoints-et-code)
9. [Lancer](#9-lancer)

## 1. Notions

Une ligne du tableau est un **jeu du backlog**. Les données de jeu sont portées par ses **versions jouées**, uniques par jeu + version + plateforme ; la ligne du jeu n'en affiche que des agrégats.

| Notion | Définition | Exemples |
| --- | --- | --- |
| Jeu | L'œuvre, en base commune. Un remake est un jeu distinct | *Skyrim* ; *FF7* et *FF7 Remake* sont deux jeux |
| Jeu du backlog | Un jeu dans le backlog d'un compte, une ligne du tableau. Il porte la personnalisation : miniature, type de fin, série et numéro. Il n'existe qu'avec au moins une version jouée | *Skyrim*, en Histoire, série *The Elder Scrolls* n° 5 |
| Version | Une déclinaison qu'IGDB rattache au jeu : portage, remaster, réédition, *GOTY*, *Director's Cut*… | *Skyrim* et *Skyrim Legendary Edition* |
| Version jouée | Une version sur une plateforme, dans le backlog. Elle porte les données de jeu : statut, temps, possession, dates, note, DLC faits… | *Skyrim* sur PS3 ; *Skyrim Legendary* sur PS4 et sur PC = 3 versions jouées |
| Plateforme | Une plateforme IGDB, ou une sous-plateforme : émulateur rattaché à sa console, launcher rattaché au PC (§7) | PS4, PC, *PCSX2* (PS2), *Steam* (PC) |
| DLC | Contenu additionnel rattaché au jeu, pas à une version. Il se coche « fait » sur une version jouée | *Dawnguard* pour *Skyrim* |
| Extension standalone | Un jeu à part entière. IGDB en classe certaines en DLC : elles s'ajoutent alors « comme jeu » (§4) | *TLAD*, *TBOGT* (extensions de *GTA IV* sur IGDB) |
| Série | Facultative. Proposée par IGDB et choisie pour chaque jeu du backlog : la proposée, une autre, une série créée à la main ou aucune (§5) | *Grand Theft Auto* ; *Souls*, créée à la main pour *Dark Souls*, *Sekiro* et *Elden Ring* |

**Règles** :

- **Classement IGDB** : pas de règle maison. Ce qu'IGDB rattache à un jeu comme version, remaster, portage ou version enrichie est une version de ce jeu ; ce qu'il classe comme remake est un jeu distinct.
- **Une version, une fiche** : en base, chaque version est stockée une seule fois, avec ses plateformes et ses dates de sortie. La plateforme n'intervient que dans la version jouée.
- **Pas de doublon** : un jeu, une version ou un DLC n'existe qu'une fois en base. Exception voulue : une même fiche IGDB peut être à la fois DLC d'un jeu et jeu à part.
- **Retirer la dernière version jouée** retire le jeu du backlog, avec sa personnalisation. Le jeu reste en base ; y revenir repart de la personnalisation par défaut.
- **Valeurs calculées jamais stockées** : tout ce qu'affiche la ligne du jeu (meilleur statut, sommes, dates, « faits / total » des DLC) et le temps total. Le serveur s'en sert pour trier et filtrer, le front pour afficher, avec les mêmes fonctions (`helper/` des specs).

## 2. Types de fin et statuts

Le type de fin, facultatif, choisi à l'ajout du jeu au backlog, dit ce que « finir » veut dire. Il est personnel : un joueur peut avoir *BF6* en Multijoueur, un autre en Histoire. Le statut, renseigné sur chaque version jouée, dit jusqu'où je suis allé ; la ligne du jeu affiche le meilleur.

| Type de fin | Ce que « fini » veut dire | Exemples |
| --- | --- | --- |
| Histoire | Une fin scénarisée : générique vu | *GTA V*, *The Last of Us*, *FF7* |
| Runs | Des parties recommencées ; fini = première victoire ou fin principale | *The Binding of Isaac*, *Hades*, *Dead Cells* |
| Bac à sable | Pas de fin imposée ; fini quand on estime en avoir fait le tour | *Minecraft*, *Satisfactory*, *Les Sims* |
| Multijoueur | En ligne ou compétitif, sans fin | *Rocket League*, *League of Legends* |
| Aucun (par défaut) | Pas de type de fin : aucun statut de fin possible | |

Les statuts sont gradés du rang 1 au rang 8 ; « Abandonné » est hors échelle. « Pas commencé » est la valeur par défaut, et les statuts proposés dépendent du type de fin (le statut actuel reste toujours listé). Les statuts de fin sont Vu sans jouer, Fini, Estimé fini, Complété, Platiné et Complété et Platiné : sans type de fin, ils restent dans la liste, grisés (« type de fin requis »).

| Rang | Statut | Signification | Histoire | Runs, Bac à sable, Multijoueur |
| --- | --- | --- | --- | --- |
| 1 | Pas commencé | Dans le backlog, jamais lancé | ✓ | ✓ |
| 2 | Vu sans jouer | « Je l'ai fait avec des amis » | ✓ |  |
| 3 | Démarré | Lancé, quelques heures de jeu | ✓ | ✓ |
| 4 | Bien entamé | Bonne progression, pas encore fini | ✓ | ✓ |
| 5 | Fini | Fin principale atteinte | ✓ |  |
| 5 | Estimé fini | Pas de fin officielle, mais considéré comme fini |  | ✓ |
| 6 | Complété (100 %) | Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires | ✓ | ✓ |
| 7 | Platiné | Fini, et tous les succès ou trophées obtenus | ✓ | ✓ |
| 8 | Complété et Platiné | Les deux | ✓ | ✓ |
| – | Abandonné | Arrêté sans intention d'y revenir | ✓ | ✓ |

- **Passer à un statut de fin** (Vu sans jouer compris) fait passer « fois fini (sûr) » de 0 à 1 (sauf si la même saisie fixe ce compteur) et, sans date de fin, propose de la renseigner (« Quand l'as-tu fini pour la première fois ? », pré-remplie à aujourd'hui ; « Plus tard » n'en met aucune). Pareil à l'ajout d'une version jouée. Quitter les statuts de fin n'efface ni la date ni le compteur.
- **Changer de type de fin** (« Personnaliser », ou en mode édition directement dans la cellule du tableau) convertit les statuts devenus impossibles : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé ; l'avertissement n'apparaît que si un statut est converti. Le type de fin se change mais ne se retire pas tant qu'une version jouée a un statut de fin.
- **Jeux finis** (récap) : un jeu est fini dès qu'une de ses versions jouées a un statut de fin, Vu sans jouer compris.
- **Statut de la ligne d'un jeu à plusieurs versions jouées** : les « Pas commencé » sont ignorés tant qu'une autre version a un statut. Puis : au moins un rang 5 ou plus → le plus haut ; toutes « Abandonné » → Abandonné ; « Abandonné » mêlé à un statut en cours → vide, impossible de choisir ; sinon le plus haut.

## 3. Le tableau

### 3.1 Lignes

- **Une seule version jouée** : ligne simple, qui affiche cette version (titre et plateforme) et dont les données se modifient sur la ligne.
- **Plusieurs versions jouées** : la ligne affiche le jeu original et les agrégats ; un chevron (et le nombre de versions) la déplie en une sous-ligne par version jouée, où se modifient ses données. → déplie, ← replie.
- **Agrégats** : statut (§2), « En cours », « À jouer bientôt » et « Possédé » si l'une des versions l'est (la ligne est mise en valeur : jaune pour « En cours », bleu pour « À jouer bientôt », le jaune l'emporte si les deux sont cochées), date de fin la plus ancienne (la première fin), fois fini en somme (`2 (+1 ?)` : sûr et probable), temps en somme, note la plus haute, commentaire seulement s'il n'y en a qu'un. DLC : « faits / total », un DLC comptant comme fait s'il l'est sur au moins une version.
- **Colonnes** (22) : miniature, nom (français, original dessous), série et numéro, développeur et éditeur (logo au-dessus du nom), sortie (date, « à venir » ou « annulé »), type de fin, plateforme, statut, en cours, à jouer bientôt, possédé, date de fin, fois fini, DLC, temps relevé, estimé et total, note, commentaire, actions. Les en-têtes larges deviennent un mot court ou une icône, libellé complet en infobulle ; Type de fin et Statut ont une bulle « Signification ».
- **Formats** : temps stockés en minutes, saisis en heures et minutes, affichés « 12 h 30 » ; note entière de 0 à 20, colorée selon la valeur ; zéros par défaut estompés pour laisser ressortir les valeurs saisies.

### 3.2 Lecture seule et mode édition

- Lecture seule par défaut. L'interrupteur « Édition » rend les cellules modifiables ; retour automatique en lecture seule après 1 minute sans activité, sauf cellule en cours d'édition ou modale ouverte.
- Un champ s'enregistre quand on le quitte, ou avec Entrée ; une valeur refusée remet l'ancienne. Cases et listes s'enregistrent tout de suite.
- Menu des actions (trois points en fin de ligne, ou clic droit sur la ligne) : Personnaliser, Réorganiser la série, Modifier le jeu, Ajouter une version jouée, Ouvrir sur IGDB, Retirer le jeu du backlog ; sur une sous-ligne : Ouvrir la version sur IGDB, Retirer la version jouée. Seul « Ouvrir sur IGDB » reste actif en lecture seule.
- DLC : un clic sur « faits / total » ouvre la liste (popover), en lecture ou à cocher en édition, avec « Rechercher d'autres DLC ». Ce choix évite un troisième niveau de dépliage.

### 3.3 Tri, filtres, pages

- **Tri** multi-colonnes : un clic croissant, puis décroissant, puis plus de tri ; numéro de priorité et flèche sur chaque en-tête. Textes sans accents ni majuscules, nombres dans l'ordre (« FF2 » avant « FF10 »), statuts dans l'ordre de l'échelle, cases vides en dernier. Sans tri, le jeu dont une donnée personnelle (jeu au backlog ou version jouée) a été créée ou modifiée en dernier passe en premier.
- **Filtres**, un par colonne, cumulés (ET) ou, au choix, une ligne n'en passe qu'un (OU : le choix ET / OU apparaît dès deux filtres et vit dans l'URL, `?filterMode=or`) : « contient » pour les textes, valeur exacte après un clic sur une série, liste pour type de fin, statut et plateforme, oui / non pour les cases, plage pour les nombres, temps et dates. Un jeu reste affiché si sa ligne, ou une de ses versions jouées, correspond.
- Tri et filtres vivent dans l'URL (`?sort=name:asc,status:desc&name=final`) : rechargement, retour arrière, lien copié. Une valeur illisible est ignorée.
- **Colonnes** : affichage et ordre réglables (« Colonnes »), gardés dans le `localStorage` ; « Actions » toujours visible ; une colonne masquée sort du tri et des filtres.
- **Pages** : le serveur trie et filtre tout le backlog, puis le découpe en pages de 25, chargées à l'approche du bas. Pendant une nouvelle lecture, les lignes précédentes restent affichées, estompées.

### 3.4 Clavier

« / » met le curseur dans la recherche ; ↓ ↑ Entrée parcourent et choisissent les résultats ; ↓ ↑ passent de ligne en ligne dans le tableau, Entrée déplie, Suppr retire ; le menu des actions s'ouvre avec ↓ ; Alt+↓ ouvre le calendrier d'un champ date. Les modales gardent le focus, ferment avec Échap et le rendent à l'élément d'origine.

## 4. Ajouter et gérer les jeux

Rien n'est enregistré avant « Valider ». Un ajout standard : un résultat de recherche, « Valider », puis, dans l'ajout au backlog qui s'ouvre, type de fin, miniature, plateforme, et « Valider ».

### 4.1 Depuis IGDB

1. **Recherche** (barre du haut, 300 ms après la dernière frappe) : `<nom français> <nom original> (année)`, image, 3 plateformes puis « +n ». Chaque fiche trouvée mène à son jeu de base, seul proposé :
   - une version (édition, remaster, portage, bundle rattaché par `version_parent`) mène au jeu original : *Skyrim Special Edition* trouve *Skyrim* ;
   - un DLC, une extension, un pack, une mise à jour ou un épisode mène au jeu auquel IGDB le rattache : *Dawnguard* trouve *Skyrim* ;
   - un autre bundle mène à chacun des jeux qu'il contient : *Mass Effect Trilogy* donne les trois *Mass Effect* ;
   - les remakes et extensions standalone restent des jeux à part ; mods et forks sont exclus.

   Un jeu n'apparaît qu'une fois ; ceux trouvés seulement via un bundle passent en dernier, avec « via … » sous leur nom. Les badges « Déjà en base » et « Dans le backlog » signalent l'existant ; un résultat déjà en base mène directement à l'ajout au backlog.
2. **Fiche** (« Ajouter un jeu ») : en lecture seule, ce qui sera stocké. Les données IGDB ne se modifient jamais ; les choix personnels se font à l'ajout au backlog.
3. **Versions** : toutes celles qu'IGDB rattache au jeu sont proposées, seules les cochées sont enregistrées (inutile de stocker des éditions jamais jouées). La version originale est cochée d'office et verrouillée : elle porte l'id et la page IGDB du jeu.
4. **DLC** : seuls les DLC et extensions comptent (ni packs ni mises à jour), réunis depuis l'original et toutes ses versions. Tous proposés, seuls les cochés sont enregistrés : une petite quête gratuite peut être un vrai DLC pour l'un et du bruit pour l'autre, et le type IGDB ne permet pas de trier. Les DLC en base fixent le « total » de « faits / total ».
5. **« Comme jeu »** : IGDB ne distingue pas une extension vendue seule d'une autre (*TLAD* et *TBOGT* y sont des extensions de *GTA IV*, comme les season pass). Chaque DLC peut donc aussi être coché « Comme jeu » : après « Valider », son propre ajout s'ouvre à son tour. Les deux cases sont indépendantes.
6. **« Ajouter à mon backlog »**, cochée par défaut : « Valider » enregistre le jeu puis ouvre l'ajout au backlog. Annuler ce dernier laisse le jeu en base, hors du backlog.

### 4.2 Depuis la base

« Ajouter un jeu depuis la Citadel » liste, sans requête IGDB, les jeux en base hors du backlog (par 50, filtrables par nom ou titre de version, sans accents ni majuscules). Seules les images sont relues sur IGDB, pour la miniature. Un jeu qu'aucun backlog ne contient peut y être supprimé de la base.

### 4.3 Ajout au backlog et versions jouées

- **Ajouter au backlog** : personnalisation (miniature parmi la cover et les artworks, type de fin, série et numéro) et première version jouée, en une seule action. La version jouée se choisit par sa version puis sa plateforme : celles où la version est sortie, puis leurs sous-plateformes ; un couple déjà joué est grisé. Toutes ses données peuvent être pré-remplies.
- **Ajouter une version jouée** : la même fenêtre, sans la personnalisation. « Valider et en ajouter une autre » enchaîne sans limite sur un formulaire neuf ; les DLC choisis pour être ajoutés comme jeux ne viennent qu'ensuite, et fermer ou annuler une version ne les annule pas.
- **Personnaliser** : changer miniature, type de fin (§2), série et numéro. « Valider » reste inactif tant que rien n'a changé, comme dans tout formulaire d'édition.
- **Modifier le jeu** : la fiche relue sur IGDB, pour ajouter les versions et DLC qui manquent en base (cochés et verrouillés s'ils y sont déjà). On ne peut qu'en ajouter.
- **Rechercher d'autres DLC** : les DLC IGDB du jeu absents de la base ; ajoutés, ils rejoignent toutes les versions jouées, non faits.
- **Retirer** une version jouée ou le jeu se confirme, en disant ce qui part : il n'y a pas d'annulation.

## 5. Séries et numéros

- **Série proposée** par IGDB : la collection la plus large (la première sans collection parente parmi celles du jeu : *Crisis Core* est dans *Compilation of Final Fantasy VII*, *Final Fantasy* et *Final Fantasy VII*, on garde *Final Fantasy*). Sans collection, la franchise principale, sinon la première des franchises (*Aperture Desk Job* → *Portal*). Sinon, pas de série. Une franchise n'est qu'une étiquette d'univers, moins renseignée : elle ne sert qu'à proposer une série à défaut de collection.
- **Choix** : la série d'IGDB (pré-sélectionnée), « Aucune », une autre série, ou « Nouvelle série… » par son nom. Un nom déjà pris, sans tenir compte des accents ni des majuscules, désigne la série existante. Un crayon signale une série qui n'est pas celle d'IGDB (« Série IGDB » y ramène). Une série créée à la main n'appartient qu'à son compte ([authentification, §3.1](../auth/auth.md#31-tables-des-projets)), et quitte la base avec son dernier jeu.
- **Numéro** : obligatoire avec une série, unique dans celle-ci, à partir de 1, 3 décimales au plus. IGDB ne donne aucun ordre : il est pré-rempli (le jeu passe après les autres de la série, à l'entier au-dessus du plus grand), se tape (`3`, `3.1`, `3,1`) et se réordonne par « Réorganiser la série ».
- **Familles** : un entier est un jeu principal, un numéro à décimales un sous-jeu de ce principal (*Crisis Core* = 7.1 sous *FF VII* = 7). Les sous-jeux vont de 3.1 à 3.9 ; au-delà du 9e, toute la famille passe à deux chiffres (3.01 … 3.10), puis à trois. Affichage avec le moins de décimales possible, le même pour toute la famille.
- **Trous permis** : un jeu qui part laisse sa place vide, rien n'est renuméroté. Un numéro pris est libéré vers le haut : le jeu qui l'a avance d'un cran (avec sa famille pour un principal), et les suivants tant qu'ils se heurtent ; un trou arrête le décalage.
- **Réorganiser la série** : une ligne par jeu du backlog de la série, glisser-déposer par la poignée (un peu à droite pour en faire un sous-jeu) ou numéro tapé. « Avant : n » sur les numéros changés ; un jeu sorti avant un jeu placé plus haut est signalé, sans être une erreur (un spin-off sort souvent après la suite). Rien n'est enregistré avant « Valider ».
- Un clic sur un nom de série filtre le tableau sur cette série.

## 6. Données IGDB

Les données de référence viennent de l'API [IGDB](https://api-docs.igdb.com). Seul ce qui sert à l'affichage est stocké.

| Donnée | Côté IGDB | Remarque |
| --- | --- | --- |
| Nom original | `name` | |
| Nom français | `alternative_names` dont le commentaire indique un titre français | IGDB n'a pas de région France. Les autres noms alternatifs ne sont pas stockés |
| Image | `cover`, `artworks` → `image_id` | Seul l'`image_id` est stocké ; le navigateur charge l'image chez IGDB (`t_thumb`, `_2x` en haute densité), sans passer par l'API ni son quota |
| Sortie | `first_release_date`, `release_dates` par plateforme, `game_status` | « annulé » si *Cancelled* ; « à venir » sans date ou avec une date future |
| Type de fiche | `game_type` | Jeu, version, remake, DLC, standalone ; mène une fiche à son jeu ; exclut mods et forks |
| Versions | `version_parent`, `version_title`, `remasters`, `ports`, `expanded_games` | Titre : `version_title`, sinon le nom IGDB s'il diffère du jeu, sinon le type et l'année (*Portage 1998*, *Édition 2015*) |
| DLC | `dlcs`, `expansions` ; `parent_game` côté DLC | |
| Bundles | `bundles`, côté jeu contenu | Un bundle rattaché par `version_parent` est une version (*Skyrim Legendary Edition*) |
| Série | `collections` et leurs relations ; à défaut `franchise`, `franchises` | §5 |
| Développeur, éditeur | `involved_companies` → `companies`, `company_logos` | La première société de chaque rôle |

- **Seul le serveur appelle IGDB** (`igdb/`), qui refuse les navigateurs. Il garde le Client-ID et le secret de l'application Twitch, en tire un token qu'il renouvelle quand il expire, espace ses appels pour rester sous 4 requêtes par seconde, et garde la fiche d'un jeu 10 minutes en mémoire, le temps de l'ajouter.
- Les endpoints IGDB sont réservés aux connectés : le quota est partagé par tous les inscrits.
- Les données d'un jeu en base ne sont pas resynchronisées avec IGDB ([todo](../todo/todo.md#62-données-igdb)).

## 7. Plateformes et icônes

- Chaque plateforme a un nom court (l'abréviation IGDB, ex. « PS2 », sinon son nom) et un nom technique (le slug IGDB, ex. `ps2`, `win`). Les plateformes s'ajoutent à l'import du premier jeu qui en a besoin.
- **Sous-plateformes** : une plateforme enfant est rattachée à une plateforme parente (`parent_platform_id`, `sub_platform_type`, V024). Émulateurs : PCSX2 (PS2) et RPCS3 (PS3), proposés après leur console. Launchers du PC (V023) : Steam, Epic Games Store, GOG Galaxy, Xbox App, EA App, Ubisoft Connect, Battle.net, Riot Client, Rockstar Launcher, Itch.io, Ankama Launcher, Minecraft Launcher. Leur nom technique est choisi à la main (`pcsx2`, `steam`, `epic-games`…), et une sous-plateforme est signalée dans le tableau.
- **Icônes** : un SVG par plateforme ou launcher, nommé par son nom technique (`ps2.svg`, `steam.svg`, `epic-games.svg`…), se dépose dans `apps/client/src/projects/backlog/icons/` : `getPlatformIconUrl` le retrouve, sans autre branchement. Sans SVG, la plateforme garde son icône par défaut (manette, processeur pour un émulateur, boutique pour un launcher), à côté de son nom.

## 8. Base, endpoints et code

- **Base commune** (données IGDB : jeux, versions et leurs plateformes, DLC, séries, sociétés, plateformes, avec les id d'IGDB) et **base du compte** (`backlog_user_game` : la personnalisation ; `backlog_user_version` : les données de jeu ; `backlog_done_dlc`). Le lien de chaque table au compte est dans [authentification, §3.1](../auth/auth.md#31-tables-des-projets).
- Un jeu enregistré par un compte est proposé aux autres, sans sa personnalisation ; chacun garde ses versions jouées.

Endpoints, sous `/api/backlog`, tous `protected` :

| Endpoint | Rôle |
| --- | --- |
| `GET /igdb/search?query=` | Recherche IGDB de la barre du haut |
| `GET /igdb/games/:igdbId` | Fiche IGDB d'un jeu, ou le jeu en base complété d'IGDB |
| `GET /igdb/games/:igdbId/images` | Images proposées pour la miniature |
| `POST /games` | Enregistrer un jeu, ses versions et DLC cochés |
| `POST /games/:gameId/imports` | « Modifier le jeu », « Rechercher d'autres DLC » : versions et DLC en plus |
| `GET /games/:gameId`, `DELETE /games/:gameId` | Un jeu en base, avec sa personnalisation s'il est dans le backlog ; le retirer de la base (refusé s'il est dans un backlog) |
| `GET /games?query=&page=` | Les jeux en base hors du backlog, par 50 |
| `GET /overview` | Compteurs de la page, plateformes jouées (filtre Plateforme) |
| `GET /user-games?page=&sort=&<colonne>=` | Le tableau, trié et filtré par le serveur, par 25 |
| `POST /user-games`, `PUT /user-games/:gameId`, `DELETE /user-games/:gameId` | Ajouter au backlog ; « Personnaliser » ; retirer |
| `POST /user-games/:gameId/user-versions` | Ajouter une version jouée |
| `PATCH /user-versions/:id`, `DELETE /user-versions/:id` | Une cellule (seuls les champs modifiés) ; retirer la version jouée |
| `PATCH /user-versions/:id/done-dlcs/:dlcId` | Case « fait » d'un DLC |
| `GET /series`, `GET /series/:seriesId/entries`, `PUT /series/:seriesId/entries` | Les séries ; les jeux d'une série ; « Réorganiser la série » |

**Code** :

- **Specs** (`packages/specs/src/projects/backlog/`) : en plus des endpoints, `helper/` porte les règles appliquées à l'identique par le front et le serveur : statuts et leur conversion (`status/`), agrégats d'une ligne (`aggregate/`), numéros dans une série (`seriesNumber/`), tri et filtres écrits dans l'URL (`view/`).
- **Serveur** (`apps/server/src/projects/backlog/`) : `igdb/` est le seul accès à IGDB (`igdbClient`) ; `view/` calcule chaque ligne du tableau, puis la filtre, la trie et la découpe en pages ; `userData/` supprime et exporte les données d'un compte, enfants d'abord.
- **Front** (`apps/client/src/projects/backlog/`) : une page (`pages/Homepage`). `components/` (Button, Modal, Select, Tooltip…) et `variables.scss` portent l'identité visuelle du projet, en attendant leur fusion avec le design system ; `backlog.module.scss` est la feuille partagée de la page.

## 9. Lancer

Une application Twitch (https://dev.twitch.tv/console/apps), dont le Client-ID et le secret vont dans `.env` : `INTERNET_GAME_DATA_BASE_CLIENT_ID` et `INTERNET_GAME_DATA_BASE_CLIENT_SECRET`. Sans elles, le serveur ne démarre pas. Puis : voir [Lancer en local](../../README.md#2-lancer-en-local), et http://localhost:3001/backlog. Les scénarios end-to-end sont K1 à K22 des [scénarios](../e2e/scenarios.md).
