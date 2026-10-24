# Plan d'attaque — POC Backlog

Oct 21, 2026 · @Alex Perso

Ce plan dit dans quel ordre construire le POC. Le **quoi** vient à 100 % du cahier des charges « Backlog Jeux Vidéo — Cahier des charges », fourni avec ce plan.

## Règles de travail

- **Source unique** : le cahier des charges décide de tout ce que fait le POC. Ce plan ne fixe que l'ordre et la méthode.
- **Questions dès le moindre doute** : si le cahier des charges est muet, ambigu ou semble se contredire, pose la question avant de coder la partie concernée. Cite la section concernée. N'invente jamais une règle et ne tranche pas seul.
- **Points d'arrêt** : à la fin de chaque phase, arrête-toi. Résume ce qui est fait, liste les questions en suspens, dis quoi tester sur `http://localhost:3001/backlog`, puis attends la validation avant la phase suivante.
- **Périmètre** : tu codes uniquement dans `apps/client/src/projects/backlog`. `index.tsx` et `backlog.module.scss` existent déjà ; tu peux les remplacer librement.
- **Le reste de l'app** : ne le lis que pour comprendre le branchement (route `/backlog`, serveur de dev, chargement du `.env`, réglages TypeScript et SCSS). Ignore tout le reste.
- **Aucune réutilisation** : pas de helper, composant, hook, style ou utilitaire existant dans l'app. Tout est recodé dans le dossier.
- **Aucune nouvelle dépendance** sans accord explicite.
- **Hors du dossier** : toute modification d'un fichier extérieur se demande avant. La seule attendue est la configuration du proxy de dev (section « Accès à IGDB »).
- **Code « sale » accepté** : pas d'abstraction superflue, mais l'organisation en 6 fichiers et le typage strict ne sont pas négociables.
- Pas de commit sans demande.

## Fichiers du dossier

Le cahier des charges (section 4) parle de `App.tsx` et `App.module.scss` ; dans ce dossier, ce sont les deux fichiers existants qui jouent ce rôle.

| Fichier | Rôle (cahier des charges, section 4) |
| --- | --- |
| `index.tsx` | Composant principal : états, tableau, modales, footer de debug. Remplace `App.tsx` |
| `backlog.module.scss` | Styles (module SCSS). Remplace `App.module.scss` |
| `types.ts` | Tous les types exportés, dont `AppState` |
| `initialState.ts` | L'objet `initialState`, vérifié par `satisfies AppState` |
| `mappers.ts` | Réponses IGDB → types de la base ; base → lignes du tableau |
| `utils.ts` | Toutes les autres fonctions : appels IGDB, calculs, agrégats, tri, filtres, URL d'images |

- Le dossier `icons/` (icônes de plateformes nommées par leur nom technique) ne compte pas dans les 6 fichiers. Il peut rester vide : une plateforme sans icône affiche son nom.
- Les listes fermées (types de fin, statuts et leur rang, compatibilités) peuvent être déclarées dans `types.ts` comme constantes `as const`, d'où dérivent les types. Si tu préfères un autre emplacement, demande.

## Accès à IGDB

Une requête fonctionne déjà depuis Postman. Depuis le navigateur, elle doit passer par le proxy du serveur de dev.

### Requête de référence (testée dans Postman)

```js
const headers = new Headers();
headers.append("Client-ID", "<INTERNET_GAME_DATA_BASE_CLIENT_ID>");
headers.append("Authorization", "Bearer <INTERNET_GAME_DATA_BASE_TOKEN>");

fetch("https://api.igdb.com/v4/games", {
  method: "POST",
  headers,
  body: "fields *; limit 1;", // requête Apicalypse en texte brut
});
```

### Proxy de dev

- Depuis un navigateur, cet appel est bloqué : IGDB ne renvoie pas d'en-têtes CORS, et le token ne doit jamais se retrouver dans le code client.
- Le front appelle donc une route de son propre serveur de dev (par exemple `/igdb/games`). Le serveur relaie vers `https://api.igdb.com/v4/games` en ajoutant `Client-ID` et `Authorization`.
- Les valeurs viennent du `.env`, sous les noms `INTERNET_GAME_DATA_BASE_CLIENT_ID` et `INTERNET_GAME_DATA_BASE_TOKEN`. Elles sont lues côté serveur de dev uniquement, jamais exposées au client (pas de préfixe public), jamais loguées.
- La mise en place dépend du serveur de dev de l'app (avec Vite : `server.proxy` et `loadEnv`). Identifie-le en phase 0, propose la modification, attends l'accord.

