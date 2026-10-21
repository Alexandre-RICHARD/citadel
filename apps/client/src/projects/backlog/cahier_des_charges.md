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
| Nom VF | Colonne Nom, recherche | `game_localizations` (un nom par région), sinon `alternative_names` ; repli sur le nom VO |
| Noms alternatifs | Recherche, prévisualisation à l'ajout | `alternative_names` (nom + commentaire) |
| Image | Miniature, choisie à l'ajout | `cover`, `artworks` → `image_id` |
| Page IGDB | Entrée « Ouvrir sur IGDB » du menu Actions | `url` |
| Date de sortie | Colonne Date de sortie | `first_release_date` ; `release_dates` par plateforme |
| Statut de sortie | Mention « à venir » ou « annulé » | `game_status` |
| Plateformes | Plateformes de chaque version (nom et nom technique) ; choix de la plateforme d'une variante | `platforms` |
| Type de fiche | Distinguer jeu, version, remake, DLC, standalone ; exclure les bundles de la recherche | `game_type` |
| Versions | Toutes les versions, récupérées à l'ajout | `version_parent`, `version_title`, `remasters`, `ports`, `expanded_games` |
| DLC | Colonne DLC | `dlcs`, `expansions` ; `parent_game` côté DLC |
| Extensions standalone | Jeux distincts | `standalone_expansions` |
| Série | Colonne Série | `collections` |
| Franchise | Colonne Franchise ; un clic filtre le tableau | `franchise`, `franchises` |
| Développeur, éditeur | Colonnes Développeur et Éditeur | `involved_companies` (rôles développeur / éditeur) → `companies` |
| Logos des sociétés | Affichés au-dessus du nom de la société | `company_logos` |

Le POC ne garde qu'une série, une franchise, un développeur et un éditeur par jeu (section 11) : la première collection ; la franchise principale (`franchise`), sinon la première de `franchises` ; pour chaque rôle, la première société.

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
| `App.tsx` | Composant principal : états, tableau, modale d'ajout, footer de debug |
| `App.module.scss` | Styles (module SCSS) |
| `types.ts` | Tous les types, exportés, calqués sur les futures tables, dont le type `AppState` de l'état complet |
| `initialState.ts` | L'objet `initialState`, très fortement typé, qui regroupe les valeurs initiales de tous les `useState` |
| `mappers.ts` | Tous les mappers : réponses IGDB → types de la base ; base → lignes du tableau |
| `utils.ts` | Toutes les autres fonctions : appels IGDB, calculs, agrégats, tri, filtres, URL d'images |

Les fichiers de configuration (`vite.config.ts`, `.env`) et le dossier d'icônes de plateformes ne comptent pas dans les 6.

### Consignes pour le code du POC

- **Types calqués sur la base** : un type par future table (jeu, version, plateforme, variante, DLC, DLC fait, série, franchise, société, nom alternatif…), avec les mêmes noms de champs.
- **Données normalisées** : les relations passent par des identifiants (`gameId`, `platformId`…), sans objets imbriqués ni données copiées d'une entité à l'autre.
- **Valeurs calculées jamais stockées** : tout ce qu'affiche la ligne du jeu (meilleur statut, sommes, dates, « faits / total » des DLC) et le temps total.
- **Reconstruction pour l'affichage** : les mappers transforment la base simulée en lignes de tableau (ligne du jeu + sous-lignes de variantes).
- **Langue** : tout le code est en anglais (types, champs, variables, valeurs des listes fermées). Les libellés d'interface sont en français, écrits en dur dans le code, sans système de traduction.
- **Pictos d'interface** (chevron, menu, flèches de tri) : des emojis, sans bibliothèque d'icônes.

### Export et réimport de l'état

Le bouton de debug permet de sauvegarder l'état malgré la perte au rechargement.

