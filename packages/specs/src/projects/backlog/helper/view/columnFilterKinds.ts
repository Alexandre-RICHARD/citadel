import { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";

// Sorte de filtre de chaque colonne ; la miniature et les actions n'ont ni filtre ni tri
export const columnFilterKinds: Readonly<
	Record<BacklogColumnEnum, ColumnFilterKindEnum | null>
> = {
	[BacklogColumnEnum.THUMBNAIL]: null,
	[BacklogColumnEnum.NAME]: ColumnFilterKindEnum.TEXT,
	[BacklogColumnEnum.SERIES]: ColumnFilterKindEnum.TEXT,
	[BacklogColumnEnum.SERIES_NUMBER]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.DEVELOPER]: ColumnFilterKindEnum.TEXT,
	[BacklogColumnEnum.PUBLISHER]: ColumnFilterKindEnum.TEXT,
	[BacklogColumnEnum.RELEASE_DATE]: ColumnFilterKindEnum.DATE_RANGE,
	[BacklogColumnEnum.ENDING_TYPE]: ColumnFilterKindEnum.VALUE,
	[BacklogColumnEnum.PLATFORM]: ColumnFilterKindEnum.VALUE,
	[BacklogColumnEnum.STATUS]: ColumnFilterKindEnum.VALUE,
	[BacklogColumnEnum.UP_NEXT]: ColumnFilterKindEnum.BOOLEAN,
	[BacklogColumnEnum.OWNED]: ColumnFilterKindEnum.BOOLEAN,
	[BacklogColumnEnum.FINISH_DATE]: ColumnFilterKindEnum.DATE_RANGE,
	[BacklogColumnEnum.FINISH_COUNT]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.DLC]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.TRACKED_PLAY_TIME]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.TOTAL_PLAY_TIME]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.RATING]: ColumnFilterKindEnum.NUMBER_RANGE,
	[BacklogColumnEnum.COMMENT]: ColumnFilterKindEnum.TEXT,
	[BacklogColumnEnum.ACTIONS]: null,
};
