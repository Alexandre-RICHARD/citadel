import type { BacklogView } from "./backlogView.type";
import type { ColumnSetting } from "./columnSetting.type";
import { keepVisibleColumns } from "./keepVisibleColumns";

// Tri et filtres sans les colonnes masquées (cahier des charges, §9)
export function keepVisibleView(
	view: BacklogView,
	columns: readonly ColumnSetting[],
): BacklogView {
	return {
		sort: keepVisibleColumns(view.sort, columns),
		filters: keepVisibleColumns(view.filters, columns),
	};
}