- Il affiche dans la console un seul objet regroupant tous les états (données et interface) : tout ce que l'utilisateur voit ou choisit (recherche et résultats, modale ouverte avec ses données et ses choix en cours, mode édition, lignes dépliées, colonnes, tri, filtres, popover). Sont exclus l'historique d'annulation et les états passagers (chargement en cours, erreur réseau, minuteurs).
- Ce log se colle tel quel dans `initialState.ts` ; chaque `useState` part ensuite de sa clé dans cet objet.
- `initialState` est vérifié contre `AppState` (`satisfies AppState`) : aucun `any`, statuts, types de fin et autres listes fermées en unions de littéraux.
- Tout l'état est sérialisable en JSON : dates en chaînes ISO (`"2026-10-21"`), `null` plutôt que `undefined`, ni `Date`, ni `Map`, ni `Set`. Sinon, le log collé ne passe plus le typage.
- Au départ, `initialState` ne contient que les consoles émulées et leurs émulateurs. Les autres plateformes s'ajoutent en base à l'import du premier jeu qui en a besoin.
- Au démarrage, le tri et les filtres présents dans l'URL, et la disposition des colonnes sauvegardée dans le `localStorage`, priment sur `initialState`.

### Footer de debug (POC)

- Dernier jeu ajouté.
- Nombre de jeux, de versions et de DLC en base.
- Nombre de jeux et de variantes dans le backlog.
- Nombre d'actions dans l'historique d'annulation.
- Tri et filtres actifs.
- Le bouton d'export de l'état.

### Plateformes et icônes

- Chaque plateforme, émulateurs compris, est stockée avec un nom et un nom technique. Le nom est l'abréviation IGDB (`abbreviation`, ex. « PS2 »), ou le nom complet (`name`) quand elle manque. Le nom technique est le `slug` IGDB (ex. `ps2`, `win`, `ps4--1`) ; pour un émulateur, un slug choisi à la main (ex. `pcsx2`).
- Émulateurs du POC : PCSX2 (PS2) et RPCS3 (PS3), chacun rattaché à une seule console (liste complète en section 11).
- Le front embarque les icônes en dur, chaque fichier nommé par le nom technique de sa plateforme (ex. `ps2.svg`).
- Une plateforme sans icône affiche son nom.

### Après le POC

- **Une seule base**, découpée en deux groupes de tables :
  - **Base globale (données IGDB)** : données de référence, partagées. Elle ne contient que ce qui sert à l'affichage (section 3), plus le type de fin et le numéro dans la série choisis à l'ajout. Chaque version y est stockée une seule fois, avec la liste de ses plateformes et de ses dates de sortie : aucune donnée n'y est dupliquée par plateforme.
  - **Base utilisateur** : les variantes, qui portent toutes les données de l'utilisateur. C'est là seulement que la plateforme distingue les variantes.
- **Serveur obligatoire** entre le front et IGDB : IGDB refuse les appels depuis un navigateur, son token doit rester côté serveur et l'API est limitée à 4 requêtes par seconde.
- **Noms alternatifs** : une table dédiée (jeu, nom, commentaire).

### Images

- On stocke seulement la référence de l'image : son `image_id` IGDB. Aucune image n'est stockée.
- Une seule fonction construit l'URL à l'affichage : `https://images.igdb.com/igdb/image/upload/t_<taille>/<image_id>.jpg`. `t_thumb` (90 × 90) pour la miniature d'une ligne, suffixe `_2x` pour les écrans haute densité.
- Le navigateur charge les images directement chez IGDB : ces requêtes ne passent pas par l'API et ne consomment pas son quota.

## 5. Règles métier : jeu, version, variante, DLC

Une ligne du backlog correspond à un **jeu**. Toutes les données de l'utilisateur sont portées par ses **variantes**, une variante étant unique par Jeu + Version + Plateforme ; la ligne du jeu n'affiche que des agrégats.

### Les notions

