import type { SagaDto } from "@citadel/specs/src/projects/backlog/dto/saga/sagaDto.type";
import type { UserMediaDto } from "@citadel/specs/src/projects/backlog/dto/userMedia/userMediaDto.type";
import { isAiredEpisode } from "@citadel/specs/src/projects/backlog/helper/media/isAiredEpisode";
import { formatSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/formatSeriesNumber";
import { getNextSeriesNumber } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/getNextSeriesNumber";
import type { SeriesEntry } from "@citadel/specs/src/projects/backlog/helper/seriesNumber/seriesEntry.type";

import type { MediaPreviewFm } from "../../model/media/mediaPreviewFm.type";

type OptimisticUserMediaInput = {
	id: number;
	preview: MediaPreviewFm;
	imagePath: string | null;
	saga: SagaDto | null;
	// Le numéro choisi ; null : après les autres médias de la saga
	sagaNumber: number | null;
	// Les médias de la saga en cache, pour le numéro pré-rempli et son affichage
	sagaEntries: SeriesEntry[];
	now: string;
	today: string;
};

/**
 * La ligne d'un média ajouté, en attendant celle du serveur, tirée de sa fiche TMDB : rien de vu, ni à voir bientôt, ni en
 * cours. Une série compte déjà ses épisodes diffusés, hors épisodes spéciaux ; sa durée arrive avec la réponse
 */
export function buildOptimisticUserMedia({
	id,
	preview,
	imagePath,
	saga,
	sagaNumber,
	sagaEntries,
	now,
	today,
}: OptimisticUserMediaInput): UserMediaDto {
	const placedNumber =
		saga === null ? null : (sagaNumber ?? getNextSeriesNumber(sagaEntries));
	return {
		id,
		mediaType: preview.mediaType,
		tmdbId: preview.tmdbId,
		title: preview.title,
		originalTitle: preview.originalTitle ?? preview.title,
		originalLanguage: preview.originalLanguage,
		releaseDate: preview.releaseDate,
		runtimeMinutes: preview.runtimeMinutes,
		imagePath,
		saga,
		sagaNumber: placedNumber,
		sagaNumberLabel:
			placedNumber === null
				? null
				: formatSeriesNumber(placedNumber, [
						...sagaEntries,
						{ gameId: id, seriesNumber: placedNumber },
					]),
		isWatched: false,
		watchedEpisodeCount: 0,
		airedEpisodeCount: preview.seasons
			.filter(({ isSpecials }) => !isSpecials)
			.flatMap(({ episodes }) => episodes)
			.filter(({ airDate }) => isAiredEpisode(airDate, today)).length,
		isUpNext: false,
		isInProgress: false,
		comment: null,
		createdAt: now,
		updatedAt: now,
	};
}
