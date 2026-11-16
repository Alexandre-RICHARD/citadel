import type { ShowEpisodeDto } from "../userMedia/showEpisodeDto.type.ts";
import type { ShowSeasonDto } from "../userMedia/showSeasonDto.type.ts";
import type { NasDetailsDto } from "./nasDetailsDto.type.ts";

/**
 * Le dépliage d'une série en mode connecté : ses saisons et ses épisodes, avec leurs colonnes du NAS. Les épisodes
 * spéciaux n'en ont pas (null) : Sonarr les numérote autrement que TMDB (§5)
 */
export type ConnectedShowSeasonListDto = {
	seasons: (Omit<ShowSeasonDto, "episodes"> & {
		nas: NasDetailsDto | null;
		episodes: (ShowEpisodeDto & { nas: NasDetailsDto | null })[];
	})[];
};
