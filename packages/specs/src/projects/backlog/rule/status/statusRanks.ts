import { StatusEnum } from "../../enum/status.enum.ts";

// Rang de chaque statut : de 1 à 8, `null` pour « Abandonné », hors échelle
export const statusRanks: Readonly<Record<StatusEnum, number | null>> = {
	[StatusEnum.NOT_STARTED]: 1,
	[StatusEnum.WATCHED]: 2,
	[StatusEnum.STARTED]: 3,
	[StatusEnum.WELL_UNDERWAY]: 4,
	[StatusEnum.FINISHED]: 5,
	[StatusEnum.DEEMED_FINISHED]: 5,
	[StatusEnum.COMPLETED]: 6,
	[StatusEnum.PLATINUM]: 7,
	[StatusEnum.COMPLETED_AND_PLATINUM]: 8,
	[StatusEnum.ABANDONED]: null,
};
