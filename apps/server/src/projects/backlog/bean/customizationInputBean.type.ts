import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";

import type { SeriesChoiceBean } from "./seriesChoiceBean.type.ts";

// Personnalisation saisie : la série est un choix, résolu par le serveur
export type CustomizationInputBean = {
	imageId: string | null;
	endingType: EndingTypeEnum;
	series: SeriesChoiceBean;
	seriesNumber: number | null;
};
