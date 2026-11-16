import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { TmdbMovieData } from "../tmdb/type/tmdbMovieData.type.ts";
import type { TmdbShowData } from "../tmdb/type/tmdbShowData.type.ts";

// Un film ou une série lu sur TMDB, prêt à être enregistré en base
export type FetchedMedia =
	| { mediaType: MediaTypeEnum.MOVIE; movie: TmdbMovieData }
	| { mediaType: MediaTypeEnum.SHOW; show: TmdbShowData };
