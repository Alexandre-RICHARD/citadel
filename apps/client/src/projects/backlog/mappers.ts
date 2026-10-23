/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont mappers.ts pour tous les mappers */
import type {
	Company,
	Database,
	Game,
	GameImport,
	GameRow,
	IgdbAlternativeName,
	IgdbCompany,
	IgdbGameData,
	IgdbImageId,
	IgdbOriginalGame,
	IgdbPlatform,
	IgdbSearchHit,
	IgdbVersionGame,
	Platform,
	RowIndexes,
	SearchResult,
	Series,
	UserGame,
	UserVersion,
	UserVersionRow,
	Version,
	VersionPlatform,
} from "./types";
import {
	findById,
	formatSeriesNumber,
	getEarliestDate,
	getGameStatus,
	getHighestValue,
	mergeById,
	sum,
	toIsoDate,
	trimToNull,
} from "./utils";

// ---------- IGDB ou base → résultats de recherche ----------

/**
 * Nom VF (section 3) : le titre des noms alternatifs commenté « French ». IGDB n'a pas de région France.
 * `null` sans titre français, ou s'il est identique au nom VO : un seul nom s'affiche.
 */
export function findFrenchName(
	name: string,
	alternativeNames: IgdbAlternativeName[] = [],
): string | null {
	const frenchName = trimToNull(
		alternativeNames.find(({ comment }) =>
			comment?.toLowerCase().includes("french"),
		)?.name,
	);
	return frenchName === null || frenchName.toLowerCase() === name.toLowerCase()
		? null
		: frenchName;
}

export function mapSearchResult({
	game,
	matchedName,
}: IgdbSearchHit): SearchResult {
	return {
		id: game.id,
		name: game.name,
		frenchName: findFrenchName(game.name, game.alternative_names),
		matchedName,
		releaseYear:
			game.first_release_date === undefined
				? null
				: new Date(game.first_release_date * 1000).getUTCFullYear(),
		coverImageId: game.cover?.image_id ?? null,
		platformNames: (game.platforms ?? []).map(
			(platform) => trimToNull(platform.abbreviation) ?? platform.name,
		),
	};
}

/**
 * Jeu en base hors backlog → ligne de « 📚 Ma base » : son id est celui de son original, ses plateformes celles de toutes
 * ses versions, son image la cover de l'original (la miniature choisie est partie avec le jeu du backlog).
 */
export function mapDatabaseSearchResult(
	database: Database,
	game: Game,
): SearchResult {
	const versionIds = database.versions
		.filter(({ gameId }) => gameId === game.id)
		.map(({ id }) => id);
	const platformIds = new Set(
		database.versionPlatforms
			.filter(({ versionId }) => versionIds.includes(versionId))
			.map(({ platformId }) => platformId),
	);
	return {
		id: game.id,
		name: game.name,
		frenchName: game.frenchName,
		matchedName: null,
		releaseYear:
			game.firstReleaseDate === null
				? null
				: Number(game.firstReleaseDate.slice(0, 4)),
		coverImageId: findById(database.versions, game.id)?.coverImageId ?? null,
		platformNames: [...platformIds].flatMap(
			(platformId) => findById(database.platforms, platformId)?.shortName ?? [],
		),
	};
}

// ---------- IGDB → données de la base (modale d'ajout) ----------

/** Nom affiché : l'abréviation IGDB (« PS2 »), sinon le nom complet */
function mapPlatform(platform: IgdbPlatform): Platform {
	return {
		id: platform.id,
		shortName: trimToNull(platform.abbreviation) ?? platform.name,
		technicalName: platform.slug,
		emulatedPlatformId: null,
	};
}

function mapCompany(company: IgdbCompany): Company {
	return {
		id: company.id,
		name: company.name,
		logoImageId: company.logo?.image_id ?? null,
	};
}

/** Une ligne par plateforme de la version, avec sa plus ancienne date de sortie, toutes régions confondues */
function mapVersionPlatforms(version: IgdbVersionGame): VersionPlatform[] {
	return (version.platforms ?? []).map(({ id }) => {
		const dates = (version.release_dates ?? []).flatMap((releaseDate) =>
			releaseDate.platform === id && releaseDate.date !== undefined
				? [releaseDate.date]
				: [],
		);
		return {
			versionId: version.id,
			platformId: id,
			releaseDate: dates.length === 0 ? null : toIsoDate(Math.min(...dates)),
		};
	});
}

