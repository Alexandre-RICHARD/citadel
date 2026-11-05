import { getUniqueValues } from "@citadel/common/src/universal/array/getUniqueValues.ts";

import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { fromUserGameEntitiesToUserGameBeans } from "../mapper/beanEntity/fromUserGameEntitiesToUserGameBeans.ts";
import { getDlcsOfGamesQuery } from "../query/dlc/getDlcsOfGamesQuery.ts";
import { getSeriesListNumbersQuery } from "../query/series/getSeriesListNumbersQuery.ts";
import { getUserGameEntitiesQuery } from "../query/userGame/getUserGameEntitiesQuery.ts";
import { getUserVersionEntitiesQuery } from "../query/userVersion/getUserVersionEntitiesQuery.ts";
import { getVersionPlatformsQuery } from "../query/version/getVersionPlatformsQuery.ts";
import { getVersionsQuery } from "../query/version/getVersionsQuery.ts";

/**
 * Lignes du backlog du compte, dans l'ordre d'ajout ; null : tout son backlog. Quelques requêtes à plat plutôt qu'une jointure
 * géante : leur nombre ne dépend pas de la taille du backlog
 */
export async function loadUserGameBeans(
	userId: number,
	gameIds: number[] | null,
): Promise<UserGameBean[]> {
	const userGames = await getUserGameEntitiesQuery(userId, gameIds);
	const backlogGameIds = userGames.map(({ gameId }) => gameId);
	const [dlcs, userVersions, originalVersions] = await Promise.all([
		getDlcsOfGamesQuery(backlogGameIds),
		getUserVersionEntitiesQuery(userId, backlogGameIds),
		getVersionsQuery(backlogGameIds),
	]);
	const [versionPlatforms, seriesNumbers] = await Promise.all([
		getVersionPlatformsQuery(
			getUniqueValues(userVersions.map(({ versionId }) => versionId)),
		),
		getSeriesListNumbersQuery(
			userId,
			getUniqueValues(userGames.flatMap(({ seriesId }) => seriesId ?? [])),
		),
	]);

	return fromUserGameEntitiesToUserGameBeans({
		userGames,
		dlcs,
		userVersions,
		versionPlatforms,
		originalVersions,
		seriesNumbers,
	});
}
