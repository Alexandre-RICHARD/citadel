import type { GameImportBean } from "../../bean/gameImportBean.type.ts";
import type { IgdbGameData } from "../../igdb/type/igdbGameData.type.ts";
import type { IgdbVersionGame } from "../../igdb/type/igdbVersionGame.type.ts";
import { findFrenchName } from "./findFrenchName.ts";
import { fromIgdbCompanyToCompanyBean } from "./fromIgdbCompanyToCompanyBean.ts";
import { fromIgdbTimestampToIsoDate } from "./fromIgdbTimestampToIsoDate.ts";
import { fromIgdbVersionToVersionPlatformBeans } from "./fromIgdbVersionToVersionPlatformBeans.ts";
import { getIgdbFirstReleaseTime } from "./getIgdbFirstReleaseTime.ts";
import { getIgdbProposedSeries } from "./getIgdbProposedSeries.ts";
import { getIgdbVersionTitle } from "./getIgdbVersionTitle.ts";

const CANCELLED_STATUS = "Cancelled";

// Réponses IGDB → le jeu tel que la base le stockera (cahier des charges, §3 et §5)
export function fromIgdbGameDataToGameImportBean(
	data: IgdbGameData,
): GameImportBean {
	const { original } = data;
	const gameId = original.id;
	// Une seule société par rôle (§3) : la première
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
		if (first.id === gameId) return -1;
		if (second.id === gameId) return 1;
		return getIgdbFirstReleaseTime(first) - getIgdbFirstReleaseTime(second);
	}
	const versions = data.versions.toSorted(compareVersions);
	const originalVersion = versions.find(({ id }) => id === gameId);

	return {
		game: {
			id: gameId,
			name: original.name,
			frenchName: findFrenchName(original.name, original.alternative_names),
			firstReleaseDate: fromIgdbTimestampToIsoDate(original.first_release_date),
			isCancelled: data.gameStatus === CANCELLED_STATUS,
			igdbUrl: originalVersion?.url ?? "",
		},
		proposedSeries: getIgdbProposedSeries(original),
		developer:
			developer === null ? null : fromIgdbCompanyToCompanyBean(developer),
		publisher:
			publisher === null ? null : fromIgdbCompanyToCompanyBean(publisher),
		versions: versions.map((version) => ({
			id: version.id,
			title:
				version.id === gameId
					? null
					: getIgdbVersionTitle(version, original.name),
			coverImageId: version.cover?.image_id ?? null,
			igdbUrl: version.url,
			platforms: fromIgdbVersionToVersionPlatformBeans(version),
		})),
		dlcs: data.dlcs.map(({ id, name }) => ({ id, name })),
		// La cover de l'original d'abord, puis les artworks (§8)
		imageIds: [
			...(originalVersion?.cover === undefined
				? []
				: [originalVersion.cover.image_id]),
			...(original.artworks ?? []).map(({ image_id: imageId }) => imageId),
		],
		warnings: data.skippedEntries.map(({ typeName, entry }) => ({
			igdbId: entry.id,
			name: entry.name,
			typeName,
			entryJson: JSON.stringify(entry, null, 2),
		})),
	};
}
