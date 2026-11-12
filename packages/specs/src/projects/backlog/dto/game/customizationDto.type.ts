import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { SeriesDto } from "../common/seriesDto.type.ts";

// Personnalisation d'un jeu du backlog
export type CustomizationDto = {
	imageId: string | null;
	// null : pas de type de fin, donc aucun statut de fin
	endingType: EndingTypeEnum | null;
	series: SeriesDto | null;
	// null sans série
	seriesNumber: number | null;
};
