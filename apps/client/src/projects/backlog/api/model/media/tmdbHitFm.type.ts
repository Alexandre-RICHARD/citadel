import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Un film ou une série trouvé sur TMDB, dans la liste de la recherche
export type TmdbHitFm = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	// null quand il est le même que le titre français
	originalTitle: string | null;
	releaseYear: number | null;
	posterPath: string | null;
	// Sa ligne dans le backlog, null s'il n'y est pas
	userMediaId: number | null;
};