function getFirstReleaseTime(version: IgdbVersionGame): number {
	const dates = (version.release_dates ?? []).flatMap(({ date }) =>
		date === undefined ? [] : [date],
	);
	return dates.length === 0 ? Number.MAX_SAFE_INTEGER : Math.min(...dates);
}

/** Types IGDB des versions, en français ; une édition (« Main Game » ou « Bundle » rattachés par `version_parent`) n'y est pas */
const versionTypeLabels: Partial<Record<string, string>> = {
	"Port": "Portage",
	"Remaster": "Remaster",
	"Expanded Game": "Version enrichie",
};

/**
 * Titre d'une version autre que l'originale (section 5) : `version_title`, sinon son nom s'il diffère de celui du jeu,
 * sinon son type et l'année de sa première sortie, pour la distinguer de l'originale (« Portage 1998 », « Édition 2015 »)
 */
function getVersionTitle(version: IgdbVersionGame, gameName: string): string {
	const versionTitle = trimToNull(version.version_title);
	if (versionTitle !== null) {
		return versionTitle;
	}
	if (version.name.trim() !== gameName.trim()) {
		return version.name;
	}
	const typeLabel =
		versionTypeLabels[version.game_type?.type ?? ""] ?? "Édition";
	const firstReleaseTime = getFirstReleaseTime(version);
	return firstReleaseTime === Number.MAX_SAFE_INTEGER
		? typeLabel
		: `${typeLabel} ${new Date(firstReleaseTime * 1000).getUTCFullYear()}`;
}

/**
 * Série proposée par IGDB (section 3) : la collection la plus large, sans parente parmi celles du jeu ;
 * sinon la franchise principale, sinon la première ; sinon aucune
 */
function getIgdbSeries(original: IgdbOriginalGame): Omit<Series, "id"> | null {
	const collections = original.collections ?? [];
	const collectionIds = collections.map(({ id }) => id);
	const collection =
		collections.find(
			({ as_child_relations: parentRelations = [] }) =>
				!parentRelations.some(
					({ parent_collection: parentId }) =>
						parentId !== undefined && collectionIds.includes(parentId),
				),
		) ?? collections.at(0);
	if (collection !== undefined) {
		return {
			name: collection.name,
			igdbCollectionId: collection.id,
			igdbFranchiseId: null,
		};
	}
	const franchise = original.franchise ?? original.franchises?.at(0);
	return franchise === undefined
		? null
		: {
				name: franchise.name,
				igdbCollectionId: null,
				igdbFranchiseId: franchise.id,
			};
}

/** Images proposées pour la miniature (section 8) : la cover de l'original d'abord, puis les artworks */
export function mapGameImages({
	cover,
	artworks = [],
}: {
	cover?: { image_id: IgdbImageId } | undefined;
	artworks?: { image_id: IgdbImageId }[] | undefined;
}): IgdbImageId[] {
	return [
		...(cover === undefined ? [] : [cover.image_id]),
		...artworks.map((artwork) => artwork.image_id),
	];
}

