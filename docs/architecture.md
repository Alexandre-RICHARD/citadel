# Architecture

[Citadel](../README.md) › Architecture

Comment le dépôt est rangé, et les règles qui s'y appliquent. La plupart sont imposées par ESLint (`packages/eslint-config`) : la règle citée entre parenthèses fait foi.

## Sommaire

1. [Le dépôt](#1-le-dépôt)
2. [Règles communes](#2-règles-communes)
3. [Specs](#3-specs)
4. [Serveur](#4-serveur)
5. [Front](#5-front)
6. [Paquets partagés](#6-paquets-partagés)
7. [Console d'administration](#7-console-dadministration)
8. [Infra](#8-infra)
9. [Particularités des projets](#9-particularités-des-projets)
10. [Checklists](#10-checklists)

## 1. Le dépôt

Monorepo pnpm. Chaque projet du site (Game Death Counter, Backlog…) a le même nom de dossier, en camelCase, dans les specs, le serveur et le front.

```
├── apps/
│   ├── client/            le site : React 19, Vite, TanStack Query ; un dossier par projet dans src/projects/
│   ├── server/            l'API : Express 5, Sequelize, MariaDB ; un dossier par projet dans src/projects/
│   └── admin/             la console d'administration du NAS (serveur Express + front React)
├── packages/
│   ├── specs/             le contrat entre le front et l'API
│   ├── common/            fonctions partagées, rangées par environnement d'exécution
│   ├── design-system/     composants d'interface partagés, avec Storybook
│   ├── eslint-config/     la config ESLint et les règles maison (rules/)
│   └── typescript-config/
├── infra/                 ce qui tourne sur le NAS
├── scripts/               release.sh, et des outils lancés par pnpm tools
├── docs/
├── Dockerfile             toutes les images, une étape par image
├── compose.dev.yml        MariaDB de dev et de test
└── .env.example           le modèle de toutes les variables
```

`src/todo_folder/` (client et serveur) est une réserve de code mis de côté : ignorée par le lint, et rien ne peut l'importer.

## 2. Règles communes

### Langue

- Code en anglais : types, champs, variables, valeurs des enums.
- Commentaires en français. Ils disent pourquoi, et portent les règles métier délicates : le code fait référence, il n'y a pas de cahier des charges à côté.
- Textes d'interface en français, écrits en dur, sans système de traduction. Dans le JSX, apostrophe typographique (’) dans le texte visible (`react/no-unescaped-entities`).

### Fichiers

- **Un export par fichier** (`citadel/max-one-export`), nommé comme le fichier. Pas d'export par défaut (`import-x/no-default-export`), sauf pour les configs et les stories.
- **Suffixe selon ce qui est exporté** (`no-restricted-syntax`) : un enum dans `*.enum.ts`, un type dans `*.type.ts`, une interface dans `*.interface.ts`. `type` plutôt qu'`interface`, sauf dans un `*.interface.ts`.
- **Casse** : fichiers `.ts` en camelCase, PascalCase réservé à ceux qui exportent une classe (`citadel/file-name-case`) ; un `.tsx` porte le nom de ce qu'il exporte (`citadel/tsx-name-matches-export`).
- **Fonctions** : déclarations (`function foo()`), pas d'expressions fléchées nommées (`func-style`).
- **Imports** : triés (`simple-import-sort`) ; imports de types explicites (`import type`). Le serveur et la console importent avec l'extension `.ts` (Node exécute le TypeScript), le front sans.
- **Format** : Prettier, tabulations, 80 colonnes, guillemets doubles, virgules finales, un attribut JSX par ligne.

### Tests

- Unitaires à côté du fichier testé : `foo.unit.test.ts`. Intégration : `<endpoint>.integration.test.ts`.
- Structure imposée (`citadel/test-structure`) : `describe` du fichier testé (ou de l'endpoint), `describe` du comportement, puis `it("SHOULD … WHEN …")`, en anglais.
- `pnpm validate-all` lance tout : types, lint, tests unitaires, tests d'intégration et builds.

## 3. Specs

`packages/specs` : la source de vérité, partagée par le front et le serveur.

```
src/
├── projects/<projet>/
│   ├── <projet>EndpointRegistry.type.ts     tous les endpoints du projet, pour le routeur typé
│   ├── dto/<entité>/                        réponses : <x>Dto.type.ts
│   ├── endpoint/<ressource>/<action>/       un dossier par endpoint
│   │   ├── <action>Endpoint.interface.ts    méthode, URL, entrées, réponses et codes d'erreur par statut
│   │   ├── <action>BodySchema.ts            schéma zod du corps ; …PathParamSchema, …QueryParamSchema
│   │   └── <action>BodyDto.type.ts          z.infer du schéma
│   ├── error/<projet>ErrorCode.enum.ts      codes métier du projet
│   ├── enum/, schema/                       listes fermées, schémas réutilisés (Backlog)
│   └── rule/                                règles métier communes au front et au serveur (Backlog)
└── specUtils/                               préfixes d'API, statuts HTTP, codes techniques, schémas génériques
```

- **Réponse d'erreur** : `{ code, message }`. `code` est traduit par le front ; `message` aide le développeur et ne s'affiche jamais.
- **Codes** : un enum technique commun (`VALIDATION_FAILED`, `MALFORMED_JSON`, `INVALID_REQUEST`, `ROUTE_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `INTERNAL_ERROR`) et un enum métier par projet. Chaque interface d'endpoint restreint ses codes par statut.
- **400** : chaque `issue` porte `path`, un code de règle (`ValidationIssueCodeEnum`) et un éventuel `limit`. Toute `refine` déclare `params: { code: ValidationIssueCodeEnum.X }`, sinon elle sort en `INVALID_VALUE`.
- **404 métier** (`GAME_NOT_FOUND`…) : la ressource a disparu. À distinguer de `ROUTE_NOT_FOUND`, un bug.
- **Collection vide** : `204` sans corps, seulement pour un endpoint de collection. Un élément sans enfants reste un `200`.

## 4. Serveur

```
src/
├── projects/<projet>/
│   ├── router.ts           routes typées par le registre des specs, avec requestValidator
│   ├── controller/         <entité>Controller.ts : DTO → Bean, appel du service, Bean → DTO, statut
│   ├── service/            <entité>Service.ts : règles métier, transactions, erreurs métier
│   ├── query/<entité>/     <action>Query.ts : une requête, Sequelize ou SQL brut
│   ├── models/             modèles Sequelize, en PascalCase (Game.ts)
│   ├── bean/               <x>Bean.type.ts : ce que le service manipule
│   ├── dbType/             <x>Row.type.ts, <x>Entity.type.ts : formes renvoyées par la base
│   ├── mapper/
│   │   ├── dtoBean/<entité>/      from<X>DtoTo<X>Bean.ts, from<X>BeanTo<X>Dto.ts
│   │   └── beanEntity/<entité>/   from<X>EntityTo<X>Bean.ts
│   └── integrationTest/<ressource>/<endpoint>.integration.test.ts
├── common/                 routeur typé, asyncRequestHandler, runInTransaction
├── error/                  AppError et ses filles (BadRequest, NotFound, Conflict, BadGateway, Database…)
├── middleware/             requestValidator, notFound, unhandledMethod, globalErrorHandler
├── configuration/          env.ts (variables lues et vérifiées au démarrage), sequelize.ts
├── sql/migrations/         migrations Flyway
└── testUtils/              insertions et lectures directes en base pour les tests d'intégration
```

- **Pipeline** : router → controller → service → query. Seuls les contrôleurs voient des DTO ; services et requêtes travaillent en Beans.
- **Validation** : `requestValidator` applique les schémas des specs aux params, à la query et au corps ; le contrôleur reçoit des données propres.
- **Erreurs** : un service lève une `AppError` avec son code ; `globalErrorHandler` la traduit en réponse. Une erreur inattendue sort en 500, sans détail.
- **Base** :
  - une seule base, tables préfixées par projet (`gdc_`, `backlog_`) ;
  - migrations `V<NNN>__<description>.sql`. Une migration passée en prod ne se modifie plus, et le code N-1 doit tourner sur le schéma N ;
  - clés en `INTEGER` (un `BIGINT` arrive en chaîne) ; `created_at` et `updated_at` partout ; `field` explicite sur chaque colonne Sequelize ;
  - Sequelize pour les lectures et écritures simples, SQL brut pour les agrégats. Associations déclarées dans le modèle « enfant », pour éviter les imports circulaires.
- **Tests d'intégration** : sur une vraie MariaDB (`mariadb-test`), recréée et migrée au début de chaque lancement, jamais nettoyée entre deux tests ; ordre aléatoire (`sequence.shuffle`), pour révéler les dépendances cachées entre endpoints.

## 5. Front

```
src/
├── projects/<projet>/
│   ├── index.tsx           point d'entrée, chargé à la demande par le routeur
│   ├── api/                seule couche qui parle au réseau (ci-dessous)
│   ├── components/         composants propres au projet, dont Layout
│   ├── pages/<Page>/
│   │   ├── index.tsx
│   │   └── components/<Composant>/index.tsx
│   ├── helper/, hooks/
│   └── variables.scss, *.module.scss   variables et feuille partagée du projet
├── common/                 api/ (fetch, cache, mutation, erreurs), validation, toast
├── react/                  AppContainer, ErrorBoundary, QueryErrorBoundary, AppToaster, appNavigation (routes, fiche de
│                           chaque projet, transitions entre projets), projectTheme (thème clair ou sombre de chaque projet)
├── configuration/          tanStackQueryClient.ts
└── styles/
```

### Composants

- Un dossier par composant, en PascalCase (`citadel/component-folder-case`). Son `index.tsx` exporte le nom du dossier, un autre `.tsx` porte le nom de son export (`Layout/Layout.tsx`). Le dossier d'un projet reste en camelCase.
- Son `.module.scss` porte le nom du dossier en camelCase (`citadel/scss-module-name`). Une feuille partagée importée via `../` est libre.
- Pas de props étalées (`react/jsx-props-no-spreading`) ; pas d'index comme clé.
- Icônes lucide-react ; aucun emoji dans l'interface.

### Thème

- Le thème de chaque projet, en clair et en sombre, est rangé dans le design system (`theme/projectThemes/`) ; sa fiche y renvoie. Le projet l'applique, la homepage en tire ses ambiances.
- Le Layout passe par `ProjectThemeProvider` : jetons sur ses composants et sur `<html>` (portails, fond), polices du thème, `data-color-scheme` sur `<html>` pour les styles propres au projet.
- Clair ou sombre : la préférence du système, sauf choix fait dans le projet (`useProjectColorScheme`, depuis n'importe quel composant). Le choix n'est gardé (`citadel:<projet>:theme`, localStorage) que s'il diffère du système.

### Couche `api/` d'un projet

```
api/
├── <projet>QueryKeys.ts      clés des lectures et des mutations
├── <projet>ErrorReasons.ts   code métier → raison en français
├── <projet>FieldLabels.ts    champ du corps → libellé (« le nom »)
├── model/                    Front Models (*Fm.type.ts) et mappers DTO → FM, testés
├── cache/                    lecture et écriture du cache (en DTO), testées
└── <entité>/                 un hook par endpoint
```

- **Frontière** : seuls `projects/*/api/**` et `common/api/**` importent un DTO, une interface d'endpoint ou `fetchHandler` (`no-restricted-imports`). Les schémas zod restent importables partout, pour valider une saisie.
- **Cache en DTO, écran en FM** : le cache garde la réponse brute, le hook mappe dans `select`. Le FM porte ce dont l'écran a besoin : drapeaux dérivés (`isTemporary`…), tris, `null` d'un 204 converti en liste vide. Le tri se refait dans le mapper, pour qu'un élément ajouté de façon optimiste prenne tout de suite sa place.
- **Query keys** : une fabrique par projet, avec des racines distinctes pour la liste et le détail (`["gameDeathCounter", "gameList"]`, `["gameDeathCounter", "game", id]`) : les clés se comparent par préfixe.

### Lecture

- `useSuspenseQuery` ; le hook renvoie directement le FM. Ne charger que ce qui s'affiche (le détail d'un jeu à son dépliage).
- Une donnée lue hors de sa zone passe par `useQuery` sur les mêmes `queryOptions` : même requête, sans suspension.
- **Une zone = trois couches** : `QueryErrorBoundary` (message d'erreur, « Réessayer » seulement pour une erreur passagère) > `Suspense` avec un `Skeleton` > un petit composant qui appelle le hook et passe les données à un composant d'affichage. Le squelette réutilise ce composant d'affichage, avec des données factices rangées à côté (`bossListPlaceholder.ts`) ; il reste invisible 300 ms.
- Un `QueryErrorBoundary` global entoure l'`<Outlet />` du Layout de chaque projet.
- **Réseau** : `staleTime` 30 s ; une lecture rejouée 2 fois au plus, sur une erreur passagère seulement ; `networkMode: "always"` (hors ligne, l'erreur s'affiche tout de suite).

### Écriture

Toute mutation passe par `useOptimisticMutation` (`common/api/mutation`).

- **Tout est optimiste**, créations comprises : un élément créé reçoit un id temporaire négatif (`createTemporaryId`), s'affiche grisé et `inert` jusqu'à la réponse. Les compteurs où il compte suivent tout de suite.
- **Le hook est lié à son élément** : les ids sont ses arguments, les variables de `mutate` le corps de la requête (`useUpdateGame(game.id).mutate({ name })`).
- **`mutationKey`** par action et par élément : une seule mutation à la fois par clé, le bouton désactivé avec `isPending`. **`scope`** : des mutations dépendantes partagent un scope, leurs requêtes partent dans l'ordre, leur optimistic s'applique tout de suite.
- **`applyOptimistic`** écrit le résultat attendu ; **`revertOptimistic`** le défait par l'opération inverse, jamais en restaurant un instantané, qui écraserait les autres mutations en cours ; **`applyServerResponse`** remplace la valeur optimiste par la réponse ; **`getAffectedQueryKeys`** liste les lectures à invalider quand la dernière mutation en cours se termine ; **`removeGoneResource`** retire la ressource des caches sur un 404 métier.
- PATCH : n'envoyer que les champs modifiés. Une suppression en cascade se confirme (`ConfirmDialog`) en disant ce qu'elle emporte.
- Les fonctions de cache passent par les helpers de `common/api/cache` (`replaceById`, `removeById`, `locateById`, `insertAt`). Un cache absent ne se crée jamais de toutes pièces.

### Erreurs et saisie

- **Message unique** : « Impossible de {action} : {raison}. » (`buildFailureMessage`). Raison par priorité : serveur injoignable, champ invalide (« le nom doit contenir au plus 255 caractères »), code métier, code technique, famille du statut, erreur inattendue.
- Un échec de mutation part en toast ; un échec de lecture remplace sa zone. Une réponse d'API en erreur ne se logge jamais en console ; une erreur qui ne vient pas de l'API est un bug, et se logge.
- **Saisie** : `checkInput(schema, valeurs, fieldLabels)` applique le schéma de l'endpoint ; on envoie sa sortie, déjà nettoyée. Le message s'affiche sous le champ, sauf champ vide (le bouton désactivé suffit).

### Tests

Uniquement des tests unitaires de fonctions pures : mappers DTO → FM, fonctions de cache (avec un vrai `QueryClient`), helpers. Pas de test de composant.

## 6. Paquets partagés

- **`common`** : `universal/` (ni DOM ni Node), `browser/` et `react/` (pas de Node). ESLint interdit à chaque dossier ce que son environnement ne fournit pas.
- **`design-system`** : `atoms/`, `molecules/`, `organisms/`, thème (dont celui de chaque projet) et styles. Chaque composant a sa story (Storybook : `pnpm --filter @citadel/design-system dev`, port 3002).

## 7. Console d'administration

`apps/admin` : un seul paquet et un seul `tsconfig`, avec `src/server/` (Express, un dossier par source : docker, torrent, vpn, access, deadlines…), `src/client/` (React, design system) et `src/shared/` (types échangés entre les deux). Elle n'a pas de base : ses historiques sont des fichiers JSON déposés par `infra-ops`.

## 8. Infra

```
infra/
├── compose.yml          le projet Compose unique du NAS : tous les services, groupés par préfixe
│                        (infra-, site-prod-, site-preprod-, media-)
├── compose.local.*      la prod sur ton PC (pnpm prod:local)
├── Caddyfile            quel nom et quel chemin vont vers quel conteneur
├── citadel              la commande du NAS : deploy, rollback, start, stop, status, logs, up…
├── mariadb-init.sh      crée les comptes de la base à sa création
└── ops/crontab          planning des tâches d'infra-ops
apps/client/nginx.conf   conf du conteneur front : SPA, relais /irigo
.github/workflows/images.yml   construit et publie les images à chaque tag v*
scripts/release.sh             lancé par pnpm release
```

Sur le NAS :

```
/Volume1/citadel/        citadel, .env.prod (600), rclone.conf (600), state/ (version, historiques, logs)
/Volume1/appdata/<svc>/  données de chaque service, dont site-prod-db/
/Volume2/data/           médias et torrents
/Volume2/backups/        dumps de la base
```

Les fichiers d'infra sont commentés abondamment, en français : pourquoi et comment, même si les commentaires dépassent le code. Le détail des choix est dans le [cahier des charges de l'hébergement](ci_cd/cahier_des_charges.md).

## 9. Particularités des projets

### Game Death Counter

L'implémentation de référence de tout ce qui précède : en cas de doute, s'en inspirer.

### Backlog

- **Specs** : en plus des endpoints, `rule/` porte les règles que le front et le serveur appliquent à l'identique : statuts et leur conversion, agrégats d'une ligne, numéros dans une série, tri et filtres écrits dans l'URL.
- **Serveur** :
  - `igdb/` est le seul accès à IGDB : token Twitch tiré et renouvelé par `igdbClient`, appels espacés sous 4 par seconde, fiche gardée 10 minutes ;
  - `view/` calcule chaque ligne du tableau, puis la filtre, la trie et la découpe en pages : les valeurs calculées ne sont jamais stockées ;
  - tables : base globale (données IGDB : jeux, versions, plateformes, DLC, séries, sociétés, avec les id d'IGDB) et base utilisateur (jeux du backlog, versions jouées, DLC faits).
- **Front** : `components/` (Button, Modal, Select…) et `variables.scss` portent l'identité visuelle du projet, en attendant leur fusion avec le design system ; `backlog.module.scss` est la feuille partagée de la page.

### Angers Irigo

Importé d'un autre dépôt (`map`) en gardant sa structure : les règles de structure de Citadel sont désactivées en tête des fichiers concernés. Pas de serveur : la page lit l'API d'Irigo par le relais `/irigo`.

```
projects/angersIrigo/
├── index.tsx       assemble la carte, le panneau d'infos et les favoris
├── config.ts       URL des flux, intervalles, centre de la carte
├── api/            gtfs-realtime.proto (schéma officiel) et feed.ts (téléchargement et décodage protobuf)
├── data/           GTFS théorique embarqué (routes, stops, trips en .txt, shapes.json) et sa lecture
├── hooks/          useRealtimeFeed, usePersistentState, useShapes, useFavorites…
├── utils/          CSV, géométrie, simulation des déplacements, arrêts, tracés, recherche
├── components/     composants React et leur .scss
├── styles/         styles du projet, sous le conteneur .angers-irigo
└── types/          flux décodé, GTFS théorique, véhicules, arrêts, favoris, paramètres
```

### Homepage

La vitrine des projets, animée : le modèle à suivre pour des effets visuels.

```
projects/homepage/
├── index.tsx        /homepage, /homepage/<projet sélectionné>, /homepage/<page du footer>
├── components/      Layout (ambiance, vues, intro, titre de l'onglet), Header, Footer, Background, Intro, Logo
├── pages/           Showcase (roue des projets et présentation), FooterPage
├── ambiance/        variables --ambiance-*, tirées du thème du projet sélectionné et animées d'un projet à l'autre
├── effects/         un effet par fichier, sans React : lampe à lave (WebGL), fonds animés (canvas), animations GSAP
├── routing/, content/, hooks/
└── variables.scss   jetons et mixins de l'ambiance
```

- Un effet est une fonction `create…` qui reçoit un canvas ou un élément, et rend de quoi le piloter et le détruire. Le composant le crée dans un `useEffect` et lui transmet ses props.
- Les transitions entre projets sont hors de la homepage (`react/appNavigation/projectTransition`) : montées hors du routeur, elles survivent au changement de page. `navigateToProject` en lance une ; l'`AppContainer` de la page qui arrive prévient qu'elle est affichée.

## 10. Checklists

### Brancher un nouvel endpoint

1. Specs : dossier de l'endpoint (interface avec ses codes d'erreur par statut, schémas, DTO), ajout au registre ; `params.code` sur chaque `refine`.
2. Serveur : requête, Bean et mappers, service, contrôleur, route ; tests d'intégration.
3. Front : FM et mapper testé dans `api/model`, accesseurs de cache, hook (`useSuspenseQuery` + `select`, ou `useOptimisticMutation` avec son opération inverse).
4. Composant : une zone pour une lecture ; `isPending`, `checkInput` et éventuellement `ConfirmDialog` pour une écriture.

### Brancher un nouveau projet

1. Specs : préfixe dans `ApiPrefixEnum`, enum des codes métier, registre des endpoints.
2. Serveur : `router.ts` branché dans `globalRouter.ts`, enum des codes dans `errorCode.type.ts`, tables préfixées dans une migration.
3. Front : fiche et route dans `react/appNavigation`, `<projet>QueryKeys.ts`, `<projet>ErrorReasons.ts` exhaustif, `<projet>FieldLabels.ts` ; thème dans `projectThemes` du design system, présentation (`showcase`) dans la fiche ; Layout avec `ProjectThemeProvider`, `QueryErrorBoundary` global autour de l'`<Outlet />` et `AppToaster`, et un bouton qui bascule entre clair et sombre.
