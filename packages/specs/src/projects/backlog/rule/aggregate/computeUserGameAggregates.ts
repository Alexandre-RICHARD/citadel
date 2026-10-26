import { getGameStatus } from "../status/getGameStatus.ts";
import type { AggregatedUserVersion } from "./aggregatedUserVersion.type.ts";
import { countDoneDlcs } from "./countDoneDlcs.ts";
import type { UserGameAggregates } from "./userGameAggregates.type.ts";

function sum(values: number[]): number {
	return values.reduce((total, value) => total + value, 0);
}

// Dates ISO : l'ordre du texte est celui du calendrier
function getEarliestIsoDate(dates: (string | null)[]): string | null {
	return dates.reduce<string | null>(
		(earliest, date) =>
			date !== null && (earliest === null || date < earliest) ? date : earliest,
		null,
	);
}

function getHighestValue(values: (number | null)[]): number | null {
	const knownValues = values.filter((value) => value !== null);
	return knownValues.length === 0 ? null : Math.max(...knownValues);
}

/**
 * Agrégats de la ligne d'un jeu du backlog (cahier des charges, §7), à partir de ses versions jouées et des DLC du jeu.
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
		rating: getHighestValue(userVersions.map(({ rating }) => rating)),
		comment: comments.length === 1 ? (comments.at(0) ?? null) : null,
	};
}
