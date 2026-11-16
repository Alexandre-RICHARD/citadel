import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate.ts";
import { summarizeShowProgress } from "@citadel/specs/src/projects/backlog/helper/media/summarizeShowProgress.ts";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type.ts";

import type { UserMediaBean } from "../bean/userMediaBean.type.ts";
import { fromUserMediaEntityToUserMediaBean } from "../mapper/beanEntity/userMedia/fromUserMediaEntityToUserMediaBean.ts";
import type { UserMedia } from "../models/UserMedia.ts";
import { getAllUserMediaWithDetailsQuery } from "../query/userMedia/getAllUserMediaWithDetailsQuery.ts";
import { getUserShowsEpisodeStatesQuery } from "../query/userMedia/getUserShowsEpisodeStatesQuery.ts";

// Les numéros de chaque saga, au format des séries des jeux (`gameId` : l'id de la ligne du média)
function groupSagaEntries(
	userMediaList: UserMedia[],
): Map<number, SeriesEntry[]> {
	const entriesBySaga = new Map<number, SeriesEntry[]>();
	for (const { id, sagaId, sagaNumber } of userMediaList)
		if (sagaId !== null && sagaNumber !== null)
			entriesBySaga.set(sagaId, [
				...(entriesBySaga.get(sagaId) ?? []),
				{ gameId: id, seriesNumber: sagaNumber },
			]);
	return entriesBySaga;
}

// Tout le backlog des films et séries du compte, chaque ligne telle que le tableau l'affiche (loadUserMediaBean, en lot)
export async function loadUserMediaBeans(
	userId: number,
): Promise<UserMediaBean[]> {
	const [userMediaList, statesByShow] = await Promise.all([
		getAllUserMediaWithDetailsQuery(userId),
		getUserShowsEpisodeStatesQuery(userId),
	]);
	const today = getTodayIsoDate();
	const entriesBySaga = groupSagaEntries(userMediaList);
	return userMediaList.map((userMedia) =>
		fromUserMediaEntityToUserMediaBean(
			userMedia,
			userMedia.tvShowId === null
				? null
				: summarizeShowProgress(
						statesByShow.get(userMedia.tvShowId) ?? [],
						today,
					),
			userMedia.sagaId === null
				? []
				: (entriesBySaga.get(userMedia.sagaId) ?? []),
		),
	);
}
