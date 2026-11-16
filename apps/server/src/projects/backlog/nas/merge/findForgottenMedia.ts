import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";

import type { ForgottenMediaBean } from "../../bean/forgottenMediaBean.type.ts";

function countTorrents(entries: NasEntry[]): number {
	return new Set(
		entries.flatMap(({ torrents }) => torrents.map(({ hash }) => hash)),
	).size;
}

// Les endroits où sont les fichiers d'un média : outil, disque, Jellyfin, torrents
function describePlaces(
	entries: NasEntry[],
	isInJellyfin: boolean,
): Pick<
	ForgottenMediaBean,
	"trackedBy" | "fileCount" | "sizeBytes" | "isInJellyfin" | "torrentCount"
> {
	const files = entries.flatMap(({ file }) => (file === null ? [] : [file]));
	return {
		trackedBy:
			entries.find(({ trackedBy }) => trackedBy !== null)?.trackedBy ?? null,
		fileCount: files.length,
		sizeBytes: files.reduce((total, { sizeBytes }) => total + sizeBytes, 0),
		isInJellyfin:
			isInJellyfin ||
			entries.some(({ jellyfinItemId }) => jellyfinItemId !== null),
		torrentCount: countTorrents(entries),
	};
}

function compareForgotten(
	first: ForgottenMediaBean,
	second: ForgottenMediaBean,
): number {
	const firstName = first.title ?? first.path ?? "";
	const secondName = second.title ?? second.path ?? "";
	return (
		Number(first.tmdbId === null) - Number(second.tmdbId === null) ||
		firstName.localeCompare(secondName, "fr", {
			sensitivity: "base",
			numeric: true,
		})
	);
}

/**
 * Ce que le NAS contient sans être dans le backlog (§5), une ligne par média avec les endroits où il est. `backlogKeys` :
 * « movie:603 », « show:1396 » pour chaque média du backlog. Ceux qu'aucun outil ne relie à TMDB, par leur chemin, à la
 * fin
 */
export function findForgottenMedia(
	survey: MediaSurvey,
	backlogKeys: ReadonlySet<string>,
): ForgottenMediaBean[] {
	const movies = survey.movies
		.filter(
			({ tmdbId }) => !backlogKeys.has(`${MediaTypeEnum.MOVIE}:${tmdbId}`),
		)
		.map(({ tmdbId, title, year, entry }) => ({
			tmdbId,
			mediaType: MediaTypeEnum.MOVIE,
			title,
			year,
			path: null,
			...describePlaces([entry], false),
		}));
	const shows = survey.shows
		.filter(({ tmdbId }) => !backlogKeys.has(`${MediaTypeEnum.SHOW}:${tmdbId}`))
		.map(({ tmdbId, title, year, jellyfinItemId, episodes }) => ({
			tmdbId,
			mediaType: MediaTypeEnum.SHOW,
			title,
			year,
			path: null,
			...describePlaces(
				episodes.map(({ entry }) => entry),
				jellyfinItemId !== null,
			),
		}));
	const unlinked = survey.unlinked.map((media) => ({
		tmdbId: null,
		mediaType: null,
		title: null,
		year: null,
		...media,
	}));
	return [...movies, ...shows, ...unlinked].toSorted(compareForgotten);
}
