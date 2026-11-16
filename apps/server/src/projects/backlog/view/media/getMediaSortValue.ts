import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import { getMediaColumnValue } from "./getMediaColumnValue.ts";

/**
 * Part vue d'un média, de 0 à 1 : un film est vu ou pas, une série se range selon ses épisodes diffusés vus (« 12 / 26 »).
 * Une série sans épisode diffusé passe avec les médias pas vus
 */
function getWatchedShare(userMedia: UserMediaBean): number {
	if (userMedia.mediaType === MediaTypeEnum.MOVIE)
		return Number(userMedia.isWatched);
	return userMedia.airedEpisodeCount === 0
		? 0
		: userMedia.watchedEpisodeCount / userMedia.airedEpisodeCount;
}

// Valeur de tri : la part vue pour « Vu », les autres cases à cocher en 0 ou 1, l'identifiant TMDB comme un nombre
export function getMediaSortValue(
	column: MediaColumnEnum,
	userMedia: UserMediaBean,
): string | number | null {
	if (column === MediaColumnEnum.WATCHED) return getWatchedShare(userMedia);
	if (column === MediaColumnEnum.TMDB_ID) return userMedia.tmdbId;
	const value = getMediaColumnValue(column, userMedia);
	if (Array.isArray(value)) return value.length;
	return typeof value === "boolean"
		? Number(value)
		: (value as string | number | null);
}
