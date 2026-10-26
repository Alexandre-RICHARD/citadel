import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";

// Remplace le filtre d'une colonne, à sa place ; null le retire
export function setColumnFilter(
	filters: ColumnFilter[],
	column: BacklogColumnEnum,
	filter: ColumnFilter | null,
): ColumnFilter[] {
	if (filter === null)
		return filters.filter((current) => current.column !== column);
	return filters.some((current) => current.column === column)
		? filters.map((current) => (current.column === column ? filter : current))
		: [...filters, filter];
}
