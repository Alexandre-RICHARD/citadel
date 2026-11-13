# À faire

[Citadel](../../README.md) › À faire

Tout ce qui reste à faire dans le dépôt, par grand sujet puis par thème, et les idées écartées pour ne pas les reproposer. ⚠️ marque les points prioritaires. Les bugs et demandes en cours de traitement sont dans les [problèmes connus](../problems/problems.md).

## Sommaire

1. [Général](#1-général)
2. [Authentification](#2-authentification)
3. [Mails](#3-mails)
4. [Hébergement et console](#4-hébergement-et-console)
5. [Homepage](#5-homepage)
6. [Backlog](#6-backlog)
7. [Angers Irigo](#7-angers-irigo)
8. [Tests end-to-end](#8-tests-end-to-end)
9. [Satisfactory](#9-satisfactory)
10. [À vérifier hors du dépôt](#10-à-vérifier-hors-du-dépôt)

## 1. Général

### 1.1 Code et tests

- Types : jamais de `undefined` explicite. `exactOptionalPropertyTypes` est déjà actif : une propriété facultative se marque `?`, une valeur absente vaut `null` (aussi pour les champs de formulaire).
- `getSortStringValue` (`packages/common`) classe les majuscules avant les minuscules et les accents après « z » : lui donner la locale (un `TODO` est dans le fichier ; ses tests décrivent le comportement actuel).
- Compléter les tests unitaires (piste : https://claude.ai/chat/9c73847f-79d7-4408-9eab-9601d0975968).
- Écrire un guide des tests commun à tout le dépôt (unitaires, intégration, end-to-end).
- Revue de la base par un regard de DBA : le schéma et son usage, pour en déduire des optimisations.

### 1.2 Interface et design system

- Réunifier tout le design system (voir aussi la [fusion des composants du Backlog](#61-interface)).
- Refaire entièrement le thème. La refonte de la homepage en a été le pilote : jetons et thème de chaque projet sont déjà dans le design system.
- Remplacer lucide-react.
- Tooltips, modales et menus déroulants rendus dans un portail commun (`data-portal`). Aujourd'hui, seuls quelques composants du Backlog passent par `createPortal`.
- Tailles en `rem` partout (1 rem = 10 px, déjà posé dans `global.scss`), sauf les media queries, en tailles d'écran absolues ; puis un réglage de zoom pour l'utilisateur.
- Toasts : un nombre maximum affiché et les autres en pile, barre de temps, clic pour les figer, croix pour fermer (voir l'ancien projet account).
- Recherche et filtre de liste insensibles aux accents et à la casse.
- Toast global quand le client perd Internet, et un toast de succès à son retour.
- Faire un bilan des icônes et des SVG.
- Système de traduction : aucun aujourd'hui, les textes sont en français, en dur ([architecture, §2](../architecture/architecture.md#2-règles-communes)). À concevoir.

### 1.3 Plateformes

- PWA.
- Application mobile, pour des widgets par exemple : à évaluer.
- Accessibilité (textes au survol, etc.).
- Responsive.

### 1.4 Données

- Stocker des images en base. Contredit l'écart « stocker les images elles-mêmes » du [Backlog](#65-écarté) : à trancher.

## 2. Authentification

La fonctionnalité est décrite dans [authentification](../auth/auth.md). Sa recette manuelle est la liste des [vérifications de fin](../e2e/auth_verifications.md).

### 2.1 Recette

- ⚠️ Recette visuelle de toutes les pages en dev.
- ⚠️ Recette en `pnpm prod:local` : les [vérifications de fin](../e2e/auth_verifications.md), une par une, en s'appuyant sur les tests end-to-end (section 8). Une ligne qui échoue devient un correctif.
- La mise en prod elle-même se vérifie hors du dépôt (section 10).

### 2.2 Décisions à prendre

- ⚠️ Un changement d'email confirmé doit-il fermer les autres sessions et annuler les « mot de passe oublié » en cours vers l'ancienne adresse ? Aujourd'hui non : il faut déjà le mot de passe pour le commencer, et l'ancienne adresse est prévenue après coup. À tester : lancer un « mot de passe oublié », changer l'email, puis finir le « mot de passe oublié » depuis l'ancienne adresse.
- La notification du changement d'email pourrait partir à l'ancienne adresse dès la demande, et pas seulement après la confirmation, pour que son propriétaire puisse réagir avant.
- Les emails tutoient, le site vouvoie (formulaire de contact, écran « Message envoyé », pages du pied de page, bandeau) : harmoniser ou non.

### 2.3 Pour plus tard

- Console, en lecture seule : comptes (métadonnées, jamais un secret), IP bannies, événements de sécurité (`auth_event` : qui se connecte et quand, connexions anormales). Par un compte MariaDB limité ou l'API interne, jamais depuis Internet. Les compteurs de bannissement passeraient alors en base.
- Blocage temporaire d'un compte depuis la console : boutons « bloquer » et « débloquer », colonne `blocked_at` dans `auth_user`, contrôle dans le service des sessions. Un compte bloqué refuse toute action (connexion, parcours, mails, endpoints `protected`), et ses sessions sont supprimées au blocage. C'est le recours d'un compte détourné : les mails de sécurité renvoient déjà vers `contact@`. Lève la règle « aucune action de la console sur les comptes ».
- Notification « nouvelle connexion ».
- Turnstile, limitation de débit de Cloudflare ou CrowdSec si des abus apparaissent ; Turnstile sur les formulaires qui envoient un mail dès qu'un robot épuise le quota.
- Complétion de profil : `missingFields` dans `GET /auth/me` quand un champ obligatoire s'ajoutera ; `terms_accepted_version` si des conditions d'utilisation arrivent.
- Remontée des plantages du front, protégée par la session et limitée par IP, si le besoin apparaît.
- Plus de SSO, à préciser : fournisseurs externes (Google, GitHub…), hors du périmètre actuel, ou connexion commune au site et à la console.

## 3. Mails

La fonctionnalité est décrite dans [mails](../mails/mails.md).

### 3.1 Délivrabilité

- ⚠️ Chaque gabarit (authentification et contact) envoyé depuis le dev vers Gmail et Outlook, et à [mail-tester.com](https://www.mail-tester.com) : au moins 7/10, SpamAssassin sous 3, hors indésirables. Les réglages DMARC se vérifient hors du dépôt (section 10).

### 3.2 Pour plus tard

- File d'envoi des mails en base, si l'envoi pendant la requête pose problème.

## 4. Hébergement et console

Le fonctionnement est décrit dans [hébergement](../ci_cd/ci_cd.md).

### 4.1 NAS et matériel

- Une barrette de RAM de plus, si c'est bien le goulot d'étranglement. À 16 Go : Jellyfin à 8 Go, qBittorrent à 6 Go, et son cache interne à 2 Go (options avancées).
- Plus de RAM et de CPU pour Jellyfin et qBittorrent quand Prowlarr, Radarr, Sonarr, Bazarr et cross-seed sont éteints (2,5 Go libérés), rendus avant de les rallumer.
- Onduleur : sans lui, une coupure de courant peut abîmer la base ou les bases SQLite des *arr.

### 4.2 Secrets

- [Docker Credentials Store](https://docs.docker.com/reference/cli/docker/login/#credential-stores) sur le NAS pour les mots de passe et les clés.
- Les `.env` chiffrés et versionnés (SOPS + age), `.env.prod` compris.

### 4.3 Sauvegardes et restauration

- Récupérer réellement un fichier du Drive en le déchiffrant, pour s'assurer que la procédure marche ([hébergement, §8](../ci_cd/ci_cd.md#8-accès-au-drive-rclone)).
- Procédures de restauration écrites et testées : la config d'un service, toute la stack média, la base de prod.
- Instantanés Btrfs (les deux volumes sont en Btrfs) : retour en arrière après une suppression accidentelle, et coupure plus courte de `config-backup`.

### 4.4 Déploiement et versions

- Déploiement sans coupure (blue/green derrière Caddy) ; déploiement sans GitHub (images construites sur le PC, envoyées par SSH).
- Nettoyage automatique des vieilles images sur GHCR.
- Node 26, MariaDB 12.3 et Flyway 13, testés en pré-prod.
- Jellyfin 12, sorti en octobre 2026 : sa base migre sans retour possible, donc après une copie de `/Volume1/appdata/jellyfin`.

### 4.5 Sécurité réseau

- Limitation de débit sur l'API ; CrowdSec devant le site et Jellyfin.
- Double authentification sur TOS, absente de TOS 7 : risque limité, son interface n'est jamais exposée sur Internet.
- IPv6 ; géolocalisation des IP dans la console (base GeoLite2) ; passkeys pour la console.

### 4.6 Console

- Modifier `.env.prod`. Aujourd'hui, elle n'a aucun accès en écriture aux secrets : passer par une demande à `infra-ops`, comme les jobs, suivie du redémarrage des services concernés.
- Afficher proprement `pnpm audit` et `pnpm outdated` (failles et dépendances en retard, par paquet du monorepo).
- Idées, en vrac :
  - tableau de bord d'accueil : un voyant par sujet (site, sauvegardes, VPN, disques, mises à jour) ;
  - historique des alertes de healthchecks.io ;
  - courbes CPU, RAM, disque et réseau sur 24 h, 7 jours, 30 jours, par conteneur ;
  - santé SMART des disques, températures, prévision de remplissage des volumes ;
  - taille de chaque table de la base ;
  - navigateur des sauvegardes : liste, taille, contrôles, téléchargement d'un dump ;
  - requêtes SQL en lecture seule sur la pré-prod ;
  - logs : recherche, filtre par niveau, suivi en direct, plusieurs conteneurs à la fois ;
  - erreurs du serveur (`error_log`) : liste, regroupement, marquées comme vues ;
  - trafic du site : pages vues, codes de réponse, pays, robots, sans traceur côté visiteur ;
  - IP suspectes : liste, bannissement manuel dans Caddy ;
  - Jellyfin : bibliothèques, derniers ajouts, transcodages en cours, utilisateurs ;
  - *arr : files d'attente, téléchargements en cours, prochains épisodes, erreurs d'indexeurs ;
  - qBittorrent : pause et reprise globales, limites de vitesse, torrents en erreur, ratio par tracker ;
  - VPN : changer de serveur ;
  - planning des jobs modifiable (activer, désactiver, déplacer) ;
  - notifications Discord ou mail pour les événements de la console (redémarrages en boucle, disque presque plein) ;
  - journal des actions de la console : consultation et filtre ;
  - redémarrage et arrêt propre du NAS ;
  - Wake-on-LAN des autres machines du réseau ;
  - état de la box : IP publique, débit, appareils connectés ;
  - échéances étendues : nom de domaine, abonnements, garantie des disques ;
  - notes et pense-bêtes d'infra : procédures et liens, jamais de secret ;
  - mode sombre, raccourcis clavier, version mobile.

## 5. Homepage

- Console de commande : `²` ouvre une console à la Quake pour aller quelque part en tapant (`goto backlog`).
- Mini-jeu, par exemple sur le logo hexagonal.
- Refaire le logo et son intro.

## 6. Backlog

Le projet est décrit dans [Backlog](../backlog/backlog.md).

### 6.1 Interface

- Fusionner les composants d'interface du Backlog (`apps/client/src/projects/backlog/components/` : Button, Modal, Select…) avec le design system, sans changer, ou à peine, l'apparence des endroits qui utilisent déjà le design system. La feuille partagée `backlog.module.scss` sera découpée à ce moment-là.
- Déposer les SVG des plateformes et des launchers dans `icons/` : le dossier est vide, chaque plateforme garde son icône par défaut ([Backlog, §7](../backlog/backlog.md#7-plateformes-et-icônes)).
- Le bouton « Rechercher d'autres DLC » est mal placé.
- Annuler / rétablir : `Ctrl+Z` et `Ctrl+Y` sur les 20 dernières actions, avec deux boutons dans la barre du haut. Une action est une modification de la base (champ enregistré, case cochée, statut changé avec son « fois fini » automatique, ajout, retrait, « Personnaliser », « Réorganiser la série », « Modifier le jeu » ou « Rechercher d'autres DLC » validé) ; ni le tri, ni les filtres, ni les colonnes. Dans un champ texte, `Ctrl+Z` reste celui du navigateur. Chaque annulation envoie l'opération inverse au serveur, et l'historique est propre à chaque compte. En attendant, un retrait se confirme.

### 6.2 Données IGDB

- Synchronisation des données globales avec IGDB (logo d'un studio modifié, date de sortie fixée pour un jeu à venir).
- Jeux épisodiques (type Telltale), à traiter comme un jeu complet et unique.
- Plusieurs développeurs et éditeurs par jeu : IGDB renvoie des listes (`involved_companies`). Toutes les valeurs seront stockées et affichées dans leur cellule (un logo au-dessus de chaque société). Aujourd'hui, seule la première par rôle est gardée.
- Émulateurs supplémentaires : DuckStation (PS1), PPSSPP (PSP), Vita3K (PS Vita), Dolphin (GameCube et Wii), Cemu (Wii U), Ryujinx (Switch), Azahar, ex-Citra (3DS), melonDS (DS), mGBA (GBA), Project64 (N64), xemu (Xbox), Xenia (Xbox 360), Flycast (Dreamcast). Seuls PCSX2 (PS2) et RPCS3 (PS3) sont en base. Un émulateur comme Dolphin émule plusieurs consoles, or une plateforme enfant n'a qu'un parent : il faudra pouvoir le rattacher à chacune.
- À surveiller : les éditions qu'IGDB classe en « Bundle ». Tout bundle rattaché à un jeu par `version_parent` (*Skyrim Legendary Edition*, éditions de *GTA V*) compte comme version, les autres sont ignorés, même quand ils ne contiennent qu'un jeu et ses DLC (*FF7 Remake Intergrade*, seulement listé dans `bundles` du jeu). Vérifier la règle sur plus de jeux et traiter ces cas.

### 6.3 Base commune et comptes

- DLC choisis par compte : les DLC choisis vont en base, rattachés au jeu, comme les versions. Un DLC ajouté par un compte compte donc dans le « total » des autres : il faudra une sélection des DLC suivis par compte.
- Retirer des versions ou des DLC de la base par « Modifier le jeu » : à cadrer, car une version porte des versions jouées et un DLC des cases « fait ». On ne peut qu'en ajouter.

### 6.4 Pour plus tard

- Tableau d'un très gros backlog (plusieurs centaines de jeux) : virtualiser les lignes, car chacune porte environ 65 éléments du DOM ([Backlog, §8](../backlog/backlog.md#8-base-endpoints-et-code)). Mettre aussi en mémoire côté serveur les lignes calculées de chaque compte, effacées à chaque écriture, si le calcul d'une page dépasse quelques centaines de millisecondes.
- Étendre le backlog aux films et aux séries, et y réimporter ce qui a été sauvegardé de TV Time.

### 6.5 Écarté

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

## 7. Angers Irigo

- Reformater toute l'architecture du projet aux règles de Citadel ([architecture](../architecture/architecture.md)) : un export par fichier, suffixes `.type.ts` / `.enum.ts`, nommage des fichiers, un dossier par composant, puis retirer les `eslint-disable` de structure en tête des fichiers.

## 8. Tests end-to-end

Les scénarios sont dans [scénarios](../e2e/scenarios.md) ; les codes cités (A1, E2, G10…) sont les leurs.

### 8.1 Comportements de l'application constatés par les tests

Rien n'a encore été corrigé dans le code du site.

- **Lien d'un mail ouvert dans un nouvel onglet : la page demandée au départ est perdue** (A1). Après « Passer cette étape » de l'étape « Protège ton compte », l'onglet du lien atterrit sur le profil (`/auth/profile/identity`) au lieu de `/backlog`. La page demandée est gardée dans le `sessionStorage` de l'onglet d'origine (`useAuthRedirect`) : l'onglet ouvert par le lien n'en sait rien. Même comportement attendu pour tout lien de mail (connexion par lien, mot de passe oublié). Quand le code est tapé dans l'onglet d'origine (A2), on revient bien à `/backlog`. Le test A1 vérifie donc le profil. À trancher : transmettre la page demandée par le parcours (côté serveur), ou accepter le profil.
- ⚠️ **« Confirmer » cliqué trop vite envoie au mauvais endroit** (vu 2 fois sur B1 et G5, test instable). Sur `/auth/verify`, `VerifyPage` lit le type du parcours en cours (`useFlow`) au moment du clic : si `GET /auth/flow` n'a pas encore répondu, il est inconnu, et une inscription confirmée mène au profil au lieu de « Protège ton compte ». Un humain ne clique pas avant la fin du chargement, mais un clic rapide suffit à le reproduire. À corriger : désactiver « Confirmer » tant que le parcours n'est pas chargé. Les tests attendent la fin des requêtes (`openMailLink`).
- ⚠️ **Après un échec, le premier nouvel essai reçoit un `429` sans message** (E2, E6, E7, G2, G10). Un mauvais mot de passe ou un mauvais code ne fait pas attendre le bouton : un nouvel essai dans les 2 secondes reçoit un `429`, et l'interface n'affiche que le compte à rebours « Patiente n s » sur le bouton, sans message. L'utilisateur ne sait pas si son essai a été jugé. À corriger : appliquer le délai côté interface dès la réponse en échec, comme après un `429`. Les tests contournent par `retryUntilAnswered`.
- **Nom du fichier des codes de secours en date UTC** (E1, vérifié seulement au format). `buildRecoveryCodesFileName` utilise `toISOString()` : entre minuit et 1 h ou 2 h (heure de Paris), le fichier porte la date de la veille. Sans conséquence grave.
- **Le mail « adresse déjà utilisée » contient un lien** (G3). Le scénario et la [doc de l'authentification](../auth/auth.md#46-profil) disent « sans lien ni code » ; le mail contient un lien vers `/auth/login` (ni lien de confirmation, ni jeton). Le test vérifie l'absence de `/auth/verify` et de code. À trancher : corriger le scénario et la doc, ou le mail.

### 8.2 Scénarios à écrire

- Les scénarios sans ✅ dans [scénarios](../e2e/scenarios.md) : A3 à A8, B3 à B9, C4, C5, C7, C8, D1 à D3, E4, E5, E8, E9, F1 à F5, G1, G4, G7 à G9, H3 à H5, I3, I4, J1 à J5, K1 à K22, L1 à L3, L8, L9, M1 à M8, N1 à N3, Z1 à Z3.
- Les scénarios qui exigent des durées raccourcies (B7…) : une configuration à part de la stack e2e, à ajouter en les écrivant.
- M7 : décider d'abord le comportement des adresses inconnues hors de `/homepage` et `/auth` (page blanche, page d'erreur de React Router, ou carte d'Angers Irigo).
- Automatiser ce qui peut l'être dans les [vérifications de fin de l'authentification](../e2e/auth_verifications.md).

### 8.3 Limites des tests écrits

- **`citadel.localhost` ne se résout pas côté Node sous Windows** (`getaddrinfo ENOTFOUND`) : `page.request` et `request.newContext` de Playwright ne peuvent pas appeler l'API. Les appels directs passent par un `fetch` dans la page (`helpers/api/callApi.ts`), qui envoie aussi l'`Origin` du site : le test passe donc par la protection CSRF comme le front.
- **Chromium headless ne prévient jamais un onglet qu'il revient au premier plan** : `returnToTab` envoie lui-même `visibilitychange` (B2).
- **Le délai entre deux échecs d'un même compte reste celui de la prod** (C3, E2…) : `compose.e2e.yml` relève les limites par IP, mais pas ce délai.
- **Pas d'accès à la base** : « aucune ligne `auth_user` avant la confirmation » (A1) est vérifié par un refus de connexion ; « aucune donnée restante » (G10) par un nouveau compte qui réutilise l'adresse et le pseudo et trouve un GDC vide.
- **Parties de scénario non couvertes** :
  - A8 : l'interrupteur `AUTH_REGISTRATION_ENABLED` ;
  - E3 : le cas « choix absent s'il n'y a qu'une méthode » (un compte a toujours ses codes de secours en plus d'un facteur) ;
  - G5 : la troncature du user agent à 255 caractères (invisible à l'écran) et « boutons inactifs pendant une action » (trop bref) ;
  - L6 : l'accusé en échec (il faudrait un faux Brevo en panne à la demande) ;
  - L7 : « le message du champ piège ne compte pas dans la limite » (la limite du contact est relevée en e2e).

## 9. Satisfactory

Le projet est décrit dans [Satisfactory](../satisfactory/satisfactory.md). Les idées sont reprises de Notion au plus près ; les couleurs d'origine y deviennent des groupes.

- Le jeton `X-FRM-Authorization` de FRM est écrit en dur dans `pages/Machines/MachineLine.tsx`, contre la règle « aucun secret dans le dépôt » : le sortir du code (réglage de la page, par exemple).
- Implémenter la grille Satisfactory, avec un système d'agrandissement de certaines cases (?).
- Chaque coordonnée doit être un lien pour pinguer en jeu (aujourd'hui, un bouton de la page des machines).

### 9.1 Bâtiments

- Extraction, transformation et générateurs : Miner Mk 1, Miner Mk 2, Miner Mk 3, Water Extractor, Oil Extractor, Resource Well Pressurizer, Resource Well Extractor ; Smelter, Foundry, Constructor, Assembler, Manufacturer, Packager, Refinery, Blender, Particle Accelerator, Quantum Encoder, Converter ; Hub Integrated Biomass Burner, Coal Powered Generator, Fuel Powered Generator, Geothermal Generator, Nuclear Power Plant.
- Hors groupe : Biomass Burner, Alien Power Augmenter, Power Storage.

### 9.2 Idées

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

### 9.3 Endpoints

Numéros d'origine gardés.

- Extraction, transformation et générateurs : 2 getAssembler, 3 getBlender, 4 getConstructor, 5 getConverter, 7 getEncoder, 8 getFactory, 9 getSmelter, 10 getRefinery, 11 getManufacturer, 12 getPackager, 13 getParticle, 14 getFoundry, 22 getExtractor, 23 getFrackingActivator, 30 getGenerators, 31 getBiomassGenerator, 32 getCoalGenerator, 33 getNuclearGenerator, 34 getFuelGenerator, 35 getGeothermalGenerator.
- Lignes d'approvisionnement : 6 getElevators, 16 getCables, 17 getHypertube, 19 getPipes, 21 getTrainRails, 44 getSessionInfo, 45 getResearchTrees, 47 getModList, 72 getUObjectCount.
- Vrac : 15 getBelts, 27 getSpaceElevator, 29 getSwitches, 36 getCloudInv, 37 getWorldInv, 38 getCrateInv, 40 getResourceNode, 41 getResourceDeposit, 42 getResourceGeyser, 43 getResourceWell, 46 getPlayer, 49 getResourceSink, 50 getExplorationSink, 51 getDroneStation, 52 getTrainStation, 53 getTruckStation, 54 getDrone, 55 getExplorer, 56 getFactoryCart, 57 getTractor, 58 getTrains, 59 getTruck, 61 getVehicles, 63 getDoggo, 64 getDropPod, 66 getPowerSlug, 67 getProdStats, 69 getSchematics, 73 getPower, 74 getPowerUsage.

### 9.4 Écarté

- Endpoints écartés, faute de savoir quoi en suivre ni ce que ça apporterait : 1 getChatMessages, 18 getPipeJunctions, 20 getPump, 24 getPortal (même si on pourrait tenter de calculer la surface totale scannée), 25 getRadarTower, 26 getResourceSinkBuilding, 28 getHUBTerminal, 39 getStorageInv, 48 getSinkList, 60 getVehiclePaths, 62 getCreatures, 65 getMapMarkers, 68 getRecipes, 70 getTapes, 71 getUnlockItems, 75 getAll.

## 10. À vérifier hors du dépôt

Ce que le dépôt ne permet pas de savoir : réglages et actions sur le NAS, chez Brevo ou Cloudflare, dans Bitwarden. Une fois vérifié, le point est supprimé, ou devient une tâche dans sa section.

- ⚠️ **Mise en prod de l'authentification.** Les tags `v2026.11.07.01` à `v2026.11.07.05` la contiennent : sont-ils déployés sur le NAS ? Avant le déploiement, les secrets doivent être créés dans Bitwarden puis mis dans `.env.prod` : `AUTH_CODE_HMAC_KEY`, `AUTH_TOTP_ENCRYPTION_KEY` et sa version, et un nouveau `ADMIN_PASSWORD_HASH` en `argon2id` (`pnpm tools hashAdminPassword`). Sans eux, le serveur et la console refusent de démarrer. Les migrations V021 et V022 suppriment les données des projets : en cas de retour arrière, `citadel restore-db pre-deploy` avant `citadel rollback`.
- ⚠️ **En prod, après le déploiement** : une inscription réelle, mails reçus, 2FA, sessions, IP réelle vue à travers Cloudflare, connexion à la console.
- **Brevo** : journaux transactionnels gardés 1 mois (« Retention rules » de son compte), comme l'annonce la page « Données personnelles ».
- **DMARC** : deux semaines après la mise en prod, aucun mail de l'authentification en indésirables et des rapports propres, puis passer à `p=quarantine` (DNS chez Cloudflare).
- **Cookie `lang=fr`** vu en prod, que ni le site ni Caddy ne posent (probablement ancien) : revérifier en navigation privée.
- **Ménage de l'hébergement** : `docker/other` (anciens fichiers de déploiement, hors git) est encore sur le PC ; les packages GHCR `reunification-*` et l'enregistrement DNS `api.` chez Cloudflare ont-ils été supprimés ?
- **Mise en prod des mails** : un message de contact avec email, un sans, un mail direct à `contact@` ; notifications et accusé reçus hors indésirables, une réponse à l'accusé arrive dans la boîte perso, et la réponse au visiteur part de `contact@`.
