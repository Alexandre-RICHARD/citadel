// Un résultat de la recherche multiple de TMDB : film, série ou personne (ignorée)
export type TmdbSearchItem = {
	id: number;
	media_type: string;
	title?: string;
	name?: string;
	original_title?: string;
	original_name?: string;
	release_date?: string;
	first_air_date?: string;
	poster_path?: string | null;
};
