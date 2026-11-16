import type { TmdbSeasonData } from "./tmdbSeasonData.type.ts";

// Une série, ses saisons et leurs épisodes, tels que le backlog les garde
export type TmdbShowData = {
	id: number;
	name: string;
	originalName: string;
	originalLanguage: string | null;
	firstAirDate: string | null;
	imdbId: string | null;
	posterPath: string | null;
	isOngoing: boolean;
	seasons: TmdbSeasonData[];
};
