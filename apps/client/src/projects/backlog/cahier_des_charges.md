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
- **Étape suivante** : un POC React sans base ni serveur applicatif, branché sur les vraies données IGDB (section 4).

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

Le POC ne garde qu'une série, un développeur et un éditeur par jeu (section 11) ; pour chaque rôle, la première société.

- **Série proposée** : la collection la plus large, c'est-à-dire la première qui n'a pas de collection parente parmi celles du jeu (*Crisis Core* est dans *Compilation of Final Fantasy VII*, *Final Fantasy* et *Final Fantasy VII* : on garde *Final Fantasy*). Sans collection, la franchise principale (`franchise`), sinon la première de `franchises` (*Aperture Desk Job* → *Portal*). Sinon, pas de série : un jeu seul n'en a pas.
- **Pas de franchise** : une collection IGDB est une suite de jeux, structurée (sous-séries, spin-offs) ; une franchise n'est qu'une étiquette d'univers, deux fois moins renseignée, qui reprend le plus souvent le nom de la série. Elle ne sert qu'à proposer une série à défaut de collection, et n'est pas stockée en tant que telle.
- **Un seul nom** : le nom IGDB de la série. IGDB n'a pas de nom alternatif pour les séries, donc pas de nom VF.
- IGDB ne donne aucun ordre dans une série : le numéro dans la série se choisit à la main (section 8).

## 4. Architecture des données

Le POC simule la base dans l'état React mais interroge les vraies données IGDB ; ses types ont déjà la forme de la future base.

### POC

- Application React en TypeScript, sans base ni serveur applicatif.
- Base simulée dans des `useState`, manipulée de façon synchrone : pas de simulation d'asynchrone.
- Recherche et import sur les vraies données IGDB, pour corriger en direct les incompatibilités. Les appels passent par le proxy du serveur de développement (Vite), qui ajoute le Client-ID et le token ; ces identifiants restent dans un `.env` non versionné.
- Saisie de recherche temporisée (*debounce*) pour rester sous 4 requêtes par seconde.
- Pas de notion d'utilisateur.

### Organisation du code (6 fichiers)

| Fichier | Contenu |
| --- | --- |
| `index.tsx` | Composant principal : états, tableau, modales, footer de debug |
| `backlog.module.scss` | Styles (module SCSS) |
| `types.ts` | Tous les types, exportés, calqués sur les futures tables, dont le type `AppState` de l'état complet |
| `initialState.ts` | L'objet `initialState`, très fortement typé, qui regroupe les valeurs initiales de tous les `useState` |
| `mappers.ts` | Tous les mappers : réponses IGDB → types de la base ; base → lignes du tableau |
| `utils.ts` | Toutes les autres fonctions : appels IGDB, calculs, agrégats, tri, filtres, URL d'images |

Les fichiers de configuration (`vite.config.ts`, `.env`) et le dossier d'icônes de plateformes ne comptent pas dans les 6.

### Consignes pour le code du POC

- **Types calqués sur la base** : un type par future table (jeu, version, plateforme, DLC, série, société… ; jeu du backlog `user_games`, version jouée `user_versions`, DLC fait `done_dlcs`), avec les mêmes noms de champs.
- **Données normalisées** : les relations passent par des identifiants (`gameId`, `platformId`…), sans objets imbriqués ni données copiées d'une entité à l'autre.
- **Valeurs calculées jamais stockées** : tout ce qu'affiche la ligne du jeu (meilleur statut, sommes, dates, « faits / total » des DLC) et le temps total.
- **Reconstruction pour l'affichage** : les mappers transforment la base simulée en lignes de tableau (ligne du jeu + sous-lignes de versions jouées).
- **Langue** : tout le code est en anglais (types, champs, variables, valeurs des listes fermées). Les libellés d'interface sont en français, écrits en dur dans le code, sans système de traduction.
- **Pictos d'interface** (chevron, menu, flèches de tri) : des emojis, sans bibliothèque d'icônes.

### Export et réimport de l'état

Le bouton de debug permet de sauvegarder l'état malgré la perte au rechargement.

