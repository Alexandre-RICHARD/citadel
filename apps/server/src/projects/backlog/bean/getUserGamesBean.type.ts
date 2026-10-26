import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/rule/view/sortCriterion.type.ts";

export type GetUserGamesBean = {
	page: number;
	sort: SortCriterion[];
	filters: ColumnFilter[];
};
