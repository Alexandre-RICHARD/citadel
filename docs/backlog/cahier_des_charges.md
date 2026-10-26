# Backlog Jeux Vidéo — Cahier des charges

Oct 21, 2026 · @Alex Perso

## 1. Existant : le Google Sheet

Le suivi actuel tient dans un Google Sheet de 3 tableaux. Il est devenu difficile à mettre à jour et à faire correspondre à tous les cas.

### Tableau principal

- **Informations du jeu** :&#32;
  - nom, série (optionnelle)
  - numéro dans la série
  - date de sortie
  - plateforme de jeu
- **Type de fin** (un choix parmi) :
  - Fin claire : jeu à histoire avec générique
  - Sandbox : *Minecraft*, *Satisfactory*, *Shapez*
  - Retry : *The Binding of Isaac*, *Don't Starve*
  - Multi : *Call of Duty* / *Battlefield* sans solo, *Rocket League*, *League of Legends*
- **Statuts** (cases à cocher) :&#32;
  - je possède le jeu
  - j'y ai déjà joué
  - je l'ai fini
  - j'ai tous les succès / trophées
  - je l'ignore (jeu grisé, pas prévu d'y jouer dans les prochaines années).
- **Temps de jeu** (3 champs) :
  - Temps total : cumul du temps officiel et du temps estimé
  - Temps officiel : données de la plateforme, parfois cumulées
  - Temps estimé : estimation manuelle
- **Commentaires**

### Tableaux secondaires

- **Jeux finis** (généré automatiquement) : reprend les jeux dont la case « Fini » est cochée et y associe la date de première fin (réelle ou estimée).
- **Wishlist** : liste des jeux à acquérir.

## 2. Vision et périmètre

À terme, une application de backlog personnalisé, complet et uniformisé entre mes jeux, mes films et mes séries. Pour l'instant, le périmètre se limite aux jeux vidéo : jeux possédés, en cours, abandonnés, finis, etc.

- **À terme** : réimporter tout ce que j'ai sauvegardé depuis TV Time (hors périmètre jeux).
- **Phase actuelle**, trois livrables :
  1. Le modèle de la base de données.
  2. La liste des endpoints, avec leur URL et à peu près ce qu'ils doivent contenir.
  3. Les éléments d'interface qui répondent aux user stories.
- **Réalisé** : un POC React branché sur IGDB, puis l'application avec sa base et son serveur (section 4).

## 3. Source de données : IGDB

Les données de référence viennent de l'API IGDB ([documentation](https://api-docs.igdb.com)). Seules les données utiles à l'affichage du backlog sont récupérées et stockées. Le classement d'IGDB fait foi pour distinguer jeux, versions, remakes et DLC.

| Donnée | Utilisée pour | Côté IGDB |
| --- | --- | --- |
| Nom VO | Colonne Nom, recherche | `name` |
| Nom VF | Colonne Nom, recherche | `alternative_names` dont le commentaire indique un titre français (« French title ») : IGDB n'a pas de région France. Sans titre français, ou s'il est identique au nom VO, seul le nom VO s'affiche |
| Noms alternatifs | Seulement pour trouver le nom VF : aucun n'est stocké | `alternative_names` (nom + commentaire) |
| Image | Miniature, choisie à l'ajout au backlog | `cover`, `artworks` → `image_id` |
| Page IGDB | Entrée « Ouvrir sur IGDB » du menu Actions | `url` |
| Date de sortie | Colonne Date de sortie | `first_release_date` ; `release_dates` par plateforme |
| Statut de sortie | Mention « à venir » ou « annulé » | `game_status` |
| Plateformes | Plateformes de chaque version (nom et nom technique) ; choix de la plateforme d'une version jouée | `platforms` |
| Type de fiche | Distinguer jeu, version, remake, DLC, standalone ; mener une fiche trouvée par la recherche à son jeu ; exclure mods et forks de la recherche ; titrer une version sans titre propre (section 5) | `game_type` |
| Versions | Toutes les versions, proposées à l'ajout ; seules celles cochées sont stockées. Titre : `version_title`, sinon `name` (section 5) | `version_parent`, `version_title`, `remasters`, `ports`, `expanded_games` |
| DLC | Tous les DLC, proposés à l'ajout ; seuls ceux cochés sont stockés. Colonne DLC | `dlcs`, `expansions` ; `parent_game` côté DLC |
| Extensions standalone | Jeux distincts | `standalone_expansions` |
| Bundles | Recherche : un bundle mène aux jeux qu'il contient | `bundles`, côté jeu contenu |
| Série | Série proposée à l'ajout (colonne Série) | `collections` et leurs relations (`as_child_relations`) ; à défaut, `franchise`, `franchises` |
| Développeur, éditeur | Colonnes Développeur et Éditeur | `involved_companies` (rôles développeur / éditeur) → `companies` |
| Logos des sociétés | Affichés au-dessus du nom de la société | `company_logos` |

On ne garde qu'une série, un développeur et un éditeur par jeu (section 10) ; pour chaque rôle, la première société.

- **Série proposée** : la collection la plus large, c'est-à-dire la première qui n'a pas de collection parente parmi celles du jeu (*Crisis Core* est dans *Compilation of Final Fantasy VII*, *Final Fantasy* et *Final Fantasy VII* : on garde *Final Fantasy*). Sans collection, la franchise principale (`franchise`), sinon la première de `franchises` (*Aperture Desk Job* → *Portal*). Sinon, pas de série : un jeu seul n'en a pas.
- **Pas de franchise** : une collection IGDB est une suite de jeux, structurée (sous-séries, spin-offs) ; une franchise n'est qu'une étiquette d'univers, deux fois moins renseignée, qui reprend le plus souvent le nom de la série. Elle ne sert qu'à proposer une série à défaut de collection, et n'est pas stockée en tant que telle.
- **Un seul nom** : le nom IGDB de la série. IGDB n'a pas de nom alternatif pour les séries, donc pas de nom VF.
- IGDB ne donne aucun ordre dans une série : le numéro dans la série est pré-rempli, se choisit à la main et se réordonne par « Réorganiser la série » (section 8).

## 4. Architecture des données

### Application

Projet du monorepo Citadel, construit comme Game Death Counter (règles du front : `docs/frontArchitecture.md`).