| Notion | Définition | Exemples |
| --- | --- | --- |
| Jeu | L'œuvre. Une ligne du backlog. Un remake est un jeu distinct. Son type de fin et son numéro dans la série sont choisis à l'ajout | *Skyrim* ; *FF7* et *FF7 Remake* sont deux jeux |
| Version | Une déclinaison qu'IGDB rattache au jeu : portage, remaster, réédition, *Deluxe* / *Ultra Deluxe*, *GOTY*, *Director's Cut* | *Skyrim* et *Skyrim Legendary Edition* ; *The Last of Us* et *The Last of Us Remastered* |
| Variante | Une version jouée sur une plateforme. Elle porte toutes les données de l'utilisateur : statut, temps, possession, dates, note, DLC faits… | *Skyrim* sur PS3 ; *Skyrim Legendary* sur PS4 ; *Skyrim Legendary* sur PC = 3 variantes |
| Plateforme | Une plateforme IGDB, ou un émulateur rattaché à la console émulée. Stockée avec un nom et un nom technique | PS4, PC, *PCSX2* (PS2) |
| DLC | Contenu additionnel rattaché au jeu, pas à une version. Il se coche comme fait sur une variante | *Dawnguard*, *Hearthfire*, *Dragonborn* pour *Skyrim* |
| Extension standalone | Un jeu à part entière, pas un DLC | *TLAD*, *TBOGT* |
| Franchise | Les jeux du même univers ; un clic sur son nom filtre le tableau | *Grand Theft Auto* |

### Règles

- **Classement IGDB** : pas de règle maison. Ce qu'IGDB rattache à un jeu comme version, remaster, portage ou version enrichie est une version de ce jeu. Ce qu'il classe comme remake est un jeu distinct.
- **Une version, une fiche** : en base globale, chaque version est stockée une seule fois avec la liste de ses plateformes. La plateforme n'intervient que côté utilisateur, dans la variante.
- **Plateformes proposées pour une variante** : d'abord celles où la version est sortie, puis les émulateurs de ces consoles. Exemple : un jeu PS2 propose PS2, puis *PCSX2*.
- **Pas de doublon** : un jeu, une version ou un DLC n'existe qu'une fois en base. La recherche exclut les bundles et signale ce qui est déjà en base.
- **Pas de duplication de variante** : avoir joué à la même variante sur plusieurs comptes ne crée pas de seconde entrée.
- **Plusieurs noms** : un jeu a un nom VO, un nom VF éventuel et des noms alternatifs, tous reliés au même jeu.
- **DLC** : récupérés pour chaque jeu ajouté. Seuls les DLC et les extensions (`dlcs`, `expansions`) comptent ; les packs et les mises à jour ne sont pas récupérés. Ils sont réunis depuis l'original et toutes ses versions, sans doublon, et rattachés au jeu.
- **Pas de bundle** : un produit qui regroupe plusieurs jeux n'est pas modélisé. Chaque jeu qu'il contient s'ajoute séparément.
- **Jeu original toujours en base** : ajouter un jeu récupère aussi son original et toutes ses versions, nécessaires pour la ligne dépliable et le choix des variantes.

### Affichage replié / déplié

- **Une seule variante** : la ligne est simple, non dépliable. Elle affiche cette variante (version et plateforme) et ses données se modifient directement sur la ligne. Miniature : l'image choisie à l'ajout ; nom : celui du jeu, avec le titre de la version en dessous si ce n'est pas l'original ; date de sortie : la date originale du jeu.
- **Plusieurs variantes** : la ligne affiche le jeu original (nom, date de sortie originale), plateforme vide, et les agrégats des variantes. Elle se déplie en une sous-ligne par variante, où se modifient ses données.
- **Agrégats** : la ligne du jeu montre le total, le meilleur, le plus ancien… selon la colonne (section 7). Quand il est impossible de choisir une valeur, la case reste vide.
- **Données du jeu** : le type de fin et le numéro dans la série, choisis à l'ajout et modifiables avec le jeu (section 8), s'affichent en lecture seule dans le tableau.
- Seules les variantes présentes dans le backlog de l'utilisateur comptent. Les autres versions en base n'apparaissent pas.

## 6. Types de fin et statuts

Le type de fin, choisi à l'ajout du jeu, dit ce que « finir » veut dire. Le statut, renseigné sur chaque variante, dit jusqu'où je suis allé ; la ligne du jeu affiche le meilleur.

