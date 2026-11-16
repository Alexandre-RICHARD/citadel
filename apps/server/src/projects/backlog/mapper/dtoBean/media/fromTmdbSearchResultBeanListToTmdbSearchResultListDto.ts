import type { TmdbSearchResultListDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/tmdbSearchResultListDto.type.ts";

import type { TmdbSearchResultBean } from "../../../bean/tmdbSearchResultBean.type.ts";

export function fromTmdbSearchResultBeanListToTmdbSearchResultListDto(
	results: TmdbSearchResultBean[],
): TmdbSearchResultListDto {
	return results.map((result) => ({
		mediaType: result.mediaType,
		tmdbId: result.tmdbId,
		title: result.title,
		originalTitle: result.originalTitle,
		date: result.date,
		posterPath: result.posterPath,
		userMediaId: result.userMediaId,
	}));
}
