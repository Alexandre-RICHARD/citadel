// Un épisode d'une série, par ses numéros : de quoi le relier au relevé du NAS
export type EpisodeRefBean = {
	id: number;
	seasonNumber: number;
	episodeNumber: number;
	airDate: string | null;
	runtimeMinutes: number | null;
};
