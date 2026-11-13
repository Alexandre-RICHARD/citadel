# Citadel

Mon monorepo personnel : le site [alexandre-richard.fr](https://alexandre-richard.fr) et ses projets, et la console d'administration du NAS qui les héberge.

## Sommaire

1. [Fonctionnement général](#1-fonctionnement-général)
2. [Lancer en local](#2-lancer-en-local)
3. [Documentation](#3-documentation)

## 1. Fonctionnement général

Un monorepo pnpm. Le front React appelle l'API Express par `/api` (même origine : proxy de Vite en dev, Caddy en prod), qui s'appuie sur MariaDB. Les comptes sont partagés entre tous les projets. Tout tourne sur un NAS, dans Docker, derrière Cloudflare et Caddy.

| Dossier | Rôle |
| --- | --- |
| `apps/client` | Front React : toutes les pages du site, un dossier par projet |
| `apps/server` | API Express et migrations MariaDB |
| `apps/admin` | Console d'administration du NAS |
| `packages/specs` | Contrats partagés front/serveur : endpoints, erreurs, schémas zod |
| `packages/common`, `packages/design-system` | Code et composants partagés |
| `packages/eslint-config`, `packages/typescript-config` | Configurations communes |
| `infra/` | Docker Compose, Caddy, commande `citadel` du NAS |
| `scripts/` | Release, bases Docker de dev, outils (`pnpm tools`) |
| `e2e/` | Tests end-to-end Playwright |
| `docs/` | La documentation, un dossier par sujet (§3) |

## 2. Lancer en local

### 2.1 Prérequis

- Node 24, et pnpm par corepack : `corepack enable`
- Docker Desktop, lancé : les bases MariaDB de dev et de test tournent dedans
- Git Bash pour les scripts
- `.env` et `.env.test` à la racine, copiés de `.env.example` et remplis (les commentaires du modèle disent quoi mettre dans chacun) ; le Backlog demande en plus une application Twitch ([Backlog, §9](docs/backlog/backlog.md#9-lancer))

### 2.2 Démarrage

- `pnpm install`
- `pnpm db:up` : démarre la base de dev et applique les migrations
- `pnpm dev-all` : le front sur http://localhost:3001, qui appelle l'API par `/api`

### 2.3 Autres commandes

| Commande | Effet |
| --- | --- |
| `pnpm lint`, `pnpm check-types` | Lint et types de tout le monorepo |
| `pnpm validate-all` | Lint, types, tests unitaires, d'intégration et end-to-end, builds, audit. La validation d'avant mise en prod, longue : elle se saute si rien n'a changé depuis son dernier succès (`--force` pour la relancer quand même) |
| `pnpm db:migrate`, `pnpm db:reset`, `pnpm db:down` | Migrations seules ; repartir d'une base de dev vide ; arrêter la base |
| `pnpm prod:local` | Les images de prod sur ton PC, https://citadel.localhost:8443 (`pnpm prod:local:down` pour arrêter) |
| `pnpm release` | La mise en prod ([hébergement](docs/ci_cd/ci_cd.md#4-commandes)) |
| `pnpm tools` | Menu des outils de `scripts/` |

## 3. Documentation

### 3.1 Projets

| Projet | Route | Ce que c'est |
| --- | --- | --- |
| [Homepage](docs/homepage/homepage.md) | `/homepage` | La vitrine des projets, le contact et les pages légales |
| [Game Death Counter](docs/gameDeathCounter/gameDeathCounter.md) | `/game-death-counter` | Compteur de morts dans les jeux de type Souls |
| [Backlog](docs/backlog/backlog.md) | `/backlog` | Suivi de mes jeux vidéo, sur les données d'IGDB |
| [Angers Irigo](docs/angersIrigo/angersIrigo.md) | `/angers-irigo` | Bus et trams d'Angers en temps réel |
| [Satisfactory](docs/satisfactory/satisfactory.md) | `/satisfactory` | Outils pour le jeu éponyme |

### 3.2 Transverse

- [Architecture](docs/architecture/architecture.md) : organisation du dépôt et règles communes
- [Authentification](docs/auth/auth.md) : comptes, sessions, 2FA, RGPD
- [Mails](docs/mails/mails.md) : envoi, réception, formulaire de contact, DNS
- [Hébergement et mise en production](docs/ci_cd/ci_cd.md) : NAS, déploiement, sauvegardes, accès

### 3.3 Tests end-to-end

- [Tests end-to-end](docs/e2e/e2e.md) : lancer et écrire les tests Playwright
- [Scénarios](docs/e2e/scenarios.md) : ce que les tests doivent vérifier
- [Vérifications de fin de l'authentification](docs/e2e/auth_verifications.md) : la recette manuelle

### 3.4 Suivi

- [À faire](docs/todo/todo.md)
- [Problèmes connus](docs/problems/problems.md)
