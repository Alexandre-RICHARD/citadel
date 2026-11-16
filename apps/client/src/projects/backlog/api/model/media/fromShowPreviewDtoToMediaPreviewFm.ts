import type { ShowPreviewDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/showPreviewDto.type";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import { buildTmdbMediaUrl } from "../../../helper/media/buildTmdbMediaUrl";
import type { MediaPreviewFm } from "./mediaPreviewFm.type";

// La saison 0 réunit les épisodes spéciaux
const SPECIALS_SEASON_NUMBER = 0;

// Les saisons par numéro, les épisodes spéciaux à la fin, comme dans le tableau
export function fromShowPreviewDtoToMediaPreviewFm(
	show: ShowPreviewDto,
): MediaPreviewFm {
	return {
		mediaType: MediaTypeEnum.SHOW,
		tmdbId: show.tmdbId,
		tmdbUrl: buildTmdbMediaUrl(MediaTypeEnum.SHOW, show.tmdbId),
		title: show.title,
		originalTitle:
			show.originalTitle === show.title ? null : show.originalTitle,
		originalLanguage: show.originalLanguage,
		releaseDate: show.firstAirDate,
		runtimeMinutes: null,
		posterPath: show.posterPath,
		collectionName: null,
		proposedSaga: null,
		isOngoing: show.isOngoing,
		seasons: show.seasons
			.map((season) => ({
				seasonNumber: season.seasonNumber,
				name: season.name,
				isSpecials: season.seasonNumber === SPECIALS_SEASON_NUMBER,
				airDate: season.airDate,
				episodes: season.episodes.map(({ episodeNumber, name, airDate }) => ({
					episodeNumber,
					name,
					airDate,
				})),
			}))
			.toSorted(
				(first, second) =>
					Number(first.isSpecials) - Number(second.isSpecials) ||
					first.seasonNumber - second.seasonNumber,
			),
		userMediaId: show.userMediaId,
	};
}
