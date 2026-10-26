import { normalizeText } from "@citadel/common/src/universal/string/normalizeText";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";

import type { SeriesFm } from "../../api/model/seriesFm.type";
import type { SeriesChoice } from "./seriesChoice.type";

/**
 * Série que désigne un choix : null sans série, undefined pour une série encore à créer. Un nouveau nom déjà pris, sans
 * tenir compte des accents ni des majuscules, désigne la série existante, comme côté serveur
 */
export function getChosenSeriesId(
	choice: SeriesChoice,
	proposedSeries: SeriesFm | null,
	allSeries: SeriesFm[],
): number | null | undefined {
	switch (choice.kind) {
		case SeriesChoiceKindEnum.PROPOSED:
			return proposedSeries?.id ?? null;
		case SeriesChoiceKindEnum.OTHER:
			return choice.seriesId;
		case SeriesChoiceKindEnum.NEW:
			return allSeries.find(
				({ name }) => normalizeText(name) === normalizeText(choice.name),
			)?.id;
		default:
			return null;
	}
}