/** Réponses IGDB → données de la base, montrées dans la modale puis écrites à « Valider » (section 8) */
export function mapGameImport(data: IgdbGameData): GameImport {
	const { original } = data;
	const gameId = original.id;
	// Une seule société par rôle (section 3) : la première
	const developer =
		original.involved_companies?.find((involved) => involved.developer)
			?.company ?? null;
	const publisher =
		original.involved_companies?.find((involved) => involved.publisher)
			?.company ?? null;

	// L'originale d'abord, puis les autres versions dans l'ordre de sortie
	function compareVersions(
		first: IgdbVersionGame,
		second: IgdbVersionGame,
	): number {
		if (first.id === gameId) {
			return -1;
		}
		if (second.id === gameId) {
			return 1;
		}
		return getFirstReleaseTime(first) - getFirstReleaseTime(second);
	}
	const versions = data.versions.toSorted(compareVersions);

	const platforms = new Map<number, Platform>();
	for (const version of versions) {
		for (const platform of version.platforms ?? []) {
			platforms.set(platform.id, mapPlatform(platform));
		}
	}

	return {
		game: {
			id: gameId,
			name: original.name,
			frenchName: findFrenchName(original.name, original.alternative_names),
			firstReleaseDate: toIsoDate(original.first_release_date),
			isCancelled: data.gameStatus === "Cancelled",
			developerId: developer?.id ?? null,
			publisherId: publisher?.id ?? null,
		},
		versions: versions.map((version): Version => ({
			id: version.id,
			gameId,
			title:
				version.id === gameId ? null : getVersionTitle(version, original.name),
			coverImageId: version.cover?.image_id ?? null,
			igdbUrl: version.url,
		})),
		versionPlatforms: versions.flatMap(mapVersionPlatforms),
		platforms: [...platforms.values()],
		dlcs: data.dlcs.map(({ id, name }) => ({ id, gameId, name })),
		proposedSeries: getIgdbSeries(original),
		developer: developer === null ? null : mapCompany(developer),
		publisher: publisher === null ? null : mapCompany(publisher),
		imageIds: mapGameImages({
			cover: versions.find(({ id }) => id === gameId)?.cover,
			artworks: original.artworks,
		}),
		warnings: data.skippedEntries.map(({ message, entry }) => ({
			message,
			entryJson: JSON.stringify(entry, null, 2),
		})),
	};
}

// ---------- Base → lignes du tableau (sections 5 et 7), recalculées seulement quand la base change ----------

function indexById<T extends { id: number }>(items: T[]): Map<number, T> {
	return new Map(items.map((item) => [item.id, item]));
}

/** Range chaque élément sous sa clé, dans l'ordre de la base */
function groupBy<T, K>(items: T[], getKey: (item: T) => K): Map<K, T[]> {
	const groups = new Map<K, T[]>();
	for (const item of items) {
		const key = getKey(item);
		const group = groups.get(key);
		if (group === undefined) {
			groups.set(key, [item]);
		} else {
			group.push(item);
		}
	}
	return groups;
}

/** Un seul parcours de la base : le calcul des lignes reste proportionnel à sa taille */
function buildRowIndexes(database: Database): RowIndexes {
	const versions = indexById(database.versions);
	return {
		games: indexById(database.games),
		versions,
		platforms: indexById(database.platforms),
		series: indexById(database.series),
		companies: indexById(database.companies),
		releaseDates: new Map(
			database.versionPlatforms.map(
				({ versionId, platformId, releaseDate }) => [
					`${versionId}-${platformId}`,
					releaseDate,
				],
			),
		),
		userVersionsByGameId: groupBy(
			database.userVersions,
			({ versionId }) => versions.get(versionId)?.gameId ?? null,
		),
		dlcIdsByGameId: new Map(
			[...groupBy(database.dlcs, ({ gameId }) => gameId)].map(
				([gameId, dlcs]) => [gameId, new Set(dlcs.map(({ id }) => id))],
			),
		),
		doneDlcIdsByUserVersionId: new Map(
			[...groupBy(database.doneDlcs, ({ userVersionId }) => userVersionId)].map(
				([userVersionId, doneDlcs]) => [
					userVersionId,
					doneDlcs.map(({ dlcId }) => dlcId),
				],
			),
		),
		seriesEntriesBySeriesId: new Map(
			[...groupBy(database.userGames, ({ seriesId }) => seriesId)].map(
				([seriesId, userGames]) => [
					seriesId,
					userGames.flatMap(({ gameId, seriesNumber }) =>
						seriesNumber === null ? [] : [{ gameId, seriesNumber }],
					),
				],
			),
		),
	};
}

function getIndexed<T>(index: Map<number, T>, id: number | null): T | null {
	return id === null ? null : (index.get(id) ?? null);
}

