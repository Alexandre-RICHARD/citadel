import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { DlcDto } from "../common/dlcDto.type.ts";
import type { SeriesDto } from "../common/seriesDto.type.ts";
import type { UserGameGameDto } from "./userGameGameDto.type.ts";
import type { UserVersionDto } from "./userVersionDto.type.ts";

/**
 * Une ligne du backlog : le jeu, sa personnalisation, ses DLC et ses versions jouées, tels qu'ils sont stockés.
 * Les agrégats de la ligne ne sont pas envoyés : ils se calculent (rule/aggregate)
 */
export type UserGameDto = {
	game: UserGameGameDto;
	imageId: string | null;
	endingType: EndingTypeEnum;
	series: SeriesDto | null;
	seriesNumber: number | null;
	// Avec les décimales de sa famille (3.10 parmi 3.01 … 3.10) ; null sans série
	seriesNumberLabel: string | null;
	dlcs: DlcDto[];
	// Dans l'ordre d'ajout
	userVersions: UserVersionDto[];
};
