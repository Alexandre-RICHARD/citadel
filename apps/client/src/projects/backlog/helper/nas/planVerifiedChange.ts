import type { ShowEpisodeFm } from "../../api/model/media/showEpisodeFm.type";
import type { ShowSeasonFm } from "../../api/model/media/showSeasonFm.type";
import type { VerifiedPlan } from "./verifiedPlan.type";
import type { VerifiedTarget } from "./verifiedTarget.type";

function isEpisodeVerified(episode: ShowEpisodeFm): boolean {
	return (
		episode.nas !== null &&
		episode.nas.verifiableCount > 0 &&
		episode.nas.verifiedCount === episode.nas.verifiableCount
	);
}

/**
 * Cocher ou décocher « Vérifié » sur une série, une saison ou un épisode (§5) : une série ou une saison touche ses
 * épisodes principaux diffusés qui ont un seul fichier (les autres ne se vérifient pas), avec les dialogues du
 * visionnage dès que plus d'un épisode change. null : rien à changer
 */
export function planVerifiedChange(
	seasons: ShowSeasonFm[],
	target: VerifiedTarget,
	isVerified: boolean,
): VerifiedPlan | null {
	const nextIsVerified = !isVerified;
	const episodes =
		target.kind === "episode"
			? seasons
					.flatMap((season) => season.episodes)
					.filter(({ episodeId }) => episodeId === target.episodeId)
			: seasons
					.filter(
						(season) =>
							!season.isSpecials &&
							(target.kind === "show" || season.seasonId === target.seasonId),
					)
					.flatMap((season) => season.episodes)
					.filter(({ isAired }) => isAired);
	const episodeIds = episodes
		.filter(
			(episode) =>
				episode.nas !== null &&
				episode.nas.verifiableCount > 0 &&
				isEpisodeVerified(episode) !== nextIsVerified,
		)
		.map(({ episodeId }) => episodeId);
	if (episodeIds.length === 0) return null;
	return {
		kind: episodeIds.length === 1 ? "direct" : "cascade",
		episodeIds,
		isVerified: nextIsVerified,
	};
}
