import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

export type GetUserGamesBean = {
	page: number;
	sort: SortCriterion[];
	filters: ColumnFilter[];
	filterMode: FilterModeEnum;
};
