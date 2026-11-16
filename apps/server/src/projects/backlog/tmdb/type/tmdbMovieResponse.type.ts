// Fiche d'un film sur TMDB (/movie/:id), réduite à ce que le backlog lit. TMDB laisse une date inconnue vide ("") et
// une durée inconnue à 0
export type TmdbMovieResponse = {
	id: number;
	title: string;
	original_title: string;
	original_language: string | null;
	release_date: string | null;
	runtime: number | null;
	imdb_id: string | null;
	poster_path: string | null;
	belongs_to_collection: { id: number; name: string } | null;
};
