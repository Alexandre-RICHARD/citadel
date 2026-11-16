// Ce qu'il faut savoir d'un épisode pour la progression de sa série
export type ShowEpisodeState = {
	seasonNumber: number;
	airDate: string | null;
	runtimeMinutes: number | null;
	isWatched: boolean;
};
