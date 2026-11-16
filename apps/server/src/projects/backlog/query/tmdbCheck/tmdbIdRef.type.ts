import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Un film ou une série par son identifiant TMDB
export type TmdbIdRef = { mediaType: MediaTypeEnum; tmdbId: number };
