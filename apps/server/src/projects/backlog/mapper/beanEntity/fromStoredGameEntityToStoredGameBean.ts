import type { PlatformBean } from "../../bean/platformBean.type.ts";
import type { StoredGameBean } from "../../bean/storedGameBean.type.ts";
import type { StoredVersionBean } from "../../bean/storedVersionBean.type.ts";
import type { StoredGameEntity } from "../../dbType/storedGameEntity.type.ts";
import { compareVersionsByRelease } from "../../helper/compareVersionsByRelease.ts";
import { getPlatformOptions } from "../../helper/getPlatformOptions.ts";
import { fromCompanyEntityToCompanyBean } from "./fromCompanyEntityToCompanyBean.ts";
import { fromPlatformEntityToPlatformBean } from "./fromPlatformEntityToPlatformBean.ts";
import { fromSeriesEntityToSeriesBean } from "./fromSeriesEntityToSeriesBean.ts";

// `emulators` : tous ceux en base, pour proposer après chaque console son émulateur
export function fromStoredGameEntityToStoredGameBean(
	game: StoredGameEntity,
	emulators: PlatformBean[],
): StoredGameBean {
	const versions = game.versions
		.map((version): StoredVersionBean => {
			const platforms = version.versionPlatforms.map((versionPlatform) => ({
				platform: fromPlatformEntityToPlatformBean(versionPlatform.platform),
				releaseDate: versionPlatform.releaseDate,
			}));
			return {
				id: version.id,
				title: version.title,
				coverImageId: version.coverImageId,
				igdbUrl: version.igdbUrl,
				platforms,
				platformOptions: getPlatformOptions(
					platforms.map(({ platform }) => platform),
					emulators,
				),
			};
		})
		.toSorted(compareVersionsByRelease(game.id));
	const { userGame } = game;

	return {
		id: game.id,
		name: game.name,
		frenchName: game.frenchName,
		firstReleaseDate: game.firstReleaseDate,
		isCancelled: game.isCancelled,
		// La fiche originale porte l'id du jeu, et son lien IGDB
		igdbUrl: versions.find(({ id }) => id === game.id)?.igdbUrl ?? "",
		proposedSeries: fromSeriesEntityToSeriesBean(game.proposedSeries),
		developer: fromCompanyEntityToCompanyBean(game.developer),
		publisher: fromCompanyEntityToCompanyBean(game.publisher),
		versions,
		dlcs: game.dlcs.map(({ id, name }) => ({ id, name })),
		customization:
			userGame === null
				? null
				: {
						imageId: userGame.imageId,
						endingType: userGame.endingType,
						series: fromSeriesEntityToSeriesBean(userGame.series),
						seriesNumber: userGame.seriesNumber,
					},
	};
}
