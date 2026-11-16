// Un film, tel que le backlog le garde. `collection` : sa collection TMDB, qui propose une saga
export type TmdbMovieData = {
	id: number;
	title: string;
	originalTitle: string;
	originalLanguage: string | null;
	releaseDate: string | null;
	runtimeMinutes: number | null;
	imdbId: string | null;
	posterPath: string | null;
	collection: { id: number; name: string } | null;
};
