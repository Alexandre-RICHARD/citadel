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
	IgdbPlatform,
	IgdbSearchHit,
	IgdbVersionGame,
	Platform,
	SearchResult,
	Variant,
	VariantRow,
	Version,
	VersionPlatform,
} from "./types";
import {
	findById,
	getEarliestDate,
	getGameStatus,
	getHighestValue,
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

/** Jeu déjà en base → résultat de recherche : son id est celui de son original, son image celle choisie à l'ajout, ses plateformes celles de toutes ses versions */
export function mapStoredSearchResult(
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
		coverImageId: game.imageId,
		platformNames: [...platformIds].flatMap(
			(platformId) => findById(database.platforms, platformId)?.name ?? [],
		),
	};
}

// ---------- IGDB → données de la base (modale d'ajout) ----------

/** Nom affiché : l'abréviation IGDB (« PS2 »), sinon le nom complet */
function mapPlatform(platform: IgdbPlatform): Platform {
	return {
		id: platform.id,
		name: trimToNull(platform.abbreviation) ?? platform.name,
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

/** Réponses IGDB → données de la base, montrées dans la modale puis écrites à « Valider » (section 8) */
export function mapGameImport(data: IgdbGameData): GameImport {
	const { original } = data;
	const gameId = original.id;
	// Une seule valeur par colonne (section 3) : la première série, la franchise principale sinon la première,
	// la première société de chaque rôle
	const series = original.collections?.at(0) ?? null;
	const franchise = original.franchise ?? original.franchises?.at(0) ?? null;
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
	const originalCover = versions.find(({ id }) => id === gameId)?.cover
		?.image_id;

	return {
		game: {
			id: gameId,
			name: original.name,
			frenchName: findFrenchName(original.name, original.alternative_names),
			firstReleaseDate: toIsoDate(original.first_release_date),
			isCancelled: data.gameStatus === "Cancelled",
			seriesId: series?.id ?? null,
			franchiseId: franchise?.id ?? null,
			developerId: developer?.id ?? null,
			publisherId: publisher?.id ?? null,
		},
		versions: versions.map((version): Version => ({
			id: version.id,
			gameId,
			title:
				version.id === gameId ? null : getVersionTitle(version, original.name),
			coverImageId: version.cover?.image_id ?? null,
			url: version.url,
		})),
		versionPlatforms: versions.flatMap(mapVersionPlatforms),
		platforms: [...platforms.values()],
		dlcs: data.dlcs.map(({ id, name }) => ({ id, gameId, name })),
		series: series === null ? null : { id: series.id, name: series.name },
		franchise:
			franchise === null ? null : { id: franchise.id, name: franchise.name },
		developer: developer === null ? null : mapCompany(developer),
		publisher: publisher === null ? null : mapCompany(publisher),
		imageIds: [
			...(originalCover === undefined ? [] : [originalCover]),
			...(original.artworks ?? []).map((artwork) => artwork.image_id),
		],
		warnings: data.skippedEntries.map(({ reason, entry }) => ({
			message: reason,
			igdbData: JSON.stringify(entry, null, 2),
		})),
	};
}

// ---------- Base → lignes du tableau (sections 5 et 7), recalculées à chaque affichage ----------

function mapVariantRow(
	database: Database,
	variant: Variant,
	dlcIds: number[],
): VariantRow {
	const version = findById(database.versions, variant.versionId);
	const platform = findById(database.platforms, variant.platformId) ?? {
		id: variant.platformId,
		name: `#${variant.platformId}`,
		technicalName: "",
		emulatedPlatformId: null,
	};
	// Un émulateur reprend la date de sortie de la version sur la console qu'il émule
	const releasePlatformId = platform.emulatedPlatformId ?? platform.id;
	return {
		variantId: variant.id,
		versionId: variant.versionId,
		imageId: version?.coverImageId ?? null,
		versionTitle: version?.title ?? null,
		releaseDate:
			database.versionPlatforms.find(
				(versionPlatform) =>
					versionPlatform.versionId === variant.versionId &&
					versionPlatform.platformId === releasePlatformId,
			)?.releaseDate ?? null,
		platform,
		status: variant.status,
		owned: variant.owned,
		playSoon: variant.playSoon,
		finishDate: variant.finishDate,
		sureFinishCount: variant.sureFinishCount,
		probableFinishCount: variant.probableFinishCount,
		doneDlcCount: database.variantDlcs.filter(
			(variantDlc) =>
				variantDlc.variantId === variant.id &&
				dlcIds.includes(variantDlc.dlcId),
		).length,
		dlcCount: dlcIds.length,
		trackedPlayTimeMinutes: variant.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: variant.estimatedPlayTimeMinutes,
		totalPlayTimeMinutes:
			variant.trackedPlayTimeMinutes + variant.estimatedPlayTimeMinutes,
		rating: variant.rating,
		comment: variant.comment,
		igdbUrl: version?.url ?? "",
	};
}

/** Ligne du jeu : ses données et les agrégats de ses variantes (section 7), vides quand il est impossible de choisir */
function mapGameRow(
	database: Database,
	game: Game,
	variantRows: VariantRow[],
	dlcIds: number[],
): GameRow {
	const singleVariantRow =
		variantRows.length === 1 ? (variantRows.at(0) ?? null) : null;
	const variantIds = variantRows.map(({ variantId }) => variantId);
	// Un DLC compte comme fait s'il l'est sur au moins une variante
	const doneDlcIds = new Set(
		database.variantDlcs
			.filter(
				(variantDlc) =>
					variantIds.includes(variantDlc.variantId) &&
					dlcIds.includes(variantDlc.dlcId),
			)
			.map(({ dlcId }) => dlcId),
	);
	const comments = variantRows.flatMap(({ comment }) =>
		comment === null ? [] : [comment],
	);

	return {
		gameId: game.id,
		imageId: game.imageId,
		name: game.name,
		frenchName: game.frenchName,
		// Ligne à variante unique : le titre de sa version sous le nom, sauf pour l'originale
		versionTitle: singleVariantRow?.versionTitle ?? null,
		series: findById(database.series, game.seriesId),
		seriesNumber: game.seriesNumber,
		franchise: findById(database.franchises, game.franchiseId),
		developer: findById(database.companies, game.developerId),
		publisher: findById(database.companies, game.publisherId),
		releaseDate: game.firstReleaseDate,
		isCancelled: game.isCancelled,
		endingType: game.endingType,
		platform: singleVariantRow?.platform ?? null,
		status: getGameStatus(variantRows.map(({ status }) => status)),
		owned: variantRows.some(({ owned }) => owned),
		playSoon: variantRows.some(({ playSoon }) => playSoon),
		finishDate: getEarliestDate(
			variantRows.map(({ finishDate }) => finishDate),
		),
		sureFinishCount: sum(
			variantRows.map(({ sureFinishCount }) => sureFinishCount),
		),
		probableFinishCount: sum(
			variantRows.map(({ probableFinishCount }) => probableFinishCount),
		),
		doneDlcCount: doneDlcIds.size,
		dlcCount: dlcIds.length,
		trackedPlayTimeMinutes: sum(
			variantRows.map(({ trackedPlayTimeMinutes }) => trackedPlayTimeMinutes),
		),
		estimatedPlayTimeMinutes: sum(
			variantRows.map(
				({ estimatedPlayTimeMinutes }) => estimatedPlayTimeMinutes,
			),
		),
		totalPlayTimeMinutes: sum(
			variantRows.map(({ totalPlayTimeMinutes }) => totalPlayTimeMinutes),
		),
		rating: getHighestValue(variantRows.map(({ rating }) => rating)),
		comment: comments.length === 1 ? (comments.at(0) ?? null) : null,
		// La fiche originale du jeu porte le même id que lui
		igdbUrl: findById(database.versions, game.id)?.url ?? "",
		variantRows,
	};
}

/** Base → lignes du tableau : une ligne par jeu qui a au moins une variante, dans l'ordre d'ajout (section 5) */
export function mapGameRows(database: Database): GameRow[] {
	return database.games.flatMap((game) => {
		const versionIds = database.versions
			.filter(({ gameId }) => gameId === game.id)
			.map(({ id }) => id);
		const dlcIds = database.dlcs
			.filter(({ gameId }) => gameId === game.id)
			.map(({ id }) => id);
		const variantRows = database.variants
			.filter(({ versionId }) => versionIds.includes(versionId))
			.map((variant) => mapVariantRow(database, variant, dlcIds));
		return variantRows.length === 0
			? []
			: [mapGameRow(database, game, variantRows, dlcIds)];
	});
}

// ---------- Base → modale « Modifier le jeu » (section 8) ----------

/** Un jeu de la base sous la forme de la modale d'ajout : la même modale sert à le modifier */
export function mapStoredGameImport(
	database: Database,
	game: Game,
	imageIds: IgdbImageId[],
): GameImport {
	const versions = database.versions.filter(
		(version) => version.gameId === game.id,
	);
	const versionIds = versions.map(({ id }) => id);
	const versionPlatforms = database.versionPlatforms.filter(({ versionId }) =>
		versionIds.includes(versionId),
	);
	const platformIds = versionPlatforms.map(({ platformId }) => platformId);
	return {
		game: {
			id: game.id,
			name: game.name,
			frenchName: game.frenchName,
			firstReleaseDate: game.firstReleaseDate,
			isCancelled: game.isCancelled,
			seriesId: game.seriesId,
			franchiseId: game.franchiseId,
			developerId: game.developerId,
			publisherId: game.publisherId,
		},
		versions,
		versionPlatforms,
		platforms: database.platforms.filter(({ id }) => platformIds.includes(id)),
		dlcs: database.dlcs.filter((dlc) => dlc.gameId === game.id),
		series: findById(database.series, game.seriesId),
		franchise: findById(database.franchises, game.franchiseId),
		developer: findById(database.companies, game.developerId),
		publisher: findById(database.companies, game.publisherId),
		imageIds,
		warnings: [],
	};
}
