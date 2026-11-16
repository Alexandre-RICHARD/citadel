import type { TmdbEpisodeData } from "./tmdbEpisodeData.type.ts";

// Une saison et ses épisodes, tels que le backlog les garde ; la saison 0 réunit les épisodes spéciaux
export type TmdbSeasonData = {
	id: number;
	seasonNumber: number;
	name: string;
	airDate: string | null;
	posterPath: string | null;
	episodes: TmdbEpisodeData[];
};
