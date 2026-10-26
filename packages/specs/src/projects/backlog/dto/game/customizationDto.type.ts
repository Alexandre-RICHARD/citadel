import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { SeriesDto } from "../common/seriesDto.type.ts";

// Personnalisation d'un jeu du backlog
export type CustomizationDto = {
	imageId: string | null;
	endingType: EndingTypeEnum;
	series: SeriesDto | null;
	// null sans série
	seriesNumber: number | null;
};
