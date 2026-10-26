import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";

const PLACEHOLDER_PLATFORM = {
	id: 1,
	shortName: "PS2",
	technicalName: "ps2",
	emulatedPlatformId: null,
};

// Une ligne factice : seules les longueurs de texte comptent ; une seule version jouée, rien à déplier
function buildPlaceholderRow(gameId: number, name: string): BacklogRowFm {
	return {
		gameId,
		imageId: null,
		name,
		frenchName: null,
		versionTitle: null,
		series: { id: 1, name: "Série du jeu" },
		proposedSeries: { id: 1, name: "Série du jeu" },
		seriesNumber: 1,
		seriesNumberLabel: "1",
		developer: { id: 1, name: "Développeur", logoImageId: null },
		publisher: { id: 2, name: "Éditeur du jeu", logoImageId: null },
		releaseDate: "2001-12-03",
		isCancelled: false,
		endingType: EndingTypeEnum.STORY,
		platform: PLACEHOLDER_PLATFORM,
		igdbUrl: "https://www.igdb.com",
		dlcs: [],
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
		userVersionRows: [],
		isTemporary: false,
	};
}

export const BACKLOG_ROWS_PLACEHOLDER: BacklogRowFm[] = [
	buildPlaceholderRow(1, "Nom d’un jeu du backlog"),
	buildPlaceholderRow(2, "Un autre jeu"),
	buildPlaceholderRow(3, "Nom de jeu un peu plus long"),
	buildPlaceholderRow(4, "Jeu court"),
	buildPlaceholderRow(5, "Nom d’un jeu du backlog"),
	buildPlaceholderRow(6, "Un autre jeu"),
];
