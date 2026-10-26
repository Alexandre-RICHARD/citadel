import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/formatSeriesNumber.ts";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/rule/seriesNumber/seriesEntry.type.ts";

import type { UserGameBean } from "../../bean/userGameBean.type.ts";
import type { UserVersionBean } from "../../bean/userVersionBean.type.ts";
import type { UserGameEntity } from "../../dbType/userGameEntity.type.ts";
import type { UserVersionEntity } from "../../dbType/userVersionEntity.type.ts";
import type { Dlc } from "../../models/Dlc.ts";
import type { UserGame } from "../../models/UserGame.ts";
import type { Version } from "../../models/Version.ts";
import type { VersionPlatform } from "../../models/VersionPlatform.ts";
import { fromCompanyEntityToCompanyBean } from "./fromCompanyEntityToCompanyBean.ts";
import { fromPlatformEntityToPlatformBean } from "./fromPlatformEntityToPlatformBean.ts";
import { fromSeriesEntityToSeriesBean } from "./fromSeriesEntityToSeriesBean.ts";

type Entities = {
	userGames: UserGameEntity[];
	dlcs: Dlc[];
	userVersions: UserVersionEntity[];
	versionPlatforms: VersionPlatform[];
	// Versions originales des jeux : leur lien IGDB est celui du jeu, même quand elles ne sont pas jouées
	originalVersions: Version[];
	// Les jeux du backlog des séries des lignes : un numéro s'affiche avec les décimales de sa famille
	seriesNumbers: UserGame[];
};

// Range chaque élément sous sa clé, dans l'ordre reçu
function groupBy<Item, Key>(
	items: Item[],
	getKey: (item: Item) => Key,
): Map<Key, Item[]> {
	const groups = new Map<Key, Item[]>();
	for (const item of items) {
		const key = getKey(item);
		groups.set(key, [...(groups.get(key) ?? []), item]);
	}
	return groups;
}

function fromUserVersionEntityToUserVersionBean(
	userVersion: UserVersionEntity,
	releaseDates: Map<string, string | null>,
): UserVersionBean {
	const { version, platform } = userVersion;
	// Un émulateur reprend la date de sortie de la version sur la console qu'il émule (§7)
	const releasePlatformId = platform.emulatedPlatformId ?? platform.id;
	return {
		id: userVersion.id,
		version: {
			id: version.id,
			title: version.title,
			coverImageId: version.coverImageId,
			igdbUrl: version.igdbUrl,
		},
		platform: fromPlatformEntityToPlatformBean(platform),
		releaseDate: releaseDates.get(`${version.id}-${releasePlatformId}`) ?? null,
		status: userVersion.status,
		isOwned: userVersion.isOwned,
		isUpNext: userVersion.isUpNext,
		finishDate: userVersion.finishDate,
		sureFinishCount: userVersion.sureFinishCount,
		probableFinishCount: userVersion.probableFinishCount,
		trackedPlayTimeMinutes: userVersion.trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes: userVersion.estimatedPlayTimeMinutes,
		rating: userVersion.rating,
		comment: userVersion.comment,
		doneDlcIds: userVersion.doneDlcs
			.map(({ dlcId }) => dlcId)
			.toSorted((first, second) => first - second),
	};
}

// Le backlog tel qu'il est stocké → ses lignes ; un jeu du backlog sans version jouée (incohérence) n'a pas de ligne
export function fromUserGameEntitiesToUserGameBeans({
	userGames,
	dlcs,
	userVersions,
	versionPlatforms,
	originalVersions,
	seriesNumbers,
}: Entities): UserGameBean[] {
	const dlcsByGameId = groupBy(dlcs, ({ gameId }) => gameId);
	const userVersionsByGameId = groupBy(
		userVersions,
		({ version }) => version.gameId,
	);
	const igdbUrlsByGameId = new Map(
		originalVersions.map(({ id, igdbUrl }) => [id, igdbUrl]),
	);
	const releaseDates = new Map(
		versionPlatforms.map(({ versionId, platformId, releaseDate }) => [
			`${versionId}-${platformId}`,
			releaseDate,
		]),
	);
	const seriesEntriesBySeriesId = new Map(
		[...groupBy(seriesNumbers, ({ seriesId }) => seriesId)].map(
			([seriesId, members]) => [
				seriesId,
				members.flatMap(({ gameId, seriesNumber }): SeriesEntry[] =>
					seriesNumber === null ? [] : [{ gameId, seriesNumber }],
				),
			],
		),
	);

	return userGames.flatMap((userGame): UserGameBean[] => {
		const { game } = userGame;
		const gameUserVersions = userVersionsByGameId.get(game.id) ?? [];
		if (gameUserVersions.length === 0) return [];

		return [
			{
				game: {
					id: game.id,
					name: game.name,
					frenchName: game.frenchName,
					firstReleaseDate: game.firstReleaseDate,
					isCancelled: game.isCancelled,
					igdbUrl: igdbUrlsByGameId.get(game.id) ?? "",
					developer: fromCompanyEntityToCompanyBean(game.developer),
					publisher: fromCompanyEntityToCompanyBean(game.publisher),
					proposedSeries: fromSeriesEntityToSeriesBean(game.proposedSeries),
				},
				imageId: userGame.imageId,
				endingType: userGame.endingType,
				series: fromSeriesEntityToSeriesBean(userGame.series),
				seriesNumber: userGame.seriesNumber,
				seriesNumberLabel:
					userGame.seriesNumber === null
						? null
						: formatSeriesNumber(
								userGame.seriesNumber,
								seriesEntriesBySeriesId.get(userGame.seriesId) ?? [],
							),
				dlcs: (dlcsByGameId.get(game.id) ?? []).map(({ id, name }) => ({
					id,
					name,
				})),
				userVersions: gameUserVersions.map((userVersion) =>
					fromUserVersionEntityToUserVersionBean(userVersion, releaseDates),
				),
			},
		];
	});
}
