import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum";
import type { NasGap } from "@citadel/specs/src/projects/backlog/mediaState/nasGap.type";

import { nasToolLabels } from "../label/nasToolLabels";

/**
 * Le texte d'un écart (§5), et l'identifiant TMDB qu'il cite, à mettre en lien vers sa fiche ; null quand il n'en cite
 * aucun
 */
export function describeNasGap(gap: NasGap): {
	text: string;
	tmdbId: number | null;
} {
	switch (gap.kind) {
		case NasGapKindEnum.DUPLICATE:
			return { text: `Doublon : ${gap.fileCount} fichiers`, tmdbId: null };
		case NasGapKindEnum.TOOL_MISMATCH:
			return {
				text: `Fiche ${nasToolLabels[gap.tool]} différente : TMDB`,
				tmdbId: gap.tmdbId,
			};
		case NasGapKindEnum.JELLYFIN_MISMATCH:
			return gap.tmdbId === null
				? { text: "Fiche Jellyfin sans identifiant TMDB", tmdbId: null }
				: { text: "Fiche Jellyfin différente : TMDB", tmdbId: gap.tmdbId };
		case NasGapKindEnum.UNTRACKED:
			return { text: "Hors Radarr ou Sonarr", tmdbId: null };
		default:
			return { text: "Identifiant TMDB disparu", tmdbId: null };
	}
}