- **Specs** (`packages/specs/src/projects/backlog`) : schémas des requêtes, DTO, endpoints, et règles métier communes au serveur et au front (statuts, agrégats de la ligne, numéros dans une série, tri et filtres écrits dans l'URL).
- **Serveur** (`apps/server/src/projects/backlog`) : Express et MariaDB, tables préfixées `backlog_` (celles de Game Death Counter : `gdc_`).
- **Front** (`apps/client/src/projects/backlog`) : la couche `api/` (un hook par endpoint, modèles du front, cache), la page et ses composants (`pages/Homepage/`), `helper/` et `hooks/`. Les composants d'interface génériques (`components/`) et `variables.scss` (jetons des deux thèmes, mixins, injectés sous le nom `vars`) portent l'identité visuelle, en attendant leur fusion avec le design system ; `backlog.module.scss` reste la feuille partagée de la page.
- **IGDB** : seul le serveur l'appelle, IGDB refusant les navigateurs. Il garde le Client-ID et le secret de l'application Twitch, en tire un token qu'il renouvelle quand il expire, espace ses appels pour rester sous 4 requêtes par seconde, et garde la fiche d'un jeu 10 minutes en mémoire, le temps de l'ajouter. La recherche part 300 ms après la dernière frappe.
- **Écritures optimistes** : chaque action s'affiche tout de suite, grisée tant que le serveur n'a pas répondu, et se défait avec un message si le serveur la refuse.
- Pas encore de notion d'utilisateur.

### Endpoints

Sous `/api/backlog` :

| Méthode | URL | Rôle |
| --- | --- | --- |
| GET | `/igdb/search?query=` | Recherche IGDB de la barre du haut |
| GET | `/igdb/games/:igdbId` | Modale du jeu : sa fiche IGDB, ou le jeu en base complété d'IGDB |
| GET | `/igdb/games/:igdbId/images` | Images proposées pour la miniature |
| POST | `/games` | Enregistrer un jeu, ses versions et DLC cochés |
| POST | `/games/:gameId/imports` | « Modifier le jeu », « Rechercher d'autres DLC » : versions et DLC en plus |
| GET | `/games/:gameId` | Un jeu en base, avec sa personnalisation s'il est dans le backlog |
| GET | `/games?query=&page=` | « Ma base » : les jeux hors backlog, par 50 |
| GET | `/overview` | Compteurs de la page, plateformes jouées (filtre Plateforme) |
| GET | `/user-games?page=&sort=&<colonne>=` | Le tableau, trié et filtré par le serveur, par 25 |
| POST | `/user-games` | Ajouter au backlog : personnalisation et première version jouée |
| PUT | `/user-games/:gameId` | « Personnaliser » |
| DELETE | `/user-games/:gameId` | « Retirer le jeu du backlog » |
| POST | `/user-games/:gameId/user-versions` | « Ajouter une version jouée » |
| PATCH | `/user-versions/:id` | Une cellule du tableau : seuls les champs modifiés |
| DELETE | `/user-versions/:id` | « Retirer la version jouée » |
| PATCH | `/user-versions/:id/done-dlcs/:dlcId` | Case « fait » d'un DLC |
| GET | `/series` | Toutes les séries |
| GET | `/series/:seriesId/entries` | Les jeux du backlog d'une série |
| PUT | `/series/:seriesId/entries` | « Réorganiser la série » |

### Consignes

- **Valeurs calculées jamais stockées** : tout ce qu'affiche la ligne du jeu (meilleur statut, sommes, dates, « faits / total » des DLC) et le temps total. Le serveur s'en sert pour trier et filtrer, le front pour afficher, avec la même règle (specs).
- **Langue** : tout le code est en anglais (types, champs, variables, valeurs des listes fermées). Les libellés d'interface sont en français, écrits en dur dans le code, sans système de traduction.
- **Pictos d'interface** : des icônes lucide-react (SVG), comme le projet Game Death Counter ; aucun emoji dans l'interface.

### Base

- **Base globale (données IGDB)** : données de référence, partagées. Elle ne contient que ce qui sert à l'affichage (section 3), dont la série proposée par IGDB, plus les séries créées à la main. Chaque version y est stockée une seule fois, avec la liste de ses plateformes et de ses dates de sortie : aucune donnée n'y est dupliquée par plateforme.
- **Base utilisateur** : toutes les données de l'utilisateur. Les jeux du backlog (`backlog_user_game`) portent sa personnalisation : miniature, type de fin, série et numéro dans la série. Les versions jouées (`backlog_user_version`) portent ses données de jeu ; c'est là seulement que la plateforme les distingue. Les DLC faits (`backlog_done_dlc`) les complètent.

### Plateformes et icônes

- Chaque plateforme, émulateurs compris, est stockée avec un nom et un nom technique. Le nom est l'abréviation IGDB (`abbreviation`, ex. « PS2 »), ou le nom complet (`name`) quand elle manque. Le nom technique est le `slug` IGDB (ex. `ps2`, `win`, `ps4--1`) ; pour un émulateur, un slug choisi à la main (ex. `pcsx2`).
- La base démarre avec deux consoles et leurs émulateurs : PCSX2 (PS2) et RPCS3 (PS3), chacun rattaché à une seule console (liste complète en section 10). Les autres plateformes s'ajoutent à l'import du premier jeu qui en a besoin.
- Le front embarque les icônes en dur, chaque fichier nommé par le nom technique de sa plateforme (ex. `ps2.svg`).
- Une plateforme sans icône affiche son nom.

### Images

- On stocke seulement la référence de l'image : son `image_id` IGDB. Aucune image n'est stockée.
- Une seule fonction construit l'URL à l'affichage : `https://images.igdb.com/igdb/image/upload/t_<taille>/<image_id>.jpg`. `t_thumb` (90 × 90) pour la miniature d'une ligne, suffixe `_2x` pour les écrans haute densité.
- Le navigateur charge les images directement chez IGDB : ces requêtes ne passent pas par l'API et ne consomment pas son quota.

## 5. Règles métier : jeu, version, version jouée, DLC

Une ligne du backlog correspond à un **jeu du backlog** : un jeu et sa personnalisation. Les données de jeu de l'utilisateur sont portées par ses **versions jouées**, une version jouée étant unique par Jeu + Version + Plateforme ; la ligne du jeu n'en affiche que des agrégats.

### Les notions

| Notion | Définition | Exemples |
| --- | --- | --- |
| Jeu | L'œuvre, en base globale, partagée. Un remake est un jeu distinct | *Skyrim* ; *FF7* et *FF7 Remake* sont deux jeux |
| Jeu du backlog | Un jeu dans mon backlog, une ligne du tableau. Il porte ma personnalisation, choisie à l'ajout au backlog : miniature, type de fin, série et numéro dans la série. Il n'existe qu'avec au moins une version jouée | *Skyrim* dans mon backlog, en Histoire, série *The Elder Scrolls* n° 5 |
| Version | Une déclinaison qu'IGDB rattache au jeu : portage, remaster, réédition, *Deluxe* / *Ultra Deluxe*, *GOTY*, *Director's Cut* | *Skyrim* et *Skyrim Legendary Edition* ; *The Last of Us* et *The Last of Us Remastered* |
| Version jouée | Une version sur une plateforme, dans mon backlog. Elle porte mes données de jeu : statut, temps, possession, dates, note, DLC faits… | *Skyrim* sur PS3 ; *Skyrim Legendary* sur PS4 ; *Skyrim Legendary* sur PC = 3 versions jouées |
| Plateforme | Une plateforme IGDB, ou un émulateur rattaché à la console émulée. Stockée avec un nom et un nom technique | PS4, PC, *PCSX2* (PS2) |
| DLC | Contenu additionnel rattaché au jeu, pas à une version. Il se coche comme fait sur une version jouée | *Dawnguard*, *Hearthfire*, *Dragonborn* pour *Skyrim* |
| Extension standalone | Un jeu à part entière, pas un DLC. IGDB en classe certaines en DLC : on les ajoute alors comme jeu (règle « DLC comme jeu ») | *TLAD*, *TBOGT* (extensions de *GTA IV* sur IGDB) |
| Série | Facultative. Proposée par IGDB (section 3) et choisie pour chaque jeu du backlog : la proposée, une autre série, une série créée à la main ou aucune. Chaque jeu y a un numéro, unique ; des décimales en font un sous-jeu d'un autre (section 8). Un clic sur son nom filtre le tableau | *Grand Theft Auto* ; *Souls*, créée à la main pour *Dark Souls*, *Sekiro* et *Elden Ring* |

### Règles

- **Classement IGDB** : pas de règle maison. Ce qu'IGDB rattache à un jeu comme version, remaster, portage ou version enrichie est une version de ce jeu. Ce qu'il classe comme remake est un jeu distinct.
- **Une version, une fiche** : en base globale, chaque version est stockée une seule fois avec la liste de ses plateformes. La plateforme n'intervient que côté utilisateur, dans la version jouée.
- **Plateformes proposées pour une version jouée** : d'abord celles où la version est sortie, puis les émulateurs de ces consoles. Exemple : un jeu PS2 propose PS2, puis *PCSX2*.
- **Pas de doublon** : un jeu, une version ou un DLC n'existe qu'une fois en base. La recherche signale ce qui est déjà en base. Exception voulue : une même fiche IGDB peut être à la fois DLC d'un jeu et jeu à part (règle « DLC comme jeu »).
- **Pas de duplication de version jouée** : avoir joué à la même version sur la même plateforme avec plusieurs comptes ne crée pas de seconde entrée.
- **Jeu du backlog et versions jouées** : retirer la dernière version jouée d'un jeu le retire du backlog, avec sa personnalisation. Le jeu reste en base ; y revenir repart de la personnalisation par défaut.
- **Deux noms** : un jeu a un nom VO et un nom VF éventuel. Les autres noms alternatifs d'IGDB ne sont pas stockés.
- **DLC** : récupérés pour chaque jeu ajouté. Seuls les DLC et les extensions (`dlcs`, `expansions`) comptent ; les packs et les mises à jour ne sont pas récupérés. Ils sont réunis depuis l'original et toutes ses versions, sans doublon, et rattachés au jeu ; dans les faits, IGDB ne les range que sur l'original.
- **DLC choisis** : comme les versions, la modale d'ajout propose tous les DLC, et seuls ceux cochés sont enregistrés ; ils sont tous cochés à l'ouverture. Le backlog est personnel : une petite quête gratuite (*The Witcher 3* en compte 5 sur IGDB) peut être un vrai DLC pour l'un et du bruit pour l'autre. Le type IGDB ne permet pas de trier : *Dawnguard* y est un DLC, comme ces quêtes. Les DLC en base fixent le « total » de « faits / total ». D'autres s'ajoutent plus tard, par « Modifier le jeu » (section 8) ou « Rechercher d'autres DLC » (section 9).
- **DLC comme jeu** : IGDB ne distingue pas une extension vendue seule d'une autre (*TLAD* et *TBOGT* y sont des extensions de *GTA IV*, comme les season pass). Dans la modale du jeu, chaque DLC peut donc aussi être coché « Comme jeu » : il est ensuite ajouté comme jeu à part, sa fiche devenant sa version originale. Les deux cases sont indépendantes : *TLAD* peut être jeu à part et DLC de *GTA IV* en même temps, sans conflit. On peut donc changer d'avis : retirer *TLAD* du backlog, l'ajouter aux DLC de *GTA IV* et le cocher fait.
- **Pas de bundle** : un produit qui regroupe plusieurs jeux n'est pas modélisé. Chaque jeu qu'il contient s'ajoute séparément : la recherche mène d'un bundle à ses jeux (section 8). Exception : un bundle qu'IGDB rattache à un jeu par `version_parent` est une édition de ce jeu vendue avec ses DLC (ex. *Skyrim Legendary Edition*) ; il compte comme une version.
- **Versions choisies** : la modale d'ajout propose toutes les versions qu'IGDB rattache au jeu, et seules celles cochées sont enregistrées. Le backlog est personnel : inutile de stocker des éditions qu'on ne jouera jamais.
- **Jeu original toujours en base** : sa version originale est toujours enregistrée, cochée d'office et non décochable, car elle porte l'id et la page IGDB du jeu. Les autres versions sont décochées à l'ouverture.
- **Titre d'une version** : la version originale affiche le nom du jeu. Une autre version prend son `version_title`, sinon son nom IGDB s'il diffère de celui du jeu (*The Last of Us Remastered*). Sinon, IGDB ne la distingue pas de l'originale : elle prend son type et l'année de sa première sortie, toutes plateformes confondues. Les types sont Portage, Remaster, Version enrichie, et Édition pour le reste ; ex. *Portage 1998* pour *FF7* sur PC, *Édition 2015* pour l'édition PS4 / PS5 de *GTA V*, qui a aussi une date PC de 2015 sur IGDB.

### Affichage replié / déplié

- **Une seule version jouée** : la ligne est simple, non dépliable. Elle affiche cette version jouée (version et plateforme) et ses données se modifient directement sur la ligne. Miniature : l'image choisie à l'ajout au backlog ; nom : celui du jeu, avec le titre de la version en dessous si ce n'est pas l'original ; date de sortie : la date originale du jeu.
- **Plusieurs versions jouées** : la ligne affiche le jeu original (nom, date de sortie originale), plateforme vide, et les agrégats des versions jouées. Elle se déplie en une sous-ligne par version jouée, où se modifient ses données.
- **Agrégats** : la ligne du jeu montre le total, le meilleur, le plus ancien… selon la colonne (section 7). Quand il est impossible de choisir une valeur, la case reste vide.
- **Personnalisation** : le type de fin, la série et le numéro dans la série, choisis à l'ajout au backlog et modifiables par « Personnaliser » et « Réorganiser la série » (section 8), s'affichent en lecture seule dans le tableau.
- Seules les versions jouées présentes dans le backlog de l'utilisateur comptent. Les autres versions en base n'apparaissent pas.

## 6. Types de fin et statuts

Le type de fin, choisi à l'ajout du jeu au backlog, dit ce que « finir » veut dire. Le statut, renseigné sur chaque version jouée, dit jusqu'où je suis allé ; la ligne du jeu affiche le meilleur.

### Types de fin

| Type de fin | Ce que « fini » veut dire | Exemples |
| --- | --- | --- |
| Histoire | Une fin scénarisée : générique vu | *GTA V*, *The Last of Us*, *Skyrim* (quête principale), *FF7* |
| Runs | Des parties recommencées ; fini = première victoire ou fin principale | *The Binding of Isaac*, *Hades*, *Dead Cells*, *Slay the Spire*, *Don't Starve* |
| Bac à sable | Pas de fin imposée ; fini quand j'estime en avoir fait le tour | *Minecraft*, *Satisfactory*, *Shapez*, *Cities: Skylines*, *Les Sims* |
| Multijoueur | Jeu en ligne ou compétitif sans fin ; jamais vraiment fini | *Rocket League*, *League of Legends*, *Call of Duty* / *Battlefield* sans solo, *Fortnite* |

### Statuts d'une version jouée

Les statuts sont gradés du rang 1 au rang 8 ; « Abandonné » est hors échelle. « Pas commencé » est la valeur par défaut, et les statuts proposés dépendent du type de fin du jeu.

| Rang | Statut | Signification | Histoire | Runs | Bac à sable | Multi |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Pas commencé | Dans le backlog, jamais lancé | ✓ | ✓ | ✓ | ✓ |
| 2 | Vu sans jouer | Je l'ai fait avec des amis | ✓ | ✓ |  |  |
| 3 | Démarré | Lancé, quelques heures de jeu | ✓ | ✓ | ✓ | ✓ |
| 4 | Bien entamé | Bonne progression, pas encore fini | ✓ | ✓ | ✓ | ✓ |
| 5 | Fini | Fin principale atteinte | ✓ | ✓ |  |  |
| 5 | Estimé fini | Pas de fin officielle, mais je le considère fini |  |  | ✓ | ✓ |
| 6 | Complété (100 %) | Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires | ✓ | ✓ | ✓ | ✓ |
| 7 | Platiné | Fini, et tous les succès ou trophées de la plateforme obtenus | ✓ | ✓ | ✓ | ✓ |
| 8 | Complété et Platiné | Les deux à la fois | ✓ | ✓ | ✓ | ✓ |
| – | Abandonné | Arrêté sans intention d'y revenir | ✓ | ✓ | ✓ | ✓ |

### Statut de la ligne du jeu (calculé)

Les versions jouées « Pas commencé » sont ignorées tant qu'une autre version jouée a un statut. On applique ensuite la première situation qui correspond :

| Situation des versions jouées | Statut affiché sur la ligne du jeu |
| --- | --- |
| Toutes « Pas commencé » | Pas commencé |
| Au moins une au rang 5 ou plus | Le plus haut de ces statuts |
| Toutes « Abandonné » | Abandonné |
| Aucune « Abandonné » | Le plus haut statut |
| « Abandonné » mêlé à un statut en cours (rangs 2 à 4) | Vide : impossible de choisir |

### Règles

- Passer une version jouée au rang 5 ou plus propose de renseigner sa date de fin, et passe son nombre de fois fini (sûr) à 1 s'il était à 0. Si la date de fin est vide, une petite fenêtre la propose, pré-remplie avec la date du jour (« Valider » ou « Plus tard »). Il en va de même pour une version jouée créée avec un statut pré-rempli de rang 5 ou plus (section 8).
- Repasser sous le rang 5 n'efface pas la date de fin.

## 7. Données suivies et colonnes du backlog

Chaque colonne du tableau correspond à une donnée stockée ou calculée : cette liste fait office des deux. Les données de l'utilisateur se saisissent sur la version jouée ; la ligne du jeu en affiche l'agrégat, vide quand il est impossible de choisir. Sur une ligne à version jouée unique, les deux dernières colonnes se confondent.

| Colonne | Niveau | Source | Ligne du jeu | Sous-ligne de version jouée |
| --- | --- | --- | --- | --- |
| Miniature | Jeu du backlog | IGDB, choisie à l'ajout au backlog | Image choisie | Image de la version |
| Nom | Jeu | IGDB | Nom VF, nom VO en dessous s'il diffère | Titre de la version (ex. *Legendary Edition*) |
| Série | Jeu du backlog | Proposée par IGDB, choisie à l'ajout au backlog | Nom, vide sans série ; un crayon si ce n'est pas celle proposée par IGDB (au survol : celle d'IGDB) ; un clic filtre le tableau sur cette série |  |
| N° dans la série | Jeu du backlog | Pré-rempli à l'ajout au backlog, réordonné par « Réorganiser la série » | Numéro, en lecture seule, avec les décimales de sa famille (3.10) ; vide sans série |  |
| Développeur | Jeu | IGDB | Logo au-dessus du nom |  |
| Éditeur | Jeu | IGDB | Logo au-dessus du nom |  |
| Date de sortie | Jeu, version | IGDB | Date originale, ou « à venir » / « annulé » | Date de sortie de la version sur cette plateforme |
| Type de fin | Jeu du backlog | Choisi à l'ajout au backlog | Type, en lecture seule |  |
| Plateforme | Version jouée | Saisie (plateformes de la version + émulateurs) | Vide si plusieurs versions jouées | Icône et nom |
| Statut | Version jouée | Saisie | Meilleur statut (section 6), vide si impossible de choisir | Liste filtrée par type de fin |
| À jouer bientôt | Version jouée | Saisie | Coché si au moins une version jouée est cochée ; la ligne est mise en valeur | Case |
| Possédé | Version jouée | Saisie | Coché si au moins une version jouée est possédée | Case |
| Date de fin | Version jouée | Saisie | La plus ancienne (première fin) | Date, vide si pas fini |
| Fois fini | Version jouée | Saisie | Somme de chaque compteur | Deux compteurs : sûr et probable |
| DLC | Version jouée | IGDB (liste) + saisie (faits) | « faits / total », un DLC comptant comme fait s'il l'est sur au moins une version jouée | « faits / total » ; clic = liste à cocher (section 9) |
| Temps relevé | Version jouée | Saisie | Somme des versions jouées | Temps relevé sur la plateforme |
| Temps estimé | Version jouée | Saisie | Somme des versions jouées | Estimation manuelle du temps non relevé |
| Temps total | Version jouée | Calculé | Somme des versions jouées | Relevé + estimé |
| Note | Version jouée | Saisie | La plus haute | De 0 à 20 |
| Commentaire | Version jouée | Saisie | Le commentaire s'il n'y en a qu'un, sinon vide | Texte libre, tronqué, complet au survol |
| Actions | Jeu, version jouée |  | Menu « 3 points verticaux » en fin de ligne (section 9) | Menu « 3 points verticaux » en fin de sous-ligne (section 9) |

- **Date de sortie** : « annulé » si IGDB indique le statut *Cancelled* ; « à venir » remplace la date quand il n'y en a pas ou qu'elle est future. Avec les autres statuts IGDB (accès anticipé, retiré de la vente…), la date s'affiche normalement. Sur une sous-ligne d'émulateur, c'est la date de sortie de la version sur la console d'origine (ex. PCSX2 : la date de sortie sur PS2).
- **Formats** : temps stockés en minutes entières, saisis en heures et minutes, affichés « 12 h 30 » ; note entière de 0 à 20 ; numéro dans la série à partir de 1, 3 décimales au plus (sous-jeux, section 8), obligatoire avec une série et unique dans celle-ci ; compteurs « fois fini » entiers, à partir de 0.
- **Zéros** : un temps ou un compteur « fois fini » à zéro, sa valeur par défaut, s'affiche estompé (« 0 h 00 », « 0 ») pour laisser ressortir les valeurs saisies. Une note de 0, choisie, s'affiche normalement.

## 8. Ajout d'un jeu et gestion du backlog

Rien n'est enregistré avant « Valider ». Un ajout standard : clic sur un résultat, « Valider » ; dans l'ajout au backlog qui s'ouvre, vérification du type de fin (Histoire par défaut), cover pré-sélectionnée, choix de la plateforme, et « Valider ».

### Ajout depuis IGDB

1. **Recherche** : une barre de recherche connectée à IGDB.
   - Chaque résultat s'affiche sous la forme `<Nom VF> <Nom VO> (année de sortie)`, avec son image et ses plateformes (3 au plus, puis le nombre de plateformes restantes) ; un seul nom si VF et VO sont identiques.
   - Chaque fiche trouvée mène à son jeu de base, seul proposé en résultat :
     - une version (édition, remaster, portage, version enrichie, bundle rattaché par `version_parent`) mène à son jeu original : chercher *Skyrim Special Edition* trouve *Skyrim* ;
     - un DLC, une extension, un pack, une mise à jour, un épisode ou une saison mène au jeu auquel IGDB le rattache : chercher *Dawnguard* trouve *Skyrim* ;
     - un autre bundle mène à chacun des jeux qu'il contient, dans l'ordre de sortie : *Mass Effect Trilogy* donne les trois *Mass Effect*, *Episodes from Liberty City* donne *GTA IV* ;
     - les remakes et extensions standalone restent des jeux à part ; les mods et les forks sont exclus.
   - Un jeu n'apparaît qu'une fois, à la place de sa fiche la mieux classée. Les jeux trouvés seulement via un bundle passent après tous les autres : chercher *Final Fantasy VII* ne propose pas *Final Fantasy VIII* en deuxième, via un pack des deux. S'il n'a pas été trouvé lui-même, le résultat nomme sous son nom la fiche qui l'a fait trouver (« via *The Elder Scrolls V: Skyrim - Dawnguard* ») ; pas de mention quand elle porte le même nom que lui (portages de *FF7*).
   - Choisir un résultat ouvre la modale du jeu, qui propose toutes ses versions.
   - Un résultat déjà en base est signalé ; le choisir mène directement à l'ajout au backlog, avec la version originale pré-sélectionnée.
   - Choisir un résultat ferme la liste des résultats ; revenir dans le champ la rouvre avec la même saisie. Un clic à côté ou Échap la ferme aussi.
2. **Prévisualisation** : une fenêtre modale montre, en lecture seule, tout ce qui sera stocké en base globale : noms (VO, VF), série proposée, versions et leurs plateformes, DLC, développeur, éditeur, dates de sortie. Les données IGDB n'y sont pas modifiables. Les choix personnels (miniature, type de fin, série, numéro) se font à l'ajout au backlog.
3. **Choix dans la modale** :
   - Les versions à enregistrer (section 5) : l'originale cochée d'office, les autres à cocher.
   - Les DLC à enregistrer (section 5) : tous cochés à l'ouverture. Chacun a aussi une case « Comme jeu », indépendante.
4. **Validation** : « Valider » enregistre le jeu, sa version originale, les versions cochées, les DLC cochés et la série proposée par IGDB, qui reste attachée au jeu pour le crayon et « Série IGDB ».
5. **Ajout au backlog** : une case « Ajouter à mon backlog », cochée par défaut, à côté de « Valider ».
   - Cochée, « Valider » enregistre le jeu puis ouvre l'ajout au backlog (Gestion du backlog), avec les images déjà lues sur IGDB. La version originale y est pré-sélectionnée si c'est la seule version cochée ; sinon, aucune.
   - Ce sont deux actions distinctes. Annuler l'ajout au backlog laisse le jeu en base, hors du backlog.
   - Décochée, le jeu entre en base seulement ; il reviendra dans le backlog par « Ma base ».
6. **DLC comme jeu** : après « Valider », et après l'ajout au backlog s'il a lieu, la modale d'ajout de chaque DLC coché « Comme jeu » s'ouvre à son tour, dans l'ordre de la liste. Chacune a sa propre case « Ajouter à mon backlog », et ses propres DLC « comme jeu » passent avant les suivants. Annuler une modale de l'enchaînement, ou Échap, passe à la suivante. La case est grisée pour un DLC déjà en base comme jeu.

### Ajout depuis la base

Un jeu déjà en base (retiré du backlog, ou ajouté sans « Ajouter à mon backlog ») revient dans le backlog sans relire ses données IGDB : seules ses images sont relues, pour le choix de la miniature.

- La barre de recherche ne cherche que sur IGDB. À côté, le bouton « Ma base » compte les jeux en base hors backlog (N, en pastille) ; il est grisé quand il n'y en a aucun.
- Il ouvre une modale qui liste ces jeux sans requête IGDB, triés par nom (VF, sinon VO), au même format que les résultats d'IGDB (cover de l'original, plateformes de toutes les versions). Elle en affiche 50, puis les 50 suivants à l'approche du bas de la liste.
- Un champ filtre la liste à chaque frappe, sur le nom VO, le nom VF et les titres des versions, sans tenir compte des accents ni des majuscules. Vide, il montre tous les jeux.
- Choisir un jeu ouvre l'ajout au backlog, avec la version originale pré-sélectionnée.

### Modification d'un jeu

- « Modifier le jeu » complète le jeu en base : ses versions et ses DLC. Les choix personnels se font par « Personnaliser ».
- La modification rouvre la modale du jeu : données IGDB en lecture seule, puis « Valider », en une seule action. Le jeu est relu sur IGDB à l'ouverture : les versions et DLC absents de la base. Les autres données viennent de la base ; la série proposée reste celle de l'ajout.
- Les versions et DLC déjà en base sont cochés et grisés ; les autres sont décochés, à cocher pour les ajouter. On ne peut pas en retirer. Les DLC y ont aussi leur case « Comme jeu », avec le même enchaînement qu'à l'ajout.
- Un formulaire d'édition ne se valide jamais sans modification : « Valider » reste inactif tant qu'aucune version ni aucun DLC n'est coché en plus et qu'aucun DLC n'est coché « comme jeu ». Avec seulement des DLC « comme jeu », la base ne change pas : pas d'action, l'enchaînement s'ouvre directement.
- On y accède par l'entrée « Modifier le jeu » du menu Actions (section 9).

### Personnalisation d'un jeu du backlog

Les choix personnels d'un jeu du backlog, faits à l'ajout au backlog, puis modifiables par « Personnaliser » :

- L'image de la miniature, parmi la cover et les artworks, relus sur IGDB à l'ouverture ; à l'ajout, la cover est pré-sélectionnée. En attendant IGDB, ou s'il échoue, seule l'image déjà choisie est proposée ; elle le reste même si IGDB ne l'a plus.
- Le type de fin du jeu (section 6) ; Histoire par défaut.
- La série : celle proposée par IGDB, en tête de liste et pré-sélectionnée ; « Aucune » ; une autre série de la base ; ou « Nouvelle série… », qui demande un nom (« Valider » reste inactif tant qu'il est vide). Un nom déjà pris, sans tenir compte des accents ni des majuscules, désigne la série existante. Hors de la série d'IGDB, « Série IGDB » y ramène.
- Le numéro du jeu dans sa série (règles ci-dessous) : obligatoire avec une série ; sans série, il est effacé à « Valider ».
  - Choisir une série le pré-remplit. Dans sa série actuelle, le jeu garde le sien ; sinon, il passe après les jeux du backlog de la série, à l'entier au-dessus du plus grand (3 après 2 ou 2.5). Le premier jeu d'une série, ou d'une nouvelle série, a le n° 1.
  - Un numéro déjà pris est signalé (« N° 2 déjà pris par… ») : à « Valider », il est libéré vers le haut.
- Une série qu'aucun jeu ne propose et qu'aucun jeu du backlog n'a choisie quitte la base : une série créée à la main part avec son dernier jeu.
- « Personnaliser » : entrée du menu Actions, une seule action à « Valider », inactif tant que rien n'a changé. Changer le type de fin peut rendre incompatible le statut d'une version jouée : Fini devient Estimé fini et inversement, Vu sans jouer devient Pas commencé.

### Numéro dans une série

- **Valeur** : unique dans la série, à partir de 1, stocké avec 3 décimales (`X.XXX`).
- **Familles** : un numéro entier est un jeu principal ; avec des décimales, c'est un sous-jeu de ce principal (*Crisis Core* = 7.1 sous *FF VII* = 7). Un principal et ses sous-jeux forment une famille.
- **Rangs** : les sous-jeux vont de 3.1 à 3.9. Au-delà du 9e rang, toute la famille passe à deux chiffres, à rangs égaux (3.01 … 3.09, puis 3.10), puis à trois. Pas de 3.32 sans dépasser le 9e rang, sauf par une saisie (voir Saisie).
- **Affichage** : avec le moins de décimales possible, le même nombre pour toute la famille (3.10 parmi 3.01 … 3.10).
- **Trous** : permis, aux deux niveaux. Un jeu qui part laisse sa place vide ; rien n'est renuméroté. Un principal qui quitte la série laisse ses sous-jeux tels quels ; un principal remis à ce numéro les retrouve.
- **Libérer un numéro vers le haut** : le jeu qui l'a avance d'un cran (un entier pour un principal, avec toute sa famille ; un rang pour un sous-jeu), et les suivants tant qu'ils se heurtent. Un trou arrête le décalage.
- **Saisie** (« Personnaliser », ajout au backlog, « Réorganiser la série ») :
  - « 3 » ou « 3.1 », virgule acceptée. Sous 1, ou avec plus de 3 décimales : refusé, le champ reprend le dernier numéro accepté.
  - Avec moins de décimales que sa famille, c'est un rang : « 3.1 » parmi 3.01 … 3.10 donne 3.01. Avec plus, la famille prend ce nombre de chiffres et ses sous-jeux gardent leur valeur : « 3.15 » parmi 3.1 et 3.2 donne 3.10, 3.15, 3.20.
  - Un numéro pris est libéré vers le haut. Un principal emmène ses sous-jeux ; tapé en sous-jeu, il les range à sa suite.

### Réorganisation d'une série

« Réorganiser la série », entrée du menu Actions, remet dans l'ordre les jeux du backlog d'une même série. Elle n'est active qu'en mode édition, pour un jeu qui a une série.

- Une ligne par jeu du backlog de la série, triée par numéro : le numéro, modifiable (voir Saisie), le nom (VF, VO en dessous s'il diffère) et la date de sortie originale du jeu. Les sous-jeux sont décalés à droite. Le jeu d'où le menu a été ouvert est en gras.
- Glisser-déposer par la poignée, sur le trait entre deux lignes :
  - le trait décalé à droite, en glissant un peu vers la droite, fait un sous-jeu de la famille au-dessus ; le trait plein, un principal. Tout en haut, c'est toujours un principal ; entre deux jeux d'une même famille, toujours un sous-jeu ;
  - un principal emmène ses sous-jeux, qui gardent leur rang ; devenu sous-jeu, il les range à sa suite ;
  - le jeu prend le premier numéro libre juste après le jeu du dessus : l'entier qui suit sa famille (1 tout en haut), ou le rang suivant. Personne d'autre ne bouge, même tout en bas de la liste ;
  - si ce numéro est pris : en descendant au même niveau, le jeu prend la place du jeu du dessus, et les jeux dépassés reculent d'un cran tant qu'ils se heurtent ; sinon, le numéro est libéré vers le haut.
- Exemples :
  - 1 à 5 : le 5 glissé entre 1 et 2 devient 2, et 2, 3, 4 avancent ; le 2 glissé entre 4 et 5 devient 4, et 3, 4 reculent ;
  - A = 1, B = 5, C = 6, D = 7 : D glissé entre A et B devient 2 ;
  - A = 1, B = 2, C = 6 : A glissé entre B et C devient 3, le 1 reste vide ; A = 1, B = 2, C = 3 : A glissé tout en bas devient 4 ;
  - A = 1, B = 2, C = 3, D = 7, E = 8 : E glissé entre A et B donne E = 2, B = 3, C = 4, et D garde 7 ;
  - 1, 2, 2.1, 2.2, 3 : le 2 glissé tout en haut donne 1, 1.1, 1.2, et l'ancien 1 devient 2 ;
  - 1, 2, 2.1, 2.2, 3, 4 : le 4 glissé entre 2 et 2.1 devient 2.1, et les anciens 2.1, 2.2 passent à 2.2, 2.3. Le 2.1 glissé à trait plein entre 3 et 4 devient 4, l'ancien 4 passe à 5, et 2.2 reste ;
  - 3, 3.1 … 3.9 : un jeu glissé entre 3.3 et 3.4 fait passer la famille à 3.01 … 3.03 ; il devient 3.04, et les suivants 3.05 … 3.10.
- Un numéro changé s'affiche en couleur, l'ancien au survol.
- Un jeu sorti avant un jeu placé plus haut, sous-jeux compris, est signalé : fond rouge et icône d'alerte (au survol, le plus récent de ces jeux). Un jeu sans date de sortie n'est pas comparé. C'est un signal, pas une erreur : un spin-off sort souvent après la suite.
- Rien n'est enregistré avant « Valider » : une seule action, inactif tant qu'aucun numéro n'a changé.

### Gestion du backlog

- Ajouter au backlog : un jeu en base entre dans le backlog avec sa personnalisation et sa première version jouée, en une seule action. On y arrive après l'ajout d'un jeu avec « Ajouter à mon backlog », par un résultat de recherche « déjà en base », ou par « Ma base ».
- Ajouter une version jouée : entrée « Ajouter une version jouée » du menu Actions, la même fenêtre sans la personnalisation, sans version pré-sélectionnée. Un résultat de recherche d'un jeu déjà dans le backlog y mène aussi.
  - J'indique la version, parmi les versions en base, puis la plateforme parmi celles proposées (plateformes de la version, puis émulateurs de ces consoles). « Valider » reste inactif tant que les deux ne sont pas choisies.
  - La même fenêtre permet de pré-remplir toutes mes données de la version jouée : statut (liste filtrée par type de fin), à jouer bientôt, possédé, date de fin, fois fini (sûr et probable), temps relevé et estimé, note, commentaire et DLC faits. Par défaut : Pas commencé, cases décochées, compteurs et temps à 0, le reste vide. Le statut pré-rempli suit un changement du type de fin dans la personnalisation.
  - « Valider » applique les règles d'un changement de statut (section 6) : un statut de rang 5 ou plus passe « fois fini (sûr) » à 1 s'il est à 0, et la petite fenêtre propose la date de fin si elle est vide.
- Retirer : entrées « Retirer la version jouée » et « Retirer le jeu du backlog » du menu Actions. Retirer la dernière version jouée retire le jeu du backlog, avec sa personnalisation (section 5). Chaque retrait se confirme dans une petite fenêtre qui dit ce qu'il emporte : il n'y a pas d'annulation (section 10).

## 9. Vue Backlog (tableau principal)

Le backlog s'affiche dans un tableau : une ligne par jeu, dépliable selon les règles de la section 5, avec les colonnes de la section 7.

### Lignes simples et lignes dépliables

- Une ligne dépliable porte un chevron en début de ligne et un badge du nombre de versions jouées (« 3 », « 3 versions jouées » au survol). → la déplie, ← la replie.
- Une ligne simple n'a pas de chevron ; un espace vide garde l'alignement des colonnes.
- Les sous-lignes sont légèrement indentées, sur un fond plus discret que la ligne du jeu.

### Chargement

- Défilement infini par pages de 25 jeux : la page suivante se charge à l'approche du bas de page, avant de l'atteindre.
- Le serveur trie et filtre tout le backlog, puis le découpe en pages de 25. Pendant qu'une nouvelle vue se lit (tri ou filtre changé), la précédente reste affichée, estompée.

### DLC

- Chaque version jouée affiche « faits / total » ; un clic ouvre une petite fenêtre (popover) listant les DLC du jeu avec une case « fait » chacun.
- La ligne du jeu affiche « faits / total » en lecture seule, un DLC comptant comme fait s'il l'est sur au moins une version jouée.
- Sur une ligne à version jouée unique, la liste se coche directement depuis la ligne.
- En lecture seule, la liste se consulte ; en mode édition, les cases se cochent.
- En mode édition, le popover se termine par « Rechercher d'autres DLC ». Il ouvre une modale listant tous les DLC IGDB du jeu (IGDB les range sur le jeu, pas sur ses versions) : ceux en base sont cochés et grisés, les autres se cochent. « Valider », inactif tant que rien n'est coché, les ajoute au jeu, donc à toutes ses versions jouées, en une action ; on les coche ensuite « fait » dans le popover. Une version jouée d'un jeu sans DLC affiche alors un bouton « + » pour y accéder.
- Ce choix évite un troisième niveau de dépliage dans le tableau.

### Menu Actions

Un menu « 3 points verticaux » en fin de ligne regroupe les actions occasionnelles, pour alléger le tableau. Les interactions dans les cellules restent hors du menu : popover des DLC, clic sur la série, chevron, édition des statuts et des temps.

| Ligne | Entrées du menu |
| --- | --- |
| Ligne du jeu | Personnaliser · Réorganiser la série (jeu avec une série) · Modifier le jeu · Ajouter une version jouée · Ouvrir sur IGDB · Retirer le jeu du backlog (toutes ses versions jouées) |
| Sous-ligne de version jouée | Ouvrir la version sur IGDB · Retirer la version jouée |
| Ligne à version jouée unique | Le menu de la ligne du jeu ; « Retirer le jeu du backlog » y retire l'unique version jouée |

- « Ouvrir sur IGDB » reste disponible en lecture seule ; les autres entrées ne sont actives qu'en mode édition.
- Le menu, comme le popover des DLC, se ferme au clic à côté ou avec Échap.

### Header du tableau

- Le titre du tableau.
- Un bouton qui ouvre une petite modale pour gérer la visibilité de chaque colonne.
- Un bouton fixe (*sticky*) pour basculer en mode édition.
- De petites bulles explicatives, par exemple sur Type de fin et Statut pour rappeler la signification des valeurs.
- La barre du haut (titre, recherche IGDB, bouton « Ma base », bouton des colonnes, bouton du mode édition) reste fixe ; la page défile en largeur et les en-têtes du tableau restent visibles sous la barre.

### Lecture seule et édition

- Le tableau est en lecture seule par défaut.
- Le bouton du header bascule en mode édition.
- Retour automatique en lecture seule après 1 minute d'inactivité : ni mouvement de souris, ni clic, ni frappe, ni défilement.
- Une cellule en cours d'édition (le curseur dans un de ses champs de saisie) suspend ce minuteur ; une modale ouverte aussi. Les cases à cocher et les listes s'enregistrent tout de suite et ne le suspendent pas.
- Un champ s'enregistre quand on le quitte, ou avec Entrée. Une valeur invalide (ex. une note de 25) est refusée : le champ revient à l'ancienne valeur.

### Personnalisation de la vue

- Masquer / afficher les colonnes via des boutons. La colonne Actions ne peut pas être masquée : le menu disparaîtrait.
- Réorganiser l'ordre des colonnes, avec les boutons monter et descendre de la modale de visibilité (sans glisser-déposer).
- Sauvegarder la disposition et la visibilité des colonnes dans le `localStorage`.

### Tri et filtres

- Tri multi-colonnes : flèche de direction et indicateur numérique de priorité. Un clic sur un en-tête fait défiler croissant, décroissant, puis plus de tri sur cette colonne ; chaque nouvelle colonne passe après les autres.
- Les lignes des jeux se trient sur ce qu'elles affichent, leurs sous-lignes restent rattachées à leur jeu, et les cases vides passent en dernier.
- Filtre disponible sur chaque colonne, dans une ligne sous les en-têtes : « contient » pour les textes (nom VF ou VO, série, sociétés, commentaire) ; une liste de valeurs pour le type de fin, le statut et la plateforme ; oui ou non pour les cases à cocher ; un minimum et un maximum pour les nombres, les dates et les temps, dans un popover ouvert depuis la ligne des filtres (le bouton résume les bornes). La miniature et les actions n'en ont pas.
- Un jeu reste affiché si sa ligne ou au moins une de ses versions jouées correspond aux filtres (ex. Plateforme = PS4 garde les jeux qui ont une version jouée PS4) ; déplié, il montre toutes ses versions jouées.
- Un clic sur un nom de série filtre le tableau sur les jeux de cette série (valeur exacte).
- Dès qu'un filtre est actif, le bouton « Effacer tous les filtres », au début de la ligne des filtres, les retire tous d'un coup ; le résumé au-dessus du tableau compte les jeux affichés et les filtres actifs.
- Paramètres de tri et de filtre persistés dans l'URL.
- Une colonne masquée est retirée du tri dans l'URL et de la recherche.
- Une URL qui trie sur une colonne masquée voit ce tri ignoré.

### Apparence et clavier

- **Thème** : clair ou sombre selon le réglage du système (`prefers-color-scheme`), sans bouton ni état en plus. Police Inter (Google Fonts), chiffres tabulaires dans le tableau.
- **Composants maison** (section 4) à la place des contrôles du navigateur : listes déroulantes, cases et interrupteurs, popovers, menus, info-bulles (à la place de `title`), modales, champ date avec calendrier.
- **Tableau resserré** : un en-tête bien plus large que ses valeurs devient un mot court ou une icône (N°, Sortie, Relevé / Estimé / Total, À jouer bientôt, Possédé, Miniature), le libellé complet restant en info-bulle et pour les lecteurs d'écran. En mode édition, les champs se lisent comme la valeur (cadre au survol et au focus) et restent presque aussi étroits qu'elle : basculer de mode élargit à peine le tableau (une centaine de pixels en tout, surtout la date de fin, les fois fini et la note).
- **Lecture** : statuts en pastilles colorées avec icône, notes teintées selon la valeur, DLC avec une jauge, logos des sociétés sur une plaque claire. En lecture seule, une case vraie s'affiche en icône, une case fausse reste vide.
- **Défilement horizontal** : la colonne du chevron, la miniature (quand elle précède le nom) et le nom restent collés à gauche.
- **Clavier** : « / » met le curseur dans la recherche ; ↓, ↑ et Entrée parcourent et choisissent les résultats (recherche IGDB, « Ma base ») ; une liste déroulante s'ouvre avec ↓, Entrée ou Espace, se parcourt aux flèches et à la frappe ; le menu Actions s'ouvre aussi avec ↓ et se parcourt aux flèches ; Alt+↓ ouvre le calendrier d'un champ date. Les modales gardent le focus (Tab boucle) et le rendent à l'élément d'origine à la fermeture.

## 10. Idées mises de côté et écartées

### Pour plus tard

- Synchronisation des données globales avec IGDB (logo d'un studio modifié, date de sortie fixée pour un jeu à venir).
- Jeux épisodiques (type Telltale), à traiter comme un jeu complet et unique.
- Annuler / rétablir : `Ctrl+Z` et `Ctrl+Y` sur les 20 dernières actions, avec deux boutons dans la barre du haut. Une action est une modification de la base (champ enregistré, case cochée, statut changé avec son « fois fini » automatique, ajout, retrait, « Personnaliser », « Réorganiser la série », « Modifier le jeu » ou « Rechercher d'autres DLC » validé) ; ni le tri, ni les filtres, ni les colonnes. Dans un champ texte, `Ctrl+Z` reste celui du navigateur. Chaque annulation envoie l'opération inverse au serveur. À faire avec les comptes : l'historique est propre à chaque utilisateur. En attendant, un retrait se confirme.
- Affichage du tableau : toutes les lignes chargées se redessinent à chaque rendu (frappe dans la recherche, popover, modale). Si besoin : ne redessiner que les lignes concernées (lignes mémorisées, actions stables, popover transmis à sa seule ligne).
- DLC choisis par utilisateur : les DLC choisis vont en base, rattachés au jeu, comme les versions. À plusieurs utilisateurs, un DLC ajouté par l'un compterait dans le « total » de l'autre ; il faudra une sélection des DLC suivis par utilisateur.
- Retirer des versions ou des DLC de la base par « Modifier le jeu » : à cadrer, car une version porte des versions jouées et un DLC des cases « fait ». On ne peut qu'en ajouter.
- Émulateurs supplémentaires : DuckStation (PS1), PPSSPP (PSP), Vita3K (PS Vita), Dolphin (GameCube et Wii), Cemu (Wii U), Ryujinx (Switch), Azahar, ex-Citra (3DS), melonDS (DS), mGBA (GBA), Project64 (N64), xemu (Xbox), Xenia (Xbox 360), Flycast (Dreamcast). Un émulateur comme Dolphin émule plusieurs consoles : il faudra pouvoir le rattacher à chacune. Seuls PCSX2 (PS2) et RPCS3 (PS3) sont en base.
- Plusieurs développeurs et éditeurs par jeu : IGDB renvoie des listes (`involved_companies`). Toutes les valeurs seront stockées et affichées dans leur cellule (un logo au-dessus de chaque société). On n'en garde qu'une par colonne (règle en section 3) : ce choix reste à corriger ou à préciser.
- Séries créées par utilisateur : la série choisie est personnelle (jeu du backlog), mais une série créée à la main, comme *Souls*, est rangée en base globale avec les séries IGDB. À plusieurs utilisateurs, chacun devra avoir ses propres séries.
- À surveiller : les éditions qu'IGDB classe en « Bundle ». On prend comme version tout bundle rattaché à un jeu par `version_parent` (*Skyrim Legendary Edition*, éditions de *GTA V*) et ignore les autres, même quand ils ne contiennent qu'un jeu et ses DLC (*FF7 Remake Intergrade*, seulement listé dans `bundles` du jeu). Vérifier la règle sur plus de jeux et traiter ces cas.

### Écartées

Trace des idées qui ne seront pas faites.

- Tableau séparé « Jeux finis ».
- Wishlist.
- Compteur de succès (x / x).
- Griser les jeux ignorés.
- Support des langues (colonne « Français » : interface, sous-titres, audio).
- Bundles : regrouper plusieurs jeux sous une même fiche.
- Champ « Origine » distinct (vu mais pas fait, abonnement, émulation, officiel, gratuit).
- Ajout manuel d'un jeu.
- Modifier ou nettoyer les données IGDB avant de les enregistrer (la série se choisit sur le jeu du backlog, section 8).
- Choisir à l'ajout les jeux de la série à importer.
- Colonne Franchise : doublon de la série dans la plupart des cas (section 3).
- Nom VF des séries : IGDB n'en a pas, et une saisie à la main n'est pas voulue.
- Donner une série à un jeu seul, avec son propre nom (habitude du Google Sheet) : la série est facultative.
- Colonne « Jeux liés ».
- Stocker les images elles-mêmes (base64 ou fichiers).
- Stocker les noms alternatifs : seuls les noms VO et VF sont gardés.
- Dupliquer une version jouée pour cumuler les stats de plusieurs comptes.
- External games / external game sources d'IGDB.

## Sources

- [igdb-api-types](https://github.com/DmitryScaletta/igdb-api-types) : types générés depuis la documentation IGDB (champs, dépréciations, types de jeu).
- [respawn-social-api](https://github.com/stormwarning/respawn-social-api) : CORS, token côté serveur, limite de 4 requêtes par seconde.
- [IGDB-API-JVM](https://github.com/husnjak/IGDB-API-JVM) : construction des URL d'images à partir de l'`image_id`.
- [Backloggd, changelog 1.17](https://backloggd.com/changelog/1_17_0) : éditions *GOTY* enregistrées comme bundles dans IGDB.
- [Documentation IGDB](https://api-docs.igdb.com)
