import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";

import type { SeriesFm } from "./seriesFm.type";

export type CustomizationFm = {
	imageId: string | null;
	endingType: EndingTypeEnum;
	series: SeriesFm | null;
	seriesNumber: number | null;
};
