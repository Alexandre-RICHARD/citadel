import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import type { CustomizationDraft } from "./customizationDraft.type";
import { toSeriesChoice } from "./toSeriesChoice";

type CustomizedRow = {
	imageId: string | null;
	series: { id: number } | null;
	proposedSeries: { id: number } | null;
	seriesNumber: number | null;
};

// La personnalisation du jeu avec un autre type de fin : le reste ne bouge pas (l'envoi les reprend toutes ensemble)
export function buildEndingTypeCustomization(
	row: CustomizedRow,
	endingType: EndingTypeEnum,
): CustomizationDraft {
	return {
		imageId: row.imageId,
		endingType,
		series: toSeriesChoice(
			row.proposedSeries?.id ?? null,
			row.series?.id ?? null,
		),
		seriesNumber: row.seriesNumber,
	};
}
