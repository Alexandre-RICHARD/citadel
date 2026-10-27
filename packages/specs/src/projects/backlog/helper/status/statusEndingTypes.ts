import { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";

const ALL_ENDING_TYPES = Object.values(EndingTypeEnum);

// Types de fin qui proposent chaque statut
export const statusEndingTypes: Readonly<
	Record<StatusEnum, readonly EndingTypeEnum[]>
> = {
	[StatusEnum.NOT_STARTED]: ALL_ENDING_TYPES,
	[StatusEnum.WATCHED]: [EndingTypeEnum.STORY, EndingTypeEnum.RUNS],
	[StatusEnum.STARTED]: ALL_ENDING_TYPES,
	[StatusEnum.WELL_UNDERWAY]: ALL_ENDING_TYPES,
	[StatusEnum.FINISHED]: [EndingTypeEnum.STORY, EndingTypeEnum.RUNS],
	[StatusEnum.DEEMED_FINISHED]: [
		EndingTypeEnum.SANDBOX,
		EndingTypeEnum.MULTIPLAYER,
	],
	[StatusEnum.COMPLETED]: ALL_ENDING_TYPES,
	[StatusEnum.PLATINUM]: ALL_ENDING_TYPES,
	[StatusEnum.COMPLETED_AND_PLATINUM]: ALL_ENDING_TYPES,
	[StatusEnum.ABANDONED]: ALL_ENDING_TYPES,
};
