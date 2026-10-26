# Backlog

[Citadel](../../README.md) › Backlog

Suivi de mes jeux vidéo, sur la route `/backlog`. On cherche un jeu sur IGDB, on l'enregistre avec les versions et DLC voulus, puis on l'ajoute au backlog sur une plateforme : statut, temps, note, DLC faits… se suivent dans un tableau triable et filtrable.

## Contraintes

- IGDB refuse les navigateurs : seul le serveur l'appelle. Il tire lui-même le token Twitch de l'application, le renouvelle, et reste sous 4 requêtes par seconde.
- Les images s'affichent directement depuis IGDB : seule leur référence est stockée.
- Pas encore de comptes : un seul backlog.

## Prérequis

Une application Twitch (https://dev.twitch.tv/console/apps), dont le Client-ID et le secret vont dans `.env` : `INTERNET_GAME_DATA_BASE_CLIENT_ID` et `INTERNET_GAME_DATA_BASE_CLIENT_SECRET`. Sans elles, le serveur ne démarre pas.

## Lancer

Inclus dans Citadel : voir [Lancer en local](../../README.md#lancer-en-local), puis http://localhost:3001/backlog.
