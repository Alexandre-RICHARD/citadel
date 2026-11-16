// La progression d'une série, sur ses saisons principales : « 12 / 26 » épisodes diffusés vus, et sa durée totale
export type ShowProgress = {
	watchedEpisodeCount: number;
	airedEpisodeCount: number;
	runtimeMinutes: number | null;
	isWatched: boolean;
};
