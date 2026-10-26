import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";

import type { SeriesChoice } from "./seriesChoice.type";

// La série d'un jeu du backlog, vue comme un choix : la proposée par IGDB si c'est elle, sinon une autre, ou aucune
export function toSeriesChoice(
	proposedSeriesId: number | null,
	seriesId: number | null,
): SeriesChoice {
	if (seriesId === proposedSeriesId)
		return { kind: SeriesChoiceKindEnum.PROPOSED };
	if (seriesId === null) return { kind: SeriesChoiceKindEnum.NONE };
	return { kind: SeriesChoiceKindEnum.OTHER, seriesId };
}
