# Résumé du projet — Compteur de morts Souls-like (mise à jour)

Ce document **complète et corrige par endroits** le résumé précédent (« Résumé d'une autre conv. Spec technique et métiers du projet »). Là où il y a contradiction, **ce document fait foi** — les décisions ci-dessous ont été prises après.

## Ce qui n'a pas changé
Stack (Node/TS + Express, React/TS, MariaDB, Sequelize), absence d'auth, DTOs typés via Zod (`z.infer`), les 14 endpoints identifiés, le pipeline back (router typé → controller → service → query) et front (composant → hook → fetchHandler), l'erreur hiérarchie `AppError`, le piège BIGINT→string (colonnes PK/FK en INTEGER), l'absence de pagination (confirmé à nouveau explicitement).

## Décision 1 — Stratégie de `totalDeath` (change le résumé original)

Le résumé original disait que `totalDeath` n'est **jamais** stocké en base. C'est maintenant faux **pour `Boss`** :

- **`Boss.totalDeath`** : colonne dénormalisée en base. Mise à jour **immédiate et atomique**, dans la même transaction que l'écriture sur `death` :
  - `addDeath` (POST /bosses/:id/deaths) → INSERT death + `boss.increment('totalDeath')`
  - `deleteDeath` (DELETE /deaths/:id) → récupérer le `bossId` de la mort, puis DELETE death + `boss.decrement('totalDeath')`
  - `updateDeath` ne touche jamais au compteur (seuls `date`/`comment` changent)
  - **Filet de sécurité** : quand on charge la liste complète des morts d'un boss (`GET /bosses/:id`), comparer `deaths.length` à `boss.totalDeath` et corriger si divergence (protection contre bug/édition manuelle en base).
- **`Game.totalDeath`** : **PAS dénormalisé**. Calculé à la volée via `SUM(boss.totalDeath) GROUP BY boss.gameId` — agrégation légère sur la table `boss` uniquement (jamais besoin de toucher `death` pour une vue au niveau jeu). L'index `idx_boss_game_id` (déjà existant en base) couvre ce besoin.

Raison du choix : éviter le double-JOIN `death → boss → game` qui deviendrait lourd avec beaucoup de morts (ex: Malenia), sans pour autant multiplier les compteurs dénormalisés à synchroniser.

## Décision 2 — `firstTry` / `lastTry` / `defeatedAt` sur `Boss`

Définition retenue (plus robuste qu'un simple « première/dernière mort ») :

> **firstTry** = MIN parmi { toutes les dates de mort du boss, `defeatedAt` si renseigné }
> **lastTry** = MAX parmi { toutes les dates de mort du boss, `defeatedAt` si renseigné }
> Si aucune mort ET pas vaincu → **null** pour les deux.

Cas couverts :
- Boss jamais touché → `firstTry`/`lastTry` = `null`
- Morts enregistrées, pas encore vaincu → min/max des morts
- Vaincu sans aucune mort (« deathless ») → `firstTry` = `lastTry` = `defeatedAt`
- Morts + vaincu → `firstTry` = 1ère mort, `lastTry` = `defeatedAt` (sauf édition manuelle tardive d'une mort postérieure à `defeatedAt`, auquel cas le vrai max prévaut)

**Conséquence sur les DTOs** : `firstTry: string` et `lastTry: string` (non-nullables dans le fichier fourni) doivent devenir **`firstTry: string | null`** et **`lastTry: string | null`** dans `BossSummaryDto` (et donc `BossDto`).

Utilité de chaque champ confirmée : `defeatedAt` = fait générateur, `firstTry` permet de calculer un « temps pour vaincre » (`defeatedAt - firstTry`), `lastTry` utile surtout avant la victoire (montre l'activité récente sur un boss).

## Décision 3 — `Game.startedAt` remplacé par `createdAt` (change le résumé original)

- La colonne `game.started_at` est supprimée en base ; `Game.createdAt` (timestamp Sequelize automatique) joue désormais ce rôle.
- **Le DTO public garde le nom `startedAt`** — aucun changement de contrat API, seule la source interne change (`game.createdAt` → mappé vers `startedAt` dans le mapper).

## Décision 4 — `createdAt`/`updatedAt` partout

Toutes les tables (`game`, `boss`, `death`) ont maintenant `created_at`/`updated_at` (Sequelize `timestamps: true`, `createdAt: "created_at"`, `updatedAt: "updated_at"`).
- `game` : `createdAt` remplace `startedAt` (décision 3)
- `boss` : `defeated_at` reste une info distincte, `createdAt`/`updatedAt` sont purement internes (pas exposés en DTO pour l'instant)
- `death` : `createdAt`/`updatedAt` s'ajoutent **en plus** de `date` (qui reste la donnée éditable/métier) — pas exposés en DTO pour l'instant

## Décision 5 — Migrations

Fichiers réels (`apps/server/src/sql/migrations/`) :
- `V004__setup_game_death_project.sql` : tables `game`/`boss`/`death`, cascades, `idx_boss_game_id`, `idx_death_boss_id`
- `V005__add_boss_total_boss_death.sql` : `ALTER TABLE boss ADD COLUMN total_death INT NOT NULL DEFAULT 0;`
- `V006__add_timestamps.sql` : ajoute `created_at`/`updated_at` sur les 3 tables ; sur `game`, migre les données de `started_at` vers `created_at` puis **supprime** `started_at`
- `V008__prefix_game_death_counter_tables.sql` : tables renommées `gdc_game`/`gdc_boss`/`gdc_death` (préfixe du projet, comme `backlog_*`), clés étrangères et index renommés en conséquence (`idx_gdc_boss_game_id`, `idx_gdc_death_boss_id`)

## Décision 6 — Modèles Sequelize et stratégie ORM vs SQL brut

- `Game.ts`, `Boss.ts`, `Death.ts` créés avec `field` explicite sur chaque colonne (même si `underscored: true` est déjà configuré globalement dans `sequelize.ts` — préférence assumée du porteur du projet, pas une nécessité technique).
- Associations Sequelize mises en place : `Game.hasMany(Boss, { as: "bosses" })` / `Boss.belongsTo(Game, { as: "game" })` / `Boss.hasMany(Death, { as: "deaths" })` / `Death.belongsTo(Boss, { as: "boss" })`. Déclarées dans le fichier du modèle « enfant » (évite les imports circulaires).

## État d'avancement

✅ DTOs, endpoints (14), migrations V004-V006, gestion d'erreurs back, router typé, validation Zod
✅ Modèles Sequelize `Game`/`Boss`/`Death` avec associations
✅ `createGame`, `deleteGame` (back complet)
✅ `getAllGames` (back complet : query SQL brute avec `SUM`, mapper, service, controller, route)
✅ Shell UI complet (non branché à l'API), favicon
🚧 En cours : `getOneGame` — décisions restant à trancher (voir ci-dessous)
🚧 À faire ensuite : `getOneBoss`, `createBoss`, `deleteBoss`, `updateBoss`, `setBossDefeated`, `addDeath`, `deleteDeath`, `updateDeath`, `setGameFinished`, `updateGame`
🚧 Front : `ApiError` + fix `fetchHandler`, hook `useApiMutation` générique, branchement réel sur l'API

## Autres points

- Pour la partie delete voici les fichiers manquants
export const deleteGameMapper = {
	fromDeleteGameDtoToDeleteGameBean: (
		deleteGamePathParamDto: DeleteGamePathParamDto,
	): DeleteGameBean => {
		const deleteGameBean = {
			id: deleteGamePathParamDto.id,
		};
		return deleteGameBean;
	},
};

export type DeleteGameBean = {
	id: number;
};

export const deleteGamePathParamSchema = z.object({
	id: z.coerce
		.number({ message: "ID should be integer" })
		.int()
		.positive({ message: "ID should be positive" }),
});

- La query getOneGame va devoir utiliser `include: { model: Boss }` + nommage du Bean en GameBean à priori
