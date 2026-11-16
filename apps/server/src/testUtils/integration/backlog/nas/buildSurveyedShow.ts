import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import type { SurveyedShow } from "@citadel/specs/src/projects/backlog/mediaState/surveyedShow.type.ts";

/**
 * Une série du relevé, dans Jellyfin, avec un fichier de 50 minutes en VF par épisode relevé : `episodes` donne les
 * numéros [saison, épisode] présents sur le NAS
 */
export function buildSurveyedShow(
	tmdbId: number,
	episodes: [number, number][],
): SurveyedShow {
	return {
		tmdbId,
		toolTmdbId: tmdbId,
		jellyfinTmdbId: tmdbId,
		folder: {
			path: `/data/medias/series/Série ${tmdbId}`,
			title: `Série ${tmdbId}`,
			year: 2017,
		},
		title: `Série ${tmdbId}`,
		year: 2017,
		jellyfinItemId: `show-${tmdbId}`,
		jellyfinCollection: null,
		episodes: episodes.map(([seasonNumber, episodeNumber]) => ({
			seasonNumber,
			episodeNumber,
			entry: {
				storage: NasStorageEnum.IN_JELLYFIN,
				trackedBy: NasToolEnum.SONARR,
				file: {
					path: `/data/medias/series/Série ${tmdbId}/S${seasonNumber}E${episodeNumber}.mkv`,
					inode: tmdbId * 1000 + seasonNumber * 100 + episodeNumber,
					sizeBytes: 1_000_000_000,
					quality: NasQualityEnum.FHD,
					durationMinutes: 50,
					audioLanguages: ["fr"],
					subtitleLanguages: [],
				},
				fileCount: 1,
				jellyfinItemId: `episode-${tmdbId}-${seasonNumber}-${episodeNumber}`,
				torrents: [],
				gaps: [],
			},
		})),
	};
}
