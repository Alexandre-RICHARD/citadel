import type { MoviePreviewDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/moviePreviewDto.type";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import { buildTmdbMediaUrl } from "../../../helper/media/buildTmdbMediaUrl";
import type { MediaPreviewFm } from "./mediaPreviewFm.type";

export function fromMoviePreviewDtoToMediaPreviewFm(
	movie: MoviePreviewDto,
): MediaPreviewFm {
	return {
		mediaType: MediaTypeEnum.MOVIE,
		tmdbId: movie.tmdbId,
		tmdbUrl: buildTmdbMediaUrl(MediaTypeEnum.MOVIE, movie.tmdbId),
		title: movie.title,
		originalTitle:
			movie.originalTitle === movie.title ? null : movie.originalTitle,
		originalLanguage: movie.originalLanguage,
		releaseDate: movie.releaseDate,
		runtimeMinutes: movie.runtimeMinutes,
		posterPath: movie.posterPath,
		collectionName: movie.collection?.name ?? null,
		proposedSaga: movie.proposedSaga,
		isOngoing: false,
		seasons: [],
		userMediaId: movie.userMediaId,
	};
}
