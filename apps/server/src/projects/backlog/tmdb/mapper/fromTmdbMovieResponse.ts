import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import { toTmdbRuntime } from "../toTmdbRuntime.ts";
import type { TmdbMovieData } from "../type/tmdbMovieData.type.ts";
import type { TmdbMovieResponse } from "../type/tmdbMovieResponse.type.ts";

export function fromTmdbMovieResponse(movie: TmdbMovieResponse): TmdbMovieData {
	return {
		id: movie.id,
		title: trimToNull(movie.title) ?? movie.original_title,
		originalTitle: movie.original_title,
		originalLanguage: trimToNull(movie.original_language),
		releaseDate: trimToNull(movie.release_date),
		runtimeMinutes: toTmdbRuntime(movie.runtime),
		imdbId: trimToNull(movie.imdb_id),
		posterPath: trimToNull(movie.poster_path),
		collection: movie.belongs_to_collection
			? {
					id: movie.belongs_to_collection.id,
					name: movie.belongs_to_collection.name,
				}
			: null,
	};
}
