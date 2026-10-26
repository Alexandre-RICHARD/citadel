import type { UserGameBean } from "../bean/userGameBean.type.ts";
import { fromUserGameEntitiesToUserGameBeans } from "../mapper/beanEntity/fromUserGameEntitiesToUserGameBeans.ts";
import { getDlcsOfGamesQuery } from "../query/dlc/getDlcsOfGamesQuery.ts";
import { getSeriesListNumbersQuery } from "../query/series/getSeriesListNumbersQuery.ts";
import { getUserGameEntitiesQuery } from "../query/userGame/getUserGameEntitiesQuery.ts";
import { getUserVersionEntitiesQuery } from "../query/userVersion/getUserVersionEntitiesQuery.ts";
import { getVersionPlatformsQuery } from "../query/version/getVersionPlatformsQuery.ts";
import { getVersionsQuery } from "../query/version/getVersionsQuery.ts";

function unique(ids: number[]): number[] {
	return [...new Set(ids)];
}

/**
 * Lignes du backlog, dans l'ordre d'ajout ; null : tout le backlog. Quelques requêtes à plat plutôt qu'une jointure
 * géante : leur nombre ne dépend pas de la taille du backlog
 */
export async function loadUserGameBeans(
	gameIds: number[] | null,
): Promise<UserGameBean[]> {
	const userGames = await getUserGameEntitiesQuery(gameIds);
	const backlogGameIds = userGames.map(({ gameId }) => gameId);
	const [dlcs, userVersions, originalVersions] = await Promise.all([
		getDlcsOfGamesQuery(backlogGameIds),
		getUserVersionEntitiesQuery(backlogGameIds),
		getVersionsQuery(backlogGameIds),
	]);
	const [versionPlatforms, seriesNumbers] = await Promise.all([
		getVersionPlatformsQuery(
			unique(userVersions.map(({ versionId }) => versionId)),
		),
		getSeriesListNumbersQuery(
			unique(userGames.flatMap(({ seriesId }) => seriesId ?? [])),
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
