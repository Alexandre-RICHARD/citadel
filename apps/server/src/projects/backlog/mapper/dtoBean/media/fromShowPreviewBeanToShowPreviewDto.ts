import type { ShowPreviewDto } from "@citadel/specs/src/projects/backlog/dto/tmdb/showPreviewDto.type.ts";

import type { ShowPreviewBean } from "../../../bean/showPreviewBean.type.ts";

export function fromShowPreviewBeanToShowPreviewDto({
	show,
	userMediaId,
}: ShowPreviewBean): ShowPreviewDto {
	return {
		tmdbId: show.id,
		title: show.name,
		originalTitle: show.originalName,
		originalLanguage: show.originalLanguage,
		firstAirDate: show.firstAirDate,
		posterPath: show.posterPath,
		isOngoing: show.isOngoing,
		seasons: show.seasons.map((season) => ({
			seasonNumber: season.seasonNumber,
			name: season.name,
			airDate: season.airDate,
			episodes: season.episodes.map((episode) => ({
				episodeNumber: episode.episodeNumber,
				name: episode.name,
				airDate: episode.airDate,
			})),
		})),
		userMediaId,
	};
}
