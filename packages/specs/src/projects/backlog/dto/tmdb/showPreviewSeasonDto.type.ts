import type { ShowPreviewEpisodeDto } from "./showPreviewEpisodeDto.type.ts";

// Une saison, dans la fiche d'une série ; la saison 0 réunit les épisodes spéciaux
export type ShowPreviewSeasonDto = {
	seasonNumber: number;
	name: string;
	airDate: string | null;
	episodes: ShowPreviewEpisodeDto[];
};
