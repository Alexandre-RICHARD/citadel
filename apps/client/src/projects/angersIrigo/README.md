# Angers Irigo en temps réel

Carte des bus et trams du réseau Irigo (Angers), mise à jour toutes les 15 secondes.

Projet de l'appli client de Citadel, servi sur la route `/angers-irigo`. Il a été importé d'un
répo externe (`map`) en gardant sa structure : les règles ESLint de structure de Citadel (un
export par fichier, `.type.ts`, nommage des fichiers, un dossier par composant) sont désactivées
en tête des fichiers concernés.

## Lancer l'appli

Depuis `apps/client` :

```sh
pnpm dev
```

Le navigateur s'ouvre sur http://localhost:3001 ; le projet est sur http://localhost:3001/angers-irigo.
Depuis la racine du monorepo, `pnpm dev-all` lance toutes les applis.

Autres commandes (depuis `apps/client`, communes à toute l'appli) :

- `pnpm check-types` : vérifie les types (tsc)
- `pnpm lint` / `pnpm lint-fix` : vérifie le code (et corrige ce qui peut l'être, dont le
  formatage Prettier), avec la config partagée `@citadel/eslint-config`
- `pnpm validate-all` : types, lint, tests et build

## Fonctionnement

1. Toutes les 15 s, la page demande deux flux : les positions des véhicules
   (`/irigo/gtfs/vehicle-positions`) et les mises à jour de trajet (`/irigo/gtfs/trip-updates`),
   qui donnent les heures de passage prévues pour l'heure à venir.
2. Les requêtes passent par le proxy `/irigo` du serveur de dev Vite (voir
   `apps/client/vite.config.ts`). Il est indispensable : l'API d'Irigo n'envoie pas d'en-tête
   CORS, donc un navigateur refuse de lire sa réponse s'il l'appelle directement.
3. Les positions sont au format [GTFS-Realtime](https://gtfs.org/realtime/) : du binaire protobuf,
   décodé avec protobufjs grâce au schéma officiel (`api/gtfs-realtime.proto`).
4. Le flux ne contient que des identifiants (ligne `A`, arrêt `LORRTERM`, course `6893650`…).
   Chaque véhicule est complété avec le [GTFS théorique](https://gtfs.org/schedule/) embarqué
   dans `data/` : nom et couleur de la ligne, tram ou bus, destination, nom de l'arrêt.
   Les mises à jour de trajet ajoutent l'heure prévue au prochain arrêt et au terminus (ou
   « dans plus d'1 h » quand il est au-delà de l'heure que le flux prévoit).
5. Chaque véhicule devient un marqueur sur une carte Leaflet. Les trams prennent la couleur
   de leur ligne. Irigo ne renouvelle les positions qu'une fois par minute : chaque marqueur
   glisse en une seconde vers sa nouvelle position au lieu de s'y téléporter.
   Avec le paramètre « Simulation des déplacements » (activé par défaut), les véhicules avancent
   en continu le long du tracé de leur course : ils visent chaque arrêt à venir à son heure
   prévue et y attendent l'heure de départ. Chaque position reçue recale la simulation
   (`utils/simulation.ts`). Les véhicules sans signal depuis plus de 10 min sont masqués, ou
   estompés si le paramètre est activé : le flux garde des véhicules qui n'émettent plus depuis
   des heures (voir `STALE_POSITION_SECONDS`).
6. À partir du zoom 15, les arrêts s'affichent (quais de même nom regroupés, à moins de 300 m).
   Un clic montre leurs prochains passages, tirés des mises à jour de trajet : uniquement
   l'heure à venir, le flux ne prévoyant pas plus loin.
7. Un clic sur un véhicule affiche le tracé complet de sa course, aux couleurs de sa ligne :
   déjà parcouru en pâle, reste à parcourir en plein. Ses arrêts sont cliquables comme les
   autres ; le tracé reste affiché jusqu'à un clic sur le fond de carte. Les tracés
   (`data/shapes.json`) sont chargés en arrière-plan, après l'affichage de la carte (en dev ;
   au build, le découpage de Citadel les range dans le même fichier que le reste du projet).
   Le bouton « Suivre ce véhicule » de sa popup garde la carte centrée sur lui : elle glisse au
   même rythme que le marqueur. Zoomer ne l'interrompt pas ; déplacer la carte ou le × du
   bandeau en bas, si.
8. Dans la popup d'un arrêt, l'étoile d'une colonne ajoute ce sens de la ligne aux favoris
   (5 au plus). L'encadré en haut à droite donne leurs deux prochains passages ; un clic centre
   la carte sur l'arrêt et ouvre sa popup, même si les arrêts sont masqués. Sur mobile,
   l'encadré est replié en un bouton ★.
9. La recherche du panneau d'infos trouve un arrêt par son nom, sans tenir compte des accents
   (« avrille ard » → Avrillé-Ardenne) ; les lignes qui le desservent départagent les homonymes.
   Choisir un arrêt centre la carte dessus et ouvre sa popup, comme un favori.
10. Sous Tous / Trams / Bus, « Lignes » propose les lignes en circulation avec leur nombre de
    véhicules : en choisir une ou plusieurs n'affiche qu'elles. Passer à « Trams » ou « Bus » ne
    garde que les lignes choisies de ce mode.
11. Les paramètres, les filtres et les favoris sont mémorisés dans le navigateur (localStorage).

Le proxy n'existe que sur le serveur de dev Vite : le build (`apps/client/build/`) est statique,
et les flux temps réel n'y fonctionneront pas sans un autre proxy.

## Structure

Dossier `apps/client/src/projects/angersIrigo/` :

```
├── index.tsx             composant AngersIrigo (chargé à la demande par le routeur) : assemble
│                         la carte, le panneau d'infos et les favoris
├── config.ts             URL du flux, intervalles, centre de la carte
├── api/
│   ├── gtfs-realtime.proto   schéma GTFS-RT officiel
│   └── feed.ts               téléchargement et décodage d'un flux temps réel
├── data/                 GTFS théorique embarqué (voir « Mettre à jour le GTFS théorique »)
│   ├── routes.txt        lignes
│   ├── stops.txt         arrêts
│   ├── trips.txt         courses, leur destination et leur tracé
│   ├── shapes.json       tracés simplifiés et position de leurs arrêts
│   ├── gtfs-static.ts    lecture des .txt
│   ├── stop-groups.ts    arrêts affichés (quais regroupés)
│   ├── main-destinations.ts  destination principale de chaque sens
│   └── shapes.ts         chargement des tracés à la demande
├── hooks/                useRealtimeFeed, usePersistentState, useNow, useShapes, useFavorites…
├── utils/                CSV, géométrie, formatage, véhicules, arrêts, tracés, recherche…
├── components/           composants React (+ leur .scss)
├── styles/               variables SCSS et styles du projet (main.scss, sous le conteneur .angers-irigo)
└── types/
    ├── gtfs-realtime.ts  types complets du flux décodé
    ├── gtfs-static.ts    lignes, arrêts et courses du GTFS théorique
    ├── geo.ts            points et lignes brisées
    ├── shape.ts          tracés des courses
    ├── stop.ts           arrêt affiché et passages prévus
    ├── favorite.ts       favori : un sens d'une ligne à un arrêt
    ├── settings.ts       paramètres de l'utilisateur
    ├── load-status.ts    état de chargement d'un flux
    └── vehicle.ts        véhicule affichable sur la carte
```

Ailleurs dans Citadel : la route et la fiche du projet dans `apps/client/src/react/appNavigation/`
(`routes.ts`, `projectsDictionary.ts`), le proxy dans `apps/client/vite.config.ts`, et les
dépendances (`leaflet`, `react-leaflet`, `protobufjs`) dans `apps/client/package.json`.

## Données

- Positions : https://ara-api.enroute.mobi/irigo/gtfs/vehicle-positions
- Mises à jour de trajet : https://ara-api.enroute.mobi/irigo/gtfs/trip-updates
- GTFS théorique : https://chouette.enroute.mobi/api/v1/datas/Irigo/gtfs.zip
- Jeu de données : [Réseau urbain Irigo sur transport.data.gouv.fr](https://transport.data.gouv.fr/datasets?q=irigo)
- Fond de carte : © contributeurs OpenStreetMap

### Mettre à jour le GTFS théorique

Les identifiants de course changent quand Irigo publie de nouveaux horaires : les destinations
sont alors remplacées par le nom de la ligne et les tracés n'apparaissent plus.

Le script de mise à jour (`scripts/update-gtfs.ts`) n'a pas été repris dans Citadel : il reste
dans le répo d'origine (`map`). Pour l'instant, il faut l'y lancer :

```sh
pnpm update-gtfs                  # télécharge le zip
pnpm update-gtfs chemin/gtfs.zip  # ou utilise un zip déjà téléchargé
```

puis copier les fichiers générés (`src/data/routes.txt`, `stops.txt`, `trips.txt` et
`shapes.json`) dans `data/` ici.

Le script copie `routes.txt`, `stops.txt` et `trips.txt` tels quels. Il génère `shapes.json`
à partir de `shapes.txt` (8 Mo) et `stop_times.txt` (14 Mo), trop lourds pour être embarqués :
tracés simplifiés à 2 m près, encodés en « polyline », et distance de chaque arrêt depuis le
début du tracé. Il faut Node 24 ou plus, qui exécute le TypeScript sans compilation.

## À corriger

- quand on a la petite modal d'un véhicule ouvert, on ne peut pas faire défiler la carte loin, l'emplacement de la modal nous empêche d'aller plus loin
- En haut à gauche, on a bien le nombre de seconde depuis que les dernières données ont été reçues, mais quand je suis sur un véhicule, ça marque toujours "Position estimée (signal reçu maintenant)". Et si je désactive la simulation des déplacements, ça indique "Position
  il y a 1 s
