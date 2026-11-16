import { buildVerificationKey } from "@citadel/specs/src/projects/backlog/helper/nas/buildVerificationKey.ts";

import type { EpisodeRefBean } from "../../bean/episodeRefBean.type.ts";
import { describeFileNas } from "./describeFileNas.ts";
import { episodeIndexKey } from "./episodeIndexKey.ts";
import type { NasDetailsBean } from "./nasDetailsBean.type.ts";
import type { ShowNasContext } from "./showNasContext.type.ts";

// Les colonnes du NAS d'un épisode
export function describeEpisodeNas(
	{ index, verifiedKeys, showTmdbId, originalLanguage }: ShowNasContext,
	episode: Pick<
		EpisodeRefBean,
		"seasonNumber" | "episodeNumber" | "runtimeMinutes"
	>,
): NasDetailsBean {
	const key = buildVerificationKey({
		kind: "episode",
		showTmdbId,
		seasonNumber: episode.seasonNumber,
		episodeNumber: episode.episodeNumber,
	});
	return describeFileNas({
		entry:
			index.shows
				.get(showTmdbId)
				?.episodes.get(
					episodeIndexKey(episode.seasonNumber, episode.episodeNumber),
				) ?? null,
		isVerified: verifiedKeys.has(key),
		tmdbMinutes: episode.runtimeMinutes,
		originalLanguage,
		jellyfinCollection: null,
	});
}
