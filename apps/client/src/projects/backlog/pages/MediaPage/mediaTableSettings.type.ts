import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";

import type { BacklogView } from "../../helper/view/backlogView.type";
import type { ColumnSetting } from "../../helper/view/columnSetting.type";

// Réglages du tableau des films et séries tenus par la page : colonnes, vue, série et saison dépliées, et leurs changements
export type MediaTableSettings = {
	columns: ColumnSetting<ConnectedMediaColumn>[];
	view: BacklogView<ConnectedMediaColumn>;
	expandedShowId: number | null;
	expandedSeasonId: number | null;
	onToggleSort: (column: ConnectedMediaColumn) => void;
	onFilterChange: (
		column: ConnectedMediaColumn,
		filter: ColumnFilter<ConnectedMediaColumn> | null,
	) => void;
	onFilterModeChange: (filterMode: FilterModeEnum) => void;
	onClearFilters: () => void;
	// Le backlog vide propose d'aller à la recherche, ou d'importer une liste
	onFocusSearch: () => void;
	onImportList: () => void;
};
