/* eslint-disable citadel/max-one-export -- le cahier des charges impose 6 fichiers, dont mappers.ts pour tous les mappers */
import type {
	Company,
	GameImport,
	IgdbAlternativeName,
	IgdbCompany,
	IgdbGameData,
	IgdbPlatform,
	IgdbSearchGame,
	IgdbVersionGame,
	Platform,
	SearchResult,
	Version,
	VersionPlatform,
} from "./types";
import { toIsoDate, trimToNull } from "./utils";

// ---------- IGDB → résultats de recherche ----------

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

export function mapSearchResult(game: IgdbSearchGame): SearchResult {
	return {
		id: game.id,
		name: game.name,
		frenchName: findFrenchName(game.name, game.alternative_names),
		releaseYear:
			game.first_release_date === undefined
				? null
				: new Date(game.first_release_date * 1000).getUTCFullYear(),
		coverImageId: game.cover?.image_id ?? null,
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
				version.id === gameId
					? null
					: (trimToNull(version.version_title) ?? version.name),
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
		alternativeNames: (original.alternative_names ?? []).flatMap(
			({ id, name, comment }) => {
				const trimmedName = trimToNull(name);
				return trimmedName === null
					? []
					: [{ id, gameId, name: trimmedName, comment: trimToNull(comment) }];
			},
		),
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