### Types de fin

| Type de fin | Ce que « fini » veut dire | Exemples |
| --- | --- | --- |
| Histoire | Une fin scénarisée : générique vu | *GTA V*, *The Last of Us*, *Skyrim* (quête principale), *FF7* |
| Runs | Des parties recommencées ; fini = première victoire ou fin principale | *The Binding of Isaac*, *Hades*, *Dead Cells*, *Slay the Spire*, *Don't Starve* |
| Bac à sable | Pas de fin imposée ; fini quand j'estime en avoir fait le tour | *Minecraft*, *Satisfactory*, *Shapez*, *Cities: Skylines*, *Les Sims* |
| Multijoueur | Jeu en ligne ou compétitif sans fin ; jamais vraiment fini | *Rocket League*, *League of Legends*, *Call of Duty* / *Battlefield* sans solo, *Fortnite* |

### Statuts d'une variante

Les statuts sont gradés du rang 1 au rang 8 ; « Abandonné » est hors échelle. « Pas commencé » est la valeur par défaut, et les statuts proposés dépendent du type de fin du jeu.

| Rang | Statut | Signification | Histoire | Runs | Bac à sable | Multi |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Pas commencé | Dans le backlog, jamais lancé | ✓ | ✓ | ✓ | ✓ |
| 2 | Vu sans jouer | Connu par une vidéo ou un let's play, jamais joué | ✓ | ✓ |  |  |
| 3 | Démarré | Lancé, quelques heures de jeu | ✓ | ✓ | ✓ | ✓ |
| 4 | Bien entamé | Bonne progression, pas encore fini | ✓ | ✓ | ✓ | ✓ |
| 5 | Fini | Fin principale atteinte | ✓ | ✓ |  |  |
| 5 | Estimé fini | Pas de fin officielle, mais je le considère fini |  |  | ✓ | ✓ |
| 6 | Complété (100 %) | Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires | ✓ | ✓ | ✓ | ✓ |
| 7 | Platiné | Fini, et tous les succès ou trophées de la plateforme obtenus | ✓ | ✓ | ✓ | ✓ |
| 8 | Complété et Platiné | Les deux à la fois | ✓ | ✓ | ✓ | ✓ |
| – | Abandonné | Arrêté sans intention d'y revenir | ✓ | ✓ | ✓ | ✓ |

### Statut de la ligne du jeu (calculé)

Les variantes « Pas commencé » sont ignorées tant qu'une autre variante a un statut. On applique ensuite la première situation qui correspond :

| Situation des variantes | Statut affiché sur la ligne du jeu |
| --- | --- |
| Toutes « Pas commencé » | Pas commencé |
| Au moins une au rang 5 ou plus | Le plus haut de ces statuts |
| Toutes « Abandonné » | Abandonné |
| Aucune « Abandonné » | Le plus haut statut |
| « Abandonné » mêlé à un statut en cours (rangs 2 à 4) | Vide : impossible de choisir |

### Règles

- Passer une variante au rang 5 ou plus propose de renseigner sa date de fin, et passe son nombre de fois fini (sûr) à 1 s'il était à 0. Si la date de fin est vide, une petite fenêtre la propose, pré-remplie avec la date du jour (« Valider » ou « Plus tard »).
- Repasser sous le rang 5 n'efface pas la date de fin.

## 7. Données suivies et colonnes du backlog

Chaque colonne du tableau correspond à une donnée stockée ou calculée : cette liste fait office des deux. Les données de l'utilisateur se saisissent sur la variante ; la ligne du jeu en affiche l'agrégat, vide quand il est impossible de choisir. Sur une ligne à variante unique, les deux dernières colonnes se confondent.

