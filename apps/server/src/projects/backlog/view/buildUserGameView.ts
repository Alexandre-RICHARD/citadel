import { computeUserGameAggregates } from "@citadel/specs/src/projects/backlog/rule/aggregate/computeUserGameAggregates.ts";

import type { UserGameBean } from "../bean/userGameBean.type.ts";
import type { UserGameView } from "./userGameView.type.ts";
import type { ViewRow } from "./viewRow.type.ts";

/**
 * La ligne d'un jeu du backlog : les données du jeu et les agrégats de ses versions jouées ;
 * chaque sous-ligne : les données du jeu, et celles de sa version jouée à la place des agrégats
 */
export function buildUserGameView(userGame: UserGameBean): UserGameView {
	const dlcIds = userGame.dlcs.map(({ id }) => id);
	const singleUserVersion =
		userGame.userVersions.length === 1
			? (userGame.userVersions.at(0) ?? null)
			: null;
	const row: ViewRow = {
		...computeUserGameAggregates(userGame.userVersions, dlcIds),
		name: userGame.game.name,
		frenchName: userGame.game.frenchName,
		versionTitle: singleUserVersion?.version.title ?? null,
		seriesName: userGame.series?.name ?? null,
		seriesNumber: userGame.seriesNumber,
		developerName: userGame.game.developer?.name ?? null,
		publisherName: userGame.game.publisher?.name ?? null,
		releaseDate: userGame.game.firstReleaseDate,
		endingType: userGame.endingType,
		platformName: singleUserVersion?.platform.shortName ?? null,
	};

	return {
		userGame,
		row,
		userVersionRows: userGame.userVersions.map((userVersion) => ({
			...row,
			...computeUserGameAggregates([userVersion], dlcIds),
			versionTitle: userVersion.version.title,
			releaseDate: userVersion.releaseDate,
			platformName: userVersion.platform.shortName,
		})),
	};
}
