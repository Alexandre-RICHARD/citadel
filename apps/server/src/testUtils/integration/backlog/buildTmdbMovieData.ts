import type { TmdbMovieData } from "../../../projects/backlog/tmdb/type/tmdbMovieData.type.ts";

// Une fiche de film telle que la passerelle TMDB la rend, pour remplacer TMDB dans un test (vi.spyOn sur tmdbGateway)
export function buildTmdbMovieData(
	overrides: Partial<TmdbMovieData> & { id: number },
): TmdbMovieData {
	return {
		title: "Dune",
		originalTitle: "Dune",
		originalLanguage: "en",
		releaseDate: "2021-09-15",
		runtimeMinutes: 156,
		imdbId: "tt1160419",
		posterPath: "/dune.jpg",
		collection: null,
		...overrides,
	};
}
