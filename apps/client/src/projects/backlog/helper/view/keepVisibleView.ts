import type { BacklogView } from "./backlogView.type";
import type { ColumnSetting } from "./columnSetting.type";
import { keepVisibleColumns } from "./keepVisibleColumns";

// Tri et filtres sans les colonnes masquées
export function keepVisibleView<Column extends string>(
	view: BacklogView<Column>,
	columns: readonly ColumnSetting<Column>[],
): BacklogView<Column> {
	return {
		sort: keepVisibleColumns(view.sort, columns),
		filters: keepVisibleColumns(view.filters, columns),
		filterMode: view.filterMode,
	};
}
