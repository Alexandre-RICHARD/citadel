import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import { isTemporaryId } from "../../../../../common/api/mutation/isTemporaryId";
import { buildTmdbMediaUrl } from "../../../helper/media/buildTmdbMediaUrl";
import type { MediaRowFm } from "./mediaRowFm.type";

export function fromUserMediaDtoToMediaRowFm(
	userMedia: UserMediaDto,
): MediaRowFm {
	return {
		userMediaId: userMedia.id,
		mediaType: userMedia.mediaType,
		tmdbId: userMedia.tmdbId,
		tmdbUrl: buildTmdbMediaUrl(userMedia.mediaType, userMedia.tmdbId),
		title: userMedia.title,
		originalTitle:
			userMedia.originalTitle === userMedia.title
				? null
				: userMedia.originalTitle,
		originalLanguage: userMedia.originalLanguage,
		releaseDate: userMedia.releaseDate,
		runtimeMinutes: userMedia.runtimeMinutes,
		imagePath: userMedia.imagePath,
		saga: userMedia.saga,
		sagaNumber: userMedia.sagaNumber,
		sagaNumberLabel: userMedia.sagaNumberLabel,
		isWatched: userMedia.isWatched,
		episodeProgress:
			userMedia.mediaType === MediaTypeEnum.SHOW
				? {
						watchedCount: userMedia.watchedEpisodeCount,
						airedCount: userMedia.airedEpisodeCount,
					}
				: null,
		isUpNext: userMedia.isUpNext,
		isInProgress: userMedia.isInProgress,
		comment: userMedia.comment,
		isTemporary: isTemporaryId(userMedia.id),
	};
}
