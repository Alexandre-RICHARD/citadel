import { StatusEnum } from "../../enum/status.enum.ts";

// Rang de chaque statut, de 1 à 9 : le même ordre que l'énumération
export const statusRanks: Readonly<Record<StatusEnum, number>> = {
	[StatusEnum.NOT_STARTED]: 1,
	[StatusEnum.ABANDONED]: 2,
	[StatusEnum.STARTED]: 3,
	[StatusEnum.WELL_UNDERWAY]: 4,
	[StatusEnum.WATCHED]: 5,
	[StatusEnum.FINISHED]: 6,
	[StatusEnum.COMPLETED]: 7,
	[StatusEnum.PLATINUM]: 8,
	[StatusEnum.COMPLETED_AND_PLATINUM]: 9,
};
