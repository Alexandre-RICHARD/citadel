// Un épisode d'une série du backlog, sous-ligne de sa saison ; `isWatched` : vu par le compte
export type ShowEpisodeDto = {
	id: number;
	episodeNumber: number;
	name: string;
	airDate: string | null;
	runtimeMinutes: number | null;
	stillPath: string | null;
	isWatched: boolean;
};
