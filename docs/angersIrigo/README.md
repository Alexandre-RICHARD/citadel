# Angers Irigo en temps réel

[Citadel](../../README.md) › Angers Irigo

Carte des bus et trams du réseau Irigo (Angers), sur la route `/angers-irigo`. Une fois par minute, juste après leur actualisation chez Irigo, la page lit les positions des véhicules et leurs prochains passages, puis les complète avec les horaires théoriques embarqués : ligne, destination, arrêts, tracés. Arrêts favoris, recherche d'arrêt, filtres, suivi d'un véhicule et repères de temps sur son tracé ; réglages gardés dans le navigateur.

Importé d'un autre dépôt (`map`) en gardant sa structure : les règles ESLint de structure de Citadel sont désactivées en tête des fichiers concernés.

## Contraintes

- L'API d'Irigo n'envoie pas d'en-tête CORS : la page passe par le relais `/irigo`, le serveur Vite en dev, le nginx du front en prod.
- Les horaires théoriques (GTFS) sont embarqués dans `data/` : quand Irigo publie de nouveaux horaires, destinations et tracés disparaissent jusqu'à leur mise à jour.

## Lancer

Inclus dans Citadel, sans prérequis propre : voir [Lancer en local](../../README.md#lancer-en-local), puis http://localhost:3001/angers-irigo.

## Mettre à jour les horaires théoriques

Le script n'a pas été repris dans Citadel : il se lance dans le dépôt d'origine (`map`), avec Node 24 ou plus.

```sh
pnpm update-gtfs                  # télécharge le zip d'Irigo
pnpm update-gtfs chemin/gtfs.zip  # ou utilise un zip déjà téléchargé
```

Puis copier `src/data/routes.txt`, `stops.txt`, `trips.txt` et `shapes.json` dans `apps/client/src/projects/angersIrigo/data/`.

## Données

- Temps réel : https://ara-api.enroute.mobi/irigo/gtfs/vehicle-positions et `/trip-updates`
- GTFS théorique : https://chouette.enroute.mobi/api/v1/datas/Irigo/gtfs.zip ([transport.data.gouv.fr](https://transport.data.gouv.fr/datasets?q=irigo))
- Fond de carte : © contributeurs OpenStreetMap
