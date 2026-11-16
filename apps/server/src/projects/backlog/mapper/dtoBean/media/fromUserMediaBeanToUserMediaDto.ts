import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type.ts";

import type { UserMediaBean } from "../../../bean/userMediaBean.type.ts";

export function fromUserMediaBeanToUserMediaDto(
	userMedia: UserMediaBean,
): UserMediaDto {
	return {
		id: userMedia.id,
		mediaType: userMedia.mediaType,
		tmdbId: userMedia.tmdbId,
		title: userMedia.title,
		originalTitle: userMedia.originalTitle,
		originalLanguage: userMedia.originalLanguage,
		releaseDate: userMedia.releaseDate,
		runtimeMinutes: userMedia.runtimeMinutes,
		imagePath: userMedia.imagePath,
		saga: userMedia.saga,
		sagaNumber: userMedia.sagaNumber,
		sagaNumberLabel: userMedia.sagaNumberLabel,
		isWatched: userMedia.isWatched,
		watchedEpisodeCount: userMedia.watchedEpisodeCount,
		airedEpisodeCount: userMedia.airedEpisodeCount,
		isUpNext: userMedia.isUpNext,
		isInProgress: userMedia.isInProgress,
		comment: userMedia.comment,
		createdAt: userMedia.createdAt.toISOString(),
		updatedAt: userMedia.updatedAt.toISOString(),
	};
}
