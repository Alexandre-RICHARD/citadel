# Angers Irigo

[Citadel](../../README.md) › Angers Irigo

Carte des bus et trams du réseau Irigo (Angers) en temps réel, sur la route `/angers-irigo`, publique. Ce qui reste à faire est dans le [todo](../todo/todo.md#7-angers-irigo).

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Contraintes](#2-contraintes)
3. [Code](#3-code)
4. [Lancer](#4-lancer)
5. [Mettre à jour les horaires théoriques](#5-mettre-à-jour-les-horaires-théoriques)
6. [Sources](#6-sources)

## 1. Fonctionnement

- Une fois par minute, juste après leur actualisation chez Irigo, la page lit les positions des véhicules et leurs prochains passages (GTFS-RT, en protobuf), puis les complète avec les horaires théoriques embarqués : ligne, destination, arrêts, tracés.
- Entre deux signaux, la position d'un véhicule est estimée le long de son tracé (simulation désactivable). Un véhicule immobile depuis plus de 10 minutes est masqué par défaut.
- Arrêts (à partir du zoom 15) et leurs prochains passages, recherche d'arrêt, filtres trams / bus et par ligne, suivi d'un véhicule, repères de temps sur son tracé.
- Favoris : une ligne dans un sens à un arrêt, 5 au plus, avec leurs deux prochains passages.
- Réglages, favoris et filtres sont gardés dans le `localStorage`.

## 2. Contraintes

- Pas de serveur : l'API d'Irigo n'envoie pas d'en-tête CORS, la page passe donc par le relais `/irigo`, le serveur Vite en dev (`vite.config.ts`), le nginx du front en prod (`apps/client/nginx.conf`).
- Les horaires théoriques (GTFS) sont embarqués dans `data/` : quand Irigo publie de nouveaux horaires, destinations et tracés disparaissent jusqu'à leur mise à jour (§5).
- Importé d'un autre dépôt (`map`) en gardant sa structure : les règles de structure de Citadel sont désactivées en tête des fichiers concernés.

## 3. Code

```
apps/client/src/projects/angersIrigo/
├── index.tsx       assemble la carte, le panneau d'infos et les favoris
├── config.ts       URL des flux, intervalles, centre de la carte
├── api/            gtfs-realtime.proto (schéma officiel) et feed.ts (téléchargement et décodage protobuf)
├── data/           GTFS théorique embarqué (routes, stops, trips en .txt, shapes.json) et sa lecture
├── hooks/          useRealtimeFeed, useMarkerAnimation, useShapes, useFavorites… (useLocalStorage et useNow viennent de common)
├── utils/          CSV, géométrie, simulation des déplacements, arrêts, tracés, recherche
├── components/     composants React et leur .scss
├── styles/         styles du projet, sous le conteneur .angers-irigo
└── types/          flux décodé, GTFS théorique, véhicules, arrêts, favoris, paramètres
```

## 4. Lancer

Inclus dans Citadel, sans prérequis propre : voir [Lancer en local](../../README.md#2-lancer-en-local), puis http://localhost:3001/angers-irigo. Les scénarios end-to-end sont M1 à M4 des [scénarios](../e2e/scenarios.md).

## 5. Mettre à jour les horaires théoriques

Le script n'a pas été repris dans Citadel : il se lance dans le dépôt d'origine (`map`), avec Node 24 ou plus.

```sh
pnpm update-gtfs                  # télécharge le zip d'Irigo
pnpm update-gtfs chemin/gtfs.zip  # ou utilise un zip déjà téléchargé
```

Puis copier `src/data/routes.txt`, `stops.txt`, `trips.txt` et `shapes.json` dans `apps/client/src/projects/angersIrigo/data/`.

## 6. Sources

- Temps réel : https://ara-api.enroute.mobi/irigo/gtfs/vehicle-positions et `/trip-updates`
- GTFS théorique : https://chouette.enroute.mobi/api/v1/datas/Irigo/gtfs.zip ([transport.data.gouv.fr](https://transport.data.gouv.fr/datasets?q=irigo))
- Fond de carte : © contributeurs OpenStreetMap