- Il copie dans le presse-papiers le contenu complet de `initialState.ts` : un seul objet regroupant tous les états (données et interface) : tout ce que l'utilisateur voit ou choisit (recherche et résultats, modale ouverte avec ses données et ses choix en cours, mode édition, lignes dépliées, colonnes, tri, filtres, popover). Sont exclus l'historique d'annulation et les états passagers (chargement en cours, erreur réseau, minuteurs).
- Cette copie se colle telle quelle dans `initialState.ts` ; chaque `useState` part ensuite de sa clé dans cet objet.
- `initialState` est vérifié contre `AppState` (`satisfies AppState`) : aucun `any`, statuts, types de fin et autres listes fermées en unions de littéraux.
- Tout l'état est sérialisable en JSON : dates en chaînes ISO (`"2026-10-21"`), `null` plutôt que `undefined`, ni `Date`, ni `Map`, ni `Set`. Sinon, la copie collée ne passe plus le typage.
- Au départ, `initialState` ne contient que les consoles émulées et leurs émulateurs. Les autres plateformes s'ajoutent en base à l'import du premier jeu qui en a besoin.
- Au démarrage, le tri et les filtres présents dans l'URL, et la disposition des colonnes sauvegardée dans le `localStorage`, priment sur `initialState`.

### Footer de debug (POC)

- Dernier jeu ajouté.
- Nombre de jeux, de versions et de DLC en base.
- Nombre de jeux et de versions jouées dans le backlog.
- Nombre d'actions dans l'historique d'annulation, et à rétablir.
- Tri et filtres actifs.
- Le bouton d'export de l'état.

### Plateformes et icônes

- Chaque plateforme, émulateurs compris, est stockée avec un nom et un nom technique. Le nom est l'abréviation IGDB (`abbreviation`, ex. « PS2 »), ou le nom complet (`name`) quand elle manque. Le nom technique est le `slug` IGDB (ex. `ps2`, `win`, `ps4--1`) ; pour un émulateur, un slug choisi à la main (ex. `pcsx2`).
- Émulateurs du POC : PCSX2 (PS2) et RPCS3 (PS3), chacun rattaché à une seule console (liste complète en section 11).
- Le front embarque les icônes en dur, chaque fichier nommé par le nom technique de sa plateforme (ex. `ps2.svg`).
- Une plateforme sans icône affiche son nom.

### Après le POC

- **Une seule base**, découpée en deux groupes de tables :
  - **Base globale (données IGDB)** : données de référence, partagées. Elle ne contient que ce qui sert à l'affichage (section 3), dont la série proposée par IGDB, plus les séries créées à la main. Chaque version y est stockée une seule fois, avec la liste de ses plateformes et de ses dates de sortie : aucune donnée n'y est dupliquée par plateforme.
  - **Base utilisateur** : toutes les données de l'utilisateur. Les jeux du backlog (`user_games`) portent sa personnalisation : miniature, type de fin, série et numéro dans la série. Les versions jouées (`user_versions`) portent ses données de jeu ; c'est là seulement que la plateforme les distingue. Les DLC faits (`done_dlcs`) les complètent.
