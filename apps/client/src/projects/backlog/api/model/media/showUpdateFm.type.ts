// Une série en cours du backlog qui a du nouveau sur TMDB, dans le récapitulatif de « Récupérer les nouveautés des séries »
export type ShowUpdateFm = {
	tmdbId: number;
	title: string;
	newSeasonCount: number;
	newEpisodeCount: number;
};
