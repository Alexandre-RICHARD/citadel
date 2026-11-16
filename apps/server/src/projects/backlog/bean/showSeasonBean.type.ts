// Une saison d'une série du backlog, avec ses épisodes et ceux que le compte a vus ; la saison 0 : les épisodes spéciaux
export type ShowSeasonBean = {
	id: number;
	seasonNumber: number;
	name: string;
	airDate: string | null;
	posterPath: string | null;
	episodes: {
		id: number;
		episodeNumber: number;
		name: string;
		airDate: string | null;
		runtimeMinutes: number | null;
		stillPath: string | null;
		isWatched: boolean;
	}[];
};
