import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import type { SurveyedMovie } from "@citadel/specs/src/projects/backlog/mediaState/surveyedMovie.type.ts";

// Un film du relevé dans Jellyfin, avec un fichier d'1 h 40 en VF et VO, sans torrent ni écart
export function buildSurveyedMovie(
	tmdbId: number,
	{
		inode = tmdbId,
		sizeBytes = 4_000_000_000,
		fileCount = 1,
	}: { inode?: number; sizeBytes?: number; fileCount?: number } = {},
): SurveyedMovie {
	return {
		tmdbId,
		toolTmdbId: tmdbId,
		jellyfinTmdbId: tmdbId,
		folder: {
			path: `/data/medias/movies/Film ${tmdbId} (1999)`,
			title: `Film ${tmdbId}`,
			year: 1999,
		},
		title: `Film ${tmdbId}`,
		year: 1999,
		jellyfinCollection: null,
		entry: {
			storage: NasStorageEnum.IN_JELLYFIN,
			trackedBy: NasToolEnum.RADARR,
			file: {
				path: `/data/medias/movies/Film ${tmdbId} (1999)/film.mkv`,
				inode,
				sizeBytes,
				quality: NasQualityEnum.FHD,
				durationMinutes: 100,
				audioLanguages: ["fr", "en"],
				subtitleLanguages: ["fr"],
			},
			fileCount,
			jellyfinItemId: `item-${tmdbId}`,
			torrents: [],
			gaps: [],
		},
	};
}