function mapUserVersionRow(
	indexes: RowIndexes,
	userVersion: UserVersion,
	dlcIds: Set<number>,
): UserVersionRow {
	const version = getIndexed(indexes.versions, userVersion.versionId);
	const platform = getIndexed(indexes.platforms, userVersion.platformId) ?? {
		id: userVersion.platformId,
		shortName: `#${userVersion.platformId}`,
		technicalName: "",
		emulatedPlatformId: null,
	};
	// Un émulateur reprend la date de sortie de la version sur la console qu'il émule
	const releasePlatformId = platform.emulatedPlatformId ?? platform.id;
	return {
		userVersionId: userVersion.id,
		versionId: userVersion.versionId,
		coverImageId: version?.coverImageId ?? null,
		versionTitle: version?.title ?? null,
		releaseDate:
			indexes.releaseDates.get(
				`${userVersion.versionId}-${releasePlatformId}`,
			) ?? null,
		platform,
		status: userVersion.status,
		isOwned: userVersion.isOwned,
		isUpNext: userVersion.isUpNext,
		finishDate: userVersion.finishDate,
		sureFinishCount: userVersion.sureFinishCount,
		probableFinishCount: userVersion.probableFinishCount,
		doneDlcCount: (
			indexes.doneDlcIdsByUserVersionId.get(userVersion.id) ?? []
		).filter((dlcId) => dlcIds.has(dlcId)).length,
		dlcCount: dlcIds.size,
		trackedPlayTimeMinutes: userVersion.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: userVersion.estimatedPlayTimeMinutes,
		totalPlayTimeMinutes:
			userVersion.trackedPlayTimeMinutes + userVersion.estimatedPlayTimeMinutes,
		rating: userVersion.rating,
		comment: userVersion.comment,
		igdbUrl: version?.igdbUrl ?? "",
	};
}

/** Ligne d'un jeu du backlog : ses données, sa personnalisation et les agrégats de ses versions jouées (section 7), vides quand il est impossible de choisir */
function mapGameRow(
	indexes: RowIndexes,
	game: Game,
	userGame: UserGame,
	userVersionRows: UserVersionRow[],
	dlcIds: Set<number>,
): GameRow {
	const singleUserVersionRow =
		userVersionRows.length === 1 ? (userVersionRows.at(0) ?? null) : null;
	// Un DLC compte comme fait s'il l'est sur au moins une version jouée
	const doneDlcIds = new Set(
		userVersionRows.flatMap(({ userVersionId }) =>
			(indexes.doneDlcIdsByUserVersionId.get(userVersionId) ?? []).filter(
				(dlcId) => dlcIds.has(dlcId),
			),
		),
	);
	const comments = userVersionRows.flatMap(({ comment }) =>
		comment === null ? [] : [comment],
	);

	return {
		gameId: game.id,
		imageId: userGame.imageId,
		name: game.name,
		frenchName: game.frenchName,
		// Ligne à version jouée unique : le titre de sa version sous le nom, sauf pour l'originale
		versionTitle: singleUserVersionRow?.versionTitle ?? null,
		series: getIndexed(indexes.series, userGame.seriesId),
		proposedSeries: getIndexed(indexes.series, game.proposedSeriesId),
		seriesNumber: userGame.seriesNumber,
		seriesNumberLabel:
			userGame.seriesNumber === null
				? null
				: formatSeriesNumber(
						userGame.seriesNumber,
						indexes.seriesEntriesBySeriesId.get(userGame.seriesId) ?? [],
					),
		developer: getIndexed(indexes.companies, game.developerId),
		publisher: getIndexed(indexes.companies, game.publisherId),
		releaseDate: game.firstReleaseDate,
		isCancelled: game.isCancelled,
		endingType: userGame.endingType,
		platform: singleUserVersionRow?.platform ?? null,
		status: getGameStatus(userVersionRows.map(({ status }) => status)),
		isOwned: userVersionRows.some(({ isOwned }) => isOwned),
		isUpNext: userVersionRows.some(({ isUpNext }) => isUpNext),
		finishDate: getEarliestDate(
			userVersionRows.map(({ finishDate }) => finishDate),
		),
		sureFinishCount: sum(
			userVersionRows.map(({ sureFinishCount }) => sureFinishCount),
		),
		probableFinishCount: sum(
			userVersionRows.map(({ probableFinishCount }) => probableFinishCount),
		),
		doneDlcCount: doneDlcIds.size,
		dlcCount: dlcIds.size,
		trackedPlayTimeMinutes: sum(
			userVersionRows.map(
				({ trackedPlayTimeMinutes }) => trackedPlayTimeMinutes,
			),
		),
		estimatedPlayTimeMinutes: sum(
			userVersionRows.map(
				({ estimatedPlayTimeMinutes }) => estimatedPlayTimeMinutes,
			),
		),
		totalPlayTimeMinutes: sum(
			userVersionRows.map(({ totalPlayTimeMinutes }) => totalPlayTimeMinutes),
		),
		rating: getHighestValue(userVersionRows.map(({ rating }) => rating)),
		comment: comments.length === 1 ? (comments.at(0) ?? null) : null,
		// La fiche originale du jeu porte le même id que lui
		igdbUrl: getIndexed(indexes.versions, game.id)?.igdbUrl ?? "",
		userVersionRows,
	};
}

