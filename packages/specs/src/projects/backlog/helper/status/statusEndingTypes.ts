import { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";

const ALL_ENDING_TYPES = Object.values(EndingTypeEnum);

// Types de fin qui proposent chaque statut : « Fini » et « Vu sans jouer » n'ont de sens que pour une histoire ; les autres
// types de fin (runs, bac à sable, multijoueur) n'ont pas de fin imposée : « Estimé fini »
export const statusEndingTypes: Readonly<
	Record<StatusEnum, readonly EndingTypeEnum[]>
> = {
	[StatusEnum.NOT_STARTED]: ALL_ENDING_TYPES,
	[StatusEnum.WATCHED]: [EndingTypeEnum.STORY],
	[StatusEnum.STARTED]: ALL_ENDING_TYPES,
	[StatusEnum.WELL_UNDERWAY]: ALL_ENDING_TYPES,
	[StatusEnum.FINISHED]: [EndingTypeEnum.STORY],
	[StatusEnum.DEEMED_FINISHED]: [
		EndingTypeEnum.RUNS,
		EndingTypeEnum.SANDBOX,
		EndingTypeEnum.MULTIPLAYER,
	],
	[StatusEnum.COMPLETED]: ALL_ENDING_TYPES,
	[StatusEnum.PLATINUM]: ALL_ENDING_TYPES,
	[StatusEnum.COMPLETED_AND_PLATINUM]: ALL_ENDING_TYPES,
	[StatusEnum.ABANDONED]: ALL_ENDING_TYPES,
};
