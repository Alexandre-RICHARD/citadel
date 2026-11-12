import { getEarliestIsoDate } from "@citadel/common/src/universal/date/getEarliestIsoDate.ts";
import { getHighestKnownValue } from "@citadel/common/src/universal/number/getHighestKnownValue.ts";
import { sum } from "@citadel/common/src/universal/number/sum.ts";

import { getGameStatus } from "../status/getGameStatus.ts";
import type { AggregatedUserVersion } from "./aggregatedUserVersion.type.ts";
import { countDoneDlcs } from "./countDoneDlcs.ts";
import type { UserGameAggregates } from "./userGameAggregates.type.ts";

/**
 * Agrégats de la ligne d'un jeu du backlog, à partir de ses versions jouées et des DLC du jeu.
 * Le serveur s'en sert pour trier et filtrer, le front pour afficher, y compris après une modification optimiste
 */
export function computeUserGameAggregates(
	userVersions: AggregatedUserVersion[],
	dlcIds: number[],
): UserGameAggregates {
	const comments = userVersions.flatMap(({ comment }) =>
		comment === null ? [] : [comment],
	);
	const trackedPlayTimeMinutes = sum(
		userVersions.map((userVersion) => userVersion.trackedPlayTimeMinutes),
	);
	const estimatedPlayTimeMinutes = sum(
		userVersions.map((userVersion) => userVersion.estimatedPlayTimeMinutes),
	);

	return {
		status: getGameStatus(userVersions.map(({ status }) => status)),
		isOwned: userVersions.some(({ isOwned }) => isOwned),
		isInProgress: userVersions.some(({ isInProgress }) => isInProgress),
		isUpNext: userVersions.some(({ isUpNext }) => isUpNext),
		finishDate: getEarliestIsoDate(
			userVersions.map(({ finishDate }) => finishDate),
		),
		sureFinishCount: sum(
			userVersions.map(({ sureFinishCount }) => sureFinishCount),
		),
		probableFinishCount: sum(
			userVersions.map(({ probableFinishCount }) => probableFinishCount),
		),
		doneDlcCount: countDoneDlcs(
			userVersions.flatMap(({ doneDlcIds }) => doneDlcIds),
			dlcIds,
		),
		dlcCount: dlcIds.length,
		trackedPlayTimeMinutes,
		estimatedPlayTimeMinutes,
		totalPlayTimeMinutes: trackedPlayTimeMinutes + estimatedPlayTimeMinutes,
		rating: getHighestKnownValue(userVersions.map(({ rating }) => rating)),
		comment: comments.length === 1 ? (comments.at(0) ?? null) : null,
		commentCount: comments.length,
	};
}
