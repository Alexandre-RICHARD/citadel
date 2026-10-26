import type { UserVersionDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userVersionDto.type";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import { PS2_PLATFORM } from "./ps2Platform";

// Une version jouée de la version originale sur PS2, pas commencée ; overrides pour le cas testé
export function buildUserVersionDto(
	id: number,
	overrides: Partial<UserVersionDto> = {},
): UserVersionDto {
	return {
		id,
		version: {
			id: 100,
			title: null,
			coverImageId: "cover100",
			igdbUrl: "https://www.igdb.com/games/game-100",
		},
		platform: PS2_PLATFORM,
		releaseDate: "2001-12-03",
		status: StatusEnum.NOT_STARTED,
		isOwned: false,
		isUpNext: false,
		finishDate: null,
		sureFinishCount: 0,
		probableFinishCount: 0,
		trackedPlayTimeMinutes: 0,
		estimatedPlayTimeMinutes: 0,
		rating: null,
		comment: null,
		doneDlcIds: [],
		...overrides,
	};
}
