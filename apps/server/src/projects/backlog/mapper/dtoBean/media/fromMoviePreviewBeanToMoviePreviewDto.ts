import type { MoviePreviewDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/moviePreviewDto.type.ts";

import type { MoviePreviewBean } from "../../../bean/moviePreviewBean.type.ts";

export function fromMoviePreviewBeanToMoviePreviewDto({
	movie,
	proposedSaga,
	userMediaId,
}: MoviePreviewBean): MoviePreviewDto {
	return {
		tmdbId: movie.id,
		title: movie.title,
		originalTitle: movie.originalTitle,
		originalLanguage: movie.originalLanguage,
		releaseDate: movie.releaseDate,
		runtimeMinutes: movie.runtimeMinutes,
		posterPath: movie.posterPath,
		collection: movie.collection,
		proposedSaga,
		userMediaId,
	};
}
