import type { TableDefinition } from "./tableDefinition.type";

// La miniature et les actions n'ont ni tri ni filtre
export function isSortableColumn<Column extends string>(
	table: TableDefinition<Column>,
	column: Column,
): boolean {
	return table.kinds[column] !== null;
}
