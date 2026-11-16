import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import { tmdbClient } from "./tmdbClient.ts";

// TMDB connaît-il encore cet identifiant ? Une seule requête, sans saisons ni images ; une panne de TMDB est une erreur
export async function isKnownOnTmdb(
	mediaType: MediaTypeEnum,
	tmdbId: number,
): Promise<boolean> {
	const path =
		mediaType === MediaTypeEnum.MOVIE ? `/movie/${tmdbId}` : `/tv/${tmdbId}`;
	return (await tmdbClient.get<unknown>(path)) !== null;
}
