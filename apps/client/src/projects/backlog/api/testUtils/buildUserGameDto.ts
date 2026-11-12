import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { buildIgdbGameUrl } from "@citadel/specs/src/projects/backlog/helper/igdb/buildIgdbGameUrl";

import { buildUserVersionDto } from "./buildUserVersionDto";

// Un jeu du backlog sans série ni DLC, avec une version jouée d'id gameId ; overrides pour le cas testé
export function buildUserGameDto(
	gameId: number,
	overrides: Partial<UserGameDto> = {},
): UserGameDto {
	return {
		game: {
			id: gameId,
			name: `Game ${gameId}`,
			frenchName: null,
			firstReleaseDate: "2001-12-03",
			isCancelled: false,
			igdbUrl: buildIgdbGameUrl(`game-${gameId}`),
			developer: null,
			publisher: null,
			proposedSeries: null,
		},
		imageId: null,
		endingType: EndingTypeEnum.STORY,
		series: null,
		seriesNumber: null,
		seriesNumberLabel: null,
		dlcs: [],
		userVersions: [buildUserVersionDto(gameId)],
		...overrides,
	};
}
