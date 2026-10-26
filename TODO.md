# À faire

[Citadel](README.md) › À faire

Tout ce qui reste à faire dans le dépôt, par projet, et les idées repoussées ou écartées.

## Sommaire

1. [Général](#1-général)
2. [Connexions](#2-connexions)
3. [Backlog](#3-backlog)
4. [Angers Irigo](#4-angers-irigo)
5. [Satisfactory](#5-satisfactory)
6. [Hébergement et mise en production](#6-hébergement-et-mise-en-production)

## 1. Général

- Supprimer le projet Test : front (`projects/test`, sa fiche et sa route dans `react/appNavigation`), serveur (`projects/test`, sa route dans `globalRouter.ts`, `TestErrorCodeEnum` dans `errorCode.type.ts`), specs (`projects/test`, `ApiPrefixEnum.TEST`), et sa table `tests` (créée par V001, à supprimer dans une nouvelle migration).
- Ajouter des tests (unitaire uniquement)
  https://claude.ai/chat/9c73847f-79d7-4408-9eab-9601d0975968
- On va enfin implémenter le front
- On va faire des tests end to end
- Faire le système de tous est en 1 rem = 10px. Mais il faut y appliquer un système pour que l'utilisateur puisse "zoomer"
- Rendre précis le undefined. ? | undefined, ou les 2 mais le sens doit être différent
  - Préféré des valeurs null pour les input
  - En fait, c'est déjà activé. Préféré le fait de ne jamais avoir de type en undefined explicite. Une propriété optionnelle doit être marqué en ?. Une propriété qui peut être nulle doit être marqué en null.
- Refaire entièrement le thème
- Refonte du système de traduction
- Virer lucide-react
- Les media queries ne doivent jamais utilisées de rem, mais resté en taille d'écran abolsue à priori
- Faire des data-portal avec tout les éléments de type : tooltip, modal, dropdown
- getSortStringValue classe les majuscules avant les minuscules et les accents après « z ». Il y a déjà un TODO sur le sujet ; les tests décrivent ce comportement actuel.
- Rajouter un petit toast global à l'appli quand le client n'est plus connecté à internet. Avoir un toast de succès quand cela revient à la normale.
- Tout convertir en REM
- Gérer le preference mode dark or light
- Avoir un mode qui désactive toutes les animations si l'utilisateur à émis cette préférence
- PWA.
- Accessibilité (textes au survol, etc.).
- Responsive.
- Sécurité une fois en ligne : savoir qui se connecte et quand, détecter les connexions anormales.
- Page de maintenance, activable vite sur un des sites.
- Pouvoir commiter les `.env`, chiffrés.
- Postman : enregistrer le token de la réponse, pour plusieurs environnements avec chacun son token :
  ```js
  pm.test("Save response token in Postman environment variable", function () {
  	const token = pm.response.headers.get("Authorization");
  	if (token) {
  		pm.environment.set("bearerToken", token.replace("Bearer ", ""));
  	}
  });
  ```
- Stocker des images en base.
- Design system : recherche et filtre de liste insensibles aux accents et à la casse.
- Design system : toasts avec un nombre maximum affichés et les autres en pile, barre de temps, clic pour les figer, croix pour fermer (voir l'ancien projet account).

## 2. Connexions

Prochain sujet de réflexion.

- Connexion par utilisateur (comptes).
- Quand le serveur saura envoyer des mails : un mail de confirmation à la création de compte.
- À terme, changement de mot de passe, confirmé par mail.
- Changement d'adresse mail, avec un mail aux deux adresses.
- Mot de passe oublié, avec envoi d'un lien de récupération.
- Force du mot de passe : barre de progression en couleur, avec une légende et peut-être une valeur.
- Inscription : les conditions du mot de passe passent au vert en direct.
- La perte du focus sur le mot de passe ou sur sa confirmation vérifie les deux.
- Colorier aussi les champs incorrects à l'envoi.
- Améliorer `cleanError` pour qu'il n'enlève que l'erreur du bon champ.

## 3. Backlog

- Fusionner les composants d'interface du backlog (`apps/client/src/projects/backlog/components/` : Button, Modal, Select…) avec le design system, sans changer, ou à peine, l'apparence des endroits qui utilisent déjà le design system. La feuille de styles partagée `backlog.module.scss` sera découpée à ce moment-là.
- Ajouter les icônes des plateformes : aucune n'existe encore, le nom s'affiche à la place. Un fichier par nom technique de plateforme (le slug IGDB : `ps2.svg`, `win.svg`…), embarqué dans le front.

### Pour plus tard

- Synchronisation des données globales avec IGDB (logo d'un studio modifié, date de sortie fixée pour un jeu à venir).
- Jeux épisodiques (type Telltale), à traiter comme un jeu complet et unique.
- Annuler / rétablir : `Ctrl+Z` et `Ctrl+Y` sur les 20 dernières actions, avec deux boutons dans la barre du haut. Une action est une modification de la base (champ enregistré, case cochée, statut changé avec son « fois fini » automatique, ajout, retrait, « Personnaliser », « Réorganiser la série », « Modifier le jeu » ou « Rechercher d'autres DLC » validé) ; ni le tri, ni les filtres, ni les colonnes. Dans un champ texte, `Ctrl+Z` reste celui du navigateur. Chaque annulation envoie l'opération inverse au serveur. À faire avec les comptes : l'historique est propre à chaque utilisateur. En attendant, un retrait se confirme.
- Affichage du tableau : toutes les lignes chargées se redessinent à chaque rendu (frappe dans la recherche, popover, modale). Si besoin : ne redessiner que les lignes concernées (lignes mémorisées, actions stables, popover transmis à sa seule ligne).
- DLC choisis par utilisateur : les DLC choisis vont en base, rattachés au jeu, comme les versions. À plusieurs utilisateurs, un DLC ajouté par l'un compterait dans le « total » de l'autre ; il faudra une sélection des DLC suivis par utilisateur.
- Retirer des versions ou des DLC de la base par « Modifier le jeu » : à cadrer, car une version porte des versions jouées et un DLC des cases « fait ». On ne peut qu'en ajouter.
- Émulateurs supplémentaires : DuckStation (PS1), PPSSPP (PSP), Vita3K (PS Vita), Dolphin (GameCube et Wii), Cemu (Wii U), Ryujinx (Switch), Azahar, ex-Citra (3DS), melonDS (DS), mGBA (GBA), Project64 (N64), xemu (Xbox), Xenia (Xbox 360), Flycast (Dreamcast). Un émulateur comme Dolphin émule plusieurs consoles : il faudra pouvoir le rattacher à chacune. Seuls PCSX2 (PS2) et RPCS3 (PS3) sont en base.
- Plusieurs développeurs et éditeurs par jeu : IGDB renvoie des listes (`involved_companies`). Toutes les valeurs seront stockées et affichées dans leur cellule (un logo au-dessus de chaque société). Aujourd'hui, on n'en garde que la première par rôle.
- Séries créées par utilisateur : la série choisie est personnelle (jeu du backlog), mais une série créée à la main, comme *Souls*, est rangée en base globale avec les séries IGDB. À plusieurs utilisateurs, chacun devra avoir ses propres séries.
- Étendre le backlog aux films et aux séries, et y réimporter ce qui a été sauvegardé de TV Time.
- Petites bulles explicatives dans l'en-tête du tableau.
- À surveiller : les éditions qu'IGDB classe en « Bundle ». On prend comme version tout bundle rattaché à un jeu par `version_parent` (*Skyrim Legendary Edition*, éditions de *GTA V*) et ignore les autres, même quand ils ne contiennent qu'un jeu et ses DLC (*FF7 Remake Intergrade*, seulement listé dans `bundles` du jeu). Vérifier la règle sur plus de jeux et traiter ces cas.

### Écarté

Idées qui ne seront pas faites :

- Tableau séparé « Jeux finis ».
- Wishlist.
- Compteur de succès (x / x).
- Griser les jeux ignorés.
- Support des langues (colonne « Français » : interface, sous-titres, audio).
- Bundles : regrouper plusieurs jeux sous une même fiche.
- Champ « Origine » distinct (vu mais pas fait, abonnement, émulation, officiel, gratuit).
- Ajout manuel d'un jeu.
- Modifier ou nettoyer les données IGDB avant de les enregistrer (la série se choisit sur le jeu du backlog).
- Choisir à l'ajout les jeux de la série à importer.
- Colonne Franchise : doublon de la série dans la plupart des cas.
- Nom VF des séries : IGDB n'en a pas, et une saisie à la main n'est pas voulue.
- Donner une série à un jeu seul, avec son propre nom (habitude du Google Sheet) : la série est facultative.
- Colonne « Jeux liés ».
- Stocker les images elles-mêmes (base64 ou fichiers).
- Stocker les noms alternatifs : seuls les noms VO et VF sont gardés.
- Dupliquer une version jouée pour cumuler les stats de plusieurs comptes.
- External games / external game sources d'IGDB.

## 4. Angers Irigo

- Reformater toute l'architecture du projet aux règles de Citadel ([architecture](docs/architecture.md)) : un export par fichier, suffixes `.type.ts` / `.enum.ts`, nommage des fichiers, un dossier par composant, puis retirer les `eslint-disable` de structure en tête des fichiers.
- Se caler sur l'actualisation réelle d'Irigo au lieu de demander les flux toutes les 15 s (`REFRESH_INTERVAL_MS`). Irigo actualise ses données une fois par minute, et chaque flux dit de quand elles datent (`header.timestamp`). Le but : toujours recevoir des données neuves 1 à 3 s après leur publication, avec une requête par minute au lieu de quatre.
  - À chaque réponse, calculer l'âge des données (ex. 24 s), puis programmer la requête suivante à l'actualisation attendue plus 2 s de marge : 60 − 24 + 2 = 38 s plus tard.
  - Si une requête ramène des données qui ne sont pas plus récentes que les précédentes (actualisation en retard), redemander toutes les 4 s jusqu'à en recevoir de neuves, puis reprendre le rythme de 60 s recalé sur elles.
  - Un calage par flux : positions des véhicules et mises à jour de trajet n'ont pas forcément la même heure d'actualisation.
  - Point d'attention : l'âge se compare à l'horloge du PC, qui peut être décalée de quelques secondes. Le mesurer plutôt avec l'heure du serveur (en-tête `Date` de la réponse, si le relais `/irigo` le transmet).
- Bug : au clic sur un véhicule, son trajet n'est plus en surbrillance. Sans doute cassé à la copie du projet depuis `map`.
- Bug : les arrêts ne s'affichent plus. Même cause probable.
- Quand on a la petite modal d'un véhicule ouvert, on ne peut pas faire défiler la carte loin, l'emplacement de la modal nous empêche d'aller plus loin
- En haut à gauche, on a bien le nombre de seconde depuis que les dernières données ont été reçues, mais quand je suis sur un véhicule, ça marque toujours "Position estimée (signal reçu maintenant)". Et si je désactive la simulation des déplacements, ça indique "Position il y a 1 s

## 5. Satisfactory

Repris de Notion au plus près ; les couleurs d'origine y deviennent des groupes.

- Implémenter la grille Satisfactory avec système d'agrandissement de certaines cases (?).
- Chaque coordonnée doit être un lien pour pinguer en jeu.

### Bâtiments

- Extraction, transformation et générateurs : Miner Mk 1, Miner Mk 2, Miner Mk 3, Water Extractor, Oil Extractor, Resource Well Pressurizer, Resource Well Extractor ; Smelter, Foundry, Constructor, Assembler, Manufacturer, Packager, Refinery, Blender, Particle Accelerator, Quantum Encoder, Converter ; Hub Integrated Biomass Burner, Coal Powered Generator, Fuel Powered Generator, Geothermal Generator, Nuclear Power Plant.
- Hors groupe : Biomass Burner, Alien Power Augmenter, Power Storage.

### Idées

*(machines)* : partie du groupe extraction, transformation et générateurs.

- GetFactory + GetExtractor *(machines)* + getFrackingActivator + getGenerators *(machines)*, avec un select pour en choisir un en particulier, des cases extracteurs oui/non et factory oui/non, une case générateurs oui/non (avec option pour hub/biomass) *(machines)*, et le % moyen d'efficacité *(machines)*.
- GetBelts : en sélectionner certaines, les renommer pour surveiller leur flux par minute.
- Stats globales :
  - getElevators : cumul des étages, de la hauteur, nombre ?
  - getCables, getHypertubes, getPipes, getTrainRails : longueur totale.
  - getSessionInfo : temps de jeu, nombre de jours, nombre de jours sans mort, heure en jeu.
  - getResearchTrees : nombre de recherches finies sur le total.
  - getUObjectCount : x / y.
- getSpaceElevator : petite box d'exposition.
- getSwitches : je ne sais pas.
- getCloudInv + getWorldInv + getPlayer (partie inventaire) : inventaire total du monde, en précisant que les objets en transfert ne sont pas comptés.
- getCrateInv.
- getModList : liste avec nom et version.
- getResourceSink + getExplorationSink : graphique avec toutes les infos possibles, compteurs jusqu'au prochain palier ou jusqu'à tout débloquer.
- getDoggo : ceux qui ont des objets, case pour les montrer tous.
- getDropPod : liste de tous (avec choix ouverts ou non), et un mode triche pour pinguer le plus proche et savoir ce dont il a besoin.
- getPowerSlug : en mode triche, liste des plus proches avec ping ; coche verte à côté si tous sont récupérés.
- getProdStats, getSchematics : à voir ce qu'on en fait.
- getPower : graphique avec max, réel, potentiel et production, infos batteries, autonomie si le courant est coupé, et autres infos. Avec getPowerUsage, pour l'usage du courant par bâtiment.
- getDroneStation + getTrainStation + getTruckStation : tenter un bilan des trajets.
- getDrone + getExplorer + getFactoryCart + getTractor + getTrains + getTruck + getVehiclePaths + getVehicles : voir ce qu'on tire de chacun, et si getVehicles seul suffit pour limiter les requêtes.
- getResourceNode + getResourceDeposit + getResourceGeyser + getResourceWell : voir ce qu'on peut en faire.

### Endpoints

Numéros d'origine gardés.

- Extraction, transformation et générateurs : 2 getAssembler, 3 getBlender, 4 getConstructor, 5 getConverter, 7 getEncoder, 8 getFactory, 9 getSmelter, 10 getRefinery, 11 getManufacturer, 12 getPackager, 13 getParticle, 14 getFoundry, 22 getExtractor, 23 getFrackingActivator, 30 getGenerators, 31 getBiomassGenerator, 32 getCoalGenerator, 33 getNuclearGenerator, 34 getFuelGenerator, 35 getGeothermalGenerator.
- Lignes d'approvisionnement : 6 getElevators, 16 getCables, 17 getHypertube, 19 getPipes, 21 getTrainRails, 44 getSessionInfo, 45 getResearchTrees, 47 getModList, 72 getUObjectCount.
- Vrac : 15 getBelts, 27 getSpaceElevator, 29 getSwitches, 36 getCloudInv, 37 getWorldInv, 38 getCrateInv, 40 getResourceNode, 41 getResourceDeposit, 42 getResourceGeyser, 43 getResourceWell, 46 getPlayer, 49 getResourceSink, 50 getExplorationSink, 51 getDroneStation, 52 getTrainStation, 53 getTruckStation, 54 getDrone, 55 getExplorer, 56 getFactoryCart, 57 getTractor, 58 getTrains, 59 getTruck, 61 getVehicles, 63 getDoggo, 64 getDropPod, 66 getPowerSlug, 67 getProdStats, 69 getSchematics, 73 getPower, 74 getPowerUsage.
- Écartés, faute de savoir quoi en suivre ni ce que ça apporterait : 1 getChatMessages, 18 getPipeJunctions, 20 getPump, 24 getPortal (même si on pourrait tenter de calculer la surface totale scannée), 25 getRadarTower, 26 getResourceSinkBuilding, 28 getHUBTerminal, 39 getStorageInv, 48 getSinkList, 60 getVehiclePaths, 62 getCreatures, 65 getMapMarkers, 68 getRecipes, 70 getTapes, 71 getUnlockItems, 75 getAll.

## 6. Hébergement et mise en production

- Phases 5 à 7 de la roadmap : bascule du NAS ; sauvegardes, pré-prod et alertes ; réseau, sécurité et ménage ([cahier des charges, §15](docs/ci_cd/cahier_des_charges.md#15-roadmap)).
- Une barrette de RAM de plus, si c'est bien le goulot d'étranglement. À 16 Go : Jellyfin à 8 Go, qBittorrent à 6 Go, et son cache interne à 2 Go (options avancées).
- Priorité CPU de Gluetun intermédiaire (entre 128 et 1024, vers 400).
- [Docker Credentials Store](https://docs.docker.com/reference/cli/docker/login/#credential-stores) sur le NAS pour les mots de passe et les clés.

Pour plus tard : [cahier des charges, §17](docs/ci_cd/cahier_des_charges.md#17-pour-plus-tard).
