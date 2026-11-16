import type { VerificationTarget } from "@citadel/specs/src/projects/backlog/helper/nas/verificationTarget.type.ts";
import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";

import { episodeIndexKey } from "./episodeIndexKey.ts";
import type { SurveyIndex } from "./surveyIndex.type.ts";

// Ce que le relevé sait du film ou de l'épisode ; null s'il n'y est pas
export function findSurveyEntry(
	index: SurveyIndex,
	target: VerificationTarget,
): NasEntry | null {
	if (target.kind === "movie")
		return index.movies.get(target.tmdbId)?.entry ?? null;
	return (
		index.shows
			.get(target.showTmdbId)
			?.episodes.get(
				episodeIndexKey(target.seasonNumber, target.episodeNumber),
			) ?? null
	);
}
