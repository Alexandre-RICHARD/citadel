import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";
import type { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import type { NasGap } from "@citadel/specs/src/projects/backlog/mediaState/nasGap.type.ts";

import type { SurveyedCandidate } from "./surveyedCandidate.type.ts";

/**
 * Les écarts « Fiche différente » d'un média relié au relevé (§5) : l'outil qui le suit, ou l'élément Jellyfin de son
 * fichier, le rangent sous un autre identifiant TMDB que celui du backlog. Jellyfin ne compte que s'il a le fichier ;
 * sans identifiant, sa fiche est « absente »
 */
export function buildMismatchGaps(
	candidate: SurveyedCandidate,
	backlogTmdbId: number,
	tool: NasToolEnum,
	isInJellyfin: boolean,
): NasGap[] {
	const gaps: NasGap[] = [];
	if (candidate.toolTmdbId !== null && candidate.toolTmdbId !== backlogTmdbId)
		gaps.push({
			kind: NasGapKindEnum.TOOL_MISMATCH,
			tool,
			tmdbId: candidate.toolTmdbId,
		});
	if (isInJellyfin && candidate.jellyfinTmdbId !== backlogTmdbId)
		gaps.push({
			kind: NasGapKindEnum.JELLYFIN_MISMATCH,
			tmdbId: candidate.jellyfinTmdbId,
		});
	return gaps;
}
