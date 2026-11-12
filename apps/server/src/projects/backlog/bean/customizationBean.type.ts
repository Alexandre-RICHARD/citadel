import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";

import type { SeriesBean } from "./seriesBean.type.ts";

export type CustomizationBean = {
	imageId: string | null;
	endingType: EndingTypeEnum | null;
	series: SeriesBean | null;
	seriesNumber: number | null;
};