### Limites et bonnes pratiques

- **4 requêtes par seconde** : saisie de recherche temporisée (environ 300 ms) ; requêtes de détail lancées à la suite plutôt qu'en rafale, ou regroupées via l'endpoint `multiquery` d'IGDB.
- **`search` ne se combine pas avec `sort`** dans une requête IGDB.
- **Identifiants de `game_type`** (jeu principal, DLC, bundle, remake…) : lis-les via l'endpoint `game_types` plutôt que de les coder en dur. N'utilise pas les champs dépréciés (`category`, `status`, `collection`).
- **Erreur 401** : le token a probablement expiré. Signale-le, ne tente pas de le régénérer.

## Phase 0 — Lecture et reconnaissance

Objectif : comprendre le cahier des charges et le branchement de `/backlog`, sans coder de logique.

- Lis le cahier des charges en entier, puis ce plan.
- Repère dans l'app, et seulement ça :
  - comment `/backlog` charge `index.tsx` (forme d'export attendue) ;
  - le serveur de dev et l'endroit où configurer un proxy ;
  - où et comment le `.env` est chargé ;
  - le support des modules SCSS et les réglages TypeScript (mode strict ou non).
- Pose les questions de départ, par exemple :
  - langue des identifiants dans le code (anglais ou français), les textes d'interface restant en français ;
  - émulateurs à prévoir dans les valeurs initiales ; propose une liste (PCSX2 → PS2, DuckStation → PS1, RPCS3 → PS3, Dolphin → GameCube et Wii, PPSSPP → PSP…) ;
  - taille de page du défilement infini ;
  - tout point du cahier des charges qui t'a semblé ambigu à la lecture.
- Après accord, mets en place le proxy et vérifie-le avec un appel `fields name; limit 1;` sur `games`, résultat affiché dans la console.

**Test** : `/backlog` s'affiche (page vide) et l'appel de test renvoie un jeu.

## Phase 1 — Types (`types.ts`)

Objectif : poser le modèle de données. C'est la phase la plus importante : les types préfigurent la future base.

- Un type par future table, avec les champs des sections 3, 5 et 7 du cahier des charges. Liste indicative, à valider : jeu, version, plateforme (nom, nom technique, console émulée éventuelle), version × plateforme (date de sortie), variante, DLC, DLC fait (variante × DLC), série, franchise, société, rôle d'une société sur un jeu (développeur / éditeur), nom alternatif.
- Les listes fermées de la section 6 : types de fin, statuts avec leur rang, compatibilité statut × type de fin.
- `AppState` : tous les états, données et interface (recherche, modale ouverte, mode édition, colonnes visibles et leur ordre, tri, filtres…), hors historique d'annulation.
- Les types des lignes du tableau (ligne du jeu, sous-ligne de variante), dérivés et jamais stockés.
- Contraintes de la section 4 : aucun `any`, unions de littéraux pour les listes fermées, tout sérialisable en JSON (dates en chaînes ISO, `null` plutôt que `undefined`).

**Test** : l'utilisateur relit `types.ts`. Ne passe pas à la suite sans sa validation.

## Phase 2 — État et debug (`initialState.ts`, `index.tsx`)

Objectif : un état complet, exportable et réimportable, avant toute fonctionnalité.

- `initialState` vérifié par `satisfies AppState`, avec les plateformes et les émulateurs validés en phase 0. Les identifiants des plateformes IGDB se lisent via l'endpoint `platforms`.
- Dans `index.tsx`, un `useState` par clé de `initialState`.
- Toutes les modifications de données passent par une seule fonction : c'est elle qui permettra l'annuler / rétablir en phase 7.
- Footer de debug (section 4) : compteurs et bouton qui logue l'état complet sous une forme collable telle quelle dans `initialState.ts`.

**Test** : exporter l'état, le coller dans `initialState.ts`, recharger. On retrouve le même état, sans erreur de typage.

## Phase 3 — Recherche IGDB

Objectif : une barre de recherche branchée sur IGDB, conforme à l'étape 1 de la section 8.

- `utils.ts` : la fonction d'appel IGDB via le proxy et la recherche temporisée.
- `mappers.ts` : réponse IGDB → résultat de recherche affichable.
- Règles : format `<Nom VF> <Nom VO> (année de sortie)` avec image ; un seul nom si VF et VO sont identiques ; bundles et DLC exclus ; résultat déjà en base signalé.
- Nom VF : `game_localizations`, sinon `alternative_names`, repli sur le nom VO (section 3). Si les données réelles ne permettent pas de le trouver de façon fiable, montre des exemples et demande.

**Test** : rechercher *Skyrim*, *GTA V*, *Final Fantasy VII*. Résultats lisibles, aucun bundle ni DLC.

## Phase 4 — Modale d'ajout et enregistrement

Objectif : ajouter un jeu complet en base, et éventuellement une variante au backlog, exactement comme le décrit la section 8.

- **Récupération** à l'ouverture de la modale : le jeu, son original, toutes ses versions, ses DLC (`dlcs`, `expansions` ; ni packs ni mises à jour), les plateformes et dates de sortie de chaque version, la série, la franchise, le développeur et l'éditeur avec leurs logos, les noms VO, VF et alternatifs (sections 3 et 5).
- **Modale** : tout est en lecture seule, sauf trois choix : l'image (cover pré-sélectionnée), le type de fin (Histoire par défaut) et le numéro dans la série. Option d'ajout au backlog : version, puis plateforme (plateformes de la version, puis émulateurs de ces consoles).
- **« Valider »** : écriture normalisée dans l'état, sans doublon (section 5). Rien n'est écrit avant.
- **`mappers.ts`** : réponses IGDB → types de la base.
- **Données qui ne rentrent pas dans le modèle** : signale le cas avec la réponse brute d'IGDB et demande. Ne contourne jamais en silence : repérer ces cas est le but même du POC.

**Test**, avec des jeux réels :

| Cas | Exemple | Attendu |
| --- | --- | --- |
| Plusieurs versions | *Skyrim* | Toutes les versions récupérées, original compris |
| Émulateur | Un jeu PS2 | *PCSX2* proposé après PS2 |
| DLC | *Skyrim* | *Dawnguard*, *Hearthfire*, *Dragonborn* ; aucun pack |
| Remake | *FF7*, puis *FF7 Remake* | Deux jeux distincts |
| Déjà en base | *Skyrim* recherché une seconde fois | Mène au choix d'une variante, aucun doublon |

## Phase 5 — Tableau en lecture seule

Objectif : afficher le backlog comme le décrivent les sections 5, 6, 7 et 9, sans édition.

- **`mappers.ts`** : base → lignes du tableau (ligne du jeu + sous-lignes de variantes).
- **Agrégats** de la ligne du jeu (section 7) et statut de la ligne (section 6), avec une case vide quand il est impossible de choisir.
- **Colonnes** : toutes celles de la section 7. Miniatures via la fonction unique d'URL d'image (section 4). Plateforme en icône et nom, nom seul si l'icône manque.
- **Lignes** (section 9) : chevron et badge sur les lignes dépliables, espace vide sur les lignes simples, sous-lignes indentées ; mise en valeur des jeux « À jouer bientôt ».
- **Défilement infini** avec préchargement (section 9), taille de page validée en phase 0.
- **Header** : titre et bulles explicatives. Le bouton d'édition vient en phase 6, la visibilité des colonnes en phase 8.

**Test** :

- un jeu à une seule variante s'affiche en ligne simple ;
- *Skyrim* à 3 variantes montre les bons agrégats (sommes, première date de fin, note la plus haute, meilleur statut) ;
- un jeu avec une variante « Abandonné » et une variante « Démarré » montre un statut vide.

## Phase 6 — Édition et menu Actions

Objectif : modifier le backlog depuis le tableau.

- **Mode édition** (section 9) : lecture seule par défaut, bouton fixe dans le header, retour automatique après 1 minute d'inactivité, suspendu pendant l'édition d'une cellule.
- **Données de variante** (section 7) : statut filtré par type de fin, possédé, à jouer bientôt, date de fin, fois fini, temps réel et estimé, note de 0 à 20, commentaire. Sur une ligne simple, l'édition se fait directement sur la ligne.
- **Règle de la section 6** : passer une variante au rang 5 ou plus propose la date de fin et passe « fois fini (sûr) » à 1 s'il était à 0.
- **Popover des DLC** (section 9).
- **Menu Actions** (section 9) : « Modifier le jeu » (même modale qu'à l'ajout, avec la conversion des statuts de la section 8), « Ajouter une variante », les deux « Retirer », « Ouvrir sur IGDB », « Logger cette ligne ».

**Test** :

- passer une variante à « Fini » : la date de fin est proposée ;
- cocher un DLC sur une variante : « faits / total » se met à jour sur la ligne du jeu ;
- passer un jeu de Histoire à Bac à sable : « Fini » devient « Estimé fini » ;
- retirer la dernière variante d'un jeu : il quitte le backlog ;
- rester une minute sans rien faire : retour en lecture seule ; éditer une cellule plus d'une minute : pas de retour.

## Phase 7 — Annuler / rétablir

Objectif : `Ctrl+Z` et `Ctrl+Y` sur les 20 dernières actions (section 10).

- L'historique vit en mémoire, se perd au rechargement et n'apparaît pas dans l'export d'état (section 4).
- Il s'appuie sur la fonction unique de modification posée en phase 2.
- Question à poser avant de coder : ce qui compte comme une « action » (une cellule modifiée, un ajout validé, un retrait…) et si les changements d'interface (tri, colonnes) en font partie.

**Test** : 3 modifications, 3 `Ctrl+Z`, 2 `Ctrl+Y` ; la 21e action efface la plus ancienne.

## Phase 8 — Personnalisation, tri et filtres

Objectif : les fonctions de vue de la section 9.

- Modale de visibilité des colonnes, réorganisation de leur ordre, sauvegarde dans le `localStorage`.
- Tri multi-colonnes avec flèche de direction et numéro de priorité ; filtre sur chaque colonne ; clic sur un nom de franchise.
- Tri et filtres persistés dans l'URL ; une colonne masquée sort du tri, de l'URL et de la recherche ; un tri sur une colonne masquée présent dans une URL est ignoré.
- Question à poser avant de coder : la section 9 dit que tri et filtres s'appliquent page par page. Demande comment l'interpréter dans le POC, où toutes les données sont déjà en mémoire.

**Test** :

- masquer une colonne triée : elle sort du tri et de l'URL ;
- recharger : disposition des colonnes, tri et filtres sont conservés ;
- cliquer sur une franchise : le tableau ne montre plus qu'elle.

## Phase 9 — Revue finale

Objectif : vérifier le POC contre le cahier des charges.

- Reprends le cahier des charges section par section et produis un tableau : exigence, statut (fait / partiel / non fait), écart éventuel.
- Liste les incompatibilités IGDB rencontrées et la façon dont elles ont été traitées : elles serviront à la prochaine version du cahier des charges.
- Ne corrige rien de ce que révèle la revue sans accord.

## Points de vigilance

- **Section 11 du cahier des charges** : rien de ce qui est « pour plus tard » ou « écarté » ne s'implémente (synchronisation, jeux épisodiques, wishlist, ajout manuel, support des langues, bundles…).
- **Calculé, jamais stocké** : tout ce qu'affiche la ligne du jeu, et le temps total.
- **Unicité** : une variante est unique par Jeu + Version + Plateforme ; aucun jeu, version ni DLC en double en base.
- **Données IGDB** : jamais modifiables. Seuls l'image, le type de fin et le numéro dans la série se choisissent, à l'ajout et via « Modifier le jeu ».
- **Toutes les données utilisateur sont sur la variante**, y compris le statut, la note et les DLC faits.
- **Secrets** : jamais de token ni de Client-ID dans le code client, dans un log ou dans l'export d'état.
- **Conflit** : si une consigne de ce plan contredit le cahier des charges, le cahier des charges l'emporte. Signale la contradiction.
