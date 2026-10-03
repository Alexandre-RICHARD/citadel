# Architecture front

Règles communes à tous les projets du client (`apps/client/src/projects/*`). GameDeathCounter est l'implémentation de référence : en cas de doute, s'en inspirer.

Les principes en une phrase chacun :

- seule la couche `api/` d'un projet parle au réseau ; le reste de l'app ne manipule que des Front Models (FM) ;
- une lecture suspend et s'affiche par zone, avec son squelette et son erreur ;
- une écriture est toujours optimiste, et se défait proprement si le serveur la refuse ;
- l'utilisateur ne voit que des messages en français, jamais le message technique du serveur.

## 1. Contrat avec le back

Les specs (`packages/specs`) sont la source de vérité, partagée par le front et le back.

- **Réponse d'erreur** : `ErrorResponseDto<Code>` = `{ code, message }`. `code` est traduit par le front ; `message` est une aide pour le développeur, jamais affichée.
- **Codes** : un enum technique commun (`TechnicalErrorCodeEnum` : `VALIDATION_FAILED`, `MALFORMED_JSON`, `INVALID_REQUEST`, `ROUTE_NOT_FOUND`, `METHOD_NOT_ALLOWED`, `INTERNAL_ERROR`) et un enum métier par projet (`GameDeathCounterErrorCodeEnum`). Chaque interface d'endpoint restreint ses codes par statut.
- **400** : chaque `issue` porte `path`, un code de règle (`ValidationIssueCodeEnum`) et un éventuel `limit`. Toute `refine` d'un schéma déclare `params: { code: ValidationIssueCodeEnum.X }`, sinon elle sort en `INVALID_VALUE`.
- **404 métier** (`GAME_NOT_FOUND`…) : la ressource a disparu. À distinguer de `ROUTE_NOT_FOUND`, qui est un bug.
- **Collection vide** : `204` sans corps, uniquement pour les endpoints de collection. `fetchHandler` renvoie alors `data: null`. Un élément sans enfants reste un `200`.

## 2. La couche `api/` d'un projet

```
projects/<projet>/api/
├── <projet>QueryKeys.ts        clés des lectures et des mutations
├── <projet>ErrorReasons.ts     code métier → raison en français
├── <projet>FieldLabels.ts      champ du corps → libellé (« le nom »)
├── model/                      FM (*Fm.type.ts) et mappers DTO → FM, testés
├── cache/                      lecture et écriture du cache (DTO), testées
└── <entité>/                   un hook par endpoint
```

- **Frontière** : seuls `projects/*/api/**` et `common/api/**` importent un DTO, une interface d'endpoint ou `fetchHandler`. La règle ESLint `no-restricted-imports` de `eslintConfigClient.js` l'impose. Les schémas zod des specs (`*Schema.ts`) restent importables partout, pour valider une saisie.
- **Cache en DTO, écran en FM** : le cache garde la réponse brute ; le hook mappe dans `select`. Le FM porte ce dont l'écran a besoin : drapeaux dérivés (`isFinished`, `isTemporary`), tris, `null` d'un 204 converti en liste vide. Refaire le tri dans le mapper : un élément ajouté ou renommé de façon optimiste prend tout de suite sa place.
- **Query keys** : une fabrique par projet. Les clés se comparent par préfixe : donner des racines distinctes à la liste et au détail (`["gameDeathCounter", "gameList"]` et `["gameDeathCounter", "game", id]`), sinon invalider la liste invalide tous les détails.
- **Textes** : français, en dur. Seules les raisons d'erreur et les libellés de champs sont centralisés, en `Record<Enum, string>` pour être exhaustifs.

## 3. Lecture

### Hooks

- `useSuspenseQuery`, et le hook renvoie directement le FM : `const { games } = useGameList();`.
- **Chargement paresseux** : ne charger que ce qui s'affiche. Dans GDC, la liste au montage, le détail d'un jeu à son dépliage, celui d'un boss au sien. L'état déplié vit en mémoire, dans le composant.
- Une donnée lue hors d'une zone (le total de l'en-tête) passe par `useQuery` non suspensif sur les mêmes `queryOptions` : même requête, et pas de suspension ni d'erreur hors de la zone.