- **Serveur obligatoire** entre le front et IGDB : IGDB refuse les appels depuis un navigateur, son token doit rester côté serveur et l'API est limitée à 4 requêtes par seconde.
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
| Série | Facultative. Proposée par IGDB (section 3) et choisie pour chaque jeu du backlog : la proposée, une autre série, une série créée à la main ou aucune ; un clic sur son nom filtre le tableau | *Grand Theft Auto* ; *Souls*, créée à la main pour *Dark Souls*, *Sekiro* et *Elden Ring* |

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
- **DLC comme jeu** : IGDB ne distingue pas une extension vendue seule d'une autre (*TLAD* et *TBOGT* y sont des extensions de *GTA IV*, comme les season pass). Dans la modale du jeu, chaque DLC peut donc aussi être coché « 🧩 comme jeu » : il est ensuite ajouté comme jeu à part, sa fiche devenant sa version originale. Les deux cases sont indépendantes : *TLAD* peut être jeu à part et DLC de *GTA IV* en même temps, sans conflit. On peut donc changer d'avis : retirer *TLAD* du backlog, l'ajouter aux DLC de *GTA IV* et le cocher fait.
- **Pas de bundle** : un produit qui regroupe plusieurs jeux n'est pas modélisé. Chaque jeu qu'il contient s'ajoute séparément : la recherche mène d'un bundle à ses jeux (section 8). Exception : un bundle qu'IGDB rattache à un jeu par `version_parent` est une édition de ce jeu vendue avec ses DLC (ex. *Skyrim Legendary Edition*) ; il compte comme une version.
- **Versions choisies** : la modale d'ajout propose toutes les versions qu'IGDB rattache au jeu, et seules celles cochées sont enregistrées. Le backlog est personnel : inutile de stocker des éditions qu'on ne jouera jamais.
- **Jeu original toujours en base** : sa version originale est toujours enregistrée, cochée d'office et non décochable, car elle porte l'id et la page IGDB du jeu. Les autres versions sont décochées à l'ouverture.
- **Titre d'une version** : la version originale affiche le nom du jeu. Une autre version prend son `version_title`, sinon son nom IGDB s'il diffère de celui du jeu (*The Last of Us Remastered*). Sinon, IGDB ne la distingue pas de l'originale : elle prend son type et l'année de sa première sortie, toutes plateformes confondues. Les types sont Portage, Remaster, Version enrichie, et Édition pour le reste ; ex. *Portage 1998* pour *FF7* sur PC, *Édition 2015* pour l'édition PS4 / PS5 de *GTA V*, qui a aussi une date PC de 2015 sur IGDB.

### Affichage replié / déplié

