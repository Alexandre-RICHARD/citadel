import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";

import type { BacklogOverviewFm } from "../../api/model/backlogOverviewFm.type";
import type { BacklogView } from "../../helper/view/backlogView.type";
import type { ColumnSetting } from "../../helper/view/columnSetting.type";

// Réglages du tableau tenus par la page : colonnes, vue (tri et filtres), lignes dépliées, et leurs changements
export type TableSettings = {
	columns: ColumnSetting[];
	view: BacklogView;
	overview: BacklogOverviewFm | null;
	expandedGameIds: number[];
	onToggleSort: (column: BacklogColumnEnum) => void;
	onFilterChange: (
		column: BacklogColumnEnum,
		filter: ColumnFilter | null,
	) => void;
	onClearFilters: () => void;
	// Le backlog vide propose d'aller à la recherche
	onFocusSearch: () => void;
};