### Zones

Chaque zone qui charge des données se compose de trois couches :

```tsx
<QueryErrorBoundary actionLabel="charger les boss" errorReasons={gameDeathCounterErrorReasons}>
	<Suspense fallback={<Skeleton label="Chargement des boss"><BossList bosses={BOSS_LIST_PLACEHOLDER} /></Skeleton>}>
		<LoadedBossList gameId={gameId} />
	</Suspense>
</QueryErrorBoundary>
```

- **Découpage** : un composant d'affichage qui reçoit ses données en props (`BossList`), et un petit composant non exporté qui appelle le hook (`LoadedBossList`). Le squelette réutilise le premier.
- **`QueryErrorBoundary`** (`react/QueryErrorBoundary`) : remplace la zone par un `ErrorState` (« Impossible de charger les boss : … »). « Réessayer » n'apparaît que pour une erreur passagère, et relance les requêtes de la zone.
- **Filet global** : un `QueryErrorBoundary` autour de l'`<Outlet />` du Layout de chaque projet, pour ce qu'aucune zone n'a attrapé.

### Squelettes

`Skeleton` (design-system) transforme n'importe quel rendu en silhouette : textes barrés, boutons et icônes en blocs, conteneurs intacts. Aucun composant n'a de variante squelette.

- Les données factices vivent à côté du composant d'affichage (`BossList/bossListPlaceholder.ts`). Seules les longueurs de texte comptent.
- Aucun élément déplié dans les données factices, pour qu'aucune requête ne parte depuis un squelette. Ids positifs, `isTemporary: false`.
- Anti-flash : le squelette reste invisible 300 ms. Un chargement rapide ne clignote pas.

### Politique réseau (`configuration/tanStackQueryClient.ts`)

- `staleTime` 30 s.
- Une lecture est rejouée 2 fois au plus, et seulement sur une erreur passagère (réseau, 5xx). Une mutation n'est jamais rejouée automatiquement.
- `networkMode: "always"` : hors ligne, la requête échoue tout de suite et l'erreur s'affiche, au lieu d'attendre.

## 4. Écriture

Toute mutation passe par `useOptimisticMutation` (`common/api/mutation`).

### Écrire un hook

- **Le hook est lié à son élément** : les ids sont ses arguments, les variables de `mutate` sont le corps de la requête. `useUpdateGame(game.id).mutate({ name })`.
- **`mutationKey`** : une par action et par élément, `["gameDeathCounter", "updateGame", gameId]`. Une seule mutation à la fois par clé : tant qu'elle est en cours, `mutate` ne fait rien, et le bouton est désactivé avec `isPending`.
- **`actionLabel`** : infinitif en minuscule, il complète « Impossible de … » (« renommer le jeu »).
- **`applyOptimistic`** : écrit le résultat attendu dans le cache et renvoie de quoi le défaire.
- **`revertOptimistic`** : défait par l'**opération inverse**, jamais en restaurant un instantané, qui écraserait les autres mutations en cours. Remettre l'ancien nom, réinsérer l'élément supprimé à sa place, décrémenter ce qu'on a incrémenté. Si `applyOptimistic` n'a rien trouvé à modifier, il renvoie `null` et rien n'est défait.
- **`applyServerResponse`** : remplace la valeur optimiste par la réponse du serveur (vrai id, dates calculées).
- **`getAffectedQueryKeys`** : les lectures dont le serveur recalcule quelque chose. Elles sont gelées pendant la mutation, puis invalidées quand la **dernière** mutation en cours se termine.
- **`removeGoneResource`** : sur un 404 métier, retirer la ressource des caches au lieu de défaire.
- **`errorReasons`**, **`fieldLabels`** : les dictionnaires du projet.

### Règles