| Colonne | Niveau | Source | Ligne du jeu | Sous-ligne de variante |
| --- | --- | --- | --- | --- |
| Miniature | Jeu | IGDB | Image choisie à l'ajout | Image de la version |
| Nom | Jeu | IGDB | Nom VF, nom VO en dessous s'il diffère | Titre de la version (ex. *Legendary Edition*) |
| Série | Jeu | IGDB | Nom de la série |  |
| N° dans la série | Jeu | Choisi à l'ajout | Numéro, en lecture seule |  |
| Franchise | Jeu | IGDB | Nom ; un clic filtre le tableau sur cette franchise |  |
| Développeur | Jeu | IGDB | Logo au-dessus du nom |  |
| Éditeur | Jeu | IGDB | Logo au-dessus du nom |  |
| Date de sortie | Jeu, version | IGDB | Date originale, ou « à venir » / « annulé » | Date de sortie de la version sur cette plateforme |
| Type de fin | Jeu | Choisi à l'ajout | Type, en lecture seule |  |
| Plateforme | Variante | Saisie (plateformes de la version + émulateurs) | Vide si plusieurs variantes | Icône et nom |
| Statut | Variante | Saisie | Meilleur statut (section 6), vide si impossible de choisir | Liste filtrée par type de fin |
| À jouer bientôt | Variante | Saisie | Coché si au moins une variante est cochée ; la ligne est mise en valeur | Case |
| Possédé | Variante | Saisie | Coché si au moins une variante est possédée | Case |
| Date de fin | Variante | Saisie | La plus ancienne (première fin) | Date, vide si pas fini |
| Fois fini | Variante | Saisie | Somme de chaque compteur | Deux compteurs : sûr et probable |
| DLC | Variante | IGDB (liste) + saisie (faits) | « faits / total », un DLC comptant comme fait s'il l'est sur au moins une variante | « faits / total » ; clic = liste à cocher (section 9) |
| Temps réel | Variante | Saisie | Somme des variantes | Temps relevé sur la plateforme |
| Temps estimé | Variante | Saisie | Somme des variantes | Estimation manuelle du temps non relevé |
| Temps total | Variante | Calculé | Somme des variantes | Réel + estimé |
| Note | Variante | Saisie | La plus haute | De 0 à 20 |
| Commentaire | Variante | Saisie | Le commentaire s'il n'y en a qu'un, sinon vide | Texte libre, tronqué, complet au survol |
| Actions | Jeu, variante |  | Menu « 3 points verticaux » en fin de ligne (section 9) | Menu « 3 points verticaux » en fin de sous-ligne (section 9) |

- **Date de sortie** : « annulé » si IGDB indique le statut *Cancelled* ; « à venir » remplace la date quand il n'y en a pas ou qu'elle est future. Avec les autres statuts IGDB (accès anticipé, retiré de la vente…), la date s'affiche normalement.
- **Formats** : temps stockés en minutes entières, saisis en heures et minutes, affichés « 12 h 30 » ; note entière de 0 à 20 ; numéro dans la série décimal possible (ex. 2.5) ; compteurs « fois fini » entiers, à partir de 0.

## 8. Ajout d'un jeu et gestion du backlog

Rien n'est enregistré avant « Valider ». Un ajout standard : clic sur un résultat, vérification du type de fin (Histoire par défaut), puis « Valider » avec la cover pré-sélectionnée.

### Ajout depuis IGDB

1. **Recherche** : une barre de recherche connectée à IGDB, y compris dans le POC.
   - Chaque résultat s'affiche sous la forme `<Nom VF> <Nom VO> (année de sortie)`, avec son image ; un seul nom si VF et VO sont identiques.
   - Sont exclus des résultats : les bundles, les DLC et extensions (ils arrivent avec leur jeu), les packs, mises à jour, mods, épisodes, saisons et forks. Restent les jeux principaux, remakes, extensions standalone et versions.
   - Une version (ex. *Skyrim Special Edition*) est un résultat à part entière : la choisir ouvre la modale de son jeu original, avec cette version pré-sélectionnée pour la variante.
   - Un résultat déjà en base est signalé ; le choisir mène directement à l'ajout d'une variante, avec cette version pré-sélectionnée.
