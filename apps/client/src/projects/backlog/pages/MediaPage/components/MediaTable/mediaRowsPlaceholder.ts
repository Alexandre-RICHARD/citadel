import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";

// Une ligne factice : seules les longueurs de texte comptent ; rien à déplier
function buildPlaceholderRow(userMediaId: number, title: string): MediaRowFm {
	return {
		userMediaId,
		mediaType: MediaTypeEnum.MOVIE,
		tmdbId: userMediaId,
		tmdbUrl: "",
		title,
		originalTitle: null,
		originalLanguage: "en",
		releaseDate: "2000-01-01",
		runtimeMinutes: 120,
		imagePath: null,
		saga: null,
		sagaNumber: null,
		sagaNumberLabel: null,
		isWatched: false,
		episodeProgress: null,
		isUpNext: false,
		isInProgress: false,
		comment: null,
		isTemporary: false,
	};
}

// Le squelette du tableau des films et séries, le temps de lire la première page
export const MEDIA_ROWS_PLACEHOLDER: MediaRowFm[] = [
	buildPlaceholderRow(1, "Un titre de film assez long"),
	buildPlaceholderRow(2, "Une série"),
	buildPlaceholderRow(3, "Un autre titre de film"),
	buildPlaceholderRow(4, "Un titre"),
	buildPlaceholderRow(5, "Encore un titre de film"),
	buildPlaceholderRow(6, "Une autre série, au long titre"),
];
