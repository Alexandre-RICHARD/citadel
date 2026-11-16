import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import type { ShowProgress } from "@citadel/specs/src/projects/backlog/helper/media/showProgress.type.ts";

import type { UserMediaBean } from "../../../bean/userMediaBean.type.ts";
import type { UserMedia } from "../../../models/UserMedia.ts";

/**
 * Une ligne lue avec son film ou sa série (getUserMediaWithDetailsQuery). `showProgress` : la progression d'une série,
 * null pour un film, qui garde sa propre case « vu »
 */
export function fromUserMediaEntityToUserMediaBean(
	userMedia: UserMedia,
	showProgress: ShowProgress | null,
): UserMediaBean {
	const { movie, tvShow, saga } = userMedia;
	const common = {
		id: userMedia.id,
		imagePath: userMedia.imagePath,
		saga: saga ? { id: saga.id, name: saga.name } : null,
		sagaNumber: userMedia.sagaNumber,
		isUpNext: userMedia.isUpNext,
		isInProgress: userMedia.isInProgress,
		comment: userMedia.comment,
		createdAt: userMedia.createdAt,
		updatedAt: userMedia.updatedAt,
	};
	if (movie)
		return {
			...common,
			mediaType: MediaTypeEnum.MOVIE,
			tmdbId: movie.id,
			title: movie.title,
			originalTitle: movie.originalTitle,
			originalLanguage: movie.originalLanguage,
			releaseDate: movie.releaseDate,
			runtimeMinutes: movie.runtimeMinutes,
			isWatched: userMedia.isWatched,
			watchedEpisodeCount: 0,
			airedEpisodeCount: 0,
		};
	if (!tvShow)
		throw new Error(`Backlog media ${userMedia.id} has neither movie nor show`);
	return {
		...common,
		mediaType: MediaTypeEnum.SHOW,
		tmdbId: tvShow.id,
		title: tvShow.name,
		originalTitle: tvShow.originalName,
		originalLanguage: tvShow.originalLanguage,
		releaseDate: tvShow.firstAirDate,
		runtimeMinutes: showProgress?.runtimeMinutes ?? null,
		isWatched: showProgress?.isWatched ?? false,
		watchedEpisodeCount: showProgress?.watchedEpisodeCount ?? 0,
		airedEpisodeCount: showProgress?.airedEpisodeCount ?? 0,
	};
}
