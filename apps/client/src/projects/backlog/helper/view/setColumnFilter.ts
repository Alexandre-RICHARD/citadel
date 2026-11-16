import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

// Remplace le filtre d'une colonne, à sa place ; null le retire
export function setColumnFilter<Column extends string>(
	filters: ColumnFilter<Column>[],
	column: Column,
	filter: ColumnFilter<Column> | null,
): ColumnFilter<Column>[] {
	if (filter === null)
		return filters.filter((current) => current.column !== column);
	return filters.some((current) => current.column === column)
		? filters.map((current) => (current.column === column ? filter : current))
		: [...filters, filter];
}
