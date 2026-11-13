# Architecture

[Citadel](../../README.md) › Architecture

Comment le dépôt est rangé, et les règles communes à tous les projets. La plupart sont imposées par ESLint (`packages/eslint-config`) : la règle citée entre parenthèses fait foi. Ce qui est propre à un projet est dans sa doc ([README](../../README.md#3-documentation)).

## Sommaire

1. [Le dépôt](#1-le-dépôt)
2. [Règles communes](#2-règles-communes)
3. [Specs](#3-specs)
4. [Serveur](#4-serveur)
5. [Front](#5-front)
6. [Paquets partagés](#6-paquets-partagés)
7. [Console d'administration](#7-console-dadministration)
8. [Infra](#8-infra)
9. [Checklists](#9-checklists)
10. [Glossaire](#10-glossaire)

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
├── e2e/                   tests end-to-end Playwright
├── scripts/               release.sh, scripts des bases Docker, et des outils lancés par pnpm tools
├── .github/workflows/     construit et publie les images (§8)
├── docs/                  la documentation : un dossier par sujet
├── Dockerfile             toutes les images, une étape par image
├── compose.dev.yml        MariaDB de dev et de test
└── .env.example           le modèle de toutes les variables (.env.prod.example pour le NAS)
```

`src/todo_folder/` (client et serveur) est une réserve de code mis de côté : ignorée par le lint, et rien ne peut l'importer.

## 2. Règles communes

### 2.1 Langue

- Code en anglais : types, champs, variables, valeurs des enums.
- Commentaires en français. Ils disent pourquoi, et portent les règles métier délicates : le code fait référence. La doc de chaque projet en donne la vue d'ensemble et les décisions.
- **Vouvoiement partout, sauf dans les emails** : le site, la console d'administration et les textes d'interface cités dans les docs vouvoient (« Votre profil », « Protégez votre compte »). Seuls les gabarits d'emails tutoient.
- Textes d'interface en français, écrits en dur, sans système de traduction. Seules les raisons d'erreur et les libellés de champs sont centralisés, en `Record<Enum, string>` pour être exhaustifs. Dans le JSX, apostrophe typographique (’) dans le texte visible (`react/no-unescaped-entities`).

### 2.2 Fichiers

- **Un export par fichier** (`citadel/max-one-export`), nommé comme le fichier. Pas d'export par défaut (`import-x/no-default-export`), sauf pour les configs et les stories.
- **Suffixe selon ce qui est exporté** (`no-restricted-syntax`) : un enum dans `*.enum.ts`, un type dans `*.type.ts`, une interface dans `*.interface.ts`. `type` plutôt qu'`interface`, sauf dans un `*.interface.ts`.
- **Casse** : fichiers `.ts` en camelCase, PascalCase réservé à ceux qui exportent une classe (`citadel/file-name-case`) ; un `.tsx` porte le nom de ce qu'il exporte (`citadel/tsx-name-matches-export`).
- **Fonctions** : déclarations (`function foo()`), pas d'expressions fléchées nommées (`func-style`).
- **Imports** : triés (`simple-import-sort`) ; imports de types explicites (`import type`). Le serveur et la console importent avec l'extension `.ts` (Node exécute le TypeScript), le front sans.
- **Format** : Prettier, tabulations, 80 colonnes, guillemets doubles, virgules finales, un attribut JSX par ligne.

### 2.3 Tests

- Unitaires à côté du fichier testé : `foo.unit.test.ts`. Intégration : `<endpoint>.integration.test.ts`. End-to-end : [tests end-to-end](../e2e/e2e.md).
- Structure imposée (`citadel/test-structure`) : `describe` du fichier testé (ou de l'endpoint), `describe` du comportement, puis `it("SHOULD … WHEN …")`, en anglais.
- `pnpm validate-all` lance tout : lint, types, tests unitaires, d'intégration et end-to-end, builds, audit ([scripts/validation/validateAll.sh](../../scripts/validation/validateAll.sh)). Il se saute si rien n'a changé hors de `docs/` et des `.md` depuis son dernier succès (`--force` pour le relancer).

### 2.4 Git et versions

- Un seul dépôt, une seule branche de mise en production : `main`. `pnpm tools release` exige d'être dessus, sans rien de non commité, et à jour avec GitHub.
- Message de commit en français, sous la forme `sujet : ce qui change`, le sujet étant la partie touchée (`docs`, `e2e`, `console`, `tableau`, `auth`…). Un commit par changement cohérent : l'historique se relit.
- Une version est un tag `vAAAA.MM.JJ.NN` (`v2026.11.07.01`, puis `.02` le même jour), créé par `pnpm tools release` et porté par toutes les images ([infra, §2](../infra/infra.md#2-contraintes)).

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
│   └── helper/                              fonctions métier communes au front et au serveur (Backlog)
└── specUtils/                               préfixes d'API, statuts HTTP, codes techniques, schémas génériques
```

- **Réponse d'erreur** : `{ code, message }`. `code` est traduit par le front ; `message` aide le développeur et ne s'affiche jamais.
- **Codes** : un enum technique commun (`VALIDATION_FAILED`, `MALFORMED_JSON`, `INVALID_REQUEST`, `ROUTE_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `FOREIGN_ORIGIN`, `INTERNAL_ERROR`…) et un enum métier par projet. Chaque interface d'endpoint restreint ses codes par statut.
- **400** : chaque `issue` porte `path`, un code de règle (`ValidationIssueCodeEnum`) et un éventuel `limit`. Toute `refine` déclare `params: { code: ValidationIssueCodeEnum.X }`, sinon elle sort en `INVALID_VALUE`.
- **404 métier** (`GAME_NOT_FOUND`…) : la ressource a disparu. À distinguer de `ROUTE_NOT_FOUND`, un bug.
- **Collection vide** : `204` sans corps, seulement pour un endpoint de collection (`fetchHandler` renvoie alors `data: null`). Un élément sans enfants reste un `200`.
- **Endpoint protégé** : `protected: true` exige une session ([authentification, §4.11](../auth/auth.md#411-protection-des-endpoints-et-des-projets)).

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
│   ├── userData/           suppression et export des données d'un compte, si le projet en garde
│   └── integrationTest/<ressource>/<endpoint>.integration.test.ts
├── common/                 routeur typé, gestionnaires de requête, transactions, archives (CSV, ZIP), réseau
├── error/                  AppError et ses filles (BadRequest, NotFound, Conflict, BadGateway, Database…)
├── middleware/             requestValidator, requireSession, requireSameOrigin, realClientIp, internalOnly,
│                           notFound, unhandledMethod, globalErrorHandler
├── configuration/          env.ts (variables lues et vérifiées au démarrage), authSettings, sequelize.ts
├── purge/                  purges répétées, lancées au démarrage
├── afterRestore.ts         commande lancée par citadel restore-db (second point d'entrée du build)
├── sql/migrations/         migrations Flyway
└── testUtils/              insertions et lectures directes en base pour les tests d'intégration
```

- **Pipeline** : router → controller → service → query. Seuls les contrôleurs voient des DTO ; services et requêtes travaillent en Beans.
- **Endpoint protégé** : son contrôleur est un `protectedRequestHandler`, qui reçoit la session (l'id de l'utilisateur vient toujours d'elle) ; le routeur typé refuse tout autre contrôleur et place `requireSession` devant, d'où un 401 avant toute validation.
- **Validation** : `requestValidator` applique les schémas des specs aux params, à la query et au corps ; le contrôleur reçoit des données propres.
- **Erreurs** : un service lève une `AppError` avec son code ; `globalErrorHandler` la traduit en réponse. Une erreur inattendue sort en 500, sans détail, et s'enregistre dans `error_log` (sans valeur de paramètre SQL ni corps de requête).
- **Base** :
  - une seule base, tables préfixées par sujet (`gdc_`, `backlog_`, `mailing_`, `auth_`) ;
  - collation `utf8mb4_unicode_520_ci` par défaut : casse et accents ignorés dans les comparaisons (chercher « pokemon » trouve « Pokémon »). Une colonne qui doit les distinguer règle la sienne (email et pseudo de l'[authentification](../auth/auth.md#33-collations-et-types)) ;
  - migrations `V<NNN>__<description>.sql`. Une migration passée en prod ne se modifie plus (Flyway vérifie leur empreinte), et le code N-1 doit tourner sur le schéma N ;
  - clés en `INTEGER` (un `BIGINT` arrive en chaîne) ; `created_at` et `updated_at` partout ; `field` explicite sur chaque colonne Sequelize ;
  - Sequelize pour les lectures et écritures simples, SQL brut pour les agrégats. Associations déclarées dans le modèle « enfant », pour éviter les imports circulaires ;
  - dates calculées par Node, jamais par `NOW()` en SQL : les tests avancent l'horloge par Vitest.
- **Tests d'intégration** : sur une vraie MariaDB (`mariadb-test`), recréée et migrée au début de chaque lancement, jamais nettoyée entre deux tests ; ordre aléatoire (`sequence.shuffle`), pour révéler les dépendances cachées entre endpoints.

## 5. Front

```
src/
├── projects/<projet>/
│   ├── index.tsx           point d'entrée, chargé à la demande par le routeur
│   ├── api/                seule couche qui parle au réseau (§5.3)
│   ├── components/         composants propres au projet, dont Layout
│   ├── pages/<Page>/
│   │   ├── index.tsx
│   │   └── components/<Composant>/index.tsx
│   ├── helper/, hooks/
│   └── variables.scss, *.module.scss   variables et feuille partagée du projet
├── common/                 api/ (fetch, cache, mutation, erreurs), validation, toast
├── react/                  AppContainer, ErrorBoundary, QueryErrorBoundary, AppToaster, SiteBanner, appNavigation
│                           (routes, fiche de chaque projet, transitions entre projets), projectTheme
├── configuration/          tanStackQueryClient.ts, leaveExpiredSession
└── styles/
```

Les principes en une phrase chacun : seule la couche `api/` d'un projet parle au réseau, le reste ne manipule que des Front Models (FM) ; une lecture suspend et s'affiche par zone, avec son squelette et son erreur ; une écriture est toujours optimiste, et se défait proprement si le serveur la refuse ; l'utilisateur ne voit que des messages en français, jamais le message technique du serveur. Game Death Counter en est l'implémentation de référence : en cas de doute, s'en inspirer.

### 5.1 Composants

- Un dossier par composant, en PascalCase (`citadel/component-folder-case`). Son `index.tsx` exporte le nom du dossier, un autre `.tsx` porte le nom de son export (`Layout/Layout.tsx`). Le dossier d'un projet reste en camelCase.
- Son `.module.scss` porte le nom du dossier en camelCase (`citadel/scss-module-name`). Une feuille partagée importée via `../` est libre.
- Pas de props étalées (`react/jsx-props-no-spreading`) ; pas d'index comme clé.
- Icônes lucide-react ; aucun emoji dans l'interface.
- Chaque champ obligatoire d'un formulaire porte un petit astérisque rouge à droite de son libellé, dans tous les formulaires (auth, contact, modales…). C'est l'atome `RequiredMark` du design system ([RequiredMark](../../packages/design-system/src/atoms/RequiredMark), `aria-hidden`, couleur `--theme-colorDestructiveHue`) placé juste après le texte du libellé, jamais un `*` écrit à la main ; dans le Backlog, `FormField isRequired`. Le contrôle natif porte aussi `required`. Est obligatoire un champ qui ne peut pas rester vide à la validation : un select pré-rempli sans option « aucune » compte, un nombre vide qui vaut 0 ne compte pas. Les champs sans libellé visible (saisies en ligne de Game Death Counter) n'ont pas d'astérisque.

### 5.2 Thème

- Le thème de chaque projet, en clair et en sombre, est rangé dans le design system (`theme/projectThemes/`) ; sa fiche y renvoie. Le projet l'applique, la homepage en tire ses ambiances ([homepage](../homepage/homepage.md)).
- Le Layout passe par `ProjectThemeProvider` : jetons sur ses composants et sur `<html>` (portails, fond), `data-color-scheme` sur `<html>` pour les styles propres au projet.
- Polices hébergées sur le site, dans le design system (`fonts/`) : un woff2 latin par style, toutes déclarées dans `fonts.scss`. Le navigateur ne télécharge que celles qui s'affichent, et aucune ressource tierce n'est à déclarer. Une nouvelle police s'y ajoute, avec sa licence.
- Clair ou sombre : la préférence du système, sauf choix fait dans le projet (`useProjectColorScheme`, depuis n'importe quel composant). Le choix n'est gardé (`citadel:<projet>:theme`, localStorage) que s'il diffère du système : revenir au thème du système efface l'entrée.
- `prefers-reduced-motion` coupe les animations et les transitions partout (`reset.scss` du design system), et les effets animés de la homepage.
- 1 rem = 10 px (`global.scss`).

### 5.3 Couche `api/` d'un projet

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
- **Cache en DTO, écran en FM** : le cache garde la réponse brute, le hook mappe dans `select`. Le FM porte ce dont l'écran a besoin : drapeaux dérivés (`isTemporary`…), tris, `null` d'un 204 converti en liste vide. Le tri se refait dans le mapper, pour qu'un élément ajouté ou renommé de façon optimiste prenne tout de suite sa place.
- **Query keys** : une fabrique par projet, avec des racines distinctes pour la liste et le détail (`["gameDeathCounter", "gameList"]`, `["gameDeathCounter", "game", id]`) : les clés se comparent par préfixe, et invalider la liste invaliderait sinon tous les détails.

### 5.4 Lecture

- `useSuspenseQuery` ; le hook renvoie directement le FM. Ne charger que ce qui s'affiche (le détail d'un jeu à son dépliage) ; l'état déplié vit dans le composant.
- Une donnée lue hors de sa zone (le total de l'en-tête) passe par `useQuery` sur les mêmes `queryOptions` : même requête, sans suspension ni erreur hors de la zone.
- **Une zone = trois couches** : `QueryErrorBoundary` (message d'erreur, « Réessayer » seulement pour une erreur passagère) > `Suspense` avec un `Skeleton` > un petit composant qui appelle le hook et passe les données à un composant d'affichage.
- **Squelette** : `Skeleton` (design system) transforme n'importe quel rendu en silhouette ; aucun composant n'a de variante squelette. Il réutilise le composant d'affichage, avec des données factices rangées à côté (`bossListPlaceholder.ts`), sans élément déplié pour qu'aucune requête ne parte depuis un squelette. Il reste invisible 300 ms : un chargement rapide ne clignote pas.
- Un `QueryErrorBoundary` global entoure l'`<Outlet />` du Layout de chaque projet, pour ce qu'aucune zone n'a attrapé.
- **Réseau** : `staleTime` 30 s ; une lecture rejouée 2 fois au plus, sur une erreur passagère seulement (réseau, 5xx) ; une mutation n'est jamais rejouée automatiquement ; `networkMode: "always"` (hors ligne, l'erreur s'affiche tout de suite au lieu d'attendre).

### 5.5 Écriture

Toute mutation passe par `useOptimisticMutation` (`common/api/mutation`).

- **Tout est optimiste**, créations comprises : un élément créé reçoit un id temporaire négatif (`createTemporaryId`), s'affiche grisé et `inert` jusqu'à la réponse. Les compteurs où il compte suivent tout de suite, et l'inverse en cas d'échec.
- **Le hook est lié à son élément** : les ids sont ses arguments, les variables de `mutate` le corps de la requête (`useUpdateGame(game.id).mutate({ name })`).
- **`mutationKey`** par action et par élément : une seule mutation à la fois par clé, le bouton désactivé avec `isPending`. **`scope`** : des mutations dépendantes partagent un scope, leurs requêtes partent dans l'ordre (enregistrer un jeu, puis l'ajouter au backlog), leur optimistic s'applique tout de suite.
- **`applyOptimistic`** écrit le résultat attendu ; **`revertOptimistic`** le défait par l'opération inverse, jamais en restaurant un instantané, qui écraserait les autres mutations en cours ; **`applyServerResponse`** remplace la valeur optimiste par la réponse (vrai id, dates calculées) ; **`getAffectedQueryKeys`** liste les lectures que le serveur recalcule, gelées pendant la mutation puis invalidées quand la dernière mutation en cours se termine ; **`removeGoneResource`** retire la ressource des caches sur un 404 métier ; **`actionLabel`** (infinitif) complète « Impossible de … ».
- PATCH : n'envoyer que les champs modifiés. Une suppression en cascade se confirme (`ConfirmDialog`) en disant ce qu'elle emporte ; un élément simple se supprime directement.
- Les fonctions de cache passent par `updateCachedQueryData` (`common/api/cache`) et par les fonctions de liste du package `common` (`replaceById`, `removeById`, `locateById`, `insertAt`). Un cache absent ne se crée jamais de toutes pièces.

### 5.6 Erreurs et saisie

- **Message unique** : « Impossible de {action} : {raison}. » (`buildFailureMessage`). Raison par priorité : serveur injoignable, champ invalide (« le nom doit contenir au plus 255 caractères »), code métier, code technique, famille du statut, erreur inattendue.
- « Réessayer » seulement pour une erreur passagère (réseau, 5xx) : une 4xx ou une erreur métier redonnerait le même résultat.
- Un échec de mutation part en toast (`AppToaster`, monté dans le Layout de chaque projet) ; un échec de lecture remplace sa zone. Une réponse d'API en erreur ne se logge jamais en console, puisqu'elle est déjà montrée ; une erreur qui ne vient pas de l'API est un bug, et se logge. Les logs normaux de React (clés manquantes, erreur de rendu, y compris celle qu'un `ErrorBoundary` attrape) ne sont jamais interceptés ni masqués : ni `onCaughtError` ni `onUncaughtError`. Rien n'est envoyé au serveur.
- **Saisie** : `checkInput(schema, valeurs, fieldLabels)` applique le schéma de l'endpoint, les mêmes règles que le serveur : un bouton désactivé vaut mieux qu'un 400. On envoie sa sortie, déjà nettoyée. Le message s'affiche sous le champ, sauf champ vide (le bouton désactivé suffit). Un champ ajouté par la mutation (le `gameId` d'un boss) se valide avec `schema.pick({ … })`.
- **Dates** : un `<input type="datetime-local">` se remplit avec `toDateTimeInputValue` et se relit avec `fromDateTimeInputValue` (`common`).

### 5.7 Tests

Uniquement des tests unitaires de fonctions pures : mappers DTO → FM, fonctions de cache (avec un vrai `QueryClient`), helpers. Pas de test de composant : les parcours sont couverts par les [tests end-to-end](../e2e/e2e.md).

## 6. Paquets partagés

- **`common`** : `universal/` (ni DOM ni Node), `browser/` et `react/` (pas de Node), `node/` (serveur et console, jamais le front). ESLint interdit à chaque dossier ce que son environnement ne fournit pas.
- **Où ranger une fonction** : générique (rien d'un projet ni du métier) dans `common` ; propre à un projet mais partagée par le front et le serveur dans `specs/…/helper/` ; propre à une app dans son `helper/` (ou `common/` de l'app). Une fonction pure ne reste pas dans un composant : elle en sort, testée.
- **`design-system`** (détaillé dans [design system](../designSystem/designSystem.md)) : `atoms/`, `molecules/`, `organisms/` (dont `SideNavigation`, le menu latéral du profil et de Satisfactory : liens, actions, groupes, espaceur, éléments libres ; déplié, replié avec ouverture au survol, ou tiroir derrière un bouton sur petit écran), thème (dont celui de chaque projet), polices et styles, et `mailPreview/` (les gabarits d'emails, [emails, §6](../emails/emails.md#6-côté-serveur)). Chaque composant a sa story (Storybook : `pnpm --filter @citadel/design-system dev`, port 3002).

## 7. Console d'administration

`apps/admin`, détaillée dans [console d'administration](../admin/admin.md) : un seul paquet et un seul `tsconfig`, avec `src/server/` (Express, un dossier par source : docker, torrent, vpn, access, deadlines…), `src/client/` (React, design system) et `src/shared/` (types échangés entre les deux). Elle n'a pas de base : ses historiques sont des fichiers JSON déposés par `infra-ops`, et ses actions passent par des demandes à `infra-ops` ([infra, §1](../infra/infra.md#1-fonctionnement)).

## 8. Infra

### 8.1 Fichiers

```
infra/
├── compose.yml          le projet Compose unique du NAS : tous les services, groupés par préfixe
│                        (infra-, site-prod-, site-preprod-, media-)
├── compose.local.*      la prod sur votre PC (pnpm prod:local)
├── compose.e2e.yml      la stack des tests end-to-end
├── Caddyfile            quel nom et quel chemin vont vers quel conteneur
├── citadel              la commande du NAS : deploy, rollback, start, stop, status, logs, up, jobs…
├── mariadb-init.sh      crée les comptes de la base à sa création
└── ops/crontab          planning des tâches d'infra-ops
apps/client/nginx.conf   conf du conteneur front : SPA, relais /irigo
.github/workflows/images.yml   construit et publie les images à chaque tag v*
scripts/release.sh             lancé par pnpm tools release
```

Sur le NAS :

```
/Volume1/citadel/        citadel, .env.prod (600), rclone.conf (600), state/ (version, historiques, logs, demandes de la console)
/Volume1/appdata/<svc>/  données de chaque service, dont site-prod-db/ et site-prod-server/restore-journal/ (hors de config-backup)
/Volume2/data/           médias et torrents
/Volume2/backups/        dumps de la base, archives des configs
```

Les fichiers d'infra sont commentés abondamment, en français : pourquoi et comment, même si les commentaires dépassent le code. Le détail des choix est dans ces commentaires ; le mode d'emploi est dans [infra](../infra/infra.md).

### 8.2 Scripts

`pnpm tools` propose tout fichier `.sh` de `scripts/` ; `pnpm tools <nom>` en lance un directement. Chacun explique son usage en tête de fichier.

| Script | Rôle |
| --- | --- |
| `release` | La mise en production ([infra, §4](../infra/infra.md#4-commandes)) |
| `checkDocLinks` | Les liens et ancres de la documentation : à lancer après une grosse édition des docs |
| `checkEnvFiles` | Les fichiers `.env*` ont les mêmes variables, dans le même ordre que `.env.example` |
| `checkExternalLinks` | Les liens externes du site répondent encore (demande Internet) |
| `checkScssModules` | Les `*.module.scss` qu'aucun fichier n'importe |
| `generateAuthSecrets`, `hashAdminPassword` | Les secrets de l'authentification, le hash du mot de passe de la console |
| `listExtensions` | L'inventaire des extensions de fichiers du dépôt |
| `clean` | Supprime tout ce qui se regénère (dépendances, builds, rapports) |

Les bases Docker de dev et de test (`pnpm db:*`, `pnpm prod:local`) passent par `scripts/docker/`.

## 9. Checklists

### 9.1 Brancher un nouvel endpoint

1. Specs : dossier de l'endpoint (interface avec ses codes d'erreur par statut, schémas, DTO), ajout au registre ; `params.code` sur chaque `refine` ; `protected: true` s'il touche aux données d'un compte.
2. Serveur : requête, Bean et mappers, service, contrôleur, route ; tests d'intégration.
3. Front : FM et mapper testé dans `api/model`, accesseurs de cache, hook (`useSuspenseQuery` + `select`, ou `useOptimisticMutation` avec son opération inverse).
4. Composant : une zone pour une lecture ; `isPending`, `checkInput` et éventuellement `ConfirmDialog` pour une écriture.

### 9.2 Brancher un nouveau projet

1. Specs : préfixe dans `ApiPrefixEnum`, enum des codes métier, registre des endpoints.
2. Serveur : `router.ts` branché dans `globalRouter.ts`, enum des codes dans `errorCode.type.ts`, tables préfixées dans une migration. S'il garde des données par compte : `user_id` sur ses tables, endpoints `protected`, un `userData/<projet>UserData.ts` et son entrée dans `projectUserData` (suppression et export des données du compte, [authentification, §9](../auth/auth.md#9-organisation-du-code)).
3. Front : fiche et route dans `react/appNavigation`, `<projet>QueryKeys.ts`, `<projet>ErrorReasons.ts` exhaustif, `<projet>FieldLabels.ts` ; thème dans `projectThemes` du design system, présentation (`showcase`) dans la fiche ; Layout avec `ProjectThemeProvider`, `QueryErrorBoundary` global autour de l'`<Outlet />` et `AppToaster`, et un bouton qui bascule entre clair et sombre.
4. Doc : `docs/<projet>/<projet>.md`, au même gabarit que les autres, et son lien dans le [README](../../README.md#3-documentation).

## 10. Glossaire

Les mots du dépôt, dans l'ordre alphabétique. Ceux propres à un projet sont dans sa doc (le [Backlog](../backlog/backlog.md#1-notions), par exemple).

| Mot | Sens |
| --- | --- |
| Bean | La forme que manipulent les services et les requêtes du serveur. Seuls les contrôleurs voient des DTO, et traduisent de l'un à l'autre (§4) |
| Brevo | Le fournisseur qui envoie les emails du site ([emails](../emails/emails.md)) |
| Caddy | Le serveur web du NAS : certificats, routage vers les conteneurs, bandeau du site ([infra](../infra/infra.md)) |
| Code de secours | Code à usage unique qui remplace le second facteur quand il n'est plus accessible ([authentification](../auth/auth.md)) |
| Console | L'application `apps/admin` : l'administration du NAS, hors Internet ([architecture, §7](#7-console-dadministration)) |
| DTO | Data Transfer Object : la forme d'une réponse ou d'un corps de requête, décrite dans les specs, partagée par le front et le serveur (§3) |
| Facteur, second facteur | Ce qui s'ajoute au mot de passe à la connexion : application TOTP, code par email, code de secours |
| Flyway | L'outil qui applique les migrations SQL (`apps/server/src/sql/migrations`) |
| FM | Front Model : la forme dont l'écran a besoin, produite par un mapper à partir du DTO que garde le cache (§5.3) |
| FRM | Ficsit Remote Monitoring : le mod de *Satisfactory* dont la page des machines lit les données ([Satisfactory](../satisfactory/satisfactory.md)) |
| GDC | Game Death Counter, l'un des projets du site ([Game Death Counter](../gameDeathCounter/gameDeathCounter.md)) |
| IGDB | La base de données de jeux (celle de Twitch) d'où vient le Backlog ([Backlog, §6](../backlog/backlog.md#6-données-igdb)) |
| `infra-ops` | Le conteneur du NAS qui lance les jobs et exécute, après vérification, les demandes de la console ([infra, §1](../infra/infra.md#1-fonctionnement)) |
| Parcours | Une suite d'étapes d'authentification qui s'étend sur plusieurs pages ou emails : inscription, connexion avec second facteur, mot de passe oublié… ([authentification, §4.1](../auth/auth.md#41-commun-à-tous-les-parcours)) |
| Pré-prod | La copie de la prod, à la demande sur le NAS, où se répètent les déploiements et se teste la restauration ([infra, §1](../infra/infra.md#1-fonctionnement)) |
| `prod:local` | Les images de prod lancées sur votre PC ([infra, §4](../infra/infra.md#4-commandes)) |
| Projet | Une partie du site avec sa route, ses specs, son serveur et son front : Game Death Counter, Backlog, Angers Irigo, Satisfactory, Homepage, authentification |
| Specs | Le paquet `packages/specs` : le contrat entre le front et l'API (§3) |
| TOS | Le système d'exploitation du NAS (TerraMaster OS) |
| TOTP | Le code à 6 chiffres d'une application d'authentification, renouvelé toutes les 30 secondes |
| `todo_folder` | Une réserve de code mis de côté, ignorée par le lint (§1) |
| Zone | Un morceau d'écran qui charge sa donnée seul, avec son squelette et son erreur (§5.4) |
