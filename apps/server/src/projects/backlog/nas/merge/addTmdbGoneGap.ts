import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";

import type { NasDetailsBean } from "./nasDetailsBean.type.ts";

/**
 * L'écart « Identifiant TMDB disparu » (§5) sur la ligne d'un média que TMDB ne connaît plus : la vérification de nuit
 * (tmdbIdCheckService) le note dans la base, pas le job, qui ne lit presque pas TMDB
 */
export function addTmdbGoneGap(nas: NasDetailsBean): NasDetailsBean {
	return { ...nas, gaps: [...nas.gaps, { kind: NasGapKindEnum.TMDB_ID_GONE }] };
}
