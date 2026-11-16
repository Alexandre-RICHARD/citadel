import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";

// Les films et épisodes du relevé qui ont un fichier, mais aucun torrent dessus (§8, étape 4)
export function countFilesWithoutTorrent(
	survey: Pick<MediaSurvey, "movies" | "shows">,
): number {
	const entries = [
		...survey.movies.map(({ entry }) => entry),
		...survey.shows.flatMap(({ episodes }) =>
			episodes.map(({ entry }) => entry),
		),
	];
	return entries.filter(
		({ file, torrents }) => file !== null && torrents.length === 0,
	).length;
}