/** Base → lignes du tableau : une ligne par jeu du backlog, dans l'ordre d'ajout au backlog (section 5) */
export function mapGameRows(database: Database): GameRow[] {
	const indexes = buildRowIndexes(database);
	return database.userGames.flatMap((userGame) => {
		const game = getIndexed(indexes.games, userGame.gameId);
		const dlcIds =
			indexes.dlcIdsByGameId.get(userGame.gameId) ?? new Set<number>();
		const userVersionRows = (
			indexes.userVersionsByGameId.get(userGame.gameId) ?? []
		).map((userVersion) => mapUserVersionRow(indexes, userVersion, dlcIds));
		// Un jeu du backlog a toujours une version jouée ; sinon, ou sans son jeu en base, pas de ligne
		return game === null || userVersionRows.length === 0
			? []
			: [mapGameRow(indexes, game, userGame, userVersionRows, dlcIds)];
	});
}

// ---------- Base → modale « Modifier le jeu » (section 8) ----------

/** Un jeu de la base sous la forme de la modale d'ajout : la même modale sert à le modifier */
function mapStoredGameImport(database: Database, game: Game): GameImport {
	const versions = database.versions.filter(
		(version) => version.gameId === game.id,
	);
	const versionIds = versions.map(({ id }) => id);
	const versionPlatforms = database.versionPlatforms.filter(({ versionId }) =>
		versionIds.includes(versionId),
	);
	const platformIds = versionPlatforms.map(({ platformId }) => platformId);
	const proposedSeries = findById(database.series, game.proposedSeriesId);
	return {
		game: {
			id: game.id,
			name: game.name,
			frenchName: game.frenchName,
			firstReleaseDate: game.firstReleaseDate,
			isCancelled: game.isCancelled,
			developerId: game.developerId,
			publisherId: game.publisherId,
		},
		versions,
		versionPlatforms,
		platforms: database.platforms.filter(({ id }) => platformIds.includes(id)),
		dlcs: database.dlcs.filter((dlc) => dlc.gameId === game.id),
		// La série proposée à l'ajout, pas celle d'IGDB aujourd'hui
		proposedSeries:
			proposedSeries === null
				? null
				: {
						name: proposedSeries.name,
						igdbCollectionId: proposedSeries.igdbCollectionId,
						igdbFranchiseId: proposedSeries.igdbFranchiseId,
					},
		developer: findById(database.companies, game.developerId),
		publisher: findById(database.companies, game.publisherId),
		imageIds: [],
		warnings: [],
	};
}

/** Les fiches IGDB dans leur ordre, remplacées par celles de la base quand elles y sont, puis celles de la base qu'IGDB n'a plus */
function mergeInIgdbOrder<T extends { id: number }>(
	igdbItems: T[],
	storedItems: T[],
): T[] {
	return mergeById(
		igdbItems.map((item) => findById(storedItems, item.id) ?? item),
		storedItems,
	);
}

/**
 * « Modifier le jeu » (section 8) : le jeu tel qu'il est en base, complété par les versions et DLC IGDB absents de la base.
 * Tant qu'IGDB n'a pas répondu, ou s'il échoue, seul ce qui est en base s'affiche.
 */
export function mapEditGameImport(
	database: Database,
	game: Game,
	gameImport: GameImport | null,
): GameImport {
	const stored = mapStoredGameImport(database, game);
	if (gameImport === null) {
		return stored;
	}
	const storedVersionIds = stored.versions.map(({ id }) => id);
	return {
		...stored,
		versions: mergeInIgdbOrder(gameImport.versions, stored.versions),
		versionPlatforms: [
			...stored.versionPlatforms,
			...gameImport.versionPlatforms.filter(
				({ versionId }) => !storedVersionIds.includes(versionId),
			),
		],
		platforms: mergeById(stored.platforms, gameImport.platforms),
		dlcs: mergeInIgdbOrder(gameImport.dlcs, stored.dlcs),
		warnings: gameImport.warnings,
	};
}
