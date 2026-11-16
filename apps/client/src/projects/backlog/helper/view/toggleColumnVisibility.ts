import type { ColumnSetting } from "./columnSetting.type";
import type { TableDefinition } from "./tableDefinition.type";

// La colonne Actions reste visible : sans elle, plus de menu
export function toggleColumnVisibility<Column extends string>(
	table: TableDefinition<Column>,
	columns: readonly ColumnSetting<Column>[],
	key: Column,
): ColumnSetting<Column>[] {
	if (key === table.actionsColumn) return [...columns];
	return columns.map((setting) =>
		setting.key === key
			? { ...setting, isVisible: !setting.isVisible }
			: setting,
	);
}
