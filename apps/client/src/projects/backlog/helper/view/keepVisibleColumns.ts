import type { ColumnSetting } from "./columnSetting.type";

// Une colonne masquée sort du tri et des filtres
export function keepVisibleColumns<
	Column extends string,
	Item extends { column: Column },
>(items: Item[], columns: readonly ColumnSetting<Column>[]): Item[] {
	return items.filter(({ column }) =>
		columns.some((setting) => setting.key === column && setting.isVisible),
	);
}
