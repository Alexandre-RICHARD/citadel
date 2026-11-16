import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type.ts";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type.ts";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type.ts";

export type GetConnectedUserMediaBean = {
	page: number;
	sort: SortCriterion<ConnectedMediaColumn>[];
	filters: ColumnFilter<ConnectedMediaColumn>[];
	filterMode: FilterModeEnum;
};