2. **Prévisualisation** : une fenêtre modale montre, en lecture seule, tout ce qui sera stocké : noms (VO, VF, alternatifs), versions et leurs plateformes, DLC, série, franchise, développeur, éditeur, dates de sortie. Les données IGDB n'y sont pas modifiables.
3. **Choix dans la modale** :
   - L'image de la miniature, parmi la cover et les artworks ; la cover est pré-sélectionnée.
   - Le type de fin du jeu (section 6) ; Histoire par défaut.
   - Le numéro du jeu dans sa série, si le jeu en a une.
4. **Ajout au backlog** (option dans la modale) : j'indique la version jouée, puis la plateforme parmi celles proposées (plateformes de la version, puis émulateurs de ces consoles). Cela créera la variante.
5. **Validation** : « Valider » enregistre le jeu, son original, toutes ses versions et tous ses DLC, ainsi que la variante si l'option est remplie.

### Modification d'un jeu

- Un jeu déjà en base se modifie avec exactement les mêmes choix qu'à l'ajout : l'image de la miniature, le type de fin et le numéro dans la série.
- La modification rouvre la même modale : données IGDB en lecture seule, ces trois choix modifiables, puis « Valider ». La cover et les artworks proposés sont rechargés depuis IGDB à l'ouverture ; les autres données viennent de la base.
- On y accède par l'entrée « Modifier le jeu » du menu Actions (section 9).
- Changer le type de fin peut rendre incompatible le statut d'une variante : Fini devient Estimé fini et inversement, Vu sans jouer devient Pas commencé.

### Gestion du backlog

- Ajouter une variante : entrée « Ajouter une variante » du menu Actions, qui ouvre directement le choix de la version et de la plateforme. La recherche y mène aussi : un résultat signalé « déjà en base » ouvre le même choix.
- Retirer : entrées « Retirer la variante » et « Retirer le jeu du backlog » du menu Actions. Retirer la dernière variante retire le jeu du backlog.

## 9. Vue Backlog (tableau principal)

Le backlog s'affiche dans un tableau : une ligne par jeu, dépliable selon les règles de la section 5, avec les colonnes de la section 7.

### Lignes simples et lignes dépliables

- Une ligne dépliable porte un chevron en début de ligne et un badge du nombre de variantes (ex. « 3 variantes »).
- Une ligne simple n'a pas de chevron ; un espace vide garde l'alignement des colonnes.
- Les sous-lignes sont légèrement indentées, sur un fond plus discret que la ligne du jeu.

### Chargement

- Défilement infini par pages de 25 jeux : la page suivante se charge à l'approche du bas de page, avant de l'atteindre.
- Le tri et les filtres s'appliquent page par page, côté serveur après le POC.

### DLC

- Chaque variante affiche « faits / total » ; un clic ouvre une petite fenêtre (popover) listant les DLC du jeu avec une case « fait » chacun.
- La ligne du jeu affiche « faits / total » en lecture seule, un DLC comptant comme fait s'il l'est sur au moins une variante.
- Sur une ligne à variante unique, la liste se coche directement depuis la ligne.
- En lecture seule, la liste se consulte ; en mode édition, les cases se cochent.
- Ce choix évite un troisième niveau de dépliage dans le tableau.

### Menu Actions

Un menu « 3 points verticaux » en fin de ligne regroupe les actions occasionnelles, pour alléger le tableau. Les interactions dans les cellules restent hors du menu : popover des DLC, clic sur la franchise, chevron, édition des statuts et des temps.

| Ligne | Entrées du menu |
| --- | --- |
| Ligne du jeu | Modifier le jeu · Ajouter une variante · Ouvrir sur IGDB · Retirer le jeu du backlog (toutes ses variantes) · Logger cette ligne (POC) |
| Sous-ligne de variante | Ouvrir la version sur IGDB · Retirer la variante · Logger cette ligne (POC) |
| Ligne à variante unique | Le menu de la ligne du jeu ; « Retirer le jeu du backlog » y retire l'unique variante |

- « Ouvrir sur IGDB » et « Logger cette ligne » restent disponibles en lecture seule ; les autres entrées ne sont actives qu'en mode édition.
- « Logger cette ligne » affiche dans la console le jeu, ses versions et ses variantes tels qu'ils sont stockés.

