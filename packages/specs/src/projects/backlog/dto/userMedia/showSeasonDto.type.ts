import type { ShowEpisodeDto } from "./showEpisodeDto.type.ts";

// Une saison d'une série du backlog, sous-ligne de sa série ; la saison 0 réunit les épisodes spéciaux
export type ShowSeasonDto = {
	id: number;
	seasonNumber: number;
	name: string;
	airDate: string | null;
	posterPath: string | null;
	episodes: ShowEpisodeDto[];
};
