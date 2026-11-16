// Les images d'un film ou d'une série sur TMDB (/movie/:id/images, /tv/:id/images) ; seules les affiches servent
export type TmdbImagesResponse = {
	posters: { file_path: string }[] | null;
};
