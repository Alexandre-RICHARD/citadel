# Citadel

Mon monorepo personnel : le site [alexandre-richard.fr](https://alexandre-richard.fr) et ses projets (front React, API Express et MariaDB), et la console d'administration du NAS qui les héberge.

| Projet | Route | Ce que c'est |
| --- | --- | --- |
| [Game Death Counter](docs/gameDeathCounter/README.md) | `/game-death-counter` | Compteur de morts dans les jeux de type Souls |
| [Backlog](docs/backlog/README.md) | `/backlog` | Suivi de mes jeux vidéo, sur les données d'IGDB |
| [Angers Irigo](docs/angersIrigo/README.md) | `/angers-irigo` | Bus et trams d'Angers en temps réel |
| Satisfactory | `/satisfactory` | Calculateur pour le jeu éponyme |

Autres docs : [architecture et conventions](docs/architecture.md), [hébergement et mise en production](docs/ci_cd/README.md), [à faire](TODO.md).

## Lancer en local

### Prérequis

- Node 24, et pnpm par corepack : `corepack enable`
- Docker Desktop, lancé : les bases MariaDB de dev et de test tournent dedans
- Git Bash pour les scripts (`pnpm release`)
- `.env` et `.env.test` à la racine, copiés de `.env.example` et remplis (les commentaires du modèle disent quoi mettre dans chacun)

### Démarrage

- `pnpm install`
- `pnpm db:up` : démarre la base de dev et applique les migrations
- `pnpm dev-all` : le front sur http://localhost:3001, qui appelle l'API par `/api`

### Autres commandes

- `pnpm validate-all` : types, lint, tests (la base de test est recréée à chaque lancement), builds
- `pnpm db:reset` : repart d'une base de dev vide
- `pnpm prod:local` : les images de prod sur ton PC, https://citadel.localhost:8443 (`pnpm prod:local:down` pour arrêter)
- `pnpm release` : la mise en prod ([hébergement](docs/ci_cd/README.md))
