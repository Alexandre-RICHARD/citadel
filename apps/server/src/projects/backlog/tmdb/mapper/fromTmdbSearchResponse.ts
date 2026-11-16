import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { TmdbSearchHit } from "../type/tmdbSearchHit.type.ts";
import type { TmdbSearchItem } from "../type/tmdbSearchItem.type.ts";
import type { TmdbSearchResponse } from "../type/tmdbSearchResponse.type.ts";

function toSearchHit(item: TmdbSearchItem): TmdbSearchHit | null {
	if (item.media_type === "movie")
		return {
			mediaType: MediaTypeEnum.MOVIE,
			tmdbId: item.id,
			title: trimToNull(item.title) ?? item.original_title ?? "",
			originalTitle: item.original_title ?? item.title ?? "",
			date: trimToNull(item.release_date),
			posterPath: trimToNull(item.poster_path),
		};
	if (item.media_type === "tv")
		return {
			mediaType: MediaTypeEnum.SHOW,
			tmdbId: item.id,
			title: trimToNull(item.name) ?? item.original_name ?? "",
			originalTitle: item.original_name ?? item.name ?? "",
			date: trimToNull(item.first_air_date),
			posterPath: trimToNull(item.poster_path),
		};
	return null;
}

// Les films et les séries trouvés, dans l'ordre de TMDB ; les personnes sont ignorées
export function fromTmdbSearchResponse(
	response: TmdbSearchResponse,
): TmdbSearchHit[] {
	return (response.results ?? [])
		.map(toSearchHit)
		.filter((hit) => hit !== null);
}