- **Tout est optimiste, créations comprises** : l'élément créé reçoit un id temporaire négatif (`createTemporaryId`). Son FM porte `isTemporary` ; le composant le grise (`globalStyles.temporary`) et le rend `inert` jusqu'à la réponse.
- **Les compteurs suivent** : ajouter ou supprimer un élément met à jour tout de suite chaque total où il compte (le boss, son jeu dans la liste, le total général), et l'inverse en cas d'échec.
- **Modification partielle (PATCH)** : n'envoyer que les champs modifiés.
- **Suppression** : `ConfirmDialog` avant une suppression en cascade, avec ce qu'elle emporte (« Ses boss et ses 42 morts seront supprimés définitivement. »). Un élément simple se supprime directement.
- **Fonctions de cache** : passer par les helpers génériques de `common/api/cache` (`replaceById`, `removeById`, `locateById`, `insertAt`) et les accesseurs du projet. Une mise à jour d'un cache absent ne fait rien : on ne crée jamais un cache de toutes pièces.

## 5. Erreurs et messages

- **Format unique** : « Impossible de {action} : {raison}. », construit par `buildFailureMessage`. Il élide la préposition devant une voyelle (« Impossible d'ajouter »).
- **Raison** (`getErrorReason`), par ordre de priorité :
  1. pas de réponse : « le serveur est injoignable » ;
  2. 400 sur un champ connu : « le nom doit contenir au plus 255 caractères » ;
  3. code métier du projet ;
  4. code technique ;
  5. sinon, selon la famille du statut ;
  6. erreur qui ne vient pas de l'API : « une erreur inattendue est survenue ».
- **« Réessayer »** : uniquement pour une erreur passagère (réseau, 5xx). Jamais pour une 4xx ni une erreur métier, qui redonneraient le même résultat.
- **Où** : un échec de mutation part en toast (`AppToaster`, monté dans le Layout de chaque projet, sous son `ThemeProvider`). Un échec de lecture remplace sa zone (`ErrorState`).
- **Console** : notre code ne logge jamais une réponse d'API en erreur, déjà montrée à l'utilisateur. Une erreur qui ne vient pas de l'API est un bug : elle est loggée. Ne pas toucher aux logs de React (pas de `onCaughtError`). Rien n'est envoyé au serveur.

## 6. Saisie

- **Valider avec le schéma de l'endpoint** : `checkInput(updateGameBodySchema, { name }, gameDeathCounterFieldLabels)` applique les mêmes règles que le serveur. Un bouton Enregistrer désactivé vaut mieux qu'un 400.
- **Envoyer `data`** : la sortie du schéma, déjà nettoyée (espaces retirés, commentaire vide converti en `null`).
- **Afficher le message** sous le champ, sauf quand le champ est vide : le bouton désactivé suffit.
- **Champs ajoutés par la mutation** (le `gameId` d'un boss) : valider avec `schema.pick({ … })`.
- **Dates** : un `<input type="datetime-local">` se remplit avec `toDateTimeInputValue` et se relit avec `fromDateTimeInputValue` (common). Ne jamais lui donner une date seule.

## 7. Tests

- **Front** : uniquement des tests unitaires de fonctions pures. Mappers DTO → FM, fonctions de cache (avec un vrai `QueryClient`), helpers. Pas de test de composant.
- **Nommage** : `it` en anglais ; describe du fichier, describe du comportement, puis « SHOULD … WHEN … ». ESLint l'impose.

## 8. Checklists

### Brancher un nouvel endpoint

1. Specs : interface avec ses codes d'erreur par statut, `params.code` sur chaque `refine`.
2. `api/model` : FM et mapper, avec son test.
3. `api/<entité>/use<Action>.tsx` : `useSuspenseQuery` + `select`, ou `useOptimisticMutation` avec son opération inverse.
4. `api/cache` : accesseurs manquants, testés s'ils ont de la logique.
5. Composant : zone (`QueryErrorBoundary` + `Suspense` + `Skeleton`) pour une lecture ; `isPending`, `checkInput` et éventuellement `ConfirmDialog` pour une écriture.

### Brancher un nouveau projet

1. Enum des codes métier dans les specs, et `<projet>ErrorReasons.ts` exhaustif.
2. `<projet>QueryKeys.ts`, `<projet>FieldLabels.ts`.
3. Layout : `ThemeProvider`, `QueryErrorBoundary` global autour de l'`<Outlet />`, `AppToaster`.
