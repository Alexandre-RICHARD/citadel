import type { VersionPlatformBean } from "../../bean/versionPlatformBean.type.ts";
import type { IgdbVersionGame } from "../../igdb/type/igdbVersionGame.type.ts";
import { fromIgdbPlatformToPlatformBean } from "./fromIgdbPlatformToPlatformBean.ts";
import { fromIgdbTimestampToIsoDate } from "./fromIgdbTimestampToIsoDate.ts";

// Une entrée par plateforme de la version, avec sa plus ancienne date de sortie sur celle-ci, toutes régions confondues
export function fromIgdbVersionToVersionPlatformBeans(
	version: IgdbVersionGame,
): VersionPlatformBean[] {
	return (version.platforms ?? []).map((platform) => {
		const dates = (version.release_dates ?? []).flatMap((releaseDate) =>
			releaseDate.platform === platform.id && releaseDate.date !== undefined
				? [releaseDate.date]
				: [],
		);
		return {
			platform: fromIgdbPlatformToPlatformBean(platform),
			releaseDate:
				dates.length === 0
					? null
					: fromIgdbTimestampToIsoDate(Math.min(...dates)),
		};
	});
}
