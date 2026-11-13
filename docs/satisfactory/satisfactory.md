# Satisfactory

[Citadel](../../README.md) › Satisfactory

Outils pour le jeu *Satisfactory*, sur la route `/satisfactory`, publique. Seule la page des machines est réalisée ; les idées et les endpoints à exploiter sont dans le [todo](../todo/todo.md#9-satisfactory).

## Sommaire

1. [Fonctionnement](#1-fonctionnement)
2. [Code](#2-code)
3. [Lancer](#3-lancer)

## 1. Fonctionnement

- **Source** : le serveur web du mod Ficsit Remote Monitoring (FRM), qui tourne avec la partie, sur `http://localhost:8080`. La page l'appelle directement depuis le navigateur, sans passer par l'API de Citadel : elle ne marche que sur le PC où le jeu tourne.
- **Navigation** : homepage, recipes, calculator, machines, settings, et le choix clair / sombre. Les pages autres que les machines sont provisoires.
- **Machines** (`/satisfactory/frm/all-machines`) : extracteurs, usines et générateurs relus toutes les 5 s, puits AWESOME (ressources et exploration) toutes les 30 s. Tableau trié par efficacité croissante (nom, surcadençage, efficacité, consommation, production, coordonnées), filtre « Uniquement les non efficient », brûleurs de biomasse du HUB ignorables (retirés aussi de la moyenne), moyenne d'efficacité, points restants avant le prochain coupon. Un clic sur des coordonnées pose un ping dans le jeu (`createPing`).
- Serveur de jeu injoignable : la page reste affichée, tableau vide, sans message.

## 2. Code

- Front : `apps/client/src/projects/satisfactory/` ; `api/` (un hook par lecture de FRM, intervalles dans `dictionaries/loopRequestDelay.ts`), `pages/`, `helper/` (coût des paliers de coupons, machines affichables), `enums/gameClassNames.enum.ts` (noms de classes du jeu).
- Specs : `packages/specs/src/projects/satisfactory/` décrit les réponses de FRM utilisées (`getExtractor`, `getFactory`, `getGenerators`, `getResourceSink`, `getExplorationSink`). Aucun code serveur.

## 3. Lancer

Inclus dans Citadel : voir [Lancer en local](../../README.md#2-lancer-en-local), puis http://localhost:3001/satisfactory. Pour la page des machines : une partie lancée avec le mod FRM et son serveur web actif. Les scénarios end-to-end sont M5 et M6 des [scénarios](../e2e/scenarios.md).
