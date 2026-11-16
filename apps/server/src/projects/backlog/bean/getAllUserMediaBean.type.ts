import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import type { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

export type GetAllUserMediaBean = {
	page: number;
	sort: SortCriterion<MediaColumnEnum>[];
	filters: ColumnFilter<MediaColumnEnum>[];
	filterMode: FilterModeEnum;
};
