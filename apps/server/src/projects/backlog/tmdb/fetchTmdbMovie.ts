import { fromTmdbMovieResponse } from "./mapper/fromTmdbMovieResponse.ts";
import { tmdbClient } from "./tmdbClient.ts";
import type { TmdbMovieData } from "./type/tmdbMovieData.type.ts";
import type { TmdbMovieResponse } from "./type/tmdbMovieResponse.type.ts";

// La fiche d'un film, en une requête ; null : TMDB ne le connaît pas (ou plus)
export async function fetchTmdbMovie(
	tmdbId: number,
): Promise<TmdbMovieData | null> {
	const movie = await tmdbClient.get<TmdbMovieResponse>(`/movie/${tmdbId}`);
	return movie === null ? null : fromTmdbMovieResponse(movie);
}
