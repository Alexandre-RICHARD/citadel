import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Un film ou une série trouvé par la recherche. `date` : la sortie d'un film, la première diffusion d'une série
export type TmdbSearchHit = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	originalTitle: string;
	date: string | null;
	posterPath: string | null;
};
