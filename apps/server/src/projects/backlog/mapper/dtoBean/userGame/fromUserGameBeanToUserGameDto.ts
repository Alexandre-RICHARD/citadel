import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type.ts";

import type { UserGameBean } from "../../../bean/userGameBean.type.ts";

export function fromUserGameBeanToUserGameDto(
	userGame: UserGameBean,
): UserGameDto {
	return {
		game: { ...userGame.game },
		imageId: userGame.imageId,
		endingType: userGame.endingType,
		series: userGame.series,
		seriesNumber: userGame.seriesNumber,
		seriesNumberLabel: userGame.seriesNumberLabel,
		dlcs: userGame.dlcs,
		userVersions: userGame.userVersions.map((userVersion) => ({
			id: userVersion.id,
			version: { ...userVersion.version },
			platform: userVersion.platform,
			releaseDate: userVersion.releaseDate,
			status: userVersion.status,
			isOwned: userVersion.isOwned,
			isUpNext: userVersion.isUpNext,
			finishDate: userVersion.finishDate,
			sureFinishCount: userVersion.sureFinishCount,
			probableFinishCount: userVersion.probableFinishCount,
			trackedPlayTimeMinutes: userVersion.trackedPlayTimeMinutes,
			estimatedPlayTimeMinutes: userVersion.estimatedPlayTimeMinutes,
			rating: userVersion.rating,
			comment: userVersion.comment,
			doneDlcIds: userVersion.doneDlcIds,
		})),
	};
}
