import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";

import type { ViewRow } from "./viewRow.type.ts";

// Ce qu'affiche une ligne dans une colonne, pour le tri et les filtres ; null quand la case est vide
export function getColumnValue(
	column: BacklogColumnEnum,
	row: ViewRow,
): string | number | boolean | null {
	switch (column) {
		case BacklogColumnEnum.NAME:
			return row.frenchName ?? row.name;
		case BacklogColumnEnum.SERIES:
			return row.seriesName;
		case BacklogColumnEnum.SERIES_NUMBER:
			return row.seriesNumber;
		case BacklogColumnEnum.DEVELOPER:
			return row.developerName;
		case BacklogColumnEnum.PUBLISHER:
			return row.publisherName;
		case BacklogColumnEnum.RELEASE_DATE:
			return row.releaseDate;
		case BacklogColumnEnum.ENDING_TYPE:
			return row.endingType;
		case BacklogColumnEnum.PLATFORM:
			return row.platformName;
		case BacklogColumnEnum.STATUS:
			return row.status;
		case BacklogColumnEnum.UP_NEXT:
			return row.isUpNext;
		case BacklogColumnEnum.OWNED:
			return row.isOwned;
		case BacklogColumnEnum.FINISH_DATE:
			return row.finishDate;
		case BacklogColumnEnum.FINISH_COUNT:
			return row.sureFinishCount;
		// Un jeu sans DLC n'affiche pas « 0 / 0 »
		case BacklogColumnEnum.DLC:
			return row.dlcCount === 0 ? null : row.doneDlcCount;
		case BacklogColumnEnum.TRACKED_PLAY_TIME:
			return row.trackedPlayTimeMinutes;
		case BacklogColumnEnum.ESTIMATED_PLAY_TIME:
			return row.estimatedPlayTimeMinutes;
		case BacklogColumnEnum.TOTAL_PLAY_TIME:
			return row.totalPlayTimeMinutes;
		case BacklogColumnEnum.RATING:
			return row.rating;
		case BacklogColumnEnum.COMMENT:
			return row.comment;
		default:
			return null;
	}
}
