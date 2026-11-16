import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import type { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

import type { BacklogView } from "../../helper/view/backlogView.type";
import type { ColumnSetting } from "../../helper/view/columnSetting.type";

// Réglages du tableau des films et séries tenus par la page : colonnes, vue, série et saison dépliées, et leurs changements
export type MediaTableSettings = {
	columns: ColumnSetting<MediaColumnEnum>[];
	view: BacklogView<MediaColumnEnum>;
	expandedShowId: number | null;
	expandedSeasonId: number | null;
	onToggleSort: (column: MediaColumnEnum) => void;
	onFilterChange: (
		column: MediaColumnEnum,
		filter: ColumnFilter<MediaColumnEnum> | null,
	) => void;
	onFilterModeChange: (filterMode: FilterModeEnum) => void;
	onClearFilters: () => void;
	// Le backlog vide propose d'aller à la recherche, ou d'importer une liste
	onFocusSearch: () => void;
	onImportList: () => void;
};
