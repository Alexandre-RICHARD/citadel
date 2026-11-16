import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate.ts";
import { summarizeShowProgress } from "@citadel/specs/src/projects/backlog/helper/media/summarizeShowProgress.ts";
import type { Transaction } from "sequelize";

import type { UserMediaBean } from "../bean/userMediaBean.type.ts";
import { fromUserMediaEntityToUserMediaBean } from "../mapper/beanEntity/userMedia/fromUserMediaEntityToUserMediaBean.ts";
import { getShowEpisodeStatesQuery } from "../query/userMedia/getShowEpisodeStatesQuery.ts";
import { getUserMediaWithDetailsQuery } from "../query/userMedia/getUserMediaWithDetailsQuery.ts";

// Une ligne du backlog du compte telle que le tableau l'affiche ; null si elle n'est pas (ou plus) à lui
export async function loadUserMediaBean(
	userId: number,
	userMediaId: number,
	transaction: Transaction | null = null,
): Promise<UserMediaBean | null> {
	const userMedia = await getUserMediaWithDetailsQuery(
		userId,
		userMediaId,
		transaction,
	);
	if (userMedia === null) return null;
	const showProgress =
		userMedia.tvShowId === null
			? null
			: summarizeShowProgress(
					await getShowEpisodeStatesQuery(
						userId,
						userMedia.tvShowId,
						transaction,
					),
					getTodayIsoDate(),
				);
	return fromUserMediaEntityToUserMediaBean(userMedia, showProgress);
}
