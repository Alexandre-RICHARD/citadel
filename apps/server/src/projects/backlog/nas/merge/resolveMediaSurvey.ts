import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import type { SurveyedMovie } from "@citadel/specs/src/projects/backlog/mediaState/surveyedMovie.type.ts";
import type { SurveyedShow } from "@citadel/specs/src/projects/backlog/mediaState/surveyedShow.type.ts";

import type { BacklogMediaRef } from "./backlogMediaRef.type.ts";
import { buildMismatchGaps } from "./buildMismatchGaps.ts";
import { claimSurveyedMedia } from "./claimSurveyedMedia.ts";

function resolveMovie(
	movie: SurveyedMovie,
	backlogTmdbId: number,
): SurveyedMovie {
	const gaps = buildMismatchGaps(
		movie,
		backlogTmdbId,
		NasToolEnum.RADARR,
		movie.entry.jellyfinItemId !== null,
	);
	return {
		...movie,
		tmdbId: backlogTmdbId,
		entry: { ...movie.entry, gaps: [...movie.entry.gaps, ...gaps] },
	};
}

// Les écarts d'une série vont sur chacun de ses épisodes qui ont un fichier, et remontent ainsi à la série
function resolveShow(show: SurveyedShow, backlogTmdbId: number): SurveyedShow {
	const gaps = buildMismatchGaps(
		show,
		backlogTmdbId,
		NasToolEnum.SONARR,
		show.jellyfinItemId !== null,
	);
	return {
		...show,
		tmdbId: backlogTmdbId,
		episodes: show.episodes.map((episode) =>
			episode.entry.file === null
				? episode
				: {
						...episode,
						entry: { ...episode.entry, gaps: [...episode.entry.gaps, ...gaps] },
					},
		),
	};
}

function resolveItems<Item>(
	items: Item[],
	claims: Map<number, number>,
	resolve: (item: Item, backlogTmdbId: number) => Item,
): Item[] {
	const backlogTmdbIdByPosition = new Map(
		[...claims].map(([tmdbId, position]) => [position, tmdbId]),
	);
	return items.map((item, position) => {
		const backlogTmdbId = backlogTmdbIdByPosition.get(position);
		return backlogTmdbId === undefined ? item : resolve(item, backlogTmdbId);
	});
}

/**
 * Le relevé vu depuis ce backlog : chaque film et chaque série reliés à un média du backlog (claimSurveyedMedia) sont
 * rangés sous son identifiant, avec leurs écarts « Fiche différente ». Le reste ne change pas : ce sont les médias
 * oubliés. Tout ce qui suit (colonnes, « Vérifié », oubliés) lit ce relevé-là
 */
export function resolveMediaSurvey(
	survey: MediaSurvey,
	refs: BacklogMediaRef[],
): MediaSurvey {
	const movieRefs = refs.filter(
		({ mediaType }) => mediaType === MediaTypeEnum.MOVIE,
	);
	const showRefs = refs.filter(
		({ mediaType }) => mediaType === MediaTypeEnum.SHOW,
	);
	return {
		...survey,
		movies: resolveItems(
			survey.movies,
			claimSurveyedMedia(survey.movies, movieRefs),
			resolveMovie,
		),
		shows: resolveItems(
			survey.shows,
			claimSurveyedMedia(survey.shows, showRefs),
			resolveShow,
		),
	};
}