### Header du tableau

- Le titre du tableau.
- Un bouton qui ouvre une petite modale pour gérer la visibilité de chaque colonne.
- Un bouton fixe (*sticky*) pour basculer en mode édition.
- De petites bulles explicatives, par exemple sur Type de fin et Statut pour rappeler la signification des valeurs.

### Lecture seule et édition

- Le tableau est en lecture seule par défaut.
- Le bouton du header bascule en mode édition.
- Retour automatique en lecture seule après 1 minute d'inactivité.
- Une cellule en cours d'édition suspend ce minuteur.

### Personnalisation de la vue

- Masquer / afficher les colonnes via des boutons.
- Réorganiser l'ordre des colonnes.
- Sauvegarder la disposition et la visibilité des colonnes dans le `localStorage`.

### Tri et filtres

- Tri multi-colonnes : flèche de direction et indicateur numérique de priorité.
- Filtre disponible sur chaque colonne.
- Un clic sur un nom de franchise filtre le tableau sur les jeux de cette franchise.
- Paramètres de tri et de filtre persistés dans l'URL.
- Une colonne masquée est retirée du tri dans l'URL et de la recherche.
- Une URL qui trie sur une colonne masquée voit ce tri ignoré.

## 10. Annuler / rétablir

- `Ctrl+Z` annule et `Ctrl+Y` rétablit, sur les 20 dernières actions.
- L'historique vit en mémoire et se perd au rechargement de la page.
- Après le POC, chaque annulation ou rétablissement relance une requête API ; dans le POC, il met simplement à jour l'état.

## 11. Idées mises de côté et écartées

### Pour plus tard

- Synchronisation des données globales avec IGDB (logo d'un studio modifié, date de sortie fixée pour un jeu à venir).
- Jeux épisodiques (type Telltale), à traiter comme un jeu complet et unique.
- Émulateurs supplémentaires : DuckStation (PS1), PPSSPP (PSP), Vita3K (PS Vita), Dolphin (GameCube et Wii), Cemu (Wii U), Ryujinx (Switch), Azahar, ex-Citra (3DS), melonDS (DS), mGBA (GBA), Project64 (N64), xemu (Xbox), Xenia (Xbox 360), Flycast (Dreamcast). Un émulateur comme Dolphin émule plusieurs consoles : il faudra pouvoir le rattacher à chacune. Le POC n'embarque que PCSX2 (PS2) et RPCS3 (PS3).
- Plusieurs séries, franchises, développeurs et éditeurs par jeu : IGDB renvoie des listes (`collections`, `franchises`, `involved_companies`). Toutes les valeurs seront stockées et affichées dans leur cellule (chaque franchise cliquable, un logo au-dessus de chaque société). Le POC n'en garde qu'une par colonne (règle en section 3) : ce choix reste à corriger ou à préciser.

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
- Modifier ou nettoyer les données IGDB avant de les enregistrer.
- Choisir à l'ajout les versions et les jeux de la franchise à importer.
- Colonne « Jeux liés ».
- Stocker les images elles-mêmes (base64 ou fichiers).
- Noms alternatifs stockés dans un seul champ avec séparateur.
- Dupliquer une variante pour cumuler les stats de plusieurs comptes.
- External games / external game sources d'IGDB.

## Sources

- [igdb-api-types](https://github.com/DmitryScaletta/igdb-api-types) : types générés depuis la documentation IGDB (champs, dépréciations, types de jeu).
- [respawn-social-api](https://github.com/stormwarning/respawn-social-api) : CORS, token côté serveur, limite de 4 requêtes par seconde.
- [IGDB-API-JVM](https://github.com/husnjak/IGDB-API-JVM) : construction des URL d'images à partir de l'`image_id`.
- [Backloggd, changelog 1.17](https://backloggd.com/changelog/1_17_0) : éditions *GOTY* enregistrées comme bundles dans IGDB.
- [Documentation IGDB](https://api-docs.igdb.com)
