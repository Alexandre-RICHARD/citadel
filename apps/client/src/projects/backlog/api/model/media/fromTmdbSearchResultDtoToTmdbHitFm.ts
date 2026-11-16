import type { TmdbSearchResultDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/tmdbSearchResultDto.type";

import { getReleaseYear } from "../../../helper/media/getReleaseYear";
import type { TmdbHitFm } from "./tmdbHitFm.type";

export function fromTmdbSearchResultDtoToTmdbHitFm(
	result: TmdbSearchResultDto,
): TmdbHitFm {
	return {
		mediaType: result.mediaType,
		tmdbId: result.tmdbId,
		title: result.title,
		originalTitle:
			result.originalTitle === result.title ? null : result.originalTitle,
		releaseYear: getReleaseYear(result.date),
		posterPath: result.posterPath,
		userMediaId: result.userMediaId,
	};
}
