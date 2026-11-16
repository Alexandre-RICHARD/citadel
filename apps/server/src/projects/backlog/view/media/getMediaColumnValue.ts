import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";

import type { UserMediaBean } from "../../bean/userMediaBean.type.ts";
import type { ColumnValue } from "../common/columnValue.type.ts";

// Ce qu'affiche la ligne d'un film ou d'une série dans une colonne, pour le tri et les filtres ; null quand la case est vide
export function getMediaColumnValue(
	column: MediaColumnEnum,
	userMedia: UserMediaBean,
): ColumnValue {
	switch (column) {
		case MediaColumnEnum.TITLE:
			return userMedia.title;
		case MediaColumnEnum.MEDIA_TYPE:
			return userMedia.mediaType;
		case MediaColumnEnum.ORIGINAL_LANGUAGE:
			return userMedia.originalLanguage;
		case MediaColumnEnum.SAGA:
			return userMedia.saga?.name ?? null;
		case MediaColumnEnum.SAGA_NUMBER:
			return userMedia.sagaNumber;
		case MediaColumnEnum.RELEASE_DATE:
			return userMedia.releaseDate;
		case MediaColumnEnum.RUNTIME:
			return userMedia.runtimeMinutes;
		case MediaColumnEnum.IN_PROGRESS:
			return userMedia.isInProgress;
		case MediaColumnEnum.COMMENT:
			return userMedia.comment;
		case MediaColumnEnum.WATCHED:
			return userMedia.isWatched;
		case MediaColumnEnum.UP_NEXT:
			return userMedia.isUpNext;
		case MediaColumnEnum.TMDB_ID:
			return String(userMedia.tmdbId);
		default:
			return null;
	}
}
