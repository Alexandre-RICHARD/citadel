// Un épisode, tel que le backlog le garde
export type TmdbEpisodeData = {
	id: number;
	episodeNumber: number;
	name: string;
	airDate: string | null;
	runtimeMinutes: number | null;
	stillPath: string | null;
};