- **Une seule version jouée** : la ligne est simple, non dépliable. Elle affiche cette version jouée (version et plateforme) et ses données se modifient directement sur la ligne. Miniature : l'image choisie à l'ajout au backlog ; nom : celui du jeu, avec le titre de la version en dessous si ce n'est pas l'original ; date de sortie : la date originale du jeu.
- **Plusieurs versions jouées** : la ligne affiche le jeu original (nom, date de sortie originale), plateforme vide, et les agrégats des versions jouées. Elle se déplie en une sous-ligne par version jouée, où se modifient ses données.
- **Agrégats** : la ligne du jeu montre le total, le meilleur, le plus ancien… selon la colonne (section 7). Quand il est impossible de choisir une valeur, la case reste vide.
- **Personnalisation** : le type de fin, la série et le numéro dans la série, choisis à l'ajout au backlog et modifiables par « Personnaliser » (section 8), s'affichent en lecture seule dans le tableau.
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
| Série | Jeu du backlog | Proposée par IGDB, choisie à l'ajout au backlog | Nom, vide sans série ; ✏️ si ce n'est pas celle proposée par IGDB (au survol : celle d'IGDB) ; un clic filtre le tableau sur cette série |  |
| N° dans la série | Jeu du backlog | Choisi à l'ajout au backlog | Numéro, en lecture seule ; vide sans série |  |
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
- **Formats** : temps stockés en minutes entières, saisis en heures et minutes, affichés « 12 h 30 » ; note entière de 0 à 20 ; numéro dans la série positif ou nul, décimal possible (ex. 0 pour *Resident Evil 0*, 2.5) ; compteurs « fois fini » entiers, à partir de 0.
- **Zéros** : un temps ou un compteur « fois fini » à zéro, sa valeur par défaut, s'affiche estompé (« 0 h 00 », « 0 ») pour laisser ressortir les valeurs saisies. Une note de 0, choisie, s'affiche normalement.

## 8. Ajout d'un jeu et gestion du backlog

Rien n'est enregistré avant « Valider ». Un ajout standard : clic sur un résultat, « Valider » ; dans l'ajout au backlog qui s'ouvre, vérification du type de fin (Histoire par défaut), cover pré-sélectionnée, choix de la plateforme, et « Valider ».

### Ajout depuis IGDB

1. **Recherche** : une barre de recherche connectée à IGDB, y compris dans le POC.
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
   - Les DLC à enregistrer (section 5) : tous cochés à l'ouverture. Chacun a aussi une case « 🧩 comme jeu », indépendante.
4. **Validation** : « Valider » enregistre le jeu, sa version originale, les versions cochées, les DLC cochés et la série proposée par IGDB, qui reste attachée au jeu pour le ✏️ et « ↩️ Série IGDB ».
5. **Ajout au backlog** : une case « Ajouter à mon backlog », cochée par défaut, à côté de « Valider ».
   - Cochée, « Valider » enregistre le jeu puis ouvre l'ajout au backlog (Gestion du backlog), avec les images déjà lues sur IGDB. La version originale y est pré-sélectionnée si c'est la seule version cochée ; sinon, aucune.
   - Ce sont deux actions distinctes (section 10). Annuler l'ajout au backlog laisse le jeu en base, hors du backlog.
   - Décochée, le jeu entre en base seulement ; il reviendra dans le backlog par « 📚 En base ».
6. **DLC comme jeu** : après « Valider », et après l'ajout au backlog s'il a lieu, la modale d'ajout de chaque DLC coché « 🧩 comme jeu » s'ouvre à son tour, dans l'ordre de la liste. Chacune a sa propre case « Ajouter à mon backlog », et ses propres DLC « comme jeu » passent avant les suivants. Annuler une modale de l'enchaînement, ou Échap, passe à la suivante. La case est grisée pour un DLC déjà en base comme jeu.

### Ajout depuis la base

Un jeu déjà en base (retiré du backlog, ou ajouté sans « Ajouter à mon backlog ») revient dans le backlog sans relire ses données IGDB : seules ses images sont relues, pour le choix de la miniature.

- La barre de recherche a deux sources : « 🌐 IGDB », par défaut, et « 📚 En base ». Changer de source relance la saisie en cours sur la nouvelle source.
- Sur « En base », la recherche porte sur le nom VO, le nom VF et les titres des versions des jeux en base, sans tenir compte des accents ni des majuscules, sans requête IGDB. Les résultats s'affichent tout de suite, triés par nom, au même format que ceux d'IGDB (image choisie à l'ajout au backlog, sinon la cover de l'original ; plateformes de toutes les versions) ; ceux qui sont déjà dans le backlog sont signalés.
- Choisir un résultat ouvre l'ajout au backlog, avec la version originale pré-sélectionnée.

### Modification d'un jeu

- « Modifier le jeu » complète le jeu en base : ses versions et ses DLC. Les choix personnels se font par « Personnaliser ».
- La modification rouvre la modale du jeu : données IGDB en lecture seule, puis « Valider », en une seule action. Le jeu est relu sur IGDB à l'ouverture : les versions et DLC absents de la base. Les autres données viennent de la base ; la série proposée reste celle de l'ajout.
- Les versions et DLC déjà en base sont cochés et grisés ; les autres sont décochés, à cocher pour les ajouter. On ne peut pas en retirer. Les DLC y ont aussi leur case « 🧩 comme jeu », avec le même enchaînement qu'à l'ajout.
- Un formulaire d'édition ne se valide jamais sans modification : « Valider » reste inactif tant qu'aucune version ni aucun DLC n'est coché en plus et qu'aucun DLC n'est coché « comme jeu ». Avec seulement des DLC « comme jeu », la base ne change pas : pas d'action, l'enchaînement s'ouvre directement.
- On y accède par l'entrée « Modifier le jeu » du menu Actions (section 9).

### Personnalisation d'un jeu du backlog

Les choix personnels d'un jeu du backlog, faits à l'ajout au backlog, puis modifiables par « Personnaliser » :

- L'image de la miniature, parmi la cover et les artworks, relus sur IGDB à l'ouverture ; à l'ajout, la cover est pré-sélectionnée. En attendant IGDB, ou s'il échoue, seule l'image déjà choisie est proposée ; elle le reste même si IGDB ne l'a plus.
- Le type de fin du jeu (section 6) ; Histoire par défaut.
- La série : celle proposée par IGDB, en tête de liste et pré-sélectionnée ; « Aucune » ; une autre série de la base ; ou « ➕ Nouvelle série… », qui demande un nom (« Valider » reste inactif tant qu'il est vide). Un nom déjà pris, sans tenir compte des accents ni des majuscules, désigne la série existante. Hors de la série d'IGDB, « ↩️ Série IGDB » y ramène.
- Le numéro du jeu dans sa série, si le jeu en a une ; sans série, il est effacé à « Valider ».
- Une série qu'aucun jeu ne propose et qu'aucun jeu du backlog n'a choisie quitte la base : une série créée à la main part avec son dernier jeu.
- « Personnaliser » : entrée du menu Actions, une seule action à « Valider », inactif tant que rien n'a changé. Changer le type de fin peut rendre incompatible le statut d'une version jouée : Fini devient Estimé fini et inversement, Vu sans jouer devient Pas commencé.

### Gestion du backlog

- Ajouter au backlog : un jeu en base entre dans le backlog avec sa personnalisation et sa première version jouée, en une seule action. On y arrive après l'ajout d'un jeu avec « Ajouter à mon backlog », ou par un résultat de recherche « déjà en base ».
- Ajouter une version jouée : entrée « Ajouter une version jouée » du menu Actions, la même fenêtre sans la personnalisation, sans version pré-sélectionnée. Un résultat de recherche d'un jeu déjà dans le backlog y mène aussi.
  - J'indique la version, parmi les versions en base, puis la plateforme parmi celles proposées (plateformes de la version, puis émulateurs de ces consoles). « Valider » reste inactif tant que les deux ne sont pas choisies.
  - La même fenêtre permet de pré-remplir toutes mes données de la version jouée : statut (liste filtrée par type de fin), à jouer bientôt, possédé, date de fin, fois fini (sûr et probable), temps relevé et estimé, note, commentaire et DLC faits. Par défaut : Pas commencé, cases décochées, compteurs et temps à 0, le reste vide. Le statut pré-rempli suit un changement du type de fin dans la personnalisation.
  - « Valider » applique les règles d'un changement de statut (section 6) : un statut de rang 5 ou plus passe « fois fini (sûr) » à 1 s'il est à 0, et la petite fenêtre propose la date de fin si elle est vide.
- Retirer : entrées « Retirer la version jouée » et « Retirer le jeu du backlog » du menu Actions. Retirer la dernière version jouée retire le jeu du backlog, avec sa personnalisation (section 5). Les retraits se font sans confirmation : `Ctrl+Z` les annule (section 10).

## 9. Vue Backlog (tableau principal)

Le backlog s'affiche dans un tableau : une ligne par jeu, dépliable selon les règles de la section 5, avec les colonnes de la section 7.

### Lignes simples et lignes dépliables

- Une ligne dépliable porte un chevron en début de ligne et un badge du nombre de versions jouées (ex. « 3 versions jouées »).
- Une ligne simple n'a pas de chevron ; un espace vide garde l'alignement des colonnes.
- Les sous-lignes sont légèrement indentées, sur un fond plus discret que la ligne du jeu.

### Chargement

- Défilement infini par pages de 25 jeux : la page suivante se charge à l'approche du bas de page, avant de l'atteindre.
- Dans le POC, le tri et les filtres portent sur tout le backlog, en mémoire ; le défilement infini découpe ensuite le résultat par pages de 25. Après le POC, ils s'appliqueront page par page, côté serveur.

### DLC

- Chaque version jouée affiche « faits / total » ; un clic ouvre une petite fenêtre (popover) listant les DLC du jeu avec une case « fait » chacun.
- La ligne du jeu affiche « faits / total » en lecture seule, un DLC comptant comme fait s'il l'est sur au moins une version jouée.
- Sur une ligne à version jouée unique, la liste se coche directement depuis la ligne.
- En lecture seule, la liste se consulte ; en mode édition, les cases se cochent.
- En mode édition, le popover se termine par « 🔍 Rechercher d'autres DLC ». Il ouvre une modale listant tous les DLC IGDB du jeu (IGDB les range sur le jeu, pas sur ses versions) : ceux en base sont cochés et grisés, les autres se cochent. « Valider », inactif tant que rien n'est coché, les ajoute au jeu, donc à toutes ses versions jouées, en une action ; on les coche ensuite « fait » dans le popover. Une version jouée d'un jeu sans DLC affiche alors « ➕ » pour y accéder.
- Ce choix évite un troisième niveau de dépliage dans le tableau.

### Menu Actions

Un menu « 3 points verticaux » en fin de ligne regroupe les actions occasionnelles, pour alléger le tableau. Les interactions dans les cellules restent hors du menu : popover des DLC, clic sur la série, chevron, édition des statuts et des temps.

| Ligne | Entrées du menu |
| --- | --- |
| Ligne du jeu | Personnaliser · Modifier le jeu · Ajouter une version jouée · Ouvrir sur IGDB · Retirer le jeu du backlog (toutes ses versions jouées) · Logger cette ligne (POC) |
| Sous-ligne de version jouée | Ouvrir la version sur IGDB · Retirer la version jouée · Logger cette ligne (POC) |
| Ligne à version jouée unique | Le menu de la ligne du jeu ; « Retirer le jeu du backlog » y retire l'unique version jouée |

- « Ouvrir sur IGDB » et « Logger cette ligne » restent disponibles en lecture seule ; les autres entrées ne sont actives qu'en mode édition.
- « Logger cette ligne » affiche dans la console le jeu, sa personnalisation, ses versions et ses versions jouées tels qu'ils sont stockés ; sur une sous-ligne, seulement cette version jouée et sa version.
- Le menu, comme le popover des DLC, se ferme au clic à côté ou avec Échap.

### Header du tableau

- Le titre du tableau.
- Un bouton qui ouvre une petite modale pour gérer la visibilité de chaque colonne.
- Un bouton fixe (*sticky*) pour basculer en mode édition.
- De petites bulles explicatives, par exemple sur Type de fin et Statut pour rappeler la signification des valeurs.
- La barre du haut (titre, recherche, flèches annuler / rétablir, bouton des colonnes, bouton du mode édition) reste fixe ; la page défile en largeur et les en-têtes du tableau restent visibles sous la barre.

### Lecture seule et édition

- Le tableau est en lecture seule par défaut.
- Le bouton du header bascule en mode édition.
- Retour automatique en lecture seule après 1 minute d'inactivité : ni mouvement de souris, ni clic, ni frappe, ni défilement.
- Une cellule en cours d'édition (le curseur dans un de ses champs de saisie) suspend ce minuteur ; une modale ouverte aussi. Les cases à cocher et les listes s'enregistrent tout de suite et ne le suspendent pas.
- Un champ s'enregistre quand on le quitte, ou avec Entrée. Une valeur invalide (ex. une note de 25) est refusée : le champ revient à l'ancienne valeur.

### Personnalisation de la vue

- Masquer / afficher les colonnes via des boutons. La colonne Actions ne peut pas être masquée : le menu disparaîtrait.
- Réorganiser l'ordre des colonnes, avec ⬆️ et ⬇️ dans la modale de visibilité (sans glisser-déposer).
- Sauvegarder la disposition et la visibilité des colonnes dans le `localStorage`.

### Tri et filtres

- Tri multi-colonnes : flèche de direction et indicateur numérique de priorité. Un clic sur un en-tête fait défiler ⬆️, ⬇️, puis plus de tri sur cette colonne ; chaque nouvelle colonne passe après les autres.
- Les lignes des jeux se trient sur ce qu'elles affichent, leurs sous-lignes restent rattachées à leur jeu, et les cases vides passent en dernier.
- Filtre disponible sur chaque colonne, dans une ligne sous les en-têtes : « contient » pour les textes (nom VF ou VO, série, sociétés, commentaire) ; une liste de valeurs pour le type de fin, le statut et la plateforme ; oui ou non pour les cases à cocher ; un minimum et un maximum pour les nombres, les dates et les temps. La miniature et les actions n'en ont pas.
- Un jeu reste affiché si sa ligne ou au moins une de ses versions jouées correspond aux filtres (ex. Plateforme = PS4 garde les jeux qui ont une version jouée PS4) ; déplié, il montre toutes ses versions jouées.
- Un clic sur un nom de série filtre le tableau sur les jeux de cette série (valeur exacte).
- Dès qu'un filtre est actif, « 🧹 Effacer », au début de la ligne des filtres, les retire tous d'un coup.
- Paramètres de tri et de filtre persistés dans l'URL.
- Une colonne masquée est retirée du tri dans l'URL et de la recherche.
- Une URL qui trie sur une colonne masquée voit ce tri ignoré.

## 10. Annuler / rétablir

- `Ctrl+Z` annule et `Ctrl+Y` rétablit, sur les 20 dernières actions.
- À la souris, les flèches ↩️ et ↪️ de la barre du haut font de même ; elles sont grisées quand il n'y a rien à annuler ou à rétablir.
- Une action est une modification de la base : un champ enregistré, une case cochée, un statut changé (avec son « fois fini » automatique), un DLC coché, un ajout validé (jeu ; ajout au backlog avec sa première version jouée), un retrait, « Personnaliser » ou « Modifier le jeu » validé, des DLC ajoutés par « Rechercher d'autres DLC ». La date de fin validée dans la petite fenêtre est une action distincte.
- Les changements d'interface ne sont pas des actions : tri, filtres, colonnes, lignes dépliées, mode édition.
- Quand le curseur est dans un champ texte, `Ctrl+Z` reste l'annulation du navigateur dans ce champ.
- L'annulation marche aussi en lecture seule ; pendant qu'une modale est ouverte, les raccourcis sont ignorés. Sur Mac, `⌘` vaut `Ctrl`.
- L'historique vit en mémoire et se perd au rechargement de la page.
- Après le POC, chaque annulation ou rétablissement relance une requête API ; dans le POC, il met simplement à jour l'état.

## 11. Idées mises de côté et écartées

### Pour plus tard

- Synchronisation des données globales avec IGDB (logo d'un studio modifié, date de sortie fixée pour un jeu à venir).
- Jeux épisodiques (type Telltale), à traiter comme un jeu complet et unique.
- Affichage du tableau : dans le POC, les lignes ne se recalculent que quand la base, le tri ou les filtres changent, mais toutes les lignes chargées se redessinent à chaque rendu (frappe dans la recherche, popover, modale). Ensuite, si besoin : ne redessiner que les lignes concernées (lignes mémorisées, actions stables, popover transmis à sa seule ligne), puis réutiliser les lignes inchangées pour qu'une modification ne redessine que la sienne. Tri et filtres côté serveur, page par page, réduiront déjà ce travail.
- DLC choisis par utilisateur : dans le POC, les DLC choisis vont en base, rattachés au jeu, comme les versions. À plusieurs utilisateurs, un DLC ajouté par l'un compterait dans le « total » de l'autre ; il faudra une sélection des DLC suivis par utilisateur.
- Retirer des versions ou des DLC de la base par « Modifier le jeu » : à cadrer, car une version porte des versions jouées et un DLC des cases « fait ». Le POC ne permet que d'en ajouter.
- Émulateurs supplémentaires : DuckStation (PS1), PPSSPP (PSP), Vita3K (PS Vita), Dolphin (GameCube et Wii), Cemu (Wii U), Ryujinx (Switch), Azahar, ex-Citra (3DS), melonDS (DS), mGBA (GBA), Project64 (N64), xemu (Xbox), Xenia (Xbox 360), Flycast (Dreamcast). Un émulateur comme Dolphin émule plusieurs consoles : il faudra pouvoir le rattacher à chacune. Le POC n'embarque que PCSX2 (PS2) et RPCS3 (PS3).
- Plusieurs développeurs et éditeurs par jeu : IGDB renvoie des listes (`involved_companies`). Toutes les valeurs seront stockées et affichées dans leur cellule (un logo au-dessus de chaque société). Le POC n'en garde qu'une par colonne (règle en section 3) : ce choix reste à corriger ou à préciser.
- Séries créées par utilisateur : la série choisie est personnelle (jeu du backlog), mais une série créée à la main, comme *Souls*, est rangée en base globale avec les séries IGDB. À plusieurs utilisateurs, chacun devra avoir ses propres séries.
- À surveiller : les éditions qu'IGDB classe en « Bundle ». Le POC prend comme version tout bundle rattaché à un jeu par `version_parent` (*Skyrim Legendary Edition*, éditions de *GTA V*) et ignore les autres, même quand ils ne contiennent qu'un jeu et ses DLC (*FF7 Remake Intergrade*, seulement listé dans `bundles` du jeu). Vérifier la règle sur plus de jeux et traiter ces cas.

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
