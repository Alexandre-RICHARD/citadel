import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";

/**
 * Un film ou une série trouvé sur TMDB. `date` : la sortie d'un film, la première diffusion d'une série (AAAA-MM-JJ).
 * `userMediaId` : sa ligne dans le backlog du compte, null s'il n'y est pas
 */
export type TmdbSearchResultDto = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	originalTitle: string;
	date: string | null;
	posterPath: string | null;
	userMediaId: number | null;
};
