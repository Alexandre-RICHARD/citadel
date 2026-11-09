import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";

import type { ViewRow } from "../../../projects/backlog/view/viewRow.type.ts";

// Une ligne de tableau complète ; chaque test ne précise que ce qu'il trie ou filtre
export function buildViewRow(row: Partial<ViewRow> = {}): ViewRow {
	return {
		name: "Game",
		frenchName: null,
		versionTitle: null,
		seriesName: null,
		seriesNumber: null,
		developerName: null,
		publisherName: null,
		releaseDate: null,
		endingType: EndingTypeEnum.STORY,
		platformName: null,
		status: StatusEnum.NOT_STARTED,
		isOwned: false,
		isUpNext: false,
		finishDate: null,
		sureFinishCount: 0,
		probableFinishCount: 0,
		doneDlcCount: 0,
		dlcCount: 0,
		trackedPlayTimeMinutes: 0,
		estimatedPlayTimeMinutes: 0,
		totalPlayTimeMinutes: 0,
		rating: null,
		comment: null,
		commentCount: 0,
		...row,
	};
}
