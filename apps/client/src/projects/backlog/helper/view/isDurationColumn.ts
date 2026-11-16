import type { TableDefinition } from "./tableDefinition.type";

// Colonnes de temps : saisies en heures dans les filtres, comparées en minutes
export function isDurationColumn<Column extends string>(
	table: TableDefinition<Column>,
	column: Column,
): boolean {
	return table.durationColumns.includes(column);
}
